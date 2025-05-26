import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/navbar.jsx";
import api from "../../services/api";
import "./mechanics.css";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"; // Importando ícones do React Icons

function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");

  // Form state for add/edit
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "edit"
  const [formData, setFormData] = useState({
    id_mechanic: null,
    name: "",
    specialty: "",
  });

  // Options for mechanic specialties
  const specialtyOptions = [
    "General Mechanic",
    "Electrical Specialist",
    "Engine Specialist",
    "Transmission Specialist",
    "Brake Specialist",
    "Suspension Specialist",
  ];

  // Load mechanics from API
  async function loadMechanics() {
    try {
      setLoading(true);
      const response = await api.get("/mechanic", {
        params: {
          name: searchName || undefined,
        },
      });

      if (response.data) {
        setMechanics(response.data);
        // For now, no pagination in the backend API
        setTotalPages(1);
      } else {
        setMechanics([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading mechanics:", error);
      alert("Error loading mechanics. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      id_mechanic: null,
      name: "",
      specialty: "",
    });
    setFormMode("add");
  };

  // Open form for adding new mechanic
  const handleAddClick = () => {
    resetForm();
    setFormMode("add");
    setShowForm(true);
  };

  // Open form for editing existing mechanic
  const handleEditClick = (mechanic) => {
    setFormData({
      id_mechanic: mechanic.id_mechanic,
      name: mechanic.name,
      specialty: mechanic.specialty,
    });
    setFormMode("edit");
    setShowForm(true);
  };

  // Handle form submission (add or edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formMode === "add") {
        await api.post("/mechanic", formData);
        alert("Mechanic added successfully!");
      } else {
        await api.put(`/mechanic/${formData.id_mechanic}`, formData);
        alert("Mechanic updated successfully!");
      }

      setShowForm(false);
      resetForm();
      loadMechanics(); // Reload the list
    } catch (error) {
      console.error("Error saving mechanic:", error);
      alert(
        `Error ${
          formMode === "add" ? "adding" : "updating"
        } mechanic. Please try again.`
      );
    }
  };

  // Handle mechanic deletion
  const handleDelete = async (id_mechanic) => {
    if (window.confirm("Are you sure you want to delete this mechanic?")) {
      try {
        await api.delete(`/mechanic/${id_mechanic}`);
        alert("Mechanic deleted successfully!");
        loadMechanics(); // Reload the list
      } catch (error) {
        console.error("Error deleting mechanic:", error);
        alert("Error deleting mechanic. Please try again later.");
      }
    }
  };

  // Search mechanics by name
  const handleSearch = (e) => {
    e.preventDefault();
    loadMechanics();
  };

  // Initial load
  useEffect(() => {
    loadMechanics();
  }, [page, itemsPerPage]);

  return (
    <div className="container-fluid mt-page">
      <Navbar
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      <div className="mechanics-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Mechanics Management</h2>
          <button className="btn btn-primary" onClick={handleAddClick}>
            <FaPlus className="me-2" /> Add New Mechanic
          </button>
        </div>

        {/* Search bar */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by mechanic name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary w-100">
                  <FaSearch className="me-2" /> Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Form for adding/editing mechanic */}
        {showForm && (
          <div className="card mb-4 mechanics-form-card">
            <div className="card-header bg-primary text-white">
              <h5>
                {formMode === "add" ? "Add New Mechanic" : "Edit Mechanic"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="specialty" className="form-label">
                    Specialty
                  </label>
                  <select
                    className="form-select"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a specialty</option>
                    {specialtyOptions.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formMode === "add" ? "Add Mechanic" : "Update Mechanic"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mechanics table */}
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Loading mechanics...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Specialty</th>
                  <th scope="col" className="col-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mechanics.length > 0 ? (
                  mechanics.map((mechanic) => (
                    <tr key={mechanic.id_mechanic}>
                      <td>{mechanic.name}</td>
                      <td>{mechanic.specialty}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditClick(mechanic)}
                            className="btn-action btn-edit"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(mechanic.id_mechanic)}
                            className="btn-action btn-delete"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No mechanics found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mechanics;
