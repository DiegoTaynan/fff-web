import axios from "axios";

const api = axios.create({
  baseURL: "http://familyfriendsadmin.com:3001", // Substitua pela URL correta do backend
});

// Adiciona o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Certifique-se de que o token está armazenado no localStorage
  console.log("Token being sent:", token); // Log para verificar o token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No token found in localStorage.");
  }
  return config;
});

export default api;
