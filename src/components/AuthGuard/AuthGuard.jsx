import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";

function AuthGuard({ children }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificação simples e rápida, sem chamadas à API
    if (isAuthenticated()) {
      setIsChecking(false);
    } else {
      console.log("User not authenticated, redirecting to login");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (isChecking) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return children;
}

export default AuthGuard;
