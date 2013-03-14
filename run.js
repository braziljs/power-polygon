/**
 */

var app = require('http').createServer(handler)
  , io = null
  , URL = require('url')
  , fs = require('fs')
  , config= require('./remote/config.json')
  , _token= null
  , qs = require('querystring')
  , _autenticated= false;
  
//require('./ppw/_tools/remote/server.js');

var Services= {
    
    listDir: function(path){
        var files= fs.readdirSync(path);

        var i= files.length;

        var list= [];
        
        while(i>=0 && --i){
            if(files[i][0] != '.' && files[i] != 'README')
                list.push(files[i]);
        }
        return list;
    },
    
    createTalk: function(talkTitle){
        talkTitle= talkTitle.replace(/\/\//g, '');
        
        if(talkTitle.length <= 1){
            return;
        }
        
        fs.stat('./talks/'+talkTitle, function(err) {
            if (err === null) {
                return "Talk already exists";
            }else{
                fs.mkdir('./talks/'+talkTitle, 0777);
            }
        });
        return "success";
    },
    
    retrieve: function(url, reqData, req){
        
        var data= {
            demos: [],
            talks: [],
            errors: []
        },
        i= 0,
        files= [];
        
        url= url.replace(/\./g, '').replace(/^\//, '').split('/');
        url.shift(); // removing the first paramether, which is "api"
        
        if(url.length){
            switch(url[0]){
                case 'getTalksList': {
                    data.talks= Services.listDir('./talks/');
                    break;
                }
                case 'getDemosList': {
                    data.demos= Services.listDir('./_demos/');
                    break;
                }
                case 'createTalk': {
                    data.status= Services.createTalk(url[1]);
                }
                case 'auth': {
                    console.log("----", _autenticated)
                    if(reqData.token == _token){
                        _autenticated= true;
                    }
                    console.log(reqData);
                }
            }
        }
        
        return JSON.stringify(data);
        
    },
    
    init: function(){
        io= require('socket.io').listen(app);
        app.listen(config.port);
    }
}

function treatRequisition(obj){
    
    /*
     {
        req: req,
        res: res,
        method: 'GET',
        data: url_parts.query,
        url: url
     }
     */
    var url= obj.url,
        req= obj.req,
        res= obj.res;
    
    if(url.match(/^\/api\//)){
        //var Services= require('./ppw/_tools/services.js');
        res.setHeader('Content-Type', 'text/json');
        res.end(Services.retrieve(url, obj.data, req));
        return;
    }
    
    url= url.replace(/((\?|\#)|(^\.)).*/ig, '');
    
    if(url[url.length-1] == '/')
        url+= 'index.html';
    
  
    fs.readFile(__dirname + url, function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading: '+url);
        }

        if(url.match(/\.js(\?|$)/i)){
            res.setHeader('Content-Type', 'application/javascript');
        }
        if(url.match(/\.json(\?|$)/i)){
            res.setHeader('Content-Type', 'text/json');
        }
        if(url.match(/\.html$/i)){
            res.setHeader('Content-Type', 'text/html');
        }
        if(url.match(/\.css$/i)){
            res.setHeader('Content-Type', 'text/css');
        }
        if(url.match(/\.png$/i)){
            res.setHeader('Content-Type', 'image/png');
        }
        if(url.match(/\.jpg$/i)){
            res.setHeader('Content-Type', 'image/jpg');
        }
        if(url.match(/\.gif$/i)){
            res.setHeader('Content-Type', 'image/gif');
        }
        res.writeHead(200);

        res.end(data);
    });
}

/**
 * Dealing with the routes.
 */
function handler (req, res) {
    
    var url= req.url!='/'? req.url: '/ppw/_tools/remote/index.html';
  
  
    if(req.method=='POST') {
        var body='';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end',function(){
            var POST =  qs.parse(body);
            treatRequisition({
                req: req,
                res: res,
                method: 'POST',
                data: POST,
                url: url
            });
        });
    }else if(req.method=='GET') {
            var url_parts = URL.parse(req.url,true);
            console.log(url_parts.query);
            treatRequisition({
                req: req,
                res: res,
                method: 'GET',
                data: url_parts.query,
                url: url
            });
          }
}


/**
 * Verifies if there is no token set yet and asks for it.
 */
var getToken= function(){
    
    fs.readFile('./remote/.auth', 'utf8', function(err, data){
        if(err || !data){

            var readline = require('readline');

            var rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });

            console.log("[PPW] It looks like it is your first time here!\nPlease, define a secret token to identify you:");
            rl.question("",
                        function(answer){
                            if(answer.length<3){
                                console.log("At least 3 characters, please!");
                                askForTheToken();
                            }else{
                                
                                /*var crypto = require('crypto')
                                  , shasum = crypto.createHash('sha1');
                                shasum.update(answer);
                                  
                                _token= shasum.digest('hex');*/
                                
                                _token= answer;
                                
                                fs.writeFile("./remote/.auth", _token, function(err) {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        console.log("[PPW] Your token was set!\nYou will use it to activate locked features.");
                                        Services.init();
                                    }
                                });
                            }
                        });

        }else{
            _token= data;
            console.log("[PPW] Currently using token: "+_token);
            Services.init();
        }
    });

};

getToken();
