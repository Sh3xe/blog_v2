"use strict";

//inits
const express = require("express");
const router = express.Router();
const database = require("./DatabaseManager.js");
const utils = require("./utils.js");

let views = { //will be used multiple times
    home     : __dirname +"/views/home.ejs",
    login    : __dirname +"/views/login.ejs",
    post     : __dirname +"/views/post.ejs",
    upload   : __dirname +"/views/upload.ejs",
    user     : __dirname +"/views/user.ejs",
    chat     : __dirname +"/views/chat.ejs"
};

function loginRequired(req, res, next){
    database.getUserById(req.session.user_id).then(()=>{
        next();
    }).catch(() =>{
        res.redirect("/login");
    });
}

//ROUTING

//GET
router.get("/", (req, res) => {
    database.getArticles().then(data=>{
        res.render(views.home, {articles: data});
    }).catch(e =>{
        res.render(views.home, {articles: false});
    });
});

router.get("/login", (req, res) => {
    database.getUserById(req.session.user_id).then(()=>{
        res.render(views.login, {message:"Vous êtes identifié!", color:"green"});
    }).catch(e =>{
        res.render(views.login, {message:false, color:"red"});
    });
});

router.get("/poster", loginRequired, (req, res) => {
    res.render(views.upload, {message: false});
});

router.get("/chat", loginRequired, (req, res)=>{
    database.getUserById(req.session.user_id).then((user)=>{
        let chat_key = utils.generateChatKey(user[0].user_name, req.session.user_id);
        res.cookie("chat-key", chat_key);
        res.render(views.chat);
    }).catch(e=>{
        res.send("problème de serveur " + e);
    });
});

router.get("/post/:id", (req, res) => {
    database.getArticleById(req.params.id).then(data=>{
        // by default the comments under the post will be an empty array
        data[0].comments = [];
        //we fetch the post's comments
        database.getArticleComments(req.params.id).then(d =>{
            data[0].comments = d;
            res.render(views.post, {article: data[0], error: false});
        }).catch(e =>{
            res.render(views.post, {article: data[0], error: false});
        });
    }).catch(e =>{
        res.render(views.post, {error: e});
    });
});

router.get("/user/:id", (req, res)=>{
    database.getUserById(req.params.id).then(user_data=>{
        database.getUserArticles(req.params.id).then((article_data)=>{
            res.render(views.user, {user:user_data, articles: article_data});
        }).catch(() =>{
            res.render(views.user, {user:user_data, articles: false});
        });
    }).catch(()=>{
        res.render(views.user, {user:false, articles: false});
    });
});

//POST
router.post("/post/:id", loginRequired, (req, res)=>{
    let content = utils.escapeHtmlTag(req.body.content);
    database.addComment(req.session.user_id, req.params.id, content).then( m =>{
        res.redirect("/post/" + req.params.id);
    }).catch(e =>{
        res.render(views.post, {article: [], error: e});
    });
});

router.post("/login", (req, res)=>{
    let {username, password} = req.body;
    database.getUser(username, password).then((user)=>{
        req.session.user_id = user[0].user_id;
        res.redirect("/");
    }).catch(message =>{
        res.render(views.upload, {message, color:"red"});
    });
});

router.post("/poster", loginRequired, (req, res)=>{
    //User sends POST to the upload page 
    let {title, content} = req.body;
    //we validate the form and get the message that will be displayed
    let {message, failed} = utils.validatePostForm(title, content);

    content = utils.escapeHtmlTag(req.body.content);

    if (!failed){
        database.addArticle(title, content, req.session.user_id).then(m =>{
            message.content = m;
            res.render(views.upload, {message});
        }).catch(m=>{
            message = {title: "oups",content:m,color:"red"};
            res.render(views.upload, {message});
        });
    } else{
        res.render(views.upload, {message});
    }
});

module.exports = router;