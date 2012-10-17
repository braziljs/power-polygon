/**
 * The PowerPolygon library.
 * 
 * This file contains the JavaScript library correspondent to the PowerPolygon
 * basic functionality.
 * 
 * @dependencies jQuery
 * 
 * @author Felipe N. Moura <felipenmoura@gmail.com>
 * @namespace PPW
 *
 */

if(window.PPW)
    throw new Error("PowerPolygon framework already loaded!");
if(!window.jQuery)
    throw new Error("PowerPolygon requires jQuery");

window.PPW= (function($, _d, console){
    
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
            currentLang: 'en',
            profiles: {},
            slidesLoaded: false,
            themeLoaded: false,
            animations: [
                         "flash",
                         "shake",
                         "bounce",
                         "tada",
                         "swing",
                         "wobble",
                         "wiggle",
                         "pulse",
                         "flip",
                         "flipInX",
                         "flipOutX",
                         "flipInY",
                         "flipOutY",
                         "fadeIn",
                         "fadeInUp",
                         "fadeInDown",
                         "fadeInLeft",
                         "fadeInRight",
                         "fadeInUpBig",
                         "fadeInDownBig",
                         "fadeInLeftBig",
                         "fadeInRightBig",
                         "fadeOut",
                         "fadeOutUp",
                         "fadeOutDown",
                         "fadeOutLeft",
                         "fadeOutRight",
                         "fadeOutUpBig",
                         "fadeOutDownBig",
                         "fadeOutLeftBig",
                         "fadeOutRightBig",
                         "bounceIn",
                         "bounceInDown",
                         "bounceInUp",
                         "bounceInLeft",
                         "bounceInRight",
                         "bounceOut",
                         "bounceOutDown",
                         "bounceOutUp",
                         "bounceOutLeft",
                         "bounceOutRight",
                         "rotateIn",
                         "rotateInDownLeft",
                         "rotateInDownRight",
                         "rotateInUpLeft",
                         "rotateInUpRight",
                         "rotateOut",
                         "rotateOutDownLeft",
                         "rotateOutDownRight",
                         "rotateOutUpLeft",
                         "rotateOutUpRight",
                         "lightSpeedIn",
                         "lightSpeedOut",
                         "hinge",
                         "rollIn",
                         "rollOut"],
            defaults: {
                duration: 50,
                alertAt: [30, 40],
                theme: 'default',
                slideType: 'content',
                slideTitleSize: 40,
                containerID: 'PPW-slides-container'
            },
            cons: {
                CLASS_SLIDE             : 'ppw-slide-element',
                CLASS_ACTIVE_SLIDE      : 'ppw-active-slide-element',
                CLASS_PREVIOUS_SLIDE    : 'ppw-previous-slide-element',
                CLASS_NEXT_SLIDE        : 'ppw-next-slide-element',
                CLASS_FULLSCREEN        : 'ppw-fullscreen',
                FOCUSABLE_ELEMENT       : 'ppw-focusable',
                CLICKABLE_ELEMENT       : 'ppw-clickable',
                /**
                 * used for the fsPattern settings.
                 * %id    = slide identifier
                 * %num   = slide number
                 */
                fs: {
                    SLIDE_ID_DIR         : 'slides/%id/index.html', // default
                    SLIDE_ID_FILES       : 'slides/%id.html',
                    SLIDE_ID_MIXED       : '%id.html',
                    SLIDE_NUM_DIR        : 'slides/%num/index.html',
                    SLIDE_NUM_FILES      : 'slides/%num.html',
                    SLIDE_NUM_MIXED      : '%num.html'
                }
            },
            currentSlide: 0,
            presentationStarted: false
        },
        
        // user defined settings
        _settings= {
            hashSeparator: '#!/', // the separator to be used on the address bar
            PPWSrc: "../../ppw/", // wondering the talk is in /talks/talkname for example
            shortcutsEnable: true, // enables or not, the shortcuts
            friendlyURL: 'id', // may be false(also, 'num') or id(slide' id)
            useSplashScreen: false, // should ppw open the splash screen first?
            slidesContainer: _d.createElement('div'),
            theme: _conf.defaults.theme,
            fsPattern: _conf.cons.fs.SLIDE_ID_DIR,
            alertAt: _conf.defaults.alertAt,
            duration: _conf.defaults.duration,
            showBatteryAlerts: true,
            showOfflineAlerts: true,
            slidesCache: true,
            profile: 'none'
        },
        // a local reference to the $(document)
        $d= $(_d),
        // after the load, it references to the body element
        _b= null,
        // $b references to the $(document.body)
        $b= null,
        // caching global variables into local ones
        _l= location,
        _n= navigator,
        _h= history,
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
        onslidesloaded          : [],
        onslideloaded           : [],
        ongoto                  : [],
        onslidechange           : [],
        onfullscreen            : [],
        onshowcamera            : [],
        onhidecamera            : [],
        onslidetypechange       : [],
        onpresentationtoolloaded: [],
        onclosesettings         : [],
        onopensettings          : [],
        onthemeloaded           : [],
        onsplashscreen          : [],
        F10_PRESSED             : [],
        F9_PRESSED              : [],
        F8_PRESSED              : [],
        F7_PRESSED              : [],
        F6_PRESSED              : []
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
        if(_listeners[evt]){
            _listeners[evt].push(fn);
        }
    }
    
    /**
     * verifies if the value is a number or not.
     */
    var isNum= function(val){
        return !isNaN(val);
    }
    
    /**
     * Removes a listener from the list.
     */
    var _removeListener= function(evt, fn){
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            do{
                if(curEvt[i] == fn){
                    curEvt[i]= false;
                }
            }while(i--);
        }
    };
    
    /**
     * Triggers an event.
     * 
     * Used only internaly.
     * 
     * @param String Event identificator.
     * @param Mixed Arguments
     */
    var _triggerEvent= function(evt, args){
        
        var i= 0, curEvt= null;
        
        if(curEvt= _listeners[evt]){
            i= curEvt.length;
            try{
                do{
                    if(curEvt[i]){
                        curEvt[i](args);
                    }
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
     * Enables shortcuts for the function keys.
     * 
     * The available function keys to be used are F6, F7, F8, F9 and F10.
     */
    var _enableFuncKeys= function(){
        var scList= _settings.shortcuts,
            sc= null;
        for(sc in scList){
            if(typeof scList[sc] == 'function'
               && _listeners[sc+'_PRESSED']){
                _addListener(sc+'_PRESSED', scList[sc]);
            }
        }
    };
    
    /**
     * Method called by the user to define the presentation settings.
     */
    var _init= function(conf){
        $.extend(_settings, conf);
        
        if(_settings.shortcutsEnable){
            _enableFuncKeys();
        }
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
            _triggerEvent('onthemeloaded', _settings.themeSettings);
            if(!_settings.useSplashScreen)
                _preloadSlides();
            $('#PPW-lock-loading').fadeOut();
        }
    };
    
    /**
     * Loads the theme's files.
     * 
     * This method loads the theme' manifes.json file, and then, its
     * dependencies.
     */
    var _loadTheme= function(){
        $.getJSON(_settings.PPWSrc+'/_themes/'+_settings.theme+'/manifest.json', function(data, status){
            
            var dependencies= false,
                i= 0,
                l= 0,
                url= '';
            
            if(status == 'success'){
                
                _conf.themeData= data;
                dependencies= _conf.themeData.dependencies||[];
                
                if(dependencies.css){
                    _conf.loadSteps+= dependencies.css.length;
                    l= dependencies.css.length;
                    
                    for(i= 0; i<l; i++){
                        url= _settings.PPWSrc+'/_themes/'+
                             _settings.theme+'/'+dependencies.css[i];
                                
                        $("head").append($("<link rel='stylesheet' href='"+
                                            url+"' type='text/css' media='screen' />")
                                        .bind('load',
                                              function(){
                                                  _setLoadingBarStatus();
                                              }));
                    }
                }
                
                if(dependencies.js){
                    
                    _conf.loadSteps+= dependencies.js.length;
                    l= dependencies.js.length;
                    
                    for(i= 0; i<l; i++){
                        $.getScript(_settings.PPWSrc+'/_themes/'+
                                    _settings.theme+'/'+dependencies.js[i],
                                    function(data, status, xhr){
                                        _setLoadingBarStatus();
                                    });
                    }
                }
                
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
            href: _settings.PPWSrc+"/_styles/animate.css",
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
         
         _bindEvents();
    };
    
    /**
     * Gets if a specified slide is valid for the current profile.
     */
    var _isValidProfile= function(slide){
        
        if(!slide)
            return false;
        
        if(!slide.profile || slide.profile == 'none'
           || !_settings.profile || _settings.profile == 'none')
           return slide;
       
        if(slide.profile != _settings.profile)
            return false;
            
        return slide;
    }
    
    /**
     * Hides all the invalid slides for the current profile
     */
    var _setPresentationProfile= function(profile){
        
        var i= 0, l= _settings.slides.length,
            slide;
        
        _conf.validSlides= [];
        
        if(profile === false)
            profile= 'none';
        if(profile)
            _settings.profile= profile;
        
        for(; i<l; i++){
            slide= _settings.slides[i];
            
            if(_isValidProfile(slide)){
                _conf.validSlides.push(slide);
                $('#'+slide.id).removeClass('ppw-slide-not-in-profile');
            }else{
                $('#'+slide.id).addClass('ppw-slide-not-in-profile');
            }
        }
    };
    
    var _getValidSlides= function(){
        return _conf.validSlides;
    }
    
    /**
     * Sets the language properties for the slides.
     * 
     * This method hides any element with a class starting by LANG- that does
     * not end with(case insensitive regular expression match) the user's navigator
     * language.
     * 
     * By the way, yes, LION stands for L10N(localization)
     * Also...case matters, when using for example en or EN.
     */
    var _setLION= function(language){
        
        var lang= language||_n.language,
            i= 0 || false,
            list= _settings.languages,
            rx= null;
        
        _conf.currentLang= lang;
        
        if(list){
            
            i= list.length-1;
            do{
                rx= new RegExp(list[i], 'i');
                if(lang.match(rx)){
                    lang= list[i];
                    $('.LANG-'+list[i]).show();
                }else{
                    $('.LANG-'+list[i]).hide();
                }
            }while(i--);
        }
        
    }
    
    /**
     * Advances one step in the slides preload bar.
     */
    var _slidePreloaderNext= function(loadedSlide){
        var l= _settings.slides.length,
            perc= 0, fn;
        _conf.preloadedSlidesCounter++;
        
        perc= _conf.preloadedSlidesCounter * 100 / l;
        
        if(_conf.preloadedSlidesCounter == l){
            fn= function(){
                _w.setTimeout(function(){
                    $('#ppw-slides-loader-bar').stop().animate({
                        marginTop: '-61px'
                    }, 500);
                }, 1000);
            };
        }
        
        // for each loaded slide
        _triggerEvent('onslideloaded', loadedSlide);
        
        if(perc == 100){
            // when all the slides loaded
            _conf.slidesLoaded= true;
            _setPresentationProfile();
            _setLION(_settings.defaultLanguage||_n.language);
            _triggerEvent('onslidesloaded', _settings.slides);
            if(!_settings.useSplashScreen)
                _startPresentation();
        }
        
        $('#ppw-slides-loader-bar-loading-container>div').stop().animate({
            width: perc+'%'
        }, 100, fn);
    };
    
    /**
     * Binds the keyboard events to the presentation.
     */
    var _bindEvents= function(){
        var t= null,
            k= 0;
        
        /**
         * Keyboard events.
         */
        $d.bind('keydown', function(evt){
            var t= evt.target.tagName.toLowerCase(),
                tmpEl= null;
            
            // if the element is an input or has the ppw-focusable class
            // then no shortcut will be executed.
            if(_isEditableTarget(evt.target) && evt.keyCode != 27/*esc*/)
                return true;
                
            switch(evt.keyCode){
                case 37: // left
                case 40: // down
                case  8: // delete/backspace
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goPreviousSlide();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 38: // up
                case 39: // right
                case 13: // enter
                case 32: // space
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goNextSlide();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    if(evt.keyCode == 13 && _isEditableTarget(evt.target)){
                        evt.target.click();
                    }
                    break;
                    
                case 18: //alt
                    if(_settings.shortcutsEnable
                        && _conf.presentationStarted
                        && !_isEditableTarget(evt.target)){
                        _showGoToComponent();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                
                case 27: // esc
                    if(_d.getElementById('ppw-message-box').style.display != 'none'){
                        _closeMessage();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 70: // F
                    _showSearchBox();
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                    break;
                    
                default: {
                    if(_settings.shortcutsEnable){
                        if(evt.altKey && _conf.presentationStarted){
                            k= evt.keyCode - 48;
                            if(k>=0 && k<10){
                                _d.getElementById('ppw-go-to-slide').value+= k;
                                evt.preventDefault();
                                evt.stopPropagation();
                                return false;
                            }
                        }
                    }
                    
                }
            }
            return true;
        });
        $d.bind('keyup', function(evt){
            
            var s= false;
            
            // Manages the gotoslide box and also function keys
            switch(evt.keyCode){
                case 18: // alt
                    s= _d.getElementById('ppw-go-to-slide');
                    if(s){
                        if(s.value){
                            s= parseInt(s.value, 10);
                            if(s <= 0)
                                s= 1;
                            _goToSlide(_getValidSlides()[s -1]);
                            
                        }
                        _closeMessage();
                        evt.preventDefault();
                        evt.stopPropagation();
                    }
                    return false;
                    break;
                    
                case 117: // F6
                    s= _triggerEvent('F6_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 118: // F7
                    s= _triggerEvent('F7_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 119: // F8
                    s= _triggerEvent('F8_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 120: // F9
                    s= _triggerEvent('F9_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 121: // F10
                    s= _triggerEvent('F10_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
            }
            
            // for when the user holds a key
            $d.bind('keypress', function(evt){
                
                if(!evt.altKey)
                    return;
                
                switch(evt.keyCode){
                    case 188: // ,(<)
                    case 65: // a
                    case 37: // left
                        //_showSlidesThumb();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    break;
                    case 190: // .(>)
                    case 83: // s
                    case 39: // left
                        //_showSlidesThumb();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    break;
                }
            });
                        
            
            
            
            return true;
        });
        
        /**
         * History events(POP and HASHCHANGE).
         */
        _w.addEventListener('popstate', function(){
            
        }, false);
        _w.addEventListener('hashchange', function(){
            if(_h.state)
                _goToSlide(_getCurrentSlideFromURL());
        }, false);
        
        /**
         * Mouse events.
         */
        $d.bind('click', function(evt){
            if(_conf.presentationStarted && !_isEditableTargetContent(evt.target)){
                _goNextSlide();
                evt.preventDefault();
                return false;
            }
            return true;
        });
        
        /**
         * Online/Offline events
         */
        if(_settings.showOfflineAlerts){
            _b.addEventListener("offline", function () {
                _showNotification("Your browser went offline!");
            }, false);
            _b.addEventListener("online", function () {
                _showNotification("Your browser is back online");
            }, false);
        }
        
        // Battery events, if supported
        if(_settings.showBatteryAlerts){
            if(_n.battery){
                _n.battery.addEventListener('chargingchange', function(data){
                    if(!_n.battery.charging){ // was charging and is not anymore
                        _showNotification("<img src='"+_settings.PPWSrc+"/_images/electricity.png' width='20' alt='Your battery stoped charging!' />");
                    }else{
                        _closeNotification();
                    }
                }, false);

                _addListener('onthemeloaded', function(){
                    _conf.themeLoaded= true;
                    setTimeout(function(){
                        if(!_n.battery.charging){
                            if(_n.battery.dischargingTime / 600000 < _settings.duration){
                                _showNotification("<img src='"+_settings.PPWSrc+"/_images/electricity.png' width='20' title='You have "+ (_n.battery.dischargingTime / 60)+" minutes of battery!' />");
                            }
                        }
                    }, 1000);
                });
            }
        }
        
        // window events
        _w.addEventListener('blur', function(){
            if(_d.getElementById('ppw-message-box').style.display != 'none'){
                if(_d.getElementById('ppw-message-box-button').style.display == 'none'){
                    _closeMessage();
                }
            }
            
        }, false);
        
        _w.onbeforeunload= function(){
            
            if(_conf.presentationTool)
                _conf.presentationTool.close();
            return null;
        };
    };
    
    /**
     * Shows the help pannell
     */
    var _showHelp= function(){
        var msg= "<h3>Help</h3>\
                  Website: <a href='http://powerpolygon.com' target='_blank'>powerpolygon.com</a><br/>\
                  Forum/Discussion group: <a href='https://groups.google.com/forum/#!forum/powerpolygon' target='_blank'>forum/powerpolygon</a><br/>\
                  Documentation: <a href='https://github.com/braziljs/PowerPolygon/wiki' target='_blank'>wiki</a><br/>\
                  Fork me: <a href='https://github.com/braziljs/PowerPolygon' target='_blank'>Github</a><br/>\
                  <br/><br/>\
                  <b>Shortcuts</b><br/>\
                  ALT: Go to slide<br/>\
                  ALT+F: Search into slides<br/>\
                  F6, F7, F8, F9, F10: Custom"
        _showMessage(msg);
    }
    
    /**
     * Show a notification in the bottom of the page.
     */
    var _showNotification= function(msg){
        var el= $('#ppw-notification-element');
        if(el.length){
            el.find('span').html(msg);
            el.animate({
                left: '0px'
            }, 500);
        }
    };
    
    /**
     * Closes the notification message.
     */
    var _closeNotification= function(){
        var el= $('#ppw-notification-element');
        el.animate({
            left: '-'+(el[0].offsetWidth+10)+'px'
        }, 300);
    };
    
    /**
     * Returns true if the event dispatcher is editable.
     * 
     * An editable element is a form element or any HTML element with the
     * editable  or clickacble classes, or with a tabindex set.
     */
    var _isEditableTarget= function(target){
        var t= target,
               tag= t.tagName.toLowerCase(),
               $t= $(t);

        if(tag == 'a' || tag == 'button' || tag == 'option' ||
           tag == 'input' || tag == 'textarea' || tag == 'select' ||
           $t.hasClass(_conf.cons.FOCUSABLE_ELEMENT) ||
           $t.hasClass(_conf.cons.CLICKABLE_ELEMENT) ||
           t.hasAttribute('tabindex')){
           return true;
        }
        return false;
    }
    
    /**
     * Returns if the targeted element is a child of an editable element.
     * 
     * An editable element is a form element or any HTML element with the
     * editable  or clickacble classes, or with a tabindex set.
     * 
     * This method verifies all the parent elements up to the body element,
     * if any of them is editable, it returns true.
     */
    var _isEditableTargetContent= function(target){
        while(target.tagName.toLowerCase() != 'body'){
            if(_isEditableTarget(target)){
                return true;
            }
            target= target.parentNode;
        }
        return false;
    }
    
    /**
     * Creates the URL to each external slide.
     * 
     * External slides' URLs should follow the fsPattern, defined by the user.
     * This method returns the prepared URL following that pattern.
     * 
     * @param String The slide identifier.
     * @param Integer The slide index in the list of slides.
     * @return string URL.
     */
    var _getSlideURL= function(id, idx){
        
        return _settings.fsPattern
                        .replace(/\%id/i, id)
                        .replace(/\%num/i, idx)
                            + (!_settings.slidesCache? ('?noCache='+(new Date()).getTime()) : '');
    }
    
    /**
     * Preloads the slides before the presentation.
     * 
     * If the slide is not present in the document, it loades it via ajax.
     * After loading each slide, it puts its content into a new section and
     * tries to execute its JavaScript
     * 
     */
    var _preloadSlides= function(){
        var slides= _settings.slides,
            l= slides.length,
            i= 0,
            el= null,
            nEl= null,
            tt= '',
            container= _settings.slidesContainer;
        
        if(!container.id){
            container.id= _conf.defaults.containerID;
            _b.appendChild(container);
        }
        
        for(; i<l; i++){
            el= $('section#'+slides[i].id);
            
            if(i === 0)
                slides[i].first= true;
            if(i==l-1)
                slides[i].last= true;
            
            slides[i].actions= [];
            if(!el.length){ // should load it from ajax
                nEl= _d.createElement("section");
                nEl.id= slides[i].id;
                container.appendChild(nEl);
                
                $.ajax(
                    {
                        url: _getSlideURL(slides[i].id, i),
                        success: (function(slide, i){
                                    return function(data, status, xhr){
                                                var el= _d.getElementById(slide.id),
                                                    tt= null;
                                                    
                                                el.innerHTML= data;
                                                _settings.slides[i].el= el;
                                                tt= $(el).find('h1, h2, h3, h4, h5, h6')[0];
                                                tt= tt? tt.innerHTML: el.textContent.substring(0, _conf.defaults.slideTitleSize);
                                                _settings.slides[i].title= tt;
                                                _settings.slides[i].index= i+1;
                                                
                                                $(el).find("script").each(function(i, scr){
                                                    
                                                    var f= new Function("PPW.slideIterator= this; "+scr.textContent);

                                                    try{
                                                        f.apply(slide);
                                                    }catch(e){
                                                        console.error("[PPW][Script loaded from slide] There was an error on a script, loaded in one of your slides!", e)
                                                    }
                                                });
                                                _slidePreloaderNext(_settings.slides[i]);
                                            }
                                })(slides[i], i),
                        error: (function(slide){
                            return function(){
                                console.error("[PPW][Slide loading]: Slide not found!", slide);
                                _slidePreloaderNext();
                            }
                        })(slides[i])
                    });
                el= $('section#'+slides[i].id);
            }else{ // the slide content is already on the DOM
                
                _settings.slides[i].el= el[0];
                tt= el.find('h1, h2, h3, h4, h5, h6')[0];
                tt= tt? tt.innerHTML: el[0].textContent.substring(0, _conf.defaults.slideTitleSize);
                _settings.slides[i].title= tt;
                _settings.slides[i].index= i+1;
                
                container.appendChild(el[0]);
                $(el).find("script").each(function(count, scr){
                    
                    var f= new Function("PPW.slideIterator= this; "+scr.textContent);

                    try{
                        f.apply(slides[i]);
                    }catch(e){
                        console.error("[PPW][Script loaded from slide] There was an error on a script, loaded in one of your slides!", e)
                    }
                });
                
                _slidePreloaderNext(_settings.slides[i]);
            }
            if(slides[i].profile){
                _conf.profiles[slides[i].profile]= true;
            }
            if(_settings.profile)
                _conf.profiles[_settings.profile]= true;
            
            slides[i].actionIdx= 0;
            el.addClass(_conf.cons.CLASS_SLIDE + " ppw-slide-type-" + (slides[i].type||_conf.defaults.slideType));
            
        }
    };
    
    /**
     * Opens the go-to-slide component.
     */
    var _showGoToComponent= function(useEnter){
        
        var el= null, fn;
        if(useEnter){
            
            _showMessage("Go to slide:<br/><input style='margin: auto;' type='integer' id='ppw-go-to-slide' value='' />",
                         false, true);
        
            el= _d.querySelector('#ppw-go-to-slide');
            el.addEventListener('keyup', function(evt){
                if(evt.keyCode == 13){
                    _goToSlide(_getValidSlides()[parseInt(this.value, 10) -1]);
                    _closeMessage();
                }
                evt.preventDefault();
                evt.stopPropagation();
                return false;
            }, false);
            el.focus();
        }else{
            _showMessage("Go to slide:<br/><input style='margin: auto;' type='integer' id='ppw-go-to-slide' value='' />", false, true);
        }
    };
    
    /**
     * Searchs for a string in the slides.
     * 
     * This method goes to the previous or next slide which contains the
     * searched term.
     */
    var _searchIntoSlides= function(direction, str){
        
        var slidesToSearchInto= [],
            i= 0, l= 0,
            slide= null,
            goTo= 0;
        
        if(str == '' || !str.toLowerCase)
            return false;
        
        str= str.toLowerCase();
        
        if(!direction || direction == 'next'){
            slidesToSearchInto= _settings.slides.slice(_conf.currentSlide+1);
            l = slidesToSearchInto.length;
            for(; i<l; i++){
                if(!slidesToSearchInto[i])
                    break;
                slide= _d.getElementById(slidesToSearchInto[i].id);
                if(slide.textContent.toLowerCase().indexOf(str) >= 0){
                    goTo= _conf.currentSlide+1 +i;
                    _goToSlide(goTo);
                    return goTo;
                }
            }
        }else{ // previous slides
            slidesToSearchInto= _settings.slides.slice(0, _conf.currentSlide);
            i= slidesToSearchInto.length-1;
            
            do{
                if(!slidesToSearchInto[i])
                    break;
                slide= _d.getElementById(slidesToSearchInto[i].id);
                if(slide.textContent.toLowerCase().indexOf(str) >= 0){
                    _goToSlide(i);
                    return i;
                }
            }while(i--)
        }
        return false;
    }
    
    /**
     * Shows the searchbox.
     * 
     * This search goes to the slide where the searched term is found.
     */
    var _showSearchBox= function(){
        var content= "Search into slides:<br/>\
                      <input style='margin: auto;' type='text' id='ppw-search-slide' value='' />\
                      <span id='ppw-search-prev' class='ppw-clickable' title='Find in previous slides(shift+enter)'>◄</span> <span id='ppw-search-next' title='Find in next slides(enter)' class='ppw-clickable'>►</span><br/><br/><span id='ppw-search-found' class='ppw-clickable'></span>",
            el= null;
        _showMessage(content);
        
        el= _d.getElementById('ppw-search-slide');
        setTimeout(function(){_d.getElementById('ppw-search-slide').focus();}, 100);
        el.addEventListener('keyup', function(evt){
            if(evt.keyCode == 13){ // enter
                if(evt.shiftKey)
                    $('#ppw-search-prev').trigger('click');
                else
                    $('#ppw-search-next').trigger('click');
            }else if(evt.keyCode == 27){ // esc
                _closeMessage();
            }
        }, false);
        
        $('#ppw-search-prev').bind('click', function(){
            var ret= _searchIntoSlides('prev', _d.getElementById('ppw-search-slide').value),
                msg= 'Not found in previous slides!';
            if(ret !== false){
                msg= "Found in slide "+ret;
            }
            _d.getElementById('ppw-search-found').innerHTML= msg;
        });
        $('#ppw-search-next').bind('click', function(){
            var ret= _searchIntoSlides('next', _d.getElementById('ppw-search-slide').value),
                msg= 'Not found in next slides!';
            if(ret !== false){
                msg= "Found in slide "+ret;
            }
            _d.getElementById('ppw-search-found').innerHTML= msg;
        });
        
    };
    
    /**
     * Creates the spash screen.
     * 
     * This screen ofers access to useful tools before the presentation begins.
     */
    var _createSplashScreen= function(){
        
        _b= _d.body;
        $b= $(_b);
        
        _preparePPW();
        
        // APPENDING THE CAMERA, TOOLBAR AND MESSAGE-BOX TO THE DOCUMENT
        $b.append('<div id="ppw-message-box" class="ppw-clickable">\
                        <div id="ppw-message-content" class="ppw-clickable"></div>\
                        <div id="ppw-message-box-ok-button" class="ppw-clickable">\
                            <input type="button" id="ppw-message-box-button" value="Close" />\
                        </div>\
                      </div>');
        $b.append('<div id="ppw-camera-tool" class="ppw-clickable">\
                        <video id="ppw-video-element" autoplay="autoplay" class="ppw-clickable"></video>\
                        <div id="ppw-camera-hide-trigger" class="ppw-clickable">\
                            <img height="10" class="ppw-clickable" src="">\
                        </div>\
                      </div>');
        $b.append('<div id="ppw-toolbar-container" class="'+_conf.cons.CLICKABLE_ELEMENT+'">\
                    <div id="ppw-toolbar" class="'+_conf.cons.CLICKABLE_ELEMENT+'">\
                        <img id="ppw-goto-icon" onclick="PPW.showGoToComponent(true);" title="Go to a specific slide" />\
                        <img id="ppw-toolbox-icon" onclick="PPW.openPresentationTool();" title="Open Presentation Tool" />\
                        <img id="ppw-search-icon" onclick="PPW.showSearchBox()" title="Search on slides"/>\
                        <img id="ppw-fullscreen-icon" onclick="PPW.enterFullScreen()" title="Go Fullscreen"/>\
                        <img id="ppw-camera-icon" onclick="PPW.startCamera();" title="Start the camera"/>\
                        <img id="ppw-settings-icon" onclick="PPW.showConfiguration();" title="Settings"/>\
                    </div>\
                   </div>');
        
        $('#ppw-goto-icon').attr('src', _settings.PPWSrc+'/_images/goto.png')
                           .addClass(_conf.cons.CLICKABLE_ELEMENT)
        
        $('#ppw-toolbox-icon').attr('src', _settings.PPWSrc+'/_images/toolbox.png')
                              .addClass(_conf.cons.CLICKABLE_ELEMENT);
                              
        $('#ppw-search-icon').attr('src', _settings.PPWSrc+'/_images/search.png')
                             .addClass(_conf.cons.CLICKABLE_ELEMENT);
                             
        $('#ppw-fullscreen-icon').attr('src', _settings.PPWSrc+'/_images/fullscreen.png')
                                 .addClass(_conf.cons.CLICKABLE_ELEMENT);
                                 
        $('#ppw-camera-icon').attr('src', _settings.PPWSrc+'/_images/camera.png')
                             .addClass(_conf.cons.CLICKABLE_ELEMENT);
                                 
        $('#ppw-settings-icon').attr('src', _settings.PPWSrc+'/_images/settings-icon.png')
                             .addClass(_conf.cons.CLICKABLE_ELEMENT);

        if(_settings.useSplashScreen){
        
            $.get(_settings.PPWSrc+"_tools/splash-screen.html", {}, function(data){

                _d.body.innerHTML+= data;
                _setLoadingBarStatus();

                $('#ppw-goFullScreen-trigger').click(_enterFullScreen);
                $('#ppw-testResolution-trigger').click(_testResolution);
                $('#ppw-testAudio-trigger').click(_testAudio);
                $('#ppw-testCamera-trigger').click(_startCamera);
                $('#ppw-testConnection-trigger').click(_testConnection);
                $('#ppw-talk-title').html(_settings.title);
                
                $('.ppw-menu-start-icon').click(_startPresentation);
                $('.ppw-notification-close-button').click(_closeNotification);
                
                $('#ppw-slides-loader-bar').stop().animate({
                    marginTop: '0px'
                }, 500, _preloadSlides);
                _triggerEvent('onsplashscreen', _d.getElementById('ppw-addons-container'));

            });
        }else{
            //_preloadSlides();
            _setLoadingBarStatus();
            //_startPresentation();
        }
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
        if($b.hasClass(_conf.cons.CLASS_FULLSCREEN)){
            if (_d.exitFullscreen) {
                _d.exitFullscreen();
            }else if (_d.mozCancelFullScreen) {
                    _d.mozCancelFullScreen();
                  }else if (_d.webkitCancelFullScreen) {
                            _d.webkitCancelFullScreen();
                        }
            $b.removeClass(_conf.cons.CLASS_FULLSCREEN);
        }else{
            if(_b.requestFullScreen)
                _b.requestFullScreen();
            else if(_b.webkitRequestFullScreen)
                    _b.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                 else if(_b.mozRequestFullScreen){
                         _b.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                      }
                      else{
                        status= false;
                        alert("Your browser does not support Fullscreen from JavaScript!\nPlease, start your fullscreen with your keyboard!");
                      }
            $b.addClass(_conf.cons.CLASS_FULLSCREEN);
            _triggerEvent('onfullscreen', status);
        }
    }
    
    /**
     * Show a message in a floating box in the center of the screen.
     */
    var _showMessage= function(msg, fn, hideButton){
        
        var box= $('#ppw-message-box'),
            func= null;
        
        $('#ppw-message-content').html(msg);
        box.show()
           .css({
               marginLeft: -(box[0].offsetWidth/2)+'px',
               marginTop: -(box[0].offsetHeight/2)+'px'
           });
        
        if(hideButton)
            $('#ppw-message-box-button').hide();
        else
            $('#ppw-message-box-button').show();
        
        func= function(){
            if(fn && typeof fn == 'function')
                fn();
            _closeMessage();
        }
        
        $('#ppw-message-box-button').one('click', func);
        setTimeout(function(){
            _d.getElementById('ppw-message-box-button').focus();
        }, 100);
    };
    
    /**
     * Closes the message box
     */
    var _closeMessage= function(){
        _d.getElementById('ppw-message-box').style.display= 'none';
        _d.getElementById('ppw-message-content').innerHTML= '';
    }
    
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
                  
                  _conf.video= video;
                  _conf.stream= stream;
                  
                  _triggerEvent('onshowcamera', {
                      "video": _conf.video,
                      "device": _conf.stream
                  });
                  
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
                    
                }, function(data){
                    alert("Could NOT start the video!");
                    console.error("[PPW Error]: Could now open the camera!", data);
                    return false;
                });
            }else{
                alert("Could NOT start the video!");
                return false;
            }
        }else{
            _d.querySelector('#ppw-video-element').play();
            if(el[0].offsetTop <0){
                el.css({
                            left: _b.offsetWidth - el[0].offsetWidth-10,
                            top: 0-el[0].offsetHeight
                       }).animate({top: '0px'}, 500);
            }
            
            if(_conf.video && _conf.stream){
                _triggerEvent('onshowcamera', {
                    "video": _conf.video,
                    "device": _conf.stream
                });
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
        
        if(!_conf.presentationTool || !_conf.presentationTool.focus){
            _conf.presentationTool= _w.open(toolSrc,
                                                toolName,
                                                toolProps);
            _conf.presentationTool.onload= function(){
                _conf.presentationTool.PresentationTool.init($, _w.PPW, _getSlides());
            };
            _conf.presentationTool.onunload= function(){
                _conf.presentationTool= false;
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
            _showMessage("Your browser is online");
        else
            _showMessage("There is a problem with the internet connection! Or your browser does not support the onLine API");
    };
    
    /**
     * Shows the current settings for the talk, with some options.
     * 
     * This method triggers two events that can be used by addons to add
     * their own settings to this showbox.
     */
    var _showConfiguration= function(){
        var msg= "",
            i= 0,
            el= null,
            list= [],
            l= 0,
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
                    <div id='ppw-profile-config'><label>Profile: </label><select id='ppw-profile-option'></select></div><br/>\
                    <div id='ppw-languages-config'><label>Language: </label><select id='ppw-language-option'></select></div><br/>\
              </form>";
            
        _showMessage(msg, fn);
        
        if(_conf.profiles){
            list= Object.keys(_conf.profiles);
            l= list.length;
            msg= "<option value='none'>none</option>";
            for(; i<l; i++){
                msg+= "<option value='"+list[i]+"'>"+list[i]+"</option>";
            }
            
            $('#ppw-profile-option').html(msg)
                                    .attr('value', (_settings.profile && _settings.profile != 'none'? _settings.profile: 'none'))
                                    .bind('change', function(){
                                        _setPresentationProfile(this.value);
                                        _goToSlide(_conf.currentSlide);
                                    });
        }else{
            $('#ppw-profile-config').hide();
        }
        
        if(!_settings.languages || !_settings.languages.length){
            $('#ppw-languages-config').hide();
        }else{
            list= _settings.languages;
            l= list.length;
            msg= "";
            for(i=0; i<l; i++){
                msg+= "<option value='"+list[i]+"'>"+list[i]+"</option>";
            }
            
            $('#ppw-language-option').html(msg)
                                     .attr('value', _conf.currentLang)
                                     .bind('change', function(){
                                        _setLION(this.value);
                                     });
            
        }
        
        _triggerEvent('onopensettings', _settings);
    };
    
    /**************************************************
     *               PRESENTATION CORE                *
     **************************************************/
    
    /**
     * Starts the presentation itself.
     */
    var _startPresentation= function(evt){
        
        var el= _d.querySelector('.ppw-menu-start-icon');
        
        $('#PPW-splash-screen-container').animate({
            marginTop: '-460px'
        }, 200, function(){
            $('#PPW-splash-screen').fadeOut();
        });
        _conf.presentationStarted= (new Date()).getTime();
        _goToSlide(_getCurrentSlideFromURL());
        if(el)
            el.blur();
        _triggerEvent('onstart', _conf.currentSlide);
        
        if(evt){
            evt.preventDefault();
            return false;
        }
    };
    
    /**
     * Adds an action to each speficied slide.
     */
    var _addAction= function(action){
        
        var slideRef= PPW.slideIterator;
        if(!slideRef || !slideRef.actions)
            return false; // it probably is not loaded yet...will be called again when loaded
        
        if(typeof action == 'function'){
            slideRef.actions.push({
                timing: 'click',
                does: action
            });
        }else{
            if(action.does && typeof action.does == 'function'){
                if(!action.timing)
                    action.timing= 'click';
                slideRef.actions.push(action);
            }
        }
        return true;
    };
    
    /**************************************************
     *                 SLIDE METHODS                  *
     **************************************************/
    
    /**
     * Returns the index of the current slide based on the url.
     */
    var _getCurrentSlideFromURL= function(){
        var h= _l.hash.replace(_settings.hashSeparator, '')||_settings.slides[0].id,
            i= _settings.slides.length;
        if(isNaN(h)){
            while(i--){
                if(_settings.slides[i].id == h)
                    return i;
            };
        }
        return h||0;
    };
    
    
    /**
     * Gets the previously profile valid slide.
     * 
     * If a slide is given, it returns the closest previous valid slide in
     * relation to that slide.
     */
    var _getPrevValidSlide= function(slide){
        
        
        var idx= 0,
            l= _settings.slides.length;
        
        slide= typeof slide == 'object'? slide: _getCurrentSlide();
        idx= slide.index-2;
        
        if(idx<0){
            return _getCurrentSlide();
        }
        
        slide= _settings.slides[idx];
        
        while(!_isValidProfile(slide)){
            if(idx<0){
                slide= _getCurrentSlide();
                break;
            }
            slide= _settings.slides[--idx];
        }
        return slide;
    }
    
    /**
     * Gets the next profile valid slide.
     * 
     * If a slide is given, it returns the next closest valid slide in
     * relation to that slide.
     */
    var _getNextValidSlide= function(slide){
        
        var idx= 0,
            l= _settings.slides.length;
        
        slide= typeof slide == 'object'? slide: _getCurrentSlide();
        idx= slide.index;
        
        slide= _settings.slides[idx];
        
        while(slide && !_isValidProfile(slide)){
            if(idx>=l){
                slide= _getCurrentSlide();
                break;
            }
            slide= _settings.slides[++idx];
        }
        return slide;
    };
    
    
     
    
    /**
     * Go to the previous slide.
     * 
     * If the current slide has actions executed, it executes the undo method of
     * the last executed action, instead of actually going to the previous slide.
     */
    var _goPreviousSlide= function(){
        
        var slide= _getCurrentSlide(),
            fn= null;
        
        if(slide.actionIdx > 0){
            
            if(slide._timer){
                _w.clearTimeout(slide._timer);
                slide._timer= false;
            }
            
            slide.actionIdx--;
            fn= slide.actions[slide.actionIdx].undo;
            
            if(fn && typeof fn == 'function'){
                try{
                    fn(slide);
                }catch(e){
                    console.error("[PPW][Slide action error] There was an error trying to execute an action of the current slide:", slide, e);
                }
            }else{
                _goPreviousSlide();
                //_goToSlide(_conf.currentSlide-1, 'prev');
            }
        }else{
            _goToSlide(_getPrevValidSlide(), 'prev');
        }
    };
    
    /**
     * Go to the next slide.
     * 
     * If the current slide has actions yet to be executed, it executes its does
     * method.
     */
    var _goNextSlide= function(){
        
        var slide= _getCurrentSlide(),
            fn= null,
            nextAction= null;
        
        if(slide._timer){
            _w.clearTimeout(slide._timer);
            slide._timer= false;
        }
        
        if(slide.actionIdx < slide.actions.length){
            // still has actions to execute.
            try{
                fn= slide.actions[slide.actionIdx].does();
            }catch(e){
                console.error("[PPW][Slide action error] There was an error trying to execute an action of the current slide:", slide, e);
            };
            slide.actionIdx++;
            
            nextAction= slide.actions[slide.actionIdx];
            
            if(nextAction && nextAction.timing != 'click'){
                if(nextAction.timing == 'auto' || slide._timer){
                    _goNextSlide();
                }else{
                    if(isNum(nextAction.timing)){
                        slide._timer= _w.setTimeout(function(){
                            _goNextSlide();
                            slide._timer= false;
                        }, nextAction.timing);
                    }
                }
            }
        }else{
            // go to the next valid slide.
            _goToSlide(_getNextValidSlide(), 'next');
        }
    };
    
    /**
     * Go to a specific slide by index.
     */
    var _goToSlide= function(idx, prevent){
        
        var url= '',
            previousSlide= _getCurrentSlide(),
            slide= null,
            curSlide= null,
            elementsToCleanUp= [];
        
        if(!_conf.presentationStarted)
            return false;
        
        // let' clean the previos timeout, if any
        if(previousSlide._timer){
            _w.clearTimeout(previousSlide._timer);
            previousSlide._timer= false;
        }
        
        if(previousSlide.last && prevent == 'next'){
            _triggerEvent('onfinish');
            return false;
        }
        if(previousSlide.first && prevent == 'prev'){
            return false;
        }
        
        if(_getValidSlides().length == 0){
            _triggerEvent('onfinish');
            console.error("[PPW] Invalid slides definition: There are no valid slides to show!");
            return false;
        }

        if(isNum(idx)){
            
            slide= _settings.slides[_conf.currentSlide];
            
            // if it is negative or not valid, goes to the first slide
            if(idx < 0)
                idx= 0;
            
            if(!_isValidProfile(_settings.slides[idx])){
                if(prevent == 'prev'){
                    _goPreviousSlide();
                }else{
                    _goToSlide(_getNextValidSlide(_settings.slides[idx]));
                }
                return false;
            }
            
        }else{
            if(!idx || !idx.index){
                idx= _getValidSlides();
                idx= idx[idx.length-1];
            }
            slide= idx;
            idx= slide.index-1;
        }
        
        _conf.currentSlide= idx;
        curSlide= _settings.slides[_conf.currentSlide];
        
        if(!curSlide){
            _triggerEvent('onfinish');
            return false;
        }
        
        _setHistoryStateTo(idx);
        
        _setSlideClasses(idx);
        
        // triggers the events
        if(!prevent){
            _triggerEvent('ongoto', {
                previous: previousSlide,
                current: _settings.slides[_conf.currentSlide]
            });
        }else{
            if(prevent == 'prev'){
                _triggerEvent('onprev', {
                    previous: previousSlide,
                    current: curSlide
                });
            }else{
                _triggerEvent('onnext', {
                    previous: previousSlide,
                    current: curSlide
                });
            }
        }
        
        // if the slide is of a different type
        if(previousSlide && previousSlide.type != curSlide.type)
            _triggerEvent('onslidetypechange', {
                previous: previousSlide,
                current: curSlide
            });
        
        // default event for slidechange
        _triggerEvent('onslidechange', {
            previous: previousSlide,
            current: curSlide
        });
        
        // rests the current action for the slide
        _settings.slides[_conf.currentSlide].actionIdx = 0;
        
        // remove animated classes to fix the issue #1
        elementsToCleanUp= $(curSlide.el).find('.animated');
        elementsToCleanUp.each(function(){
            _removeAnimateCSSClasses(this);
        });
        
        // if the slide has actions and the first one has a timing definition
        if(curSlide.actions[0] && curSlide.actions[0].timing != 'click'){
            if(curSlide.actions[0].timing == 'auto'){
                _goNextSlide();
            }else if(!isNaN(curSlide.actions[0].timing)){
                _settings.slides[_conf.currentSlide]._timer= setTimeout(function(){
                    _goNextSlide();
                }, curSlide.actions[0].timing);
            }
        }
    };
    
    /**
     * Sets the history state.
     * 
     * Adds the current slide identifier to the history.
     * Also changes it in the address bar.
     */
    var _setHistoryStateTo= function(idx){
        
        idx= !_settings.friendlyURL || _settings.friendlyURL == 'num'?
                idx:
                _settings.slides[idx].id;
            
        if(_l.hash != _settings.hashSeparator+idx){
            _h.pushState({}, idx, _settings.hashSeparator+idx);
            _d.title= idx;
        }
        
    };
    
    /**
     * Sets the classes for the slides.
     * 
     * This method applies the correct css classes to each slide(defined as
     * section html elements in DOM).
     */
    var _setSlideClasses= function(idx){
        
        var id= 0;
        
        if(!idx)
            idx= _conf.currentSlide;
        
        // setting the active slide class
        $(_d.querySelector("."+_conf.cons.CLASS_ACTIVE_SLIDE))
            .removeClass(_conf.cons.CLASS_ACTIVE_SLIDE);
        $('#'+_settings.slides[idx].id).addClass(_conf.cons.CLASS_ACTIVE_SLIDE);
        
        // setting the previous slide class
        $(_d.querySelector("."+_conf.cons.CLASS_PREVIOUS_SLIDE))
            .removeClass(_conf.cons.CLASS_PREVIOUS_SLIDE);
            
        id= idx;
        do{
            id--;
        }while(_settings.slides[id] && !_isValidProfile(_settings.slides[id]));
        
        if(_settings.slides[id])
            $('#'+_settings.slides[id].id).addClass(_conf.cons.CLASS_PREVIOUS_SLIDE);
        
        
        // setting the next slide class
        $(_d.querySelector("."+_conf.cons.CLASS_NEXT_SLIDE))
            .removeClass(_conf.cons.CLASS_NEXT_SLIDE);
        
        id= idx;
        do{
            id++;
        }while(_settings.slides[id] && !_isValidProfile(_settings.slides[id]));
        
        if(_settings.slides[id])
            $('#'+_settings.slides[id].id).addClass(_conf.cons.CLASS_NEXT_SLIDE);
    };
    
    var _removeAnimateCSSClasses= function(el){
        
        if(el.length)
            el= el[0];
        
        el.className= el.className.replace(/ppw\-anim\-([a-zA-z0-9\-_]+)( |$)/g,
                                           '');
        return el;
    }
    
    /**
     * Animates elements using the animate.css library.
     * 
     * These animations are purely CSS3.
     * The user has more control of animations when using the jquery.animate
     * method.
     * 
     * @param Element The element to be animater.
     * @param String The animation name.
     * @param Object Settings[optional]
     */
    var _animate= function(el, anim, settings){
        
        el= $(el);
        
        if(_conf.animations.indexOf(anim)>=0){
            if(settings){
                if(settings.duration){
                    el.css({
                        'webkitAnimationDuration': settings.duration,
                        'mozAnimationDuration'   : settings.duration,
                        'msAnimationDuration'    : settings.duration,
                        'oAnimationDuration'     : settings.duration,
                        'animationDuration'      : settings.duration
                    });
                }
                if(settings.delay){
                    el.css({
                        'webkitAnimationDelay': settings.delay,
                        'mozAnimationDelay'   : settings.delay,
                        'msAnimationDelay'    : settings.delay,
                        'oAnimationDelay'     : settings.delay,
                        'animationDelay'      : settings.delay
                    });
                }
                if(settings.count){
                    el.css({
                        'webkitAnimationIterationCount': settings.count,
                        'mozAnimationIterationCount'   : settings.count,
                        'msAnimationIterationCount'    : settings.count,
                        'oAnimationIterationCount'     : settings.count,
                        'animationiterationcount'      : settings.count
                    });
                }
                if(settings.onstart && typeof settings.onstart == 'function'){
                    el.one('webkitAnimationStart', settings.onstart);
                    el.one('msAnimationStart', settings.onstart);
                    el.one('oAnimationStart', settings.onstart);
                    el.one('animationstart', settings.onstart);
                }
                if(settings.onend && typeof settings.onend == 'function'){
                    el.one('webkitAnimationEnd', settings.onend);
                    el.one('mozAnimationEnd', settings.onend);
                    el.one('msAnimationEnd', settings.onend);
                    el.one('oAnimationEnd', settings.onend);
                    el.one('animationend', settings.onend);
                }
            }
            
            _removeAnimateCSSClasses(el[0]);
            
            el.removeClass(anim).addClass('animated ppw-anim-visible ppw-anim-'+
                                           anim);
            
        }else{
            throw new Error("Invalid animation "+anim);
            return false;
        }
    };
    
    /**************************************************
     *                GETTERS/SETTERS                 *
     **************************************************/
    /**
     * Returns the list os slide objects.
     */
    var _getSlides= function(){
        return _settings.slides;
    };
    
    /**
     * Retrieves the current slide object.
     */
    var _getCurrentSlide= function(){
        return _settings.slides[_conf.currentSlide];
    };
    
    /**
     * Returns the array with the "alert at" times.
     */
    var _getAlertAtTimes= function(){
        return _settings.alertAt;
    };
    
    /**
     * Returns the timestamp when the presentation started, or false.
     */
    var _getStartedAt= function(){
        return _conf.presentationStarted;
    };
    
    var _get= function(key){
        return _settings[key]||false;
    };
    
    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    var _constructor= function(){
        _createSplashScreen();
        _conf.currentSlide= _getCurrentSlideFromURL();
        _goToSlide(_conf.currentSlide);
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
        goNextSlide                     : _goNextSlide,
        goPreviousSlide                 : _goPreviousSlide,
        testAudio                       : _testAudio,
        extend                          : _extend,
        startCamera                     : _startCamera,
        addListener                     : _addListener,
        removeListener                  : _removeListener,
        triggerPresentationToolLoadEvent: _triggerPresentationToolLoadEvent,
        showConfiguration               : _showConfiguration,
        startPresentation               : _startPresentation,
        addAction                       : _addAction,
        cons                            : _conf.cons,
        showGoToComponent               : _showGoToComponent,
        showSearchBox                   : _showSearchBox,
        showHelp                        : _showHelp,
        animations                      : _conf.animations,
        animate                         : _animate,
        language                        : _conf.currentLang,
        // API GETTERS/SETTERS METHODS
        getSlides                       : _getSlides,
        getValidSlides                  : _getValidSlides,
        getCurrentSlide                 : _getCurrentSlide,
        getAlertAtTimes                 : _getAlertAtTimes,
        getStartedAt                    : _getStartedAt,
        getNextSlide                    : _getNextValidSlide,
        getPrevSlide                    : _getPrevValidSlide,
        get                             : _get
    };
    
})(jQuery, document, console);


(function(){
        // enabling jquery to load multiple scripts
	var getScript = $.getScript;

        $.getScript = function( resources, callback ) {

                if(typeof resources == 'string')
                    resources= [resources];
                var // reference declaration & localization
                length = resources.length, 
                handler = function() { counter++; },
                deferreds = [],
                counter = 0, 
                idx = 0;

                for ( ; idx < length; idx++ ) {
                    deferreds.push(
                            getScript( resources[ idx ], handler )
                    );
                }

                $.when.apply( null, deferreds ).then(function() {
                    callback && callback();
                });
                
        };
        //
})();