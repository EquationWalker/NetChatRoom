const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

let soccet = io();
$('.sign-in-form').on("submit", e=>{
  socket.emit("login", {
    name:$('#login-name').value,
    room:$('#login-room').value,
  })
  socket.on("loginError", d=>{
    e.preventDefault();
    sswal("错误", "用户名或房间名不正确!", "error");
  });

  socket.on("loginOk", d=>{
    sswal("登录成功!",  "success);
  });
});

$('.sign-up-form').on("submit", e=>{
  e.preventDefault();
  socket.emit("regsiter", {
    name:$('#register-name').value,
    room:$('#register-room').value,
  });
  socket.on("registerError", data=>{
    sswal("错误", data, "error");
  });

  socket.on("registerSuccess", d=>{
    sswal("注册成功!",  "即将跳转到登录界面!", "success");
    sign_in_btn.click();
  });
});