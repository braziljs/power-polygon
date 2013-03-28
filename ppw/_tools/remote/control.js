$(document).ready(function(){
    
    var presentationIframe= $('#presentation-iframe'),
        version= presentationIframe[0]? 'full': 'basic',
        presentation= null,
        notesContainer= null,
        showingNotes= false,
        socketServer= false,
        _currentInteractionState= false,
        _mouseInteractionEnabled= false,
        _socket= null,
        talkId= null,
        _hiddenControls= false,
        _swipeStart= [],
        _b= document.body;
        
    var getParameterByName= function (name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if(results == null)
          return "";
        else
          return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    
    var _getCurrentNotes= function(){
        
        var notes= ppwFrame().getCurrentSlide().notes,
            str= "<ul>";
            
        $(notes).each(function(){
            str+= "<li>"+this+"</li>";
        });
        
        return str+"</ul>";
    }
    
    // go next
    var _goNext= function(){

        var syncSlide= false;

        if(version == 'full'){
            if(!ppwFrame().get('presentationStarted')){
                ppwFrame().startPresentation();
            }else{
                ppwFrame().goNext();
            }
        }

        _broadcast({
            act: 'goNext',
            talk: presentation,
            data: {
                //curSlide: syncSlide
            }
        });
    }

    // go previous
    var _goPrev= function(){
        var syncSlide= false;

        if(version == 'full'){
            if(ppwFrame().get('presentationStarted')){
                ppwFrame().goPrev();
            }
            syncSlide= ppwFrame().getCurrentSlide().index-1;
        }

        _broadcast({
            act: 'goPrev',
            talk: presentation,
            data: {
                //curSlide: false
            }
        });
    }
    
    var _bindEvents= function(){
        
        // annotations
        $('#btn-annotations').click(function(){
            
            var notes= [],
                str= "",
                h= 0,
                btn= $('#btn-annotations a');
                
            notesContainer= notesContainer||$('#annotations-container');
            
            if(!showingNotes){
                if(version == 'full'){
                    if(ppwFrame().get('presentationStarted')){
                        str= _getCurrentNotes();
                    }
                }
                h= (document.body.clientHeight - btn[0].offsetHeight - 10)+'px';

                if(str == '')
                    str= "<ul><li>No notes for the current slide</li></ul>";
                    
                notesContainer.html(str);
                notesContainer.css('height', h);
                btn.css('bottom', h);
                showingNotes= true;
            }else{
                h= 0;
                notesContainer.css('height', h);
                btn.css('bottom', h);
                showingNotes= false;
            }
        });
        
        
        $(document.body).attr('unselectable', 'on')
                        .css('user-select', 'none')
                        .on('selectstart', false);
        
        if(version == 'full'){
            
            // let's start listening to other events
            ppwFrame().addListener('onslidechange', function(){
                
                if(showingNotes){
                    notesContainer.html(_getCurrentNotes());
                }
                if(_currentInteractionState == 'thumbs'){
                    _currentInteractionState= false;
                    _broadcast({
                        act: 'goToSlide',
                        talk: presentation,
                        data: {
                            curSlide: ppwFrame().getCurrentSlide().index-1
                        }
                    });
                    _showControls();
                }
            });
            
            syncSlide= ppwFrame().getCurrentSlide().index-1;
        }
        
        $('#btn-next-slide').click(_goNext);
        
        $('#btn-previous-slide').click(_goPrev);
        
        // toggle camera
        $('#btn-toggle-camera').click(function(){
            /*if(version == 'full'){
                if(ppwFrame().get('presentationStarted')){
                    //ppwFrame().toggleCamera();
                }
            }*/
            _broadcast({
                act: 'toggleCamera',
                talk: presentation,
                data: null
            });
        });
        
        if(version == 'full'){
            
            $('#btn-cursor').click(function(){
                _setInteractionState(false);
                _setCurrentStateButton(this);
            });
            $('#btn-spotlight').click(function(){
                _setInteractionState('spotlight');
                _setCurrentStateButton(this);
            });
            $('#btn-laserpoint').click(function(){
                _setInteractionState('laserpoint');
                _setCurrentStateButton(this);
            });
            $('#btn-drawing').click(function(){
                _setInteractionState('drawing');
                _setCurrentStateButton(this);
            });
            $('#btn-thumbs').click(function(){
                
                if(ppwFrame() && ppwFrame().get('presentationStarted')){
                    ppwFrame().showThumbs();
                    _hideControls(true);
                }
                
            }).on('mousedown', function(){
                _setCurrentStateButton(this);
                $(_b).one('mouseup', function(){
                    _setInteractionState('thumbs');
                    _setCurrentStateButton($('#btn-cursor'));
                });
            });
            
            $(document.body).bind('mousemove', _movingAround);
            $($(document.body)).bind('mousedown', function(evt){
                if(evt.target.parentNode &&
                        (
                            evt.target.parentNode.id == 'buttons-container'
                                ||
                            evt.target.id == 'canvas'
                        )
                  )
                    _mouseInteractionEnabled= true;
            });
            $(document.body).bind('mouseup', function(){
                if(_mouseInteractionEnabled){
                    _mouseInteractionEnabled= false;
                    _movingAroundEnd();
                }
            });
            $(document.body).bind('touchmove', _movingAround);
            $(document.body).bind('touchend', _movingAroundEnd);
            
        }else{
            $('#basic-pointer').bind('mousedown', function(){
                $(document.body).bind('mousemove', _dragBasicPointer);
                $(document.body).one('mouseup', function(){
                    $(document.body).unbind('mousemove', _dragBasicPointer);
                    _showControls();
                    $('#basic-pointer').css({
                        top: '10px',
                        left: '20px'
                    })
                    _broadcast({
                        act: 'interactionEnd',
                        talk: presentation,
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                });
            });
            $('#basic-pointer').bind('touchstart', function(evt){
                evt.preventDefault();
                $(document.body).bind('touchmove', _dragBasicPointer);
                $(document.body).one('touchend', function(){
                    $(document.body).unbind('touchmove', _dragBasicPointer);
                    _showControls();
                    _broadcast({
                        act: 'interactionEnd',
                        talk: presentation,
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                    $('#basic-pointer').css({
                        top: '10px',
                        left: '20px'
                    })
                });
            });
        }
        
        $(document.body).bind("touchstart", function(event){
            var touches = event.originalEvent.touches;
            
            if(touches.length == 2 && !_swipeStart.length){
                
                _swipeStart= [touches[0].pageX, touches[0].pageY];
                
                $(document.body).bind("touchmove", _swiping);
            }
        });
        
        $(document).bind("touchmove", function(event){
            event.preventDefault();
        });
        
    };
    
    var _swiping= function(event){
        
        /*
        var touch = event.originalEvent.changedTouches[0],
            x= touch.pageX;
        
        if(!_swipeStart.length)
            return;
        // swiping left
        
        if(x > _swipeStart[0]){
            $(document.body).unbind("touchmove", _swiping);
            _goPrev();
            _swipeStart= [];
        }else if(x < _swipeStart[0]){
            $(document.body).unbind("touchmove", _swiping);
            _swipeStart= [];
            _goNext();
        }
        */
    };
    
    var _dragBasicPointer= function(evt){
        
        var x, y, touch;

        _hideControls();
        
        if(touch = evt.originalEvent.changedTouches){ // is a touch event
            evt.preventDefault();
            
            if(touch.length>1)
                return;
            
            touch= touch[0];

            x= touch.pageX - 10;
            y= touch.pageY - 10;
            
        }else{ // is a click event
            x= evt.clientX - 10;
            y= evt.clientY - 10;
        }
        
        $('#basic-pointer').css({
            left: x+'px',
            top: y+'px'
        });
        
        x= _pxToPerc(x, true);
        y= _pxToPerc(y, false);
        
        _broadcast({
            act: 'laserpoint',
            talk: presentation,
            data: {
                x: x,
                y: y
            }
        });
        return false;
    };
    
    var _pxToPerc= function(px, x){
        return (px * 100) / _b[x? 'clientWidth': 'clientHeight'];
    }
    
    var _movingAroundEnd= function(){
        
        _broadcast({
            act: 'interactionEnd',
            talk: presentation,
            data: {
                x: 0,
                y: 0
            }
        });
        ppwFrame().hideCanvas(function(){
            _showControls();
        });
    };
    
    var _movingAround= function(evt){
        
        var x= 0,
            y= 0,
            touch= null;

        if(touch = evt.originalEvent.changedTouches){ // is a touch event
            
            if(touch.length>1)
                return;
            
            touch= touch[0];

            x= touch.pageX;
            y= touch.pageY;
            
        }else{ // is a click event
            
            if(!_mouseInteractionEnabled) // if is not pressed
                return;
            
            x= evt.clientX;
            y= evt.clientY;
        }
        
        x= _pxToPerc(x, true);
        y= _pxToPerc(y, false);
        
        
        if(_currentInteractionState){
            
            _broadcast({
                act: _currentInteractionState,
                talk: presentation,
                data: {
                    x: x,
                    y: y
                }
            });
            
            _hideControls();
            ppwFrame().drawOnCanvas({
                x: x,
                y: y,
                type: _currentInteractionState
            });
        }
        
    }
    
    var _hideControls= function(canvasToo){
        
        var els= '#buttons-container, \
                  #annotations-container,\
                  #state-buttons-container';
        if(canvasToo)
            els+= ', #canvas';
        
        _hiddenControls= true;
        
        $(els).fadeOut('fast');
    };
    
    
    var _showControls= function(canvasToo){
        
        var els= '#buttons-container, \
                  #annotations-container,\
                  #canvas,\
                  #state-buttons-container';
        
        _hiddenControls= false;
        
        $(els).fadeIn('fast');
    };
    
    var _setInteractionState= function(s){
        _currentInteractionState= s;
    };
    
    var _setCurrentStateButton= function(el){
        _clearStateButtons();
        $(el).addClass('selected')
    };
    
    var _clearStateButtons= function(){
        $('#state-buttons-container div').removeClass('selected');
    };
    
    var _broadcast= function(obj){
        _socket.emit('remote-control-send', obj);
    };
    
    var ppwFrame= function(){
        return version == 'full'? presentationIframe[0].contentWindow.PPW: false;
    }
    
    var _waitForPPW= function(){
        if(ppwFrame()){
            _bindEvents();
        }else{
            setTimeout(_waitForPPW, 1500);
        }
    }
    
    var _init= function(){
        _socket= io.connect(socketServer);
        _socket.emit('listening', talkId);
        if(version == 'full'){
            _waitForPPW();
        }else{
            _bindEvents();
        }
    }
    
    presentation= getParameterByName('p');
    talkId= presentation.replace(/\/$/, '').split('/').pop();
    
    if(version == 'full'){
        
        //socketServer= location.protocol+'//'+location.host;//+'/'+presentation;
        socketServer= '/'+presentation;
        
        if(!presentation){
            return false;
        }
        //alert('?')
        presentationIframe.attr('src', '/'+presentation+'?remote-controller=true');
        
        //presentationIframe.attr('src', 'http://www.google.com/');
    }else{
        $('#btn-annotations').hide();
    }
    _init();
    
    
});