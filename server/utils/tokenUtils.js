const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret';
const tokens = {}; // В будущем можно заменить на БД

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });

  tokens[userId] = refreshToken;
  return { accessToken, refreshToken };
};

const validateAccessToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};

const validateRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateTokens, validateAccessToken, validateRefreshToken, tokens };
