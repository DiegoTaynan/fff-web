import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:3001", // Substitua pela URL correta
  baseURL: "http://familyfriendsadmin.com:3001", // Substitua pela URL correta
});

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Certifique-se de que o token está armazenado no localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
