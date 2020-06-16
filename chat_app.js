"use strict";

const utils = require("./utils.js");
const fs = require("fs");

// THIS CODE IS HORRIBLE AND WILL BE REWRITTEN

class ChatApp {
    constructor(io_obj) {
        this.io = io_obj;
        this.messages_list = [];
        this.socket_list = [];

        this.io.on("connection", (socket)=> {
            const key = utils.getKeyFromCookie(socket.handshake.headers['cookie']);
            const user = this.findUser(key);
            if (user){
                socket.user_id   = user.id;
                socket.user_name = user.name;
                this.socket_list.push(socket);

                socket.emit("message_list", this.messages_list);
                this.emitLog(`${socket.user_name} has connected`);
                this.updateUserList();
            }
            
            socket.on("chat_message", (msg)=> {
                this.messages_list.push({content: msg, user:socket.user_name, user_id: socket.user_id});
                if(this.messages_list.length > 30){
                    this.messages_list.shift();
                }

                this.emitMessage(msg, socket.user_name, socket.user_id);
            });
            
            socket.on("disconnect", ()=> {
                this.socket_list = this.socket_list.filter(function(el) { return el != socket; });
                this.emitLog(`${socket.user_name} has disconnected`);
            });
        });
    }

    updateUserList(){
        let users = [];

        for(let socket of this.socket_list){
            users.push({name: socket.user_name, id:socket.user_id});
        }

        for(let socket of this.socket_list){
            socket.emit("user_list_update", users);
        }
    }

    emitMessage(msg, user_name, user_id) {
        const message = utils.escapeHtmlTag(msg).substring(0,300);

        for(let socket of this.socket_list){
            socket.emit("chat_message", {content: message, user: user_name,  user_id: user_id});
        }
    }

    emitLog(msg){
        for(let socket of this.socket_list){
            socket.emit("server_message", msg);
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