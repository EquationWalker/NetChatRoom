function App() {
    this.rightPanel = document.querySelector(".msg-container");
    this.chatForm = document.getElementById("chat-form");
    this.msgInput = document.getElementById("msg-input");
    this.messageContainer = document.querySelector(".msg-container");
    this.userList = [];
    this.name = "";
    this.room = "";

    this.socket = io();

    this.getParams();

    this.setRoom();

    this.joinRoom().listen();
}

App.prototype.outPutMessage = function (message) {
    const isMine = this.isMine(message);

    let id = this.userList.findIndex(function (item) {
        return item.id == message.id;
    })
    if (isMine) {
        $(".msg-container").append(`<div class="self-msg" style='display:none;'> 
        <div class="self-content"> <pre>${message.content}</pre></div>
        <div class="self-name"> ${id}</div>
        </div>
    `)
    } else {
        $(".msg-container").append(`<div class="other-msg" style='display:none;'> 
        <div class="other-name"> ${id}</div>
        <div class="other-content"> <pre>${message.content}</pre></div>
        </div>
    `)
    }

    $('.msg-container>:last-child').fadeIn('slow');
    return this;
};

/*App.prototype.sendImg = function (res) {
    this.socket.emit('sendImage', {
        id: this.socket.id,
        name: this.name,
        img: res
    });

}*/
App.prototype.recvImg = function (data) {
    //把接受到的消息显示在聊天窗口
    //判断消息是自己或别人的
    let id = this.userList.findIndex(function (item) {
        return item.id == data.id;
    })
    if (data.name === this.name) {
        $(".msg-container").append(`<div class="self-msg">
             <div class="self-content">
                 <img src="${data.img}" alt="img error!">
             </div>
             <div class="self-name">${id}</div>
         </div>`)

    } else {
        //别人的消息
        $(".msg-container").append(`<div class="other-msg">
            <div class="other-name">${id}</div>
             <div class="other-content">
                 <img class="msg-img" src="${data.img}" alt="img error!">
             </div>
         </div>`)
    }
    return this;
};

App.prototype.addUser = function (item) {
    $(".msg-container").append(`<div class="system-msg">
    <div class="system-time">${item.time}</div>
    <div class="system-content">${item.name}加入!</div>
</div>`);
    this.userList.push({
        id: item.id,
        name: item.name
    });
    let cont = `<li class='li-style'"><span style='display:none'>${item.id}</span>
    ${item.name}</li>`
    $('.user-list').append(cont);


    return this;
}

App.prototype.removeUser = function (item) {
    $(".msg-container").append(`<div class="system-msg">
    <div class="system-time">${item.time}</div>
    <div class="system-content">${item.name}离开!</div>
</div>`);
    idx = this.userList.findIndex(e => {
        return e.id == item.id
    })
    if (idx > -1) {
        this.userList.splice(idx, 1);
    }
    return this;
}

App.prototype.joinRoom = function () {
    this.socket.emit("joinRoom", {
        name: this.name,
        room: this.room
    });
    return this;
};

App.prototype.listen = function () {
    let sock = this.socket;
    sock.on("chatMessage", (message) => {
        this.outPutMessage(message).scroll().clear();
    });
    //监听图片信息
    //发送图片 change表示该文件的选择
    let username = this.name;
    $('#img-upload').on("change", function () {
        //拿到上传的文件
        var file = this.files[0];

        //把文件发送的服务器，使用H5的功能fileReader,读取上传的文件
        var fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => {
            sock.emit('sendImage', {
                id: sock.id,
                name: username,
                img: fr.result
            });
            console.log(fr);
        }
    })
    sock.on('receiveImage', data => this.recvImg(data).scroll().clear());

    sock.on("roomUsers", userList => this.setUserList(userList));

    sock.on("addUser", item => this.addUser(item).scroll().clear());
    sock.on("removeUser", item => this.removeUser(item).scroll().clear());

    this.chatForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!this.valid()) {
            swal("警告", "消息不能为空", "warning");
            return;
        }

        sock.emit("chatMessage", {
            id: sock.id,
            content: this.msgInput.value,
            ...this.getParams(),
        });
    });
};

App.prototype.setRoom = function () {
    console.log(this.name);
    $(".room-name").append(this.room);
};

App.prototype.setUserList = function (userList) {
    let listHtml = "";

    userList.map((user) => {
        listHtml += `<li class='li-style'"><span style='display:none'>${user.id}</span>
        ${user.name}</li>`;
    });
    $('.user-list').empty();
    $('.user-list').append(listHtml)
    userList.forEach(item => {
        this.userList.push({
            id: item.id,
            name: item.name
        })
    })

};

App.prototype.valid = function () {
    return !!this.msgInput.value;
};

App.prototype.scroll = function () {
    let scrollHeight = $('.msg-container').prop("scrollHeight");
    $(".msg-container").animate({scrollTop:scrollHeight}, 400);
    return this;
};

App.prototype.clear = function () {
    this.msgInput.value = "";
    this.msgInput.focus();
    return this;
};

App.prototype.isMine = function (message) {
    return this.name == message.name;
};

App.prototype.getParams = function () {
    const params = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    this.name = params.name;
    this.room = params.room;
    //console.log(params, this.name);

    return params;
};

window.addEventListener("keydown", function (event) {
    if (event.key == 'Enter') {
        $('.sendBtn').click();
    }
});

$('#img-upload-btn').click(function () {
    $('#img-upload').click();
})
/*
$('#video-upload-btn').click(function () {
    $('#video-upload').click();
})*/


const app = new App();