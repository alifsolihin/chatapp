import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Button, Form, Spinner, Badge } from "react-bootstrap";
import API from "../api";
import {
  FaUserCircle,
  FaPlusCircle,
  FaSignOutAlt,
  FaComments,
} from "react-icons/fa";
import "./css/Home.css";
import io from "socket.io-client";
import Swal from "sweetalert2";

const socket = io("http://localhost:5000");

function Home() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Home - ChatAPP";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = JSON.parse(localStorage.getItem("user"));
    if (!token || !u) return navigate("/login");
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchRooms(user.username);
    }
  }, [user]);

  const fetchRooms = async (username) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get(`/room/list?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);

      res.data.forEach((room) => {
        socket.emit("getUnreadCount", {
          room: room.name,
          username: username,
        });
      });
    } catch (err) {
      console.error("Gagal memuat room:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/room/create",
        { name: roomName, admin: user.username },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Room Berhasil Dibuat",
        text: `Room dengan nama "${roomName}" berhasil dibuat!`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Oke",
      });
      setRoomName("");
      fetchRooms(user.username);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Membuat Room",
        text: err?.response?.data?.message || "Terjadi kesalahan",
        confirmButtonColor: "#d33",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const handleUnreadCount = ({ room, count }) => {
      console.log("📨 Unread count received:", room, count);
      setUnreadCounts((prev) => ({ ...prev, [room]: count }));
    };

    const handleNewMessage = (msg) => {
      if (msg.sender !== user.username) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.room]: (prev[msg.room] || 0) + 1,
        }));
      }
    };

    const handleMessageReadUpdate = ({ room }) => {
      if (user?.username && room) {
        socket.emit("getUnreadCount", {
          room,
          username: user.username,
        });
      }
    };

    socket.on("unreadCount", handleUnreadCount);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageReadUpdate", handleMessageReadUpdate);

    return () => {
      socket.off("unreadCount", handleUnreadCount);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageReadUpdate", handleMessageReadUpdate);
    };
  }, [user]);

  return (
    <Container fluid className="home-wrapper px-4 py-4">
      <Card className="mb-4 shadow-sm border-0 app-header-card">
        <Card.Body className="d-flex align-items-center bg-light rounded-3 py-3 px-4">
          <img
            src="/chatapp.png"
            alt="Logo ChatAPP"
            style={{ width: "150px", height: "70px", marginRight: "15px" }}
          />
          <h4 className="mb-0 fw-bold text-primary"> Website ChatAPP</h4>
        </Card.Body>
      </Card>
      <div className="home-layout">
        <div className="sidebar-left">
          {user && (
            <Card className="profile-card shadow-sm mb-4">
              <Card.Body className="d-flex flex-column align-items-center text-center">
                <img
                  src={
                    user.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.fullName || user.username
                    )}&background=random&rounded=true&size=100`
                  }
                  alt="profile"
                  className="rounded-circle mb-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <h5 className="mb-0 fw-bold">{user.fullName}</h5>
                <p className="text-muted small">@{user.username}</p>
                <Link
                  to="/profile"
                  className="btn btn-outline-primary btn-sm mb-2 w-100"
                >
                  <FaUserCircle className="me-1" /> Lihat Profil
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-100"
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3 fw-bold text-primary">
                <FaPlusCircle className="me-2" />
                Buat Room Baru
              </h6>
              <Form onSubmit={handleAddRoom}>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Nama Room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" className="w-100">
                  Tambah Room
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>

        <div className="main-content">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-dark">Daftar Room</h4>
          </div>

          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
            </div>
          ) : rooms.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-muted text-center">
                Belum ada room tersedia.
              </Card.Body>
            </Card>
          ) : (
            <div className="d-flex flex-column gap-3">
              {rooms.map((room) => (
                <Card
                  key={room._id}
                  className="room-card shadow-sm"
                  onClick={() => navigate(`/room/${room.name}`)}
                  style={{ cursor: "pointer", transition: "0.2s" }}
                >
                  <Card.Body className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <FaComments className="text-primary fs-4 me-3" />
                      <div>
                        <h6 className="mb-0 fw-semibold text-primary">
                          {room.name}
                        </h6>
                        <small className="text-muted">Klik untuk masuk</small>
                      </div>
                    </div>
                    {Number(unreadCounts[room.name]) > 0 && (
                      <Badge bg="danger" pill>
                        {unreadCounts[room.name]}
                      </Badge>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Home;
