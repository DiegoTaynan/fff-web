import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Substitua pela URL base da sua API
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Erro de autenticação tratado
    }
    return Promise.reject(error);
  }
);

export default api;
