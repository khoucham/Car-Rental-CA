import { Outlet } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";

export default function UserLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />

      <main className="flex-fill">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
