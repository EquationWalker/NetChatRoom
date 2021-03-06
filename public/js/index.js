const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

const socket = io();
$('#login-btn').click(() => {
  if ($('#login-name').val()== "" || $('#login-room').val() == ""){
    swal("警告", "房间名或用户名不能为空!", 'warning');
    return;
  }
  socket.emit("login", {
    name: $('#login-name').val(),
    room: $('#login-room').val(),
  })
  socket.on("loginError", data => {
    swal("登录错误!", data, "error");
  });
  socket.on("loginOk", data => {
    swal("登录成功!", data, "success");
    $('.swal2-confirm').click(() => {
      $('.sign-in-form').submit();
    })
  });
});

$('.sign-up-form').on("submit", e => {
  e.preventDefault();
  if ($('#register-name').val()== "" || $('#register-room').val() == ""){
    swal("警告", "房间名或用户名不能为空!", 'warning');
    return;
  }
  socket.emit("register", {
    name: $('#register-name').val(),
    room: $('#register-room').val(),
  });
  socket.on("registerError", data => {
    swal("注册错误", data, "error");
  });

  socket.on("registerOk", data => {
    swal("注册成功!", data, "success");
    $('.swal2-confirm').click(() => {
      sign_in_btn.click();
    })
  });

});