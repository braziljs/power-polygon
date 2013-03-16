
/* SERVER DEFAULT CONFIGURATION */
var serverConf= {
    usedefaultuser: true,
    defaultuser: 'admin',
    dbsrc: '.sqldb',
    port: 8081,
    serverSecret: 'onlyMeAndGitHubUsersKnowIt! - Please,change this for your use'
}

/* DEFINITIONS */
var express = require('express')
  , app = express()
  , fs = require('fs')
  , io = null
  , _token= false
  , server = null
  , store  = new express.session.MemoryStore
  , readline = require('readline')
  , sqlite3 = require('sqlite3').verbose()
  , db = null // ':memory:'
  , rl = readline.createInterface({
             input: process.stdin,
             output: process.stdout
         });

/* MIDLEWARES */
app.use(express.compress());
app.use(express.cookieParser());
app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: '/ppw/tmp/',
    expires: new Date(Date.now() + (120 * 60 * 1000)) // expires in two hours
}));
app.use(express.session({
    secret: serverConf.serverSecret,
    store: store
}));

/**
 * Useful services to work with the API
 */
Services= (function(){
    
    var listDir= function(path){
        var files= fs.readdirSync(path);

        var i= files.length;

        var list= [];
        
        while(i>=0 && --i){
            if(files[i][0] != '.' && files[i] != 'README')
                list.push(files[i]);
        }
        return list;
    };
    
    var deliver= function(url, req, res){
        
        url= url.replace(/(\/\..*)|(\?.*)|(\#.*)/ig, '');
        if(url[url.length-1] == '/')
            url+= 'index.html';
        
        fs.readFile(__dirname+url, function(err, data){
            
            if (err) {
                res.writeHead(500);
                return res.end('Error loading: ' + __dirname + url);
            }
        
            if(url.match(/\.js(\?|$)/i)){
                res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            }
            if(url.match(/\.json(\?|$)/i)){
                res.setHeader('Content-Type', 'text/json; charset=utf-8');
            }
            if(url.match(/\.html(\?|$)/i)){
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
            }
            if(url.match(/\.css$/i)){
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
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
    };
    
    var _logoff= function(req, res){
        var data= { status: 'done' };
        req.session.destroy();
        res.writeHead(200);
        res.end(JSON.stringify(data));
    };
    
    var _isLogged= function(req){
        return req.session.auth? true: false;
    };
    
    var _login= function(req, res){
        
        var token= req.body.token,
            qr= "SELECT userid,\
                        username,\
                        usertoken\
                   FROM userdata\
                  WHERE usertoken= ?",
            auth= false,
            data= {};
        
        // if already logged
        if(_isLogged(req)){
            res.writeHead(200);
            res.end(JSON.stringify({auth: true, status: 200}));
            return;
        }
        
        db.serialize(function(){
            db.each(qr, token, function(err, row){
                auth= row.usertoken;
                return false;
            }, function(){
                
                if(auth){
                    data.auth= true;
                    data.status= 200;
                    
                    req.session.token= token;
                    req.session.auth= true;
                }else{
                    req.session= null;
                    data.status= 200;
                    data.auth= false;
                }
                
                res.writeHead(200);
                res.end(JSON.stringify(data));
            });
        });
        
    };
    
    var _init= function(){
        
        var url= "",
            root= '/ppw/_tools/remote/index.html';
            
        app.get('/run.js', function(req, res){
            url= root;
            deliver(url, req, res);
        });
        app.get('/', function(req, res){
            url= root;
            deliver(url, req, res);
        });

        // API - get
        app.get('/api/:command', function(req, res){
            
            var data= {
                demos: [],
                talks: [],
                errors: [],
                auth: _isLogged(req)
            }
            
            res.setHeader('Content-Type', 'text/json; charset=utf-8');
            switch(req.params.command){
                case "verifylogin":{
                        // will just return the data object as it is
                    break;
                }
                case "getTalksList":{
                        data.talks= Services.listDir('./talks/');
                    break;
                }
                case "getDemosList":{
                        data.demos= Services.listDir('./_demos/');
                    break;
                }
                case "logoff":{
                    _logoff(req, res);
                    return;
                    break;
                }
                case "remoteControl":{
                    //
                    break;
                }
            }
            res.end(JSON.stringify(data));
        });
        
        // API - post
        app.post('/api/:command', function(req, res){
            res.setHeader('Content-Type', 'text/json; charset=utf-8');
            switch(req.params.command){
                case "auth":{
                    _login(req, res);
                    break;
                }
            }
            //res.end(JSON.stringify(data));
        });
        
        // filtering only authenticated users
        app.get(/^\/ppw\/_tools\/remote\/(basic|full)\/.*/, function(req, res){
            if(_isLogged(req, res))
                deliver(req.url, req, res);
            else{
                res.redirect('/');
            }
        });
        
        // File deliveries
        app.get(/^\/ppw\/.*/, function(req, res){
            deliver(req.url, req, res);
        });
        
        app.get(/^\/talks\/.*/, function(req, res){
            deliver(req.url, req, res);
        });
        
        app.get(/^\/_demos\/.*/, function(req, res){
            deliver(req.url, req, res);
        });
        
    
        // listeners
        server= app.listen(serverConf.port);
        io= require('socket.io').listen(server);
        
        // just announcing the server initialization...
        console.log('[PPW] Listening on port '+serverConf.port);
        if(_token)
            console.log('[PPW] Your token is ' + _token);
        
        console.log();
    };
    
    return {
        init: _init,
        listDir: listDir
    }
})();

/**
 * Asks for the token, on the CONSOLE, the first time the user runs it.
 */
var getToken= function(fn, repeat){

    if(!repeat)
        console.log("[PPW] It looks like it is your first time here!\n      Please, define a secret token to identify the ADMIN user:");

    rl.question("> ",
                function(answer){
                    if(answer.length<3){
                        console.log("[PPW] At least 3 characters, please!");
                        getToken(fn, true);
                        return;
                    }else{
                        console.log("[PPW] Your token was set!\n      You will use it to activate locked features.\n");
                        _token= answer;
                        if(fn && typeof fn == 'function'){
                            try{
                                fn(_token);
                            }catch(e){
                                console.log("[PPW][ERROR] Failed executing the callback for getToken!");
                            }
                        }
                    }
                });
};

/**
 * Verifies wether the database exists or not.
 * 
 * In case it does not exist, it is created with its tables.
 */
var verifyDB= function(){
    
    var stats = null;
    try{
        stats= fs.lstatSync(serverConf.dbsrc);
    }catch(e){}
    
    db= new sqlite3.Database(serverConf.dbsrc);
    
    // DATABASE does not exist
    if(!stats){
        
        // must create the database
        db.serialize(function(){
                
            // TABLE SERVERCONFIG
            db.run("CREATE TABLE serverconfig (confid INTEGER, usedefaultuser INTEGER, defaultuser TEXT)");
            var stmt = db.prepare("INSERT INTO serverconfig VALUES (?, ?, ?)");
            stmt.run(1, serverConf.usedefaultuser, serverConf.defaultuser);
            stmt.finalize();

            // TABLE USERDATA
            db.run("CREATE TABLE userdata (userid INTEGER, username TEXT, usertoken TEXT)");
            getToken(function(token){
                var stmt = db.prepare("INSERT INTO userdata VALUES (?, ?, ?)");
                stmt.run(1, serverConf.defaultuser, token);
                stmt.finalize();
                Services.init();
            });
        });
    }else{
        // database exists, let's verify the server config
        db.each("SELECT confid, usedefaultuser, defaultuser  FROM serverconfig", function(err, row) {
            if(err){
                console.log(err)
            }else{
                // if the server config has changed, let's update it.
                if(serverConf.usedefaultuser != row.usedefaultuser
                    ||
                   serverConf.defaultuser != row.defaultuser){
                    var stmt = db.prepare("UPDATE serverconfig SET usedefaultuser=?, defaultuser=? where confid=1");
                    stmt.run(serverConf.usedefaultuser, serverConf.defaultuser);
                    stmt.finalize();
                }
                Services.init();
            }
        });
    }
}

/**
 * Returns the current user(from session or from submited login).
 */
var getUser= function(req){
    // if it should use a default user
    // what means, no other users will work on this server
    if(serverConf.usedefaultuser){
        return serverConf.defaultuser;
    }else{
        // needs the req to work
        if(!req || !req.session){
            return false;
        }
        // returns the currently logged user
        return req.session.username;
    }
};

// initializing everything, starting by calling the verifyDB.
verifyDB();













/*
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
     * /
    var url= obj.url,
        req= obj.req,
        res= obj.res;
    
    if(url.match(/^\/api\//)){
        //var Services= require('./ppw/_tools/services.js');
        res.setHeader('Content-Type', 'text/json');
        res.end(Services.retrieve(url, obj.data, req));
        return;
    }
    
    url= url.replace(/((\?|\#)|(^\.)).* /ig, '');
    
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

// Dealing with the routes.
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



// Verifies if there is no token set yet and asks for it.

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
                                  
                                _token= shasum.digest('hex');* /
                                
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
*/