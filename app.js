const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const fs = require("fs");
const io = require('socket.io')(server);

app.use(express.static('src'));

app.get('/', function(req,res){
    fs.readFile("./src/index.html", (err,data) => {
        if(err) throw err;
        res.writeHead(200, {
            "Content-Type" : "text/html"
        })
        .write(data)
        .end();
    });
});

io.sockets.on('connection', function(socket){
    socket.on('newUserConnect', function(name){
        socket.name = name;
        io.sockets.emit('updateMessage',{
            name : 'SERVER',
            message : name + "님이 접속했습니다"
        });
    });
    socket.on('disconnect', function(){        
        io.sockets.emit('updateMessage', { 
            name : 'SERVER', 
            message : socket.name + '님이 퇴장했습니다'
        }); 
    });    

    socket.on('sendMessage', function(data){
        data.name = socket.name;
        io.sockets.emit('updateMessage', data);
    });
});

server.listen(8080, function(){
    console.log('서버 실행중...');
});