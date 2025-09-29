import React, { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import styles from "@/styles/register.module.css";
import useBearStore from "@/store/useBearStore";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const router = useRouter();
  const login = useBearStore((state) => state.login);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.detail || "Login failed");
      }

      // Store user in Zustand state
      login({ username: form.username });

      // Success alert
      Swal.fire({
        title: "Success!",
        text: result.message || "Logged in successfully!",
        icon: "success",
        confirmButtonText: "Continue",
      }).then(() => {
        router.push("/Home");
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
