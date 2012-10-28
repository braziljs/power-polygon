if (!window.io) {
    throw 'Socket.io library is required. Make sure that node server is up';
}

(function (io) {
    var RemoteSlide = function () {},
    
    priv = {

        socket : null,

        connected : false,

        setAction : function(action, fn) {
            priv.socket.on(action, fn);
        }
    };

    var getHash= function(str){

        var hash = 0, i, ch;

        if (str.length == 0)
            return hash;

        for (i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+ch;
            hash = hash & hash; // Convert to 32bit integer
        }

        return Math.abs(hash);
    };

    RemoteSlide.prototype.connect = function (socketserver) {
        if (priv.connected === false) {
            priv.socket = io.connect(socketserver);
            priv.connected = true;
        }
    };

    RemoteSlide.prototype.on = function (action, fn) {
        if (priv.connected) {
            priv.setAction(action,fn);
        } else {
            throw '#RemoteSlide - You must to connect before!';
        }
    };
    
    RemoteSlide.prototype.sync= function (pattern) {
        pattern= getHash((pattern||location.href));

        priv.socket.emit('requestSync', pattern);

        return pattern;
    };
    //sync-request

    window.RemoteSlide = RemoteSlide;
}(io));