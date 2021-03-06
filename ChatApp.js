"use strict";

const utils = require("./utils.js");
const fs = require("fs");

class ChatApp {
    constructor(io_obj) {
        this.io = io_obj;
        this.messages_list = [];
        this.socket_list = [];

        this.io.on("connection", (socket)=> {
            const key = utils.getKeyFromCookie(socket.handshake.headers['cookie']);
            const user = this.findUser(key);
            if (user){
                socket.user_id = user.id;
                socket.user_name = user.name;
                this.socket_list.push(socket);
                socket.emit("message_list", this.messages_list);
                this.emitToSockets("server_message", `${socket.user_name} has connected`);
                this.updateUserList();
            }

            socket.on("chat_message", (msg)=> {
                if(msg.trim().length){
                    msg = utils.parseMessage(msg).substring(0,300);
                    this.updateMessageList({content: msg, user:socket.user_name, user_id: socket.user_id});
                    this.emitMessage(msg, socket.user_name, socket.user_id);
                }
            });
            
            socket.on("disconnect", ()=> {
                this.socket_list = this.socket_list.filter(function(el) { return el != socket; });
                this.emitToSockets("server_message", `${socket.user_name} has disconnected`);
                this.updateUserList();
            });
        });
    }

    emitToSockets(message, content) {
        for(let socket of this.socket_list) {
            socket.emit(message, content);
        }
    }

    updateUserList(){
        let users = [];
        for(let socket of this.socket_list) {
            users.push({name: socket.user_name, id:socket.user_id});
        }

        this.emitToSockets("user_list_update", users);
    }

    emitMessage(msg, user_name, user_id) {
        const message = {content: msg, user: user_name,  user_id: user_id};
        this.emitToSockets("chat_message", message);
    }

    
    findUser(key) {
        const user = JSON.parse(fs.readFileSync("chat_pending.json"));
        if(user.key == key) return {name:user.name, id:user.id};
        else return false;
    }

    updateMessageList(msg) {
        this.messages_list.push(msg);
        if(this.messages_list.length > 30) this.messages_list.shift();
    }
}

module.exports = {
    ChatApp
}