const express = require("express");
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

module.exports = (db) => {
  const router = express.Router();

  router.get("/acoes", authenticateToken, authorizeAdmin, (req, res) => {
    db.all(`SELECT * FROM actions`, [], (err, actions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(actions);
    });
  });

  router.post("/acoes", authenticateToken, authorizeAdmin, (req, res) => {
    const { ticker, name, description, sector, price } = req.body;
    const query = `INSERT INTO actions (ticker, name, description, sector, price) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [ticker, name, description, sector, price], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ message: "Ação criada", id: this.lastID });
    });
  });

  router.get("/acoes/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const query = `SELECT * FROM actions WHERE id = ?`;
    db.get(query, [req.params.id], (err, action) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!action)
        return res.status(404).json({ error: "Ação não encontrada" });
      res.json(action);
    });
  });

  router.put("/acoes/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const { ticker, name, description, sector, price } = req.body;
    const query = `UPDATE actions SET ticker = ?, name = ?, description = ?, sector = ?, price = ? WHERE id = ?`;
    db.run(
      query,
      [ticker, name, description, sector, price, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Ação atualizada." });
      }
    );
  });

  router.delete("/acoes/:id", authenticateToken, authorizeAdmin, (req, res) => {
    const query = `DELETE FROM actions WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Acão excluída" });
    });
  });

  return router;
};
