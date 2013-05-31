PPW.addListener('onslidesloaded', function(){
    $('.ppw-slide-container').hide();
    $(PPW.getCurrentSlide().el.parentNode).show();
});

PPW.addListener('onslidechange', function(slides){

    var animStart= function(){

        var el= PPW.getCurrentSlide().el.parentNode;

        if($(el).css('overflow') == 'auto'){
            el.scrollTop= 0;
            el.scrollLeft= 0;
        }
    }
    var animEnd= function(){
        $(PPW.getCurrentSlide().el.parentNode).removeClass('ppw-anim-fadeInRightBig')
                                   .removeClass('ppw-anim-fadeInLeftBig');
    }

    if(slides.previous.id == slides.current.id) return;

    if(slides.previous.index > slides.current.index){
        // going left
        PPW.animate(slides.previous.el.parentNode, 'fadeOutRightBig');
        PPW.animate(slides.current.el.parentNode, 'fadeInLeftBig', {
            onstart: animStart,
            onend: animEnd
        });
    }else{
        // going right
        PPW.animate(slides.previous.el.parentNode, 'fadeOutLeftBig');
        PPW.animate(slides.current.el.parentNode, 'fadeInRightBig', {
            onstart: animStart,
            onend: animEnd
        });
    }

    console.log(slides)

});

// Binding some events
(function(){
    var articlesContainer= $('#articles-container'),
        fontSizes= [
            '14px',
            '16px',
            '20px',
            '22px',
            '26px'
        ];
    $('#smallerFont').click(function(){
        var currentSize= articlesContainer.data('currentFontSize');
        currentSize= (currentSize||currentSize===0)? currentSize: 2;
        currentSize--;
        currentSize= currentSize<0? 0: currentSize;
        articlesContainer.data('currentFontSize', currentSize);
        currentSize= fontSizes[currentSize];
        articlesContainer.css('font-size', currentSize);
    });
    $('#biggerFont').click(function(){
        var currentSize= articlesContainer.data('currentFontSize')||2;
        currentSize++;
        currentSize= currentSize>4? 4: currentSize;
        articlesContainer.data('currentFontSize', currentSize);
        currentSize= fontSizes[currentSize];
        articlesContainer.css('font-size', currentSize);
    });
})();