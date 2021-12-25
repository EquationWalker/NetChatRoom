function App() {
    this.userList = [];
    this.name = "";
    this.room = "";

    /*this.myPeer = "";
    this.video_id = 0;
    this.peers = {};*/

    this.socket = io();

    this.getParams();
    this.checkValid();

    this.setRoom();

    this.joinRoom().listen();
}

App.prototype.checkValid = function () {
    const data = this.getParams();
    //console.log('ccc', name1, room1)
    this.socket.emit('login', data);
    this.socket.on("loginError", e=>{
        swal('错误', '非法登录,请从登录页面登录!', 'error');
        $('.confirm').click(() => {
            $('.exitBtn')[0].click();
          });
    })

  }

App.prototype.outPutMessage = function (message) {
    const isMine = this.isMine(message);

    let id = "";
    if (message.name.length == 1) id = message.name[0];
    else if (message.name.length == 2) id = message.name[1];
    else id = message.name[2];
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

App.prototype.recvImg = function (data) {
    //把接受到的消息显示在聊天窗口
    //判断消息是自己或别人的
    let id = "";
    if (data.name.length == 1) id = data.name[0];
    else if (data.name.length == 2) id = data.name[1];
    else id = data.name[2];
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

    let dislayName = item.name;
    if (item.name == this.name) dislayName = '你'
    $(".msg-container").append(`<div class="system-msg">
    <div class="system-time">${item.time}</div>
    <div class="system-content">欢迎${dislayName}加入聊天室!</div>
</div>`);
    $('.chat-title').text(`网络聊天室(${this.userList.length})`);
    if (item.name == this.name) return this;
    this.userList.push({
        id: item.id,
        name: item.name
    });
    let cont = `<li class='li-style' id='${item.id}'>${item.name}</li>`
    $('.user-list').append(cont);
    return this;
}

App.prototype.removeUser = function (item) {
    $(".msg-container").append(`<div class="system-msg">
    <div class="system-time">${item.time}</div>
    <div class="system-content">${item.name}离开!</div>
</div>`);
    let idx = this.userList.findIndex(e => {
        return e.id == item.id
    })
    if (idx == -1) {
        return this;
    }
    this.userList.splice(idx, 1);
    let ele = this.userList[idx];

    let childNodes = $('.user-list').children();
    for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].id == ele.id) {
            childNodes[i].remove();
        }
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
        }
    })
    sock.on('receiveImage', data => this.recvImg(data).scroll().clear());

    sock.on("roomUsers", userList => this.setUserList(userList));

    sock.on("addUser", item => this.addUser(item).scroll().clear());
    sock.on("removeUser", item => this.removeUser(item).scroll().clear());

    $("#chat-form").on("submit", (e) => {
        e.preventDefault();

        if (!this.valid()) {
            swal("警告", "消息不能为空", "warning");
            return;
        }

        sock.emit("chatMessage", {
            id: sock.id,
            content: $("#msg-input").val(),
            ...this.getParams(),
        });
    });
};

App.prototype.setRoom = function () {
    $(".room-name").append(this.room);
};

App.prototype.setUserList = function (userList) {
    let listHtml = "";
    let myName = this.name;

    userList.map((user) => {
        let disName = user.name == myName ? `你(${user.name})` : user.name;
        listHtml += `<li class='li-style' id='${user.id}'>${disName}</li>`;
    });
    $('.user-list').empty();
    $('.user-list').append(listHtml)
    userList.forEach(item => {
        this.userList.push({
            id: item.id,
            name: item.name
        })
    })
    $('.chat-title').text(`网络聊天室(${this.userList.length})`);

};

App.prototype.valid = function () {
    return !!$("#msg-input").val();
};

App.prototype.scroll = function () {
    let scrollHeight = $('.msg-container').prop("scrollHeight");
    $(".msg-container").animate({
        scrollTop: scrollHeight
    }, 400);
    return this;
};

App.prototype.clear = function () {
    $("#msg-input").val('')
    $("#msg-input").focus();
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
    console.log('getParams', params, this.name);

    return params;
};

/*
$('#video-upload-btn').click(function () {
    $('#video-upload').click();
})*/
/*
App.prototype.joinVideoRoom = function () {
    this.myPeer = new Peer(undefined, {
        host: '/',
        port: '6001'
    })

    
    const myVideo = document.createElement('video')
    myVideo.muted = true
    //this.peers = {}
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream);

        this.myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        this.socket.on('user-video-connected', 
            userId => {
            this.connectToNewUser(userId, stream)
        })
    })

    this.socket.on('user-video-disconnected', userId => {
        if (this.peers[userId]) this.peers[userId].close()
    })

    this.myPeer.on('open', id => {
        this.socket.emit('join-video-room', {
            room: this.room,
            video_id: id
        });
        this.video_id = id;
    })
}


App.prototype.leaveVideoRoom = function(){
    this.socket.emit('leave-video-room', {
        room: this.room,
        video_id: this.video_id
    })
}
App.prototype.connectToNewUse = function (userId, stream) {
    const call = this.myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    this.peers[userId] = call
}
function addVideoStream (video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    $('video-grid').append(video)
}*/

window.addEventListener("keydown", function (event) {
    if (event.key == 'Enter') {
        $('.sendBtn').click();
    }
});

$('#img-upload-btn').click(function () {
    $('#img-upload').click();
})
const app = new App();