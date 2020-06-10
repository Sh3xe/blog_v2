const mysql = require("mysql");

class DatabaseManager{
    constructor(host, user, password, database){
        this.connection = mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            database  : database
        });
        this.connection.connect();
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

    getArticleById(id){
        return new Promise((resolve, reject)=>{
            if(!isNaN(parseInt(id))){
                this.connection.query(`SELECT * FROM blog_articles WHERE article_id = ${id}`, (err, res, fld)=>{
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
            } else{
                reject("Article ID is not a number");
            }
        });
    }

    endConnection(){
        this.connection.end();
    }
}

module.exports = {
    DatabaseManager
}