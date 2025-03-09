

const express = require('express');
const { register, login, refreshToken, getUsers, updateUser, getMessages, getUser } = require('../controllers/controllers');
const upload = require('../middleware/avatarMiddleware');

const router = express.Router();

// Аутентификация
router.post('/register', upload.single('avatar'), register);
router.put('/update/:userId', upload.single('avatar'), updateUser);
router.post('/login', login);
router.post('/token', refreshToken);

// Пользователи
router.get('/users', getUsers);

// Сообщения
router.get('/messages/:from/:to', getMessages);
router.get('/me/:who', getUser);

module.exports = router;
