//Imports and Inits
const express = require("express");
const path = require("path");

const app = express();
const {DatabaseManager} = require("./DatabaseManager.js");
const config = require("./config.js");

//Init database
//let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.db_database);

//Init middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html.html"));
});

app.get("/poster", (req, res) => {
    res.sendFile(path.join(__dirname, "public/upload.html"));
});

app.get("/post/:id", (req, res) => {
    console.log(req.params.id);
    res.sendFile(path.join(__dirname, "public/upload.html"));
});


app.listen(config.app_port);