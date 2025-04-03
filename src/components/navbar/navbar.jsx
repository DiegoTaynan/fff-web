import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-white.png";
import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Certifique-se de que o caminho está correto

function Navbar({ itemsPerPage, setItemsPerPage, page, setPage }) {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    async function fetchTotalItems() {
      try {
        const response = await api.get("/appointments", {
          params: { page: 1, limit: 1 },
        });

        if (response && response.data && response.data.total) {
          setTotalItems(response.data.total);
        } else {
          setTotalItems(0); // Garante que não seja `undefined`
        }
      } catch (error) {
        setTotalItems(0); // Evita erro caso a API falhe
      }
    }

    fetchTotalItems();
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  function Logout() {
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("sessionEmail");
    localStorage.removeItem("sessionName");

    navigate("/");
    api.defaults.headers.common["Authorization"] = "";
  }

  return (
    <nav
      className="navbar fixed-top navbar-expand-lg bg-black"
      data-bs-theme="dark"
    >
      <div className="container-fluid">
        <Link className="navbar-brand" to="/appointments">
          <img className="navbar-logo" src={logo} alt="Logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/appointments">
                Schedules
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/mechanics">
                Mechanics
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <select
              className="form-select me-2"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={20}>20</option>
              <option value={40}>40</option>
              <option value={60}>60</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
            </select>

            <button
              className="btn btn-outline-light me-2"
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page <= 1}
            >
              Previous
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>

          <ul className="navbar-nav ">
            <li className="nav-item">
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-black dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {localStorage.getItem("sessionName")}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="#">
                      Meu Perfil
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={Logout}>
                      Desconectar
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
