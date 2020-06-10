//Imports and Inits
const express = require("express");
const path = require("path");

const app = express();
const {DatabaseManager} = require("./DatabaseManager.js");
const config = require("./config.js");

//Init database
let database = new DatabaseManager(config.db_host, config.db_user, config.db_password, config.database);

//Init middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));