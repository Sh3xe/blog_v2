"use strict";

//inits
const express = require("express");
const router = express.Router();
const database = require("./DatabaseManager.js");
const utils = require("./utils.js");
const config = require("./config");

const path = require("path");
const multer = require("multer");

//multer init
const storage = multer.diskStorage({
    destination: `${__dirname}/public/uploads`,
    filename: (req, file, callback)=>{
        callback(null, `${file.originalname.substring(0, 100).replace(" ", "_")}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: (req, file, callback)=>{
        const extname = config.multer_allowed_files.test(file.originalname.toLocaleLowerCase());
        const mimetype = config.multer_allowed_files.test(file.mimetype);
        if(extname && mimetype) callback(null, true);
        else{
            callback("Erreure: le ficher doit faire 1mb MAX et être une image ou une vidéo");
        }
    }
}).single("Image");

//utils

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
    // redirect to /login if not logged in, create a user obj in the req esle.
    if(req.session.user_id){
        database.getUserById(req.session.user_id).then((user)=>{
            if(user.length){
                req.user = user[0];
                next();
            }
            else res.redirect("/login");
        }).catch(() => res.redirect("/login"));
    } else res.redirect("/login");
}

//ROUTING

//GET
router.get("/", (req, res) => {
    let start = 0;
    if(req.query.start) start = parseInt(req.query.start);

    database.getArticles(start).then(data=>{
        res.render(views.home, {articles: data});
    }).catch(() => res.render(views.home, {articles: false}));
});

router.get("/login", (req, res) => {
    if(req.session.user_id){
        database.getUserById(req.session.user_id).then((user)=>{
            if(user.length) res.render(views.login, {message:"Vous êtes identifié!, <a href=\"/dashboard\">Paramètres</a>", color:"green"});
            else res.render(views.login, {message:false, color:"red"});
        }).catch(() => res.render(views.login, {message:false, color:"red"}));
    } else res.render(views.login, {message:false, color:"red"});
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
    let start = 0
    if(req.query.start)start = parseInt(req.query.start);

    database.addView(req.params.id);
    database.getArticleById(req.params.id).then(article=>{
        if(article.length){
            article[0].comments = [];
            database.getArticleComments(req.params.id, start).then(comments =>{
                article[0].comments = comments;
                res.render(views.post, {article: article[0], error: false, user_id: req.session.user_id});
            }).catch(() => res.render(views.post, {article: article[0], error: false, user_id: req.session.user_id}));
        } else res.render(views.post, {error: "Aucun article trouvé"});
    }).catch(e => res.render(views.post, {error: e}));
});

router.get("/user/:id", (req, res)=>{
    let start = 0;
    if (req.query.start) start = parseInt(req.query.start);

    database.getUserById(req.params.id).then(user_data=>{
        database.getUserArticles(req.params.id, start).then((article_data)=>{
            if(article_data.length) res.render(views.user, {user:user_data, articles: article_data});
            else res.render(views.user, {user:false, articles: false});
        }).catch(() => res.render(views.user, {user:user_data, articles: false}));
    }).catch(()=> res.render(views.user, {user:false, articles: false}));
});

//POST
router.post("/post/:id", loginRequired, (req, res)=>{
    let content = utils.parseMessage(req.body.content);
    database.addComment(req.session.user_id, req.params.id,content).then(() =>{
        res.redirect("/post/" + req.params.id);
    }).catch(() => res.redirect(views.login));
});

router.post("/dashboard", loginRequired, (req, res)=>{
    let bio = utils.parseMessage(req.body.bio_content);

    database.updateBioOf(bio, req.session.user_id).then(()=>{
        res.redirect("/dashboard");
    }).catch(() => res.render(views.dashboard, {user: false, error: "Impossible de mettre à jour la bio"}));
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
    upload(req, res, (err)=>{
        let {title, content} = req.body;
        let {message, failed} = utils.validatePostForm(title, content);
        content = utils.parseMessage(content);

        if(err) {failed = true; message = err;}
        if (!failed){
            database.addArticle(title, content, req.session.user_id, req.file.filename).then(() =>{
            message.content = "Article ajouté!";
                res.render(views.upload, {message});
            }).catch(m=>{
                message = {title: "oups",content:m,color:"red"};
                res.render(views.upload, {message});
            });
        } else res.render(views.upload, {message});
    });
});

//"DELETE" //not really delete because we can't with HTML
router.post("/post/:post_id/delete_comment/:id", loginRequired, (req, res)=>{
    database.getCommentById(req.params.id).then(comment=>{
        if(comment[0].comment_user == req.session.user_id) database.deleteComment(comment[0].comment_id).then(()=>{
            res.redirect(`/post/${req.params.post_id}`);
        }).catch(()=> res.redirect(`/post/${req.params.post_id}`));
    }).catch(()=> res.redirect(`/post/${req.params.post_id}`));
});

router.post("/post/delete/:id", loginRequired, (req, res)=>{
    database.getArticleById(req.params.id).then(article=>{
        if(article[0].user_id == req.session.user_id) database.deleteArticle(article[0].article_id, article[0].article_image).then(()=>{
            res.redirect("/");
        }).catch(()=> res.redirect(`/post/${req.params.id}`));
    }).catch(()=> res.redirect(`/post/${req.params.id}`));
});

module.exports = router;