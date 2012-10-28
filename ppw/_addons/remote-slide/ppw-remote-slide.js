window.PPW.extend("remote-slide", (function(){
    
    var _ppw= null,
        remote= null,
        _conf= {
            server: 'http://localhost:81',
            controler: 'http://localhost:81',
            hash: null,
            pointer: null
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
        remote.on('point', function(data) {
            
            var l, t;
            
            if(!_conf.pointer)
                _conf.pointer= $('#ppw-pointer');
            
            if(data[0]>=0){
                
                console.log("POINTTIIINNNNGGGG>>>>", data)
                _conf.pointer.css({
                    left: data[0]+'%',
                    top: data[1]+'%',
                    display: 'block'
                });
                
            }else{
               _conf.pointer.hide();
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
        $(document.body).append("<div id='ppw-pointer' style='position: absolute; left: 0px; top: 0px; z-index: 99999999; background: red; border-radius: 50%; width: 10px; height: 10px; display: none; border: solid 1px black; box-shadow: 0px 0px 2px 1px white'></div>");
        _ppw= data;
    }

    return {
        onload: _setup,
        onsplashscreen: _init
    };
    
})());