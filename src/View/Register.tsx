import React, { useState } from 'react';
import { fetchEndpoint } from './FetchEndpoint';
import { Alert, AlertTitle } from '@mui/material';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRegister(username, password, email);
    };

    const handleRegister = async (username: string, password: string, email: string) => {
        try {
            const response = await fetchEndpoint('auth/register', 'POST', null, { username, password, email });

            if (!response.ok) {
                const errorData = await response.json();
                setAlertMessage(`Registration failed: ${errorData.message}`);
                setAlertSeverity('error');
                return;
            }

            const data = await response.json();
            setAlertMessage('Registration successful!');
            setAlertSeverity('success');
            console.log('Registered user:', data);
        } catch (error) {
            setAlertMessage('An error occurred during registration. Please try again later.');
            setAlertSeverity('error');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form
                onSubmit={handleSubmit}
                style={{
                    width: '300px',
                    padding: '20px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    backgroundColor: '#fff',
                }}
            >
                <h2 style={{ textAlign: 'center' }}>Register</h2>
                {alertMessage && alertSeverity && (
                    <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                        <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        {alertMessage}
                    </Alert>
                )}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                        Email
                    </label>
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
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;