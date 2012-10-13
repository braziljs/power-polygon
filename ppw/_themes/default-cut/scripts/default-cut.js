
PPW.addListener('onstart', function(data){
    $(PPW.getCurrentSlide().el).show();
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        $(data.previous.el).hide()
        $(PPW.getCurrentSlide().el).show();
    }
    
});