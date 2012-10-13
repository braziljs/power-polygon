window.PPWTheme= {
    resized: false,
    container: null,
    hMargin: 40,
    onresize: function(){
        
        var container= $('#PPW-slides-container'),
            w= document.body.clientWidth,
            h= document.body.clientHeight,
            l= 0;
        
        PPWTheme.resized= true;
        PPWTheme.container= container;
        container.css('width', (PPW.get('slides').length * w + 10)+'px');
        
        $('#PPW-slides-container section').css({
            width: w-PPWTheme.hMargin +'px',
            height: h-PPWTheme.hMargin/2 +'px'
        });
        
        l= PPW.getCurrentSlide().el.offsetLeft;
        container.css('marginLeft', -l+PPWTheme.hMargin/2);
    }
};

PPW.addListener('onslidechange', function(data){
    PPWTheme.onresize();
});

window.addEventListener("resize", function(){
    PPWTheme.onresize();
});