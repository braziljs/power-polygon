PPW.addListener('onslidesloaded', function(){
    $('.ppw-slide-container').hide();
    $(PPW.getCurrentSlide().el.parentNode).show();
});

PPW.addListener('onslidechange', function(slides){

    var animEnd= function(){

        var el= PPW.getCurrentSlide().el.parentNode;

        if($(el).css('overflow') == 'auto'){
            el.scrollTop= 0;
            el.scrollLeft= 0;
        }
    }

    if(slides.previous.id == slides.current.id) return;

    if(slides.previous.index > slides.current.index){
        // going left
        PPW.animate(slides.previous.el.parentNode, 'fadeOutRightBig');
        PPW.animate(slides.current.el.parentNode, 'fadeInLeftBig', {
            onstart: animEnd
        });
    }else{
        // going right
        PPW.animate(slides.previous.el.parentNode, 'fadeOutLeftBig');
        PPW.animate(slides.current.el.parentNode, 'fadeInRightBig', {
            onstart: animEnd
        });
    }

    console.log(slides)

})