/**
 * The PowerPolygon library.
 *
 * This file contains the JavaScript library correspondent to the PowerPolygon
 * basic functionality.
 * Read the full documentation at: http://github.com/braziljs/power-polygon
 *
 * Under MIT Licence.
 *
 * @dependencies jQuery
 *
 * @author Felipe N. Moura <felipenmoura@gmail.com>
 * @namespace PPW
 * @scope Global
 *
 */
window.PPW = (function ($, _d, console){

    "use strict";

    /**************************************************
     *            VALIDATING AND SETING UP            *
     **************************************************/
     // This following instructions will validade the //
     // current environment and configuration.        //
     //                                               //
     // This works quite proceduraly, just executing  //
     // some validations.                             //
     // before Power Polygon starts its job.          //
     /*************************************************/

    /**
     * This work quite proceduraly, just executing some validations
     * before Power Polygon starts its job.
     *
     * First of all, let's check if it has not been already loaded
     */
    if (window.PPW)
        throw new Error("PowerPolygon framework already loaded!");

    /**
     * Now, let's verify if jQuery(the only dependency) is loaded
     */
    if (!$){
       console.warn("[PPW] Dependency required!");
       alert("ERROR:\nMissing dependency:\n    - jQuery");
       window.PPW= {
           init: function(){},
           extend: function(){},
           addAction: function(){},
           addListener: function(){},
           animate: function(){},
           onSlideEnter: function(){},
           onSlideExit: function(){},
           cons: { fs: {} }
       };

       throw new Error("!\n[PPW] The only dependency Power Polygon has is jQuery! Please insert a jQuery script into your page before including ppw.js!\n\n");
    }

    /**
     * Let's check for the console
     */
    if(!window.console){
       // com'on, no console?1 what browser are you using?!
       var fn= function(){return false};
       window.console= {log:fn,warn:fn,error:fn};
    }


    /**
     * We use jQuery to load multiple scripts...
     * As jQuery does not support it by default, we will override the getScript method
     * to support it, as follows.
     */
    (function($){

           var getScript = $.getScript;

           $.getScript = function( resources, callback ) {

                   if(typeof resources == 'string')
                       resources= [resources];
                   var length = resources.length,
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
    })($);

    /**
     * Giving back the $.browser to the jquery lib.
     *
     * The jQuery 1.9.1 removed the browser object, so we add it back.
     */
    if(!$.browser){
        (function(){
            var matched = (function(ua){
                    ua = ua.toLowerCase();

                    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
                            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
                            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
                            /(msie) ([\w.]+)/.exec( ua ) ||
                            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
                            [];

                    return {
                            browser: match[ 1 ] || "",
                            version: match[ 2 ] || "0"
                    };
                })( navigator.userAgent );
            var browser = {};

            if ( matched.browser ) {
                    browser[ matched.browser ] = true;
                    browser.version = matched.version;
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if ( browser.chrome ) {
                    browser.webkit = true;
            } else if ( browser.webkit ) {
                    browser.safari = true;
            }
            jQuery.browser= $.browser= browser;
        })();
    }

    /* END VALIDATING AND SETTING UP */

    /**************************************************
     *                PRIVATE VARIABLES               *
     **************************************************/
     // The following variables are used internaly.   //
     // These variables can be exposed afterwards.    //
     //                                               //
     // Variables starting with _ shoulr represent    //
     // these private variables                       //
     /*************************************************/

    var _self = this,
        _version= '2.0.0',
        _tmp= {},
        // The list of addons that extended Power Polygon.
        _extended= {},

        // internal configuration properties
        _conf= {
            mode: 'presentation',
            loadSteps: 0,
            curLoaded: 0,
            showingCamera: false,
            showingMessage: false,
            remoteControl: false,
            messagesQueue: [],
            preloadedSlidesCounter: 0,
            cameraLoaded: false,
            isMobile: false,
            presentationTool: null,
            currentLang: 'en',
            profiles: {},
            slidesLoaded: false,
            themeLoaded: false,
            fontSize: 100,
            testingResolution: false,
            currentZoom: 1,
            currentRotate: 0,
            locked: false,
            zoomMax: 40,
            currentSlide: 0,
            presentationStarted: false,
            inThumbsMode: false,
            defaultRemoteServer: location.protocol +'//'+ location.host, // TODO: create and release the service online

            // a default css format
            prevStyle: {
                margin: '0px',
                padding: '0px',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '0px',
                left: '0px'
            },

            toolbarIcons: {
                v: [],
                h: []
            },

            // all the animation
            animations: [
                         // enphasys
                         "flash",
                         "shake",
                         "bounce",
                         "tada",
                         "swing",
                         "wobble",
                         "wiggle",
                         "pulse",
                         "flip",
                         // entrance
                         "flipInX",
                         "flipInY",
                         "fadeIn",
                         "fadeInUp",
                         "fadeInDown",
                         "fadeInLeft",
                         "fadeInRight",
                         "fadeInUpBig",
                         "fadeInDownBig",
                         "fadeInLeftBig",
                         "fadeInRightBig",
                         "bounceIn",
                         "bounceInDown",
                         "bounceInUp",
                         "bounceInLeft",
                         "bounceInRight",
                         "rotateIn",
                         "rotateInDownLeft",
                         "rotateInDownRight",
                         "rotateInUpLeft",
                         "rotateInUpRight",
                         "lightSpeedIn",
                         "rollIn",
                         // exiting
                         "flipOutX",
                         "flipOutY",
                         "fadeOut",
                         "fadeOutUp",
                         "fadeOutDown",
                         "fadeOutLeft",
                         "fadeOutRight",
                         "fadeOutUpBig",
                         "fadeOutDownBig",
                         "fadeOutLeftBig",
                         "fadeOutRightBig",
                         "bounceOut",
                         "bounceOutDown",
                         "bounceOutUp",
                         "bounceOutLeft",
                         "bounceOutRight",
                         "rotateOut",
                         "rotateOutDownLeft",
                         "rotateOutDownRight",
                         "rotateOutUpLeft",
                         "rotateOutUpRight",
                         "lightSpeedOut",
                         "hinge",
                         "rollOut"],

            // default values to some properties and variables
            defaults: {
                duration: 50,
                alertAt: [30, 40],
                theme: 'thm-default',
                transition: 'trans-slider',
                directionalIconsStyle: 'chevron',
                slideType: 'content',
                slideTitleSize: 40,
                containerID: 'ppw-slides-container'
            },

            // constant values and names for css classes and patterns
            cons: {
                CLASS_SLIDE               : 'ppw-slide-element',
                CLASS_ACTIVE_SLIDE        : 'ppw-active-slide-element',
                CLASS_ACTIVE_SLIDE_CONT   : 'ppw-active-slide-element-container',
                CLASS_PREVIOUS_SLIDE      : 'ppw-previous-slide-element',
                CLASS_PREVIOUS_SLIDE_CONT : 'ppw-previous-slide-element-container',
                CLASS_NEXT_SLIDE          : 'ppw-next-slide-element',
                CLASS_NEXT_SLIDE_CONT     : 'ppw-next-slide-element-container',
                CLASS_FULLSCREEN          : 'ppw-fullscreen',
                FOCUSABLE_ELEMENT         : 'ppw-focusable',
                CLICKABLE_ELEMENT         : 'ppw-clickable',

                /**
                 * used for the fsPattern settings
                 * %id    = slide identifier
                 * %num   = slide number
                 */
                fs: {
                    SLIDE_ID_DIR          : 'slides/%id/index.html',
                    SLIDE_ID_DIR_ID       : 'slides/%id/%id.html', // default
                    SLIDE_ID_FILES        : 'slides/%id.html',
                    SLIDE_ID_MIXED        : '%id.html',
                    SLIDE_NUM_DIR         : 'slides/%num/index.html',
                    SLIDE_NUM_FILES       : 'slides/%num.html',
                    SLIDE_NUM_MIXED       : '%num.html'
                }
            }
        },

        // all the templates to created elements and tools
        _templates= {
            // the help content
            help: "<h3>Help</h3>\
                  Website: <a href='http://powerpolygon.com' target='_blank'>powerpolygon.com</a><br/>\
                  Forum/Discussion group: <a href='https://groups.google.com/forum/#!forum/powerpolygon' target='_blank'>forum/powerpolygon</a><br/>\
                  Documentation: <a href='https://github.com/braziljs/power-polygon/wiki' target='_blank'>wiki</a><br/>\
                  Fork me: <a href='https://github.com/braziljs/power-polygon' target='_blank'>Github</a><br/>\
                  <br/><br/>\
                  <b>Shortcuts</b><br/>\
                  ALT: Go to slide<br/>\
                  ALT+F: Search into slides<br/>\
                  ALT+Space: Show slides thumbnails<br/>\
                  : Applies zoom in and out<br/>\
                  F6, F7, F8, F9, F10: Custom",

            // the loading element
            loading: "<div id='ppw-lock-loading' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background: #dadada url(/ppw/_images/ppw-gray-bg.png); padding: 10px; font-family: Arial; z-index: 999999999;'>\
                            <div class='ppw-loadingbarContainer' style='width: 264px; margin: auto; text-align: center; margin-top: 60px; font-family: sans-serif, arial, tahoma !important; font-size: 16px !important;'><span>Loading Power Polygon</span><br/><div id='ppw-loadingbarParent'><div/><div id='ppw-loadingbar'><div/></div></div>",

            // content for the not found slides
            slideNotFound:  "<h4 style='font-size: 22px;'>Failed loading slide <span class='ppw-slide-fail'>{{slideid}}</span>!</h4>\
                            <div class='ppw-slide-fail-help' style='font-size:13px;'>Please verify the slide id.<br/>Power Polygon looks for the slide's content following these rules:<br/>\
                            <br/>* A section element on the page, with the given id:<br/>Eg.: &lt;section id='{{slideid}}'>Your content&lt;/section><br/>\
                            <br/>* A file in the fsPattern location.<br/>Currently looking at: <span class='ppw-slide-fail'>{{addr}}</span><br/><br/>\
                            The content could not be found in any of these expected places!</div>",

            // the arrows element to go forward and backward
            arrows: "<div id='ppw-arrows-container' class='ppw-clickable'><div id='ppw-arrow-previous-slide' onmousedown='if(!PPW.isLocked()) PPW.goPrev();'><i class='icon-{{directionaliconsstyle}}-left'></i></div><div id='ppw-arrow-next-slide' onmousedown='if(!PPW.isLocked()) PPW.goNext();'><i class='icon-{{directionaliconsstyle}}-right'></i></div></div>",

            // the search tool content
            searchTool: "<div id='ppw-search-container'><div style='float: left;'>Search into slides:</div>\
                         <div style='float: right;'><input type='search' id='ppw-search-slide' value='' placeholder='Search' />\
                         <div id='ppw-search-arrow-container' class='ppw-clickable'><div id='ppw-search-prev' class='ppw-clickable' title='Find in previous slides(shift+enter)'><i class='icon-{{directionaliconsstyle}}-left'></i></div><div id='ppw-search-next' class='ppw-clickable' title='Find in next slides(enter)'><i class='icon-{{directionaliconsstyle}}-right'></i></div></div></div><div id='ppw-search-found' class='ppw-clickable'></div></div>",

            // the message box element itself
            messages: '<div id="ppw-message-box"  class="ppw-clickable ppw-platform">\
                        <div id="ppw-message-content" class="ppw-clickable"></div>\
                        <div id="ppw-message-box-ok-button" class="ppw-clickable">\
                            <input type="button" id="ppw-message-box-button" value="Close" />\
                        </div>\
                      </div>',

            // camera/video placeholder element
            camera: '<div id="ppw-camera-tool" class="ppw-clickable" onselectstart="return false">\
                        <div id="ppw-camera-tool-resize"></div>\
                        <div id="ppw-video-container">\
                            <video id="ppw-video-element" autoplay="autoplay" class="ppw-clickable" onselectstart="return false"></video>\
                            <div id="ppw-camera-hide-trigger" class="ppw-clickable"></div>\
                        </div>\
                      </div>',

            // the top-left toolbar content
            toolBar: '<div id="ppw-toolbar-container" class="ppw-platform ppw-clickable" onselectstart="return false;">\
                        <div id="ppw-toolbar-trigger-btn" class="ppw-clickable"><span></span></div>\
                        <div id="ppw-toolbar-v" class="ppw-platform {{clickableClass}}"></div>\
                        <div id="ppw-toolbar-h" class="ppw-platform {{clickableClass}}"></div>\
                        <div id="ppw-message-panel" class="ppw-platform {{clickableClass}}"><div class="title"><span></span></div><div id="ppw-panel-content"></div></div>\
                      </div>',

            // the settings form content
            settings: "<form id='ppw-settings-form'>\
                    <label>Enable shortcuts: </label><input type='checkbox' id='ppw-shortcutsEnable' {{shortcuts}} /><br/>\
                    <label>Duration: </label><input type='number' id='ppw-talk-duration' value='{{duration}}' /><br/>\
                    <label>Alert at: </label><input type='string' id='ppw-alert-at' value='{{alerts}}'placeholder='Comma separated minutes' /><br/>\
                    <div id='ppw-profile-config'><label>Profile: </label><select id='ppw-profile-option'></select></div><br/>\
                    <div id='ppw-languages-config'><label>Language: </label><select id='ppw-language-option'></select></div><br/>\
                    <div id='ppw-settings-extra-data' class='ppw-selectable' ></div>\
              </form>"
        },

        // user defined settings...the following values come by default if the user did not set them
        _settings= {
            // wondering the talk is in /talks/talkname for example
            PPWSrc: '',
            // the separator to be used on the address bar
            hashSeparator: '#',
            // a path, given after the slide identification on the url(#!articles/article for example)
            currentPath: '',
            // enables or not, the shortcuts
            shortcutsEnable: true,
            // may be false(also, 'num') or id(slide's id)
            friendlyURL: 'id',
            // should ppw open the splash screen first?
            useSplashScreen: true,
            // the slides container to be appended to the body
            slidesContainer: _d.createElement('div'),
            // the default theme
            theme: _conf.defaults.theme,
            // the default transition
            transition: _conf.defaults.transition,
            // the default directionalIconsStyle
            directionalIconsStyle: _conf.defaults.directionalIconsStyle,
            // the pattern to find the external slides
            fsPattern: _conf.cons.fs.SLIDE_ID_DIR_ID,
            // times in minutes to be alerted
            alertAt: _conf.defaults.alertAt,
            // the duration of the talk
            duration: _conf.defaults.duration,
            // enables the toolbar
            useToolBar: true,
            // battery support only working on Firefox Nightly by now
            showBatteryAlerts: true,
            // show the alerts of "offline browser" if supported
            showOfflineAlerts: true,
            // Enables the arrows to go previous and next slides
            useArrows: false,
            // When using arrows, this means that ONLY the arrows will go next and previous
            useOnlyArrows: false,
            // allows slides to be cached
            slidesCache: true,
            // preloads the images before starting the presentation
            preloadImages: false,
            // talk's profile
            profile: 'none',
            // removes any zooming or rotating effect on slide change.
            fixTransformsOnSlideChange: true,
            // enables/disables the zoom effect when scrolling
            zoomOnScroll: true,
            // not working properly because no browser support 100% of this by now
            // should control how many slides are printed per page.
            slidesPerPage: 1,
            /* shows:
             *   0/false: no messages
             *   1: errors
             *   2: errors and warnings
             *   3: only logs
             *   9: errors, warnings and logs
             */
            verbose: 9,
            // sets the talk to use remote control
            remote: true,
            // in case you want to change the zoom effect to be applied to a different element
            // might be useful for addon or theme developers.
            applyZoomTo: false,
            // enables the Facebook Buttons
            Facebook: true,
            // enables the g+ buttons
            Google: true,
            // tries to fix any scrolling the browser does due to elements
            // with the same id as the hash, in case the hash is just based on #
            fixAnchorScroll: true
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
        _w= window,
        _c= {}; // cached DOM elements

    /**
     * Available event listeners.
     *
     * These events are triggered by the _triggerEvent method.
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
        onresize                : [],
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
        onshowthumbs            : [],
        onbeforeshowthumbs      : [],
        onhidethumbs            : [],
        onlock                  : [],
        onunlock                : [],
        onlangchange            : [],
        onextend                : [],
        toolbarClose            : [],
        toolbarOpen             : [],
        F10_PRESSED             : [],
        F9_PRESSED              : [],
        F8_PRESSED              : [],
        F7_PRESSED              : [],
        F6_PRESSED              : [],
        ESC_PRESSED             : []
    }


    /**************************************************
     *                PRIVATE METHODS                 *
     **************************************************/
     // Below, you will see the private methods.      //
     // These methods can be exposed afterwards. They //
     // are used internally, or, when exposed, by the //
     // Power Polygon API                             //
     /*************************************************/

    /**
     * This method allows addons to create their own event listeners and trigger them.
     *
     * @param String The listener name.
     */
    var _createListener= function(listener){

        if(!listener){
            console.warn("[PPW] To create a listener, the parameter with its name must be given.");
            return false;
        }

        if(!_listeners[listener]){
            _listeners[listener]= [];
            _listeners[listener].createdByExtensionId= this.extensionId;
        }else{
            console.warn("[PPW] Extension '"+this.extensionId+"' is trying to create an existing event listener("+listener+")");
        }
    }

    /**
     * Adds an event listener to PPW.
     *
     * Used by addons or external scripts, as well as internal methods calls.
     *
     * @param String The event identifier.
     * @param Function The function to be triggered by the event.
     */
    var _addListener= function(evt, fn){
        if(_listeners[evt]){
            _listeners[evt].push(fn);
        }
    }

    /**
     * Just prevents the propagation and default action from an event.
     */
    var _preventDefaultstopPropagation= function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        return false;
    }

    /**
     * Removes a listener from the list.
     *
     * @param String The event identifier.
     * @param Function The function to be removed.
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
     * verifies if the value is a number or not.
     *
     * @param Mixed The variable to be evaluated.
     */
    var isNum= function(val){
        return !isNaN(val);
    }

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
                console.warn("[PPW][Event Callback error]: ", e.message, e);
            }
        }
    }

    /**
     * Extends the PPW object.
     *
     * Used by addons to register themselves and then, to
     * be able to receive events and the presentation data.
     *
     * @param String The addon's identification
     * @param Object The configuration for the addon
     *
     */
    var _extend= function(id, conf){
        var prop= null;

        _extended[id]= conf;

        for(prop in conf){
            if(_listeners[prop] && typeof conf[prop] == 'function'){
                _addListener(prop, conf[prop]);
            }
        }

        if(conf.onextend && typeof conf.onextend == 'function'){
            try{
                // add here, other useful features for addons
                conf.onextend($.extend({}, _settings, {
                    createListener: _createListener,
                    extensionId   : id,
                    triggerEvent  : _triggerEvent
                }));
            }catch(e){
                console.warn("[PPW] Addon error: failed executing the onextend listener for "+id, conf, e);
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
     * Tries to auto generate a config object from the document structure.
     *
     * All the sections will be treated as slides.
     * The document title will be treated as he talk title.
     * First section will be the openning slide.
     * Last section will be the closing slide.
     * All the other sections will be of type "content".
     *
     * @param Object The given partial settings
     */
    var _autoGenerateConfig= function(conf){
        var o= {
                title: _d.title,
                authors: [],
                transition: _conf.defaults.transition,
                directionalIconsStyle: _conf.defaults.directionalIconsStyle,
                theme: _conf.defaults.theme
            },
            i= 0,
            l= 0,
            slideList= [];

        if(conf){
            o= $.extend(o, conf);
        }

        o.slides= [];
        slideList= $('body>section');
        l= slideList.length-1;
        slideList.each(function(){

            if(!this.id)
                this.id= "slide-"+i;

            o.slides.push({
                type: (i===0)? 'opening': (i==l)? 'closing': 'content',
                id: this.id
            });
            i++;
        });

        return o;
    };

    /**
     * Verifies whether the presentation is in printable version or not.
     *
     * The presentation is in printable version if it is running on another
     * windows, with the ppw-printing-version=true variable set on its url.
     */
    var _isInPrintableVersion= function(){
        return _l.href.indexOf('ppw-printing-version=true')>=0;
    }

    /**
     * Method called by the user to define the presentation settings.
     *
     * @param Mixed The object with the settings information, or the address of the manifest.json file.
     */
    var _init= function(conf){

        if(!$){
            return false;
        }

        if(typeof conf != 'object'){

            // conf was not sent
            if(!conf){
                _init(_autoGenerateConfig());
                return;
            }

            // conf is a string, therefore, the address of the manifest
            $.ajax({
                url: conf,
                dataType: 'json',
                success: function(xhr, data, ret){
                    _init(xhr);
                },
                error: function(xhr, data, ret){
                    alert('[PPW] Error loading the init() configuration manifest!\nThere must be an erron on the json or the file was not found!\nCheck the console for more details.');
                    console.error("[PPW] Error loading the init() configuration manifest! ", xhr, data, ret, "Please, verify if your json has no single quoted properties or if there is any comment on it!")
                }
            });
            return;
        }

        // conf was sent, but with no slides
        if(!conf.slides){
            _init(_autoGenerateConfig(conf));
            return;
        }

        $.extend(_settings, conf);
        _settings.canonic= _l.pathname
                             .replace(/(\?|\&).*/, '')
                             .replace(/(\/index\.[a-zA-Z0-9]*)|(\/$)/, '')
                             .replace(/\ /ig, '-')
                             .split('/')
                             .pop();


       /** 0/false: no messages
        *   1: errors
        *   2: errors and warnings
        *   3: only logs
        *   9: errors, warnings and logs
        */
        switch(_settings.verbose){
            case 0:
            case false: {
                console.log= function(){};
                console.warn= function(){};
                console.error= function(){};
                break;
            }
            case 1: {
                console.log= function(){};
                console.warn= function(){};
                break;
            }
            case 2: {
                console.log= function(){};
                break;
            }
            case 3: {
                console.warn= function(){};
                console.error= function(){};
                break;
            }
        }

        if(_settings.mode){
            _applyGlobalMode(_settings.mode);
        }

        if(_settings.shortcutsEnable && !_isInPrintableVersion()){
            _enableFuncKeys();
        }

        _triggerEvent('onload', conf);
    };

    /**
     * Applies a global mode of interaction to Power Polygon.
     *
     * It applies some rules to make Power Polygon behave differently as
     * your need.
     * For example, the default behaviour is 'presentation', for a talk, but
     * if you use 'page', PPW will apply a bunch of rules to make it feel like
     * a web page.
     */
    var _applyGlobalMode= function(mode){

        switch(mode){
            case 'page': {
                _settings.hashSeparator= '#!';
                _settings.remote= false;
                _settings.usetToolBar= false;
                _settings.useSplashScreen= false;
                _settings.useGlobalFooter= true;
                _settings.mode= 'page';
                break;
            }
        }

    }
    /**
     * Sets one step ahead for the loading bar.
     *
     * This method is used internaly only, before the splash screen.
     */
    var _setLoadingBarStatus= function(msg){

        _conf.curLoaded++;
        var perc= _conf.curLoaded * 100 / _conf.loadSteps;

        if(perc >= 100)
            perc= 100;

        $('#ppw-loadingbar').css({width: perc+'%'});

        if(msg)
            console.log("[PPW] Loaded: ", msg);

        if(perc >= 100){

            _triggerEvent('onthemeloaded', _settings.themeSettings);

            if(_settings.preloadImages >> _settings.useSplashScreen){

                setTimeout(function(){
                    $('#ppw-lock-loading').find('span').eq(0).html('Loading images...');

                    _preloadSlides(function(){
                        _startPreLoadingImages($('#ppw-loadingbar').stop()
                                                                   .css('width', '1%'));
                    });

                }, 400);
            }else{
                if(_settings.useSplashScreen)
                    $('#ppw-lock-loading').fadeOut();
                else
                    _preloadSlides(function(){$('#ppw-lock-loading').fadeOut();});
            }
        }
    };

    /**
     * Returns the value of the given param in the URL.
     * @return Mixed Empty array, or
     */
    var _querystring= function(key) {

        var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi'),
            r=[], m;

        while ((m=re.exec(_l.search)) != null) r.push(m[1]);
        return r.length? r[0]: false;
    }

    /**
     * Creates a path to a file in the PPWSrc folder.
     *
     * @param String Location of the file within the PPWSrc folder.
     */
    var _createPPWSrcPath= function(filepath){
        var PPWSrc= _settings.PPWSrc;
        if(!PPWSrc){
            var parentpath= '../';
            var ppw= 'ppw.js';
            var src= null;
            var scripts= _d.getElementsByTagName('script');
            var l= scripts.length;
            for(var i=0;i<l;i++){
                src= scripts[i].src.split('/');
                if(src.pop() == ppw){
                    break;
                }
            }
            var uri= _d.location.href.split('/').slice(0, -1);
            l= src.length;
            for(var i=0;i<l;i++){
                if(src[i] !== uri[i]){
                    break;
                }
            }
            PPWSrc= src.splice(i).join('/')+'/'+filepath;
            l= uri.length-i;
            for(var i=0;i<l;i++){
                PPWSrc= parentpath+PPWSrc;
            }
            _settings.PPWSrc= PPWSrc.replace(filepath, '');
        }else{
            PPWSrc= _settings.PPWSrc+'/'+filepath;
        }
        return PPWSrc.replace(/\/\//g, '/');
    }

    /**
     * Alias to _createPPWSrcPath('').
     */
    var _getPPWPath= function(){
        return _createPPWSrcPath('');
    }

    /**
     * Loads an external script.
     *
     * @param String External script file.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function Callback to be executed when the script is loaded.
     */
    var _loadScript= function(src, loadStep, fn){
        if(loadStep){
            _conf.loadSteps++;
        }
        $.getScript(src, fn||function(){});
    };

    /**
     * Loads an array of external script.
     *
     * @param Array External script files.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function/String The string to be executed or a function callback
     */
    var _loadScripts= function(scripts, loadStep, fn){
        var l= scripts.length;
        for(var i=0;i<l;i++){
            _loadScript(_createPPWSrcPath(scripts[i]), loadStep, fn);
        }
    }

    /**
     * Loads external scripts of a theme.
     *
     * @param String The name of the theme.
     * @param Array External script files of the theme.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function Callback to be executed when the script is loaded.
     */
    var _loadThemeScripts= function(theme, scripts, loadStep, fn){
        var l= scripts.length;
        for(var i=0;i<l;i++){
            _loadScript(_createPPWSrcPath('/_themes/'+ theme+'/'+scripts[i]), loadStep, fn);
        }
    };

    /**
     * Loads a css file to the head element of the page.
     *
     * @param String CSS file source.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function/String The string to be executed or a function callback
     * @param Boolean Whether or not to bind the function callback
     */
    var _loadStyle= function(src, loadStep, fn, bind){

        if(loadStep){
            _conf.loadSteps++;
        }

        if(bind){
            $("head").append($("<link rel='stylesheet' href='"+src
                             +"' type='text/css' media='screen' />")
                            .bind('load', fn));
        }else{
            $("<link/>", {
                rel: "stylesheet",
                type: "text/css",
                href: src,
                onload: fn
            }).appendTo("head");
        }

        if(_conf.isMobile){
            // mobile devices do not trigger the load event from links :/
            // this is the uggly workaround for that!
            var img = _d.createElement('img');
            img.onerror = function(){
                try{
                    if(bind){
                        fn();
                    }else{
                        fn= new Function(fn);
                        fn();
                    }
                }catch(e){
                    console.warn("[PPW] Error executing callback!", fn, e.message, e);
                };
                img= null;
            }
            img.src = src;
        }
    };

    /**
     * Loads an array of css files to the head element of the page.
     *
     * @param Array CSS files.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function/String The string to be executed or a function callback
     */
    var _loadStyles= function(styles, loadStep, fn){
        var l= styles.length;
        for(var i=0;i<l;i++){
            _loadStyle(_createPPWSrcPath(styles[i]), loadStep, fn, false);
        }
    }

    /**
     * Loads the css files of a theme to the head element of the page.
     *
     * @param String The name of the theme.
     * @param Array CSS files of the theme.
     * @param Boolean Whether or not to add a loadStep.
     * @param Function/String The string to be executed or a function callback
     */
    var _loadThemeStyles= function(theme, styles, loadStep, fn){
        var l= styles.length;
        for(var i=0;i<l;i++){
            _loadStyle(_createPPWSrcPath('/_themes/'+theme+'/'+styles[i]), loadStep, fn, true);
        }
    }

    /**
     * Loads the theme's files.
     *
     * This method loads the theme' manifes.json file, and then, its
     * dependencies.
     */
    var _loadTheme= function(){

        var theme= null,
            transition= _querystring('transition'),
            directionalIconsStyle= _querystring('directionalIconsStyle');

        if(typeof _settings.theme == 'string')
            _settings.theme= _settings.theme.replace(/ /g, '').split(',');

        if(transition){
            _settings.transition= transition;
        }

        if(_settings.transition)
            _settings.theme.push(_settings.transition);

        if(directionalIconsStyle){
            _settings.directionalIconsStyle= directionalIconsStyle;
        }

        _conf.loadSteps+= _settings.theme.length;

        $(_settings.theme).each(function(){
            var theme= this.toString();
            $.getJSON(_createPPWSrcPath('/_themes/'+theme+'/manifest.json'), function(data, status){

                var dependencies= false;

                console.log("[PPW] Loading theme: "+ theme);

                if(status == 'success'){

                    _conf.themeData= data;
                    dependencies= _conf.themeData.dependencies||[];

                    if(dependencies.css){
                        _loadThemeStyles(theme, dependencies.css, true, function(){ _setLoadingBarStatus("theme dependencies(css)"); });
                    }

                    if(dependencies.js){
                        _loadThemeScripts(theme, dependencies.js, true, function(data, status, xhr){ _setLoadingBarStatus("theme dependencies(js)"); });
                    }

                }else{
                    console.error("[PPW][Theme data] Could not load manifest.json! Theme: " + theme);
                }
                _setLoadingBarStatus("theme");
            });
        });
    };

    /**
     * Shows the next and previous arrow buttons.
     */
    var _showArrows= function(){
        $('#ppw-arrow-previous-slide, #ppw-arrow-next-slide').show();
    }

    /**
     * Hides the next and previous arrow buttons.
     */
    var _hideArrows= function(){
        $('#ppw-arrow-previous-slide, #ppw-arrow-next-slide').hide();
    }

    /**
     * Prepares the page to load the required files.
     *
     * This method adds the loading bar and then loads the required scrips and
     * styles.
     */
    var _preparePPW= function(){

         $b.append(_templates.loading);
         $b.append(_templates.arrows.replace(/\{\{directionaliconsstyle\}\}/g, _settings.directionalIconsStyle));

         if(_settings.useArrows){
            _showArrows();
         }else{
             _hideArrows();
         }

         $('#ppw-loadingbarParent').css({
             width: '260px',
             height: '8px',
             border: 'solid 1px white',
             boxShadow: '0px 0px 4px black',
             background: 'white',
             orverflow: 'hidden'
         });

         $('#ppw-loadingbar').css({
             width: '1px',
             height: '100%',
             //background: '#f66'
             background: '#55f'
         });

         var styles=["/_styles/ppw.css", "/_styles/animate.css", "/_styles/font-awesome.min.css"];
         _loadStyles(styles, true, "PPW.setLoadingBarStatus()", false);
         //var scripts=["/_scripts/jquery-ui-1.8.23.custom.min.js"];
         //_loadScripts(scripts, true, PPW.setLoadingBarStatus);

         if(_settings.mode != 'page'){
             _tmp.lnk = _d.createElement('link');
            _tmp.lnk.type = 'image/x-icon';
            _tmp.lnk.rel = 'shortcut icon';
            _tmp.lnk.href = _createPPWSrcPath('/_images/power-polygon-icon.png');
            _d.getElementsByTagName('head')[0].appendChild(_tmp.lnk);
            delete _tmp.lnk;
         }

        _loadTheme();
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
    var _setPresentationProfile= function(profile, onload){

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
                $('#'+slide.id).parent().removeClass('ppw-slide-not-in-profile');
            }else{
                $('#'+slide.id).parent().addClass('ppw-slide-not-in-profile');
            }
        }

        if(!onload)
            _pushSetVariable('profile', profile);

    };

    /**
     * Gets the list of valid slides to the current profile.
     *
     */
    var _getValidSlides= function(){
        return _conf.validSlides;
    }

    /**
     * Alias for documentQuerySelectorAll.
     *
     * @param String The query selector.
     */
    var _qsa= function (qs){
        return _d.querySelectorAll(qs);
    }

    /**
     * Alias for documentQuerySelector.
     *
     * @param String The query selector.
     */
    var _qs= function (qs){
        return _d.querySelector(qs);
    }

    /**
     * Takes all the clonable elements and add them to slides, removing them
     * from their original escope.
     *
     * The HTML Element may also have two special classes: ppw-type-content or ppw-type-section
     * Each class defines the clonable element to be cloned only into slides
     * of that type.
     */
    var _applyClonableElements= function(){
        var clonnable= _qsa('.ppw-clonable'),
            i= 0, j= clonnable.length,
            _t= null;

        for(; i<j; i++){

            var clone= clonnable[i],
                _t= $(clone),
                containers= null,
                container= null,
                i= 0,
                oId= null;

            clone.id= clone.id||'ppw-clone';
            oId= clone.id;

            // if slide type specified
            if(_t.hasClass('ppw-type-section')){
                containers= _qsa('.ppw-slide-type-section');
            }else if(_t.hasClass('ppw-type-content')){
                containers= _qsa('.ppw-slide-type-content');
            }else{
                containers= _qsa('.ppw-slide-element');
            }

            for(container in containers){

                if(!containers.hasOwnProperty(container))
                    continue;

                container= containers[container];

                var cont= $(container).find('.ppw-clonable-container'),
                    nClone= null;

                if(!cont.length)
                    continue;

                if(!cont.length)
                    cont= this;
                else{
                    cont= cont[0];
                }

                i++;
                nClone= clone.cloneNode(true);
                nClone.id= oId + '-' + i;

                cont.appendChild(nClone);
            };
        };
        if(_t && _t.length)
            _t.remove();

    };

    /**
     * Adds the headers and footers to the slides.
     *
     * This method adds headers and footers to slides and sets their
     * behaviours and data.
     *
     * If the user has set the useGlobalFooter or useGlobalHeader on the
     * init method, then the footer/header will be global, instead of inside
     * all the slides.
     */
    var _applyHeaderFooter= function(){

        var h= $('header'),
            f= $('footer');

        if(h.length){
            h.addClass('ppw-header-element');
            if(_settings.useGlobalHeader){
                h.addClass('ppw-global');
            }else{
                h[0].removeAttribute('id');
                $('.ppw-slide-type-content').each(function(){
                    $(this).append(h[0].cloneNode(true));
                });
                h.remove();
            }
        }
        if(f.length){
            f.addClass('ppw-footer-element');
            if(_settings.useGlobalFooter){
                f.addClass('ppw-global');
            }else{
                $('.ppw-slide-type-content').each(function(){
                    $(this).append(f[0].cloneNode(true));
                });
                f.remove();
            }
        }
    }

    /**
     * Verifies if the given element is inside a slide or not.
     *
     * @param HTMLElement The element to be verified.
     * @return Mixed The slide section element or false.
     */
    var _elementInSlide= function(el){
        while(!$(el).hasClass('ppw-slide-element') && el.tagName.toUpperCase() != 'HTML'){
            el= el.parentNode;
        }
        if(el.tagName.toUpperCase() == 'SECTION')
            return el;
        else
            return false;
    }

    /**
     * Replaces the var HTMLElements by the PPW variable corresponding to its innerHTML.
     *
     * The variables will be added to the <var> elements as their contents.
     * Global <var> elements(not inside any slide) will be updated automaticaly.
     *
     * The available variables are:
     * - slides.id
     * - slides.idx
     * - slides.number
     * - talk.title
     * - talk.length
     *
     * If a selector is given, it means it is a global element which should be
     * updated as the slides change.
     *
     * @param String|Null The selector, if not given, 'var' will be used.
     */
    var _applyTalkVariables= function(selector){

        $(selector || 'var').each(function(){
            var controller= false, i= 0,
                validSlides= _getValidSlides(),
                slideEl= _elementInSlide(this),
                variable= $(this).data('ppw-variable') || this.innerHTML,
                slide= slideEl? $(slideEl.parentNode).data('ppwSlideRef'):
                                _getCurrentSlide();
            switch(variable){
                case 'slide.id':
                    this.innerHTML= slide.id;
                    if(!slideEl){
                        $(this).addClass('ppw-variable').data('ppw-variable', 'slide.id');
                    }
                    break;
                case 'slide.idx':
                    this.innerHTML= slide.index;
                    if(!slideEl){
                        $(this).addClass('ppw-variable').data('ppw-variable', 'slide.idx');
                    }
                    break;
                case 'time.day':
                    this.innerHTML= (new Date()).getDate();
                    break;
                case 'time.month':
                    this.innerHTML= 1+(new Date()).getMonth();
                    break;
                case 'time.year':
                    this.innerHTML= (new Date()).getFullYear();
                    break;
                case 'time.hour':
                    this.innerHTML= (new Date()).getHours();
                    break;
                case 'time.minute':
                    this.innerHTML= (new Date()).getMinutes();
                    break;
                case 'slide.number':

                    $(validSlides).each(function(){

                        i++;

                        if((this.id === slide.id) >> controller){
                            controller= true;
                            return false;
                        }
                    });

                    // if was one of the valid slides
                    if(controller)
                        this.innerHTML= i;

                    if(!slideEl){
                        $(this).addClass('ppw-variable').data('ppw-variable', 'slide.number');
                    }
                    break;
                case 'talk.title':
                    this.innerHTML= _settings.title;
                    if(!slideEl){
                        $(this).addClass('ppw-variable').data('ppw-variable', 'talk.title');
                    }
                    break;
                case 'talk.length':
                    this.innerHTML= validSlides.length;
                    if(!slideEl){
                        $(this).addClass('ppw-variable').data('ppw-variable', 'talk.length');
                    }
                    break;
            }
        });
    };

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
    var _setLION= function(language, onload){

        var lang= language||_n.language,
            i= 0 || false,
            list= _settings.languages,
            rx= null,
            hL= null;

        if(_conf.currentLang == lang){
            return;
        }

        _conf.currentLang= lang;

        if(list){

            i= list.length-1;

            _removeAnimateCSSClasses();

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

        _b.className= _b.className.replace(/LANG_[a-z]+( |$)/ig, '');
        PPW.language= lang;
        $b.addClass('LANG_'+lang);

        if(!onload){
            _pushSetVariable('lang', lang);
        }

        _triggerEvent('onlangchange');
    }

    /**
     * Pushes the history state setting a variable to the URL.
     *
     * This method will add a variable to the URL(or replace it,
     * in case it was already there) keeping the current hash.
     */
    var _pushSetVariable= function(id, val){
        var rx= new RegExp(id+'\=([a-zA-Z0-9\-_]+)'),
            hL= _l.search.replace(rx, '')
                         .replace(/\?\&/, '?')
                         .replace(/\&\&/, '&')
                         .replace(/\?$/, '');

        hL= hL+ ((hL.indexOf('?')>-1)? '&':'?') + id+'='+val +_l.hash;

        if(_settings.currentPath)
            hL+= _settings.currentPath;
        _pushState(hL);
        //_h.pushState({}, val, hL);
    };

    /**
     * Triggered when the last image is loaded.
     *
     * This method hides the first loading screen when the splash screen
     * is disabled, or hide the loading tool in the splash screen when the
     * images finished loading and the sattings have the property preloadImages
     * equals to true.
     */
    var _imagesPreloadEnd= function(){
        _w.setTimeout(function(){

            if(_settings.useSplashScreen){
                $('#ppw-slides-loader-bar').animate({
                    marginTop: '-61px'
                }, 500);
            }else{
                $('#ppw-lock-loading').fadeOut();
            }

        }, 1000);
    };

    /**
     * Starts and manipulates the image preloading proccess.
     *
     * If the settings preloadImages is true, this method is called to load all
     * the images on slides.
     *
     * @param HTMLElement the loader element to received the percent(default is the splash screen's loader bar).
     */
    var _startPreLoadingImages= function(loadBar){

        var imagesToPreload= $('#ppw-slides-container img'),
            imagesLength= imagesToPreload.length,
            loadedImages= 0,
            tmpImg= null,
            loaderBar= loadBar||$('#ppw-slides-loader-bar-loading-container>div'),
            perc= 0,
            onLoadFn= function(){
                loadedImages++;
                perc= loadedImages * 100 / imagesLength;

                loaderBar.stop().animate({width: perc+'%'}, 60, function(){

                    if(perc == 100 && loadedImages == imagesLength){
                        _imagesPreloadEnd();
                    }
                });
            };

        imagesToPreload.each(function(){
            tmpImg= new Image();
            tmpImg.onload= onLoadFn;
            tmpImg.src= this.src;
        });

        if(!imagesLength){
            _imagesPreloadEnd();
        }
    };

    /**
     * Advances one step in the slides preload bar.
     *
     * @param SlideObject The slided that has just loaded.
     */
    var _slidePreloaderNext= function(loadedSlide){

        var l= _settings.slides.length,
            perc= 0, fn, curBodyStyle;

        _conf.preloadedSlidesCounter++;

        perc= _conf.preloadedSlidesCounter * 100 / l;

        if(_conf.preloadedSlidesCounter === l){
            if(!_settings.preloadImages){
                fn= function(){
                    _w.setTimeout(function(){
                        $('#ppw-slides-loader-bar').stop().animate({
                            marginTop: '61px'
                        }, 500);
                    }, 1000);
                };
            }else{
                fn= function(){
                    $('#ppw-preloader-label').html('Loading images...');
                    $('#ppw-slides-loader-bar-loading-container>div').stop().css('width', '0%');
                    _startPreLoadingImages();
                }
            }
        }

        // for each loaded slide
        _triggerEvent('onslideloaded', loadedSlide);

        if(perc == 100){

            // when all the slides loaded
            _conf.slidesLoaded= true;
            _setPresentationProfile(_querystring('profile')||false, true);
            // set the current language to the loaded slide elements
            _setLION(_querystring('lang')||_settings.defaultLanguage||_n.language, true);
            // setting the header/footer elements
            _applyHeaderFooter();
            //apply presentation variables
            _applyTalkVariables();
            // applying global variable values to variable elements not in slides
            _addListener('onslidechange', function(){
                _settings.currentPath= '';
                _applyTalkVariables('.ppw-variable');
            });

            // triggering the event to all the listeners
            _triggerEvent('onslidesloaded', _settings.slides);

            // TODO: add this to the documentation!
            if(_settings.fixAnchorScroll && _d.getElementById(_l.hash.replace('#', '')) ){
                $(_b).one('scroll', function(){
                    // some browsers will try to scroll the page to the element
                    // that has the same id as the slide...let's avoid it!
                    curBodyStyle= $b.css('overflow');
                    _b.style.overflow= 'auto';
                    _b.scrollTop= 0;
                    if(_b.scrollByPages)
                        _b.scrollByPages(-100);
                    _b.style.overflow= curBodyStyle;
                })

            }


            if(!_settings.useSplashScreen)
                _startPresentation();

            if(_isInPrintableVersion()){
                _preparePrintableVersion();
            }

            $('.ppw-slide-container').click(function(evt){
                if(_conf.inThumbsMode){
                    _goToSlide($(this).data('ppw-slide-ref'));
                    return _preventDefaultstopPropagation(evt);
                }
            });

            $('a').each(function(){

                var l= this.href? this.href.replace(_l.protocol+'//'+_l.host+_l.pathname, ''): '#';
                l= l.replace(/\?.+\#/, '#');
                if(l.substring(0, 1) != '#' && l.substring(0, 11) != 'javascript:'){
                    if(!this.getAttribute('target')){
                        this.setAttribute('target', '_blank');
                    }
                }
            })

        }

        $('#ppw-slides-loader-bar-loading-container>div').stop().animate({
            width: perc+'%'
        }, 100, fn);

    };

    /**
     * Prepares the presentation to be printed.
     */
    var _preparePrintableVersion= function(){
        var slides= _getValidSlides(),
            notVisible= [],
            tmp= null;

        $('#ppw-splash-screen').hide();
        $('#ppw-toolbar-container').hide();

        if(_settings.languages && _settings.languages.length){
            $(slides).each(function(){
                tmp= $(this.el).find('*');
                notVisible.push(tmp);
                tmp.show();
            });
            _setLION(_conf.currentLang);
        }

        $('#ppw-slides-container, .ppw-slide-container ').css({
            'width': '100%',
            'height': '100%',
            'margin':'auto'
        });

        $b.addClass('printing-'+(_settings.slidesPerPage||1));

        setTimeout(function(){
            _w.print();
            _w.close();
        }, 1000);
        return;

        $b.removeClass('printing-'+(_settings.slidesPerPage||1));
        $('#ppw-toolbar-container').show();
        $(notVisible).each(function(){ $(this).hide(); });
    };

    /**
     * Shows the list of slides as thumbnails.
     */
    var _showThumbs= function(){

        var el= $("#ppw-slides-container");

        if(!_conf.presentationStarted)
            return;

        _triggerEvent('onbeforeshowthumbs');

        _conf.prevStyle= {
            margin: el.css('margin'),
            padding: el.css('padding'),
            width: el.css('width'),
            height: el.css('height'),
            position: el.css('position'),
            top: el.css('top'),
            left: el.css('left'),
            opacity: el.css('opacity')/*,
            webkitTransform: el.css('webkitTransform'),
            mozTransform: el.css('mozTransform'),
            msTransform: el.css('msTransform'),
            transform: el.css('Transform')*/
        };
        _tmp.scroll= [_b.scrollLeft, _b.scrollTop];

        el.addClass('ppw-show-thumbs');
        $b.addClass("ppw-showing-thumb");
        _conf.inThumbsMode= true;

        _triggerEvent('onshowthumbs');
    };

    /**
     * Closes the thumbnails screen.
     */
    var _closeThumbnails= function(){

        var el= $("#ppw-slides-container");


        el[0].scrollTop= _tmp.scroll[1];
        el[0].scrollLeft= _tmp.scroll[0];

        _triggerEvent('onhidethumbs');

        el.removeClass('ppw-show-thumbs');
        $b.removeClass("ppw-showing-thumb");
        _conf.inThumbsMode= false;
    };

    /**
     * Verifies if the current event is native and should aways be normally executed.
     *
     * @param Event
     * @return Boolean
     */
    var _isNativeShortcut= function(evt){

        var validKey= false;
        switch(evt.keyCode){
            case 82: // R
            case 114: // r
            case 76: // L
            case 108: // l
            case 73: // I
            case 105: // i
            case 84: // T
            case 116: // t
                validKey= true;
            break;
        }

        // tab/F5/F11
        if(evt.keyCode == 9 || evt.keyCode == 116 || evt.keyCode == 122)
            return true;

        // ctr/meta + shift + del/backspace
        if(evt.keyCode == 8 && evt.shiftKey && (evt.metaKey || evt.ctrlKey))
            return true;

        // ctrl/meta + R/L/T/I
        if((evt.metaKey || evt.ctrlKey) && validKey)
            return true;

        return false;
    };

    /**
     * Binds the keyboard events to the presentation.
     */
    var _bindEvents= function(){
        var t= null,
            k= 0,
            mouseWheelFn= null;

        /**
         * Keyboard events.
         */
        $d.bind('keydown', function(evt){

            var t= evt.target.tagName.toLowerCase(),
                tmpEl= null;

            if(_isNativeShortcut(evt) || _settings.mode == 'page')
                return true;

            // if the element is an input or has the ppw-focusable class
            // then no shortcut will be executed.
            if(_isEditableTarget(evt.target) &&
               evt.keyCode != 27/*esc*/ &&
               evt.keyCode != 32/*space*/ &&
               evt.keyCode != 70/*F*/
              ){
                return true;
              }

            if(_isLocked(evt)){
                console.warn("[PPW] User interaction(keydown) ignored because Power Polygon has been locked");
                return false;
            }

            switch(evt.keyCode){
                case 112: // F1
                    _showHelp();
                    break
                case 34: // page down
                case 37: // left
                case 40: // down
                case  8: // delete/backspace
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goPreviousSlide();
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 33: // page up
                case 38: // up
                case 39: // right
                case 13: // enter
                case 32: // space

                    if(evt.keyCode == 32 /*space*/ && evt.altKey){
                        _closeMessage();
                        _showThumbs();
                        return _preventDefaultstopPropagation(evt);
                    }

                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goNextSlide();
                        return _preventDefaultstopPropagation(evt);
                    }
                    if(evt.keyCode == 13 && _isEditableTarget(evt.target)){
                        evt.target.click();
                    }
                    break;

                case 35: // end
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goToSlide('last');
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 36: // home
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goToSlide(0);
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 18: // alt
                    if(_settings.shortcutsEnable
                        && _conf.presentationStarted
                        && !_isEditableTarget(evt.target)){
                        _showGoToComponent(true);
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 27: // esc

                    if(_conf.showingMessage){
                        _closeMessage();
                        return true;
                    }

                    _pauseCamera();
                    _preventDefaultstopPropagation(evt);
                    if(_conf.currentZoom != 1){
                        _resetViewport();
                        return true;
                    }
                    if(_conf.inThumbsMode){
                        _goToSlide(_conf.currentSlide);
                    }
                    _closeToolbar();
                    break;

                case 70: // F
                    if(evt.altKey){
                        _showSearchBox(true);
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 80: // P
                    if(evt.altKey || evt.ctrlKey || evt.meta){
                        _print();
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                default: {

                    if(_settings.shortcutsEnable){
                        if(evt.altKey && _conf.presentationStarted){
                            k= evt.keyCode - 48;

                            if(k>=0 && k<10){
                                _d.getElementById('ppw-go-to-slide').value+= k;
                                return _preventDefaultstopPropagation(evt);
                            }
                        }
                    }

                }
            }
            return true;
        });

        $d.bind('keyup', function(evt){

            var s= false;

            if(_isNativeShortcut(evt))
                return true;

            if(_isLocked(evt)){
                console.warn("[PPW] User interaction(keyup) ignored because Power Polygon has been locked");
                return false;
            }

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
                            _closeMessage();
                        }
                        _preventDefaultstopPropagation(evt);
                    }
                    return false;
                    break;

                case 80: // P
                    /*if(evt.altKey || evt.ctrlKey){
                        _print();
                        return _preventDefaultstopPropagation(evt);
                    }*/
                    break;

                case 27: // ESC
                    s= _triggerEvent('ESC_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 117: // F6
                    s= _triggerEvent('F6_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 118: // F7
                    s= _triggerEvent('F7_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 119: // F8
                    s= _triggerEvent('F8_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 120: // F9
                    s= _triggerEvent('F9_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;

                case 121: // F10
                    s= _triggerEvent('F10_PRESSED');
                    if(!s){
                        return _preventDefaultstopPropagation(evt);
                    }
                    break;
            }

            // when the user holds a key
            $d.bind('keypress', function(evt){

                if(_isNativeShortcut(evt) || _settings.mode == 'page')
                    return true;

                if(!evt.altKey)
                    return;

                if(_isLocked(evt)){
                    console.warn("[PPW] User interaction(keypress) ignored because Power Polygon has been locked");
                    return false;
                }

                switch(evt.keyCode){
                    case 188: // ,(<)
                    case 65: // a
                    case 37: // left
                        //_showSlidesThumb();
                        return _preventDefaultstopPropagation(evt);
                    break;
                    case 190: // .(>)
                    case 83: // s
                    case 39: // right
                        //_showSlidesThumb();
                        return _preventDefaultstopPropagation(evt);
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
            _goToSlide(_getCurrentSlideFromURL());
        }, false);

        /**
         * Mouse events.
         */
        $d.bind('click', function(evt){

            if(_settings.mode == 'page')
                return true;

            if(_isLocked(evt)){
                console.warn("[PPW] User interaction(click) ignored because Power Polygon has been locked");
                return false;
            }

            if(_conf.presentationStarted && !_isEditableTargetContent(evt.target)){

                if(!_settings.useArrows || (_settings.useArrows && !_settings.useOnlyArrows)){
                    if(!_conf.inThumbsMode)
                        _goNextSlide();
                }

                return _preventDefaultstopPropagation(evt);
            }
            return true;
        });

        // scrolling, used to apply zoom effects
        /*if(_settings.zoomOnScroll){
            mouseWheelFn= _mouseWheelZoom;
            $d.bind('DOMMouseScroll', mouseWheelFn);
            $d.bind('mousewheel', mouseWheelFn);
        }*/

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
                        _showNotification("<img src='"+_createPPWSrcPath('/_images/electricity.png')+"' width='20' alt='Your battery stoped charging!' />");
                    }else{
                        _closeNotification();
                    }
                }, false);

                _addListener('onthemeloaded', function(){
                    _conf.themeLoaded= true;
                    setTimeout(function(){
                        if(!_n.battery.charging){
                            if(_n.battery.dischargingTime < _settings.duration){
                                _showNotification("<img src='"+_createPPWSrcPath('/_images/electricity.png')+"' width='20' title='You have "+ (_n.battery.dischargingTime / 60)+" minutes of battery!' />");
                            }
                        }
                    }, 1000);
                });
            }
        }

        // window events
        _w.addEventListener('blur', function(){

            if($('#ppw-message-box').css('display') != 'none'){
                if(_d.getElementById('ppw-message-box-button').style.display == 'none'){
                    _closeMessage();
                }
            }

            if(_settings.mode == 'presentation')
                _showArrows();

        }, false);
        _w.addEventListener('focus', function(){
            if(!_settings.useArrows && _settings.mode == 'presentation'){
                setTimeout(_hideArrows, 200);
            }
        });

        _w.addEventListener('resize', function(e){
            _triggerEvent('onresize', {window: _w, event: e});
        });

        _w.onbeforeunload= function(){

            if(_conf.presentationTool)
                _conf.presentationTool.close();

            return null;
        };

        /* Toolbar Events */
        $('#ppw-toolbar-trigger-btn').live('click', function(){
            if($('#ppw-toolbar-container').hasClass('active')){
                _closeToolbar();
            }else{
                _openToolbar();
            }
        }).live('selectstart', function(evt){
            evt.preventDefault();
            return false;
        });

        $('#ppw-message-panel .title').live('click', function(){
            _closeMessage();
        });

        /*$b.bind('selectstart', function(evt){

            if(_isEditableTargetContent(evt.target))
                return true;

            return _preventDefaultstopPropagation(evt);
        });*/
    };

    var _mouseWheelZoom= function(event){

            if(_isLocked(event)){
                console.warn("[PPW] User interaction(zoom) ignored because Power Polygon has been locked");
                return false;
            }

            var container= $('.ppw-active-slide-element-container').eq(0)[0],
                centerH= container? container.offsetWidth/2: 0,
                centerV= container? container.offsetHeight/2: 0,
                evt= event.originalEvent,
                delta = evt.detail < 0 || evt.wheelDelta > 0 ? 1 : -1,
                zommAdd= delta>0? 0.1: -0.1,
                newZoom= _conf.currentZoom + zommAdd,
                posH= evt.offsetX, posV= evt.offsetY,
                finalH= posH,//(centerH + ((centerH - posH)*-1)) * newZoom,
                finalV= posV;

    // todo: Find a better way of applying a zoom referencing the mouse position
    //console.log({posH: posH, centerH: centerH, finalH: finalH, newZoom: newZoom});

            /*
            if(_conf.presentationStarted && !_isEditableTargetContent(evt.target)){
                evt= evt.originalEvent;

                if(delta > 0){ // up
                    _zoomBy(0.1, finalH, finalV);
                }else{ // down
                    _zoomBy(-0.1, finalH, finalV);
                }
            }
            */
       };

    /**
     * Shows the help pannell
     */
    var _showHelp= function(){
        _showMessage(_templates.help);
    }

    /**
     * Show a notification in the bottom of the page.
     *
     * @param String the message to be shown.
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
     *
     * @param HTMLElement The target element.
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
        if(tag == 'video' || tag == 'audio'){
            return t.hasAttribute('controls');
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
     *
     * @param HTMLElement The target element.
     */
    var _isEditableTargetContent= function(target){
        while(target.tagName && target.tagName.toLowerCase() != 'body'){
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
                        .replace(/\%id/gi, id)
                        .replace(/\%num/gi, idx)
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
    var _preloadSlides= function(fn){
        var slides= _settings.slides,
            l= slides.length,
            i= 0,
            el= null,
            nEl= null,
            tt= '',
            k= null,
            container= _settings.slidesContainer;

        if(!container.id){
            container.id= _conf.defaults.containerID;
            _b.appendChild(container);
        }

        if(fn && typeof fn == 'function'){
            _addListener('onslidesloaded', fn);
        }

        if(!l){
            console.error("[PPW] Error: no slides found!");
            $('#ppw-slides-loader-bar').html("<div style='color: red;text-align:center;'><br/>No slides found!!</div>");
            return false;
        }

        for(; i<l; i++){
            el= $('section#'+slides[i].id);

            if(i === 0)
                slides[i].first= true;
            if(i==l-1)
                slides[i].last= true;

            slides[i].actions= [];
            if(!el.length){
                // not found in DOM, should load it from ajax
                nEl= $("<div id='ppw-slide-container-"+slides[i].id+"' class='ppw-slide-container'><section id='"+slides[i].id+"'></section></div>");
                //nEl.id= slides[i].id;
                container.appendChild(nEl[0]);

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
                                                _settings.slides[i].errors= 0;

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
                        error: (function(slide, i){
                            return function(){

                                var el= _d.getElementById(slide.id),
                                    addr= _settings.fsPattern.replace(/\%id/g, slide.id);

                                _settings.slides[i].el= el;
                                _settings.slides[i].title= tt;
                                _settings.slides[i].index= i+1;
                                _settings.slides[i].errors= 1;

                                $(el).addClass('ppw-slide-not-found')
                                     .html(_templates.slideNotFound.replace(/\{\{slideid\}\}/g, slide.id).replace('{{addr}}', addr, 'g'));

                                console.error("[PPW][Slide loading]: Slide not found!", slide);
                                _slidePreloaderNext();
                            }
                        })(slides[i], i)
                    });
                el= $('section#'+slides[i].id);
            }else{
                // the slide content is already on the DOM
                _settings.slides[i].el= el[0];
                tt= el.find('h1, h2, h3, h4, h5, h6')[0];
                tt= tt? tt.innerHTML: el[0].textContent.substring(0, _conf.defaults.slideTitleSize);
                _settings.slides[i].title= tt;
                _settings.slides[i].index= i+1;

                $(container).append("<div id='ppw-slide-container-"+slides[i].id+"' class='ppw-slide-container'></div>");

                $(el).find("script").each(function(count, scr){

                    var f= new Function("PPW.slideIterator= this; "+scr.textContent);

                    try{
                        f.apply(slides[i]);
                        scr.parentNode.removeChild(scr);
                    }catch(e){
                        console.error("[PPW][Script loaded from slide] There was an error on a script, loaded in one of your slides!", e)
                    }
                });

                $('#ppw-slide-container-'+slides[i].id).append(el[0]);

                _slidePreloaderNext(_settings.slides[i]);
            }

            $("#ppw-slide-container-"+slides[i].id).data('ppw-slide-ref', slides[i]);

            if(slides[i].profile){
                _conf.profiles[slides[i].profile]= true;
            }
            if(_settings.profile)
                _conf.profiles[_settings.profile]= true;

            // adding extra information and methods to each slide
            slides[i].actionIdx= 0;
            slides[i].addAction= function(act){
                _addAction(act, this);
            };

            // adding the classes for the slides
            el.addClass(_conf.cons.CLASS_SLIDE + " ppw-slide-type-" + (slides[i].type||_conf.defaults.slideType));
            if(slides[i].className){
                el.addClass(slides[i].className);
            }
            if(slides[i].data && el.data){
                for(k in slides[i].data){
                    el.data(k, slides[i].data[k]);
                }
            }
        }

        // setting the clonable elements
        _applyClonableElements();
    };

    /**
     * Opens the go-to-slide component.
     */
    var _showGoToComponent= function(){

        var el= null, fn,
        msg= "<div class='ppw-goto-filter-container'><input type=text value='' id='ppw-go-to-slide-filter' placeholder='Type the number or title' /></div>";

        msg+= "<div class='ppw-go-to-slides-list'><ul>";
        PPW.getSlides().map(function(i){
            msg+= "<li data-slide-id='"+i.index+"' class='ppw-goto-list-item'>";
            msg+= "<span class='ppw-slide-num'>"+ i.index +"</span><span class='ppw-slide-tt'>"+ i.title.replace(/[ \n\r\t]/g, '')+"</span>";
            msg+= "</li>";
        });
        msg+= "</ul></div>";

        fn= function(){
            var item= _d.querySelector('.ppw-goto-list-item.active'),
                i= item? item.getAttribute('data-slide-id'): false;

            if(i){
                _goToSlide(i-1);
                _closeToolbar();
            }
        };

        //if(_conf.showingMessage)
          //  return false;

        _showMessage(msg, false, 'panel', 'Go to Slide');

        var list= _d.querySelectorAll('.ppw-go-to-slides-list li'),
            l= list.length,
            i= 0;

        el= _d.querySelector('#ppw-go-to-slide-filter');

        el.addEventListener('keyup', function(evt){
            var v= this.value,
                item= false;

            if(evt && evt.keyCode == 13)
                fn();
            else{
                if(evt.keyCode == 38){ // up
                    item= $('.ppw-goto-list-item.active');
                    if(item.length){
                        item.removeClass('active');
                        item= item.prevAll('.ppw-goto-list-item').first();
                        if(!item.length){
                            item= $('.ppw-goto-list-item');
                            item= item.eq(item.length-1);
                        }
                        item.addClass('active');
                    }
                }else if(evt.keyCode == 40){ // down
                    item= $('.ppw-goto-list-item.active');
                    if(item.length){
                        item.removeClass('active');
                        item= item.nextAll('.ppw-goto-list-item').first();

                        if(!item.length)
                            item= $('.ppw-goto-list-item').eq(0);

                        item.addClass('active');
                    }
                }else{
                    for(i=0; i<l; i++){
                        if(!v.length || $(list[i]).text().toLowerCase().indexOf(v) >=0 )
                            $(list[i]).addClass('ppw-goto-list-item');
                        else
                            $(list[i]).removeClass('ppw-goto-list-item');
                    }
                    if(v.length)
                        $('.ppw-goto-list-item').removeClass('active').eq(0).addClass('active');
                    else
                        $('.ppw-goto-list-item').removeClass('active')
                }
            }
        }, false);

        for(i=0; i<l; i++){
            list[i].addEventListener('click', function(){
                _goToSlide(this.getAttribute('data-slide-id') -1);
                _closeToolbar();
            });
        }
        el.focus();
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
     * Prepares the presentation to be printed.
     *
     * You can use this feature to save the presentation as pdf, for example.
     */
    var _print= function(){

        var printW= window.open(_l.origin + _l.pathname+'?ppw-printing-version=true');
        return;
    };

    /**
     * Shows the searchbox.
     *
     * This search goes to the slide where the searched term is found.
     *
     * @param Boolean Force the search box to replace the current alert message.
     */
    var _showSearchBox= function(evt){

        var searchIcon= $('#ppw-toolbaricon-ppw-search-icon'),
            searchIpt= searchIcon.find('input'),
            searched= '';

        if(!searchIpt.length){
            searchIcon.append('<input type="text" class="ppw-clickable ppw-selectable" />');
            searchIpt= searchIcon.find('input');
            searchIpt.bind('keyup', function(evt){
                var ret= null;
                if(evt.keyCode == 13){ // enter

                    searched= this.value;

                    if(!searched)
                        return;

                    if(evt.shiftKey){
                        ret= _searchIntoSlides('prev', searched);
                    }else{
                        ret= _searchIntoSlides('next', searched);
                    }

                    if(!ret){
                        $(this).addClass('ppw-no-search-results');
                    }else{
                        $(this).removeClass('ppw-no-search-results');
                    }
                    return;
                }else if(evt.keyCode == 27){ // esc
                    searchIcon.removeClass('ppw-showing');
                }
                if(searched != this.value){
                    $(this).removeClass('ppw-no-search-results');
                }
            });
            _addListener('toolbarClose', function(){
                searchIcon.removeClass('ppw-showing');
            });
            searchIcon.addClass('ppw-showing');
            setTimeout(function(){
                searchIpt.focus();
            }, 301);
        }else{
            if(searchIcon.hasClass('ppw-showing') && (evt && evt.target.nodeName.toUpperCase() != 'INPUT')){
                searchIcon.removeClass('ppw-showing');
            }else{
                searchIcon.addClass('ppw-showing');
                setTimeout(function(){
                    searchIpt.focus();
                }, 301);
            }
        }
    };

    /**
     * Creates the splash screen.
     *
     * This screen ofers access to useful tools before the presentation begins.
     * This method is always called, but if the settings define that no splash
     * screen should be used, it will not create the splash screen itself, although
     * the other tools that can be accessed from outside the splash screen are
     * going to be created.
     */
    var _createSplashScreen= function(){
        _conf.loadSteps++;

        _b= _d.body;
        $b= $(_b);
        var intro= _w.localStorage.getItem('ppw-newDesignIntroduction');
        intro= !intro;

        if(!_w.localStorage.getItem('ppw-newDesignIntroduction')){
            _settings.useToolBar= true;
            _settings.useSplashScreen= true;
//            _loadScript(_createPPWSrcPath('/_scripts/intro.js'), true, function(){_setLoadingBarStatus('IntroJS.js');});
//            _loadStyle(_createPPWSrcPath('/_styles/introjs.css'), true, function(){_setLoadingBarStatus('IntroJS.css');}, true);
            //_w.localStorage.setItem('ppw-newDesignIntroduction', true);
        }
        
        _loadScript(_createPPWSrcPath('/_scripts/intro.js'), true, function(){
            introJs().setOptions({
                skipLabel: 'Exit',
                tooltipPosition: 'top',
                showStepNumbers: false,
                exitOnOverlayClick: false,
                exitOnEsc: true
            });
            _setLoadingBarStatus('IntroJS.js');
        });
        _loadStyle(_createPPWSrcPath('/_styles/introjs.css'), true, function(){
            _setLoadingBarStatus('IntroJS.css');
        }, true);

        _preparePPW();

        if(_isInPrintableVersion()){
            $b.addClass('printing-1');
            _preloadSlides();
            return true;
        }

        // Adding the social buttons to the page.
        $b.append('<div id="fb-root"></div>');
        // adding the messages container
        $b.append(_templates.messages);
        // adding the camera container
        $b.append(_templates.camera);

        // adding the svg blur effect, to be able to apply blur on firefox as well.
        $b.append('<svg id="ppw-svg-image-blur">\
                        <filter id="blur-effect-1">\
                            <feGaussianBlur stdDeviation="1" />\
                        </filter>\
                   </svg>');

        // adding the toolbar
        if(_settings.useToolBar && !_querystring('remote-controller')){

            var tpl= _templates.toolBar
                                .replace(/\{\{clickableClass\}\}/g, _conf.cons.CLICKABLE_ELEMENT)
                                .replace(/\{\{likeSrc\}\}/g, _l.protocol+'//'+(_l.host == 'localhost'? 'powerpolygon.com': _l.host)+''+_l.pathname);
            $b.append(tpl);
            _createDefaultIcons();
        }

        // adding the splash screen if enabled
        if(_settings.useSplashScreen){

            $.get(_createPPWSrcPath("/_tools/splash-screen.html"), {}, function(data){

                var i=0, l=0, str= '', authors= [], cachedEl;
                _d.body.innerHTML+= data;
                _setLoadingBarStatus("splash screen");
                    
                $('#ppw-goFullScreen-trigger').click(_enterFullScreen);
                $('#ppw-testResolution-trigger').click(_testResolution);
                $('#ppw-testAudio-trigger').click(_testAudio);
                $('#ppw-testCamera-trigger').click(PPW.toggleCamera);
                $('#ppw-testConnection-trigger').click(_testConnection);
                $('#ppw-talk-title').html(_settings.title);
                
                cachedEl= $('#ppw-talk-title-container');
                if(_settings.authors){
                    for(i=0, l=_settings.authors.length; i<l; i++){
                        if(_settings.authors[i].name){
                            str= "<a href='"+(_settings.authors[i].link? _settings.authors[i].link: 'mailto:'+_settings.authors[i].email)+"'>"+
                                    _settings.authors[i].name+
                                 "</a>";
                        }else{
                            str= _settings.authors[i];
                        }
                        authors.push(str);
                    }
                    cachedEl.find('author').html('by '+str);
                }
                
                cachedEl.find('span').html(_settings.description);
                
                $('.ppw-menu-start-icon').click(_startPresentation);
                $('.ppw-notification-close-button').click(_closeNotification);

                $('#ppw-slides-loader-bar').stop().animate({
                    marginTop: '0px'
                }, 500, _preloadSlides);

                _conf.screenSize= _conf.screenSize||$("#ppw-resolution-test-element")[0];

                _addListener('onresize', function(obj){
                    if(_conf.testingResolution){
                        _updateScreenSizes();
                    }
                });

                _triggerEvent('onsplashscreen', _d.getElementById('ppw-addons-container'));

                if(intro){
                    $('#ppw-toolbar-trigger-btn').attr('data-intro', "<strong>Meet the new design</strong><br/>Now, the toolbar is hidden down here!<br/>Hover it to see the toolbar trigger button and show the toolbar.")
                                                 .attr('data-position', 'top')
                                                 .attr('data-step', 1);
                    $('#ppw-toolbaricon-ppw-settings-icon').attr('data-intro', '<strong>Settings and properties</strong><br/>Use this item to see and change the settings and presentation properties')
                                                           .attr('data-position', 'right')
                                                           .attr('data-step', 2);
                    $('#ppw-toolbaricon-ppw-remote-icon')  .attr('data-intro', '<strong>Remote Control</strong><br/>When available, use it to enable or disable the remote control.<br/>You can use your cellphone to pass slides or even draw or point on your presentation.')
                                                           .attr('data-position', 'right')
                                                           .attr('data-step', 3);
                    $('#ppw-toolbaricon-ppw-toolbox-icon') .attr('data-intro', '<strong>Presentation Tools</strong><br/>You can keep these tools in a different screen, when giving your talk.')
                                                           .attr('data-position', 'right')
                                                           .attr('data-step', 4);
                    $('#ppw-toolbaricon-ppw-ct-text-big')  .attr('data-intro', '<strong>Font sizes</strong><br/>Increase or decrease the size of texts in your slides easily')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 5);
                    $('#ppw-toolbaricon-ppw-camera-icon')  .attr('data-intro', '<strong>Toggle your camera</strong><br/>You can use it to toggle on and off your camera, showing it to the audience.<br/>You can then maximize the camera, adjust its size or drag it around')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 6);
                    $('#ppw-toolbaricon-ppw-ct-thumbs')    .attr('data-intro', '<strong>See thumbs and go-to</strong><br/>With these tools, you cansee the thumbnails of your slides and then jump to the one you want, or see the list and type to filter it and go to the right slide')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 7);
                    $('#ppw-toolbaricon-ppw-search-icon')  .attr('data-intro', '<strong>Search into slides</strong><br/>Search for a given term inside your slides.<br/>Use <em>Enter</em> to search forward and <em>Shift+Enter</em> to search backwards.')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 8);
                    $('#ppw-talk-title-container .bottom') .attr('data-intro', '<strong>Talk data</strong><br/>Information about your talk, like title, description and authors.')
                                                           .attr('data-position', 'bottom')
                                                           .attr('data-step', 9);
                    $('#ppw-tests')                        .attr('data-intro', '<strong>Tests and plugins</strong><br/>Basic tests come here. Also, plugins can be loaded to add functionalities to Power Polygon and they triggers may be added here.')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 10);
                    $('.ppw-menu-start-icon')              .attr('data-intro', '<strong>Done!</strong><br/>Great!<br/>You are good to go and have fun!')
                                                           .attr('data-position', 'top')
                                                           .attr('data-step', 11);

                    setTimeout(function(){
                        var itemsIntroduced= 0;

                        var showIntroToEl= function(step){
                            switch(step){
                                case 0:
                                    _closeMessage();
                                    break
                                case 1:
                                    _showConfiguration();
                                    break;
                                case 2:
                                    _closeMessage();
                                    break;
                                case 3:
                                    _closeMessage();
                                    break;
                                case 4:
                                    $('.introjs-helperLayer').css('width', '70px');
                                    break;
                                case 6:
                                    $('.introjs-helperLayer').css('width', '84px');
                                    _showGoToComponent();
                                    break;
                                case 7:
                                    _closeMessage();
                                    //_showSearchBox();
                                    break;
                                case 8:
                                    _closeToolbar();
                                    break;
                            }
                        };

                        _openToolbar();
                        $('.introjs-nextbutton').live('click keydown', function(evt){
                            if(!evt.keyCode || evt.keyCode == 13){
                                itemsIntroduced++;
                                showIntroToEl(itemsIntroduced);
                            }
                        });
                        $('.introjs-prevbutton').live('click keydown', function(evt){
                            if(!evt.keyCode || evt.keyCode == 13){
                                itemsIntroduced--;
                                showIntroToEl(itemsIntroduced);
                            }
                        });
                        $('.introjs-skipbutton').live('click keydown', function(evt){
                            if(!evt.keyCode || evt.keyCode == 13){
                                //if(itemsIntroduced == 10){
                                    // finished
                                    _w.localStorage.setItem('ppw-newDesignIntroduction', 1);
                                //}else{
                                    // skiped
                                  //  itemsIntroduced= 0;
                                    _closeToolbar();
                                //}
                            }
                        });
                        /*_w.introJs().onexit(function(target){
                            alert(9);
                        });
                        _w.introJs().oncomplete(function(target){
                            alert(8);
                        });*/
                        _w.introJs().start();
                        $('.introjs-helperLayer').css('top', '+=20px');
                    }, 3000);
                }
            });
        }else{
            _setLoadingBarStatus("splash screen not used");
        }

        if(_n.onLine && !_conf.remoteControl){

            if(_settings.Facebook){
                // applying Facebook Buttons
                (function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=281929191903584";
                    fjs.parentNode.insertBefore(js, fjs);
                }(_d, 'script', 'facebook-jssdk'));
            }
            if(_settings.Google){
                // applying the g+ buttons
                _loadScript('https://apis.google.com/js/plusone.js');
            }

            if(_settings.Facebook >> _settings.Google){
                $('#ppw-content-toolbar').addClass('ppw-fb-only');
                //$('#ppw-content-toolbar').css('width', '160px');
                //$('#ppw-presentation-social-buttons').css('width', '62px');
            }
            if(_settings.Google >> _settings.Facebook){
                $('#ppw-content-toolbar').addClass('ppw-gp-only');
            }
            if(_settings.Facebook && _settings.Google){
                $('#ppw-content-toolbar').css('width', '200px');
            }

        }
    };

    var _updateScreenSizes= function(){
        _d.getElementById('ppw-resolution-sizes').innerHTML= _conf.screenSize.offsetWidth + ' X ' + _conf.screenSize.offsetHeight;
    };
    /**
     * Set the font sizes 10% bigger.
     */
    var _biggerFonts= function(){
        _conf.fontSize+= 10;

        _d.getElementById('ppw-slides-container').style.fontSize= _conf.fontSize+"%";

        if(_conf.testingResolution){
            _d.getElementById('ppw-resolution-test-element').style.fontSize= _conf.fontSize+"%";
        }
    };

    /**
     * Set the font sizes 10% smaller.
     */
    var _smallerFonts= function(){
        _conf.fontSize-= 10;
        _d.getElementById('ppw-slides-container').style.fontSize= _conf.fontSize+"%";

        if(_conf.testingResolution){
            _d.getElementById('ppw-resolution-test-element').style.fontSize= _conf.fontSize+"%";
        }
    };

    /**
     * Shows the resolution tool.
     *
     * This tool allows the user to see the boundings of the presentation,
     * as well as check on colors and font sizes.
     */
    var _testResolution= function(){
        var el= $('#ppw-resolution-test-element');
        _d.getElementById('ppw-splash-res-test-img-2').src= _d.getElementById('ppw-splash-res-test-img-1').src;
        el.show();
        _updateScreenSizes();
        _conf.testingResolution= true;
        _showMessage("Click in \"close\" when finished", function(){
            el.hide();
            _conf.testingResolution= false;
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
                        alert("[PPW] Your browser does not support Fullscreen from JavaScript!\nPlease, start your fullscreen with your keyboard!");
                      }
            $b.addClass(_conf.cons.CLASS_FULLSCREEN);
            _triggerEvent('onfullscreen', status);
        }
    }

    /**
     * Shows the next queued message.
     *
     * @return Boolean True if there was a queued message, false otherwise.
     */
    var _showNextMessage= function(){
        var q= _conf.messagesQueue,
            m= null;
        if(q.length){
            m= q.shift();
            _showMessage(m.msg, m.fn, m.type, m.title);
            return true;
        }else{
            return false;
        }
    };

    /**
     * Show a message in a floating box in the center of the screen.
     *
     * @param String The message to be shown.
     * @param Function A callback to be executed once the message is closed.
     * @param Boolean (default false) Hides the 'close' button.
     * @param String The message type. Can be: false/undefined, warning/warn or error.
     * @return Boolean True if showed the message, false if it was queued.
     */
    var _showMessage= function(msg, fn, type, title){

        var container= (type == 'box'? $('#ppw-message-box'):
                        type == 'panel'? $('#ppw-message-panel'):
                        ($(type).eq(0)) );

        if(_conf.showingMessage){
            if(type == 'box')
                _conf.messagesQueue.push({msg: msg, fn: fn, type: type, title: title});
            else{
                if(type != 'panel'){
                    _closeMessage();
                    return false;
                }

                if(_conf.showingMessage.data('messageTitle') != title){
                    _closeMessage();
                    setTimeout(function(){
                        _showMessage(msg, fn, type, title);
                    }, 500);
                }else{
                    _closeMessage();
                }
            }
            return false;
        }

        if(!container.length){
            console.warn("[PPW] Failed to locate the container for the message, using mode box for the message");
            type= 'box';
            container= $('#ppw-message-box');
        }

        if(type == 'box'){
            $('#ppw-message-content').html(msg);
            container.addClass('ppw-showing');

            container.css({
                marginLeft: -(container[0].offsetWidth/2)+'px'
            });

            var func= function(){
                if(fn && typeof fn == 'function'){
                    try{
                        fn();
                    }catch(e){
                        console.error('Failed executing callback on closing message', e, fn);
                    }
                }
            }

            container.data('closeCallback', func).data('messageType', 'box');

            $('#ppw-message-box-button').one('click', _closeMessage);
            setTimeout(function(){
                _d.getElementById('ppw-message-box-button').focus();
            }, 100);
        }else if(type == 'panel'){
            //var msgTt= container.data('msgTitle');

            container.find('.title span').html(title||'');
            $('#ppw-panel-content').html(msg);
            container.data('closeCallback', func);
            //container.data('msgTitle', title);
            container.addClass('ppw-showing');
        }else{
            // is a balloon inside a given container
        }
        container.data('messageType', type).data('messageTitle', title);
        _conf.showingMessage= container;
        return true;
    };

    /**
     * Shows a message of type warning.
     *
     * @param String The message to be shown.
     * @param Function A callback to be executed once the message is closed.
     * @param Boolean (default false) Hides the 'close' button.
     */
    var _showWarning= function(msg, fn, hideButton){
        _showMessage(msg, fn, hideButton, 'warning');
    };

    /**
     * Shows a message of type error.
     *
     * @param String The message to be shown.
     * @param Function A callback to be executed once the message is closed.
     * @param Boolean (default false) Hides the 'close' button.
     */
    var _showError= function(msg, fn, hideButton){
        _showMessage(msg, fn, hideButton, 'error');
    };

    /**
     * Closes the message box.
     */
    var _closeMessage= function(){

        var container= _conf.showingMessage,
            fn= container? container.data('closeCallback'): false,
            type= container? container.data('messageType'): 'box';


        if(!container)
            return false;

        if(fn && typeof fn == 'function'){
            try{
                fn(container);
            }catch(e){
                throw("[PPW]:: Failed executing the show message callback!", e);
            }
        }

        _conf.showingMessage= false;
        if(_showNextMessage()){
            return;
        }

        //container.data('msgTitle', false);
        container.removeClass('ppw-showing')
                 .data('messageType', false)
                 .data('messageTitle', false);

    };

    /**
     * Initializes and shows the camera.
     *
     * This mathod askes for permition to use the camera, shows it ans enable
     * the binding events to it(such as gestures and clicks)
     */
    var _startCamera= function(){

        var video = _d.querySelector('#ppw-video-element'),
            el= $('#ppw-camera-tool'),
            dnd= {},
            rsz= {},
            dragingTheVideo= function(event){
                if(dnd.el){
                    dnd.el.style.left= event.pageX - dnd.offsetX + 'px';
                    dnd.el.style.bottom= ((_b.offsetHeight - event.pageY) - (dnd.height - dnd.offsetY)) + 'px';
                }
            },
            resizingTheVideo= function(event){
                var h, w;
                if(dnd.el){
                    w= (event.pageX - rsz.left);
                    h= (_b.offsetHeight - event.pageY - rsz.bottom);
                    if(w > 40)
                        rsz.el.style.width= w + 'px';
                    if(h > 40)
                        rsz.el.style.height= h + 'px';
                }
                event.preventDefault();
                return false;
            };

        if(!_conf.cameraLoaded){
            _w.URL = _w.URL || _w.webkitURL;
            _n.getUserMedia  = _n.getUserMedia || _n.webkitGetUserMedia ||
                               _n.mozGetUserMedia || _n.msGetUserMedia;

            if (_n.getUserMedia) {

                _n.getUserMedia({audio: false, video: true}, function(stream){

                  var streamData= stream;
                  PPW.cameraStream= stream;

                  try{
                      streamData= _w.URL.createObjectURL(stream);
                      video.src = streamData;
                      stream= streamData;
                      video.play();
                  }catch(e){
                      //video.src= streamData;
                      video.mozSrcObject = stream;
                      video.play();
                  }

                  _conf.cameraLoaded= true;

                  _conf.video= video;
                  _conf.stream= stream;

                  _triggerEvent('onshowcamera', {
                      "video": _conf.video,
                      "device": _conf.stream
                  });

                  el.bind('dblclick', function(){

                        var that= $(this), oldie= [];

                        if(that.data('fullscreened')){
                            oldie= that.data('oldprops');
                            that.data('fullscreened', true)
                                .show()
                                .css({
                                     width: oldie[2]+'px',
                                     height: oldie[3]+'px',
                                     left: oldie[0]+'px',
                                     bottom: oldie[1]+'px'
                                 })
                                 .data('fullscreened', false);
                        }else{
                            that.data('fullscreened', true)
                                .data('oldprops', [
                                     this.offsetLeft,
                                     _b.offsetHeight - (this.offsetHeight + this.offsetTop),
                                     this.offsetWidth,
                                     this.offsetHeight
                                ])
                                .css({
                                     width: _b.offsetWidth+'px',
                                     height: _b.offsetHeight+'px',
                                     left: '0px',
                                     bottom: '0px'
                                 });
                        }
                    }).addClass('ppw-camera-activated');

                    $('#ppw-video-container').bind('mousedown', function(event){ // dragg'n'drop

                        dnd.pageX= event.pageX;
                        dnd.pageY= event.pageY;
                        dnd.offsetX= event.offsetX;
                        dnd.offsetY= event.offsetY;
                        dnd.height= el[0].offsetHeight;
                        dnd.el= el[0];

                        _b.addEventListener('mousemove', dragingTheVideo);
                        _b.addEventListener('mouseup', function(){
                            _b.removeEventListener('mousemove', dragingTheVideo);
                        });

                        event.preventDefault();
                        return false;
                    });

                    $('#ppw-camera-tool-resize').bind('mousedown', function(event){
                        rsz.pageX= event.pageX;
                        rsz.pageY= event.pageY;
                        rsz.offsetX= event.offsetX;
                        rsz.offsetY= event.offsetY;
                        rsz.bottom= _b.offsetHeight - (el[0].offsetHeight + el[0].offsetTop);
                        rsz.left= el[0].offsetLeft;
                        rsz.el= el[0];
                        _b.addEventListener('mousemove', resizingTheVideo);
                        _b.addEventListener('mouseup', function(){
                            _b.removeEventListener('mousemove', resizingTheVideo);
                        });

                        event.preventDefault();
                        return false;
                    });

                    setTimeout(_closeToolbar, 800);

                    _conf.showingCamera= true;
                    $('#ppw-camera-hide-trigger').bind('click', _pauseCamera);

                }, function(data){
                    console.error("[PPW Error]: Could now open the camera! User did not allow it!", data);
                    return false;
                });
            }else{
                alert("[PPW] Could NOT start the video!");
                console.error("[PPW Error]: Could now open the camera! It looks like your browser does not support it!", data);
                return false;
            }
        }else{
            _d.querySelector('#ppw-video-element').play();
            el.addClass('ppw-camera-activated');
            setTimeout(_closeToolbar, 800);

            if(_conf.video && _conf.stream){
                _triggerEvent('onshowcamera', {
                    "video": _conf.video,
                    "device": _conf.stream
                });
            }
            _conf.showingCamera= true;
        }
    };

    /**
     * Closes the toolbar menus.
     */
    var _closeToolbar= function(){
        $('#ppw-toolbar-container').removeClass('active');
        _closeMessage();
        _triggerEvent('toolbarClose');
    };

    /**
     * Shows the toolbar menus.
     */
    var _openToolbar= function(){
        $('#ppw-toolbar-container').addClass('active');
        _triggerEvent('toolbarOpen');
    };

    /**
     * Pauses the camera and hides it.
     */
    var _pauseCamera= function(){

        var el= null;

        if(_conf.cameraLoaded){
            el= $('#ppw-camera-tool');
            _d.querySelector('#ppw-video-element').pause();
            el.addClass("ppw-removing-camera")
            setTimeout(function(){el.removeClass('ppw-removing-camera ppw-camera-activated'); el[0].removeAttribute('style'); }, 500);
            _conf.showingCamera= false;
        }
        _triggerEvent('onhidecamera');
    };

    /**
     * Plays an audio so the speaker can test the sound.
     */
    var _testAudio= function(){

        _showMessage("Playing audio<br/><div style='background: url("+_createPPWSrcPath('/_images/animated-wave-sound.gif')+") 0px -37px no-repeat; position: relative; width: 220px; height: 30px; margin: auto; background-size: 248px 108px; border-left: solid 1px #fcc; border-right: solid 1px #fcc;' onclick='var audio = document.getElementById(\"ppw-audioTestElement\"); var t = \"Stopped\";  if(audio.paused) { audio.play(); t = \"Playing\" } else { audio.pause(); }; console.log(\"[PPW] Currently \" + t); '/><div id='ppw-audioPlaceHolder'></div>",
                     function(){
                         var el= _d.getElementById('ppw-audioTestElement'),
                            audio= new Audio(el);
                         el.pause();
                         audio.pause();
                     });
        $('#ppw-audioPlaceHolder').html("<audio id='ppw-audioTestElement' autoplay='autoplay' loop='loop' >\
            <source src='"+_createPPWSrcPath('/_audios/water.mp3')+"'/>\
            <source src='"+_createPPWSrcPath('/_audios/water.ogg')+"'/>\
           </audio>");
    };

    /**
     * Opens the presentation tool.
     *
     * This tool shows the current slide and its notes, as well as the next
     * slide and its notes.
     * Also, the time remaning/lapsed and the shortcut keys.
     */
    var _openPresentationTool= function(){
        var toolSrc= _createPPWSrcPath('/_tools/presentation-tool.html'),
            toolName= 'ppw-Presentation-tool',
            toolProps= "width=780,height=520,left=40,top=10";

        _closeToolbar();

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

        msg= _templates.settings
                       .replace('{{shortcuts}}', _settings.shortcutsEnable? 'checked=checked': '')
                       .replace('{{duration}}', _settings.duration)
                       .replace('{{alerts}}', _settings.alertAt);

        _showMessage(msg, fn, 'panel', 'Settings');

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

        $('#ppw-settings-extra-data').html("\
          <label>Talk</label><span>"+_settings.canonic+"</span>\
          <label>Number of slides</label><span>"+_conf.validSlides.length+"</span>\
          <label>Current</label><span>"+(_conf.currentSlide+1)+': '+_settings.slides[_conf.currentSlide].id+"</span>\
          <label>Themes</label><span>"+(_settings.theme.join(', '))+"</span>\
          <label>Remote Server</label><span>"+_conf.defaultRemoteServer+"</span>");
        //
        //
        //
        //
        //

        _triggerEvent('onopensettings', _settings);
    };

    /**************************************************
     *               PRESENTATION CORE                *
     **************************************************/
     // Methods that are actually used to have the    //
     // Power Polygon's core working.                 //
     //                                               //
     // These methods are private, but may be exposed //
     // by the APY.                                   //
     /*************************************************/

    /**
     * Starts the presentation itself.
     */
    var _startPresentation= function(evt){

        var el= _d.querySelector('.ppw-menu-start-icon'),
            first, act;

        if(!_conf.slidesLoaded)
            return;

        $('#ppw-splash-screen-container').animate({
            marginTop: '-460px'
        }, 200, function(){
            $('#ppw-splash-screen').fadeOut();
        });

        _settings.presentationStarted= _conf.presentationStarted= (new Date()).getTime();
        _goToSlide(_getCurrentSlideFromURL());
        if(el)
            el.blur();

        _triggerEvent('onstart', _conf.currentSlide);

        // in case the first opened slide has a timming/auto action, it should be triggered
        first= _getCurrentSlide();
        if(first && first.actions.length && first.actions[0].timing){
            act= first.actions[0];
            if(act.timing == 'auto'){
                act.does();
            }else if(isNum(act.timing)){
                setTimeout(act.does, act.timing)
            }
        }

        if(evt){
            evt.preventDefault();
            return false;
        }
    };

    /**
     * Function called when an specific slide is entered.
     */
    var _onSlideEnter= function(fn){

        var slideRef= PPW.slideIterator;

        if(!slideRef || !slideRef.actions)
            return false; // it probably is not loaded yet...will be called again when loaded

        if(fn && typeof fn == "function"){
            slideRef.onSlideEnter= function(){
                try{
                    fn(slideRef);
                }catch(e){
                    console.error("[PPW][Slide script error] Failed during the call of the onSlideEnter", slideRef);
                }
            }
        }

    };

    /**
     * Function called when an specific slide is exited.
     */
    var _onSlideExit= function(fn){

        var slideRef= PPW.slideIterator;
        if(!slideRef || !slideRef.actions)
            return false; // it probably is not loaded yet...will be called again when loaded

        if(fn && typeof fn == "function"){
            slideRef.onSlideExit= function(){
                try{
                    fn(slideRef);
                }catch(e){
                    console.error("[PPW][Slide script error] Failed during the call of the onSlideExit", slideRef);
                }
            }
        }
    };

    /**
     * Function called when an specific slide does something(executes an action).
     */
    var _onSlideDoes= function(fn){

        var slideRef= PPW.slideIterator;
        if(!slideRef || !slideRef.actions)
            return false; // it probably is not loaded yet...will be called again when loaded

        if(fn && typeof fn == "function"){
            slideRef.onSlideDoes= function(){
                try{
                    fn(slideRef);
                }catch(e){
                    console.error("[PPW][Slide script error] Failed during the call of the onSlideEnd", slideRef);
                }
            }
        }
    };

    /**
     * Function called when an specific slide undo something(executes an action).
     */
    var _onSlideUndo= function(fn){

        var slideRef= PPW.slideIterator;
        if(!slideRef || !slideRef.actions)
            return false; // it probably is not loaded yet...will be called again when loaded

        if(fn && typeof fn == "function"){
            slideRef.onSlideUndo= function(){
                try{
                    fn(slideRef);
                }catch(e){
                    console.error("[PPW][Slide script error] Failed during the call of the onSlideEnd", slideRef);
                }
            }
        }
    };

    /**
     * Adds an action to each speficied slide.
     */
    var _addAction= function(action, slide){

        var slideRef= slide||PPW.slideIterator;
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
     // Methods used by Slide contexts.               //
     // This method is private, but can be exposed    //
     // by the API, afterwards.                       //
     /*************************************************/

    /**
     * Returns the index of the current slide based on the url.
     */
    var _getCurrentSlideFromURL= function(){
        var h= _l.hash? _l.hash.replace(_settings.hashSeparator, '')||_settings.slides[0].idx : 0,
            i= _settings.slides.length,
            extraPath= false;

        if(isNaN(h)){
            if(extraPath= h.match(/\/.+/)){
                _settings.currentPath= extraPath[0];
                h= h.replace(/\/.+/, '');
            }
            while(i--){
                if(_settings.slides[i].id == h)
                    return i;
            };
            h= 0;
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
                /*if(slide.onSlideUndo){
                    slide.onSlideUndo(slide);
                }*/
            }else{
                _goPreviousSlide();
            }
        }else{
            _removeAnimateCSSClasses();
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
            //try{
                setTimeout(slide.actions[slide.actionIdx].does, 1);
            //}catch(e){
                //console.error("[PPW][Slide action error] There was an error trying to execute an action of the current slide:", slide, e);
            //};
            slide.actionIdx++;

            /*if(slide.onSlideDoes){
                slide.onSlideDoes(slide);
            }*/

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
     *
     * @param Int The slide number.
     * @param Boolean Flag used internaly to prevent actions or finish the talk.
     */
    var _goToSlide= function(idx, prevent){

        var url= '',
            previousSlide= _getCurrentSlide(),
            slide= null,
            curSlide= null;

        if(!_conf.presentationStarted)
            return false;

        if(_settings.fixTransformsOnSlideChange){
            _resetViewport();
        }

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

        // closing the thumbs
        if(_conf.inThumbsMode){
            _closeThumbnails();
        }

        if(_settings.friendlyURL !== false)
            _setHistoryStateTo(idx);

        _setSlideClasses(idx);

        // triggers the events
        if(_settings.slides[_conf.currentSlide].onSlideEnter){
            _settings.slides[_conf.currentSlide].onSlideEnter();
        }
        if(previousSlide.onSlideExit && previousSlide != curSlide){
            previousSlide.onSlideExit();
        }

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

        if(_settings.useArrows){
            if(curSlide.first){
                $('#ppw-arrow-previous-slide').hide();
            }else{
                $('#ppw-arrow-previous-slide').show();
            }

            if(curSlide.last){
                $('#ppw-arrow-next-slide').hide();
            }else{
                $('#ppw-arrow-next-slide').show();
            }
        }

        // if the slide is of a different type
        if(previousSlide && previousSlide.type != curSlide.type)
            _triggerEvent('onslidetypechange', {
                previous: previousSlide,
                current: curSlide
            });

        if(_settings.currentPath){
            curSlide.path= _settings.currentPath;
        }else{
            curSlide.path= '';
        }

        // default event for slidechange
        _triggerEvent('onslidechange', {
            previous: previousSlide,
            current: curSlide
        });

        // if the slide has actions and the first one has a timing definition
        if(curSlide.actions[curSlide.actionIdx] && curSlide.actions[curSlide.actionIdx].timing != 'click'){
            if(curSlide.actions[curSlide.actionIdx].timing == 'auto'){
                _goNextSlide();
            }else if(!isNaN(curSlide.actions[curSlide.actionIdx].timing)){
                _settings.slides[_conf.currentSlide]._timer= setTimeout(function(){
                    _goNextSlide();
                }, curSlide.actions[curSlide.actionIdx].timing);
            }
        }
    };

    /**
     * Sets a path to be used after the separator in the URL.
     */
    var _setCurrentPath= function(path){
        _settings.currentPath= path||false;
        return path;
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

        _pushState(idx)
        _d.title= idx;
    };

    /**
     * Public method to push a given string to the url/history
     */
    var _pushState= function(state){

        if(_settings.currentPath)
            state+= _settings.currentPath;

        //if(_l.hash != _settings.hashSeparator+state){

        //if(state != _getCurrentSlide().id){
            _h.pushState({}, state, _settings.hashSeparator+state);
        //}
    }

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
        $(_d.querySelector("."+_conf.cons.CLASS_ACTIVE_SLIDE_CONT))
            .removeClass(_conf.cons.CLASS_ACTIVE_SLIDE_CONT);
        $('#'+_settings.slides[idx].id).addClass(_conf.cons.CLASS_ACTIVE_SLIDE);
        $('#'+_settings.slides[idx].id).parent().addClass(_conf.cons.CLASS_ACTIVE_SLIDE_CONT);

        // setting the previous slide class
        $(_d.querySelector("."+_conf.cons.CLASS_PREVIOUS_SLIDE))
            .removeClass(_conf.cons.CLASS_PREVIOUS_SLIDE);
        $(_d.querySelector("."+_conf.cons.CLASS_PREVIOUS_SLIDE_CONT))
            .removeClass(_conf.cons.CLASS_PREVIOUS_SLIDE_CONT);

        id= idx;
        do{
            id--;
        }while(_settings.slides[id] && !_isValidProfile(_settings.slides[id]));

        if(_settings.slides[id]){
            $('#'+_settings.slides[id].id).addClass(_conf.cons.CLASS_PREVIOUS_SLIDE);
            $('#'+_settings.slides[id].id).parent().addClass(_conf.cons.CLASS_PREVIOUS_SLIDE_CONT);
        }


        // setting the next slide class
        $(_d.querySelector("."+_conf.cons.CLASS_NEXT_SLIDE))
            .removeClass(_conf.cons.CLASS_NEXT_SLIDE);
        $(_d.querySelector("."+_conf.cons.CLASS_NEXT_SLIDE_CONT))
            .removeClass(_conf.cons.CLASS_NEXT_SLIDE_CONT);

        id= idx;
        do{
            id++;
        }while(_settings.slides[id] && !_isValidProfile(_settings.slides[id]));

        if(_settings.slides[id]){
            $('#'+_settings.slides[id].id).addClass(_conf.cons.CLASS_NEXT_SLIDE);
            $('#'+_settings.slides[id].id).parent().addClass(_conf.cons.CLASS_NEXT_SLIDE_CONT);
        }
    };

    /**
     * Removes the CSS classes used by the animate method.
     */
    var _removeAnimateCSSClasses= function(el){

        if(!el){
            el= $(_getCurrentSlide().el).find('.animated');
        }else{
            el= $(el);
        }

        $(el).each(function(){
            this.className= this.className.replace(/ppw\-anim\-([a-zA-z0-9\-_]+)( |$)/g, '')
                                          .replace('animated', '');
        });

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

        var wasLocked= PPW.isLocked();

        var onEnd= function(event){

            settings= settings||{};
            settings.onend= settings.onend|| settings.onEnd || false;

            if(settings.onend && typeof settings.onend == 'function'){
                try{
                    settings.onend(event, el, anim);
                }catch(e){
                    console.error("[PPW] Error: Callback failed to be executed in the end of the animation");
                };
            }

            if(anim.indexOf('out') > 0 || anim.indexOf('Out') > 0){
                _removeAnimateCSSClasses(el);
                el.hide();
            }
            //if(wasLocked)
                //PPW.unlock();
        };
        var oEl= null,
            elList= [];

        el= $(el);
        // if any of the elements should not be animated because it is in another language
        if(_conf.currentLang){
            el.each(function(){

                oEl= this;

                if(oEl.className){
                   if(
                       oEl.className.match(/(^| )LANG\-/)
                       &&
                       !$(this).hasClass('LANG-'+_conf.currentLang)
                     ){
                       return;
                   }else{
                       elList.push(oEl);
                   }
               }else{
                   elList.push(oEl);
               }
            });
            el= $(elList);
        }

        //PPW.lock();
        if(_conf.animations.indexOf(anim) >= 0){
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
                if(settings.delay || settings.delay === 0){
                    if(isNum(settings.delay)){
                        settings.delay= settings.delay+'ms';
                    }
                    el.css({
                        'webkitAnimationDelay': settings.delay,
                        'mozAnimationDelay'   : settings.delay,
                        'msAnimationDelay'    : settings.delay,
                        'oAnimationDelay'     : settings.delay,
                        'animationDelay'      : settings.delay
                    });
                }
                if(settings.count){

                    el[0].style.webkitAnimationIterationCount= settings.count;
                    el[0].style.mozAnimationIterationCount= settings.count;
                    el[0].style.oAnimationIterationCount= settings.count;
                    el[0].style.animationiterationcount= settings.count;
                    el[0].style.animationIterationCount= settings.count;
                    /*
                    // apparently, browsers do not allow this property to be set on the fly!
                    el.css({
                        'webkitAnimationIterationCount': settings.count,
                        'mozAnimationIterationCount'   : settings.count,
                        'msAnimationIterationCount'    : settings.count,
                        'oAnimationIterationCount'     : settings.count,
                        'animationiterationcount'      : settings.count
                    });
                    */
                }
                if(settings.onstart && typeof settings.onstart == 'function'){
                    el.one('webkitAnimationStart', settings.onstart);
                    el.one('msAnimationStart', settings.onstart);
                    el.one('oAnimationStart', settings.onstart);
                    el.one('animationstart', settings.onstart);
                }
            }
            el.one('webkitAnimationEnd', onEnd);
            el.one('mozAnimationEnd', onEnd);
            el.one('msAnimationEnd', onEnd);
            el.one('oAnimationEnd', onEnd);
            el.one('animationend', onEnd);

            _removeAnimateCSSClasses(el[0]);

            if(anim.indexOf('in') > 0 || anim.indexOf('In') > 0){
                el.show();
            }

            el.removeClass('ppw-anim-'+anim).addClass('animated ppw-anim-visible ppw-anim-'+
                                                      anim);

        }else{
            throw new Error("Invalid animation "+anim);
            return false;
        }
    };

    /**
     * Resets the coordinates, zoom and rotate effects currently applied.
     */
    var _resetViewport= function(){

        if(_conf.currentZoom!=1){
            _viewport({zoom: 1});
            _conf.currentZoom= 1;
        }
    }

    /**
     * Viewports(zoom and rotate) to a coordinate or element.
     *
     * This method goes to a specific coordinate and amplifies it the given
     * times.
     *
     * The object can combine properties to apply both rotation effect and zoom.
     *
     * @param Object An object that may contain: zoom, target, left, top, rotate
     * @return PPW.
     **/
    var _viewport= function(data){

        var vendor= $.browser.webkit? '-webkit-':
                        $.browser.mozilla? '-moz-':
                            '',
            curTransform= $b.css(vendor+'transform'),
            matrix= [1, 0, 0, 1, 0, 0],
            mx= null,
            target= $b,
            callback= false,
            useObjectConfig= false,
            sentTarget= false,
            container= _settings.applyZoomTo || $('.ppw-active-slide-element-container').eq(0),
            l, t, w, h, hCenter, vCenter, hLimit, vLimit;

        // only applies the effects if the presentation has started and it is not in thumbs view mode.
        if(!_conf.presentationStarted || _conf.inThumbsMode)
            return false;

        useObjectConfig= true;

        if(data.left || data.left === 0)
            data.left= data.left;
        if(data.top || data.top === 0)
            data.top= data.top;
        if(data.target){
            data.target= (typeof data.target == 'string')? $(data.target).eq(0): data.target;
            sentTarget= true;
        }
        if(data.rotate)
            data.rotate= data.rotate;
        if(data.callback){
            data.callback= data.callback;
        }

        data.times= data.zoom||2;

        if(sentTarget){
            data.left= target[0].offsetLeft + target[0].offsetWidth/2;
            data.top= target[0].offsetTop + target[0].offsetHeight/2;
        }

        data.times= ((data.times||1));
        if(data.times <= 0) data.times= 0.1;
        if(data.times > _conf.zoomMax) data.times= _conf.zoomMax;

        l= target[0].offsetLeft;
        t= target[0].offsetTop;
        w= target[0].offsetWidth;
        h= target[0].offsetHeight;
        hCenter= l/2 + w/2;
        vCenter= t/2 + h/2;

        if(data.left < 0) data.left= 0;
        if(data.top < 0) data.top= 0;

        data.left= (data.left == undefined || data.left === false)? hCenter: parseInt(data.left, 10);
        data.top = (data.top == undefined || data.top === false)? vCenter: parseInt(data.top, 10);

        hLimit= l+w - (l*data.times)/2;
        vLimit= t+h - (t*data.times)/2;

        if(data.left >= hLimit){
            data.left= hLimit;
        }
        if(data.top >= vLimit){
            data.top= vLimit;
        }

        if(!curTransform || curTransform == 'none'){
            curTransform= '';
        }else{
            if(mx= curTransform.match(/matrix\(([0-9\,\.\- ]+)\)/)){
                if(mx[1]){
                    curTransform= curTransform.replace(/matrix\(([0-9\,\.\- ]+)\)/g, '');
                    mx= mx[1].replace(/ /g, '').split(',');
                }
            }
            curTransform= curTransform.replace(/scale\(([0-9\,\.\- ]+)\)/, '');
        }
        if(!mx)
            mx= matrix;

        mx[0]= mx[3]= data.times;

        if(data.rotate != undefined){
            mx[1]= mx[2] = 0;
            curTransform= curTransform.replace(/rotate\(([0-9\,\.\- ]+)\)/g, '');
            curTransform+= " rotate("+data.rotate+"deg)";
            _conf.currentRotate= data.rotate;
        }

        curTransform+= " matrix(" + mx.join(', ')+") ";
        container.css(vendor+'transform-origin', data.left+'px '+data.top+'px');
        container.css(vendor+'transform', curTransform);
        _conf.currentZoom= data.times;
        return PPW;
    };


    /**
     * Applies a zoom effect, incrementing the current zoom by the given value.
     *
     * @param Real The multiplier which will be incremented to the current zoom.
     * @param Int The left coordinate for the center of the effect.
     * @param Int The right coordinate for the center of the effect.
     * @param Real Degrees to rotate the canvas while zooming.
     */
    var _zoomBy= function(by, left, top, rotate){
        _conf.currentZoom+= by;
        _viewport({zoom: _conf.currentZoom, left: left, top: top, rotate: rotate});
    }

    /**
     * Rotate the canvas.
     *
     * Notice that, this rotate method will probably reset any applied zoom.
     * If you want to both zoom and rotate, use the viewport method with its fourth
     * parameter.
     *
     * @param Real Degrees to rotate.
     * @return PPW.
     **/
    var _rotate= function(deg){

        var vendor= $.browser.webkit? '-webkit-':
                        $.browser.mozilla? '-moz-':
                            '',
            curTransform= $b.css(vendor+'transform'),
            to= $b.css(vendor+'transform-origin');

        if(!_conf.presentationStarted)
            return false;

        if(!to || to.replace(/0px| /g, '') == ''){
            $b.css(vendor+'transform-origin', '50% 50%');
        }

        if(curTransform && curTransform != 'none' && curTransform.indexOf('rotate') > -1){
            curTransform= curTransform.replace(/rotate\(.+\)/i, 'rotate('+deg+')');
        }else{
            curTransform+= ' rotate('+deg+'deg)';
        }

        $b.css(vendor+'transform', curTransform);

        return PPW;
    };

    /**
     * Locks the user controls.
     *
     * If an HTML element is given, only this element allows the user interacion
     * such as click or keyboard events.
     *
     * @param HTMLElement
     */
    var _lock= function(allowedElement){
        _conf.locked= allowedElement||true;
        $('#ppw-arrows-container').fadeOut();
        $('#ppw-toolbar-container').hide();
        console.log("[PPW] Locked user interaction");
        _triggerEvent('onlock');
    };

    /**
     * Verifies if the platform is locked according to the refered event.
     *
     * Power Polygon may be locked, but allowing events for one specified element,
     * if that element is the target of the given event, it should be triggered.
     *
     * Link elements(with the tag A) will be accepted even when locked.
     */
    var _isLocked= function(evt){

        if(!evt)
            return true;

        if(!_conf.locked)
            return false;

        if(_conf.locked !== true){
            return evt.target != _conf.locked;
        }else{
            if(evt.target.tagName.toUpperCase() == 'A')
                return false;
            return true;
        }
    }


    /**
     * Tries to enable the remote control to the talk.
     */
    var _enableRemote= function(){
        PPW.remote.connect();
    };

    var _initRemoteService= function(){

        var srv= _settings.remote.server||_conf.defaultRemoteServer;

        if(!_settings.remote)
            return false;

        if(!PPW.remote.server){
            $('#ppw-remote-io-script').remove();

            _loadScript('/ppw/_tools/remote/server.js');
            // in 3 seconds, verify again for the status
            setTimeout(_initRemoteService, 3000);
        }else{
            PPW.remote.init(_self, _settings, _conf, _createPPWSrcPath(''));
        }
    };

    /**
     * Unlocks the user controls.
     */
    var _unlock= function(){
        _conf.locked= false;
        $('#ppw-arrows-container').fadeIn();
        $('#ppw-toolbar-container').show();
        console.log("[PPW] Unlocked user interaction");
        _triggerEvent('onunlock');
    };

    /**************************************************
     *                GETTERS/SETTERS                 *
     **************************************************/
     // These methods allow you to exchange useful    //
     // data with Power Polygon.                      //
     //                                               //
     // These methods set the settings properties,    //
     // retrieve them, or get useful, already parsed  //
     // and prepared data.                            //
     /*************************************************/
    /**
     * Returns the list os slide objects.
     *
     * @return Array The array list of all the Slide objects.
     */
    var _getSlides= function(){
        return _settings.slides;
    };

    /**
     * Retrieves the current slide object.
     *
     * @return SlideElement
     */
    var _getCurrentSlide= function(){
        return _settings.slides[_conf.currentSlide];
    };

    /**
     * Returns the array with the "alert at" times.
     *
     * @return Array
     */
    var _getAlertAtTimes= function(){
        return _settings.alertAt;
    };

    /**
     * Returns the timestamp when the presentation started, or false.
     *
     * @return Boolean Whether the presentation has started or not.
     */
    var _getStartedAt= function(){
        return _conf.presentationStarted;
    };

    /**
     * Returns properties from the given settings.
     *
     * @param The key to be retrieved.
     * @return Mixed
     **/
    var _get= function(key){
        if(key == 'profiles'){
            return _conf.profiles;
        }
        return _settings[key]||false;
    };

    /**
     * Sets properties on settings.
     *
     * @param String The key to be set.
     * @param Mixed The value to be set.
     */
    var _set= function(key, value){
        _settings[key]= value;
    };

    /**
     * Returns a chached DOM element, or cache it, if it is not there yet.
     *
     * @param String The element selector
     * @return jQueryObject
     */
    var _getAndCache= function(selector){
        if(!_c[selector])
            _c[selector]= $(selector);
        return _c[selector];
    };

    /**
     * Toggles the camera in the interface.
     */
    var _toggleCamera= function(){
        if(_conf.showingCamera)
            _pauseCamera();
        else
            _startCamera();
    }

    /**
     * Creates the default icons on the toolbar
     */
    var _createDefaultIcons= function(){
        
        _createIcon({
            id: 'ppw-toolbox-icon',
            description: "Open the Presentation Tool",
            image: _createPPWSrcPath('_images/toolbox.png'),
            click: _openPresentationTool
        }, true);
        _createIcon({
            id: 'ppw-fullscreen-icon',
            description: "Show the presentation in full screen mode",
            image: _createPPWSrcPath('_images/fullscreen.png'),
            click: _enterFullScreen
        }, true);
        _createIcon({
            id: 'ppw-ct-print',
            description: "See printable version",
            image: _createPPWSrcPath('_images/print.png'),
            click: _print
        }, true);
        _createIcon({
            id: 'ppw-remote-icon',
            description: "Enable remove control",
            image: false, //_createPPWSrcPath('_images/remote-conection-status-no-server.png'),
            click: _enableRemote
        }, true).attr('rule', 'no-server');
        
        _createIcon({
            id: 'ppw-settings-icon',
            description: "Shows the settings pannel",
            image: _createPPWSrcPath('_images/settings-icon.png'),
            click: _showConfiguration
        }, true);

        // horizontal
        _createIcon({
            id: 'ppw-ct-text-big',
            description: "Bigger fonts",
            content: "A<span>↑</span>",
            className: 'ppw-bigger-fonts-btn',
            click: _biggerFonts
        });
        _createIcon({
            id: 'ppw-ct-text-small',
            description: "Smaller fonts",
            content: "A<span>↓</span>",
            className: 'ppw-smaller-fonts-btn',
            click: _smallerFonts
        });
        _createIcon({
            id: 'ppw-camera-icon',
            description: "Opens or closes your camera for the audience",
            image: _createPPWSrcPath('_images/camera.png'),
            click: _toggleCamera
        });
        _createIcon({
            id: 'ppw-ct-thumbs',
            description: "Show slides thumbnails",
            image: _createPPWSrcPath('_images/thumbs.png'),
            click: function(){ _showThumbs(); _closeToolbar(); }
        });
        _createIcon({
            id: 'ppw-goto-icon',
            description: "Go to a specific slide by its index",
            image: _createPPWSrcPath('_images/goto.png'),
            click: _showGoToComponent
        });
        _createIcon({
            id: 'ppw-search-icon',
            description: "Search through slides",
            image: _createPPWSrcPath('_images/search.png'),
            click: _showSearchBox
        });
    }


    /**
     * Adds an icon with its functionalities to the toolbar on top.
     *
     * @paran Object The icon data: {id, description, click[, className, content] }
     * @return jQueryObject A reference to the created icon.
     */
    var _createIcon= function(iconData, v){

        var toolBar= _getAndCache(v? '#ppw-toolbar-v': '#ppw-toolbar-h'),
            d= 0,
            /*specialStyle= v? '-webkit-transition-delay: '+iconData.delay+'; '+
                             '-moz-transition-delay: '+iconData.delay+'; '+
                             'transition-delay: '+iconData.delay+ '; ': '',*/
            icon= $('<span id="ppw-toolbaricon-'+iconData.id+'"\
                        class="ppw-icon ppw-clickable '+(iconData.className||'')+'" \
                        alt="'+iconData.description+'" \
                        title="'+iconData.description+'" \
                        style="'+(iconData.image? 'background-image: url('+iconData.image+');': '')+'">\
                        '+(iconData.content||'')+'</span>');
        if(v){
            toolBar.prepend(icon);
        }else{
            toolBar.append(icon);
        }

        d= (_conf.toolbarIcons[v?'v': 'h'].length * 0.05)+'s';
        d= 'all 0.3s linear '+d;
        // adding a small delay
        icon.css({
                '-webkit-transition': d,
                '-moz-transition': d,
                'transition': d,
        });

        if(typeof iconData.click == 'function'){
            //icon.bind('click', iconData.click);
            $('#ppw-toolbaricon-'+iconData.id).live('click', function(evt){
                /*$('.ppw-icon').removeClass('active');
                $(this).addClass('active');*/
                iconData.click(evt);
            });
        }

        _conf.toolbarIcons[v?'v': 'h'].push(iconData);
        return icon;
    };

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
     // This is the constructor.                      //
     // This method is the first method called by     //
     // Power Polygon and should identify some        //
     // variables and status.                         //
     /*************************************************/
    var _constructor= function(){

        // let's create some global useful variables
        _w.auto= 'auto';
        _w.click= 'click';
        _w.global= 'global';
        _w._p= _w.P= PPW;

        if(_querystring('remote-controller')){
            _conf.remoteControl= true;
            _settings.Facebook= false;
            _settings.useArrows= false;
            _settings.preloadImages= false;
            _settings.useSplashScreen= false;
            _settings.Google= false;
            $(document.body).addClass('remote-controller');
            top.ppwFrame= _w.PPW;
        }

        var isMobile= false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobile= true})(navigator.userAgent||navigator.vendor||window.opera);
        _conf.isMobile= isMobile;

        _createSplashScreen();

        if(!_isInPrintableVersion()){
            _conf.currentSlide= _getCurrentSlideFromURL();
            _goToSlide(_conf.currentSlide);
        }else{
            _goToSlide(0);
        }

        if(!_isInPrintableVersion()){
            _bindEvents();
        }else{
            _triggerEvent('onthemeloaded', _settings.themeSettings);
            $('#ppw-lock-loading').hide();
        }

        _initRemoteService();
    };

    _addListener('onload', _constructor)

    /**************************************************
     *                 PUBLIC OBJECT                  *
     **************************************************/
     // All the properties returned in this object    //
     // will be exposed by the API, becoming global   //
     // variables and functions on the PPW namespace  //
     /*************************************************/
    return {
        version                         : _version,
        init                            : _init,
        setLoadingBarStatus             : _setLoadingBarStatus,
        testConnection                  : _testConnection,
        enterFullScreen                 : _enterFullScreen,
        testResolution                  : _testResolution,
        openPresentationTool            : _openPresentationTool,
        goNextSlide                     : _goNextSlide,
        goNext                          : _goNextSlide,
        goPreviousSlide                 : _goPreviousSlide,
        goPrevious                      : _goPreviousSlide,
        goPrev                          : _goPreviousSlide,
        testAudio                       : _testAudio,
        extend                          : _extend,
        startCamera                     : _startCamera,
        stopCamera                      : _pauseCamera,
        showMessage                     : _showMessage,
        showWarning                     : _showWarning,
        showWarn                        : _showWarning,
        showError                       : _showError,
        toggleCamera                    :  _toggleCamera,
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
        showThumbs                      : _showThumbs,
        biggerFonts                     : _biggerFonts,
        smallerFonts                    : _smallerFonts,
        print                           : _print,
        onSlideEnter                    : _onSlideEnter,
        onSlideExit                     : _onSlideExit,
        onSlideUndo                     : _onSlideUndo,
        onSlideDoes                     : _onSlideDoes,
        viewport                        : _viewport,
        rotate                          : _rotate,
        goToSlide                       : _goToSlide,
        enableRemote                    : _enableRemote,
        remote                          : {},
        //triggerEvent                   : _triggerEvent,
        // API GETTERS/SETTERS METHODS
        getSlides                       : _getSlides,
        getValidSlides                  : _getValidSlides,
        getCurrentSlide                 : _getCurrentSlide,
        getAlertAtTimes                 : _getAlertAtTimes,
        getStartedAt                    : _getStartedAt,
        getNextSlide                    : _getNextValidSlide,
        getPrevSlide                    : _getPrevValidSlide,
        setProfile                      : _setPresentationProfile,
        lock                            : _lock,
        unlock                          : _unlock,
        setCurrentPath                  : _setCurrentPath,
        isLocked                        : function(){return _conf.locked;},
        get                             : _get,
        set                             : _set,
        Facebook                        : true,
        Google                          : true,
        pushState                       : _pushState,
        getPPWPath                      : _getPPWPath,
        createIcon                      : _createIcon
    };

})(window.jQuery, document, window.console);
