import React, { useState } from "react";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
  FaImage,
  FaLock,
  FaIdCard,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../api";
import "./css/Register.css";

function Register() {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    profilePic: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.username.length < 4) {
      newErrors.username = "Username minimal 4 karakter";
    }

    if (form.password.length < 3) {
      newErrors.password = "Password minimal 3 karakter";
    }

    if (!/^\d+$/.test(form.phone)) {
      newErrors.phone = "Nomor telepon hanya boleh angka";
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await API.post("/auth/register", form);
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil",
        text: "Akun Anda telah dibuat. Silakan login.",
        showConfirmButton: false,
        timer: 2000,
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registrasi Gagal",
        text:
          err?.response?.data?.message || "Terjadi kesalahan saat mendaftar",
      });
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
      <div className="login-card shadow-lg text-center">
        <img
          src="/chatapp.png"
          alt="Logo Aplikasi"
          style={{ width: "150px", marginBottom: "10px" }}
        />
        <h3 className="text-center mb-4 fw-bold">Daftar Akun Baru</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-3 position-relative">
            <FaUserAlt className="login-icon" />
            <input
              type="text"
              className={`form-control ps-5 ${errors.username && "is-invalid"}`}
              name="username"
              placeholder="Username (min 4 karakter)"
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>
          <div className="form-group mb-3 position-relative">
            <FaIdCard className="login-icon" />
            <input
              type="text"
              className="form-control ps-5"
              name="fullName"
              placeholder="Nama Lengkap"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3 position-relative">
            <FaEnvelope className="login-icon" />
            <input
              type="email"
              className={`form-control ps-5 ${errors.email && "is-invalid"}`}
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="form-group mb-3 position-relative">
            <FaPhoneAlt className="login-icon" />
            <input
              type="text"
              className={`form-control ps-5 ${errors.phone && "is-invalid"}`}
              name="phone"
              placeholder="No Telepon"
              value={form.phone}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              required
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>
          <div className="form-group mb-3 position-relative">
            <FaBirthdayCake className="login-icon" />
            <input
              type="date"
              className="form-control ps-5"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group mb-3 position-relative">
            <FaImage className="login-icon" />
            <input
              type="text"
              className="form-control ps-5"
              name="profilePic"
              placeholder="URL Foto Profil (opsional)"
              value={form.profilePic}
              onChange={handleChange}
            />
          </div>
          <div className="form-group mb-4 position-relative">
            <FaLock className="login-icon" />
            <input
              type="password"
              className={`form-control ps-5 ${errors.password && "is-invalid"}`}
              name="password"
              placeholder="Password (min 3 karakter)"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-hover">
            Register
          </button>
        </form>
        <div className="text-center mt-3">
          Sudah punya akun?{" "}
          <button
            className="btn btn-link p-0"
            onClick={() => navigate("/login")}
          >
            Login di sini
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
