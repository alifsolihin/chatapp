// ChatRoom.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Container, Card, Form, Button, InputGroup } from "react-bootstrap";
import "./css/ChatRoom.css";
import EmojiPicker from "emoji-picker-react";
import { FaSmile, FaCrown } from "react-icons/fa";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekday);
dayjs.locale("id");

const socket = io("http://localhost:5000");

function ChatRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    const prevTitle = document.title;

    if (roomName) {
      document.title = `Room ${roomName} - ChatAPP`;
    }

    return () => {
      document.title = prevTitle;
    };
  }, [roomName]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;
    setUser(u);

    socket.emit("joinRoom", { room: roomName, user: u.username });

    socket.on("roomMessages", (msgs) => {
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 100);
    });

    socket.on("messageEdited", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? updatedMsg : msg))
      );
    });

    return () => {
      socket.emit("leaveRoom", { room: roomName, user: u.username });
      socket.off("roomMessages");
      socket.off("onlineUsers");
      socket.off("newMessage");
      socket.off("messageEdited");
    };
  }, [roomName]);

  useEffect(() => {
    socket.on("userTyping", (username) => {
      if (username !== user?.username) {
        setTypingUser(username);
      }
    });

    socket.on("userStopTyping", (username) => {
      if (username !== user?.username) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [typingUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msgData = {
      room: roomName,
      sender: user.username,
      content: message.trim(),
      replyTo,
      createdAt: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
    setReplyTo(null);
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setMessage(msg.content);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit("editMessage", {
      id: editingMessage._id,
      content: message.trim(),
      edited: true,
    });

    setEditingMessage(null);
    setMessage("");
  };

  const formatDateSeparator = (date) => {
    const d = dayjs(date);
    if (d.isToday()) return "Hari Ini";
    if (d.isYesterday()) return "Kemarin";
    if (d.isSameOrAfter(dayjs().startOf("week"))) {
      return d.format("dddd");
    }
    return d.format("D MMMM YYYY");
  };

  let lastDateSeparator = null;

  useEffect(() => {
    const fetchRoomInfo = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:5000/room/detail/${roomName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setRoomInfo(data);
      } catch (err) {
        console.error("Gagal mengambil room info:", err);
      }
    };

    fetchRoomInfo();
  }, [roomName]);

  //
  useEffect(() => {
    if (!user) return;

    messages.forEach((msg) => {
      if (
        msg.sender !== user.username &&
        !msg.readBy?.includes(user.username)
      ) {
        socket.emit("messageRead", {
          messageId: msg._id,
          username: user.username,
        });
      }
    });
  }, [messages, user]);

  useEffect(() => {
    socket.on("messageReadUpdate", ({ messageId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, readBy } : msg))
      );
    });

    return () => {
      socket.off("messageReadUpdate");
    };
  }, []);

  useEffect(() => {
    socket.emit("markAsRead", {
      room: roomName,
      username: user?.username,
    });
  }, [messages]);


  return (
    <Container className="mt-4">
      <Card className="shadow">
        <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              ← Kembali
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/room/${roomName}/manage-members`)}
            >
              Kelola Room
            </Button>
          </div>
          <div className="text-center flex-grow-1 fw-bold fs-6">
            <span className="text-primary">{roomName}</span>
          </div>
          <div className="position-relative d-inline-block group-online">
            <span className="badge bg-success text-white small px-2 py-1 rounded-pill">
              👥 {onlineUsers.length} Online
            </span>
            <div className="online-tooltip">
              <ul className="ps-3 mb-0">
                {user && (
                  <li className="d-flex align-items-center gap-2">
                    <span>
                      {user.username}{" "}
                      <span className="text-primary">(Anda)</span>
                    </span>
                    {roomInfo?.admin === user.username ? (
                      <span className="text-warning d-flex align-items-center gap-1">
                        <FaCrown /> Admin
                      </span>
                    ) : (
                      <span className="text-muted">Member</span>
                    )}
                  </li>
                )}

                {onlineUsers
                  .filter((u) => user && u !== user.username)
                  .map((u) => (
                    <li key={u} className="d-flex align-items-center gap-2">
                      <span>{u}</span>
                      {roomInfo?.admin === u ? (
                        <span className="text-warning d-flex align-items-center gap-1">
                          <FaCrown /> Admin
                        </span>
                      ) : (
                        <span className="text-muted">Member</span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card.Header>

        <div className="text-muted small text-center py-2">
          Total pesan: {messages.length}
        </div>

        <Card.Body
          style={{
            height: "70vh",
            overflowY: "auto",
            background: "#f1f3f5",
            padding: "1rem",
          }}
          className="chat-body"
        >
          
          {messages.map((msg, i) => {
            const me = msg.sender === user?.username;
            const prev = i > 0 ? messages[i - 1] : null;
            const showSender = !prev || prev.sender !== msg.sender;

            const currentDate = dayjs(msg.createdAt).format("YYYY-MM-DD");
            const prevDate = prev
              ? dayjs(prev.createdAt).format("YYYY-MM-DD")
              : null;

            const showDateSeparator = currentDate !== prevDate;
            const dateSeparatorText = formatDateSeparator(msg.createdAt);

            const avatarUrl =
              msg.profilePic ||
              `https://ui-avatars.com/api/?name=${msg.sender}&background=random&rounded=true&size=32`;

            return (
              <React.Fragment key={i}>
                {showDateSeparator && (
                  <div className="date-separator-wrapper">
                    <div className="date-separator-line" />
                    <div className="date-separator-text">
                      📅 {dateSeparatorText}
                    </div>
                    <div className="date-separator-line" />
                  </div>
                )}

                <div
                  className={`d-flex ${
                    me ? "justify-content-end" : "justify-content-start"
                  } mb-1 align-items-end`}
                >
                  {!me && (
                    <div
                      style={{ width: "36px" }}
                      className="me-2 d-flex justify-content-center"
                    >
                      {showSender ? (
                        <img
                          src={avatarUrl}
                          alt={msg.sender}
                          className="rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div style={{ width: "32px", height: "32px" }}></div>
                      )}
                    </div>
                  )}

                  <div
                    onClick={() =>
                      me
                        ? handleEdit(msg)
                        : setReplyTo({
                            sender: msg.sender,
                            content: msg.content,
                          })
                    }
                    title={me ? "Klik untuk mengedit" : "Klik untuk membalas"}
                    className={`chat-bubble ${me ? "me" : "other"}`}
                    style={{
                      backgroundColor: me ? "#0d6efd" : "#ffffff",
                      color: me ? "white" : "black",
                      borderRadius: "12px",
                      padding: "10px",
                      maxWidth: "75%",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    {showSender && !me && (
                      <div className="fw-bold mb-1 text-dark">{msg.sender}</div>
                    )}

                    {msg.replyTo && (
                      <div
                        className="p-2 mb-2"
                        style={{
                          borderLeft: "4px solid #0d6efd",
                          backgroundColor: me
                            ? "rgba(255,255,255,0.2)"
                            : "#f1f1f1",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div className="fw-semibold">{msg.replyTo.sender}</div>
                        <div className="text-muted">{msg.replyTo.content}</div>
                      </div>
                    )}

                    <div>{msg.content}</div>

                    <div className="small text-muted text-end mt-1 d-flex justify-content-end align-items-center gap-1">
                      <span>{formatTime(msg.createdAt)}</span>

                      {me && (
                        <span
                          style={{ fontSize: "0.9rem" }}
                          title={
                            msg.readBy && msg.readBy.length > 1
                              ? `Dibaca oleh: ${msg.readBy
                                  .filter((u) => u !== user.username)
                                  .join(", ")}`
                              : "Belum dibaca orang lain"
                          }
                        >
                          {msg.readBy && msg.readBy.length > 1 ? "✓✓" : "✓"}
                        </span>
                      )}

                      {msg.edited && (
                        <span
                          className="fst-italic ms-1"
                          title={`Diedit ${formatTime(msg.editedAt)}`}
                        >
                          (edited)
                        </span>
                      )}
                    </div>
                  </div>

                  {me && (
                    <div
                      style={{ width: "36px" }}
                      className="ms-2 d-flex justify-content-center"
                    >
                      {showSender ? (
                        <img
                          src={user?.profilePic || avatarUrl}
                          alt="me"
                          className="rounded-circle"
                          style={{
                            width: "32px",
                            height: "32px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div style={{ width: "32px", height: "32px" }}></div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {typingUser && (
            <div className="d-flex justify-content-start mb-2">
              <div className="typing-indicator px-3 py-2 rounded-pill bg-light text-muted small fst-italic">
                💬 {typingUser} sedang mengetik
                <span className="dot-flash">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </Card.Body>

        <Card.Footer className="bg-light" style={{ padding: "1rem" }}>
          {replyTo && (
            <div
              className="border-start ps-2 mb-2"
              style={{ borderColor: "#0d6efd" }}
            >
              <div className="small fw-bold">{replyTo.sender}</div>
              <div
                className="small text-muted text-truncate"
                style={{ maxWidth: "90%" }}
              >
                {replyTo.content}
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-danger"
                onClick={() => setReplyTo(null)}
              >
                Batalkan
              </Button>
            </div>
          )}

          <Form onSubmit={editingMessage ? handleUpdate : handleSend}>
            <div className="position-relative">
              <InputGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <FaSmile />
                </Button>

                <Form.Control
                  placeholder="Ketik pesan..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    socket.emit("typing", {
                      room: roomName,
                      user: user.username,
                    });
                    if (typingTimeoutRef.current)
                      clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      socket.emit("stopTyping", {
                        room: roomName,
                        user: user.username,
                      });
                    }, 300);
                  }}
                />

                <Button type="submit" variant="primary">
                  {editingMessage ? "Update" : "Kirim"}
                </Button>
              </InputGroup>

              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "0",
                    zIndex: 1000,
                  }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiData) =>
                      setMessage((prev) => prev + emojiData.emoji)
                    }
                    height={300}
                    width={280}
                    autoFocusSearch={false}
                  />
                </div>
              )}

              {editingMessage && (
                <div className="mt-2">
                  <span className="text-muted small">
                    Mengedit pesan: <strong>{editingMessage.content}</strong>
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger ms-2"
                    onClick={() => {
                      setEditingMessage(null);
                      setMessage("");
                    }}
                  >
                    Batalkan
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default ChatRoom;
