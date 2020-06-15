"use strict";

const mysql = require("mysql");
const crypto = require("crypto");
const config = require("./config.js");


class DatabaseManager{
    constructor(host, user, password, database){
        //Connection à la base de donnée
        this.connection = mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            database : database
        });
        this.connection.connect();
    }

    // CREATE

    addArticle(title, content, user_id){
        return new Promise((resolve, reject)=>{
            this.connection.query("INSERT INTO `blog_articles` (`article_title`, `article_content`, `article_user`) VALUES (?, ?, ?)", [title, content, user_id], (err, res, fld)=>{
                if(err) reject(err);
                resolve("Ajouté!");
            });
        });
    }

    addComment(user_id, article_id, comment_content){
        return new Promise((resolve, reject)=>{
            this.connection.query("INSERT INTO `blog_comments`(comment_user, comment_article, comment_content) VALUES (?, ?, ?)", [user_id, article_id, comment_content], (err, res, fld)=>{
                if(err) reject(err);
                resolve("Commentaire ajouté!");
            });
        });
    }

    //READ

    getArticles(){ //TEMPORAIRE PROBLEME DE DURABILITEE
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT article_id, article_title, article_content, article_date, article_views, user_name FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id ORDER BY article_date DESC", (err, res, fld)=>{
                if (err) reject(err)
                if(!res.length) reject("Pas de post trouvé :/");
                else resolve(res);
            });
        });
    }

    getArticleById(id){
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT article_id, article_title, article_content, article_date, article_views, user_name FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id WHERE article_id = ?", [id], (err, res, fld)=>{
                if (err) reject(err);
                if (!res.length) reject("Impossible de trouver cette article");
                else resolve(res);
            });
        });
    }

    getArticleComments(id){
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT comment_content, comment_date, user_name FROM blog_comments LEFT JOIN blog_users ON blog_comments.comment_user = blog_users.user_id WHERE comment_article = ?", [id], (err, res, fld)=>{
                if (err) reject(err);
                if(!res.length) reject('Pas de commentaires.');
                else resolve(res);
            });
        });
    }

    getUser(username ,password){
        let hashed_psw = crypto.createHash('sha384').update(password).digest('hex');
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT user_id FROM blog_users WHERE user_name = ? AND user_password = ?", [username, hashed_psw], (err, res, fld)=>{
                if (err) reject(err);
                if(!res.length) reject('Nom d\'utilisateur ou mot de passe incorrect');
                else resolve(res);
            });
        });
    }

    getUserById(user_id){
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT user_name, registration_date FROM blog_users WHERE user_id = ?", [user_id], (err, res, fld)=>{
                if (err) reject(err)
                if(!res.length) reject("Impossible de trouver cette utilisateur");
                else resolve(res);
            });
        });
    }
}

let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.db_database);

module.exports = database;