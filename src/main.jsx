import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Rotas from "./rotas.jsx";
import "./styles/global.css";
import { setupApiHeaders } from "./services/auth";

// Configure API with token if exists before rendering anything
setupApiHeaders();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Rotas />
  </StrictMode>
);
