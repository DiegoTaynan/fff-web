import React, { useEffect, useState, useCallback } from "react";
import "./appointments.css";
import Navbar from "../../components/navbar/navbar.jsx";
import { Link, useNavigate } from "react-router-dom";
import Appointment from "../../components/appointment/appointment.jsx";
import api, { setupAuthToken } from "../../services/api";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [mechanic, setMechanic] = useState([]);
  const [idMechanic, setIdMechanic] = useState("");
  const [dtStart, setDtStart] = useState("");
  const [dtEnd, setDtEnd] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("loading"); // "loading", "online", "offline"

  // Verificar autenticação e status do servidor no carregamento
  useEffect(() => {
    const hasToken = setupAuthToken();
    setIsAuthenticated(hasToken);

    if (!hasToken) {
      navigate("/");
      return;
    }

    // Verificar status do servidor
    checkServerStatus();

    // Continua com o carregamento normal se estiver autenticado
    LoadMechanics();
    LoadAppointments();
  }, [navigate]);

  async function checkServerStatus() {
    try {
      setServerStatus("loading");
      // Solicitação simples para verificar se o servidor está online
      const response = await api.get("/ping", { timeout: 5000 });
      if (response.status === 200) {
        setServerStatus("online");
        setError("");
      } else {
        setServerStatus("offline");
        setError("Servidor respondeu, mas parece estar com problemas.");
      }
    } catch (error) {
      console.error("Erro ao verificar status do servidor:", error);
      setServerStatus("offline");
      setError(
        "Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde."
      );
    }
  }

  function ClickEdit(id_appointment) {
    navigate("/appointments/edit/" + id_appointment);
  }

  function ClickDelete(id_appointment) {
    confirmAlert({
      title: "Exclusion",
      message: "Confirm deletion of this appointment?",
      buttons: [
        {
          label: "Yes",
          onClick: () => DeleteAppointments(id_appointment),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  }

  async function DeleteAppointments(id) {
    try {
      const token = localStorage.getItem("token");
      console.log("Token for DeleteAppointments:", token); // Log do token
      console.log("Deleting appointment with ID:", id); // Log do ID

      const response = await api.delete("/appointments/" + id, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response:", response); // Log da resposta
      if (response.data) {
        await LoadAppointments();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error); // Log detalhado do erro
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error deleting data.");
    }
  }

  async function LoadMechanics() {
    try {
      const token = localStorage.getItem("token");
      console.log("Token for LoadMechanics:", token); // Log do token
      console.log("Loading mechanics..."); // Log inicial

      const response = await api.get("/mechanic", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Mechanics response:", response); // Log da resposta
      if (response.data) {
        setMechanic(response.data || []);
      }
    } catch (error) {
      console.error("Error loading mechanics:", error); // Log detalhado do erro
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing mechanics.");
    }
  }

  const LoadAppointments = useCallback(async () => {
    console.log("LoadAppointments called"); // Log para verificar se a função é chamada
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      console.log("Token for LoadAppointments:", token);
      console.log("Loading Appointments with Params:", {
        id_mechanic: idMechanic,
        dt_start: dtStart,
        dt_end: dtEnd,
        page,
        limit: itemsPerPage,
      });

      const response = await api.get("/admin/appointments", {
        params: {
          id_mechanic: idMechanic,
          dt_start: dtStart,
          dt_end: dtEnd,
          page,
          limit: itemsPerPage,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Loaded Appointments Response:", response.data);

      if (response.data) {
        const appointmentsData = response.data.data || response.data;
        const totalItems = response.data.totalItems || appointmentsData.length;

        setAppointments(appointmentsData || []);
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      } else {
        setAppointments([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError(
        "Erro ao carregar agendamentos. Por favor, tente novamente mais tarde."
      );
      if (error.response?.data.error) {
        setError(error.response?.data.error);
        if (error.response.status === 401) return navigate("/");
      }
    } finally {
      console.log("LoadAppointments finished"); // Log para verificar se a função terminou
      setLoading(false);
    }
  }, [idMechanic, dtStart, dtEnd, page, itemsPerPage, navigate]);

  useEffect(() => {
    console.log("useEffect triggered for LoadAppointments"); // Log para verificar o disparo do useEffect
    LoadAppointments();
  }, [LoadAppointments]);

  function ChangeMechanic(e) {
    setIdMechanic(e.target.value);
  }

  return (
    <div className="container-fluid mt-page">
      <Navbar
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      {/* Server status indicator */}
      {serverStatus === "offline" && (
        <div className="alert alert-danger" role="alert">
          <strong>Problema de conexão:</strong> {error}
          <button
            className="btn btn-sm btn-danger float-end"
            onClick={checkServerStatus}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="d-inline">Schedules</h2>
          <Link
            to="/appointments/add"
            className="btn btn-outline-primary ms-5 mb-2"
          >
            New Schedule
          </Link>
        </div>
        <div className="d-flex justify-content-end">
          <input
            id="startDate"
            className="form-control"
            type="date"
            onChange={(e) => setDtStart(e.target.value)}
          />
          <span className="m-2">Until</span>
          <input
            id="endDate"
            className="form-control"
            type="date"
            onChange={(e) => setDtEnd(e.target.value)}
          />
          <div className="form-control ms-3 me-3">
            <select
              name="mechanic"
              id="mechanic"
              value={idMechanic}
              onChange={ChangeMechanic}
            >
              <option value="">All mechanics</option>
              {mechanic.map((mec) => (
                <option key={mec.id_mechanic} value={mec.id_mechanic}>
                  {mec.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={LoadAppointments}
            className="btn btn-primary"
            type="button"
          >
            Filter
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando agendamentos...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning my-3" role="alert">
            {error}
            <button
              className="btn btn-sm btn-warning float-end"
              onClick={LoadAppointments}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Mechanic</th>
                <th scope="col">Service</th>
                <th scope="col">Date/Hour</th>
                <th scope="col">Progress</th>
                <th scope="col" className="col-buttons"></th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((ap) => (
                  <Appointment
                    key={ap.id_appointment}
                    id_appointment={ap.id_appointment}
                    user={ap.user}
                    mechanic={ap.mechanic}
                    service={ap.service}
                    booking_date={ap.booking_date}
                    booking_hour={ap.booking_hour}
                    progress={ap.progress}
                    clickEdit={ClickEdit}
                    clickDelete={ClickDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-item ${index + 1 === page ? "active" : ""}`}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default React.memo(Appointments);
