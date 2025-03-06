// /root/common/altushka/server/server.js

const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const routes = require('./routes/routes');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use('/api', routes);

const prisma = new PrismaClient();
const PORT = 3001;
const sockets = {};

app.get('/api/onlineStatus', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Параметр userId обязателен' });
  }
  const isOnline = sockets[userId] && sockets[userId].readyState === WebSocket.OPEN;
  res.json({ online: isOnline, checker: sockets });
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
                broadcastOnlineStatus(data.userId, true);
                return;
            }

            if (data.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong' }));
            }

            if (data.type === 'chat') {
                const { fromId, toId, text } = data;
                console.log(`Вебсокет: сообщение от ${fromId} к ${toId}: ${text}`);

                const newMsg = await prisma.message.create({
                    data: {
                        fromId: fromId,
                        toId: toId,
                        text,
                    }
                });

                const targetSocket = sockets[toId];
                if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
                    targetSocket.send(JSON.stringify({
                        type: 'chat',
                        fromId,
                        toId,
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
