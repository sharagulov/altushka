// altushka/server/mockDB.js

// Просто массивы-«таблицы»
const users = []; // [{ id, username, password }]
const messages = []; // [{ uuid, from, to, text, created_at }, ...]

module.exports = {
  users,
  messages,
};
