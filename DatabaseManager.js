const mysql = require("mysql");
const crypto = require("crypto");

class DatabaseManager{
    constructor(host, user, password, database){
        this.connection = mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            database : database
        });
        this.connection.connect();
    }

    //ARTICLE RELATED FUNCTIONS
    addView(article_id){
        if(!isNaN(parseInt(article_id))){
            this.connection.query("UPDATE blog_articles SET article_views = article_views + 1 WHERE article_id = ?", [article_id]);
        }
    }

    addArticle(title, content, user_id){
        return new Promise((resolve, reject)=>{
            if(!isNaN(parseInt(user_id))){
                this.connection.query("INSERT INTO `blog_articles` (`article_title`, `article_content`, `article_user`) VALUES (?, ?, ?)", [title, content, user_id], (err, res, fld)=>{
                    if(err) reject(err);
                    resolve("sucessfully added!");
                });
            } else{
                reject("Article_id is not a number");
            }
        });
    }

    getArticles(){ //TEMPORAIRE PROBLEME DE DURABILITEE
        return new Promise((resolve, reject)=>{
            this.connection.query(`SELECT * FROM blog_articles`, (err, res, fld)=>{
                if (err){
                    reject(err)
                } else{
                    if(res.length != 0){
                        resolve(res);
                    } else{
                        reject('Article not found');
                    }
                }
            });
        });
    }

    getArticleById(id){
        return new Promise((resolve, reject)=>{
            if(!isNaN(parseInt(id))){
                this.connection.query(`SELECT * FROM blog_articles WHERE article_id = ?`, [id], (err, res, fld)=>{
                    if (err){
                        reject(err)
                    } else{
                        if(res.length != 0){
                            resolve(res);
                        } else{
                            reject('Impossible de trouver cette article');
                        }
                    }
                });
            } else{
                reject("Identifiant de l'article n'est pas un nombre");
            }
        });
    }

    //USER RELATED FUNCTIONS

    getUser(username ,password){
        let hashed_psw = crypto.createHash('sha384').update(password).digest('hex');
        return new Promise((resolve, reject)=>{
            this.connection.query(`SELECT user_id FROM blog_users WHERE user_name = ? AND user_password = ?`, [username, hashed_psw], (err, res, fld)=>{
                if (err){
                    reject(err)
                } else{
                    if(res.length != 0){
                        resolve(res);
                    } else{
                        reject('Impossible de trouver cette utilisateur');
                    }
                }
            });
        });
    }

    getUserById(user_id){
        return new Promise((resolve, reject)=>{
            if(!isNaN(user_id)){
                this.connection.query(`SELECT * FROM blog_users WHERE user_id = ?`, [user_id], (err, res, fld)=>{
                    if (err){
                        reject(err)
                    } else{
                        if(res.length != 0){
                            resolve();
                        } else{
                            reject('Impossible de trouver cette utilisateur');
                        }
                    }
                });
            } else{
                reject("Mauvaise ID");
            }
        });
    }
}

module.exports = {
    DatabaseManager
}