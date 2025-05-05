import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEndpoint } from './FetchEndpoint';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const data = await fetchEndpoint('/auth/login', 'POST', null, { email, password });
            
            localStorage.removeItem('token');
            
            localStorage.setItem('token', data.token);
            
            if (data.expiresAt) {
                localStorage.setItem('tokenExpires', data.expiresAt);
            }
            
            console.log('Successfully logged in and stored token');
            
            // Redirect
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                setErrorMsg(error.message || 'An error occurred during login');
            } else {
                setErrorMsg('An error occurred during login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h2 style={{ textAlign: 'center' }}>Login</h2>
                {errorMsg && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{errorMsg}</div>}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                    <span>Don't have an account? </span>
                    <a 
                        href="/register" 
                        style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/register');
                        }}
                    >
                        Register
                    </a>
                </div>
                <button 
                    type="submit" 
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: '#007BFF', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer' 
                    }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;