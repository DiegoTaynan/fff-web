import axios from "axios";

// Criar uma instância do axios com timeout adequado
const api = axios.create({
  baseURL: "https://familyfriendsadmin.com",
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Função para recuperar o token e configurar no axios
export const setupAuthToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  } else {
    delete api.defaults.headers.common["Authorization"];
    return false;
  }
};

// Configura o token no carregamento inicial
setupAuthToken();

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token novamente a cada requisição
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Adiciona timestamp para evitar cache do navegador
    if (config.method === "get") {
      config.params = config.params || {};
      config.params["_t"] = Date.now();
    }
    return config;
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Loga o erro para debugging
    console.error("Erro API:", error.message);

    if (!error.response) {
      // Erro de rede ou servidor indisponível
      console.error("Erro de conexão. O servidor pode estar offline.");
      // Podemos notificar o usuário aqui também
    } else if (error.response && error.response.status === 401) {
      // Se o token expirou, redireciona para login
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("sessionEmail");
      localStorage.removeItem("sessionName");
      localStorage.removeItem("isAdmin");

      // Apenas redireciona se estamos no navegador (não durante testes)
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
