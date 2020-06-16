let socket = io();

let msg_form = document.querySelector(".chat-form");
let msg_container = document.querySelector(".chat-messages");

function currFormatedTime(){
    let d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${d.getHours()}h${d.getMinutes()}`;
}

function createMessage(msg){
    return `<div class="message"><div class="msg-head"><a href="/user/${msg.user_id}">${msg.user}</a> le ${currFormatedTime()}</div><div class="msg-content">${msg.content}</div></div>`
}

msg_form.addEventListener("submit", e=>{
    e.preventDefault();
    socket.emit("chat_message", msg_form[0].value);
    msg_form[0].value = "";
});

socket.on("chat_message", (msg)=>{
    msg_container.innerHTML += createMessage(msg);
    console.log(msg);
});