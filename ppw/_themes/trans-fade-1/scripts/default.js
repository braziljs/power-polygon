
PPW.addListener('onstart', function(data){
    $(PPW.getCurrentSlide().el.parentNode).fadeIn();
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        $(data.previous.el.parentNode).fadeOut(function(){
            $(PPW.getCurrentSlide().el.parentNode).fadeIn();
        });
    }
    
});