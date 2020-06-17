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
    chat     : __dirname +"/views/chat.ejs",
    dashboard: __dirname +"/views/dashboard.ejs"
};

function loginRequired(req, res, next){
    database.getUserById(req.session.user_id).then((user)=>{
        if(user.length){
            req.user = user[0];
            next();
        }
        else res.redirect("/login");
    }).catch(() =>{
        res.redirect("/login");
    });
}

//ROUTING

//GET
router.get("/", (req, res) => {
    let start = 0
    if(req.query.start){
        start = req.query.start;
    }

    database.getArticles(start).then(data=>{
        res.render(views.home, {articles: data});
    }).catch(e =>{
        res.render(views.home, {articles: false});
    });
});

router.get("/login", (req, res) => {
    database.getUserById(req.session.user_id).then((user)=>{
        if(user.length) res.render(views.login, {message:"Vous êtes identifié!, <a href=\"/dashboard\">Paramètres</a>", color:"green"});
        else res.render(views.login, {message:false, color:"red"});
    }).catch(e =>{
        res.render(views.login, {message:false, color:"red"});
    });
});

router.get("/dashboard", loginRequired, (req, res)=>{
    res.render(views.dashboard, {user: req.user, error: false});
});

router.get("/poster", loginRequired, (req, res) => {
    res.render(views.upload, {message: false});
});

router.get("/chat", loginRequired, (req, res)=>{
    let chat_key = utils.generateChatKey(req.user.user_name, req.session.user_id);
    res.cookie("chat-key", chat_key);
    res.render(views.chat);
});

router.get("/post/:id", (req, res) => {
    database.getArticleById(req.params.id).then(data=>{
        if(data.length){
            // by default the comments under the post will be an empty array
            data[0].comments = [];
            //we fetch the post's comments
            database.getArticleComments(req.params.id).then(d =>{
                data[0].comments = d;
                res.render(views.post, {article: data[0], error: false, user_id: req.session.user_id});
            }).catch(e =>{
                res.render(views.post, {article: data[0], error: false, user_id: req.session.user_id});
            });
        } else res.render(views.post, {error: "Aucun article trouvé"});
    }).catch(e =>{
        res.render(views.post, {error: e});
    });
});

router.get("/user/:id", (req, res)=>{
    database.getUserById(req.params.id).then(user_data=>{
        database.getUserArticles(req.params.id).then((article_data)=>{
            if(article_data.length) res.render(views.user, {user:user_data, articles: article_data});
            else res.render(views.user, {user:false, articles: false});
        }).catch(() =>{
            res.render(views.user, {user:user_data, articles: false});
        });
    }).catch(()=>{
        res.render(views.user, {user:false, articles: false});
    });
});

//POST
router.post("/post/:id", loginRequired, (req, res)=>{
    database.addComment(req.session.user_id, req.params.id, req.body.content).then( m =>{
        res.redirect("/post/" + req.params.id);
    }).catch(e =>{
        res.redirect(views.login);
    });
});

router.post("/dashboard", loginRequired, (req, res)=>{
    let bio = req.body.bio_content;
    database.updateBioOf(bio, req.session.user_id).then(()=>{
        res.redirect("/dashboard");
    }).catch(e=>{
        console.log(e);
        res.render(views.dashboard, {user:false, error: "Impossible de mettre à jour la bio"});
    });
});

router.post("/login", (req, res)=>{
    let {username, password} = req.body;
    database.getUser(username, password).then((user)=>{
        if (user.length){
            req.session.user_id = user[0].user_id;
            res.redirect("/");
        } else{
            res.render(views.login, {message:"Mauvais nom ou mot de passe", color:"red"});
        }
    }).catch(message =>{
        res.render(views.upload, {message, color:"red"});
    });
});

router.post("/poster", loginRequired, (req, res)=>{
    //User sends POST to the upload page 
    let {title, content} = req.body;
    //we validate the form and get the message that will be displayed
    let {message, failed} = utils.validatePostForm(title, content);

    if (!failed){
        database.addArticle(title, req.body.content, req.session.user_id).then(m =>{
            message.content = "Article ajouté!";
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