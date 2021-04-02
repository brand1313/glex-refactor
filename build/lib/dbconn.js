"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = require("mysql2");
const connect = () => {
    const connection = mysql2_1.createPool({
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASSWORD,
        database: 'myapp',
        connectionLimit: 4
    });
    return connection.promise();
};
exports.default = connect;
