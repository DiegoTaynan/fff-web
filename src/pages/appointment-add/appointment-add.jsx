import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/navbar.jsx";
import { useEffect, useState } from "react";
import api from "../../constants/api.js";

function AppointmentAdd() {
  const navigate = useNavigate();
  const { id_appointment } = useParams();
  const [users, setUsers] = useState([]);
  const [mechanic, setMechanic] = useState([]);
  const [services, setServices] = useState([]);

  const [idUser, setIdUser] = useState("");
  const [idMechanic, setIdMechanic] = useState("");
  const [idService, setidService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("");
  const [observations, setObservations] = useState(""); // Novo estado para observações
  const [additionalServices, setAdditionalServices] = useState([]); // Novo estado para serviços adicionais

  async function LoadUsers() {
    try {
      const response = await api.get("/admin/users");

      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing customer.");
    }
  }

  async function LoadMechanics() {
    try {
      const response = await api.get("mechanic");

      if (response.data) {
        setMechanic(response.data);

        if (id_appointment > 0) LoadAppointment(id_appointment);
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing mechanics.");
    }
  }

  async function LoadAppointment(id) {
    try {
      const response = await api.get("/admin/appointments/" + id);

      if (response.data) {
        console.log("Appointment Data:", response.data); // Adicione este log
        setIdUser(response.data.id_user);
        setIdMechanic(response.data.id_mechanic);
        setidService(response.data.id_service);
        setBookingDate(response.data.booking_date);
        setBookingHour(response.data.booking_hour);
        setObservations(response.data.observations);
        setAdditionalServices(response.data.additional_services || []);
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing services.");
    }
  }

  async function LoadServices() {
    try {
      const response = await api.get("/services");

      if (response.data) {
        console.log("Services Data:", response.data); // Adicione este log
        setServices(response.data);
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing services.");
    }
  }

  async function SaveAppointment() {
    const json = {
      id_user: idUser,
      id_mechanic: idMechanic,
      id_service: idService,
      booking_date: bookingDate,
      booking_hour: bookingHour,
      observations: observations, // Adicionar observações ao JSON
      additional_services: additionalServices, // Adicionar serviços adicionais ao JSON
    };

    try {
      const response =
        id_appointment > 0
          ? await api.put("/admin/appointments/" + id_appointment, json)
          : await api.post("/admin/appointments", json);

      if (response.data) {
        navigate("/appointments");
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error saving data.");
    }
  }

  useEffect(() => {
    LoadUsers();
    LoadMechanics();
  }, []);

  useEffect(() => {
    LoadServices(idMechanic);
  }, [idMechanic]);

  useEffect(() => {
    console.log("Additional Services State:", additionalServices);
  }, [additionalServices]);

  function generateTimeSlots(day) {
    let startHour, endHour;
    if (day >= 1 && day <= 5) {
      // Segunda a Sexta
      startHour = 8;
      endHour = 17.5;
    } else if (day === 6) {
      // Sábado
      startHour = 8;
      endHour = 15.5;
    } else {
      return []; // Domingo (sem horários disponíveis)
    }

    const timeSlots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        timeSlots.push(time);
      }
    }
    console.log("Generated Time Slots:", timeSlots);
    return timeSlots;
  }

  const dayOfWeek = bookingDate ? new Date(bookingDate).getDay() : null;
  const timeSlots = dayOfWeek !== null ? generateTimeSlots(dayOfWeek) : [];

  function handleAddService() {
    if (idService && !additionalServices.includes(idService)) {
      setAdditionalServices([...additionalServices, idService]);
    }
  }

  function handleRemoveService(service) {
    setAdditionalServices(additionalServices.filter((s) => s !== service));
  }

  return (
    <>
      <Navbar />

      <div className="container-fluid mt-page">
        <div className="row col-lg-4 offset-lg-4">
          <div className="col-12 mt-2">
            <h2>{id_appointment > 0 ? "Edit Schedule" : "New Schedule"}</h2>
          </div>
          <div className="col-12 mt-4">
            <label htmlFor="user" className="form-label">
              Customer
            </label>
            <div className="form-control mb-2">
              <select
                name="user"
                id="user"
                value={idUser}
                onChange={(e) => setIdUser(e.target.value)}
              >
                <option value="0">Select the customer</option>

                {users.map((u) => {
                  return (
                    <option key={u.id_user} value={u.id_user}>
                      {u.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="col-12 mt-4">
            <label htmlFor="mechanic" className="form-label">
              Mechanic
            </label>
            <div className="form-control mb-2">
              <select
                name="mechanic"
                id="mechanic"
                value={idMechanic}
                onChange={(e) => setIdMechanic(e.target.value)}
              >
                <option value="0">Select the mechanic</option>

                {mechanic.map((m) => {
                  return (
                    <option key={m.id_mechanic} value={m.id_mechanic}>
                      {m.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="col-12 mt-3">
            <label htmlFor="service" className="form-label">
              Service
            </label>
            <div className="form-control mb-2">
              <select
                name="service"
                id="service"
                value={idService}
                onChange={(e) => setidService(e.target.value)}
              >
                <option value="0">Select the service</option>

                {services.map((s) => {
                  return (
                    <option key={s.id_service} value={s.id_service}>
                      {s.service}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleAddService}
            >
              Add Service
            </button>
          </div>

          <div className="col-12 mt-3">
            <label className="form-label">Additional Services</label>
            <ul className="list-group">
              {additionalServices.map((service, index) => {
                const serviceName = services.find(
                  (s) => s.id_service.toString() === service.toString()
                )?.service;
                return (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {serviceName || "Service not found"}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveService(service)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="col-6 mt-3">
            <label htmlFor="bookingDate" className="form-label">
              Date
            </label>
            <input
              type="date"
              className="form-control"
              name="bookingDate"
              id="bookingDate"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </div>

          <div className="col-6 mt-3">
            <label htmlFor="bookingHour" className="form-label">
              Hour
            </label>
            <div className="form-control mb-2">
              <select
                name="bookingHour"
                id="bookingHour"
                value={bookingHour}
                onChange={(e) => setBookingHour(e.target.value)}
              >
                <option value="0">Hour</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 mt-4">
            <label htmlFor="observations" className="form-label">
              Observations
            </label>
            <textarea
              id="observations"
              className="form-control"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            ></textarea>
          </div>

          <div className="col-12 mt-4">
            <div className="d-flex justify-content-end">
              <Link to="/appointments" className="btn btn-outline-primary me-3">
                Cancel
              </Link>
              <button
                onClick={SaveAppointment}
                className="btn btn-primary"
                type="button"
              >
                Save data
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AppointmentAdd;
