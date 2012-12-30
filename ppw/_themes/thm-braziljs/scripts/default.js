
PPW.addListener('onstart', function(data){
    
    $(PPW.getSlides()).each(function(idx, slide){
        
        if(slide.type == 'section'){
            $(slide.el).append("<div class='ppw-section-detail'><div class='brzjs-logo'></div></div>");
            
            slide.addAction({
                timing: 'auto',
                does: function(){ PPW.lock(); PPW.goNext(); },
                undo: function(){ PPW.unlock(); }
            });
            
            slide.addAction({
                does: function(){
                    
                    var el= $(PPW.getCurrentSlide().el).find('.ppw-section-detail');
                    
                    el.animate({
                        right: '0%'
                    }, function(){
                        var h2= PPW.get('languages')? 'h2.LANG-'+PPW.language: 'h2';
                        PPW.animate(el.find('.brzjs-logo'), 'fadeInLeft');
                        PPW.animate(el.parent().find(h2), 'fadeInRight');
                        PPW.unlock();
                    });
                },
                undo: function(){
                    
                    var el= $(PPW.getCurrentSlide().el).find('.ppw-section-detail'),
                        h2= PPW.get('languages')? 'h2.LANG-'+PPW.language: 'h2';
                        
                    PPW.lock();
                    
                    PPW.animate(el.find('.brzjs-logo'), 'fadeOutLeft');
                    PPW.animate(el.parent().find(h2), 'fadeOutRight', {
                        onend: function(){
                            $(el).animate({
                                right: '-100%'
                            }, function(){
                                PPW.unlock();
                                PPW.goPrev();
                                PPW.goPrev();
                            });
                        }
                    });
                    
                }
            });
            slide.addAction({
                does: function(){ var el= $(PPW.getCurrentSlide().el).find('.ppw-section-detail'),
                        h2= PPW.get('languages')? 'h2.LANG-'+PPW.language: 'h2',
                        nx= PPW.getNextValidSlide();
                    
                    if(!nx)
                        return false;
                    
                    PPW.lock();
                    
                    PPW.animate(el.find('.brzjs-logo'), 'fadeOutLeft');
                    PPW.animate(el.parent().find(h2), 'fadeOutRight', {
                        onend: function(){
                            $(el).animate({
                                right: '-100%'
                            }, function(){
                                PPW.goNext();
                                PPW.unlock();
                            });
                        }
                    });
                }
            });
        }
    });
    
});

PPW.addListener('onslidechange', function(data){
    if(data.current.type == 'section'){
        
    }
});