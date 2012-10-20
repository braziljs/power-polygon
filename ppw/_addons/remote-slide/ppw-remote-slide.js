window.PPW.extend("remote-slide", (function(){
    
    var init = function (data) {
        var head = document.getElementsByTagName('head')[0],
        socketio = document.createElement('script'),
        remoteslide = document.createElement('script');
        socketio.src = 'http://localhost:81/socket.io/socket.io.js';
        remoteslide.src = data.PPWSrc + '/_addons/remote-slide/remote-slide.js';

        // Add a disabled button

        socketio.onload = function () {
            console.log('socketio loaded');
            remoteslide.onload = function () {
                // Enable button
                console.log('remoteslide loaded');
                var remote = new RemoteSlide();
                remote.connect('http://localhost:81');
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
            head.appendChild(remoteslide);
        }
        head.appendChild(socketio);        
    }    

    return {
        onstart: function(){ console.log("DEMO PLUGIN STARTING"); },
        onfinish: function(){ console.log("DEMO PLUGIN ENDING"); },
        onload: init,
        onnext: function(){ console.log("DEMO PLUGIN GOING NEXT"); },
        onprev: function(){ console.log("DEMO PLUGIN GOING PREVIOUS"); },
        ongoto: function(){ console.log("DEMO PLUGIN GOING TO"); },
        onfullscreen: function(){ console.log("DEMO PLUGIN FullScreen"); },
        onshowcamera: function(){ console.log("DEMO PLUGIN SHOWING CAMERA"); },
        onhidecamera: function(){ console.log("DEMO PLUGIN HIDING CAMERA"); },
        onslidetypechange: function(){ console.log("DEMO PLUGIN CHANGING SLIDE TYPE"); }
    };
    
})());