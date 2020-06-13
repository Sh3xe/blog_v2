"use strict";

//Imports and Inits
const express = require("express");
const path = require("path");
const sessions = require("client-sessions");

const app = express();
const {DatabaseManager} = require("./DatabaseManager.js");

const config = require("./config.js");
const utils = require("./utils.js")

//Init database
let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.db_database);

//Middleware functions
function loginRequired(req, res, next){
    database.getUserById(req.session.user_id).then(()=>{
        next();
    }).catch(e =>{
        res.redirect("/login");
    });
}

//Init middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(sessions({
    cookieName: "session",
    secret: config.secret_key,
    duration: 5 * 60 * 1000
}));

//Init view engine
app.set("view engine", "ejs");

//Routes

//GET
app.get("/login", (req, res) => {
    database.getUserById(req.session.user_id).then(()=>{
        res.render(path.join(__dirname, "views/login.ejs"), {message:"Vous êtes identifié!", color:"green"});
    }).catch(e =>{
        res.render(path.join(__dirname, "views/login.ejs"), {message:false, color:"red"});
    });
});

app.get("/", (req, res) => {
    database.getArticles().then(data=>{
        res.render(path.join(__dirname, "views/home.ejs"), {articles: data});
    }).catch(e =>{
        res.render(path.join(__dirname, "views/home.ejs"), {articles: false});
    });
});

app.get("/poster", loginRequired, (req, res) => {
    res.render(path.join(__dirname, "views/upload.ejs"), {message: false});
});

app.get("/post/:id", (req, res) => {
    database.getArticleById(req.params.id).then(data=>{
        database.addView(req.params.id);
        data[0].comments = "";
        database.getArticleComments(req.params.id).then(d =>{
            data[0].comments = d;
            res.render(path.join(__dirname, "views/post.ejs"), {article: data[0], error: false});
        }).catch(e =>{
            res.render(path.join(__dirname, "views/post.ejs"), {error: false});
        });
    }).catch(e =>{
        res.render(path.join(__dirname, "views/post.ejs"), {error: e});
    });
});

//POST
app.post("/post/:id", loginRequired, (req, res)=>{
    database.addComment(req.session.user_id, req.params.id,req.body.content).then( m =>{
        res.redirect("/post/" + req.params.id);
    }).catch(e =>{
        res.render(path.join(__dirname, "views/post.ejs"), {article: [], error: e});
    });
});

app.post("/login", (req, res)=>{
    let {username, password} = req.body;
    database.getUser(username, password).then((user)=>{
        req.session.user_id = user[0].user_id;
        res.redirect("/");
    }).catch(message =>{
        res.render(path.join(__dirname, "views/login.ejs"), {message, color:"red"});
    });
});

app.post("/poster", loginRequired, (req, res)=>{
    let {title, content} = req.body;
    let {message, failed} = utils.validatePostForm(title, content);
    let redirection_page = path.join(__dirname, "views/upload.ejs"); // will be used multiple times

    if (!failed){
        database.addArticle(title, content, req.session.user_id).then(m =>{
            message.content = m;
            res.render(redirection_page, {message});
        }).catch(m=>{
            message = {title: "oups",content:m,color:"red"};
            res.render(redirection_page, {message});
        });
    } else{
        res.render(redirection_page, {message});
    }
});

app.listen(config.app_port);