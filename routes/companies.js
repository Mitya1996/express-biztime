var express = require("express");
var db = require("../db");
const ExpressError = require("../expressError");

const router = express.Router();

router.get("", async function (req, res, next) {
  try {
    const result = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /companies/[code];
router.get("/:code", async function (req, res, next) {
  try {
    const result = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      req.params.code,
    ]);
    if (!result.rows[0]) throw new ExpressError("Company does not exist", 404);
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

//POST /companies
router.post("/", async function (req, res, next) {
  try {
    const { code, name, description } = req.body;

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /companies/[code]
// Edit existing company.

// Needs to be given JSON like: {name, description}

// Returns update company object: {company: {code, name, description}}

router.put("/:code", async function (req, res, next) {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE companies SET name=$2, description=$3
           WHERE code = $1
           RETURNING code, name, description`,
      [req.params.code, name, description]
    );
    // Should return 404 if company cannot be found.
    if (!result.rows[0]) throw new ExpressError("Company does not exist", 404);

    return res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /companies/[code]
// Deletes company.

// Should return 404 if company cannot be found.

// Returns {status: "deleted"}

router.delete("/:code", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM companies WHERE code = $1", [
      req.params.code,
    ]);
    //if affected rows is 0 then nothing was deleted
    if (result.rowCount === 0)
      throw new ExpressError("Company does not exist", 404);

    return res.status(202).json({ message: "Company deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
