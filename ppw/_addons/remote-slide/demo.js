window.PPW.extend("remote-slide", (function(){
    
    var init = function (data) {
        var head = document.getElementsByTagName('head')[0],
        socketio = document.createElement('script'),
        remoteslide = document.createElement('script');
        socketio.src = 'http://remote-slide.jit.su/socket.io/socket.io.js';
        remoteslide.src = data.PPWSrc + '/_addons/remote-slide/remote-slide.js';

        // Add a disabled button

        socketio.onload = function () {
            console.log('socketio loaded');
            remoteslide.onload = function () {
                // Enable button
                console.log('remoteslide loaded');
                var remote = new RemoteSlide();
                remote.connect('http://remote-slide.jit.su');
                remote.on('next', function() {
                    console.log('next');
                });
                remote.on('previous', function() {
                    console.log('previous');
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