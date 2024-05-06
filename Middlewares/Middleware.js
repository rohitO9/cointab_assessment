const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const speakeay = require("speakeasy");

const verifyToken = (req, res, next) =>{
    // Get token from header
    const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ auth: false, message: 'No token provided' });

  // Verify JWT token
  jwt.verify(token.split(' ')[1], secret, (err, decoded) => {
    if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token' });
    req.userId = decoded.id; // Store decoded user ID for further use
    next();
  });
}
module.exports = verifyToken;