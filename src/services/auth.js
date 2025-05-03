import api from "./api";

/**
 * Verifica se o usuário está autenticado baseado no token armazenado localmente
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  // Verificar se o token expirou
  const expiration = localStorage.getItem("tokenExpiration");
  if (expiration && parseInt(expiration) < Date.now()) {
    clearAuthData();
    return false;
  }

  return true;
};

/**
 * Remove todos os dados de autenticação
 */
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("sessionId");
  localStorage.removeItem("sessionEmail");
  localStorage.removeItem("sessionName");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("tokenExpiration");

  // Clear authorization header
  delete api.defaults.headers.common["Authorization"];
};

/**
 * Configura o token para a API
 */
export const setupAuthToken = (token) => {
  if (!token) return false;

  // Definir um tempo de expiração (24 horas)
  const expiration = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem("tokenExpiration", expiration);
  localStorage.setItem("token", token);

  return true;
};

/**
 * Configura os headers da API com o token atual
 * Esta função é usada no main.jsx para inicializar a aplicação
 */
export const setupApiHeaders = () => {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
};
