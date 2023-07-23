// var mysql = require('mysql');
import mysql from 'mysql'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url';
import { MIGRATOR_QUERY } from './migrator.js';
import { Sequelize } from 'sequelize';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

export const DBTYPE = {
  MYSQL: "mysql",
  SQLITE: "sqlite"
}

export class Database {
  connection;
  type;

  constructor(host, type) {
    let sequelize
    this.type = type
    switch (type) {
      case DBTYPE.SQLITE:
        sequelize = new Sequelize({
          dialect: 'sqlite',
          storage: host
        });

        this.connection = sequelize
        break;
      case DBTYPE.MYSQL:
        sequelize = new Sequelize({
          dialect: 'mysql',
          dialectOptions: {
            host: host.host,
            user: host.user,
            password: host.password,
            database: host.database
          }
        })

        this.connection = sequelize
        break
      default:
        console.log("No type")
        process.exit()
    }

    this.migrator()
  }

  execute(query, args) {
    return this.connection.query(query, { replacements: args, }).then(([results, metadata]) => {
      if (this.isSelect(query)) {
        return results
      } else {
        return metadata
      }
    }).catch(err => {
      console.warn(err)
      return null
    })
  }

  migrator() {
    for (let i in MIGRATOR_QUERY.SQLITE) {
      this.execute(MIGRATOR_QUERY.SQLITE[i])
    }
  }

  isSelect(query) {
    return query.toLowerCase().indexOf("select") == 0
  }
  isInsert(query) {
    return query.toLowerCase().indexOf("insert") == 0
  }
  isUpdate(query) {
    return query.toLowerCase().indexOf("update") == 0
  }
  isDelete(query) {
    return query.toLowerCase().indexOf("delete") == 0
  }
}