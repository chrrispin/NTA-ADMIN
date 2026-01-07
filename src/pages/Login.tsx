import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/adminApi';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(authApi.getRememberedEmail() || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!authApi.getRememberedEmail());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMessage, setReqMessage] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with email:', email);
      const response = await authApi.login(email.trim(), password);
      console.log('Login response:', response);
      if (response.success) {
        if (rememberMe) {
          authApi.setRememberedEmail(email.trim());
        } else {
          authApi.clearRememberedEmail();
        }
        navigate('/admin', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1>Sign In</h1>
              <p>Enter your email and password to sign in!</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            </form>

            <div className={styles.footer}>
              {!showRequestForm ? (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => {
                      setShowRequestForm(true);
                      setReqEmail(email || '');
                      setReqName('');
                      setReqMessage('');
                      setReqError(null);
                      setReqSuccess(null);
                    }}
                  >
                    Request it from admin
                  </button>
                </p>
              ) : (
                <div className={styles.requestForm}>
                  {reqSuccess ? (
                    <div className={styles.requestSuccess}>{reqSuccess}</div>
                  ) : (
                    <>
                      {reqError && <div className={styles.error}>{reqError}</div>}
                      <div className={styles.formGroup}>
                        <label>Name</label>
                        <input value={reqName} onChange={e => setReqName(e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input value={reqEmail} onChange={e => setReqEmail(e.target.value)} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Message (optional)</label>
                        <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} rows={3} />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          type="button"
                          className={styles.submitBtn}
                          onClick={async () => {
                            setReqError(null);
                            if (!reqName.trim() || !reqEmail.trim()) {
                              setReqError('Name and email are required');
                              return;
                            }
                            try {
                              setReqLoading(true);
                              const resp = await fetch('/api/auth/request-access', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: reqName, email: reqEmail, message: reqMessage })
                              });
                              const json = await resp.json().catch(() => null);
                              if (!resp.ok) {
                                setReqError((json && json.message) || `Request failed (Status: ${resp.status})`);
                                return;
                              }
                              setReqSuccess((json && json.message) || 'Request submitted');
                              setReqName(''); setReqEmail(''); setReqMessage('');
                            } catch (err) {
                              console.error('Request access error:', err);
                              setReqError('Failed to submit request');
                            } finally { setReqLoading(false); }
                          }}
                          disabled={reqLoading}
                        >
                          {reqLoading ? 'Sending...' : 'Send Request'}
                        </button>
                        <button type="button" className={styles.cancelBtn} onClick={() => setShowRequestForm(false)}>Cancel</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className={styles.right}>
          <div className={styles.brandCenter}>
            <div className={styles.brandLogo}>
              <img src="/ad.PNG" alt="NTA logo" className='w-12 h-12' />
            </div>
            <div className={styles.brandName}>New Time Africa</div>
            <div className={styles.brandTag}>delivering timely and trustworthy news from across the continent.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

