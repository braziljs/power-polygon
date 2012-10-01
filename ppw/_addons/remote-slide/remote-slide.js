if (!window.io) {
	throw 'Socket.io library is required. Make sure that node server is up';
}

(function (io) {
	var RemoteSlide = function () {},

	private = {

		socket : null,

		connected : false,

		setAction : function(action, fn) {
			private.socket.on('message', function(data) {
		  		if (data === action && typeof fn === 'function') {
		  			fn();
		  		}
		  	});
		}
	};

	RemoteSlide.prototype.connect = function (socketserver) {
		if (private.connected === false) {
			private.socket = io.connect(socketserver);
			private.connected = true;
		}
	};

	RemoteSlide.prototype.on = function (action, fn) {
		if (private.connected) {
			var act = action.match(/next|previous|fullscreen/);
			if (act !== null && act[0]) {
				private.setAction(action,fn);
			} else {
				throw 'Invalid action name';
			}
		} else {
			throw '#RemoteSlide - You must to connect before!';
		}
	};	

	window.RemoteSlide = RemoteSlide;
}(io));