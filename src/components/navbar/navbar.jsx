import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-white.png";
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { clearAuthData } from "../../services/auth";

function Navbar({ itemsPerPage, setItemsPerPage, page, setPage, totalPages }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    console.log("Admin status from localStorage:", adminStatus); // Log para depuração
    setIsAdmin(adminStatus);
  }, []);

  useEffect(() => {
    console.log(
      `Navbar - Página atual: ${page}, Total de páginas: ${totalPages}`
    );
  }, [page, totalPages]);

  function Logout() {
    // Use the centralized clearAuthData function
    clearAuthData();

    // Navigate to login page
    window.location.href = "/";
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
              onChange={(e) => {
                const newItemsPerPage = Number(e.target.value);
                setItemsPerPage(newItemsPerPage);
                // Ajusta a página atual quando mudamos o tamanho da página
                setPage(1);
              }}
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

            <span className="text-light mx-2">
              {page} / {totalPages}
            </span>

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

                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        Administration
                      </Link>
                    </li>
                  )}
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
