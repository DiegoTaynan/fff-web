import axios from "axios";

const api = axios.create({
  baseURL: "http://familyfriendsadmin.com:3001", // Substitua pela URL base da sua API
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Certifique-se de usar a mesma chave
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
      // Erro de autenticação tratado
    }
    return Promise.reject(error);
  }
);

export default api;
