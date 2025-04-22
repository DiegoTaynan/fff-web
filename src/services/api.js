import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Substitua pela URL base da sua API
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sessionToken"); // Certifique-se de usar a chave correta
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirecionar para a página de login em caso de erro de autenticação
      localStorage.removeItem("sessionToken"); // Remove o token inválido
      alert("Your session has expired. Please log in again."); // Notifica o usuário
      window.location.href = "/login"; // Redireciona para a página de login
    }
    return Promise.reject(error);
  }
);

export default api;
