import "./admin.css";
import Navbar from "../../components/navbar/navbar.jsx";
import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  async function LoadUsers() {
    try {
      const response = await api.get("/admin/usersadmin", {
        params: { page, limit: itemsPerPage },
      });

      if (response.data) {
        const adminsData = response.data;
        setUsers(adminsData || []);
        setTotalPages(1); // Atualize se a paginação for necessária no futuro
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      alert("Error loading admins. Please try again later.");
    }
  }

  async function handleApprove(id_admin) {
    try {
      await api.put(`/admin/usersadmin/${id_admin}/status`, {
        status: "approved",
      });
      alert("Admin approved successfully.");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id_admin === id_admin ? { ...user, status: "approved" } : user
        )
      ); // Atualiza apenas o usuário correto no estado local
    } catch (error) {
      console.error("Error approving admin:", error);
      alert("Error approving admin. Please try again later.");
    }
  }

  async function handleReject(id_admin) {
    try {
      await api.put(`/admin/usersadmin/${id_admin}/status`, {
        status: "rejected",
      });
      alert("Admin rejected successfully.");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id_admin === id_admin ? { ...user, status: "rejected" } : user
        )
      ); // Atualiza apenas o usuário correto no estado local
    } catch (error) {
      console.error("Error rejecting admin:", error);
      alert("Error rejecting admin. Please try again later.");
    }
  }

  useEffect(() => {
    LoadUsers();
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
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="d-inline">Administration</h2>
      </div>

      <div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">E-mail</th>
              <th scope="col">Status</th> {/* Nova coluna para o status */}
              <th scope="col" className="col-buttons"></th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id_admin}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.status === "approved" ? "Approved" : "Pending"}
                  </td>{" "}
                  {/* Exibe o status */}
                  <td className="text-end">
                    <button
                      onClick={() => handleApprove(user.id_admin)}
                      className="btn btn-sm btn-success me-2"
                      disabled={user.status === "approved"} // Desabilita o botão se já aprovado
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id_admin)}
                      className="btn btn-sm btn-danger"
                      disabled={user.status === "rejected"} // Desabilita o botão se já rejeitado
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`page-item ${index + 1 === page ? "active" : ""}`}
            onClick={() => setPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
