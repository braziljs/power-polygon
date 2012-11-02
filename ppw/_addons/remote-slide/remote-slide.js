/*global window*/
if (!window.io) {
	throw 'Socket.io library is required. Make sure that node server is up';
}

(function (io) {

	'use strict';

	var RemoteSlide = function () {},

		priv = {
			socket : null,
			connected : false,

			setAction : function (action, fn) {
				priv.socket.on(action, fn);
			},

			getHash : function (str) {
				var hash = 0,
					i = 0,
					strLen = str.length,
					ch = null;

				if (strLen === 0) {
					return hash;
				}

				for (i; i < strLen; i++) {
					ch = str.charCodeAt(i);
					hash = ((hash << 5) - hash) + ch;
					hash = hash & hash;
				}

				return Math.abs(hash);
			}
		};

	RemoteSlide.prototype.connect = function (socketserver) {
		if (priv.connected === false) {
			priv.socket = io.connect(socketserver);
			priv.connected = true;
		}
	};

	RemoteSlide.prototype.on = function (action, fn) {
		if (priv.connected) {
			priv.setAction(action, fn);
		} else {
			throw '#RemoteSlide - You must to connect before!';
		}
	};

	RemoteSlide.prototype.sync = function (pattern) {
		pattern = priv.getHash((pattern || window.location.href));
		priv.socket.emit('requestSync', pattern);
		return pattern;
	};

	window.RemoteSlide = RemoteSlide;
}(window.io));