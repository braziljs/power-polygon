
PPW.addListener('onstart', function(data){
    $(PPW.getCurrentSlide().el.parentNode).show();
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        $(data.previous.el.parentNode).hide()
        $(PPW.getCurrentSlide().el.parentNode).show();
    }
    
});