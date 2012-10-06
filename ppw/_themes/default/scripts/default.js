
PPW.addListener('onstart', function(data){
    $(PPW.getCurrentSlide().el).fadeIn();
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    //alert(data.current.index)
    //if(data.current.index != 0){
    if(data.current != data.previous){
        $(data.previous.el).fadeOut(function(){
            $(data.current.el).fadeIn();
        });
    }
    
});