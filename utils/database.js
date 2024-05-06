const mysql = require('mysql2');
require('dotenv').config()

const connect = mysql.createPool({
    connectionLimit: parseInt(process.env.DB_CONNECTIONLIMIT),
    host: process.env.LOCAL_DB_HOST,
    user: process.env.LOCAL_DB_USER,
    password: "",
    database: process.env.LOCAL_DB_NAME
})



const connectDB = async(req, res) => {
    return new Promise((resolve, reject) => {
        connect.getConnection((err, connection)=> {
            if(err) {
                reject(err)
            } 
            else{
                resolve(connection)
            }
        })
    })
}


const runQuery = async(connection, sql_command, values) => {
    return new Promise((resolve, reject)=> {
        connection.query(sql_command, values, (err, result)=> {
            connection.release();
            if(err){
                reject(err)
            }
            else{
                resolve(result)
            }
        })
    })
}

module.exports = {connectDB, runQuery}