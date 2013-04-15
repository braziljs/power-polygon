
PPW.addListener('onstart', function(data){
    $('.ppw-slide-container').hide();
    PPW.animate(PPW.getCurrentSlide().el.parentNode, 'rollIn');
});

PPW.addListener('onslidechange', function(data){

    var currentSlide= PPW.getCurrentSlide();

    if(data.current != data.previous){
        PPW.animate(data.previous.el.parentNode, 'hinge');
        PPW.animate(PPW.getCurrentSlide().el.parentNode, 'rollIn');
    }

});