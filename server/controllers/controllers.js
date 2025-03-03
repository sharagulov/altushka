const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, validateRefreshToken, tokens } = require('../utils/tokenUtils');

const prisma = new PrismaClient();

// Регистрация нового пользователя
const register = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) return res.status(400).json({ error: 'Все поля обязательны' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, passwordHash: hashedPassword },
        });

        const tokenData = generateTokens(newUser.id);
        res.json({ message: 'Регистрация успешна', ...tokenData });
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// Авторизация пользователя
const login = async (req, res) => {
    const { username, password } = req.body;

    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Неверные учетные данные' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Неверные учетные данные' });

    const tokenData = generateTokens(user.id);
    res.json({ message: 'Вход выполнен', ...tokenData });
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
        const conversation = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: from, toId: to },
                    { fromId: to, toId: from },
                ],
            },
            orderBy: { created_at: 'asc' },
        });

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
      },
    });

    // Теперь для каждого собеседника достаём последнее сообщение
    const chats = [];
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
      });
    }

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



module.exports = { register, login, refreshToken, getUsers, getMessages, getUser };
