import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import Appointments from "./pages/appointments/appointments.jsx";
import AppointmentAdd from "./pages/appointment-add/appointment-add.jsx";
import AdminPage from "./pages/admin/admin.jsx";
import Mechanics from "./pages/mechanics/mechanics.jsx";
import { setupAuthToken } from "./services/api";

function Rotas() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Aguarde a configuração do token antes de renderizar as rotas
    setInitialized(false);
    setTimeout(() => {
      setupAuthToken();
      setInitialized(true);
    }, 0); // Pequeno delay para garantir leitura do localStorage
  }, []);

  if (!initialized) {
    // Exibe loading enquanto verifica autenticação
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div>
          <div className="spinner-border text-primary" role="status"></div>
          <div className="mt-2">Carregando aplicação...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/add" element={<AppointmentAdd />} />
        <Route
          path="/appointments/edit/:id_appointment"
          element={<AppointmentAdd />}
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/mechanics" element={<Mechanics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
