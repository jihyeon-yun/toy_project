var express = require('express'), http = require('http'), path = require('path');
// Express의 미들웨어 불러오기
var bodyParser = require('body-parser'), cookieParser = require('cookie-parser'), serveStatic = require('serve-static');
// Session 미들웨어 불러오기
var expressSession = require('express-session');
// 익스프레스 객체 생성
var app = express();
 
 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
 
 
app.use('/public', serveStatic(path.join(__dirname, 'HTML')));
 
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave: true,
    saveUninitialized:true
}));
 
http.createServer(app).listen(3000, function(){
    console.log("express server start......");
 
    connectDB();
});
 
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
 
var database;
var UserSchema;
var UserModel;
var chatSchema = mongoose.Schema({
    sender: {type: String},
    receiver: {type: String},
    content: {type: String},
    created_date: {type: Date, default: Date.now}
});
var Chat_msg = mongoose.model('chat_msgs', chatSchema, 'Chat_msgs');

var connectDB = function() {
    
    var databaseUrl = 'mongodb://localhost:27017/test';
     
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.set('useCreateIndex', true);
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, {useNewUrlParser:true});
    database = mongoose.connection;
 
    database.on('error', console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function () {
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
 
        UserSchema = mongoose.Schema({
            id: {type : String, required : true, unique: true},
            password : {type : String, required: true},
            name: {type : String, index : 'hashed'},
            age: {type : Number, 'default' : -1},
            created_at : {type : Date, index : {unique : false}, 'default' : Date.now},
            updated_at : {type : Date, index : {unique : false}, 'default' : Date.now}
        });
 
        // 스키마에 static 메소드 추가
        UserSchema.static('findById', function(id, callback) {
            return this.find({id : id}, callback);
        });
        
        UserSchema.static('findAll', function(callback) {
            return this.find({ }, callback);
        });
 
        console.log('UserSchema 정의함.');
 
        // User 모델 정의
        UserModel = mongoose.model('users', UserSchema); 
        console.log('users 정의함.');
    });
};
 
 
var authUser = function(database, id, password, callback) {
     console.log('authUser 호출됨.');
     var failcode = -1; // 추가됨. 1인 경우 id 못찾음. 2인 경우 password 틀림
    
    // 1. 아이디를 사용해 검색
    UserModel.findById(id, function(err, results) {
        if(err) {
            callback(err, null);
            return;
        }
        
        if(results.length > 0) {
            console.log('아이디와 일치하는 사용자 찾음.');
 
            // 2. 비밀번호 확인
            if(results[0]._doc.password === password) {
                console.log('비밀번호 일치함');
                callback(null, results, failcode);
            } else {
                console.log('비밀번호 일치하지 않음');
                failcode = 2;
                callback(null, null, failcode);
            }
 
        } else {
            console.log("아이디와 일치하는 사용자를 찾지 못함.");
            failcode = 1;
            callback(null, null, failcode);
        }
    });
};
 
var addUser = function(database, id, password, name, age, callback){
    console.log('addUser 호출됨.');
 
    // UserModel의 인스턴스 생성
    var user = new UserModel({"id" : id, "password" : password, "name" : name, "age" : age});
    // save()로 저장
    user.save(function(err) {
        if(err) {
            callback(err, null);
            return;
        }
        
        console.log("사용자 데이터 추가함.");
        callback(null, user);     
    });
 
};
 
var router1 = express.Router();
//var router2 = express.Router();
 
router1.route('/adduser').post(function(req,res){
    console.log('/process/adduser called.....');
 
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    var paramName = req.body.name;
    var paramAge = req.body.age;
 
      if(database) {
          addUser(database, paramId, paramPassword, paramName, paramAge, function(err, result) {
              if(err) {throw err;}
            
              // 결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
              if (result) {                  
                  res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                  res.write('<h2>Success registration.....</h2>');
                  res.write('<div><h2><a href=/public/index.html>Goto Main Page</a></h2></div>');
                  res.end();
              } else {
                  res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                  res.write('<h2>Fail to registration....</h2>');
                  res.write('<div><h2><a href=/public/index.html>Goto Main Page</a></h2></div>');
                  res.end();
              }
            });
        } else  {
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h2>database connection...fail</h2>');
            res.write('<div><h2><a href=/public/index.html>Goto Main page</a></h2></div>');
            res.end();
        }
});
 
 
router1.route('/login').post(function(req, res){ 
    console.log('/process/login 호출됨.....');
 
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    console.log(paramId + " / " + paramPassword);
    
    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs, failcode) {        
            console.log("callback run.....");
            if(err) {throw err;}
            
            if(docs) {
                console.log('....to client...');
                var username = docs[0]._doc.name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                res.write('<h1>login success...</h1>');
                res.write('<h1>hello ' + username + '</h1>');
                res.write('<div><h2><a href=/public/index.html>Goto Main Page</a></h2></div>');
                res.write('<div><h2><script src=app.js>Goto Chatting Room</script></h2></div>')
                res.end();
            }
            else {
                res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
                res.write('<h1>login fail...</h1>');
                if(failcode == 1) {
                    res.write('<div><h2>cannot find ID</h2></div>');
                    res.write('<h2><a href=/public/findid.html>Find ID</a></h2>');
                } else if(failcode == 2) {
                    res.write('<div><h2>mismatch password</h2></div>');
                    res.write('<h2><a href=/public/findpass.html>Find ID</a></h2>');
                }
                res.write('<div><h2><a href=/public/index.html>Goto Main Page</a></h2></div>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf-8'});
        res.write('<h1>connection error....</h1>');
        res.end();
    } 

});



/* 
router2.route('/findid').post(function(req, res){
    console.log("/user/findid called......");
    
    var Pname = req.body.name;
 
    UserModel.findById(Pname, function(err, results) {
        if(err) {
            console.log('error')
            res.write('<h1> error <h1>')
            return;
        }
        
        if(results.length > 0) {
            console.log('find');
            if(results[0]._doc.name === Pname) {
                res.write('<h1> 이름: ' + Pname + '</h1>');
                res.write('<h1> id: ' + results[0]._doc.id + '</h1>');
                res.end();
            }
        } else {
            res.write('<h1> 아이디: ' + Pname + '</h1>');
            res.end();
        }
    });
});
 
router2.route('/findpass').post(function(req, res){
    console.log("/user/findpass called......");
    
    var pid = req.body.id;
    var pname = req.body.name;
    
    UserModel.findById(pid, function(err, results) {
        if(err) {
            console.log('error')
            res.write('<h1> error <h1>')
            return;
        }
        
        if(results.length > 0) {
            console.log('find');
            if(results[0]._doc.id === pid && results[0]._doc.name === pname) {
                res.write('<h1> 아이디: ' + pid + '</h1>');
                res.write('<h1> 이름: ' + pname + '</h1>');
                res.write('<h1> 비밀번호: ' + results[0]._doc.password + '</h1>');
                res.end();
            }
        } else {
            res.write('<h1> 아이디: ' + pid + '</h1>');
            res.write('<h1> 비밀번호를 찾지 못했습니다.</h1>');
            res.end();
        }
    });
});
*/ 
app.use('/process', router1); // 회원가입, 로그인
//app.use('/user', router2);   // id, password 찾기 
