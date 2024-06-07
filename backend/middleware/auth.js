const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    if (!token) {
      throw new Error("No token found");
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    req.auth = { userId: decodedToken.userId };

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ error: error.message });
  }
};
