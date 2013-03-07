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
        console.log('next search', script.src);
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

            $(el).css({
                position: 'absolute',
                left: '6px',
                bottom: '-150px',
                zIndex: 999999999,
                backgroundColor: '#fff',
                height: '100px',
                width: '380px',
                padding: '4px',
                overflow: 'hidden',
                boxShadow: '0px 0px 20px black',
                color: '#444',
                fontSize: '16px',
                fontFamily: 'Verdana, Tahoma, Sans, Arial',
                wordWrap: 'break-all',
                opacity: 0
            });

            PPWSocialPlugin.el= el;
            PPWSocialPlugin.$el = $(PPWSocialPlugin.el);

            $(PPWSocialPlugin.el).bind('mouseover', function(){
                window.clearTimeout(PPWSocialPlugin.timeOut);
            });
            $(PPWSocialPlugin.el).bind('mouseout', function(){
                PPWSocialPlugin.timeOut= setTimeout(PPWSocialPlugin.showPopMessage, PPWSocialPlugin.alertTime);
            });
        },
        onpresentationtoolloaded: function(win){
            win.document.body.appendChild(PPWSocialPlugin.el);
            
            startTime= (new Date()).getTime();
            
            if(conf && conf.sodialSearch){
                search= escape(conf.sodialSearch);
                search= search + "&callback=window.PPWSocialPlugin.twitterCallback&_="+ (new Date()).getTime();
                getMentions();
                setInterval(getMentions, 60000); // once a minute
            }
        }
    };
    
})());

window.PPWSocialPlugin= {
    mentions: [],
    _currentMention: -1,
    hidden: false,
    mainPopUpTemplate: '<div id="box"> <div style="cursor: pointer;"id="mentions-header"> \
        <p>Your Mentions<span id="close-button" style="float:right">&times</span></p> <hr> </div> \
        <div id="body"> <div id="left" style="position: absolute;left: 0px;top: 50%;cursor: pointer;width: 12px;height: 50px;background: #e0e0e0;text-align: center;font-weight: bolder;margin-top: -25px;padding-top: 14px;box-sizing: border-box;" onmouseover="this.style.backgroundColor=\'#b0b0b0\'" onmouseout="this.style.backgroundColor=\'#e0e0e0\'">\
        <span>&lang;</span></div> \
        <div id="mention-content" style="position:absolute;left:20px;line-height:18px;word-wrap:break-all;padding:4px;display:inline;"> \
        <a href="#">Show all</a><br><a href="#">Show new ones</a>\
        </div> <div id="right" style="position: absolute;right: 0px;top: 50%;cursor: pointer;width: 12px;height: 50px;background: #e0e0e0;text-align: center;font-weight: bolder;margin-top: -25px;padding-top: 14px;box-sizing: border-box;" onmouseover="this.style.backgroundColor=\'#b0b0b0\'" onmouseout="this.style.backgroundColor=\'#e0e0e0\'">&rang;</div> </div> </div>'
};
window.PPWSocialPlugin.twitterCallback= function(data){
    var i= 0, l= 0, social= PPW.get('social'), w= 0, alertTime= 4000;
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
        if(i>2){
            break;
        }
    }
    $.merge(PPWSocialPlugin.mentions, PPWSocialPlugin.messages);

    this.$el.css({
        height: '90px'
    });

    PPWSocialPlugin.showMainPopUp();
};

PPWSocialPlugin.showPopMessage= function(){
    var msg= null;

    msg= PPWSocialPlugin.messages.shift();

    if(!PPWSocialPlugin.messages.length){
        PPWSocialPlugin.hideMessage();
        PPWSocialPlugin.bindAll();
        return;
    }
    PPWSocialPlugin.$el.find('#mention-content').html("@"+msg.from_user+": "+msg.text);
    PPWSocialPlugin.timeOut= setTimeout(PPWSocialPlugin.showPopMessage, PPWSocialPlugin.alertTime);
};

PPWSocialPlugin.showMainPopUp = function() {
    PPWSocialPlugin.hidden = false;
    PPWSocialPlugin.$el.css('height', '100px');
    PPWSocialPlugin.$el.html(PPWSocialPlugin.mainPopUpTemplate);
    PPWSocialPlugin.$el.animate({
        bottom: '6px',
        opacity: 1
    }, function() {});
    PPWSocialPlugin.bindAll();
};

PPWSocialPlugin.listAllMentions = function() {
    var str = '';
    $.each(PPWSocialPlugin.mentions, function() {
        str += "@" + this.from_user + ": " + this.text;
        str += '<hr>';
    });
    PPWSocialPlugin.$el.css({
        height: '290px',
        'overflow-y': 'scroll'
    }).find('#body').html(str);
};

PPWSocialPlugin.togglePopUp = function() {
    return PPWSocialPlugin.hidden ? PPWSocialPlugin.showMainPopUp() : PPWSocialPlugin.hideMessage();
};

PPWSocialPlugin.bindAll = function() {
    PPWSocialPlugin.$el.find('#mentions-header').click(function() {
        PPWSocialPlugin.togglePopUp();
    });
    var links = PPWSocialPlugin.$el.find('a');

    links.first().click(function() {
        PPWSocialPlugin.listAllMentions();
    });

    links.last().click(function() {
        PPWSocialPlugin.showPopMessage();
    });
    PPWSocialPlugin.$el.find('#right').click(function() {
        PPWSocialPlugin.showMention(PPWSocialPlugin.nextMention());
    });
    PPWSocialPlugin.$el.find('#left').click(function() {
        PPWSocialPlugin.showMention(PPWSocialPlugin.previousMention());
    });
};

PPWSocialPlugin.hideMessage= function(){
    PPWSocialPlugin.hidden = true;
    PPWSocialPlugin.$el.animate({
        bottom:  -(parseInt(PPWSocialPlugin.$el.css('height'), 10) - 15) + 'px'
    }, function(){});
};

PPWSocialPlugin.showMention = function(mention) {
    PPWSocialPlugin.$el.find('#mention-content').html("@"+mention.from_user+": "+mention.text);
};

PPWSocialPlugin.nextMention = function() {
    var index = ++PPWSocialPlugin._currentMention % PPWSocialPlugin.mentions.length;
    return PPWSocialPlugin.mentions[index < 0 ? -index : index];
};

PPWSocialPlugin.previousMention = function() {
    var index = --PPWSocialPlugin._currentMention % PPWSocialPlugin.mentions.length;
    return PPWSocialPlugin.mentions[index < 0 ? -index : index];
};
