
PPW.addListener('onstart', function(data){
    $(PPW.getCurrentSlide().el.parentNode).addClass('ppw-theme-slide-change');
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        $(data.previous.el.parentNode).removeClass('ppw-theme-slide-change');
        //$(PPW.getCurrentSlide().el.parentNode).show();
        $(PPW.getCurrentSlide().el.parentNode).addClass('ppw-theme-slide-change');
        
    }
    
});