/** Database setup for BizTime. */

const { Client } = require("pg");

function DB_URI() {
  let DB_URI;
  if (process.env.NODE_ENV == "prod") {
    DB_URI = "postgresql://postgres:myPassword@localhost:5432/biztime";
  } else {
    DB_URI = "postgresql://postgres:myPassword@localhost:5432/biztime_test";
  }
  return DB_URI;
}

let db = new Client({
  connectionString: DB_URI(),
});

db.connect();

module.exports = db;
