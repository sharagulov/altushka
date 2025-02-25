const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
console.log(`Выбранный порт: ${PORT}`);

app.use(express.static(path.join(__dirname, '../client/build')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const rooms = {};
let ip = "";

function broadcastMessage(message, sender, ip) {
  rooms[ip].forEach((client) => {
    if(client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  })
}

wss.on('connection', (ws, req) => {
  
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const cleanIp = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;
  const match = cleanIp.match(/(\d+\.\d+\.\d+)\.\d+/);
  ip = match ? match[1] : 'unknown';
  
  if (!rooms[ip]) {
    rooms[ip] = [];
  }
  rooms[ip].push(ws);

  console.log(`Подключился клиент с ${rawIp}, подсеть ${ip}. Общее число комнат: ${Object.keys(rooms).length}, пользователей в твоей комнате: ${rooms[ip].length}`);

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      broadcastMessage(parsed, ws, ip);
      console.log(`Сообщение "${parsed.text}" отправлено пользователем ${rawIp}`);
    }
    catch (err) {
      console.error('Ошибка при обработке сообщения:', err, ". Смотри функцию broadcastMessage или wss.on");
    }
  })

  ws.on('close', () => {
    rooms[ip] = rooms[ip].filter(client => client !== ws);
    console.log("Пользователь отключен");
  })

});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Сервер запущен, порт:${PORT}`);
});