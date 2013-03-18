PPW.remote= (function(){
    
    var _ppw= null,
        _settings= {},
        _conf= {},
        PPWSrc= '',
        _socket= null,
        _io= null,
        _status= 'offline',
        _lastState= 'off';
    
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
            //_socket.join(PPW.get('canonic'));
        });
        
        _socket.on('control-command', function(data){
            console.log(data);
            alert("!!!");
            //PPW.goNext();
        });
        
    };
    
    var _connect= function(){
        if(_status == 'online'){
            _setAsOffline();
        }else{
            _setAsOnline();
        }
    };
    
    var _stablish= function(){
        
        //if(!_socket){
            _socket = _io.connect(_settings.remote.server);// + '/'+PPW.get('title'));
            _setListeners();
            
        /*}else{
            
            if(_status == 'offline'){
                _socket = io.connect(_settings.remote.server);
                _setListeners();
                _setAsOnline();
            }else{
                _socket.disconnect();
                _setAsOffline();
            }
        }*/
        
        
        
    };
    
    var _setAsOffline= function(){
        $('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-off.png").attr('title', 'Server available, click to connect');
        _status= 'available';
    }
    var _setAsOnline= function(){
        $('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-on.png").attr('title', 'Connected/listening - click to disconnect');
        _socket.emit('listening', location.pathname.replace('/index.html', '').split('/').pop());
        _status= 'online';
    }
    var _setAsNoServer= function(){
        $('#ppw-remote-icon').attr('src', PPWSrc+"/_images/remote-conection-status-no-server.png").attr('title', 'No server available');
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
        
        if(!_settings.remote.server){
            _settings.remote.server= location.protocol+'//'+location.host;
        }
        $.getScript(_settings.remote.server+"/socket.io/socket.io.js", function(){
            //_setAsOffline();
            _io= io;
            _stablish();
        });
    };
    
    return {
        server: 'online',
        init: _constructor,
        connect: _connect,
        getStatus: function(){return _status}
    }
})();