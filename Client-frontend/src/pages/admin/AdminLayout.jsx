import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/AdminSideBar";
import AppNavbar from "../../components/AppNavbar";

export default function AdminLayout() {
  return (
    <>
      {/* reuse same navbar */}
      <AppNavbar />

      <div className="container-fluid">
        <div className="row">
          {/* sidebar */}
          <div className="col-md-3 col-lg-2 p-0">
            <AdminSidebar />
          </div>

          {/* content */}
          <div className="col-md-9 col-lg-10 py-4">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
