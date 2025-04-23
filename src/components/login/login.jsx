import React, { useState, useContext } from "react";
import api from "../../constants/api.js"; // Certifique-se de que o caminho está correto
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../app.jsx"; // Importa o contexto global

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook para redirecionamento
  const { setToken } = useContext(AuthContext); // Usa o contexto global

  async function handleLogin() {
    try {
      const response = await api.post("/login", { email, password });
      console.log("Login response:", response.data); // Log para verificar a resposta do login

      if (response.data.token) {
        setToken(response.data.token); // Atualiza o token no estado global
        console.log(
          "Token stored in context and localStorage:",
          response.data.token
        ); // Log para verificar o armazenamento do token
        navigate("/appointments"); // Redireciona para a página de Appointments
      } else {
        alert("Login failed: No token received.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
