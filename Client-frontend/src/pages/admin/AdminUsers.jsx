import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await fetch(`http://localhost:5000/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    fetchUsers();
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <h2 className="mb-3">Users</h2>

      <Table responsive bordered hover>
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th width="120">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== "admin" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
