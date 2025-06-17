import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { Container, Card, Form, Button, ListGroup } from "react-bootstrap";
import Swal from "sweetalert2";

function ManageMembers() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [newMember, setNewMember] = useState("");

  const [newRoomName, setNewRoomName] = useState("");

  useEffect(() => {
    document.title = "Manage Room - ChatAPP";
  }, []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) {
      alert("Kamu harus login");
      return navigate("/login");
    }
    setUser(u);
    fetchRoomInfo();
  }, [roomName]);

  const fetchRoomInfo = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await API.get(`/room/detail/${roomName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoomInfo(res.data);
    } catch (err) {
      alert("Gagal mengambil data room");
    }
  };

  const handleAddMember = async () => {
    if (!newMember.trim()) return alert("Username tidak boleh kosong");
    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/room/add-member",
        {
          roomName,
          username: newMember.trim(),
          requester: user.username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Member berhasil ditambahkan");
      setNewMember("");
      fetchRoomInfo();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah member");
    }
  };

  const handleRemoveMember = async (username) => {
    if (!window.confirm(`Yakin ingin menghapus ${username}?`)) return;
    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/room/remove-member",
        {
          roomName,
          username,
          requester: user.username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Member berhasil dihapus");
      fetchRoomInfo();
    } catch (err) {
      alert("Gagal menghapus member");
    }
  };

  const handleDeleteRoom = async () => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus room ini?",
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/room/delete",
        {
          roomName,
          requester: user.username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Room "${roomName}" telah dihapus.`,
        confirmButtonColor: "#3085d6",
      });

      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus Room",
        text: err?.response?.data?.message || "Terjadi kesalahan",
        confirmButtonColor: "#d33",
      });
    }
  };
  const handleRenameRoom = async () => {
    if (!newRoomName.trim()) return alert("Nama baru tidak boleh kosong");

    const token = localStorage.getItem("token");
    try {
      await API.post(
        "/room/rename",
        {
          oldName: roomName,
          newName: newRoomName.trim(),
          requester: user.username,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Nama room berhasil diubah");
      navigate(`/room/${newRoomName.trim()}`); 
    } catch (err) {
      alert("Gagal mengubah nama room");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!roomInfo || !user) return <div className="p-4">Memuat...</div>;

  if (roomInfo.admin !== user.username) {
    return (
      <div className="p-4 text-danger bg-light border rounded">
        <strong>⚠️ Akses Ditolak:</strong> Kamu bukan admin room ini.
        <div className="mt-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            ← Kembali ke Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Kelola Group</h5>
            <small className="text-muted">
              Room: <strong>{roomInfo.name || roomName}</strong>
            </small>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            ← Kembali
          </Button>
        </Card.Header>

        <Card.Body>
          <p>
            <strong>Admin:</strong> {roomInfo.admin}
          </p>
          <p>
            <strong>Tanggal Dibuat:</strong> {formatDate(roomInfo.createdAt)}
          </p>

          <Form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleRenameRoom();
            }}
          >
            <Form.Label>Ubah Nama Room</Form.Label>
            <div className="d-flex">
              <Form.Control
                placeholder="Nama room baru"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
              <Button className="ms-2" type="submit">
                Ubah
              </Button>
            </div>
          </Form>

          <Form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMember();
            }}
          >
            <Form.Label>Tambah Member Baru</Form.Label>
            <div className="d-flex">
              <Form.Control
                placeholder="Masukkan username"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
              <Button className="ms-2" onClick={handleAddMember}>
                Tambah
              </Button>
            </div>
          </Form>

          <h6>Daftar Member:</h6>
          <ListGroup>
            {roomInfo.members.map((m, idx) => (
              <ListGroup.Item
                key={idx}
                className="d-flex justify-content-between align-items-center"
              >
                <span>{m}</span>
                {m !== roomInfo.admin && (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveMember(m)}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>

        <Card.Footer className="text-end">
          <Button variant="danger" size="sm" onClick={handleDeleteRoom}>
            🗑️ Hapus Room
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default ManageMembers;
