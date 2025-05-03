import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/navbar.jsx";
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
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
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const LoadUsers = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await api.get("/admin/users", {
        params: { page: 1, limit: 1000 },
      });

      if (response.data) {
        // Verificando se a resposta contém uma estrutura de paginação
        const userData = Array.isArray(response.data)
          ? response.data
          : response.data.data
          ? response.data.data
          : [];

        console.log("Loaded Users Data:", userData);
        setUsers(userData);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setPageError("Failed to load customer data. Please try again.");
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); // Limpa o token inválido
        return navigate("/");
      }
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing customer.");
    } finally {
      setPageLoading(false);
    }
  }, [navigate]);

  const LoadMechanics = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await api.get("/mechanic", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data) {
        setMechanic(response.data);
      } else {
        console.warn("No mechanics data received");
        setMechanic([]);
      }
    } catch (error) {
      console.error("Error loading mechanics:", error);
      setPageError("Failed to load mechanics data. Please try again.");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        return navigate("/");
      }
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing mechanics.");
    }
  }, [navigate]);

  const LoadAppointment = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setPageLoading(true);
        console.log("Loading appointment with ID:", id);
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token available");
          navigate("/");
          return;
        }

        const response = await api.get(`/admin/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          console.log("Appointment data loaded successfully:", response.data);
          setIdUser(response.data.id_user);
          setIdMechanic(response.data.id_mechanic);
          setidService(response.data.id_service);
          setBookingDate(response.data.booking_date);
          setBookingHour(response.data.booking_hour);
          setObservations(response.data.observations);
          setAdditionalServices(response.data.additional_services || []);
        } else {
          setPageError("Appointment data is empty or invalid.");
        }
      } catch (error) {
        console.error("Error loading appointment:", error);
        setPageError("Failed to load appointment. Please try again.");

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        } else if (error.response?.status === 404) {
          setPageError("Appointment not found.");
        }
      } finally {
        setPageLoading(false);
      }
    },
    [navigate]
  );

  const LoadServices = useCallback(async () => {
    try {
      const response = await api.get("/admin/services", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Verificar explicitamente se os dados são um array, caso contrário, definir como array vazio
      if (response.data && Array.isArray(response.data)) {
        console.log(
          "Services loaded successfully:",
          response.data.length,
          "items"
        );
        setServices(response.data);
      } else {
        console.warn(
          "API returned non-array data for services:",
          response.data
        );
        setServices([]); // Garantir que services seja sempre um array
      }
    } catch (error) {
      console.error("Error loading services:", error);
      setPageError("Failed to load services. Please try again.");
      setServices([]); // Garantir que services seja um array mesmo em caso de erro

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error listing services.");
    }
  }, [navigate]);

  const LoadImages = useCallback(async () => {
    if (!id_appointment) return;

    try {
      const response = await api.get(`/appointments/${id_appointment}/images`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("Images loaded:", response.data);

      if (Array.isArray(response.data)) {
        // Processamos cada imagem para garantir URLs válidas
        const processedImages = response.data.map((img) => {
          let imageUrl = img.image_url;

          // Verifica se a URL é relativa e precisa do prefixo base
          if (
            imageUrl &&
            !imageUrl.startsWith("http") &&
            !imageUrl.startsWith("data:")
          ) {
            // Assume a URL base da API
            imageUrl = `${api.defaults.baseURL}${
              imageUrl.startsWith("/") ? "" : "/"
            }${imageUrl}`;
          }

          return {
            id_image: img.id_image,
            image_url: imageUrl,
            isUploading: false,
            originalData: img, // Mantém os dados originais para debugging
          };
        });

        setImages(processedImages);
        console.log("Processed images:", processedImages);
      } else {
        console.warn("No images found or invalid format:", response.data);
        setImages([]);
      }
    } catch (error) {
      console.error("Error loading images:", error);
      // Não definir pageError para imagens, pois não é crítico para a página
      console.warn("Failed to load images but continuing with the form");
    }
  }, [id_appointment]);

  async function handleUploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar o tipo de arquivo
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Criar um objeto blob URL para pré-visualização local
    const previewUrl = URL.createObjectURL(file);

    // ID temporário para este upload
    const tempImageId = `temp-${Date.now()}`;

    // Adicionar a imagem ao estado com flag de upload
    const newImage = {
      id_image: tempImageId,
      image_url: previewUrl,
      isUploading: true,
      // Adicionar mais dados para debugging
      originalFile: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    };

    setImages((prevImages) => [...prevImages, newImage]);
    console.log("Added preview image:", newImage);

    // Preparar o FormData para upload
    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Uploading image for appointment:", id_appointment);

      const response = await api.post(
        `/appointments/${id_appointment}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // Adicionar monitoramento de progresso se necessário
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Upload response:", response.data);

      // Atualizar o estado da imagem quando o upload for concluído
      if (response.data) {
        // Extrair a URL da imagem e ID da resposta
        let uploadedImageUrl = "";
        let uploadedImageId = "";

        if (response.data.imageUrl) {
          uploadedImageUrl = response.data.imageUrl;
          uploadedImageId = response.data.id_image || tempImageId;
        } else if (response.data.image_url) {
          uploadedImageUrl = response.data.image_url;
          uploadedImageId = response.data.id_image || tempImageId;
        } else if (typeof response.data === "string") {
          // Caso a resposta seja apenas a URL como string
          uploadedImageUrl = response.data;
          uploadedImageId = tempImageId;
        }

        // Garantir que a URL seja absoluta
        if (
          uploadedImageUrl &&
          !uploadedImageUrl.startsWith("http") &&
          !uploadedImageUrl.startsWith("data:")
        ) {
          uploadedImageUrl = `${api.defaults.baseURL}${
            uploadedImageUrl.startsWith("/") ? "" : "/"
          }${uploadedImageUrl}`;
        }

        // Atualizar a imagem no estado
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id_image === tempImageId
              ? {
                  id_image: uploadedImageId,
                  image_url: uploadedImageUrl,
                  isUploading: false,
                  uploadedAt: new Date().toISOString(),
                }
              : img
          )
        );

        console.log("Image updated after upload:", uploadedImageUrl);

        // Liberar o URL de objeto para evitar vazamentos de memória
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");

      // Remover a imagem do estado em caso de erro
      setImages((prevImages) =>
        prevImages.filter((img) => img.id_image !== tempImageId)
      );

      // Liberar o URL de objeto
      URL.revokeObjectURL(previewUrl);
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
      observations: observations, // Make sure observations is passed
      additional_services: additionalServices,
    };

    console.log("Saving Appointment Data:", json);

    try {
      const response =
        id_appointment > 0
          ? await api.put(`/admin/appointments/${id_appointment}`, json)
          : await api.post("/admin/appointments", json);

      console.log("Save Response:", response.data);

      if (response.data) {
        navigate("/appointments");
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      if (error.response?.data.error) {
        if (error.response.status === 401) return navigate("/");
        alert(error.response?.data.error);
      } else alert("Error saving data.");
    }
  }

  useEffect(() => {
    // Verificar token no início para evitar cargas desnecessárias
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found, redirecting to login");
      navigate("/");
      return;
    }

    const initializePage = async () => {
      setPageLoading(true);
      setPageError(null);

      try {
        // Carregar dados necessários
        await Promise.all([LoadUsers(), LoadMechanics(), LoadServices()]);

        // Carregar appointment apenas se for modo de edição
        if (id_appointment && id_appointment > 0) {
          await LoadAppointment(id_appointment);
          await LoadImages();
        }
      } catch (error) {
        console.error("Error during page initialization:", error);
        setPageError("Failed to load page data. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    initializePage();
  }, [
    id_appointment,
    LoadUsers,
    LoadMechanics,
    LoadServices,
    LoadAppointment,
    LoadImages,
    navigate,
  ]);

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

  // Função auxiliar para verificar se uma URL é válida
  function isValidImageUrl(url) {
    if (!url) return false;
    // Verificação simples - se a URL existe, consideramos válida inicialmente
    return true;
  }

  // Função auxiliar para verificar se uma URL é válida e normalizá-la se necessário
  function validateAndNormalizeImageUrl(url) {
    if (!url) return { isValid: false, url: null };

    try {
      // Verifica se a URL é relativa e precisa de base URL
      if (!url.startsWith("http") && !url.startsWith("data:")) {
        // Garante que temos a baseURL da API
        const baseUrl =
          api.defaults.baseURL || "https://familyfriendsadmin.com";
        const normalizedUrl = `${baseUrl}${
          url.startsWith("/") ? "" : "/"
        }${url}`;
        console.log("URL normalizada:", normalizedUrl);
        return { isValid: true, url: normalizedUrl };
      }

      // Já é uma URL completa
      console.log("URL já completa:", url);
      return { isValid: true, url };
    } catch (error) {
      console.error("Erro ao validar URL da imagem:", error);
      return { isValid: false, url: null };
    }
  }

  // Função para exibir a imagem no modal com tratamento de erro aprimorado
  function handleImageClick(imageUrl) {
    console.log("Clique na imagem, URL recebida:", imageUrl);

    // Primeiro definimos o selectedImage para iniciar o modal
    setSelectedImage(imageUrl);

    // Então processamos a URL para garantir sua validade
    const { isValid, url } = validateAndNormalizeImageUrl(imageUrl);

    if (!isValid) {
      console.error("URL de imagem inválida:", imageUrl);
      alert("Não foi possível exibir esta imagem - URL inválida");
      setSelectedImage(null);
      return;
    }

    console.log("URL da imagem validada:", url);
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-page">
        {pageLoading ? (
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading page content...</p>
          </div>
        ) : pageError ? (
          <div
            className="alert alert-danger mx-auto mt-4"
            style={{ maxWidth: "500px" }}
          >
            <h4>Error Loading Page</h4>
            <p>{pageError}</p>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/appointments")}
              >
                Go Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
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
                  {/* Verificar se services existe e é um array antes de chamar map */}
                  {Array.isArray(services) &&
                    services.map((s) => (
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
                  // Verificar se services existe e é um array antes de usar find
                  const serviceName = Array.isArray(services)
                    ? services.find(
                        (s) => s.id_service.toString() === service.toString()
                      )?.service
                    : "Service not found";

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
                      {image.image_url && isValidImageUrl(image.image_url) ? (
                        <div className="image-container">
                          <img
                            src={image.image_url}
                            alt={`Uploaded ${image.id_image}`}
                            className="uploaded-image-thumbnail"
                            style={{
                              cursor: "pointer",
                              opacity: image.isUploading ? 0.5 : 1,
                            }}
                            onClick={() =>
                              !image.isUploading &&
                              handleImageClick(image.image_url)
                            }
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                image.image_url
                              );
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23adb5bd'%3EImage Error%3C/text%3E%3C/svg%3E";
                              e.target.style.border = "1px solid #dc3545";
                            }}
                          />
                          {image.isUploading && (
                            <div className="upload-overlay">
                              <div
                                className="spinner-border text-light"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="img-thumbnail d-flex align-items-center justify-content-center"
                          style={{
                            height: "150px",
                            backgroundColor: "#f8f9fa",
                            border: "1px dashed #ccc",
                          }}
                        >
                          <p className="text-muted mb-0">
                            {image.isUploading
                              ? "Uploading..."
                              : "Invalid image"}
                          </p>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <small
                          className="text-truncate"
                          style={{ maxWidth: "60%" }}
                          title={
                            image.originalFile?.name ||
                            `Image ${image.id_image}`
                          }
                        >
                          {image.originalFile?.name ||
                            `Image ${image.id_image}`}
                        </small>

                        {image.isUploading ? (
                          <span className="badge bg-warning text-dark">
                            Uploading...
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => confirmDeleteImage(image.id_image)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No images uploaded.</p>
                )}
              </div>
            </div>
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
                onClick={() => setSelectedImage(null)}
              >
                <div
                  className="modal-image-container"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    padding: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "5px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedImage}
                    alt="Imagem em tamanho completo"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
                    }}
                    onError={(e) => {
                      console.error(
                        "Erro ao carregar imagem do modal:",
                        selectedImage
                      );
                      // Se falhar, tente usar a URL normalizada
                      const { isValid, url } =
                        validateAndNormalizeImageUrl(selectedImage);
                      if (isValid && url !== selectedImage) {
                        console.log(
                          "Tentando carregar com URL normalizada:",
                          url
                        );
                        e.target.src = url;
                      } else {
                        alert(
                          "Não foi possível carregar a imagem em tamanho completo."
                        );
                        setSelectedImage(null);
                      }
                    }}
                  />
                  <button
                    className="btn btn-light position-absolute modal-close-btn"
                    style={{ top: "10px", right: "10px", zIndex: 1051 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
            <div className="col-12 mt-4">
              <div className="d-flex justify-content-end">
                <Link
                  to="/appointments"
                  className="btn btn-outline-primary me-3"
                >
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
        )}
      </div>
    </>
  );
}

export default AppointmentAdd;
