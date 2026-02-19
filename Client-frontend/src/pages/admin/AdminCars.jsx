import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/cars";

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [editingId, setEditingId] = useState(null);

  /* ===== FEEDBACK ===== */
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  /* ===== PAGINATION ===== */
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  /* ===== BRAND SEARCH ===== */
  const brands = [
    "Toyota", "Renault", "Ford", "Volkswagen", "BMW",
    "Mercedes", "Audi", "Hyundai", "Kia", "Nissan",
    "Peugeot", "Citroen", "Skoda", "Seat", "Dacia",
  ];

  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandList, setShowBrandList] = useState(false);

  /* ===== FORM STATE ===== */
  const [form, setForm] = useState({
    brand: "",
    model: "",
    category: "",
    type: "",
    fuel: "",
    transmission: "",
    seats: "",
    doors: "",
    price_per_day: "",
    image: "",
  });

  /* ===== MANUAL DROPDOWNS ===== */
  const CATEGORIES = ["Economy", "SUV", "Luxury", "Electric"];
  const TYPES = ["Hatchback", "Sedan", "SUV"];
  const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
  const TRANSMISSIONS = ["Automatic", "Manual"];
  const SEATS = [2, 4, 5, 7];
  const DOORS = [2, 3, 4, 5];

  /* ========================
     FETCH CARS
  ======================== */
  const fetchCars = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setCars(data);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  /* ========================
     FORM HANDLING
  ======================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      brand: "",
      model: "",
      category: "",
      type: "",
      fuel: "",
      transmission: "",
      seats: "",
      doors: "",
      price_per_day: "",
      image: "",
    });
    setBrandQuery("");
    setShowBrandList(false);
    setEditingId(null);
  };

  /* ========================
     ADD / UPDATE
  ======================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not authenticated.");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save car");

      setMessage(editingId ? "Car updated successfully ✅" : "Car added successfully ✅");
      resetForm();
      fetchCars();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ========================
     EDIT
  ======================== */
  const handleEdit = (car) => {
    setEditingId(car.id);
    setForm({ ...car });
    setBrandQuery(car.brand);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ========================
     DELETE (WITH WARNING)
  ======================== */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    setMessage(null);
    setError(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
          "This car cannot be deleted because it has active bookings."
        );
      }

      setMessage("Car deleted successfully ✅");
      fetchCars();
    } catch (err) {
      setError(
        err.message ||
        "This car has bookings and cannot be deleted."
      );
    }
  };

  /* ========================
     PAGINATION
  ======================== */
  const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCars = cars.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /* ========================
     UI
  ======================== */
  return (
    <>
      <h2 className="fw-bold mb-3">Cars Management</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="row g-3 mb-4">

        {/* BRAND */}
        <div className="col-md-4 position-relative">
          <input
            type="text"
            className="form-control"
            placeholder="Search brand..."
            value={brandQuery}
            onChange={(e) => {
              setBrandQuery(e.target.value);
              setShowBrandList(true);
            }}
            onFocus={() => setShowBrandList(true)}
            required
          />

          {showBrandList && brandQuery && (
            <ul className="list-group position-absolute w-100" style={{ maxHeight: 200, overflowY: "auto", zIndex: 1000 }}>
              {brands
                .filter((b) => b.toLowerCase().includes(brandQuery.toLowerCase()))
                .map((b) => (
                  <li
                    key={b}
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, brand: b }));
                      setBrandQuery(b);
                      setShowBrandList(false);
                    }}
                  >
                    {b}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* MODEL */}
        <div className="col-md-4">
          <input
            className="form-control"
            name="model"
            placeholder="Model (e.g. Focus, Clio)"
            value={form.model}
            onChange={handleChange}
            required
          />
        </div>

        {/* CATEGORY */}
        <div className="col-md-4">
          <select className="form-select" name="category" value={form.category} onChange={handleChange} required>
            <option value="">Category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* TYPE */}
        <div className="col-md-4">
          <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
            <option value="">Type</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* FUEL */}
        <div className="col-md-4">
          <select className="form-select" name="fuel" value={form.fuel} onChange={handleChange} required>
            <option value="">Fuel</option>
            {FUELS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>

        {/* TRANSMISSION */}
        <div className="col-md-4">
          <select className="form-select" name="transmission" value={form.transmission} onChange={handleChange} required>
            <option value="">Transmission</option>
            {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* SEATS */}
        <div className="col-md-2">
          <select className="form-select" name="seats" value={form.seats} onChange={handleChange} required>
            <option value="">Seats</option>
            {SEATS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* DOORS */}
        <div className="col-md-2">
          <select className="form-select" name="doors" value={form.doors} onChange={handleChange} required>
            <option value="">Doors</option>
            {DOORS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* PRICE */}
        <div className="col-md-3">
          <input type="number" className="form-control" name="price_per_day" placeholder="Price / day" value={form.price_per_day} onChange={handleChange} required />
        </div>

        {/* IMAGE */}
        <div className="col-md-3">
          <input className="form-control" name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
        </div>

        <div className="col-12">
          <button className="btn btn-dark me-2">
            {editingId ? "Update Car" : "Add Car"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCars.map(car => (
            <tr key={car.id}>
              <td>{car.id}</td>
              <td>{car.brand}</td>
              <td>{car.model}</td>
              <td>€{car.price_per_day}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(car)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(car.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`btn btn-sm me-2 ${currentPage === i + 1 ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
}
