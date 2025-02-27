export const getCookieValue = (key) => {
  const cookies = document.cookie.split("; ");
  const userCookie = cookies.find((row) => row.startsWith("user="));
  if (!userCookie) return null;

  try {
    const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));

    if (key === "user") return userData;
    if (key === "id") return userData.id || null;
    if (key === "password") return userData.generatedPassword || null;

    return null; // Если передан неизвестный ключ
  } catch (error) {
    console.error("Ошибка парсинга куки:", error);
    return null;
  }
};
