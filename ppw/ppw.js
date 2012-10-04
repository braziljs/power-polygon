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
            loadSteps: 5,
            curLoaded: 0,
            preloadedSlidesCounter: 0,
            cameraLoaded: false,
            presentationTool: null,
            currentLang: 'en',
            profiles: {},
            defaults: {
                duration: 50,
                alertAt: [30, 40],
                theme: 'default',
                slideType: 'content',
                slideTitleSize: 40
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
            theme: _conf.defaults.theme,
            fsPattern: _conf.cons.fs.SLIDE_ID_DIR,
            alertAt: _conf.defaults.alertAt,
            duration: _conf.defaults.duration,
            showBatteryAlerts: true,
            showOfflineAlerts: true,
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
        _triggerEvent('onload', conf);
        if(_settings.shortcutsEnable){
            _enableFuncKeys();
        }
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
        
        if(!slide.profile || slide.profile == 'none'
           || !_settings.profile || _settings.profile == 'none')
           return true;
       
        if(slide.profile != _settings.profile)
            return false;
            
        return true;
    }
    
    /**
     * Hides all the invalid slides for the current profile
     */
    var _setPresentationProfile= function(profile){
        
        var i= 0, l= _settings.slides.length,
            slide;
        
        if(profile === false)
            profile= 'none';
        if(profile)
            _settings.profile= profile;
        
        for(; i<l; i++){
            slide= _settings.slides[i];
            
            if(_isValidProfile(slide)){
                $('#'+slide.id).removeClass('ppw-slide-not-in-profile');
            }else{
                $('#'+slide.id).addClass('ppw-slide-not-in-profile');
            }
        }
        
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
        
        _triggerEvent('onslideloaded', loadedSlide);
        if(perc == 100){
            _setPresentationProfile();
            _setLION(_settings.defaultLanguage||_n.language);
            _triggerEvent('onslidesloaded', _settings.slides);
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
            if(_isEditableTarget(evt.target))
                return true;
                
            switch(evt.keyCode){
                case 37: // left
                case 40: // down
                case  8: // delete/backspace
                    if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
                        _goPreviousSlide();
                        evt.preventDefault();
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
                        return false;
                    }
                    break;
                
                case 27: // esc
                    if(_d.getElementById('ppw-message-box').style.display != 'none'){
                        _closeMessage();
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                default: {
                    if(_settings.shortcutsEnable){
                        if(evt.altKey && _conf.presentationStarted){
                            k= evt.keyCode - 48;
                            if(k>=0 && k<10){
                                _d.getElementById('ppw-go-to-slide').value+= k;
                                evt.preventDefault();
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
                            s= parseInt(s.value, 10)||0;
                            _goToSlide(s);
                        }
                        _closeMessage();
                        evt.preventDefault();
                    }
                    return false;
                    break;
                    
                case 117: // F6
                    s= _triggerEvent('F6_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                case 118: // F7
                    s= _triggerEvent('F7_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                case 119: // F8
                    s= _triggerEvent('F8_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                case 120: // F9
                    s= _triggerEvent('F9_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                case 121: // F10
                    s= _triggerEvent('F10_PRESSED');
                    if(!s){
                        evt.preventDefault();
                        return false;
                    }
                    break;
                    
                case 70: // F
                    _showSearchBox();
                    break
            }
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
            if(_conf.presentationStarted && !_isEditableTarget(evt.target)){
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
                        _showNotification("Your battery stoped charging!");
                    }else{
                        _closeNotification();
                    }
                }, false);

                _addListener('onthemeloaded', function(){
                    setTimeout(function(){
                        if(!_n.battery.charging){
                            if(_n.battery.dischargingTime / 60 < _settings.duration){
                                _showNotification("You have "+ (_n.battery.dischargingTime / 60)+" minutes of battery!");
                            }
                        }
                    }, 1000);
                });
            }
        }
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

        if(tag == 'a' || tag == 'button' ||
           tag == 'input' || tag == 'textarea' ||
           $t.hasClass(_conf.cons.FOCUSABLE_ELEMENT) ||
           $t.hasClass(_conf.cons.CLICKABLE_ELEMENT) ||
           t.hasAttribute('tabindex')){
           return true;
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
                        .replace(/\%num/i, idx);
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
            tt= '';
        
        for(; i<l; i++){
            el= $('section#'+slides[i].id);
            if(!el.length){ // should load it from ajax
                nEl= _d.createElement("section");
                nEl.id= slides[i].id;
                _d.body.appendChild(nEl);
                
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

                                                    var f= new Function(scr.innerText);

                                                    try{
                                                        f();
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
                
                
                _d.body.appendChild(el[0]);
                _slidePreloaderNext(_settings.slides[i]);
            }
            if(slides[i].profile){
                _conf.profiles[slides[i].profile]= true;
            }
            if(_settings.profile)
                _conf.profiles[_settings.profile]= true;
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
                    _goToSlide(parseInt(this.value, 10));
                    _closeMessage();
                }
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
        
        // APPENDING THE CAMERA AND MESSAGE-BOX TO THE DOCUMENT
        $b.append('<div id="ppw-message-box" class="ppw-clickable">\
                        <div id="ppw-message-content" class="ppw-clickable"></div>\
                        <div id="ppw-message-box-ok-button" class="ppw-clickable">\
                            <input type="button" id="ppw-message-box-button" value="Close" />\
                        </div>\
                      </div>');
        $b.append('<div id="ppw-camera-tool" class="ppw-clickable">\
                        <video id="ppw-video-element" autoplay="autoplay" class="ppw-clickable"></video>\
                        <div id="ppw-camera-hide-trigger" class="ppw-clickable">\
                            <img height="10" class="ppw-clickable" src="data:image/png;base64,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">\
                        </div>\
                      </div>');
        $b.append('<div id="ppw-toolbar-container" class="'+_conf.cons.CLICKABLE_ELEMENT+'">\
                    <div id="ppw-toolbar" class="'+_conf.cons.CLICKABLE_ELEMENT+'">\
                        <img id="ppw-goto-icon" onclick="PPW.showGoToComponent(true);" />\
                        <img id="ppw-toolbox-icon" onclick="PPW.openPresentationTool();" />\
                        <img id="ppw-search-icon" onclick="PPW.showSearchBox()"/>\
                        <img id="ppw-fullscreen-icon" onclick="PPW.enterFullScreen()"/>\
                        <img id="ppw-camera-icon" onclick="PPW.startCamera();"/>\
                        <img id="ppw-settings-icon" onclick="PPW.showConfiguration();"/>\
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
            _preloadSlides();
            _setLoadingBarStatus();
            _startPresentation();
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
    var _addAction= function(fn){
        // TODO: feature for slides to add actions
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
     * To to the previous slide.
     */
    var _goPreviousSlide= function(){
        _goToSlide(_conf.currentSlide-1, 'prev');
    };
    
    /**
     * To to the next slide.
     */
    var _goNextSlide= function(){
        _goToSlide(_conf.currentSlide+1, 'next');
    };
    
    /**
     * Go to a specific slide by index.
     */
    var _goToSlide= function(idx, prevent){
        
        if(!_conf.presentationStarted)
            return false;
        
        var url= '',
            previousSlide= _settings.slides[_conf.currentSlide]||false,
            curSlide= null;
        
        if(idx > _settings.slides.length-1){
            idx= _settings.slides.length-1;
            _triggerEvent('onfinish');
        }
        if(idx < 0)
            idx= 0;
        
        _conf.currentSlide= idx;
        curSlide= _settings.slides[_conf.currentSlide];
        
        if(!curSlide){
            _triggerEvent('onfinish');
            return false;
        }
        
        if(!_isValidProfile(curSlide)){
            if(prevent == 'prev'){
                _goPreviousSlide();
            }else{
                _goNextSlide();
            }
            return false;
        }
        
        _setHistoryStateTo(idx);
        
        _setSlideClasses(idx);
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
        
        if(previousSlide && previousSlide.type != curSlide.type)
            _triggerEvent('onslidetypechange', {
                previous: previousSlide,
                current: curSlide
            });
            
        _triggerEvent('onslidechange', {
            previous: previousSlide,
            current: curSlide
        });
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
    }
    
    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    var _constructor= function(){
        _createSplashScreen();
        _conf.currentSlide= _getCurrentSlideFromURL();
        //if(_conf.currentSlide !== 0){
            //_setHistoryStateTo(_conf.currentSlide);
            _goToSlide(_conf.currentSlide);
        //}
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
        goPreviousSlide                : _goPreviousSlide,
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
        // API GETTERS/SETTERS METHODS
        getSlides                       : _getSlides,
        getCurrentSlide                 : _getCurrentSlide,
        getAlertAtTimes                 : _getAlertAtTimes,
        getStartedAt                    : _getStartedAt
    };
    
})(jQuery, document, console);