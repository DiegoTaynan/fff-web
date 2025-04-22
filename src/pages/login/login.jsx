import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import logo from "../../assets/logo.png";
import fundo from "../../assets/fundo.jpg";
import { useState } from "react";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function ExecuteLogin() {
    setMsg("");

    try {
      const response = await api.post("/admin/login", {
        email,
        password,
      });

      console.log("Login response:", response.data); // Log para depuração

      if (response.status === 200) {
        localStorage.setItem("sessionToken", response.data.token);
        localStorage.setItem("sessionId", response.data.id_admin);
        localStorage.setItem("sessionEmail", response.data.email);
        localStorage.setItem("sessionName", response.data.name);
        localStorage.setItem("isAdmin", true); // Certifique-se de armazenar "true" para administradores

        api.defaults.headers.common["Authorization"] =
          "Bearer " + response.data.token;

        navigate("/admin");
      } else {
        setMsg("Error logging in. Please try again later.");
      }
    } catch (error) {
      console.error("Login error:", error); // Log detalhado do erro
      if (error.response?.data.error) setMsg(error.response?.data.error);
      else setMsg("Error logging in. Please try again later.");
    }
  }

  return (
    <div className="row">
      <div className="col-sm-5 d-flex justify-content-center align-items-center text-center">
        <form className="form-signin">
          <img src={logo} className="logo mb-4" />
          <h5 className="mb-5">Manage your appointments</h5>
          <h5 className="mb-4 text-secondary">Access your account</h5>

          <div className="mt-4">
            <input
              type="email"
              placeholder="E-mail"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-3 mb-5">
            <button
              onClick={ExecuteLogin}
              className="btn btn-primary w-100"
              type="button"
            >
              Login
            </button>
          </div>

          {msg.length > 0 && (
            <div className="alert alert-danger" role="alert">
              {msg}
            </div>
          )}

          <div>
            <span className="me-1">I don't have an account.</span>
            <Link to="register">Create account</Link>
          </div>
        </form>
      </div>

      <div className="col-sm-7 d-flex">
        <img src={fundo} className="background-login" />
      </div>
    </div>
  );
}

export default Login;
