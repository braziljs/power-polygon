window.PPWTransSlider= {
    resized: false,
    container: null,
    hMargin: 40,
    onresize: function(){
        
        var container= $('#ppw-slides-container'),
            w= document.body.clientWidth,
            h= document.body.clientHeight,
            l= 0;
        
        PPWTransSlider.resized= true;
        PPWTransSlider.container= container;
        
        container.css('width', (PPW.get('slides').length * w + 100)+'px');
        
        $('#ppw-slides-container .ppw-slide-container').css({
            width: w - PPWTransSlider.hMargin +'px',
            height: h - PPWTransSlider.hMargin/2 +'px'
        });
        
        l= PPW.getCurrentSlide().el.parentNode.offsetLeft;
        
        container.css('marginLeft', -l + PPWTransSlider.hMargin/2);
    }
};

PPW.addListener('onslidechange', function(data){
    PPWTransSlider.onresize();
});
PPW.addListener('onhidethumbs', function(data){
    PPWTransSlider.onresize();
});

window.addEventListener("resize", function(){
    PPWTransSlider.onresize();
});