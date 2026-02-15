import React from "react";

function Footer() {
  return (
    <footer className="bg-light text-dark border-top">
      <div className="container py-3">
        <div className="row">

          {/* Brand */}
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold">Quick Rent</h5>
            <p className="text-muted mb-0">
              Simple & reliable car rental service.
            </p>
          </div>

          {/* Links */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="/" className="text-muted text-decoration-none">Home</a>
              </li>
              <li>
                <a href="/cars" className="text-muted text-decoration-none">Cars</a>
              </li>
              <li>
                <a href="/bookings" className="text-muted text-decoration-none">My Bookings</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted mb-1">📧 support@quickrent.com</p>
            <p className="text-muted mb-0">📞 +212 600 000 000</p>
          </div>

        </div>

        <hr className="my-2" />

        <p className="text-center text-muted mb-0">
          © {new Date().getFullYear()} Quick Rent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
