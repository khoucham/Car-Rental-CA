import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";

import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+353");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: `${countryCode}${phone}`,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // 🔐 Auto-login after register
      login(data);

      navigate("/");
    } catch (err) {
      console.error("Register error:", err.message);
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: 420 }}>
      <Card className="p-4 shadow">
        <h4 className="mb-3 text-center">Create Account</h4>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleRegister}>
          <Form.Control
            className="mb-3"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <Form.Control
            className="mb-3"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <InputGroup className="mb-3">
            <Form.Select
              style={{ maxWidth: 120 }}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+353">🇮🇪 +353</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+212">🇲🇦 +212</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
            </Form.Select>

            <Form.Control
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </InputGroup>

          <Form.Control
            className="mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Form.Control
            className="mb-4"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </Form>

        <div className="small text-muted mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Card>
    </Container>
  );
}

export default Register;
