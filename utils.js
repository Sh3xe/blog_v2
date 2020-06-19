const fs = require("fs");

function validatePostForm(title, content){
    if(title == "" || content == ""){
        return {message:{title: "Oups",content:"Contenu ou titre vide",color:"red"}, failed:true};
    }
    if(content.length > 2000 || title.length >= 100){
        return {message:{title: "Oups",content:"Contenu ou titre trop long.",color:"red"}, failed:true};
    }
    
    return {message: {title: "OK", content:"", color:"green"}, failed:false}
}

function escapeHtmlTag(string){
    //escape HTML tags
    if (string)
        return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    else return "";
}

function generateChatKey(user_name, user_id){
    //Generate a random key
    let key = "";
    let chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    for(let i = 0; i < 20; i++){
        key += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    let users = [];

    //place this key in a json file to be used in chat_app.js
    users.push({name: user_name, id:user_id, key: key});

    //write in the file
    fs.writeFileSync("chat_pending.json", JSON.stringify(users));

    //will also be put into user's session object
    return key;
}

function getKeyFromCookie(string){
    //A simple function to parse cookie and take the "chat-key"
    for(let cookie_str of string.split(";")){
        let cookie = cookie_str.split("=");
        if(cookie[0].trim() == "chat-key"){
            return cookie[1];
        }
    }
    return false;
}

function parseMessage(message){
    /*
    * replace white spaces with "&nbsp;"
    * escape < and >, replace \n by <br> tag
    * makes "BIG text /BIG" <trong>
    * makes "ITALIC text /ITALIC" <i>
    */
   if(message){
       message = message.replace(/ /g, "&nbsp;");
       message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"); // escape the / and \, replace \ by <br>
       message = message.replace(/\/BIG/g, "</strong>").replace(/(BIG)/g, "<strong>"); //make BIG text /BIG bolg
       message = message.replace(/\/ITALIC/g, "</i>").replace(/(ITALIC)/g, "<i>"); // MAKE ITALIC text /ITALIC italic
       return message;
   }
}

module.exports = {
    validatePostForm,
    escapeHtmlTag,
    generateChatKey,
    getKeyFromCookie,
    parseMessage
}