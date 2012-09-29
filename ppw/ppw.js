/**
 * The PowerPolygon library.
 * 
 * This file contains the JavaScript library correspondent to the PowerPolygon
 * basic functionality.
 * 
 * @dependences jQuery
 * 
 * @author Felipe N. Moura <felipenmoura@gmail.com>
 * @namespace PPW
 *
 */

if(window.PPW)
    throw new Error("PowerPolygon framework already loaded!");
if(!window.jQuery)
    throw new Error("PowerPolygon requires jQuery");

window.PPW= (function($, _d){
    
    "use strict";
    
    /**************************************************
     *                PRIVATE VARIABLES               *
     **************************************************/
    var _self = this,
        _version= '2.0.0',
        // internal configuration properties
        _conf= {
            loadSteps: 6,
            curLoaded: 0,
            preloadedSlidesCounter: 0,
            cameraLoaded: false,
            presentationTool: null,
            defaults: {
                duration: 50
            }
        },
        // user defined settings
        _settings= {
            PPWSrc: "../ppw/"
        },
        // a local reference to the $(document)
        $d= $(_d),
        // after the load, it references to the body element
        _b= null,
        // $b references to the $(document.body)
        $b= null,
        _n= navigator,
        _w= window;
    
    
    /**
     * Available listeners.
     * Used by addons.
     */
    var _listeners= {
        onstart                 : [],
        onfinish                : [],
        onload                  : [],
        onnext                  : [],
        onprev                  : [],
        ongoto                  : [],
        onfullscreen            : [],
        onshowcamera            : [],
        onhidecamera            : [],
        onslidetypechange       : [],
        onpresentationtoolloaded: [],
        onclosesettings         : [],
        onopensettings          : [],
        onthemeloaded           : []
    }
    
    
    /**************************************************
     *                PRIVATE METHODS                 *
     **************************************************/
    
    /**
     * Adds an event listener to PPW.
     * 
     * Used by addons or external scripts, as well as internal methods calls.
     */
    var _addListener= function(evt, fn){
        if(_listeners[evt])
            _listeners[evt].push(fn);
    }
    
    var _removeListener= function(evt, fn){
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            try{
                do{
                    if(curEvt[i] == fn){
                        curEvt[i]= false;
                    }
                }while(i--);
            }catch(e){
                console.log("[PPW][Event Callback error]: ", e);
            }
        }
    };
    
    /**
     * Triggers an event.
     * 
     * Used only internaly.
     */
    var _triggerEvent= function(evt, args){
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            try{
                do{
                    if(curEvt[i])
                        curEvt[i](args);
                }while(i--);
            }catch(e){
                console.log("[PPW][Event Callback error]: ", e);
            }
        }
    }
    
    /**
     * Extends the PPW object.
     * 
     * Used by addons to register themselves and then, to
     * be able to receive events and the presentation data.
     */
    var _extend= function(id, conf){
        var prop= null;
        
        for(prop in conf){
            if(_listeners[prop] && typeof conf[prop] == 'function'){
                _addListener(prop, conf[prop]);
            }
        }
    }
    
    /**
     * Method called by the user to define the presentation settings.
     */
    var _init= function(conf){
        $.extend(_settings, conf);
        _triggerEvent('onload', conf);
    };
    
    /**
     * Sets one step ahead for the loading bar.
     * 
     * This method is used internaly only, before the splash screen.
     */
    var _setLoadingBarStatus= function(){
        _conf.curLoaded++;
        var perc= _conf.curLoaded * 100 / _conf.loadSteps;
        
        $('#PPW-loadingbar').css({width: perc+'%'});
        if(perc >= 100){
            _triggerEvent('onthemeloaded');
            $('#PPW-lock-loading').fadeOut();
        }
    };
    
    /**
     * Loads the theme's files.
     * 
     * This method loads the theme' manifes.json file, and then, its
     * dependences.
     */
    var _loadTheme= function(){
        $.getJSON(_settings.PPWSrc+'/_themes/'+_settings.theme+'/manifest.json', function(data, status){
            
            var dependences= false,
                i= 0,
                l= 0,
                url= '';
            
            if(status == 'success'){
                _conf.themeData= data;
                dependences= _conf.themeData.dependences||[];
                if(dependences.css){
                    _conf.loadSteps+= dependences.css.length;
                    l= dependences.css.length;
                    
                    for(i= 0; i<l; i++){
                        url= _settings.PPWSrc+'/_themes/'+
                             _settings.theme+'/'+dependences.css[i];
                                
                        $("head").append($("<link rel='stylesheet' href='"+
                                            url+"' type='text/css' media='screen' />")
                                        .bind('load',
                                              function(){
                                                  _setLoadingBarStatus();
                                              }));
                    }
                }
                if(dependences.js){
                    
                    _conf.loadSteps+= dependences.js.length;
                    l= dependences.js.length;
                    
                    for(i= 0; i<l; i++){
                        $.getScript(_settings.PPWSrc+'/_themes/'+
                                    _settings.theme+'/'+dependences.js[i],
                                    function(data, status, xhr){
                                        _setLoadingBarStatus();
                                    });
                    }
                }
                
                //alert(_settings.theme);
            }else{
                console.error("[PPW][Theme data] Could not load manifest.json! Theme: " + _settings.theme);
            }
            _setLoadingBarStatus();
        });
    };
    
    /**
     * Prepares the page to load the required files.
     * 
     * This method adds the loading bar and then loads the required scrips and
     * styles.
     */
    var _preparePPW= function(){
        $b.append("<div id='PPW-lock-loading' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color: #f0f9f9; padding: 10px; font-family: Arial; z-index: 999999999;'>\
                    Loading Contents<br/><div id='PPW-loadingbarParent'><div/><div id='PPW-loadingbar'><div/></div>");
        $('#PPW-loadingbarParent').css({
            width: '260px',
            height: '8px',
            border: 'solid 1px black',
            background: 'white',
            orverflow: 'hidden'
        });
        $('#PPW-loadingbar').css({
            width: '1px',
            height: '100%',
            background: '#f66'
        });
        
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: _settings.PPWSrc+"/_styles/ppw.css",
            onload: "PPW.setLoadingBarStatus()"
         }).appendTo("head");
        
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: _settings.PPWSrc+"/_styles/jquery-ui-1.8.23.custom.css",
            onload: "PPW.setLoadingBarStatus()"
         }).appendTo("head");
         
         $.getScript(_settings.PPWSrc+"/_scripts/jquery-ui-1.8.23.custom.min.js", function(){
             PPW.setLoadingBarStatus();
         });
         
         _loadTheme();
    };
    
    /**
     * Advances one step in the slides preload bar.
     */
    var _slidePreloaderNext= function(){
        var l= _settings.slides.length,
            perc= 0, fn;
        _conf.preloadedSlidesCounter++;
        
        perc= _conf.preloadedSlidesCounter * 100 / l;
        
        if(_conf.preloadedSlidesCounter == l){
            fn= function(){
                window.setTimeout(function(){
                    $('#ppw-slides-loader-bar').stop().animate({
                        marginTop: '-61px'
                    }, 500);
                }, 1000);
            };
        }
        
        $('#ppw-slides-loader-bar-loading-container>div').stop().animate({
            width: perc+'%'
        }, 100, fn);
    };
    
    /**
     * Preloads the slides before the presentation.
     * 
     * If the slide is not present in the document, it loades it via ajax.
     * After loading each slide, it puts its content into a new section and
     * tries to execute its JavaScript
     */
    var _preloadSlides= function(){
        var slides= _settings.slides,
            l= slides.length,
            i= 0,
            el= null,
            nEl= null;
        
        for(; i<l; i++){
            el= $('section#'+slides[i].id);
            if(!el.length){
                nEl= _d.createElement("section");
                nEl.id= slides[i].id;
                _d.body.appendChild(nEl);
                
                $.ajax(
                    {
                        url: 'slides/'+slides[i].id+'/index.html',
                        success: (function(slide){
                                    return function(data, status, xhr){
                                                var el= _d.getElementById(slide.id);
                                                el.innerHTML= data;
                                                $(el).find("script").each(function(i, scr){

                                                    var f= new Function(scr.innerText);

                                                    try{
                                                        f();
                                                    }catch(e){
                                                        console.error("[PPW][Script loaded from slide] There was an error on a script, loaded in one of your slides!", e)
                                                    }
                                                });
                                                _slidePreloaderNext();
                                            }
                                })(slides[i]),
                        error: (function(slide){
                            return function(){
                                console.error("[PPW][Slide loading]: Slide not found!", slide);
                                _slidePreloaderNext();
                            }
                        })(slides[i])
                    });
            }else{
                _d.body.appendChild(el[0]);
                _slidePreloaderNext();
            }
        }
    };
    
    /**
     * Creates the spash screen.
     * 
     * This screen ofers access to useful tools before the presentation begins.
     */
    var _createOpeningToolScreen= function(){
        _b= _d.body;
        $b= $(_b);
        // preparing ppw
        _preparePPW();
        
        $.get(_settings.PPWSrc+"_tools/splash-screen.html", {}, function(data){
            
            _d.body.innerHTML+= data;
            _setLoadingBarStatus();
            
            $('#ppw-goFullScreen-trigger').click(_enterFullScreen);
            $('#ppw-testResolution-trigger').click(_testResolution);
            $('#ppw-testAudio-trigger').click(_testAudio);
            $('#ppw-testCamera-trigger').click(_startCamera);
            $('#ppw-testConnection-trigger').click(_testConnection);
            _d.querySelector('#ppw-talk-title').innerHTML= _settings.title;
            
            $('#ppw-slides-loader-bar').stop().animate({
                marginTop: '0px'
            }, 500, _preloadSlides);
            
        });
        _loadSlide(1);
    };
    
    /**
     * Shows the resolution tool.
     * 
     * This tool allows the user to see the boundings of the presentation,
     * as well as check on colors and font sizes.
     */
    var _testResolution= function(){
        var el= $('#PPW-resolution-test-element');
        el.css({
            width: _b.offsetWidth-6+'px', // chrome has a bug with clientWidth in fullscreen
            height: _b.clientHeight-6+'px',
            display: 'block'
        });
        _showMessage("This tool helps you to identify the borders of the screen in the projector, reajust it and the resolution, as well as, for example, resize the window if necessary.<br/>\
This message should be in the center of the screen<br/><br/>Click ok when finished", function(){
            el.hide();
        });
    };
    
    /**
     * Tries to enter in fullscreen mode.
     * 
     * Triggers the event onfullscreen, passing the status: true if ok,
     * false if could not request the fullscreen on the browser.
     */
    var _enterFullScreen= function(){
    
        var fn= null,
            status= true;
        
        if(_b.requestFullScreen)
            _b.requestFullScreen();
        else if(_b.webkitRequestFullScreen)
                _b.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
             else if(_b.mozRequestFullScreen){
                     // TODO: fix this for firefox!!
                     _b.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                  }
                  else{
                    status= false;
                    alert("Your browser does not support Fullscreen from JavaScript!\nPlease, start your fullscreen with your keyboard!");
                  }
        
        _triggerEvent('onfullscreen', status);
    }
    
    /**
     * Show a message in a floating box in the center of the screen.
     */
    var _showMessage= function(msg, fn){
        var box= $('#ppw-message-box');
        $('#ppw-message-content').html(msg);
        box.show()
           .css({
               marginLeft: -(box[0].offsetWidth/2)+'px',
               marginTop: -(box[0].offsetHeight/2)+'px'
           });
        
        if(fn && typeof fn == 'function')
            $('#ppw-message-box input[type=button]').one('click', fn);
    };
    
    /**
     * Initializes and shows the camera.
     * 
     * This mathod askes for permition to use the camera, shows it ans enable
     * the binding events to it(such as gestures and clicks)
     */
    var _startCamera= function(){
        
        var video = _d.querySelector('#ppw-video-element'),
            el= $('#ppw-camera-tool');
                
        if(!_conf.cameraLoaded){
            _w.URL = _w.URL || _w.webkitURL;
            _n.getUserMedia  = _n.getUserMedia || _n.webkitGetUserMedia ||
                               _n.mozGetUserMedia || _n.msGetUserMedia;

            if (_n.getUserMedia) {
                
                _n.getUserMedia({audio: false, video: true}, function(stream) {
                    
                  try{
                      stream= _w.URL.createObjectURL(stream);
                  }catch(e){}

                  video.src = stream;
                  video.play();
                  _conf.cameraLoaded= true;
                  
                  el.draggable()
                    .resizable({
                        handles: "se, sw, ne, nw, n, e, s, w"
                    })
                    .bind('dblclick', function(){

                        var that= $(this), oldie= [];

                        if(that.data('fullscreened')){
                            oldie= that.data('oldprops');
                            that.data('fullscreened', true)
                                .show()
                                .animate({
                                     width: oldie[2]+'px',
                                     height: oldie[3]+'px',
                                     left: oldie[0]+'px',
                                     top: oldie[1]+'px'
                                 }, 500)
                                 .data('fullscreened', false);
                        }else{
                            that.data('fullscreened', true)
                                .data('oldprops', [
                                     this.offsetLeft,
                                     this.offsetTop,
                                     this.offsetWidth,
                                     this.offsetHeight
                                ])
                                .animate({
                                     width: _b.offsetWidth+'px',
                                     height: _b.offsetHeight+'px',
                                     left: '0px',
                                     top: '0px'
                                 }, 500);
                        }
                    }).css({
                        left: _b.offsetWidth - el[0].offsetWidth-10,
                        top: 0-el[0].offsetHeight
                    }).animate({top: '0px'}, 500);
                    
                    $('#ppw-camera-hide-trigger').bind('click', _pauseCamera);
                    _triggerEvent('onshowcamera', video);

                }, function(data){
                    alert("Could NOT start the video!");
                    console.error("[PPW Error]: Could now open the camera!", data);
                });
            }else{
                alert("Could NOT start the video!");
            }
        }else{
            _d.querySelector('#ppw-video-element').play();
            if(el[0].offsetTop <0){
                el.css({
                            left: _b.offsetWidth - el[0].offsetWidth-10,
                            top: 0-el[0].offsetHeight
                       }).animate({top: '0px'}, 500);
            }
        }
    };
    
    /**
     * Pauses the camera and hides it.
     */
    var _pauseCamera= function(){
        
        var el= null;
        
        if(_conf.cameraLoaded){
            el= $('#ppw-camera-tool');
            _d.querySelector('#ppw-video-element').pause();
            el.animate({top: -el[0].offsetHeight - 30})
        }
        _triggerEvent('onhidecamera');
    };
    
    /**
     * Plays an audio so the speaker can test the sound.
     */
    var _testAudio= function(){
        var el= _d.getElementById('ppw-audioTestElement');
        if(!el){
            $b.append("<audio id='ppw-audioTestElement' loop='loop' style='display: none;'>\
                                <source src='"+_settings.PPWSrc+"/_audios/water.mp3'/>\
                                <source src='"+_settings.PPWSrc+"/_audios/water.ogg'/>\
                               </audio>");
            el= _d.getElementById('ppw-audioTestElement');
        }
        el.play();
        _showMessage("Playing audio<br/><img src='"+_settings.PPWSrc+"/_images/loadingBar.gif' style='position: relative; left: 50%; margin-left: -100px;' width='200' />",
                     function(){
                        _d.getElementById('ppw-audioTestElement').pause();
                     });
    };
    
    /**
     * Opens the presentation tool.
     * 
     * This tool shows the current slide and its notes, as well as the next
     * slide and its notes.
     * Also, the time remaning/lapsed and the shortcut keys.
     */
    var _openPresentationTool= function(){
        var toolSrc= _settings.PPWSrc+'/_tools/presentation-tool.html',
            toolName= 'PPW-Presentation-tool',
            toolProps= "width=780,height=520,left=40,top=10";
        
        if(!_conf.presentationTool){
            _conf.presentationTool= window.open(toolSrc,
                                                toolName,
                                                toolProps);
            _conf.presentationTool.onload= function(){
                _conf.presentationTool.PresentationTool.init($, window.PPW);

            };
        }else{
            _conf.presentationTool.focus();
        }
    };
    
    /**
     * Triggers the very specific event to the Presentation Tool.
     * 
     * This method triggers the event that defines the load of the Presentation
     * Tool, leting addons to know that, and also offering access to its
     * document.
     */
    var _triggerPresentationToolLoadEvent= function(win){
        _triggerEvent('onpresentationtoolloaded', win);
    };
    
    /**
     * Verifies if the browser is online or not.
     */
    var _testConnection= function(){
        if(_n.onLine)
            alert("Your browser is online");
        else
            alert("There is a problem with the internet connection! Or your browser does not support the onLine API");
    };
    
    /**
     * Shows the current settings for the talk, with some options.
     * 
     * This method triggers two events that can be used by addons to add
     * their own settings to this showbox.
     */
    var _showConfiguration= function(){
        var msg= "",
            fn= function(){
                var parsed= "";
                
                _triggerEvent('onclosesettings');
                _settings.shortcutsEnable= _d.getElementById('ppw-shortcutsEnable').checked? true: false;
                _settings.duration= parseInt(_d.getElementById('ppw-talk-duration').value, 10)||_conf.defaults.duration;
                parsed= _d.getElementById('ppw-alert-at').value.replace(/ /g, '').split(',');
                parsed= parsed.filter(function(el){
                    return !isNaN(el)||false;
                });
                _settings.alertAt= parsed;
            }
            
        
        msg= "<form id='ppw-settings-form'>\
                    <h3>Settings</h3><br/>\
                    <label>Enable shortcuts: </label><input type='checkbox' id='ppw-shortcutsEnable' "+(_settings.shortcutsEnable? 'checked=checked': '')+" /><br/>\
                    <label>Duration: </label><input type='integer' id='ppw-talk-duration' value='"+_settings.duration+"' /><br/>\
                    <label>Alert at: </label><input type='string' id='ppw-alert-at' value='"+_settings.alertAt+"'placeholder='Comma separated minutes' /><br/>\
              </form>";
        _showMessage(msg, fn);
        _triggerEvent('onopensettings');
    };
    
    /**************************************************
     *               PRESENTATION CORE                *
     **************************************************/
    var _startPresentation= function(){
        $('#PPW-splash-screen-container').animate({
            marginTop: '-460px'
        }, 200, function(){
            $('#PPW-splash-screen').fadeOut();
        })
    };
    
    var _addAction= function(fn){
        
    };
    
    /**************************************************
     *                 SLIDE METHODS                  *
     **************************************************/
    var _loadSlide= function(slideNumber){
        _setLoadingBarStatus();
    };
    
    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    var _constructor= function(){
        _createOpeningToolScreen();
    };
    $(_d).ready(_constructor);
    
    /**************************************************
     *                 PUBLIC OBJECT                  *
     **************************************************/
    return {
        version                         : _version,
        init                            : _init,
        setLoadingBarStatus             : _setLoadingBarStatus,
        testConnection                  : _testConnection,
        enterFullScreen                 : _enterFullScreen,
        testResolution                  : _testResolution,
        openPresentationTool            : _openPresentationTool,
        testAudio                       : _testAudio,
        extend                          : _extend,
        startCamera                     : _startCamera,
        addListener                     : _addListener,
        removeListener                  : _removeListener,
        triggerPresentationToolLoadEvent: _triggerPresentationToolLoadEvent,
        showConfiguration               : _showConfiguration,
        startPresentation               : _startPresentation,
        addAction                       : _addAction
    };
    
})(jQuery, document);