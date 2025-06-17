import React, { useState, useEffect } from "react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";
import "./css/Login.css";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - ChatAPP";
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      Swal.fire({
        icon: "success",
        title: `Selamat datang, ${res.data.user.username}!`,
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/");
    } catch (err) {
      const errorMessage =
        err?.response?.status === 401
          ? "Username atau password Anda salah"
          : err?.response?.data?.message || "Terjadi kesalahan saat login";

      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: errorMessage,
      });
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-card shadow-lg text-center">
        <img
          src="/chatapp.png"
          alt="Logo"
          style={{ width: "250px", marginBottom: "15px" }}
        />

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3 position-relative">
            <FaUserAlt className="login-icon" />
            <input
              name="username"
              className="form-control ps-5"
              placeholder="Username"
              onChange={handleChange}
              value={form.username}
              required
            />
          </div>
          <div className="form-group mb-4 position-relative">
            <FaLock className="login-icon" />
            <input
              name="password"
              type="password"
              className="form-control ps-5"
              placeholder="Password"
              onChange={handleChange}
              value={form.password}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-hover">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          <span>Belum punya akun? </span>
          <button
            className="btn btn-link p-0"
            onClick={() => navigate("/register")}
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
