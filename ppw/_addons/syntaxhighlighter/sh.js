window.PPW.extend("sh", (function(){
    
    var ppw= null,
        hlToLoad= {},
        theme= 'sh_nedit';
    
    var validSH= [
        'sh_bison',
        'sh_c',
        'sh_cpp',
        'sh_csharp',
        'sh_changelog',
        'sh_css',
        'sh_desktop',
        'sh_diff',
        'sh_flex',
        'sh_glsl',
        'sh_haxe',
        'sh_html',
        'sh_java',
        'sh_properties',
        'sh_javascript',
        'sh_javascript_dom',
        'sh_latex',
        'sh_ldap',
        'sh_log',
        'sh_lsm',
        'sh_m4',
        'sh_makefile',
        'sh_caml',
        'sh_oracle',
        'sh_pascal',
        'sh_perl',
        'sh_php',
        'sh_prolog',
        'sh_python',
        'sh_spec',
        'sh_ruby',
        'sh_slang',
        'sh_scala',
        'sh_sh',
        'sh_sql',
        'sh_sml',
        'sh_tcl',
        'sh_xml',
        'sh_xorg'
    ]
    
    var _init= function(_ppw){
        ppw= _ppw;
    };
    
    var _apply= function(){
        
        var sCodes= [ppw.PPWSrc+'/_addons/syntaxhighlighter/shjs.js'];
        
        $('pre').each(function(){
            var classes= this.className.split(' '),
            i= classes.length-1;
            
            do{
                if(validSH.indexOf(classes[i])>=0){
                    
                    this.innerHTML= "<ol type='1' class='ppw-sh-source-container ppw-clickable'>"+
                                    this.innerHTML.replace(/</g, "&lt;")
                                                  .replace(/^/gm, "<li class='ppw-sh-line'><div>")
                                                  .replace(/$/gm, "</div></li>") +
                                    "</ol>";
                    
                    if(!hlToLoad[classes[i]]){
                        hlToLoad[classes[i]]= true;
                        sCodes.push(ppw.PPWSrc+'/_addons/syntaxhighlighter/lang/'+classes[i]+".js");
                    }
                    break;
                }
            }while(i--);
        });
        
        $.getScript(
            sCodes,
            function(){
                console.log("[PPW Addon] Syntax Highlighter being applied");
                sh_highlightDocument();
        });
        
        PPW.sh= {
            focus: function(el, lines){
                
                var i= 0, list= null;
                
                el= $(el);
                
                list= el.find('.ppw-sh-line');
                list.removeClass('ppw-sh-focused-line');
                
                if(!lines){
                    el.removeClass('ppw-sh-focused-lines');
                    return true;
                }
                
                el.addClass('ppw-sh-focused-lines');
                
                if(!lines.length)
                    lines= [lines];
                
                for(; i<lines.length; i++){
                    list.eq(lines[i]-1).addClass('ppw-sh-focused-line');
                }
            }
        };
        
    };
    
    var _themeLoaded= function(settings){
        theme= settings.shTheme||theme;
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: ppw.PPWSrc+"/_addons/syntaxhighlighter/css/"+theme+'.css'
         }).appendTo("head");
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: ppw.PPWSrc+"/_addons/syntaxhighlighter/sh.css"
         }).appendTo("head");
    };
    
    return {
        onload: _init,
        onslidesloaded: _apply,
        onthemeloaded: _themeLoaded
    };
    
})());