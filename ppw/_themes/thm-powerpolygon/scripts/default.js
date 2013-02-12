PPW.addListener('onstart', function (data) {
    
    
    $.fn.scrollPath("getPath").lineTo(0, 0).lineTo(-3000, 2000).lineTo(-1000, 4000).lineTo(2000, 4000).lineTo(3000, 2000).lineTo(0, 0);

    $("#ppw-slides-container").scrollPath({
        drawPath: true,
        wrapAround: false,
        scrollBar: true
    });
    

});

PPW.addListener('onslidechange', function (data) {"use strict";
    if (data.current.type === 'section') {
        
    }
});


PPW.addListener('onslidesloaded', function(data) {
    var classes = PPW.get('themeSettings');
    var len = data.length;
    for (var i = 0; i < len; i++){
        $('#ppw-slide-container-'+data[i].id).addClass(classes[i]);
    }
});