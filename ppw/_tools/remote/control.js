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
                    $('#buttons-container, \
                       #annotations-container,\
                       #canvas,\
                       #state-buttons-container').fadeIn('fast');
                }
            });
            
            syncSlide= ppwFrame().getCurrentSlide().index-1;
        }
        
        // go next
        $('#btn-next-slide').click(function(){
            var syncSlide= false;
            
            if(!ppwFrame().get('presentationStarted')){
                ppwFrame().startPresentation();
            }else{
                ppwFrame().goNext();
            }
            
            _broadcast({
                act: 'goNext',
                talk: presentation,
                data: {
                    //curSlide: syncSlide
                }
            });
        });
        
        // go previous
        $('#btn-previous-slide').click(function(){
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
        });
        
        // toggle camera
        $('#btn-toggle-camera').click(function(){
            if(version == 'full'){
                if(ppwFrame().get('presentationStarted')){
                    ppwFrame().toggleCamera();
                }
            }
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
                    //_setInteractionState('thumbs');
                    ppwFrame().showThumbs();
                    $('#buttons-container, \
                       #annotations-container,\
                       #canvas,\
                       #state-buttons-container').fadeOut('fast');
                }
                
            }).on('mousedown', function(){
                _setCurrentStateButton(this);
                $(_b).one('mouseup', function(){
                    _setInteractionState('thumbs');
                    _setCurrentStateButton($('#btn-cursor'));
                });
            });
            
            $(document.body).bind('mousemove', _movingAround);
            $($('#buttons-container')).bind('mousedown', function(evt){
                if(evt.target.parentNode && evt.target.parentNode.id == 'buttons-container')
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
            
        }
        
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
        ppwFrame().hideCanvas();
    };
    
    var _movingAround= function(evt){
        
        var x= 0,
            y= 0,
            touch= null;
        
        if(touch = evt.changedTouches){ // is a touch event
            
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
            
            ppwFrame().drawOnCanvas({
                x: x,
                y: y,
                type: _currentInteractionState
            });
        }
        
    }
    
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
        
        socketServer= location.protocol+'//'+location.host;//+'/'+presentation;
        
        if(!presentation){
            return false;
        }
        
        presentationIframe.attr('src', '/'+presentation+'?remote-controller=true');
    }else{
        $('#btn-annotations').hide();
    }
    _init();
    
    
});