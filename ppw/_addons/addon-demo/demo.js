window.PPW.extend("demo", (function(){
    
    return {
        onstart: function(){ console.log("DEMO PLUGIN STARTING"); },
        onfinish: function(){ console.log("DEMO PLUGIN ENDING"); },
        onload: function(data){ console.log("DEMO PLUGIN LOADED", data); },
        onnext: function(){ console.log("DEMO PLUGIN GOING NEXT"); },
        onprev: function(){ console.log("DEMO PLUGIN GOING PREVIOUS"); },
        ongoto: function(){ console.log("DEMO PLUGIN GOING TO"); },
        onfullscreen: function(){ console.log("DEMO PLUGIN FullScreen"); },
        onshowcamera: function(){ console.log("DEMO PLUGIN SHOWING CAMERA"); },
        onhidecamera: function(){ console.log("DEMO PLUGIN HIDING CAMERA"); },
        onslidetypechange: function(){ console.log("DEMO PLUGIN CHANGING SLIDE TYPE"); }
    };
    
})());