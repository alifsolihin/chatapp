import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Row, Col, Button, Badge } from "react-bootstrap";
import "./css/Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profil - ChatAPP";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = JSON.parse(localStorage.getItem("user"));
    if (!token || !u) return navigate("/login");
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  return (
    <Container className="profile-container py-4">
      <Card className="profile-card shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4} className="text-center mb-4 mb-md-0">
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.fullName || user.username
                  )}&background=random&rounded=true&size=100`
                }
                alt="profile"
                className="profile-image shadow"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <h5 className="mt-3 fw-bold">{user.fullName}</h5>
              <Badge bg="primary" className="mb-2">
                {user.username}
              </Badge>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => navigate("/")}
                >
                  ← Kembali ke Home
                </Button>
              </div>
            </Col>

            <Col md={8}>
              <div className="profile-info">
                <p>
                  <strong>Email:</strong> <span>{user.email}</span>
                </p>
                <p>
                  <strong>No Telepon:</strong> <span>{user.phone || "-"}</span>
                </p>
                <p>
                  <strong>Tanggal Lahir:</strong>{" "}
                  <span>{user.birthDate || "-"}</span>
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Profile;
