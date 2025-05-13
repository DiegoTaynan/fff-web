import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./ServerStatus.css";

// Componente para verificar periodicamente o status do servidor
function ServerStatus() {
  const [status, setStatus] = useState("loading");
  const [lastChecked, setLastChecked] = useState(null);

  const checkServerStatus = async () => {
    try {
      setStatus("loading");
      // Tenta fazer uma requisição simples para verificar se o servidor está respondendo
      await api.get("/admin/users", {
        params: { limit: 1 },
        timeout: 3000, // 3 segundos de timeout
      });
      setStatus("online");
    } catch (error) {
      console.error("Erro ao verificar status do servidor:", error);
      setStatus("offline");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Verificar quando o componente é montado
    checkServerStatus();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    checkServerStatus();
  };

  // Não renderizar nada se estiver online
  if (status === "online") return null;

  return (
    <div className={`server-status ${status}`}>
      {status === "loading" ? (
        <div>Verificando conexão com o servidor...</div>
      ) : (
        <div>
          <i className="bi bi-exclamation-triangle"></i> Servidor offline ou
          indisponível
          <button onClick={handleRetry} className="retry-button">
            <i className="bi bi-arrow-clockwise"></i> Reconectar
          </button>
          {lastChecked && (
            <small className="last-checked">
              Última verificação: {lastChecked.toLocaleTimeString()}
            </small>
          )}
        </div>
      )}
    </div>
  );
}

export default ServerStatus;
