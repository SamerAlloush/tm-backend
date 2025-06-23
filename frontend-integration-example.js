// Frontend Integration Example - New Flow: Signup → OTP → Login → Dashboard

// ===============================================
// STEP 1: SIGNUP COMPONENT
// ===============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '' // Default to empty, force user to pick
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const availableRoles = [
    { value: 'user', label: 'User' },
    { value: 'customer', label: 'Customer' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'manager', label: 'Manager' },
    { value: 'project_manager', label: 'Project Manager' },
    // Note: 'admin' role should typically be assigned by existing admins
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Signup successful, navigate to OTP verification
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            message: data.message 
          }
        });
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Create Account</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <select
        value={formData.role}
        onChange={(e) => setFormData({...formData, role: e.target.value})}
        required
      >
        <option value="" disabled>Select Role</option>
        {availableRoles.map(role => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
};

// ===============================================
// STEP 2: OTP VERIFICATION COMPONENT
// ===============================================

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ OTP verified successfully
        setIsVerified(true);
        setSuccessMessage(data.successMessage || data.message);
        setError('');
        
        // Start countdown for redirect
        const redirectDelay = data.redirectDelay || 3000;
        let timeLeft = Math.ceil(redirectDelay / 1000);
        setCountdown(timeLeft);
        
        const countdownInterval = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            // 🚀 Redirect to login page
            navigate(data.redirect || '/login', {
              state: {
                email: email,
                message: 'Account verified! Please login with your credentials.',
                accountVerified: true,
                userName: data.user?.name
              }
            });
          }
        }, 1000);
        
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-signup-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('New OTP sent to your email!');
        setError('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="otp-verification">
      {!isVerified ? (
        <>
          <h2>Verify Your Account</h2>
          <p>Enter the 6-digit code sent to {email}</p>
          <p><small>Code expires in 30 minutes</small></p>
          
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              required
              disabled={loading}
            />
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
          
          <button onClick={handleResendOTP} className="resend-btn" disabled={loading}>
            Resend OTP
          </button>
        </>
      ) : (
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Email Verified Successfully!</h2>
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
          <div className="redirect-info">
            <p>Redirecting to login page in <strong>{countdown}</strong> seconds...</p>
            <div className="loading-bar">
              <div 
                className="loading-progress" 
                style={{
                  width: `${((3 - countdown) / 3) * 100}%`,
                  transition: 'width 1s linear'
                }}
              ></div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login', {
              state: {
                email: email,
                accountVerified: true,
                message: 'Account verified! Please login with your credentials.'
              }
            })}
            className="login-now-btn"
          >
            Login Now
          </button>
        </div>
      )}
    </div>
  );
};

