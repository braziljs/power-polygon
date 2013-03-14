$(document).ready(function(){
    
    var talks= null;
    
    $.get('/api/getDemosList/', null, function(o){
        
        var ul= $('#demosList');
        
        $(o.demos).each(function(){
            ul.append("<li><a href='_demos/"+this+"/'>"+this+"</a></li>");
        });
        
        talks= o.talks;
        
    }, 'json');
    
    $.get('/api/getTalksList/', null, function(o){
        
        var ul= $('#talksList');
        
        $(o.talks).each(function(){
            ul.append("<li><a href='talks/"+this+"/'>"+this+"</a></li>");
        });
        
    }, 'json');
    
    $('#createNewTalk-btn').click(function(){
        var talktt= prompt("Talk name");
        
        if(talks !== null && talks.indexOf(talktt)<0){
            $.get('/api/createTalk/'+talktt, null, function(o){
                console.log(o);
            }, 'json');
        }
    });
    
    $('#unlock-interface').click(function(){
        var token= window.prompt("What is your token, please?");
        $.post('/api/auth', {token: token}, function(o){
            console.log(o);
        }, 'json');
    });
});