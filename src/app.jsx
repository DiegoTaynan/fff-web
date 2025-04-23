import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./pages/admin/admin";
import HomePage from "./pages/home";
import LoginPage from "./pages/login/login";
import AppointmentsPage from "./pages/appointments/appointments";
import MechanicsPage from "./pages/mechanics";
import Navbar from "./components/navbar/navbar";

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/appointments"
          element={
            <>
              <Navbar />
              <AppointmentsPage />
            </>
          }
        />
        <Route
          path="/mechanics"
          element={
            <>
              <Navbar />
              <MechanicsPage />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <Navbar />
              <AdminPage />
            </>
          }
        />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
