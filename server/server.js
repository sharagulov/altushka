// altushka/server/server.js
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// 1) Подключаем Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = 3001;
const sockets = {};

// ------------------- РОУТЫ ------------------- //

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username } = req.body;
  const generatedPassword = Math.random().toString(36).slice(-8);

  if (!username) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }

  try {
    // Создаём нового User в БД
    const newUser = await prisma.user.create({
      data: {
        username,
        generatedPassword,
      },
    });

    console.log('Зарегистрирован новый пользователь:',
      'ID:', newUser.id,
      ', Имя:', newUser.username,
      ', Пароль:', newUser.generatedPassword
    );

    return res.json({ message: 'Регистрация прошла успешно', user: newUser });
  } catch (err) {
    console.error('Ошибка при создании пользователя:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить пользователей (с поиском)
app.get('/api/users', async (req, res) => {
  const { search } = req.query;
  try {
    // Если нет search, вернём всех пользователей
    if (!search) {
      const allUsers = await prisma.user.findMany();
      // Пароль в ответе можно не возвращать — маппим поля
      const safeUsers = allUsers.map(({ generatedPassword, ...rest }) => rest);
      return res.json(safeUsers);
    } else {
      const filteredUsers = await prisma.user.findMany({
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          }
        }
      });
      const safeUsers = filteredUsers.map(({ generatedPassword, ...rest }) => rest);
      return res.json(safeUsers);
    }
  } catch (err) {
    console.error('Ошибка при поиске пользователей:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить историю сообщений между двумя пользователями
app.get('/api/messages/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  try {
    // Ищем все сообщения, где (fromId=from и toId=to) или (fromId=to и toId=from)
    const conversation = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: from, toId: to },
          { fromId: to, toId: from },
        ],
      },
      orderBy: {
        created_at: 'asc',
      },
    });
    return res.json(conversation);
  } catch (err) {
    console.error('Ошибка при получении сообщений:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить список собеседников для user (:from)
app.get('/api/messages/:from', async (req, res) => {
  const { from } = req.params;
  try {
    // Сначала найдём все сообщения, где пользователь фигурирует как fromId или toId
    const userMessages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: from },
          { toId: from },
        ],
      }
    });
    // Собираем уникальный набор ID собеседников
    const recipientIds = new Set();
    userMessages.forEach(m => {
      recipientIds.add(m.fromId);
      recipientIds.add(m.toId);
    });
    // Удаляем сам from, чтобы остались только собеседники
    recipientIds.delete(from);

    // Получаем User-объекты по ID
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: Array.from(recipientIds) }
      }
    });
    // Пароль в ответе не нужен
    const safeList = recipients.map(({ generatedPassword, ...rest }) => rest);

    return res.json(safeList);
  } catch (err) {
    console.error('Ошибка при получении списка собеседников:', err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ------------------- СТАТИКА ------------------- //

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ------------------- ВЕБСОКЕТЫ ------------------- //

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Замечено новое вебсокет-соединение');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'init') {
        sockets[data.userId] = ws;
        console.log(`Пользователь c ID ${data.userId} подключился по вебсокету`);
        return;
      }

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }

      if (data.type === 'chat') {
        const { from, to, text } = data;
        console.log(`Вебсокет: сообщение от ${from} к ${to}: ${text}`);

        const newMsg = await prisma.message.create({
          data: {
            fromId: from,
            toId: to,
            text,
            // created_at проставится автоматически
          }
        });

        const targetSocket = sockets[to];
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({
            type: 'chat',
            from,
            text,
            created_at: newMsg.created_at
          }));
        }
      }
    } catch (err) {
      console.error('Ошибка вебсокета на клиентской стороне:', err);
    }
  });

  ws.on('close', () => {
    console.log('Вебсокет закрыт');
    Object.keys(sockets).forEach((key) => {
      if (sockets[key] === ws) {
        delete sockets[key];
      }
    });
  });
});

// ------------------- СТАРТ СЕРВЕРА ------------------- //

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
