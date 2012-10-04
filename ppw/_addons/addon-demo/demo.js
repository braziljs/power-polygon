window.PPW.extend("demo", (function(){
    
    
    
    return {
        onstart: function(){ console.log("DEMO PLUGIN STARTING"); },
        onsplashscreen: function(){ console.log("SPLASH SCREEN SHOWN"); },
        onslidesloaded: function(){ console.log("ALL SLIDES LOADED"); },
        onslideloaded: function(){ console.log("THIS SLIDE LOADED"); },
        onfinish: function(){ console.log("DEMO PLUGIN ENDING"); },
        onload: function(data){ console.log("DEMO PLUGIN LOADED", data); },
        onnext: function(){ console.log("DEMO PLUGIN GOING NEXT"); },
        onprev: function(){ console.log("DEMO PLUGIN GOING PREVIOUS"); },
        ongoto: function(){ console.log("DEMO PLUGIN GOING TO"); },
        onfullscreen: function(){ console.log("DEMO PLUGIN FullScreen"); },
        onshowcamera: function(){ console.log("DEMO PLUGIN SHOWING CAMERA"); },
        onhidecamera: function(){ console.log("DEMO PLUGIN HIDING CAMERA"); },
        onslidetypechange: function(){ console.log("DEMO PLUGIN CHANGING SLIDE TYPE"); },
        
        onslidechange: function(){ console.log('SLIDE CHANGE'); },
        ongoto: function(){ console.log('GO-TO'); },
        onprev: function(){ console.log('SLIDE PREV'); },
        onnext: function(){ console.log('SLIDE NEXT'); },
        onslidetypechange: function(){ console.log('SLIDE TYPE CHANGE'); },
        
        onpresentationtoolloaded: function(win){
            console.log("DEMO PLUGIN LOADED THE PRESENTATION TOOL");
            //win.document.getElementById('header').innerHTML+= "ABCBBA";
        }
    };
    
})());