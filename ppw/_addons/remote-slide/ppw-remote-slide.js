window.PPW.extend("remote-slide", (function(){
    
    var _ppw= null,
        remote= null,
        _conf= {
            server: 'http://localhost:81'
        };
    
    var _enable= function(){
        remote = new RemoteSlide();
        remote.connect(_conf.server);
        remote.on('next', function() {
            PPW.goNextSlide();
        });
        remote.on('previous', function() {
           PPW.goPreviousSlide();
        });
        remote.on('camera', function() {
           PPW.toggleCamera();
        });
        remote.on('start', function() {
           PPW.startPresentation()
        });
    }
    
    var _init = function (data) {
        
        var head = document.getElementsByTagName('head')[0],
        socketio = document.createElement('script'),
        remoteslide = document.createElement('script');
        socketio.src = _conf.server + '/socket.io/socket.io.js';
        remoteslide.src = data.PPWSrc + '/_addons/remote-slide/remote-slide.js';

        // Add a disabled button
        $('#ppw-addons-container').append("<span>Remote controle: <span id='ppw-addon-remote-trigger'>...</span></span>")
        
        socketio.onload = function () {
            
            console.log('socketio loaded');
            
            remoteslide.onload = function () {
                
                // Enable button
                $('#ppw-addon-remote-trigger').css('cursor', 'pointer')
                                              .html("Off")
                                              .click(_enable);

                console.log('remoteslide loaded');
            }
            head.appendChild(remoteslide);
        }
        head.appendChild(socketio);        
    }    

    var _setup= function(data){
        _ppw= data;
    }

    return {
        onload: _setup,
        onsplashscreen: _init
    };
    
})());