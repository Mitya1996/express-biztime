var express = require("express");
var db = require("../db");
const router = express.Router();

router.get("", async function (req, res, next) {
  console.log("poop");
  debugger;
  try {
    const result = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /companies/[code];
router.get("/:code", async function (req, res, next) {
  debugger;

  try {
    const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      req.params.code,
    ]);

    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

//POST /companies
// router.post("", async function (req, res, next) {
//   try {
//     const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [
//       req.params.code,
//     ]);
//     return res.json(result.rows[0]);
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;
