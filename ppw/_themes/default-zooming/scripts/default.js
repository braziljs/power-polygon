
PPW.addListener('onstart', function(data){
    //$(PPW.getCurrentSlide().el).stop().fadeIn();
    $(PPW.getCurrentSlide().el).addClass('ppw-theme-slide-change');
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        $(data.previous.el).removeClass('ppw-theme-slide-change');
        $(PPW.getCurrentSlide().el).addClass('ppw-theme-slide-change');
    }
    
});