import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🚀 Если НЕ авторизован → редирект на /login
export const RedirectIfNotAuthenticated = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        console.log(token, "RedirectIfNotAuthenticated");

        if (!token) {
            navigate('/login'); // Если нет токена — отправляем на страницу входа
        }
    }, [navigate]);

    return children;
};

// 🚀 Если авторизован → редирект на /users (НЕ ПУСКАЕТ НА /login и /register)
export const RedirectIfAuthenticated = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        console.log(token, "RedirectIfAuthenticated");

        if (token) {
            navigate('/'); // Если уже авторизован, отправляем в /users
        }
    }, [navigate]);

    return children;
};
