//Imports and Inits
const express = require("express");
const path = require("path");

const app = express();
const {DatabaseManager} = require("./DatabaseManager.js");
const config = require("./config.js");

//Init database
let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.db_database);

//Init middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Init view engine
app.set("view engine", "ejs");

//Routes
app.get("/", (req, res) => {
    database.getArticles(1).then(data=>{
        res.render(path.join(__dirname, "views/index.ejs"), {articles: data});
    });
});

app.get("/poster", (req, res) => {
    res.render(path.join(__dirname, "views/upload.ejs"), {message: false});
});

app.get("/post/:id", (req, res) => {
    database.getArticleById(req.params.id).then(data=>{
        res.render(path.join(__dirname, "views/post.ejs"), {article: data[0], error: false});
    }).catch(e =>{
        res.render(path.join(__dirname, "views/post.ejs"), {error: e});
    });
});

app.post("/poster", (req, res)=>{

    let {title, content} = req.body;

    if(title == "" || content == ""){
        let message = {title: "Oups",content:"Contenu ou titre vide",color:"red"}
        res.render(path.join(__dirname, "views/upload.ejs"), {message});
    } else if(content.length > 2000 || title.length >= 100){
        let message = {title: "Oups",content:"Contenu ou titre trop long.",color:"red"}
        res.render(path.join(__dirname, "views/upload.ejs"), {message});
    } else{
        database.addArticle(title, content, 1).then(m =>{
            let message = {title: "OK",content:m,color:"green"}
            res.render(path.join(__dirname, "views/upload.ejs"), {message});
        }).catch(m=>{
            let message = {title: "oups",content:m,color:"red"}
            res.render(path.join(__dirname, "views/upload.ejs"), {message});
        });
    }
});

app.listen(config.app_port);