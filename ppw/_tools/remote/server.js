PPW.remote= (function(){

    var _ppw= null,
        _settings= {},
        _conf= {},
        PPWSrc= '',
        _socket= null,
        _io= null,
        _status= 'offline',
        _lastState= window.sessionStorage.getItem('lastRemoteControlState')||'off',
        _toolbarIcon= null,
        _canvasState= null,
        _canvas= null,
        _ctx= null,
        _b= null,
        _canvasCurrentDrawState= {},
        _canvasIterator= null,
        _clearCanvasTimeOut= 1000,
        _closingCanvasTO= null;

    /**
     * Interactions
     */
    var _showCanvas= function(){

        var w= _b.clientWidth,
            h= _b.clientHeight;

        if(!_canvasState)
            _canvasState= {};

        clearTimeout(_closingCanvasTO);
        if(_canvasState.visible){
            if(_canvasCurrentDrawState.type != _canvasState.type){
                //console.log(_canvasCurrentDrawState.type, _canvasState.type)
                _clearCanvas();
                _canvasCurrentDrawState= {};
            }

            _drawOnCanvas();
            return;
        }

        _canvasState.visible= true;
        _canvasCurrentDrawState= {};

        _canvas= _canvas||document.getElementById('ppw-remote-control-canvas');
        _ctx= _ctx||_canvas.getContext('2d');

        _canvas.width= w;
        _canvas.height= h;

        $(_canvas).show();
        _drawOnCanvas();


    };

    var _percToPx= function(perc, x){
        return (_b[x? 'clientWidth': 'clientHeight'] * perc) /100;
    }

    var _clearCanvas= function(){

        if(_ctx)
            _ctx.clearRect(0, 0, 4000, 3500);

        _canvasCurrentDrawState= {};
    };

    var _hideCanvas= function(fn){

        _canvasCurrentDrawState= {};
        _canvasCurrentDrawState.type= (_canvasState && _canvasState.type)?
                                            _canvasState.type:
                                            false;

        if(_ctx && _canvasCurrentDrawState.inPath){
            _ctx.closePath();
            _canvasCurrentDrawState.inPath= false;
        }

        _closingCanvasTO= setTimeout(function(){

                              _canvasState= _canvasState||{};
                              _canvasState.visible= false;
                              _canvasCurrentDrawState= {};
                              _clearCanvas();
                              $(_canvas).hide();

                              if(fn && typeof fn == 'function'){
                                  try{
                                      fn();
                                  }catch(e){
                                      console.error('[PPW][remote] Error calling the callback for the end of drawing actions!', e);
                                  };
                              }

                          }, _clearCanvasTimeOut);
    }

    function _clipMask(pointX, pointY){

        var grd = _ctx.createRadialGradient(pointX, pointY, 0, pointX, pointY, 120);

        _ctx.globalCompositeOperation = 'destination-out';
        grd.addColorStop(0, "rgba(255,255,255, 1)");
        grd.addColorStop(1, "transparent");
        _ctx.fillStyle = grd;
        _ctx.beginPath();
        _ctx.arc(pointX,pointY, 120, 0, Math.PI*2,true);
        _ctx.fill();
        _ctx.closePath();
        _ctx.globalCompositeOperation = 'source-over';
    }

    var _drawOnCanvas= function(conf){

        if(conf){
            _setCanvasState(conf);
            _showCanvas();
            if(conf.type != 'drawing')
                _hideCanvas();
            return;
        }

        _canvas.style.opacity= '1';

        _canvasState.x= _percToPx(_canvasState.x, true);
        _canvasState.y= _percToPx(_canvasState.y, false);

        switch(_canvasState.type){
            case 'drawing':

                _canvasCurrentDrawState.type= _canvasState.type;

                if(!_canvasCurrentDrawState.inPath)
                    _ctx.beginPath();

                _canvasCurrentDrawState.inPath= true;

                _ctx.fillStyle= 'red';
                _ctx.moveTo(_canvasCurrentDrawState.x || _canvasState.x,
                            _canvasCurrentDrawState.y || _canvasState.y);

                _canvasCurrentDrawState.x= _canvasState.x;
                _canvasCurrentDrawState.y= _canvasState.y;

                _ctx.lineWidth= 5;
                _ctx.strokeStyle = 'red';
                _ctx.lineTo(_canvasState.x, _canvasState.y);
                _ctx.stroke();

            break;
            case 'spotlight':
                _canvas.style.opacity= '0.7';
                _canvasCurrentDrawState.type= _canvasState.type;
                _ctx.beginPath();
                _ctx.fillStyle= 'rgba(0, 0, 0, 1)';
                _ctx.rect(0, 0, _b.clientWidth, _b.clientHeight);
                _ctx.fill();
                _ctx.closePath();
                _clipMask(_canvasState.x, _canvasState.y);
            break;
            case 'laserpoint':


                //_ctx.closePath();
                _ctx.beginPath();

                _canvasCurrentDrawState.type= _canvasState.type;

                _ctx.fillStyle = 'red';
                _ctx.arc(_canvasState.x, _canvasState.y, _canvasState.radius||10, 0 , 2 * Math.PI, false);

                _clearCanvas();
                _ctx.fill();
            break;
            case 'clear':
                _canvasCurrentDrawState.type= _canvasState.type;
                _ctx.clearRect(0, 0, _b.clientWidth, _b.clientHeight);
            break;
        };
        if(conf)
            _hideCanvas();
    };

    var _setCanvasState= function(o){
        var v= _canvasState && _canvasState.visible? true: false;
        if(!_canvasState)
            _canvasState= {};
        _canvasState= o;
        _canvasState.visible= v;
    };

    /**
     * Socket communications
     */
    var _setListeners= function(){
        _socket.on('disconnect', function(){
            _lastState= _status == 'online'? 'on': 'off'
            _setAsNoServer();
        });
        _socket.on('reconnect', function(){

        });
        _socket.on('connect', function(){
            if(_lastState == 'on'){
                _setAsOnline();
            }else{
                _setAsOffline();
            }
        });

        _socket.on('control-command', function(command){

            //console.log(command);

            if(_status != 'online'){
                return;
            }

            if(command.data &&
                (command.data.curSlide || command.data.curSlide===0)
                &&
                (command.data.curSlide != PPW.getCurrentSlide().index)){
                PPW.goToSlide(command.data.curSlide);
            }

            switch(command.act){
                case 'goNext':
                    if(!PPW.getStartedAt()){
                        PPW.startPresentation();
                    }else{
                        PPW.goNext();
                    }
                break;
                case 'goPrev':
                    PPW.goPrev();
                break;
                case 'toggleCamera':
                    PPW.toggleCamera();
                break;
                case 'goToSlide':
                    PPW.goToSlide(command.data.curSlide);
                break;
                case 'interactionEnd':
                    _hideCanvas();
                break;
                case 'spotlight':
                    _setCanvasState({
                        type: 'spotlight',
                        x: command.data.x,
                        y: command.data.y
                    })
                    _showCanvas();
                break;
                case 'laserpoint':
                    _showCanvas();
                    _setCanvasState({
                        type: 'laserpoint',
                        x: command.data.x,
                        y: command.data.y
                    })
                    _showCanvas();
                break;
                case 'drawing':
                    _setCanvasState({
                        type: 'drawing',
                        x: command.data.x,
                        y: command.data.y
                    })
                    _showCanvas();
                break;
                case 'changeProfile':
                    PPW.setProfile(command.data.profile);
                break;
            }
        });

    };

    var _connect= function(){
        if(_status == 'online'){
            _setAsOffline();
            window.sessionStorage.setItem('lastRemoteControlState', 'off');
        }else{
            _setAsOnline();
            window.sessionStorage.setItem('lastRemoteControlState', 'on');
        }
    };

    var _stablish= function(){
        _socket = _io.connect(_settings.remote.server);// + '/'+PPW.get('title'));
        _setListeners();
    };

    var _setAsOffline= function(){
        //$('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-off.png").attr('title', 'Server available, click to connect');
        if(_toolbarIcon){
            _toolbarIcon.setAttribute('title', 'Server available, click to connect');
            _toolbarIcon.setAttribute('rule', 'offline');
        }
        /*$('#ppw-toolbaricon-ppw-settings-icon').attr('title', 'Server available, click to connect')
                                               .attr('rule', 'offline');*/
        _status= 'available';
    }
    var _setAsOnline= function(){
        //$('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-on.png").attr('title', 'Connected/listening - click to disconnect');
        if(_toolbarIcon){
            _toolbarIcon.setAttribute('title', 'Connected/listening - click to disconnect');
            _toolbarIcon.setAttribute('rule', 'online');

        }
        _socket.emit('listening',
                     location.pathname.replace('/index.html', '')
                                      .replace(/\/$/, '')
                                      .split('/')
                                      .pop());
        _status= 'online';
    }
    var _setAsNoServer= function(){
        //$('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-no-server.png").attr('title', 'No server available');
        if(_toolbarIcon){
            _toolbarIcon.setAttribute('title', 'No server available');
            _toolbarIcon.setAttribute('rule', 'no-server');
        }
        /*$('#ppw-toolbaricon-ppw-settings-icon').attr('title', 'No server available')
                                               .attr('rule', 'no-server');*/
        _status= 'offline';
    }

    /**
     * The constructor to the library.
     *
     * This method loades the required scripts and starts the listeners.
     */
    var _constructor= function(ppw, settings, conf, src){

        _ppw= ppw;
        _settings= settings;
        _conf= conf,
        PPWSrc= src;
        _b= document.body;

        _toolbarIcon= document.getElementById('ppw-toolbaricon-ppw-remote-icon');

        if(!_settings.remote.server){
            _settings.remote.server= location.protocol+'//'+location.host;
        }

        $(document.body).append("<canvas id='ppw-remote-control-canvas'></canvas>");

        $.getScript("/socket.io/socket.io.js", function(){
            _setAsOffline();
            _io= io;
            _stablish();
        });
    };

    PPW.drawOnCanvas= _drawOnCanvas;
    PPW.hideCanvas= _hideCanvas;

    return {
        server: 'online',
        init: _constructor,
        connect: _connect,
        getStatus: function(){return _status;}
    }
})();