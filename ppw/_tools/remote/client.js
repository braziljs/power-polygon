$(document).ready(function(){

    var talks= null;

    // screen interactions
    var unlockButtons= function(){
        $('.talk-butons a').css('display', 'inline-block');
        $('#unlock-interface').hide();
        $('#re-lock-interface').show();
    };
    var lockButtons= function(){
        $('#unlock-interface').show();
        $('#re-lock-interface').hide();
        $('.talk-butons a:not(:first-child)').hide();
    };
    var verifySession= function(){
        $.get('/api/verifylogin', null, function(o){
            if(o.auth){
                unlockButtons();
            }
            setTimeout(function(){
                $('#opening').fadeOut();
                //$('.body-container').show();
                $(document.body).addClass('loaded');
                //document.body.style.overflow= 'auto';
            }, 600);
        }, 'json');
    };

    var buildListElement= function(name, demo){

        var oName= name;
            name= demo? '_demos/'+name: 'talks/'+name;

        var str= "<li>"+oName+"\
                      <div class='talk-butons'>\
                         <a href='"+name+"/' title='Open presentation'></a>\
                         <a href='ppw/_tools/remote/full/index.html?p="+name+"/' title='Full remote control'></a>\
                         <a href='ppw/_tools/remote/basic/index.html?p="+name+"/' title='Basic remote control'></a>\
                      </div>\
                  </li>";
        return str;
    };

    var buildLists= function(callback){
        // mounting the screen
        $.get('/api/getDemosList/', null, function(o){

            // building the list of demos
            var ul= $('#demosList'),
                str= '';

            $(o.demos).each(function(){
                str+= buildListElement(this, true);
            });
            // TODO: analize what to do with this list...maybe, replace it by a tutorial!
            ul.html(str);

            // building the list of talks
            $.get('/api/getTalksList/', null, function(o){

                var ul= $('#talksList'),
                    str= "";

                $(o.talks).each(function(){
                    //ul.append("<li><a href='talks/"+this+"/'>"+this+"</a></li>");
                    str+= buildListElement(this);
                });
                ul.html(str);
                talks= o.talks;

                callback();

            }, 'json');

        }, 'json');

    };

    var bindEvents= function(){
        /*$('#createNewTalk-btn').click(function(){
            var talktt= prompt("Talk name");

            if(talks !== null && talks.indexOf(talktt)<0){
                $.get('/api/createTalk/'+talktt, null, function(o){
                    console.log(o);
                }, 'json');
            }
        });*/

        $('#unlock-interface img').click(function(){
            var token= window.prompt("What is your token, please?");
            if(token){
                $.post('/api/auth', {token: token}, function(o){
                    if(o.auth){
                        unlockButtons();
                    }else{
                        alert("Invalid token!");
                    }
                }, 'json');
            }
        });


        $('#re-lock-interface img').click(function(){
            $.get('/api/logoff', null, function(o){
                lockButtons();
            }, 'json');
        });

    };

    /* THE CONSTRUCTOR */
    var _constructor= function(){
        bindEvents();
        buildLists(verifySession);
    }

    _constructor();
});