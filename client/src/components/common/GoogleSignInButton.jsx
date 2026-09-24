import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

const GoogleSignInButton = ({ role = 'STUDENT', onSuccess, onError, text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnContainerRef = useRef(null);

  // Default / environment Google Client ID
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '1084293847291-exampleclientidforcollegeauth.apps.googleusercontent.com';

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
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Identity Services if available on window
    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

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
  }, [googleClientId, role]);

  const triggerGooglePrompt = () => {
    setErrorMessage('');
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Find rendered Google iframe/button and trigger click
            const btn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
            if (btn) btn.click();
          }
        });
      } catch (err) {
        console.warn('Google prompt fallback:', err);
      }
    } else {
      setErrorMessage('Google Sign-In service is connecting. Please check your internet connection or try again.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {errorMessage && (
        <div className="alert-box alert-error" style={{ marginBottom: '0.85rem', fontSize: '0.8rem' }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden/Mounted official Google button element for native GSI callback handling */}
      <div
        ref={googleBtnContainerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          minHeight: '42px',
          overflow: 'hidden'
        }}
      />

      {/* Fallback button trigger if native iframe render is not yet styled or for direct click */}
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
