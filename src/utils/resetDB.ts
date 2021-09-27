import fs from 'fs'
import { Client } from 'pg'
import { __prod__ } from '../constants'



export function resetDB() {

  console.log("Resetting DB")

  let client: Client
  
  if (__prod__) {
    client = new Client(process.env.DATABASE_URL)
  }
  else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASS,
      port: parseInt(process.env.DB_PORT!),
      ssl: { rejectUnauthorized: false }
    })
  }

  fs.readFile('schema.sql', 'utf8', function(err, data) {
    if (err) throw err

    let sql = data

    client.connect()

    client.query(sql, [], (err, res) => {
      console.log(err ? err.stack : res)
      client.end()
      console.log("DB Reset!")
    })
  })
}





  