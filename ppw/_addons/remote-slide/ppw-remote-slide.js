window.PPW.extend("remote-slide", (function(){
    
    var _ppw= null,
        remote= null,
        _conf= {
            server: 'http://localhost:81',
            controler: 'http://localhost:81',
            hash: null,
            pointer: false,
            drawing: false,
            w: 0,
            h: 0
        };
    
    var _enable= function(){
        
        var msg= "<strong>Remote control</strong><br/>In your remote device, go to the address: <div style='text-align: center; font-style: italic;'>"+_conf.controler+"</div>and enter the code:<br/>",
            hash= false;
            
        if(_conf.hash){
            PPW.showMessage(msg+"<div style='text-align: center; font-weight: bold; font-size: 120%;' class='ppw-focusable ppw-platform'>"+_conf.hash+"</div>");
            return;
        }
        
        this.innerHTML= "<img src='"+_ppw.PPWSrc + "/_addons/remote-slide/loading.gif' height='14' />";
        
        remote = new RemoteSlide();
        remote.connect(_conf.server);
        
        remote.on('sync', function() {
            document.getElementById('ppw-addon-remote-trigger').innerHTML= "On";
        });
        
        remote.on('next', function() {
            PPW.goNextSlide();
        });
        remote.on('prev', function() {
           PPW.goPreviousSlide();
        });
        remote.on('camera', function() {
           PPW.toggleCamera();
        });
        remote.on('start', function() {
           PPW.startPresentation();
        });
        
        remote.on('point', function(data) {});
        
        remote.on('point', function(data) {
            
            var l, t;
            
            if(!_conf.pointer){
                _conf.w= document.body.clientWidth;
                _conf.h= document.body.clientHeight;
                
                _conf.pointer= document.getElementById('ppw-pointer');
                _conf.pointer.width= _conf.w;
                _conf.pointer.height= _conf.h;
                _conf.pointer= _conf.pointer.getContext('2d');
            }
            
            console.log("DRAWING", _conf.drawing, data);
            if(!_conf.drawing){
                document.getElementById('ppw-pointer').style.display= '';
            }
            
            if(data[0]>=0){
                
                _conf.drawing= true;
                
                if(data[2]){
                    _conf.pointer.closePath();
                    _conf.pointer.strokeStyle = "#ff0000";
                    _conf.pointer.lineWidth = 16;
                    _conf.pointer.lineCap = "round";
                    _conf.pointer.moveTo(data[0]/100*_conf.w, data[1]/100*_conf.h);
                    _conf.pointer.beginPath();
                }else{
                    _conf.pointer.lineTo(data[0]/100*_conf.w, data[1]/100*_conf.h);
                }
                _conf.pointer.stroke();
                
            }else{
                _conf.pointer.closePath();
                _conf.pointer.clearRect(0, 0, _conf.w, _conf.h);
                _conf.drawing= false;
                //document.getElementById('ppw-pointer').style.display= 'none';
            }
        });
        
        hash= remote.sync();
        _conf.hash= hash;
        PPW.showMessage(msg+"<div style='text-align: center; font-weight: bold; font-size: 120%;' class='ppw-focusable ppw-platform'>"+hash+"</div>");
        
    }
    
    var _init = function (data) {
        
        var head = document.getElementsByTagName('head')[0],
        socketio = document.createElement('script'),
        remoteslide = document.createElement('script');
        socketio.src = _conf.server + '/socket.io/socket.io.js';
        remoteslide.src = _ppw.PPWSrc + '/_addons/remote-slide/remote-slide.js';

        // Add a disabled button
        $('#ppw-addons-container').append("<span>Remote controle: <span id='ppw-addon-remote-trigger'>...</span></span>")
        
        socketio.onload = function () {
            
            console.log('socketio loaded');
            
            remoteslide.onload = function () {
                
                // Enable button
                $('#ppw-addon-remote-trigger').css('cursor', 'pointer')
                                              .html("Off")
                                              .click('click', _enable);

                console.log('remoteslide loaded');
            }
            head.appendChild(remoteslide);
        }
        head.appendChild(socketio);        
    }    

    var _setup= function(data){
        $(document.body).append("<canvas id='ppw-pointer' style='position: absolute; left: 0px; top: 0px; z-index: 99999999; opacity: 0.3; display: none;' width='100%' height='100%'></canvas>");
        _ppw= data;
    }

    return {
        onload: _setup,
        onsplashscreen: _init
    };
    
})());