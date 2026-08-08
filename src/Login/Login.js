// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { loginUser } from '../Services/LoginService';
// import './Login.css';

// function Login() {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!username.trim() && !password.trim()) {
//             setError('Please enter username and password.');
//             return;
//         }

//         if (!username.trim()) {
//             setError('Please enter username.');
//             return;
//         }

//         if (!password.trim()) {
//             setError('Please enter password.');
//             return;
//         }

//         setError('');
//         setLoading(true);

//         try {
//             await loginUser(username, password);
//             navigate('/dashboard');
//         } catch (err) {
//             setError(err.message || 'Something went wrong.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="login-page">
//             <div className="login-card">
//                 <div className="login-card-header">
//                     <div className="icon-shell">
//                         <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V7a3 3 0 016 0v4h-6z" />
//                         </svg>
//                     </div>
//                     <h2>Welcome back</h2>
//                     <p>Sign in to your inventory account</p>
//                 </div>
//                 <form className="login-card-body" onSubmit={handleSubmit} noValidate autoComplete="off">
//                     <input type="text" name="username" autoComplete="off" tabIndex="-1" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, border: 'none', padding: 0, margin: 0 }} />
//                     <input type="password" name="password" autoComplete="new-password" tabIndex="-1" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, border: 'none', padding: 0, margin: 0 }} />
//                     {error ? (
//                         <div className="login-error">
//                             {error}
//                         </div>
//                     ) : null}

//                     <div className="login-field">
//                         <label htmlFor="username">Username</label>
//                         <input
//                             type="text"
//                             id="username"
//                             name="loginUsername"
//                             autoComplete="off"
//                             value={username}
//                             onChange={(event) => {
//                                 setUsername(event.target.value);
//                                 if (error) setError('');
//                             }}
//                             placeholder="Enter your username"
//                             className="login-input"
//                         />
//                     </div>

//                     <div className="login-field password-field">
//                         <label htmlFor="password">Password</label>
//                         <input
//                             type={showPassword ? 'text' : 'password'}
//                             id="password"
//                             name="loginPassword"
//                             autoComplete="new-password"
//                             value={password}
//                             onChange={(event) => {
//                                 setPassword(event.target.value);
//                                 if (error) setError('');
//                             }}
//                             placeholder="Enter your password"
//                             className="login-input"
//                         />
//                         <button
//                             type="button"
//                             className="password-toggle"
//                             onClick={() => setShowPassword((prev) => !prev)}
//                             aria-label={showPassword ? 'Hide password' : 'Show password'}
//                         >
//                             {showPassword ? (
//                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
//                                     <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.27-3.2-11-7.5a10.94 10.94 0 0 1 2.15-3.49" />
//                                     <path d="M1 1l22 22" />
//                                     <path d="M9.53 9.53A3 3 0 0 0 14.47 14.47" />
//                                     <path d="M12 5c2.53 0 4.71.99 6.36 2.6" />
//                                 </svg>
//                             ) : (
//                                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
//                                     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                                     <circle cx="12" cy="12" r="3" />
//                                 </svg>
//                             )}
//                         </button>
//                     </div>

//                     <button type="submit" className="login-button">
//                         Login
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../Services/LoginService';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Basic Client Validations
        if (!username.trim() && !password.trim()) {
            setError('Please enter username and password.');
            return;
        }

        if (!username.trim()) {
            setError('Please enter username.');
            return;
        }

        if (!password.trim()) {
            setError('Please enter password.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // FR-01: Authenticate against service endpoint
            const response = await loginUser(username, password);

            // Handle both structure scenarios (direct token string or JSON response object)
            const token = response.token || response;
            const role = response.role || 'STORE_OPERATOR'; // Default fallback role

            // FR-01: Store JWT Token and Expiry Timestamp (8 Hours = 28,800,000 ms)
            const expiryTime = new Date().getTime() + 8 * 60 * 60 * 1000;
            localStorage.setItem('token', token);
            localStorage.setItem('token_expiry', expiryTime);

            // FR-05: Store User Role for UI capability checks
            localStorage.setItem('user_role', role);

            // Redirect to dashboard on successful auth
            navigate('/dashboard');
        } catch (err) {
            // FR-05: Handle Error messaging
            setError(err.message || 'Invalid username or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-card-header">
                    <div className="icon-shell">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm3-10V7a3 3 0 016 0v4h-6z" />
                        </svg>
                    </div>
                    <h2>Welcome back</h2>
                    <p>Sign in to your inventory account</p>
                </div>

                <form className="login-card-body" onSubmit={handleSubmit} noValidate autoComplete="off">
                    {/* Hidden inputs to prevent aggressive browser autofill */}
                    <input type="text" name="username" autoComplete="off" tabIndex="-1" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, border: 'none', padding: 0, margin: 0 }} />
                    <input type="password" name="password" autoComplete="new-password" tabIndex="-1" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, border: 'none', padding: 0, margin: 0 }} />

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="loginUsername"
                            autoComplete="off"
                            disabled={loading}
                            value={username}
                            onChange={(event) => {
                                setUsername(event.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter your username"
                            className="login-input"
                        />
                    </div>

                    <div className="login-field password-field">
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="loginPassword"
                            autoComplete="new-password"
                            disabled={loading}
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter your password"
                            className="login-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.27-3.2-11-7.5a10.94 10.94 0 0 1 2.15-3.49" />
                                    <path d="M1 1l22 22" />
                                    <path d="M9.53 9.53A3 3 0 0 0 14.47 14.47" />
                                    <path d="M12 5c2.53 0 4.71.99 6.36 2.6" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;