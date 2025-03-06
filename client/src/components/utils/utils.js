const getNormalTime = (time, variant) => {

  const now = new Date();

  if(variant === "message") {
    return new Date(time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } else if (variant === "user") {

    const millisNow = now.getTime();
    const millisCurrent = new Date(time).getTime();
    let difference = millisNow - millisCurrent;



    const sameDay = Number(now.toLocaleDateString('ru-RU', {day: '2-digit'})) === Number(new Date(time).toLocaleDateString('ru-RU', {day: '2-digit'}))
    const yesterday = (Number(now.toLocaleDateString('ru-RU', {day: '2-digit'})) - Number(new Date(time).toLocaleDateString('ru-RU', {day: '2-digit'}))) === 1
    const before = (Number(now.toLocaleDateString('ru-RU', {day: '2-digit'})) - Number(new Date(time).toLocaleDateString('ru-RU', {day: '2-digit'}))) > 1

    if(difference <= 60000 && sameDay ) { // только что + тот же день
      return "Только что";
    } 
    if(difference <= 8,64e+7 && sameDay ) { // не только что + тот же день
      return new Date(time).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' });
    } 
    if(!sameDay && yesterday) { // вчера
      return ("Вчера, " + new Date(time).toLocaleTimeString('ru-RU', {
        hour: '2-digit', 
        minute: '2-digit' }));
    } 
    if(!sameDay && before) { // дальше чем вчера
      return (new Date(time).toLocaleDateString('ru-RU', {
        month: '2-digit',
        day: '2-digit'
      }));
    } 

    
  }
} 

module.exports = getNormalTime;