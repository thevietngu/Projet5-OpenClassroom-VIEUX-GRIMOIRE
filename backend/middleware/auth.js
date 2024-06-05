const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    req.auth = { userId };
    console.log('Decoded Token:', decodedToken); // Log le token décodé
    next();
  } catch (error) {
    console.error('Auth Error:', error); // Log l'erreur
    res.status(401).json({ error: 'Invalid request!' });
  }
};