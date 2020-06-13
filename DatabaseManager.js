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
            //article_id | article_title | article_content          | article_date        | article_views | article_user | user_id | user_name
            this.connection.query(`SELECT article_id, article_title, article_content, article_date, article_views, user_name FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id ORDER BY article_date DESC`, (err, res, fld)=>{
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
                //SELECT * FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id;
                this.connection.query(`SELECT article_id, article_title, article_content, article_date, article_views, user_name FROM blog_articles LEFT JOIN blog_users ON blog_articles.article_user = blog_users.user_id WHERE article_id = ?`, [id], (err, res, fld)=>{
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

    getArticleComments(id){
        return new Promise((resolve, reject)=>{
            this.connection.query("SELECT comment_content, comment_date, user_name FROM blog_comments LEFT JOIN blog_users ON blog_comments.comment_user = blog_users.user_id WHERE comment_article = ?", [id], (err, res, fld)=>{
                if (err){
                    reject(err);
                } else{
                    if(res.length != 0){
                        resolve(res);
                    } else{
                        reject('Pas de commentaires.');
                    }
                }
            });
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
                        reject('Nom d\'utilisateur ou mot de passe incorrect');
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

    //COMMENTS RELATED FUNCTIONS

    addComment(user_id, article_id, comment_content){
        return new Promise((resolve, reject)=>{
            this.connection.query("INSERT INTO `blog_comments`(comment_user, comment_article, comment_content) VALUES (?, ?, ?)", [user_id, article_id, comment_content], (err, res, fld)=>{
                if(err){
                    reject(err);
                } else{
                    if(res.length != 0){
                        resolve("Commentaire ajouté!");
                    } else{
                        reject("Un problème est survenu.");
                    }
                }
            });
        });
    }
}

module.exports = {
    DatabaseManager
}