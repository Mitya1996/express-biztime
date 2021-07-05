var express = require("express");
var db = require("../db");
const ExpressError = require("../expressError");

const router = express.Router();

// GET /invoices
// Return info on invoices: like {invoices: [{id, comp_code}, ...]}
router.get("", async function (req, res, next) {
  try {
    const result = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /invoices/[id]
// Returns obj on given invoice.

// If invoice cannot be found, returns 404.

// Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}
router.get("/:id", async function (req, res, next) {
  try {
    const invoiceQuery = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
      req.params.id,
    ]);
    const invoice = invoiceQuery.rows[0];
    if (!invoice) throw new ExpressError("Invoice does not exist", 404);
    const companyQuery = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [invoice["comp_code"]]
    );
    const company = companyQuery.rows[0];
    const result = { ...invoice, company: company };
    delete result.comp_code; //for some reason wants this not to be part of output
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /invoices
// Adds an invoice.

// Needs to be passed in JSON body of: {comp_code, amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.post("/", async function (req, res, next) {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.put("/:id", async function (req, res, next) {
  try {
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices SET amt=$2
             WHERE id = $1
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [req.params.id, amt]
    );
    // Should return 404 if company cannot be found.
    if (!result.rows[0]) throw new ExpressError("Invoice does not exist", 404);

    return res.status(200).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /invoices/[id]
// Deletes an invoice.

// If invoice cannot be found, returns a 404.

// Returns: {status: "deleted"}
router.delete("/:id", async function (req, res, next) {
  try {
    const result = await db.query("DELETE FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    //if affected rows is 0 then nothing was deleted
    if (result.rowCount === 0)
      throw new ExpressError("Invoice does not exist", 404);

    return res.status(202).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
