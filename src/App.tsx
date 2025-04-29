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
}

export default App;
