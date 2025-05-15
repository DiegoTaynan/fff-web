import React from "react";
import { createRoot } from "react-dom/client";
import Rotas from "./rotas.jsx";
import "./styles/global.css";
import { setupAuthToken } from "./services/api";

setupAuthToken();

// Remover log de depuração para produção
// console.log("Rendering application...");

// Em produção, use:
createRoot(document.getElementById("root")).render(<Rotas />);

// Em desenvolvimento, use StrictMode (mas causa renderização dupla):
// createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <Rotas />
//   </React.StrictMode>
// );
