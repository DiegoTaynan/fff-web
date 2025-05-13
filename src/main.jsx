import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Rotas from "./rotas.jsx";
import "./styles/global.css";
import { setupAuthToken } from "./services/api";

// Configura o token antes de renderizar a aplicação
setupAuthToken();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Rotas />
  </StrictMode>
);
