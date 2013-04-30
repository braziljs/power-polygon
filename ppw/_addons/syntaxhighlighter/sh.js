window.PPW.extend("sh", (function(){

    var ppw= null,
        hlToLoad= {},
        theme= 'sh_'+'bright';

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

    };

    var _changed= function(evt, that){
        var oEl= (that || this),
            el= $(oEl);
        PPW.lock();
        el.attr('contenteditable', false);
        el.html(el.html().replace(/\<div\>/ig, "<br/>"));
        _applyTo(oEl, true);
        oEl.blur();
        el.removeClass('ppw-sh-editing');
        setTimeout(PPW.unlock, 500);
    }

    var _applyTo= function (el, apply){
        var classes= el.className.split(' '),
            i= classes.length-1,
            sCodes= [],
            oSrc= "",
            brush= null;

        do{
            if(validSH.indexOf(classes[i])>=0){

                $(el).data('original-content', _getRawContent(el))
                     .removeClass('sh_sourceCode');

                el.innerHTML= "<ol type='1' class='ppw-sh-source-container ppw-clickable'>"+
                                  $(el).data('original-content').replace(/</g, "&lt;")
                                              .replace(/^/gm, "<li class='ppw-sh-line'><div>")
                                              .replace(/$/gm, "<br/></div></li>") +
                              "</ol>";

                brush= classes[i];
                if(!hlToLoad[brush]){
                    hlToLoad[brush]= true;
                    sCodes.push(PPW.getPPWPath()+'/_addons/syntaxhighlighter/lang/'+brush+".js");
                    $(el).data('brush', brush);
                }

                if(apply){
                    /* changed the sh_highlightDocument method to work with a
                     * given element, once it looks like the sh_highlightElement
                     * method is not working properly!
                     */
                    oSrc= $(el).text();
                    sh_highlightDocument(null, null, [el]);
                    ppw.triggerEvent('onsourcecodechangeend',
                                     {
                                         element: el,
                                         sourceCode: oSrc,
                                         brush: brush
                                     });
                }

                break;
            }
        }while(i--);

        return sCodes;
    }

    var _getRawContent= function(el){

        var ret= "";
        el= $(el);

        ret= (el.data('original-content') || el.html())
                .replace(/\<(\/)?(div|span|blockquote)([ a-z\_\-\.0-9]+)?\>/ig, '')
                .replace(/\<br(\/)?>/ig, "\n");

        return ret;
    };

    var _applyCSSElements= function(){

        $('style.sh_css').each(function(){
            var el= $(this),
                classes= this.className.split(" ");

            el.after("<pre class='sh_css "+classes.join(' ')+"'>"+el.html()+"</pre>")
              .bind('click', function(){alert(0)});
            el.next().bind('keyup', function(){
                el.html(_getRawContent(this));
            });
        });

    }

    var _apply= function(){

        var sCodes= [PPW.getPPWPath()+'/_addons/syntaxhighlighter/shjs.js'];

        _applyCSSElements();
        ppw.createListener("onsourcecodechange");
        ppw.createListener("onsourcecodechangeend");

        $('pre').each(function(){
            sCodes= sCodes.concat(_applyTo(this));
        });

        $.getScript(
            sCodes,
            function(){
                console.log("[PPW Addon] Syntax Highlighter being applied");
                sh_highlightDocument();

                $('.ppw-sh-editable').bind('dblclick', function(){
                    var el = $(this);

                    if(el.attr('contenteditable') == true){
                        return;
                    }

                    el.html(_getRawContent(el))
                      .attr('contenteditable', true)
                      .addClass('ppw-clickable')
                      .addClass('ppw-sh-editing');
                    el[0].focus();
                    $(el).data('original-content', false);

                }).bind('keydown', function(evt){

                    if($(this).attr('contenteditable') != 'true'){
                        return true;
                    }

                    switch(evt.keyCode){
                        case 9: // TAB
                            document.execCommand('InsertHTML', false, "    ");
                            evt.preventDefault();
                        break;
                        case 27: // ESC
                            _changed(evt, this);
                        break;
                        case 13: // ENTER
                            if(evt.ctrlKey || evt.metaKey)
                                _changed(evt, this);
                        break;
                    }

                    ppw.triggerEvent('onsourcecodechange',
                                     {
                                         element: this,
                                         sourceCode: $(this).text(),
                                         brush: $(this).data('brush'),
                                         evt: evt
                                     });

                }).bind('blur', _changed);
            }
        );

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

        theme= settings && settings.shTheme? settings.shTheme: theme;

        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: PPW.getPPWPath()+"/_addons/syntaxhighlighter/css/"+theme+'.css'
         }).appendTo("head");
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: PPW.getPPWPath()+"/_addons/syntaxhighlighter/sh.css"
         }).appendTo("head");
    };

    return {
        onload: _init,
        onslidesloaded: _apply,
        onthemeloaded: _themeLoaded,
        onextend: function(_ppw){
            ppw= _ppw;
        }
    };

})());