window.PPW.extend("demo", (function(data){
    
    var searchURL= 'http://search.twitter.com/search.json?&q=',
        ppw= null,
        types= [
            'subtitle',
            'popup'
        ],
        type= 'subtitle',
        conf= false,
        startTime= null,
        search= '',
        toolEl= false,
        el= false;
    
    window.PPWSocialSearch= '';
    
    var getMentions= function(){
        var script= document.createElement('script');
        script.type= 'text/javascript';
        //refresh_url
        script.src= searchURL + search + PPWSocialSearch;
        console.log('next search', script.src)
        $("body").append(script);
    };
    
    return {
        onstart: function(data){
        },
        onload: function(_ppw){
            ppw= _ppw;
            conf= PPW.get('social');
            el= document.createElement('div');
            el.id= 'PPWSocialPluginAlertElement';
            if(conf.socialAlertType == 'popup'){
                $(el).css({
                    position: 'absolute',
                    left: '6px',
                    bottom: '-150px',
                    zIndex: 999999999,
                    backgroundColor: '#fff',
                    height: '90px',
                    width: '320px',
                    padding: '4px',
                    overflow: 'hidden',
                    boxShadow: '0px 0px 20px black',
                    color: '#444',
                    fontSize: '16px',
                    fontFamily: 'Verdana, Tahoma, Sans, Arial',
                    opacity: 0
                });
            }else{
                $(el).css({
                    position: 'absolute',
                    left: '0px',
                    bottom: '0px',
                    zIndex: 999999999,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    height: '26px',
                    minWidth: '100%',
                    color: 'white',
                    fontSize: '16px',
                    fontFamily: 'Verdana, Tahoma, Sans, Arial',
                    overflow: 'visible',
                    textIndent: '0px',
                    whiteSpace: 'nowrap',
                    display: 'none'
                });
            }
            PPWSocialPlugin.el= el;
        },
        onpresentationtoolloaded: function(win){
            win.document.body.appendChild(PPWSocialPlugin.el);
            
            startTime= (new Date()).getTime();
            
            if(conf && conf.sodialSearch){
                search= escape(conf.sodialSearch);
                search= search + "&callback=window.PPWSocialPlugin.twitterCallback&_="+ (new Date()).getTime()
                getMentions();
                setInterval(getMentions, 60000); // once a minute
            }
        }
    };
    
})());

window.PPWSocialPlugin= {};
window.PPWSocialPlugin.twitterCallback= function(data){
    
    var i= 0, l= 0, social= PPW.get('social'), str= '', el= null, w= 0, alertTime= 4000;
    
    if(!PPWSocialPlugin.messages)
        PPWSocialPlugin.messages= [];
    
    PPWSocialSearch= '&since_id='+data.max_id_str+'&';
    l= data.results.length;
    
    if(!l)
        return;
    
    if(social.alertTime)
        alertTime= social.alertTime;
    PPWSocialPlugin.alertTime= alertTime;
    
    for(; i<l; i++){
        PPWSocialPlugin.messages.push(data.results[i]);
        str+= ' - <b>@'+ data.results[i].from_user+'</b>: ' +data.results[i].text
        if(i>2){
            break;
        }
    }
    
    el= $(PPWSocialPlugin.el);

    if(social.socialAlertType == 'popup'){
        el.animate({
            bottom: '6px',
            opacity: 1
        }, function(){
            PPWSocialPlugin.showPopMessage();
            setTimeout(PPWSocialPlugin.showPopMessage, alertTime);
        });
    }else{

        el.html(str);
        el.css('textIndent', '0px').fadeIn();
        w= el.offsetWidth;
        setTimeout(function(){
            el.animate({
                textIndent: (-1*(w))+ 'px'
            },
            w*10,
            'linear',
            function(){
                el.fadeOut();
            });
        }, 500);
    }
};

PPWSocialPlugin.showPopMessage= function(){
    var el= $(PPWSocialPlugin.el), msg= null;
    
    msg= PPWSocialPlugin.messages.shift();
    
    if(!PPWSocialPlugin.messages.length){
        PPWSocialPlugin.hideMessage();
        return;
    }
    el.html("@"+msg.from_user+": "+msg.text);
    setTimeout(PPWSocialPlugin.showPopMessage, PPWSocialPlugin.alertTime);
};
PPWSocialPlugin.hideMessage= function(){
    $(PPWSocialPlugin.el).animate({
        bottom: '-150px',
        opacity: 0
    }, function(){});
};