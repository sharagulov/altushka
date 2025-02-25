// altushka/server/server.js
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { users, messages } = require('../client/src/mockdb'); // <-- псевдо-БД в памяти

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.SERVER_PORT || 3001;

// userId => WebSocket-соединение
const sockets = {};

// ======================= REST ЭНДПОИНТЫ =======================

// 1) Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }

  // Проверяем, нет ли пользователя с таким username
  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  // Создаём
  const newUser = {
    id: Date.now().toString(), // упрощённый уникальный ID
    username,
    password,
  };
  users.push(newUser);

  console.log('Зарегистрирован новый пользователь:', newUser);
  return res.json({ message: 'Регистрация прошла успешно', user: newUser });
});

// 2) Список пользователей (или поиск ?search=)
app.get('/api/users', (req, res) => {
  const { search } = req.query;
  if (!search) {
    // вернуть всех
    return res.json(users.map(({ password, ...rest }) => rest));
  } else {
    // поиск по username
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );
    const result = filtered.map(({ password, ...rest }) => rest);
    return res.json(result);
  }
});

// 3) История сообщений между двумя userId
app.get('/api/messages/:from/:to', (req, res) => {
  const { from, to } = req.params;
  // Фильтруем в messages: (from→to) или (to→from)
  const conversation = messages.filter(
    (m) =>
      (m.from === from && m.to === to) ||
      (m.from === to && m.to === from)
  );
  // Можно отсортировать по времени:
  conversation.sort((a, b) => a.created_at - b.created_at);
  res.json(conversation);
});

// ======================= Раздача React-сборки =======================
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ======================= WebSocket =======================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Новое WebSocket-соединение');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      
      // 1) Инициализация сокета
      // { type: "init", userId: "..." }
      if (data.type === 'init') {
        sockets[data.userId] = ws;
        console.log(`Пользователь c ID=${data.userId} подключился по WS`);
        return;
      }
      
      // 2) Личные сообщения (type="chat")
      // { type: "chat", from, to, text }
      if (data.type === 'chat') {
        const { from, to, text } = data;
        console.log(`WS: сообщение от ${from} к ${to}: ${text}`);
        
        // Сохраняем в "messages"
        const newMsg = {
          id: Date.now().toString(),
          from,
          to,
          text,
          created_at: Date.now(),
        };
        messages.push(newMsg);
        console.log(messages)

        // Отправляем получателю, если он онлайн
        const targetSocket = sockets[to];
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({
            type: 'chat',
            from,
            text,
          }));
        }
        // (по желанию) можно отправить «эхо» отправителю
      }
    } catch (err) {
      console.error('Ошибка в WebSocket:', err);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket закрыт');
    // Можно вычислить, какой userId отключился, и убрать из sockets
  });
});

// ======================= Запуск =======================
server.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
