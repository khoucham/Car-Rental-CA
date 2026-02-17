import { Routes, Route } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./pages/admin/AdminLayout";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/booking";
import MyBookings from "./pages/MyBooking";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Payment from "./pages/Payement";

import AdminDashboard from "./pages/admin/AdminDashboards";

import AdminBookings from "./pages/admin/AdminBookings";
import AdminCars from "./pages/admin/AdminCars";
import AdminUsers from "./pages/admin/AdminUsers";
import "leaflet/dist/leaflet.css";
import AdminRoute from "./components/AdminRoute";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <Routes>
      {/* ================= USER ROUTES ================= */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
     <Route element={<UserLayout />}>
  <Route path="/payment/:bookingId" element={<Payment />} /></Route>

  </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin"element={ <AdminRoute>  <AdminLayout /> </AdminRoute> } >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="cars" element={<AdminCars />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default App;
