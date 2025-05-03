import "./appointments.css";
import Navbar from "../../components/navbar/navbar.jsx";
import { Link, useNavigate } from "react-router-dom";
import Appointment from "../../components/appointment/appointment.jsx";
import { useEffect, useState } from "react";
import api from "../../services/api";
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
  const [allAppointments, setAllAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  async function LoadAppointments() {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token for LoadAppointments:", token);
      console.log("Current page:", page, "Items per page:", itemsPerPage);

      // Adicionando parâmetros de paginação mais explícitos para garantir que a API entenda
      const response = await api.get("/admin/appointments", {
        params: {
          id_mechanic: idMechanic || null,
          dt_start: dtStart || null,
          dt_end: dtEnd || null,
          page: page, // Explícito para a API
          per_page: itemsPerPage, // Algumas APIs usam per_page em vez de limit
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage, // Algumas APIs usam offset
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response Structure:", response.data);

      // Verificando o formato da resposta para determinar onde estão os dados e a informação de paginação
      let appointmentsData = [];
      let totalItems = 0;

      // Caso 1: A API retorna {data: [...], totalItems: number} ou formato similar
      if (response.data && typeof response.data === "object") {
        // Verificando diferentes formatos comuns de resposta paginada
        if (Array.isArray(response.data.data)) {
          console.log("Formato detectado: { data: [...], ... }");
          appointmentsData = response.data.data;

          // Procurando por informações de total em diferentes propriedades
          totalItems =
            response.data.totalItems ||
            response.data.total ||
            response.data.count ||
            response.data.meta?.total ||
            0;
        }
        // Caso 2: A API retorna um array diretamente
        else if (Array.isArray(response.data)) {
          console.log("Formato detectado: Array direto");
          appointmentsData = response.data;

          // Verificando se há headers com informações de paginação
          const totalHeader =
            response.headers["x-total-count"] ||
            response.headers["X-Total-Count"];
          if (totalHeader) {
            totalItems = parseInt(totalHeader, 10);
            console.log(`Total de itens obtido do header: ${totalItems}`);
          } else {
            // Se não temos informação de total, fazer uma chamada adicional para contar
            console.log("Fazendo chamada adicional para obter contagem total");
            try {
              const countResponse = await api.get("/admin/appointments/count", {
                params: {
                  id_mechanic: idMechanic || null,
                  dt_start: dtStart || null,
                  dt_end: dtEnd || null,
                },
                headers: { Authorization: `Bearer ${token}` },
              });

              if (countResponse.data) {
                if (typeof countResponse.data === "number") {
                  totalItems = countResponse.data;
                } else if (typeof countResponse.data === "object") {
                  totalItems =
                    countResponse.data.count ||
                    countResponse.data.total ||
                    appointmentsData.length;
                }
              }
            } catch (countError) {
              console.warn("Erro ao obter contagem:", countError);
              // Se falhar, assumimos que há apenas os itens recebidos
              totalItems = appointmentsData.length;
            }
          }
        }
        // Caso 3: Outro formato de objeto - tenta encontrar arrays dentro do objeto
        else {
          console.log("Formato detectado: Objeto com estrutura diferente");
          const keys = Object.keys(response.data);
          for (const key of keys) {
            const value = response.data[key];
            if (Array.isArray(value)) {
              console.log(
                `Array encontrado em ${key} com ${value.length} itens`
              );
              appointmentsData = value;
              break;
            }
          }
          totalItems = appointmentsData.length;
        }
      }

      // Log para diagnóstico
      console.log(`Dados obtidos: ${appointmentsData.length} itens`);
      console.log(`Total estimado: ${totalItems} itens`);

      // Atualiza o estado com os dados da API
      setAppointments(appointmentsData);

      // Calcula o número total de páginas
      const calculatedTotalPages = Math.max(
        Math.ceil(totalItems / itemsPerPage),
        1
      );
      console.log(`Total de páginas calculado: ${calculatedTotalPages}`);
      setTotalPages(calculatedTotalPages);
    } catch (error) {
      console.error("Error loading appointments:", error);
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error loading appointments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handler para aplicar filtros e resetar a paginação
  function ApplyFilters() {
    setPage(1); // Volta para a primeira página
    setAllAppointments([]); // Limpa qualquer dados armazenados localmente
    LoadAppointments();
  }

  // Efeito para mudar a paginação local quando a página ou itemsPerPage mudam
  useEffect(() => {
    LoadAppointments();
  }, [page, itemsPerPage]);

  // Efeito para carregar mecânicos apenas uma vez
  useEffect(() => {
    LoadMechanics();
  }, []);

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
            onClick={ApplyFilters}
            className="btn btn-primary"
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Loading...
              </>
            ) : (
              "Filter"
            )}
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
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

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <p className="mb-0">
            Showing page {page} of {totalPages}
            {appointments.length > 0 ? ` (${appointments.length} items)` : ""}
          </p>
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
    </div>
  );
}

export default Appointments;
