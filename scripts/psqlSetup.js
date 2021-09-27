var fs = require('fs')
const { Client } = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'db',
    password: 'postgres',
    port: 5432,
})

let sql = 'CREATE SCHEMA IF NOT EXISTS test; CREATE OR REPLACE FUNCTION trigger_set_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW."updatedAt" = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;'
console.log("Starting psql setup")

fs.readFile(__dirname + '../prisma/schema.sql', 'utf8', function(err, data) {
    if (err) throw err;
    data = data.replace(/.*--.*/g, '')
    data = data.replace(/[\t\n\r]/gm, '')
    sql += data

    // sql += ' CREATE TRIGGER set_timestamp BEFORE UPDATE ON "test"."Post" FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();'

    client.connect()

    console.log("Connected")
    
    client.query(sql, [], (err, res) => {
        console.log(err ? err.stack : res)
        client.end()
    })
})



  