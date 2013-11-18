$(document).ready(function(){

    var presentationIframe= $('#presentation-iframe'),
        version= presentationIframe[0]? 'full': 'basic',
        presentation= null,
        notesContainer= null,
        showingNotes= false,
        showingControls= false,
        socketServer= false,
        _currentInteractionState= false,
        _mouseInteractionEnabled= false,
        _socket= null,
        talkId= null,
        _defaultNoNotesStr= "<ul><li>No notes for the current slide</li></ul>",
        _hiddenControls= false,
        _loadedPpwFrame= false,
        _b= document.body,
        $b= $(_b);

    var _hidePresentation= function(){
        var iF= $('#presentation-iframe')[0];
        if(iF.contentWindow){
            $(this).data('previous-src', iF.contentWindow.location.href);
            iF.style.display= 'none';
        }
        $('#sett-show-presentation')[0].checked= false;
    };

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

    var _showNotes= function(){

        var str= "",
            h= document.body.clientHeight - 8 + 'px';

        notesContainer= notesContainer||$('#annotations-container');

        if(version == 'full'){
            if(ppwFrame().get('presentationStarted')){
                str= _getCurrentNotes();
            }
        }

        if(!str || str == '<ul></ul>')
            str= _defaultNoNotesStr;

        notesContainer.html(str);
        notesContainer.css('height', h);
        showingNotes= true;
        $('#sett-show-notes').attr('checked', 'checked');

    };

    var _hideNotes= function(){

        notesContainer= notesContainer||$('#annotations-container');

        notesContainer.css('height', 0);
        showingNotes= false;
        $('#sett-show-notes').removeAttr('checked');

    };

    var _bindProfiles= function(){

        var profiles= ppwFrame().get('profiles'),
            options= "",
            selected= "";

        profiles['none']= true;
        profiles= Object.keys(profiles);

        $(profiles).each(function(){

            selected= this == 'none'? 'selected': '';
            options+= "<option value='"+this+"' "+selected+">"+
                            this+
                      "</option>";
        });

        $('#sett-profile').html(options)
                          .bind('change', function(){
            ppwFrame().setProfile(this.value);
            _broadcast({
                act: 'changeProfile',
                talk: presentation,
                data: {
                    profile: this.value
                }
            });
        });
    };

    var _bindEvents= function(){

        $(document.body).attr('unselectable', 'on')
                        .css('user-select', 'none')
                        .on('selectstart', false);

        if(version == 'full'){

            // let's start listening to other events
            ppwFrame().addListener('onslidesloaded', function(){
                _bindProfiles();
            });

            ppwFrame().addListener('onslidechange', function(){

                var str= _getCurrentNotes(),
                    idx= ppwFrame().getCurrentSlide().index;

                if(showingNotes){
                    if(!str || str == '<ul></ul>')
                        str= _defaultNoNotesStr;
                    notesContainer.html(str);
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
                    $('#buttons-container').show();
                    //_showControls();
                }
                $('#currentSlideIdx').html(idx)
                                     .css('fontSize',
                                         (document.body.offsetHeight/((idx+"").length))+'px');
            });

            var syncSlide= ppwFrame().getCurrentSlide().index-1;
        }

        $('#sett-show-presentation').click(function(){
            if(!this.checked){
                _hidePresentation();
            }else{
                $('#presentation-iframe').show();
            }
        });

        $('#sett-show-controls').click(function(){
            if(this.checked){
                _showControls();
            }else{
                _hideControls();
            }
        });

        $('#sett-show-notes').click(function(){
            if(this.checked){
                _showNotes();
            }else{
                _hideNotes();
            }
        });

        $('#btn-next-slide').click(_goNext);

        $('#btn-previous-slide').click(_goPrev);

        // toggle camera
        $('#btn-toggle-camera').click(function(){
            _broadcast({
                act: 'toggleCamera',
                talk: presentation,
                data: null
            });
        });

        if(version == 'full'){

            $('#btn-settings').click(function(){
                var s= 'settings';
                if(_currentInteractionState == s){
                    _clearStateButtons();
                    _hideOptions();
                }else{
                    _setInteractionState(s);
                    _setCurrentStateButton(this);
                    _showOptions();
                }
            });
            $('#btn-spotlight').click(function(){
                var s= 'spotlight';
                if(_currentInteractionState == s){
                    _clearStateButtons();
                }else{
                    _setInteractionState(s);
                    _setCurrentStateButton(this);
                }
            });
            $('#btn-laserpoint').click(function(){

                var s= 'laserpoint';

                if(_currentInteractionState == s){
                    _clearStateButtons();
                }else{
                    _setInteractionState(s);
                    _setCurrentStateButton(this);
                }
            });
            $('#btn-drawing').click(function(){

                var s= 'drawing';

                if(_currentInteractionState == s){
                    _clearStateButtons();
                }else{
                    _setInteractionState(s);
                    _setCurrentStateButton(this);
                }
            });

            $('#btn-thumbs').click(function(){

                _setInteractionState('thumbs');
                if(ppwFrame() && ppwFrame().get('presentationStarted')){
                    ppwFrame().showThumbs();
                    _hideControls(true);
                }

            });/*.on('mousedown', function(){
                _setCurrentStateButton(this);
                $(_b).one('mouseup', function(){
                    _setInteractionState('thumbs');
                    _setCurrentStateButton($('#btn-cursor'));
                });
            });*/

            $(document.body).bind('mousemove', _movingAround);
            $($(document.body)).bind('mousedown', function(evt){
                if(evt.target.parentNode &&
                        (
                            evt.target.parentNode.id == 'buttons-container'
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

                //if(_currentInteractionState != 'thumbs'){
                    evt.preventDefault();
                //}

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

        var fontSizes= $('.font-sizes span');
        fontSizes.eq(0).bind('click', ppwFrame().smallerFonts);
        fontSizes.eq(1).bind('click', ppwFrame().biggerFonts);

        var $b= $(document.body).hammer();
        $b.on('pinchout', function(ev){
            _hideControls();
            ev.gesture.stopDetect()
            return false;
        });
        $b.on('pinchin', function(ev){
            _showControls();
            ev.gesture.stopDetect()
            return false;
        });
        $b.on('swipeleft', function(){
            if(!_currentInteractionState)
                _goNext();
            return false;
        });
        $b.on('swiperight', function(){
            if(!_currentInteractionState)
                _goPrev();
            return false;
        });
        $b.on('swipeup', function(){
            if(!_currentInteractionState)
                _showNotes();
            return false;
        });
        $b.on('swipedown', function(){
            if(!_currentInteractionState)
                _hideNotes();
            return false;
        });
        $b.on('hold', function(){
            //_showOptions();
        });
        $b.on('doubletap', function(ev){
            ev.stopPropagation()
            ev.preventDefault()
            ev.gesture.stopPropagation()
            ev.gesture.preventDefault()
            return false;
        });
    };

    $(document.body).bind("touchmove", function(event){
        //if(_currentInteractionState != 'thumbs'){
        //if(event.target.id != 'settings-container')
        //if(!showingControls)
            event.preventDefault();
        //}
    });

    var _showOptions= function(){
        //$('#settings-container').show();
        $b.addClass('showing-settings');
    };

    var _hideOptions= function(){
        //$('#settings-container').hide();
        $b.removeClass('showing-settings');
    };

    var _showControls= function(){
        $(document.body).addClass('showing-controls');
        showingControls= true;
        $('#sett-show-controls').attr('checked', 'checked');
        _hideNotes();
        return false;
    };

    var _hideControls= function(hideAll){

        $(document.body).removeClass('showing-controls');
        setTimeout(function(){
            showingControls= false;
        }, 200);
        $('#sett-show-controls').removeAttr('checked');
        if(hideAll){
            $('#buttons-container').hide();
        }
        return;
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

        if(!_currentInteractionState)
            return;

        _broadcast({
            act: 'interactionEnd',
            talk: presentation,
            data: {
                x: 0,
                y: 0
            }
        });
        ppwFrame().hideCanvas(function(){
        });
    };

    var _movingAround= function(evt){

        var x= 0,
            y= 0,
            touch= null;

        if(touch = evt.originalEvent.changedTouches){ // is a touch event

            if(touch.length > 1)
                return true;

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

    var _setInteractionState= function(s){
        _currentInteractionState= s;
    };

    var _setCurrentStateButton= function(el){
        _clearStateButtons(true);
        $(el).addClass('selected');
        _hideControls();
    };

    var _clearStateButtons= function(keep){
        $('#state-buttons-container div').removeClass('selected');
        if(!keep)
            _currentInteractionState= null;
    };

    var _broadcast= function(obj){
        _socket.emit('remote-control-send', obj);
    };

    var ppwFrame= function(){
        _loadedPpwFrame= presentationIframe[0].contentWindow.PPW||_loadedPpwFrame;
        return version == 'full'? _loadedPpwFrame: false;
    }

    var _waitForPPW= function(){
        if(ppwFrame()){
            _bindEvents();
        }else{
            setTimeout(_waitForPPW, 1500);
        }
    }

    var _init= function(){

        _hidePresentation();
        
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
        //socketServer= '/'+presentation;

        if(!presentation){
            return false;
        }
        presentationIframe.attr('src', '/'+presentation+'?remote-controller=true');

    }else{
        $('#btn-annotations').hide();
    }
    _init();


});