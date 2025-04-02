import { useState } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "../../constants/api.js"; // Certifique-se de que o caminho está correto

function Appointment(props) {
  console.log("Appointment Props:", props); // Log para verificar os dados recebidos pelo componente

  const dt = new Date(props.booking_date + "T" + props.booking_hour);

  // Formatação manual da data
  const formattedDate = `${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt
    .getDate()
    .toString()
    .padStart(2, "0")}/${dt.getFullYear().toString().slice(-2)}`;

  const [progress, setProgress] = useState(props.progress || "In progress");

  async function handleProgressClick() {
    const newStatus = progress === "In progress" ? "Completed" : "In progress";

    confirmAlert({
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status to ${newStatus}?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const response = await api.put(
                `/appointments/${props.id_appointment}/status`,
                { status: newStatus }
              );
              if (response.status === 200) {
                setProgress(newStatus);
              } else {
                alert("Error updating status");
              }
            } catch (error) {
              console.error("Error updating status:", error); // Adicionado log para depuração
              alert("Error updating status. Please try again later.");
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            // Garantir que o callback "No" não cause problemas
          },
        },
      ],
    });
  }

  return (
    <tr>
      <td>{props.user}</td>
      <td>{props.mechanic}</td>
      <td>{props.service}</td>
      <td>
        {formattedDate} - {props.booking_hour}h
      </td>
      <td>
        {progress}{" "}
        <button
          onClick={handleProgressClick}
          className={`btn btn-sm ${
            progress === "In progress" ? "btn-secondary" : "btn-success"
          }`}
        >
          <i className="bi bi-check2-square"></i>
          {/* Confirm */}
        </button>
      </td>
      <td className="text-end">
        <div className="d-inline me-3">
          <button
            onClick={() => props.clickEdit(props.id_appointment)}
            className="btn btn-sm btn-react-blue"
          >
            <i className="bi bi-pencil-square"></i>
          </button>
        </div>
        <button
          onClick={() => props.clickDelete(props.id_appointment)}
          className="btn btn-sm btn-primary"
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
}

export default Appointment;
