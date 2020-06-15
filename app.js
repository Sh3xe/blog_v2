"use strict";

//Imports and Inits
const express = require("express");
const app = express();
const sessions = require("client-sessions");


//Hold sensitive / config information
const config = require("./config.js");

//Router files
const router = require("./routes.js");

//Init middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(sessions({ // cookie init
    cookieName: "session",
    secret: config.secret_key,
    duration: 5 * 60 * 1000
}));

//Init view engine
app.set("view engine", "ejs");

//Routes
app.use(router);

// 404 PAGE
app.use((req, res, next)=>{
    res.status(404);
    res.render(views.not_found, {url:req.url});
});

//LISTEN
app.listen(config.app_port);