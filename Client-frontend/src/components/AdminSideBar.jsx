import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <div className="bg-dark text-white vh-100 p-3">
      <h5 className="mb-4">🛠 Admin Panel</h5>

      <ul className="nav flex-column gap-2">
        <li>
          <NavLink className="nav-link text-white" to="/admin">
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link text-white" to="/admin/bookings">
            📦 Bookings
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link text-white" to="/admin/cars">
            🚗 Cars
          </NavLink>
        </li>
        <li>
          <NavLink className="nav-link text-white" to="/admin/users">
            👤 Users
          </NavLink>
        </li>
      </ul>

      <hr />
      <button className="btn btn-outline-light btn-sm" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
