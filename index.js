var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server); 
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('listening at port %d',port);
});

//设置根目录为public
app.use(express.static(path.join(__dirname, 'public')));

//聊天室
var numUsers = 0;

io.on('connection',function(socket){
    var addedUser = false;
    //新消息
    socket.on('new message',function(data){
        socket.broadcast.emit('new message',{
            username:socket.username,
            message:data
        });
    });
    //新用户添加
    socket.on('add user',function(username){
        if(addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login',{
            numUsers:numUsers
        });

        socket.broadcast.emit('user joined',{
            username:socket.username,
            numUsers:numUsers
        });
    });
    //断开连接
    socket.on('disconnect',function(){
        if(addedUser){
            --numUsers;

            socket.broadcast.emit('user left',{
                username:socket.username,
                numUsers:numUsers
            });
        }
    });
    //
    socket.on('add chessman',function(data){
        socket.broadcast.emit('add and draw chessman',{
            color:data.turn,
            x:data.x,
            y:data.y
        })
    })
});
