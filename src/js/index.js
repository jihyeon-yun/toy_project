'use strict';

//socket.io 실행 후 해당 객체를 리턴받아 socket 변수에 담음
var socket = io();
var chatWindow = document.getElementById('chatWindow'); 
var sendButton = document.getElementById('chatMessageSendBtn'); 
var chatInput = document.getElementById('chatInput');

//connect 이벤트는 소켓이 연결되면 호출
socket.on('connect', function(){
    var name = prompt("대화명을 입력해주세요.", "");
    socket.emit('newUserConnect', name);
});

socket.on('updateMessage', function(data){ 
    if(data.name === 'SERVER'){
        var info = document.getElementById('info'); 
        info.innerHTML = data.message; 

        setTimeout(() => {
            info.innerText = '';
        },1000);
    }else{
        var chatMessageEl = drawChatMessage(data); 
        chatWindow.appendChild(chatMessageEl); 

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});



sendButton.addEventListener('click', function(){ 
    var message = chatInput.value;
    //msg가 비었을 경우 전송 X 
    if(!message) return false; 
    //msg가 비어있지 않고 잘 전송될 경우 sendMessage 이벤트 호출
    socket.emit('sendMessage', { 
        message 
    }); 
    
    //emit 후에 비워주지 않으면 전송 후에도 input에 메세지 그대로..
    chatInput.value = ''; 
    
});


function drawChatMessage(data){ 
    var wrap = document.createElement('p'); 
    var message = document.createElement('span'); 
    var name = document.createElement('span'); 
    
    name.innerText = data.name; 
    message.innerText = data.message; 

    name.classList.add('output__user__name'); 
    message.classList.add('output__user__message'); 

    wrap.classList.add('output__user'); 
    wrap.dataset.id = socket.id; 

    wrap.appendChild(name); 
    wrap.appendChild(message); 
    
    return wrap; 
}
