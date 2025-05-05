const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const { sector, ticker } = req.query;

    let query = "SELECT * FROM actions";
    let conditions = [];
    let params = [];

    if (sector) {
      conditions.push("LOWER(sector) LIKE ?");
      params.push(`%${sector.toLowerCase()}%`);
    }

    if (ticker) {
      conditions.push("LOWER(ticker) LIKE ?");
      params.push(`%${ticker.toLowerCase()}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    db.all(query, params, (err, actions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(actions);
    });
  });

  router.get("/setores", (req, res) => {
    const query = `SELECT DISTINCT sector FROM actions`;
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) {
        return res.status(404).json({ error: "Nenhum setor encontrado" });
      }
      res.json(rows);
    });
  });

  router.get("/:ticker", (req, res) => {
    const query = `SELECT * FROM actions WHERE ticker = ?`;
    db.get(query, [req.params.ticker], (err, action) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!action)
        return res.status(404).json({ error: "Ação não encontrada" });
      res.json(action);
    });
  });

  return router;
};
