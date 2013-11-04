window.PPW.extend("remote-control", (function(){

    var _ppw= null,
        remote= null,
        _conf= {
            server: 'http://192.168.0.179:3000',
            controller: 'http://192.168.0.179:3000',
            hash: null,
            pointer: false,
            drawing: false,
            w: 0,
            h: 0
        };

    var _enable= function(){

        var conf= null;
        if(conf= PPW.get('remote')){
            if(conf.server)
                _conf.server= conf.server;
            if(conf.controller)
                _conf.controller= conf.controller;
        }

        var msg= "<strong>Remote control</strong><br/>In your remote device, go to the address: <div style='text-align: center; font-style: italic;'>"+_conf.controller+"</div>and enter the code:<br/>",
            hash= false;

        if(_conf.hash){
            PPW.showMessage(msg+"<div style='text-align: center; font-weight: bold; font-size: 120%;' class='ppw-focusable ppw-platform'>"+_conf.hash+"</div>");
            return;
        }

        this.innerHTML= "<img src='"+_ppw.PPWSrc + "/_addons/remote-control/loading.gif' height='14' />";

        remote = new RemoteControl();
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

        remote.on('holofote', function(data) {
            var holofote = $('#holofote');
            holofote.css('display', 'block');
            holofote.css({
                top : data[1],
                left : data[0]
            });
        });

        remote.on('laserpoint', function(data) {
            var laserpoint = $('#laserpoint');
            laserpoint.css('display', 'block');
            laserpoint.css({
                top : data[1],
                left : data[0]
            });
        });

        remote.on('point', function(data) {
            $('#laserpoint').css('display', 'none');
            $('#holofote').css('display', 'none');
            var l, t;

            if(!_conf.pointer){
                _conf.w= document.body.clientWidth;
                _conf.h= document.body.clientHeight;

                _conf.pointer= document.getElementById('ppw-pointer');
                _conf.pointer.width= _conf.w;
                _conf.pointer.height= _conf.h;
                _conf.pointer= _conf.pointer.getContext('2d');
            }

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
                $('#laserpoint').css('display', 'none');
            }
        });

        hash= remote.sync();
        _conf.hash= hash;
        PPW.showMessage(msg+"<div style='text-align: center; font-weight: bold; font-size: 120%;' class='ppw-focusable ppw-platform'>"+hash+"</div>");

    }

    var _init = function (data) {

        var head = document.getElementsByTagName('head')[0],
        //socketio = document.createElement('script'),
        remotecontrol = document.createElement('script');

        //socketio.src = ;
        remotecontrol.src = _ppw.PPWSrc + '/_addons/remote-control/remote-control.js';

        $.ajax({
            url: _conf.server + '/socket.io/socket.io.js',
            dataType: "script",
            success: function () {
                console.log('[PPW Addon] Socketio loaded');
                remotecontrol.onload = function () {

                    // Enable button
                    alert($('#ppw-toolbaricon-ppw-remote-icon').length)
                    $('#ppw-toolbaricon-ppw-remote-icon').css('cursor', 'pointer')
                                                  .html("Off")
                                                  .click('click', _enable);

                    console.log('[PPW Addon] remotecontrol addon loaded successfuly');
                }
                head.appendChild(remotecontrol);
            },
            error: function(){
                console.error("[PPW Addon] remotecontrol failed loading the socketio.js from "+ _conf.server + '/socket.io/socket.io.js');
            }
        });

        // Add a disabled button
        $('#ppw-addons-container').append("<span>Remote controle: <span id='ppw-addon-remote-trigger'>...</span></span>")

    }

    var _setup= function(data){
        var holofote = $('<div id="holofote"/>'),
            pointer = $('<div id="laserpoint"/>');
        holofote.css({
            'position': 'absolute',
            'height': '180px',
            'z-index': '9999',
            'opacity': '0.6',
            'width': '180px',
            'border-radius': '90px',
            'background' : 'yellow',
            'box-shadow': '0 0 60px 100px yellow',
            'display' : 'none'
        });

        pointer.css({
            'position': 'absolute',
            'height': '20px',
            'z-index': '9999',
            'opacity': '0.9',
            'width': '20px',
            'border-radius': '10px',
            'background' : 'red',
            'box-shadow': '0 0 20px 10px red',
            'display' : 'none'
        });

        $('body').prepend(holofote);
        $('body').prepend(pointer);

        $(document.body).append("<canvas id='ppw-pointer' style='position: absolute; left: 0px; top: 0px; z-index: 99999999; opacity: 0.3; display: none;' width='100%' height='100%'></canvas>");
        _ppw= data;
    }

    return {
        onload: _setup,
        onsplashscreen: _init
    };

})());