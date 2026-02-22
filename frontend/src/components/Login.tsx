import React, { useState } from 'react';
import { registerUser } from '../api';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [dob, setDob] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!dob) {
            setError('Please enter your details');
            return;
        }

        setLoading(true);
        try {
            const user = await registerUser(dob);
            // save to local storage for persistence across reloads
            localStorage.setItem('civic_user_id', user.user_id);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register. Server might be down.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pixel-panel">
            <h1 style={{ color: '#10b981', marginBottom: '20px' }}>CIVIC SENSE</h1>
            <h2>Welcome Player!</h2>
            <p>Enter your Date of Birth to begin</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="date"
                        className="pixel-input"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        disabled={loading}
                    />
                </div>

                {error && <p style={{ color: '#ef4444' }}>{error}</p>}

                <button type="submit" className="pixel-btn" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? 'LOADING...' : 'START ADVENTURE'}
                </button>
            </form>
        </div>
    );
};
