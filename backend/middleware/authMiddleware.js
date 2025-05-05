const jwt = require("jsonwebtoken");
const SECRET = "CHAVE_SEGREDO";

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token)
    return res.status(401).json({ error: "Acesso negado por falta de token" });

  const tokenParts = token.split(" ");

  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer")
    return res.status(400).json({ error: "Token no formato inválido" });

  jwt.verify(tokenParts[1], SECRET, (err, user) => {
    if (err) {
      console.log("Erro na verificação:", err);
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Acesso permitido apenas para usuários administradores" });
  }
  next();
}

module.exports = { authenticateToken, authorizeAdmin };
