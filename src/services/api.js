import axios from "axios";
import { clearAuthData } from "./auth";

// Use a URL completa para a API para evitar problemas com proxy
const api = axios.create({
  baseURL: "https://familyfriendsadmin.com",
  // Aumentar o timeout para lidar com possíveis lentidões no servidor
  timeout: 30000,
  // Configurar headers padrão
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar timestamp para evitar cache em requisições GET
    if (config.method === "get") {
      config.params = config.params || {};
      config.params._t = Date.now();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta unificado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.message}`);

    // Tratamento específico de erros
    if (!error.response) {
      console.error("Network error - no server response");
    } else if (error.response.status === 401) {
      // Remover dados de autenticação
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("sessionEmail");
      localStorage.removeItem("sessionName");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("tokenExpiration");

      // Redirecionar para login apenas se não estiver na página inicial
      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
