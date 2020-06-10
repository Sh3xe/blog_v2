const mysql = require("mysql");

class DatabaseManager{
    constructor(host, user, password, database){
        this.connection = mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            databse  : database
        });
        this.connection.connect();
    }

    endConnection(){
        this.connection.end();
    }
}

module.exports = {
    DatabaseManager
}