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
                this.emitMessage(`${socket.user_name} has connected`, "SERVER", 0);
            }
            
            socket.on("chat_message", (msg)=> {
                this.emitMessage(msg, socket.user_name, socket.user_id);
            });
            
            socket.on("disconnect", ()=> {
                this.emitMessage(`${socket.user_name} has disconnected`, "SERVER", 0);
            });
        });
    }

    emitMessage(msg, user_name, user_id) {
        const message = utils.escapeHtmlTag(msg).substring(0,300);

        for(let socket of this.socket_list){
            socket.emit("chat_message", {content: message, user: user_name,  user_id: user_id});
        }
    }

    findUser(key) {
        const users = JSON.parse(fs.readFileSync("chat_pending.json"));
        for(let user of users){
            if(user.key == key){
                return {name:user.name, id:user.id};
            }
        }
        return false;
    }
}

module.exports = {
    ChatApp
}