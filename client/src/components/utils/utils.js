const getNormalTime = (time) => {
  return new Date(time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
} 

module.exports = getNormalTime;