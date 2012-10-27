window.PPW.extend("caniuse", (function(){
    
    var _ppw= false;
    
    var _init= function(){
        
        $.getScript(_ppw.PPWSrc+'/_addons/caniuse/modernizr.custom.34435.js', function(){
            
            var str= "",
                videoSrcs= [],
                audioSrcs= [];
            
            $('#ppw-addons-container').append("<span id='ppw-addon-caniuse-trigger' style='cursor: pointer;'>Can I use?</span>");
            $('#ppw-addon-caniuse-trigger').click(function(){
                
                str= "<strong>Can I use?</strong><br/>";
                str+= "WebSockets: "+(Modernizr.websockets? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "WebWorkers: "+(Modernizr.webworkers? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "WebGL: "+(Modernizr.webgl? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "Touch Events: "+(Modernizr.touch? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>";
                if(Modernizr.video){
                    
                    videoSrcs= Object.keys(Modernizr.video);
                    videoSrcs.filter(function(element, index, array){
                        return !!Modernizr.video[index];
                    });
                    str+= "Video: "+(videoSrcs.join(', '))+"<br/>";
                }
                if(Modernizr.audio){
                    
                    audioSrcs= Object.keys(Modernizr.audio);
                    audioSrcs.filter(function(element, index, array){
                        return !!Modernizr.video[index];
                    });
                    str+= "Audio: "+(audioSrcs.join(', '))+"<br/>";
                }
                
                str+= "SVG: "+(Modernizr.svg? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "Local/Session Storage: "+(Modernizr.localstorage? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+ ' - '+ (Modernizr.localstorage? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>') +"<br/>"+
                      "Geolocation: "+(Modernizr.geolocation? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "IndexedDB: "+(Modernizr.indexeddb? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "FontFace: "+(Modernizr.fontface? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "CSS Transitions: "+(Modernizr.csstransitions? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "CSS Transform: "+(Modernizr.csstransforms? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "CSS 3D: "+(Modernizr.csstransforms3d? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "CSS Animations: "+(Modernizr.cssanimations? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>"+
                      "CSS Gradients: "+(Modernizr.cssgradients? '<span class="ppw-green">YES</span>': '<span class="ppw-red">NO</span>')+"<br/>";
                
                PPW.showMessage(str);
            });
        });
    };
    
    var _setup= function(ppw){
        _ppw= ppw;
    };
    
    return {
        onload: _setup,
        onsplashscreen: _init
    };
    
})());