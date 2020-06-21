"use strict";

//Imports and Inits
const express = require("express");
const app = express();
const sessions = require("client-sessions");
const cookieParser = require("cookie-parser");
const server = require("http").createServer(app);

const io = require("socket.io")(server);
const {ChatApp} = require("./ChatApp.js");
const chat_app = new ChatApp(io);

//Hold sensitive / config information
const config = require("./config.js");

//Router files
const router = require("./routes.js");

//Init middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(sessions({ // cookie init
    cookieName: "session",
    sameSite: "strict",
    secret: config.secret_key,
    duration: 10 * 60 * 1000,
    ephemeral: true
}));

//Init view engine
app.set("view engine", "ejs");

//Routes
app.use(router);

// 404 PAGE
app.use((req, res, next)=>{
    res.status(404);
    res.render(__dirname + "/views/404.ejs", {url:req.url});
});

//LISTEN
server.listen(config.app_port, ()=> console.log(`Server started on port: ${config.app_port}`));