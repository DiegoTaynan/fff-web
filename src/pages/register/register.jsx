import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import logo from "../../assets/logo.png";
import fundo from "../../assets/fundo.jpg";
import { useState } from "react";
import api from "../../services/api";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");

  async function ExecuteAccount() {
    setMsg("");

    if (password !== password2)
      return setMsg("Passwords do not match. Please try again.");

    try {
      const response = await api.post("/admin/register", {
        name,
        email,
        password,
      });

      if (response.data) {
        localStorage.setItem("sessionToken", response.data.token);
        localStorage.setItem("sessionId", response.data.id_admin);
        localStorage.setItem("sessionEmail", email);
        localStorage.setItem("sessionName", name);
        localStorage.setItem("isAdmin", "true"); // Certifique-se de armazenar "true" para administradores
        api.defaults.headers.common["Authorization"] =
          "Bearer " + response.data.token;
        navigate("/appointments");
      } else setMsg("Error creating account. Please try again later.");
    } catch (error) {
      if (error.response?.data.error) setMsg(error.response?.data.error);
      else setMsg("Error creating account. Please try again later.");
    }
  }

  return (
    <div className="row">
      <div className="col-sm-5 d-flex justify-content-center align-items-center text-center">
        <form className="form-signin">
          <img src={logo} className="logo mb-4" />
          <h5 className="mb-5">Create your account</h5>
          <h5 className="mb-4 text-secondary">Fill in the fields</h5>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Name"
              className="form-control"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-2">
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
          <div className="mt-2">
            <input
              type="password"
              placeholder="Confirm password"
              className="form-control"
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
          <div className="mt-3 mb-5">
            <button
              onClick={ExecuteAccount}
              className="btn btn-primary w-100"
              type="button"
            >
              Create account
            </button>
          </div>

          {msg.length > 0 && (
            <div className="alert alert-danger" role="alert">
              {msg}
            </div>
          )}

          <div>
            <span className="me-1">I already have an account.</span>
            <Link to="/">Access count</Link>
          </div>
        </form>
      </div>

      <div className="col-sm-7 d-flex">
        <img src={fundo} className="background-login" />
      </div>
    </div>
  );
}

export default Register;
