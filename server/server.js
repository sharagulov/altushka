// altushka/server/server.js
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { users, messages } = require('../client/src/mockdb');
const { v4: uuidv4 } = require('uuid');

dotenv.config();
const app = express();
app.use(bodyParser.json());

const PORT = process.env.SERVER_PORT || 3001;
const sockets = {};




app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }

  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Пользователь уже существует' });
  }

  const newUser = {
    id: uuidv4(),
    username,
    password,
  };
  users.push(newUser);

  console.log('Зарегистрирован новый пользователь:', 'ID:', newUser.id, ', Имя:', newUser.username, ', Пароль:', newUser.password);
  return res.json({ message: 'Регистрация прошла успешно', user: newUser });
});




app.get('/api/users', (req, res) => {
  const { search } = req.query;
  if (!search) {
    return res.json(users.map(({ password, ...rest }) => rest));
  } else {
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase())
    );
    const result = filtered.map(({ password, ...rest }) => rest);
    return res.json(result);
  }
});




app.get('/api/messages/:from/:to', (req, res) => {
  const { from, to } = req.params;
  const conversation = messages.filter(
    (m) =>
      (m.from === from && m.to === to) ||
      (m.from === to && m.to === from)
  );
  conversation.sort((a, b) => a.created_at - b.created_at);
  res.json(conversation);
});




app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});




const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Замечено новое вебсокет-соединение');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'init') {
        sockets[data.userId] = ws;
        console.log(`Пользователь c ID ${data.userId} подключился по вебсокету`);
        return;
      }

      if (data.type === 'chat') {
        const { from, to, text } = data;
        console.log(`Вебсокет: сообщение от ${from} к ${to}: ${text}`);

        const newMsg = {
          id: uuidv4(),
          from,
          to,
          text,
          created_at: Date.now(),
        };
        messages.push(newMsg);

        const targetSocket = sockets[to];
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({
            type: 'chat',
            from,
            text,
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
