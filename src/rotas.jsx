import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import Appointments from "./pages/appointments/appointments.jsx";
import AppointmentAdd from "./pages/appointment-add/appointment-add.jsx";
import AdminPage from "./pages/admin/admin.jsx"; // Import AdminPage

function Rotas() {
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
        <Route path="/admin" element={<AdminPage />} />{" "}
        {/* Add AdminPage route */}
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
