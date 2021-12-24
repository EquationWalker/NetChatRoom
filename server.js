const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const moment = require("moment");
const {
    userJoin,
    userLeave,
    getRoomUsers,
    checkVaild,
    registerUser
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));


io.on("connection", (socket) => {


    socket.on("login", data => {
        if (checkVaild(data.name, data.room) == true) {
            socket.emit('loginOk', "验证成功!");
        } else {
            socket.emit("loginError", "用户名或房间名不正确!");
        }
    })
    socket.on("register", data => {
        if (checkVaild(data.name, data.room) == false) {
            registerUser(data.name, data.room)
            socket.emit('registerOk', "注册成功,即将跳转到登录界面!");
        } else {
            socket.emit("registerError", "账号已经存在,请登录!");
        }
    })

    socket.on("joinRoom", ({
        name,
        room
    }) => {
        // 向房间其他人广播用户加入消息
        io.to(room).emit("addUser", {
            "id": socket.id,
            "name": name,
            "time": moment().utcOffset(8).format("HH:mm:ss")
        });
        socket.join(room);
        userJoin(socket.id, name, room);
        // 通知当前在线用户列表
        socket.emit('roomUsers', getRoomUsers(room));

        socket.on("chatMessage", (message) => {
            io.to(room).emit("chatMessage", {
                ...message,
            });
        });

        socket.on('sendImage', data => {
            //广播消息,
            io.to(room).emit('receiveImage', data);
        })

        socket.on("disconnect", () => {
            console.log(socket.id, name, room, "user exit!");

            userLeave(socket.id);
            // 广播用户离开消息 更新房间用户列表
            io.to(room).emit("removeUser", {
                "id": socket.id,
                "name": name,
                "time": moment().utcOffset(8).format("HH:mm:ss")
            });
            io.to(room).emit('roomUsers', getRoomUsers(room));
        });
    });
});

const PORT = process.env.PORT || 9527;

server.listen(PORT, () => console.log(`Server runing on port ${PORT}`));