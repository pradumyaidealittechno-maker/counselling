import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import api from '../services/api';

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || {}; // Get email from navigation state

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.auth.verifyOtp(email, otp);
            setSuccess('Email verified successfully!');

            // Redirect to onboarding after a brief success message
            setTimeout(() => {
                navigate('/onboarding');
            }, 1000);

        } catch (err: any) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.auth.resendOtp(email);
            setSuccess('OTP resent successfully. Please check your email.');
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #faf5ff 100%)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                padding: '3rem',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/signup')}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        left: '2rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'rgba(233, 30, 99, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#E91E63'
                    }}>
                        <Mail size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                        Verify your email
                    </h1>
                    <p style={{ color: '#6b7280' }}>
                        We've sent a 6-digit verification code to<br />
                        <strong style={{ color: '#374151' }}>{email}</strong>
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#DC2626'
                    }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </div>
                )}

                {success && (
                    <div style={{
                        background: '#ECFDF5',
                        border: '1px solid #6EE7B7',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#059669'
                    }}>
                        <CheckCircle size={18} />
                        <span style={{ fontSize: '0.875rem' }}>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                            Enter Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => {
                                // Only allow numbers and max 6 chars
                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                setOtp(val);
                            }}
                            placeholder="000000"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.5rem',
                                letterSpacing: '0.5rem',
                                textAlign: 'center',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.75rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #E91E63 0%, #6366F1 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)'
                        }}
                    >
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Didn't receive the code?
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || loading}
                            style={{
                                color: resendCooldown > 0 ? '#9CA3AF' : '#E91E63',
                                background: 'none',
                                border: 'none',
                                fontWeight: 600,
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                            <RefreshCw size={14} className={loading && resendCooldown === 0 ? 'animate-spin' : ''} />
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
