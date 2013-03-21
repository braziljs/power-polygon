/*
 *  @author Randal Maia <randalmaia@gmail.com>
 *  This file is a Default functions to thm-powerpolygon theme
 *
 */
    var settings= $.extend(true, 
                           PPW.get('themeSettings'),
                           {

                           });




    PPW.addListener('onstart', function (data) {
        
        $.fn.scrollPath("getPath").lineTo(0, 0,{name: "slide-0"})
                                  .lineTo(-2400, 1200,{name: "slide-1"})
                                  .lineTo(-1100, 3000,{name: "slide-2"})
                                  .lineTo(1700, 3000,{name: "slide-3"})
                                  .lineTo(2500, 1200,{name: "slide-4"})
                                  .lineTo(0, 0);

         startScrollPath();
         easingToCurrentSlide();
    });

    PPW.addListener('onslidechange', function (data) {"use strict";
        $.fn.scrollPath("scrollTo", data.current.id, 300);
    });


    PPW.addListener('onslidesloaded', function(data) {
        var len= data.length, 
            i= 0;

        for (; i<len; i++){
            $('#ppw-slide-container-'+data[i].id).addClass(settings['slides'][i]);
        }
    });


    var easingToCurrentSlide= function(){
        $.fn.scrollPath("scrollTo", PPW.getCurrentSlide().id, 500);   
    };

    var startScrollPath= function(){
        $('#slide-container').scrollPath({
            drawPath: settings['drawPath'],
            wrapAround: false,
            scrollBar: true
        });
    };
