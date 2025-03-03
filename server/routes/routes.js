const express = require('express');
const { register, login, refreshToken, getUsers, getMessages, getUser } = require('../controllers/controllers');

const router = express.Router();

// Аутентификация
router.post('/register', register);
router.post('/login', login);
router.post('/token', refreshToken);

// Пользователи
router.get('/users', getUsers);

// Сообщения
router.get('/messages/:from/:to', getMessages);
router.get('/me/:who', getUser);

module.exports = router;
