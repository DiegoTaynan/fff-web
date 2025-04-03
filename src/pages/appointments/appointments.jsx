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
      const response = await api.delete("/appointments/" + id);

      if (response.data) {
        await LoadAppointments();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error deleting data.");
    }
  }

  async function LoadMechanics() {
    try {
      const response = await api.get("/mechanic");

      if (response.data) {
        setMechanic(response.data || []);
      }
    } catch (error) {
      console.error("Error loading mechanics:", error);
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing mechanics.");
    }
  }

  async function LoadAppointments() {
    try {
      const response = await api.get("/admin/appointments", {
        params: {
          id_mechanic: idMechanic,
          dt_start: dtStart,
          dt_end: dtEnd,
          page,
          limit: itemsPerPage,
        },
      });

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
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error loading appointments. Please try again later.");
    }
  }

  function ChangeMechanic(e) {
    setIdMechanic(e.target.value);
  }

  useEffect(() => {
    LoadMechanics();
    LoadAppointments();
  }, [page, itemsPerPage]);

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
            onClick={LoadAppointments}
            className="btn btn-primary"
            type="button"
          >
            Filter
          </button>
        </div>
      </div>

      <div>
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

export default Appointments;
