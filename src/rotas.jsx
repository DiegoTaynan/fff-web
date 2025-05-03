import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import AuthGuard from "./components/AuthGuard/AuthGuard";

import Login from "./pages/login/login.jsx";
import Register from "./pages/register/register.jsx";
import Appointments from "./pages/appointments/appointments.jsx";
import AppointmentAdd from "./pages/appointment-add/appointment-add.jsx";
import AdminPage from "./pages/admin/admin.jsx";

function Rotas() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas protegidas com AuthGuard */}
          <Route
            path="/appointments"
            element={
              <AuthGuard>
                <Appointments />
              </AuthGuard>
            }
          />
          <Route
            path="/appointments/add"
            element={
              <AuthGuard>
                <AppointmentAdd />
              </AuthGuard>
            }
          />
          <Route
            path="/appointments/edit/:id_appointment"
            element={
              <AuthGuard>
                <AppointmentAdd />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminPage />
              </AuthGuard>
            }
          />

          {/* Rota de fallback para página não encontrada */}
          <Route
            path="*"
            element={
              <div className="container mt-5">
                <h1>Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>
            }
          />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Rotas;
