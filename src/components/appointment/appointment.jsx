import { useState, useEffect } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "../../services/api";

function Appointment(props) {
  // Reduzir a quantidade de logs para melhorar performance
  if (process.env.NODE_ENV === "development") {
    console.log("Appointment props:", {
      id: props.id_appointment,
      user: props.user,
      mechanic: props.mechanic,
      service: props.service,
      date: props.date || props.booking_date, // Log tanto date quanto booking_date
    });
  }

  // Lidar com diferentes formatos de data da API
  // Algumas respostas usam 'date', outras usam 'booking_date'
  const dateField = props.date || props.booking_date;

  // Valores padrão melhorados - usando props diretamente quando possível
  const safeProps = {
    id_appointment: props.id_appointment,
    user: props.user || "Unknown Customer",
    mechanic: props.mechanic || "Unknown Mechanic",
    service: props.service || "Unknown Service",
    booking_date: dateField || new Date().toISOString().split("T")[0],
    booking_hour: props.booking_hour || props.hour || "00:00", // Também verifica 'hour'
    progress: props.progress || (props.status === "C" ? "C" : "P"), // Verifica status alternativo
    // Capturar quaisquer campos adicionais
    ...props,
  };

  // Estados locais
  const [progress, setProgress] = useState(safeProps.progress);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincronizar estado quando as props mudam
  useEffect(() => {
    setProgress(safeProps.progress);
  }, [safeProps.progress]);

  // Formatação de data com segurança - melhorada para lidar com diferentes formatos
  const formatDate = () => {
    try {
      // Tentamos com o formato da data fornecido
      const dt = new Date(
        safeProps.booking_date + "T" + safeProps.booking_hour
      );

      // Verificação de data válida
      if (isNaN(dt.getTime())) {
        console.warn(
          "Invalid date format:",
          safeProps.booking_date,
          safeProps.booking_hour
        );

        // Tenta formatar a data como string se o parsing falhar
        const dateParts = safeProps.booking_date.split("-");
        if (dateParts.length === 3) {
          return `${dateParts[1]}/${dateParts[2]}/${dateParts[0].slice(-2)}`;
        }

        return "Invalid date";
      }

      return `${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt
        .getDate()
        .toString()
        .padStart(2, "0")}/${dt.getFullYear().toString().slice(-2)}`;
    } catch (error) {
      console.error("Error formatting date:", error, safeProps);
      return "Invalid date";
    }
  };

  const formattedDate = formatDate();

  // Handler para mudança de status com melhor feedback visual
  async function handleProgressClick() {
    const newStatus = progress === "C" ? "P" : "C";

    confirmAlert({
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status to ${
        newStatus === "C" ? "Completed" : "In Progress"
      }?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setIsUpdating(true);

              // Log detalhado para debug
              console.log("Updating appointment status:", {
                id: safeProps.id_appointment,
                currentStatus: progress,
                newStatus: newStatus,
              });

              const response = await api.put(
                `/appointments/${safeProps.id_appointment}/status`,
                { status: newStatus }
              );

              if (response.status === 200) {
                console.log("Status updated successfully:", response.data);
                setProgress(newStatus);
              } else {
                console.warn("Unexpected response:", response);
                alert("Error updating status");
              }
            } catch (error) {
              console.error("Error updating status:", error);
              alert("Error updating status. Please try again later.");
            } finally {
              setIsUpdating(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  }

  return (
    <tr>
      <td>{safeProps.user}</td>
      <td>{safeProps.mechanic}</td>
      <td>{safeProps.service}</td>
      <td>
        {formattedDate} - {safeProps.booking_hour}h
      </td>
      <td>
        {progress === "C" ? "Completed" : "In Progress"}{" "}
        <button
          onClick={handleProgressClick}
          className={`btn btn-sm ${
            progress === "C" ? "btn-success" : "btn-secondary"
          }`}
          disabled={isUpdating}
        >
          <i
            className={`bi ${
              isUpdating ? "bi-hourglass-split" : "bi-check2-square"
            }`}
          ></i>
        </button>
      </td>
      <td className="text-end">
        <div className="d-inline me-3">
          <button
            onClick={() => props.clickEdit(safeProps.id_appointment)}
            className="btn btn-sm btn-react-blue"
          >
            <i className="bi bi-pencil-square"></i>
          </button>
        </div>
        <button
          onClick={() => props.clickDelete(safeProps.id_appointment)}
          className="btn btn-sm btn-primary"
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
}

export default Appointment;
