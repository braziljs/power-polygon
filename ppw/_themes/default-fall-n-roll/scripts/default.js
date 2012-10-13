
PPW.addListener('onstart', function(data){
    //$(PPW.getCurrentSlide().el).stop().addClass('flipInY');
    PPW.animate(PPW.getCurrentSlide().el, 'rollIn');
});

PPW.addListener('onslidechange', function(data){
    
    var currentSlide= PPW.getCurrentSlide();
    
    if(data.current != data.previous){
        PPW.animate(data.previous.el, 'hinge');
        PPW.animate(PPW.getCurrentSlide().el, 'rollIn');
    }
    
});