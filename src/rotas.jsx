import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import ServerStatus from "./components/server-status/ServerStatus";

import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import Appointments from "./pages/appointments/appointments.jsx";
import AppointmentAdd from "./pages/appointment-add/appointment-add.jsx";
import AdminPage from "./pages/admin/admin.jsx";
import { setupAuthToken } from "./services/api";

function Rotas() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Configura o token na inicialização
    setupAuthToken();
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <div className="loading-app">Carregando aplicação...</div>;
  }

  return (
    <BrowserRouter>
      <div className="server-status-container">
        <ServerStatus />
      </div>
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
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
