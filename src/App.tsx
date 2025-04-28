import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Settings from './View/Settings';
// other imports...

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <button onClick={() => navigate('/settings')}>Settings</button>

      <Routes>
        <Route path="/settings" element={<Settings />} />
        {/* other routes */}
      </Routes>
    </div>
  );
}

export default App;
