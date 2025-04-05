import jwt from "jsonwebtoken";

export const ValidateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("No token provided in the request.");
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token); // Log para verificar o token recebido

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Invalid token:", err.message);
      return res.status(401).json({ error: "Invalid token." });
    }

    req.userId = decoded.id;
    next();
  });
};
