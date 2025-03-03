const { validateAccessToken } = require('../utils/tokenUtils');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  const decoded = validateAccessToken(token);
  if (!decoded) return res.status(403).json({ error: 'Неверный или истёкший токен' });

  req.userId = decoded.userId;
  next();
};

module.exports = authenticate;
