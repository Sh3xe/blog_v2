"use strict";

const mysql = require("mysql2");
const crypto = require("crypto");
const config = require("./config.js");


class DatabaseManager{
    constructor(host, user, password, database){
        //Connection à la base de donnée
        this.pool = mysql.createPool({
            connectionLimit : 10,
            host            : host,
            user            : user,
            password        : password,
            database        : database
        });
    }

    //Template function

    sendDBRequest(command, value_array){
        return new Promise((resolve, reject)=>{
            this.pool.getConnection((error, connection)=>{
                if(error) reject(error);
                connection.query(command, value_array, (err, res, fld)=>{
                    if (err) reject(err);
                    else resolve(res);
                    connection.release();
                });
            });
        });
    }

    sendPreparedRequest(command, value_array){
        return new Promise((resolve, reject)=>{
            this.pool.getConnection((error, connection)=>{
                if(error) reject(error);
                connection.execute(command, value_array, (err, res, fld)=>{
                    if (err) reject(err);
                    else resolve(res);
                    connection.release();
                });
            });
        });
    }

    //CRUD
    // CREATE
    addArticle(title, content, user_id){
        return this.sendDBRequest("INSERT INTO `blog_articles` (`article_title`, `article_content`, `article_user`) VALUES (?, ?, ?)", [title, content, user_id]);
    }
    addComment(user_id, article_id, comment_content){
        return this.sendDBRequest("INSERT INTO `blog_comments`(comment_user, comment_article, comment_content) VALUES (?, ?, ?)", [user_id, article_id, comment_content]);
    }

    //READ

    getCommentById(id){
        return this.sendDBRequest("SELECT * FROM blog_comments WHERE comment_id = ?",  [id]);
    }

    getArticles(start){
        return this.sendPreparedRequest("SELECT article_id, article_title, article_content, article_date, article_views, user_name, user_id FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id ORDER BY article_date DESC LIMIT ?, 8", [start]);
    }

    getArticleById(id){
        return this.sendDBRequest("SELECT article_id, article_title, article_content, article_date, article_views, user_name, user_id FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id WHERE article_id = ?",  [id]);
    }

    getArticleComments(id, start){
        return this.sendDBRequest("SELECT comment_content, comment_date, user_name, user_id, comment_id, comment_article FROM blog_comments LEFT JOIN blog_users ON blog_comments.comment_user = blog_users.user_id WHERE comment_article = ? ORDER BY comment_date DESC LIMIT ?, 6", [id, start]);
    }

    getUserArticles(user_id, start){
        return this.sendDBRequest("SELECT article_id, article_title, article_content, article_date, user_name FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id WHERE article_user = ? ORDER BY article_date DESC LIMIT ?, 6;", [user_id, start]);
    }

    getUser(username ,password){
        let hashed_psw = crypto.createHash('sha384').update(password).digest('hex');
        return this.sendDBRequest("SELECT user_id FROM blog_users WHERE user_name = ? AND user_password = ?", [username, hashed_psw]);
    }

    getUserById(user_id){
        return this.sendPreparedRequest("SELECT user_bio, user_name, registration_date FROM blog_users WHERE user_id = ?", [user_id]);
    }

    //UPDATE
    updateBioOf(user_bio, user_id){
        return this.sendDBRequest("UPDATE blog_users SET user_bio = ? WHERE user_id = ?", [user_bio, user_id]);
    }

    addView(id){
        return this.sendPreparedRequest("UPDATE blog_articles SET article_views = article_views + 1 WHERE article_id = ?", [id]);
    }

    //DELETE
    deleteComment(id){
        return this.sendDBRequest("DELETE FROM blog_comments WHERE comment_id = ?", [id]);
    }

    deleteArticle(id){
        return this.sendDBRequest("DELETE FROM blog_articles WHERE article_id = ?", [id]);
    }
}

let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.db_database);

module.exports = database;