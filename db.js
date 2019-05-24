const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'nlptosql',
    password: '2019'
});

module.exports = pool.promise();

