// /root/common/altushka/server/controllers/controllers.js

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, validateRefreshToken, tokens } = require('../utils/tokenUtils');

const prisma = new PrismaClient();

// Регистрация нового пользователя
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const file = req.file;
  
    if (!username || !password) return res.status(400).json({ error: 'Все поля обязательны' });

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl = null;
    if (file) {
      avatarUrl = 'https://altushka.site/uploads/avatars/' + file.filename;
    }

    const newUser = await prisma.user.create({
    data: 
      { 
        username,
        passwordHash: hashedPassword,
        avatarUrl
      },
    });

    const tokenData = generateTokens(newUser.id);
    res.json({ message: 'Регистрация успешна', ...tokenData });

    } catch (err) {
        res.status(500).json({ error: 'Хм... Кажется, альтушка упала. Попробую ее поднять.' });
    }
};

// Авторизация пользователя
const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Введены неверные учетные данные. Вы не альтушка?' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Неверный пароль от сердца юной дамы, но она даёт второй шанс.' });

    const tokenData = generateTokens(user.id);
    res.json({ message: 'Авторизация успешна', ...tokenData });
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;
  const file = req.file; // если есть загружаемый файл

  try {
    // Собираем данные для апдейта
    const dataToUpdate = {};

    if (username) dataToUpdate.username = username;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      dataToUpdate.passwordHash = hashed;
    }
    if (file) {
      dataToUpdate.avatarUrl = 'https://altushka.site/uploads/avatars/' + file.filename;
    }


    // Сам апдейт
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const newTokens = generateTokens(updatedUser.id);

    return res.json({ message: 'Данные пользователя обновлены', user: updatedUser, ...newTokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка обновления пользователя' });
  }
};


// Обновление токена
const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Нет refresh-токена' });

    const decoded = validateRefreshToken(refreshToken);
    if (!decoded || tokens[decoded.userId] !== refreshToken) {
        return res.status(403).json({ error: 'Неверный refresh-токен' });
    }

    const accessToken = generateTokens(decoded.userId).accessToken;
    res.json({ accessToken });
};

// Получить список пользователей
const getUsers = async (req, res) => {
    const { search } = req.query;
    try {
        const users = search
            ? await prisma.user.findMany({ where: { username: { contains: search, mode: 'insensitive' } } })
            : await prisma.user.findMany();

        const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
        res.json(safeUsers);
    } catch (err) {
        console.error('Ошибка при поиске пользователей:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// Получить историю сообщений между двумя пользователями
const getMessages = async (req, res) => {
    const { from, to } = req.params;
    try {
        let conversation = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: from, toId: to },
                    { fromId: to, toId: from },
                ],
            },
            orderBy: { created_at: 'asc' },
        });

        conversation.length === 0 ? conversation = Date.now() : conversation;

        res.json(conversation);
    } catch (err) {
        console.error('Ошибка при получении сообщений:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// Получить список собеседников для пользователя + последнее сообщение
const getUser = async (req, res) => {
  const { who } = req.params;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: who },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      }
    });

    if (!currentUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Ищем все сообщения, где участник — who
    const userMessages = await prisma.message.findMany({
      where: {
        OR: [{ fromId: who }, { toId: who }],
      },
    });

    // Собираем ID всех собеседников
    const recipientIds = new Set();
    userMessages.forEach((m) => {
      recipientIds.add(m.fromId);
      recipientIds.add(m.toId);
    });
    recipientIds.delete(who); // Убираем самого себя

    // Загружаем список собеседников (id, username)
    const recipients = await prisma.user.findMany({
      where: { id: { in: Array.from(recipientIds) } },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    // Теперь для каждого собеседника достаём последнее сообщение
    let chats = [];
    for (const r of recipients) {
      // Последнее по времени сообщение от who к r ИЛИ от r к who
      const lastMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { fromId: who, toId: r.id },
            { fromId: r.id, toId: who },
          ],
        },
        orderBy: { created_at: 'desc' },
      });

      chats.push({
        id: r.id,
        username: r.username,
        lastMessage: lastMsg ? {
          text: lastMsg.text,
          created_at: lastMsg.created_at,
          fromId: lastMsg.fromId,
          toId: lastMsg.toId,
        } : null,
        avatarUrl: r.avatarUrl,
      });
    }

    chats.length === 0 ? chats = "Нет ни одной переписки" : chats;
    console.log(chats);
    // Итоговый ответ
    res.json({
      user: currentUser,
      chats,
    });
  } catch (err) {
    console.error('Ошибка при получении пользователя и списка собеседников:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};



module.exports = { register, login, updateUser, refreshToken, getUsers, getMessages, getUser };
