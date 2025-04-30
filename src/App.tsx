<<<<<<< HEAD
import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./config/router";

function App() {
  return <RouterProvider router={router}></RouterProvider>;
=======
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Settings from './View/Settings';
import Login from './View/Login';
import Register from './View/Register';
// other imports...

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <button onClick={() => navigate('/settings')}>Settings</button>
      <button onClick={() => navigate('/login')}>Login</button>
      <button onClick={() => navigate('/register')}>Register</button>
      {/* other buttons */}

      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* other routes */}
      </Routes>
    </div>
  );
>>>>>>> 73bafcbdb53abff3e9d1f34d4de0793c8b83ae11
}

export default App;
