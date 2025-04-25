import React, { useState } from "react";
import { Link } from "react-router-dom"; // 🛑 ganti dari 'react-router' ke 'react-router-dom'
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Bisa dihapus kalau nggak dipakai login
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Check your credentials.");
      }

      const data = await response.json();
      console.log("Login success:", data);

      // Simpan token / session (jika ada)
      // localStorage.setItem("token", data.token);

      // Redirect ke halaman dashboard misalnya
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="w-96 bg-white p-6 rounded shadow-md">
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>

      <p className="mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
};
