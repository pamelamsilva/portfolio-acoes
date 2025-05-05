const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middleware/authMiddleware");

const SECRET = "CHAVE_SEGREDO";

module.exports = (db) => {
  const router = express.Router();

  router.post("/cadastro", (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'investor')`;
    db.run(query, [name, email, hashedPassword], function (err) {
      if (err) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      res.status(201).json({ message: "Usuário adicionado com sucesso" });
    });
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user)
        return res.status(404).json({ error: "Usuário não encontrado" });

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid)
        return res.status(401).json({ error: "Credenciais inválidas" });

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
        expiresIn: "2h",
      });
      res.json({ token, role: user.role });
    });
  });

  router.get("/usuario/favoritos", authenticateToken, (req, res) => {
    const query = `
      SELECT actions.* FROM favorites
      JOIN actions ON favorites.action_id = actions.id
      WHERE favorites.user_id = ?
    `;
    db.all(query, [req.user.id], (err, favorites) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(favorites);
    });
  });

  router.post("/usuario/favoritos", authenticateToken, (req, res) => {
    const { action_id } = req.body;
    const query = `INSERT INTO favorites (user_id, action_id) VALUES (?, ?)`;
    db.run(query, [req.user.id, action_id], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ message: "Favorito adicionado" });
    });
  });

  router.delete("/usuario/favoritos", authenticateToken, (req, res) => {
    const { action_id } = req.body;
    const query = `DELETE FROM favorites WHERE user_id = ? AND action_id = ?`;
    db.run(query, [req.user.id, action_id], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(200).json({ message: "Favorito removido" });
    });
  });

  return router;
};
