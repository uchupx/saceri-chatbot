// var mysql = require('mysql');
import mysql from 'mysql'
// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'node_js_crud'
// });
// connection.connect(function (error) {
//   if (!!error) {
//     console.log(error);
//   } else {
//     console.log('Database Connected Successfully..!!');
//   }
// });

// module.exports = connection;

export class Database {
  constructor(host) {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'node_js_crud',
    });

    this.connection.connect(function (error) {
      if (!!error) {
        console.log(error);
      } else {
        console.log('Database Connected Successfully..!!');
      }
    });

  }

  connection;
  execute(query, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(
        query,
        args == '' ? null : args,
        (err, results) => {
          if (err) return reject(err);
          return resolve(results);
        }
      );
    });
  }
}