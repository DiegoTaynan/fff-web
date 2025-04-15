import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/navbar.jsx";
import { useEffect, useState } from "react";
import api from "../../constants/api.js";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css"; // Estilos para o modal de confirmação
import "./appointment-add.css"; // Importe o arquivo CSS

function AppointmentAdd() {
  const navigate = useNavigate();
  const { id_appointment } = useParams();
  const [users, setUsers] = useState([]);
  const [mechanic, setMechanic] = useState([]);
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]); // Estado para armazenar URLs das imagens
  const [selectedImage, setSelectedImage] = useState(null); // Estado para a imagem selecionada no modal
  const [idUser, setIdUser] = useState("");
  const [idMechanic, setIdMechanic] = useState("");
  const [idService, setidService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingHour, setBookingHour] = useState("");
  const [observations, setObservations] = useState("");
  const [additionalServices, setAdditionalServices] = useState([]);

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
        console.log("Loaded Appointment Data:", response.data); // Log completo dos dados carregados
        setIdUser(response.data.id_user);
        setIdMechanic(response.data.id_mechanic);
        setidService(response.data.id_service);
        setBookingDate(response.data.booking_date);
        setBookingHour(response.data.booking_hour);
        setObservations(response.data.observations);
        setAdditionalServices(response.data.additional_services || []);
      }
    } catch (error) {
      console.error("Error loading appointment:", error); // Log detalhado do erro
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
        console.log("Services Data:", response.data);
        setServices(response.data);
      }
    } catch (error) {
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing services.");
    }
  }

  async function LoadImages() {
    if (!id_appointment) return;
    try {
      const response = await api.get(`/appointments/${id_appointment}/images`);
      if (Array.isArray(response.data)) {
        setImages(
          response.data.map((img) => ({
            id_image: img.id_image,
            image_url: img.image_url,
            isUploading: false, // Certifica-se de que as imagens carregadas não estão em estado de upload
          }))
        );
      } else {
        setImages([]);
      }
    } catch (error) {
      alert("Error loading images.");
    }
  }

  async function handleUploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const tempImageId = `temp-${Date.now()}`;
    const newImage = {
      id_image: tempImageId,
      image_url: URL.createObjectURL(file), // Exibe a pré-visualização local enquanto o upload está em andamento
      isUploading: true,
    };
    setImages([...images, newImage]);

    try {
      const response = await api.post(
        `/appointments/${id_appointment}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.imageUrl && response.data.id_image) {
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id_image === tempImageId
              ? {
                  id_image: response.data.id_image,
                  image_url: response.data.imageUrl,
                  isUploading: false,
                }
              : img
          )
        );
      }
    } catch (error) {
      alert("Error uploading image.");
      setImages((prevImages) =>
        prevImages.filter((img) => img.id_image !== tempImageId)
      );
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      console.log(`Attempting to delete image with ID: ${imageId}`); // Log do ID da imagem
      const response = await api.delete(
        `/appointments/${id_appointment}/images/${imageId}`
      );
      console.log("Delete response:", response.data); // Log da resposta do backend
      setImages((prevImages) =>
        prevImages.filter((img) => img.id_image !== imageId)
      ); // Atualiza o estado removendo a imagem
    } catch (error) {
      console.error(
        "Error deleting image:",
        error.response?.data || error.message
      ); // Log detalhado do erro
      alert(
        `Error deleting image: ${error.response?.data?.error || error.message}`
      );
    }
  }

  function confirmDeleteImage(imageId) {
    confirmAlert({
      title: "Delete Confirmation",
      message: "Are you sure you want to delete this image?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleDeleteImage(imageId),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  }

  async function SaveAppointment() {
    const json = {
      id_user: idUser,
      id_mechanic: idMechanic,
      id_service: idService,
      booking_date: bookingDate,
      booking_hour: bookingHour,
      observations: observations, // Certifique-se de enviar as observações
      additional_services: additionalServices,
    };

    console.log("Saving Appointment Data:", json); // Log dos dados enviados para salvar

    try {
      const response =
        id_appointment > 0
          ? await api.put(`/admin/appointments/${id_appointment}`, json)
          : await api.post("/admin/appointments", json);

      console.log("Save Response:", response.data); // Log da resposta do backend

      if (response.data) {
        navigate("/appointments");
      }
    } catch (error) {
      console.error("Error saving appointment:", error); // Log detalhado do erro
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error saving data.");
    }
  }

  useEffect(() => {
    LoadUsers();
    LoadMechanics();
    if (id_appointment > 0) {
      LoadImages();
    }
  }, [id_appointment]);

  useEffect(() => {
    LoadServices(idMechanic);
  }, [idMechanic]);

  useEffect(() => {
    console.log("Additional Services State:", additionalServices);
  }, [additionalServices]);

  function generateTimeSlots(day) {
    let startHour, endHour;
    if (day >= 1 && day <= 5) {
      startHour = 8;
      endHour = 17.5;
    } else if (day === 6) {
      startHour = 8;
      endHour = 15.5;
    } else {
      return [];
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
                {services.map((s) => (
                  <option key={s.id_service} value={s.id_service}>
                    {s.service}
                  </option>
                ))}
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
            <label htmlFor="uploadImage" className="form-label">
              Upload Images
            </label>
            <input
              type="file"
              id="uploadImage"
              className="form-control"
              onChange={handleUploadImage}
            />
          </div>

          <div className="col-12 mt-4">
            <label className="form-label">Uploaded Images</label>
            <div className="row">
              {images.length > 0 ? (
                images.map((image) => (
                  <div key={image.id_image} className="col-4 mb-3">
                    {image.image_url ? ( // Exibe a imagem apenas se image_url estiver definido
                      <img
                        src={image.image_url}
                        alt={`Uploaded ${image.id_image}`}
                        className="uploaded-image-thumbnail" // Aplica o estilo padronizado
                        style={{
                          cursor: "pointer",
                          opacity: image.isUploading ? 0.5 : 1,
                        }}
                        onClick={() =>
                          !image.isUploading &&
                          setSelectedImage(image.image_url)
                        } // Apenas permite clicar se não estiver em upload
                      />
                    ) : (
                      <div
                        className="img-thumbnail d-flex align-items-center justify-content-center"
                        style={{
                          height: "150px",
                          backgroundColor: "#f8f9fa",
                          border: "1px dashed #ccc",
                        }}
                      >
                        <p className="text-muted mb-0">Uploading...</p>
                      </div>
                    )}
                    {image.isUploading ? (
                      <p className="text-muted mt-2">Uploading...</p>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mt-2"
                        onClick={() => confirmDeleteImage(image.id_image)} // Usa a função de confirmação
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No images uploaded.</p>
              )}
            </div>
          </div>

          {/* Modal para exibir a imagem ampliada */}
          {selectedImage && (
            <div
              className="modal"
              style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1050,
              }}
              onClick={() => setSelectedImage(null)} // Fecha o modal ao clicar fora
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img
                  src={selectedImage}
                  alt="Selected"
                  style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                />
              </div>
            </div>
          )}

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
