let socket = io();

let msg_form = document.querySelector(".chat-form");
let msg_container = document.querySelector(".chat-messages");
let chat_aside = document.querySelector(".chat-aside ul");

function currFormatedTime(){
    let d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${d.getHours()}h${d.getMinutes()}`;
}

function createMessage(msg){
    return `<div class="message"><div class="msg-head"><a href="/user/${msg.user_id}">${msg.user}</a> le ${currFormatedTime()}</div><div class="msg-content">${msg.content}</div></div>`;
}

function createLogMessage(msg){
    return `<div class="message"><div class="msg-head">SERVER le ${currFormatedTime()}</div><div class="msg-content">${msg}</div></div>`;
}

msg_form.addEventListener("submit", e=>{
    e.preventDefault();
    socket.emit("chat_message", msg_form[0].value);
    msg_form[0].value = "";
});

socket.on("chat_message", (msg)=>{
    msg_container.innerHTML += createMessage(msg);
    msg_container.scrollTop = msg_container.scrollHeight;
});

socket.on("server_message", (msg)=>{
    msg_container.innerHTML += createLogMessage(msg);
    msg_container.scrollTop = msg_container.scrollHeight;
});

socket.on("message_list", (messages)=>{
    for(let message of messages){
        msg_container.innerHTML += createMessage(message);
    }
    msg_container.scrollTop = msg_container.scrollHeight;
});

socket.on("user_list_update", (users)=>{
    chat_aside.innerHTML ="";
    for(let user of users){
        chat_aside.innerHTML += `<li><a href=${user.id}>${user.name}</a></li>`;
    }
});