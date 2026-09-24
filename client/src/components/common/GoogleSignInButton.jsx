import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { AlertCircle, RefreshCw, Info, KeyRound } from 'lucide-react';

const GoogleSignInButton = ({ role = 'STUDENT', onSuccess, onError, text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
  const [isClientIdChecked, setIsClientIdChecked] = useState(false);
  const googleBtnContainerRef = useRef(null);

  // Helper to validate Google Client ID format
  const isValidClientId = (id) => {
    if (!id || typeof id !== 'string') return false;
    const trimmed = id.trim();
    return (
      trimmed.length > 20 &&
      trimmed.endsWith('.apps.googleusercontent.com') &&
      !trimmed.toLowerCase().includes('example') &&
      !trimmed.toLowerCase().includes('dummy')
    );
  };

  // Fetch Google Client ID from backend if not bundled in frontend env
  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      if (isValidClientId(clientId)) {
        setIsClientIdChecked(true);
        return;
      }

      try {
        const res = await authService.getEmailStatus();
        if (isMounted && res.data?.googleClientId) {
          setClientId(res.data.googleClientId);
        }
      } catch (err) {
        console.warn('Could not fetch Google Client ID from backend:', err);
      } finally {
        if (isMounted) {
          setIsClientIdChecked(true);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setErrorMessage('Google authentication was cancelled or returned no credentials.');
      if (onError) onError('Google authentication was cancelled.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const user = await googleLogin(response.credential, role);
      if (onSuccess) onSuccess(user);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Google authentication failed. Please ensure you are using your official ACET college account (@acetcbe.edu.in).';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isValidClientId(clientId)) return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId.trim(),
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Clear previous render if any
          googleBtnContainerRef.current.innerHTML = '';

          // Render official Google button into container
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'continue_with',
            logo_alignment: 'left',
            width: googleBtnContainerRef.current.offsetWidth || 340
          });
        } catch (e) {
          console.warn('Google Identity Services initialization notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGsi();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [clientId, role]);

  const hasValidConfig = isValidClientId(clientId);

  return (
    <div style={{ width: '100%' }}>
      {errorMessage && (
        <div className="alert-box alert-error" style={{ marginBottom: '0.85rem', fontSize: '0.8rem' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {hasValidConfig ? (
        /* Rendered official Google Identity button */
        <div
          ref={googleBtnContainerRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            minHeight: '44px',
            overflow: 'hidden'
          }}
        />
      ) : (
        /* Informational button / setup card when GOOGLE_CLIENT_ID is not configured in Vercel environment */
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              marginBottom: '0.25rem'
            }}
          >
            {/* Google SVG Logo */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (@acetcbe.edu.in)</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
            Set <code>GOOGLE_CLIENT_ID</code> in Vercel Environment Variables to activate live Google Cloud OAuth.
          </p>
        </div>
      )}

      {loading && (
        <div
          style={{
            marginTop: '0.5rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <RefreshCw size={14} className="animate-spin" />
          <span>Validating Google account &amp; permissions...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
