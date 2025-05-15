import React, { useState, useEffect } from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import api from "../../services/api"; // Certifique-se de que o caminho está correto
import {
  FaEdit,
  FaTrash,
  FaCheckSquare,
  FaHourglassHalf,
} from "react-icons/fa"; // Importa ícones necessários

function Appointment(props) {
  console.log("Appointment Props:", props); // Log para verificar os dados recebidos pelo componente

  const dt = new Date(props.booking_date + "T" + props.booking_hour);

  // Formatação manual da data
  const formattedDate = `${(dt.getMonth() + 1).toString().padStart(2, "0")}/${dt
    .getDate()
    .toString()
    .padStart(2, "0")}/${dt.getFullYear().toString().slice(-2)}`;

  const [progress, setProgress] = useState(props.progress); // Inicializa com o valor vindo do banco

  useEffect(() => {
    // Sincroniza o estado inicial com o valor vindo do banco
    setProgress(props.progress);
  }, [props.progress]);

  async function handleProgressClick() {
    const newStatus = progress === "C" ? "P" : "C"; // Alterna entre "C" e "P"

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
              const response = await api.put(
                `/appointments/${props.id_appointment}/status`,
                { status: newStatus }
              );
              if (response.status === 200) {
                setProgress(newStatus); // Atualiza o estado local com "C" ou "P"
              } else {
                alert("Error updating status");
              }
            } catch (error) {
              console.error("Error updating status:", error); // Log para depuração
              alert("Error updating status. Please try again later.");
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            // Nenhuma ação necessária
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
        {progress === "C" ? "Completed" : "In Progress"}{" "}
        <button
          onClick={handleProgressClick}
          className={`btn btn-sm ${
            progress === "C" ? "btn-success" : "btn-secondary"
          }`}
        >
          {progress === "C" ? <FaCheckSquare /> : <FaHourglassHalf />}{" "}
          {/* Ícone dinâmico */}
        </button>
      </td>
      <td className="text-end">
        <div className="d-inline me-3">
          <button
            onClick={() => props.clickEdit(props.id_appointment)}
            className="btn btn-sm btn-react-blue"
          >
            <FaEdit /> {/* Ícone de edição */}
          </button>
        </div>
        <button
          onClick={() => props.clickDelete(props.id_appointment)}
          className="btn btn-sm btn-primary"
        >
          <FaTrash /> {/* Ícone de exclusão */}
        </button>
      </td>
    </tr>
  );
}

// Adicione React.memo no export
export default React.memo(Appointment);
