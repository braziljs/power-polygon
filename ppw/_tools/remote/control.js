$(document).ready(function(){
    
    var presentationIframe= $('#presentation-iframe'),
        version= presentationIframe[0]? 'full': 'basic',
        presentation= null,
        notesContainer= null,
        showingNotes= false,
        socketServer= false,
        _socket= null,
        talkId= null;
        
    var getParameterByName= function (name){
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if(results == null)
          return "";
        else
          return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    
    var _getCurrentNotes= function(){
        
        var notes= ppwFrame().getCurrentSlide().notes,
            str= "<ul>";
            
        $(notes).each(function(){
            str+= "<li>"+this+"</li>";
        });
        
        return str+"</ul>";
    }
    
    var _bindEvents= function(){
        
        // annotations
        $('#btn-annotations').click(function(){
            
            var notes= [],
                str= "",
                h= 0,
                btn= $('#btn-annotations a');
                
            notesContainer= notesContainer||$('#annotations-container');
            
            if(!showingNotes){
                if(version == 'full'){
                    if(ppwFrame().get('presentationStarted')){
                        str= _getCurrentNotes();
                    }
                }
                h= (document.body.clientHeight - btn[0].offsetHeight - 10)+'px';

                
                notesContainer.html(str);
                notesContainer.css('height', h);
                btn.css('bottom', h);
                showingNotes= true;
            }else{
                h= 0;
                notesContainer.css('height', h);
                btn.css('bottom', h);
                showingNotes= false;
            }
        });
        
        // go next
        $('#btn-next-slide').click(function(){
            if(version == 'full'){
                if(!ppwFrame().get('presentationStarted')){
                    ppwFrame().startPresentation();
                    // let's start listening to other events
                    ppwFrame().addListener('onslidechange', function(){
                        if(showingNotes){
                            notesContainer.html(_getCurrentNotes());
                        }
                    });
                }else{
                    ppwFrame().goNext();
                }
            }
            // TODO: send to socket
        });
        
        // go previous
        $('#btn-previous-slide').click(function(){
            if(version == 'full'){
                if(ppwFrame().get('presentationStarted')){
                    ppwFrame().goPrev();
                }
            }
            // TODO: send to socket
            _broadcast({
                act: 'goNext',
                talk: presentation,
                data: null
            });
        });
        
        // toggle camera
        $('#btn-toggle-camera').click(function(){
            if(version == 'full'){
                if(ppwFrame().get('presentationStarted')){
                    ppwFrame().toggleCamera();
                }
            }
            // TODO: send to socket
        });
        
    };
    
    var _broadcast= function(obj){
        /*$.post('/api/broadcast', obj, function(o){
            console.log(o);
        }, 'json');*/
        alert('will broadcast!');
        _socket.emit('remote-control-send', obj);
    };
    
    var ppwFrame= function(){
        return version == 'full'? presentationIframe[0].contentWindow.PPW: false;
    }
    
    var _init= function(){
        _socket= io.connect(socketServer);
        alert('I will join the group '+talkId+' now')
        _socket.emit('listening', talkId);
        _bindEvents();
    }
    
    if(version == 'full'){
        presentation= getParameterByName('p');
        socketServer= location.protocol+'//'+location.host+'/'+presentation;
        talkId= presentation.split('/').pop();
        
        if(!presentation){
            return false;
        }
        
        presentationIframe.attr('src', '/'+presentation+'?remote-controller=true');
    }else{
        $('#btn-annotations').hide();
    }
    _init();
    
    
});