// User Profile Component with Edit Functionality
const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user.name,
      phone: user.phone
    });
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      phone: user.phone
    });
    setMessage('');
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      setMessage('Name is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          phone: editForm.phone.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Profile updated successfully!');
        setIsEditing(false);
        // Refresh the user data
        onUpdate();
      } else {
        setMessage(`❌ ${data.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>👤 User Profile</h2>
        {!isEditing && (
          <button onClick={handleEdit} className="edit-btn">
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-details">
          {/* Basic Information Section */}
          <div className="profile-section">
            <h4>👤 Personal Information</h4>
            
            <div className="detail-group">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="edit-input"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="detail-value">{user.name}</div>
              )}
            </div>

            <div className="detail-group">
              <label>Email Address</label>
              <div className="detail-value">
                {user.email} 
                <span className="verified-badge">✅ Verified</span>
              </div>
              <small className="detail-note">Email cannot be changed after verification</small>
            </div>

            <div className="detail-group">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="edit-input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="detail-value">{user.phone}</div>
              )}
            </div>
          </div>

          {/* Account Information Section */}
          <div className="profile-section">
            <h4>🔐 Account Details</h4>
            
            <div className="detail-group">
              <label>User ID</label>
              <div className="detail-value">
                <code>{user.id}</code>
              </div>
              <small className="detail-note">Unique identifier from database</small>
            </div>

            <div className="detail-group">
              <label>Account Roles</label>
              <div className="detail-value">
                {user.roles?.map(role => (
                  <span key={role} className="role-badge">
                    {role}
                  </span>
                ))}
              </div>
              <small className="detail-note">Permissions assigned by system administrators</small>
            </div>

            <div className="detail-group">
              <label>Account Status</label>
              <div className="detail-value">
                <span className="status-badge active">
                  🟢 Active & Verified
                </span>
              </div>
              <small className="detail-note">Email verified, account fully activated</small>
            </div>
          </div>

          {/* Session Information Section */}
          <div className="profile-section">
            <h4>📊 Session Information</h4>
            
            <div className="detail-group">
              <label>Current Session</label>
              <div className="detail-value">
                <span className="session-status">
                  🟢 Active • Started {user.sessionStarted ? new Date(user.sessionStarted).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <small className="detail-note">Your current login session</small>
            </div>

            <div className="detail-group">
              <label>Last Profile Update</label>
              <div className="detail-value">
                {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Never'}
              </div>
              <small className="detail-note">When your profile was last synced with database</small>
            </div>

            <div className="detail-group">
              <label>Login Method</label>
              <div className="detail-value">
                📧 {user.loginMethod || 'Email & Password'}
              </div>
              <small className="detail-note">Authentication method used for this session</small>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="save-btn"
            >
              {loading ? '💾 Saving...' : '💾 Save Changes'}
            </button>
            <button 
              onClick={handleCancel} 
              disabled={loading}
              className="cancel-btn"
            >
              ❌ Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// User Settings Component
const UserSettings = ({ user }) => {
  return (
    <div className="settings-container">
      <h2>⚙️ Account Settings</h2>
      
      <div className="settings-section">
        <h3>🔒 Security</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Password</h4>
            <p>Last changed: Never</p>
          </div>
          <button className="setting-btn">Change Password</button>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security</p>
          </div>
          <button className="setting-btn">Enable 2FA</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>📧 Notifications</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Email Notifications</h4>
            <p>Receive updates via email</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>SMS Notifications</h4>
            <p>Receive updates via SMS</p>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Delete Account</h4>
            <p>Permanently delete your account and all data</p>
          </div>
          <button className="setting-btn danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// STEP 3: LOGIN COMPONENT
// ===============================================

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if coming from OTP verification
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Login successful
        console.log('✅ Login successful! User data retrieved from database:', data.user);
        
        // Enhanced user data with session info
        const userWithSession = {
          ...data.user,
          sessionStarted: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          isActive: true,
          loginMethod: 'email_password'
        };
        
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(userWithSession));
        localStorage.setItem('userSession', JSON.stringify({
          userId: userWithSession.id,
          email: userWithSession.email,
          sessionId: `session_${Date.now()}`,
          startTime: userWithSession.sessionStarted,
          lastActivity: userWithSession.lastUpdated
        }));
        
        console.log('💾 User session created and stored');
        
        // Show success message with database confirmation
        alert(`${data.message}\n\n✅ Profile loaded from database\n👤 Welcome back, ${userWithSession.name}!`);
        
        console.log('🔄 Redirecting to dashboard with fresh database profile...');
        
        // 🚀 Redirect to dashboard
        navigate(data.redirect || '/dashboard');
        
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      
      {/* Show success message if coming from OTP verification */}
      {location.state?.accountVerified && (
        <div className="verification-success">
          <div className="success-header">
            <span className="success-icon">🎉</span>
            <h3>Account Verified Successfully!</h3>
          </div>
          <p className="welcome-message">
            {location.state.userName ? 
              `Welcome ${location.state.userName}! ` : 
              'Welcome! '
            }
            Please enter your credentials below to access your dashboard.
          </p>
        </div>
      )}
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

// ===============================================
// STEP 4: PROTECTED DASHBOARD COMPONENT
// ===============================================

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('🔄 Fetching fresh user profile from database...');

      // Fetch fresh user data from database
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile loaded from database:', data.user);
        
        // Enhanced user session data
        const userSession = {
          ...data.user,
          sessionStarted: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          isActive: true,
          loginMethod: 'email_password'
        };
        
        setUser(userSession);
        
        // Store session data in localStorage
        localStorage.setItem('user', JSON.stringify(userSession));
        localStorage.setItem('userSession', JSON.stringify({
          userId: userSession.id,
          email: userSession.email,
          sessionId: `session_${Date.now()}`,
          startTime: userSession.sessionStarted,
          lastActivity: userSession.lastUpdated
        }));
        
        console.log('💾 User session created and stored');
      } else if (response.status === 401 || response.status === 403) {
        console.warn('🔒 Authentication failed - redirecting to login');
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userSession');
        navigate('/login');
      } else {
        console.error('Failed to fetch profile');
        // Fallback to localStorage data
        const userData = localStorage.getItem('user');
        if (userData) {
          const fallbackUser = JSON.parse(userData);
          fallbackUser.lastUpdated = new Date().toISOString();
          setUser(fallbackUser);
          console.log('📱 Using cached profile data');
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage data
      const userData = localStorage.getItem('user');
      if (userData) {
        const fallbackUser = JSON.parse(userData);
        fallbackUser.lastUpdated = new Date().toISOString();
        setUser(fallbackUser);
        console.log('📱 Using cached profile data due to network error');
      } else {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 User logging out - clearing session data');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userSession');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user.name}!</h1>
          <div className="header-actions">
            <button onClick={() => fetchUserProfile()} className="refresh-btn">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeTab === 'profile' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={activeTab === 'settings' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="dashboard-main">
          {activeTab === 'overview' && <DashboardOverview user={user} />}
          {activeTab === 'profile' && <UserProfile user={user} onUpdate={fetchUserProfile} />}
          {activeTab === 'settings' && <UserSettings user={user} />}
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ user }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getSessionDuration = () => {
    if (!user.sessionStarted) return 'Unknown';
    const start = new Date(user.sessionStarted);
    const now = new Date();
    const diff = now - start;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="overview-container">
      <div className="welcome-card">
        <h2>🎉 Welcome Back, {user.name}!</h2>
        <p>Your profile information has been loaded from the database.</p>
        <div className="session-info">
          <span className="session-badge">
            🟢 Active Session • {getSessionDuration()}
          </span>
        </div>
      </div>

      {/* User Session Information */}
      <div className="session-details-card">
        <h3>📊 Current Session Details</h3>
        <div className="session-grid">
          <div className="session-item">
            <span className="label">Session Started:</span>
            <span className="value">{formatDate(user.sessionStarted)}</span>
          </div>
          <div className="session-item">
            <span className="label">Last Updated:</span>
            <span className="value">{formatDate(user.lastUpdated)}</span>
          </div>
          <div className="session-item">
            <span className="label">Login Method:</span>
            <span className="value">{user.loginMethod || 'Email & Password'}</span>
          </div>
          <div className="session-item">
            <span className="label">User ID:</span>
            <span className="value"><code>{user.id}</code></span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Profile Status</h3>
            <p>✅ Complete & Verified</p>
            <small>Data loaded from database</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>User Role</h3>
            <p>{user.roles ? user.roles.map(role => 
              <span key={role} className="role-tag">{role}</span>
            ) : 'user'}</p>
            <small>Database role assignment</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-info">
            <h3>Email Status</h3>
            <p>✅ {user.email}</p>
            <small>Verified & Active</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            <h3>Phone Number</h3>
            <p>{user.phone}</p>
            <small>Contact information</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <h3>Account Security</h3>
            <p>✅ Secure</p>
            <small>JWT authenticated session</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-info">
            <h3>Session Status</h3>
            <p>{user.isActive ? '🟢 Active' : '🔴 Inactive'}</p>
            <small>Real-time database sync</small>
          </div>
        </div>
      </div>

      {/* Role-based content */}
      {user.roles?.includes('admin') && (
        <div className="admin-panel">
          <h3>🔧 Admin Panel</h3>
          <p>You have administrative privileges.</p>
          <div className="admin-actions">
            <button className="admin-btn">👥 Manage Users</button>
            <button className="admin-btn">📊 View Analytics</button>
            <button className="admin-btn">⚙️ System Settings</button>
          </div>
        </div>
      )}
      
      {user.roles?.includes('manager') && (
        <div className="manager-panel">
          <h3>📈 Manager Dashboard</h3>
          <p>You have manager privileges.</p>
          <div className="manager-actions">
            <button className="manager-btn">👥 Team Management</button>
            <button className="manager-btn">📋 Reports</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// COMPLETE FLOW SUMMARY
// ===============================================

/*
NEW FLOW:
1. User fills signup form → POST /api/auth/signup
2. OTP sent to email → Navigate to /verify-otp
3. User enters OTP → POST /api/auth/verify-otp
4. Account verified → Navigate to /login (with pre-filled email)
5. User enters credentials → POST /api/auth/login
6. Login successful → Navigate to /dashboard
7. Dashboard loads with user data

BENEFITS:
- Clear separation between registration and authentication
- User must actively login after verification
- More secure flow
- Better user experience with pre-filled email
*/

export { SignupForm, OTPVerification, LoginForm, Dashboard }; 