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
        _tmp= {},
        
        // internal configuration properties
        _conf= {
            loadSteps: 6,
            curLoaded: 0,
            showingCamera: false,
            preloadedSlidesCounter: 0,
            cameraLoaded: false,
            presentationTool: null,
            currentLang: 'en',
            profiles: {},
            slidesLoaded: false,
            themeLoaded: false,
            fontSize: 100,
            testingResolution: false,
            currentZoom: 1,
            currentRotate: 0,
            zoomMax: 40,
            
            // MODES
            inThumbsMode: false,
            
            prevStyle: {
                margin: '0px',
                padding: '0px',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: '0px',
                left: '0px'
            },
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
                theme: 'thm-default',
                transition: 'trans-slider',
                slideType: 'content',
                slideTitleSize: 40,
                containerID: 'ppw-slides-container'
            },
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
                 * used for the fsPattern settings.
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
            },
            currentSlide: 0,
            presentationStarted: false
        },
        
        // user defined settings
        
        _settings= {
            hashSeparator: '#', // the separator to be used on the address bar
            PPWSrc: "../../ppw/", // wondering the talk is in /talks/talkname for example
            shortcutsEnable: true, // enables or not, the shortcuts
            friendlyURL: 'id', // may be false(also, 'num') or id(slide' id)
            useSplashScreen: true, // should ppw open the splash screen first?
            slidesContainer: _d.createElement('div'),
            theme: _conf.defaults.theme,
            transition: _conf.defaults.transition,
            fsPattern: _conf.cons.fs.SLIDE_ID_DIR_ID,
            alertAt: _conf.defaults.alertAt,
            duration: _conf.defaults.duration,
            showBatteryAlerts: true,
            showOfflineAlerts: true,
            slidesCache: true,
            profile: 'none',
            fixTransformsOnSlideChange: true,
            zoomOnScroll: true,
            slidesPerPage: 1 // not working properly because no browser support 100%it by now
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
     * Tries to auto generate a config object from the document structure.
     * 
     * All the sections will be treated as slides.
     * The document title will be treated as he talk title.
     * First section will be the openning slide.
     * Last section will be the closing slide.
     * All the other sections will be of type "content".
     */
    var _autoGenerateConfig= function(conf){
        var o= {
                title: _d.title,
                authors: [],
                PPWSrc: "../../ppw/",
                transition: _conf.defaults.transition,
                theme: _conf.defaults.theme
            },
            i= 0,
            l= 0,
            slideList= [];
        
        if(conf){
            o= $.extend(o, conf);
        }
        
        o.slides= [];
        slideList= $('section');
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
     */
    var _init= function(conf){
        
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
        
        if(_settings.shortcutsEnable && !_isInPrintableVersion()){
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
        
        $('#ppw-loadingbar').css({width: perc+'%'});
        
        if(perc >= 100){
            _triggerEvent('onthemeloaded', _settings.themeSettings);
            if(!_settings.useSplashScreen)
                _preloadSlides();
            $('#ppw-lock-loading').fadeOut();
        }
    };
    
    /**
     * Returns the value of the given param in the URL.
     * @return Mixed Empty array, or 
     */
    var _querystring= function(key) {
        var re=new RegExp('(?:\\?|&)'+key+'=(.*?)(?=&|$)','gi');
        var r=[], m;
        while ((m=re.exec(_l.search)) != null) r.push(m[1]);
        return r.length? r[0]: false;
    }
    
    /**
     * Loads the theme's files.
     * 
     * This method loads the theme' manifes.json file, and then, its
     * dependencies.
     */
    var _loadTheme= function(){
        
        var theme= null,
            transition= _querystring('transition');
        
        if(typeof _settings.theme == 'string')
            _settings.theme= _settings.theme.replace(/ /g, '').split(',');
        
        if(transition){
            _settings.transition= transition;
        }
        
        if(_settings.transition)
            _settings.theme.push(_settings.transition);
        
        _conf.loadSteps+= _settings.theme.length-1;
        
        $(_settings.theme).each(function(){
            var theme= this.toString();
            $.getJSON(_settings.PPWSrc+'/_themes/'+theme+'/manifest.json', function(data, status){

                var dependencies= false,
                    i= 0,
                    l= 0,
                    url= '';

                console.log("[PPW] Loading theme: "+ theme);

                if(status == 'success'){

                    _conf.themeData= data;
                    dependencies= _conf.themeData.dependencies||[];

                    if(dependencies.css){
                        _conf.loadSteps+= dependencies.css.length;
                        l= dependencies.css.length;

                        for(i= 0; i<l; i++){
                            url= _settings.PPWSrc+'/_themes/'+
                                 theme+'/'+dependencies.css[i];

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
                                        theme+'/'+dependencies.js[i],
                                        function(data, status, xhr){
                                            _setLoadingBarStatus();
                                        });
                        }
                    }

                }else{
                    console.error("[PPW][Theme data] Could not load manifest.json! Theme: " + theme);
                }
                _setLoadingBarStatus();
            });
        });
    };
    
    /**
     * Prepares the page to load the required files.
     * 
     * This method adds the loading bar and then loads the required scrips and
     * styles.
     */
    var _preparePPW= function(){
        
        $b.append("<div id='ppw-lock-loading' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; background-color: #f0f9f9; padding: 10px; font-family: Arial; z-index: 999999999;'>\
                    Loading Contents<br/><div id='ppw-loadingbarParent'><div/><div id='ppw-loadingbar'><div/></div>");
        $('#ppw-loadingbarParent').css({
            width: '260px',
            height: '8px',
            border: 'solid 1px black',
            background: 'white',
            orverflow: 'hidden'
        });
        $('#ppw-loadingbar').css({
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
         
         
         _tmp.lnk = _d.createElement('link');
         _tmp.lnk.type = 'image/x-icon';
         _tmp.lnk.rel = 'shortcut icon';
         _tmp.lnk.href = _settings.PPWSrc+'/_images/power-polygon-icon.png';
         _d.getElementsByTagName('head')[0].appendChild(_tmp.lnk);
         delete _tmp.lnk;
         
        _loadTheme();
         if(!_isInPrintableVersion()){
            _bindEvents();
         }else{
             _triggerEvent('onthemeloaded', _settings.themeSettings);
             $('#ppw-lock-loading').hide();
         }
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
                $('#'+slide.id).parent().removeClass('ppw-slide-not-in-profile');
            }else{
                $('#'+slide.id).parent().addClass('ppw-slide-not-in-profile');
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
        //$b.removeClass('.LANG-').addClass('.LANG-'+lang);
        _b.className= _b.className.replace(/LANG_[a-z]+( |$)/ig, '');
        $b.addClass('LANG_'+lang);
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
            
            if(_isInPrintableVersion()){
                _preparePrintableVersion();
            }
            
            $('.ppw-slide-container').click(function(evt){
                if(_conf.inThumbsMode){
                    _goToSlide($(this).data('ppw-slide-ref'));
                    evt.preventDefault();
                    evt.stopPropagation();
                    return false;
                }
            });
        
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
        
        //$(".ppw-slide-container:not(.ppw-slide-not-in-profile), .ppw-slide-container:not(.ppw-slide-not-in-profile) section").show();
        
        _conf.prevStyle= {
            margin: el.css('margin'),
            padding: el.css('padding'),
            width: el.css('width'),
            height: el.css('height'),
            position: el.css('position'),
            top: el.css('top'),
            left: el.css('left')
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
            
            // if the element is an input or has the ppw-focusable class
            // then no shortcut will be executed.
            if(_isEditableTarget(evt.target) &&
               evt.keyCode != 27/*esc*/ &&
               evt.keyCode != 32/*space*/ &&
               evt.keyCode != 70/*F*/
              ){
                return true;
              }
                
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
                    
                    if(evt.keyCode == 32 /*space*/ && evt.altKey){
                        _closeMessage();
                        _showThumbs();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    
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
                    
                case 18: // alt
                    if(_settings.shortcutsEnable
                        && _conf.presentationStarted
                        && !_isEditableTarget(evt.target)){
                        _showGoToComponent(true);
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                
                case 27: // esc
                    if(_d.getElementById('ppw-message-box').style.display != 'none'){
                        _closeMessage();
                        _pauseCamera();
                        evt.preventDefault();
                        evt.stopPropagation();
                        if(_conf.currentZoom != 1){
                            _resetViewport();
                        }
                        return false;
                    }
                    if(_conf.inThumbsMode){
                        _goToSlide(_conf.currentSlide);
                    }
                    break;
                    
                case 70: // F
                    if(evt.altKey){
                        _showSearchBox();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                    
                case 80: // P
                    /*if(evt.altKey || evt.ctrlKey){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }*/
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
        
        $d.bind('keypress', function(evt){
            if(evt.altKey){
                evt.preventDefault();
                evt.stopPropagation();
                return false;
            }
            
            switch(evt.keyCode){
                /*case 112: // P
                    if(evt.altKey || evt.ctrlKey){
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }
                    break;
                */
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
                
                case 80: // P
                    /*if(evt.altKey || evt.ctrlKey){
                        _print();
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                    }*/
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
            
            // when the user holds a key
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
                _goToSlide(_getCurrentSlideFromURL());
        }, false);
        
        /**
         * Mouse events.
         */
        $d.bind('click', function(evt){
            
            if(_conf.presentationStarted && !_isEditableTargetContent(evt.target)){
                
                /*if(_conf.currentZoom !== 1){
                    _resetViewport();
                }else{*/
                    if(!_conf.inThumbsMode)
                        _goNextSlide();
                //}
                
                evt.stopPropagation();
                evt.preventDefault();
                return false;
            }
            return true;
        });
        
        // scrolling, for zoom
        if(_settings.zoomOnScroll){
            mouseWheelFn= function(event){

                var container= $('.ppw-active-slide-element-container').eq(0)[0],
                    centerH= container.offsetWidth/2,
                    centerV= container.offsetHeight/2,
                    evt= event.originalEvent,
                    delta = evt.detail < 0 || evt.wheelDelta > 0 ? 1 : -1,
                    zommAdd= delta>0? 0.1: -0.1,
                    newZoom= _conf.currentZoom + zommAdd,
                    posH= evt.offsetX, posV= evt.offsetY,
                    finalH= posH,//(centerH + ((centerH - posH)*-1)) * newZoom,
                    finalV= posV;

// todo: Find a better way of applying a zoom referencing the mouse position
//console.log({posH: posH, centerH: centerH, finalH: finalH, newZoom: newZoom});

                if(_conf.presentationStarted && !_isEditableTargetContent(evt.target)){
                    evt= evt.originalEvent;

                    if(delta > 0){ // up
                        _zoomBy(0.1, finalH, finalV);
                    }else{ // down
                        _zoomBy(-0.1, finalH, finalV);
                    }
                }
            }
            $d.bind('DOMMouseScroll', mouseWheelFn);
            $d.bind('mousewheel', mouseWheelFn);
        }
        
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
                            if(_n.battery.dischargingTime < _settings.duration){
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
        
        _w.addEventListener('resize', function(e){
            _triggerEvent('onresize', {window: _w, event: e});
        });
        
        _w.onbeforeunload= function(){
            
            if(_conf.presentationTool)
                _conf.presentationTool.close();
            return null;
        };
        
        /*$b.bind('selectstart', function(evt){
            
            if(_isEditableTargetContent(evt.target))
                return true;
            
            evt.preventDefault();
            evt.stopPropagation();
            return false;
        });*/
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
                  ALT+Space: Show slides thumbnails<br/>\
                  Scroll: Applies zoom in and out<br/>\
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
    var _preloadSlides= function(){
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
            if(!el.length){ // should load it from ajax
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
                                     .html("<h4 style='font-size: 22px;'>Failed loading slide <span class='ppw-slide-fail'>"+slide.id+"</span>!</h4>"+
                                           "<div class='ppw-slide-fail-help' style='font-size:13px;'>Please verify the slide id.<br/>Power Polygon looks for the slide's content following these rules:<br/>"+
                                           "<br/>* A section element on the page, with the given id:<br/>Eg.: &lt;section id='"+slide.id+"'>Your content&lt;/section><br/>"+
                                           "<br/>* A file in the fsPattern location.<br/>Currently looking at: <span class='ppw-slide-fail'>"+addr+"</span><br/><br/>"+
                                           "The content could not be found in any of these expected places!</div>");
                                
                                console.error("[PPW][Slide loading]: Slide not found!", slide);
                                _slidePreloaderNext();
                            }
                        })(slides[i], i)
                    });
                el= $('section#'+slides[i].id);
            }else{ // the slide content is already on the DOM
                
                _settings.slides[i].el= el[0];
                tt= el.find('h1, h2, h3, h4, h5, h6')[0];
                tt= tt? tt.innerHTML: el[0].textContent.substring(0, _conf.defaults.slideTitleSize);
                _settings.slides[i].title= tt;
                _settings.slides[i].index= i+1;
                
                
                
                $(container).append("<div id='ppw-slide-container-"+slides[i].id+"' class='ppw-slide-container'></div>");
                //_slidePreloaderNext(_settings.slides[i]); return;
                
                
                $('#ppw-slide-container-'+slides[i].id).append(el[0]);
                
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
            
            $("#ppw-slide-container-"+slides[i].id).data('ppw-slide-ref', slides[i]);
            
            if(slides[i].profile){
                _conf.profiles[slides[i].profile]= true;
            }
            if(_settings.profile)
                _conf.profiles[_settings.profile]= true;
            
            slides[i].actionIdx= 0;
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
            _showMessage("Go to slide:<br/><input style='margin: auto;' type='integer' id='ppw-go-to-slide' value='' />", false, false);
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
     */
    var _showSearchBox= function(){
        var content= "Search into slides:<br/>\
                      <div><input style='margin: auto;' type='search' id='ppw-search-slide' value='' />\
                      <span id='ppw-search-prev' class='ppw-clickable' title='Find in previous slides(shift+enter)'>◄</span> <span id='ppw-search-next' title='Find in next slides(enter)' class='ppw-clickable'>►</span></div><div id='ppw-search-found' class='ppw-clickable'></div>",
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
        
        if(_isInPrintableVersion()){
            $b.addClass('printing-1');
            _preloadSlides();
            return true;
        }
        
        // APPENDING THE CAMERA, TOOLBAR, SOCIAL BUTTONS AND MESSAGE-BOX TO THE DOCUMENT
        $b.append('<div id="fb-root"></div>');
        
        $b.append('<div id="ppw-message-box"  class="ppw-clickable ppw-platform">\
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
        
        $b.append('<div id="ppw-toolbar-container" class="ppw-platform '+_conf.cons.CLICKABLE_ELEMENT+'">\
                    <div id="ppw-toolbar" class="ppw-platform '+_conf.cons.CLICKABLE_ELEMENT+'">\
                        <div class="img"><img id="ppw-goto-icon" onclick="PPW.showGoToComponent(false);" title="Go to a specific slide" /></div>\
                        <div class="img"><img id="ppw-toolbox-icon" onclick="PPW.openPresentationTool();" title="Open Presentation Tool" /></div>\
                        <div class="img"><img id="ppw-search-icon" onclick="PPW.showSearchBox()" title="Search on slides"/></div>\
                        <div class="img"><img id="ppw-fullscreen-icon" onclick="PPW.enterFullScreen()" title="Go Fullscreen"/></div>\
                        <div class="img"><img id="ppw-camera-icon" onclick="PPW.toggleCamera();" title="Start the camera"/></div>\
                        <div class="img"><img id="ppw-settings-icon" onclick="PPW.showConfiguration();" title="Settings"/></div>\
                    </div>\
                    <div id="ppw-content-toolbar" class="ppw-platform">\
                        <span id="ppw-ct-text-small" title="Smaller fonts" onclick="PPW.smallerFonts();">A</span>\
                        <span id="ppw-ct-text-big" title="Bigger fonts" onclick="PPW.biggerFonts();">A</span>\
                        <img id="ppw-ct-thumbs" onclick="PPW.showThumbs();" title="Show thumbnails"/>\
                        <img id="ppw-ct-print" onclick="PPW.print();" title="Print or save as PDF"/>\
                        <div id="ppw-presentation-social-buttons">\
                            <div class="fb-like" data-href="'+_l+'" data-send="false" data-width="450" data-show-faces="false"></div>\
                            <span class="gp-button"><div class="g-plusone" data-size="medium" data-annotation="none" data-href="'+_l+'"></div></span>\
                        </div>\
                    </div>\
                   </div>');
        
        // adding the svg blur effect, to be able to apply blur on firefox as well.
        $b.append('<svg id="ppw-svg-image-blur">\
                        <filter id="blur-effect-1">\
                            <feGaussianBlur stdDeviation="1" />\
                        </filter>\
                   </svg>');
        
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
                             
        $('#ppw-ct-thumbs').attr('src', _settings.PPWSrc+'/_images/thumbs.png')
                           .addClass(_conf.cons.CLICKABLE_ELEMENT);
                             
        $('#ppw-ct-print').attr('src', _settings.PPWSrc+'/_images/print.png')
                           .addClass(_conf.cons.CLICKABLE_ELEMENT);
                                 
        //$('#ppw-ct-text-only').addClass(_conf.cons.CLICKABLE_ELEMENT);

        if(_settings.useSplashScreen){
            
            $.get(_settings.PPWSrc+"_tools/splash-screen.html", {}, function(data){

                _d.body.innerHTML+= data;
                _setLoadingBarStatus();

                $('#ppw-goFullScreen-trigger').click(_enterFullScreen);
                $('#ppw-testResolution-trigger').click(_testResolution);
                $('#ppw-testAudio-trigger').click(_testAudio);
                $('#ppw-testCamera-trigger').click(PPW.toggleCamera);
                $('#ppw-testConnection-trigger').click(_testConnection);
                $('#ppw-talk-title').html(_settings.title);
                
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
               
            });
        }else{
            //_preloadSlides();
            _setLoadingBarStatus();
            //_startPresentation();
        }
        // applying Facebook Buttons
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=281929191903584";
            fjs.parentNode.insertBefore(js, fjs);
        }(_d, 'script', 'facebook-jssdk'));

        // applying the g+ buttons
        $.getScript('https://apis.google.com/js/plusone.js', function(){
        });
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
        el.show();
        _updateScreenSizes();
        _conf.testingResolution= true;
        _showMessage("This tool helps you to identify the boundaries of the screen and adjust colors or font sizes as necessary.<br/>\
<br/>Click in \"close\" when finished", function(){
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
     * Show a message in a floating box in the center of the screen.
     */
    var _showMessage= function(msg, fn, hideButton){
        
        var box= $('#ppw-message-box'),
            func= null;
        
        $('#ppw-message-content').html(msg);
        PPW.animate(box, 'fadeInDownBig', {
            duration: '1s'
        });
        box.css({
               marginLeft: -(box[0].offsetWidth/2)+'px'
               //, marginTop: -(box[0].offsetHeight/2)+'px'
           });
        
        if(hideButton)
            $('#ppw-message-box-button').hide();
        else
            $('#ppw-message-box-button').show();
        
        func= function(){
            if(fn && typeof fn == 'function'){
                try{
                    fn();
                }catch(e){
                    console.error('Failed executing callback on closing message', e, fn);
                }
            }
            
        }
        
        box.data('closeCallback', func)
        
        $('#ppw-message-box-button').one('click', _closeMessage);
        setTimeout(function(){
            _d.getElementById('ppw-message-box-button').focus();
        }, 100);
    };
    
    /**
     * Closes the message box
     */
    var _closeMessage= function(){
        
        var box= $('#ppw-message-box'),
            fn= box.data('closeCallback');
        
        PPW.animate(box, 'fadeOutUpBig', {
                duration: '1s',
                onstart: function(){
                    if(fn && typeof fn == 'function')
                        fn();
                    _d.getElementById('ppw-message-content').innerHTML= '';
                }
        });
        //_d.getElementById('ppw-message-box').style.display= 'none';
        //_d.getElementById('ppw-message-content').innerHTML= '';
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
            _conf.showingCamera= true;
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
            //PPW.cameraStream.pause();
            _conf.showingCamera= false;
            //_conf.cameraLoaded= false;
        }
        _triggerEvent('onhidecamera');
    };
    
    /**
     * Plays an audio so the speaker can test the sound.
     */
    var _testAudio= function(){
        
        /*var el= _d.getElementById('ppw-audioTestElement');
        if(!el){
            $b.append("<audio id='ppw-audioTestElement' autoplay='autoplay' loop='loop' controls='controls'>\
                                <source src='"+_settings.PPWSrc+"/_audios/water.mp3'/>\
                                <source src='"+_settings.PPWSrc+"/_audios/water.ogg'/>\
                               </audio>");
            el= _d.getElementById('ppw-audioTestElement');
        }*/
        //el.play();
        _showMessage("Playing audio<br/><div style='background: url("+_settings.PPWSrc+"/_images/animated-wave-sound.gif) 0px -37px no-repeat; position: relative; width: 220px; height: 30px; margin: auto; background-size: 248px 108px; border-left: solid 1px #fcc; border-right: solid 1px #fcc;' onclick='console.log(document.getElementById(\"ppw-audioTestElement\").pause())' /><div id='ppw-audioPlaceHolder'>",
                     function(){
                         
                         var el= _d.getElementById('ppw-audioTestElement'),
                            audio= new Audio(el);
                         //el.volume= 0;
                         el.pause();
                         audio.pause();
                     });
        $('#ppw-audioPlaceHolder').append("<audio id='ppw-audioTestElement' autoplay='autoplay' loop='loop' >\
                                <source src='"+_settings.PPWSrc+"/_audios/water.mp3'/>\
                                <source src='"+_settings.PPWSrc+"/_audios/water.ogg'/>\
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
        var toolSrc= _settings.PPWSrc+'/_tools/presentation-tool.html',
            toolName= 'ppw-Presentation-tool',
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
        
        if(!_conf.slidesLoaded)
            return;
        
        $('#ppw-splash-screen-container').animate({
            marginTop: '-460px'
        }, 200, function(){
            $('#ppw-splash-screen').fadeOut();
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
        
        _setHistoryStateTo(idx);
        
        _setSlideClasses(idx);
        
        // triggers the events
        if(_settings.slides[_conf.currentSlide].onSlideEnter){
            _settings.slides[_conf.currentSlide].onSlideEnter();
        }
        if(previousSlide.onSlideExit){
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
        
        var onEnd= function(event){
            
            if(settings.onend && typeof settings.onend == 'function'){
                try{
                    settings.onend(event, el, anim);
                }catch(e){};
            }
            //_removeAnimateCSSClasses(el);
        };
        
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
                //if(settings.onend && typeof settings.onend == 'function'){
                el.one('webkitAnimationEnd', onEnd);
                el.one('mozAnimationEnd', onEnd);
                el.one('msAnimationEnd', onEnd);
                el.one('oAnimationEnd', onEnd);
                el.one('animationend', onEnd);
                //}
            }
            
            _removeAnimateCSSClasses(el[0]);
            
            el.removeClass(anim).addClass('animated ppw-anim-visible ppw-anim-'+
                                           anim);
            
        }else{
            throw new Error("Invalid animation "+anim);
            return false;
        }
    };
    
    var _resetViewport= function(){
        if(_conf.currentZoom){
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
            container= $('.ppw-active-slide-element-container').eq(0),
            l, t, w, h, hCenter, vCenter, hLimit, vLimit;
        
        if(!_conf.presentationStarted)
            return false;
        
        //if(typeof times == 'object' && (times.zoom || times.target)){
            
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
        //}
        
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
    
    /**************************************************
     *                GETTERS/SETTERS                 *
     **************************************************/
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
    
    /**
     * Returns properties from the given settings.
     **/
    var _get= function(key){
        return _settings[key]||false;
    };
    
    /**
     * Sets properties on settings.
     */
    var _set= function(key, value){
        _settings[key]= value;
    };
    
    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    var _constructor= function(){
        _createSplashScreen();
        if(!_isInPrintableVersion()){
            _conf.currentSlide= _getCurrentSlideFromURL();
            _goToSlide(_conf.currentSlide);
        }else{
            _goToSlide(0);
        }
    };
    
    //$(_d).ready(_constructor);
    _addListener('onload', _constructor)
    
    
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
        stopCamera                      : _pauseCamera,
        showMessage                     : _showMessage,
        toggleCamera                    :  function(){ if(_conf.showingCamera) _pauseCamera(); else _startCamera(); },
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
        // API GETTERS/SETTERS METHODS
        getSlides                       : _getSlides,
        getValidSlides                  : _getValidSlides,
        getCurrentSlide                 : _getCurrentSlide,
        getAlertAtTimes                 : _getAlertAtTimes,
        getStartedAt                    : _getStartedAt,
        getNextSlide                    : _getNextValidSlide,
        getPrevSlide                    : _getPrevValidSlide,
        get                             : _get,
        set                             : _set
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
})();
