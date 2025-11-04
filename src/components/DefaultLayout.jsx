import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';
import { setUser } from '../redux/usersSlice';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import '../resources/layout.css';
import '../resources/auth.css';
import Footer from './footer';

const ADMIN_ROLE = 'admin';
const USER_ROLE = 'user';
const VENDOR_ROLE = 'vendor';
 
const GREETING_TIMES = [
  { id: 1, start: "00:00", end: "03:59", greeting: "You're up late" },
  { id: 2, start: "04:00", end: "05:59", greeting: "Rise and Ride" },
  { id: 3, start: "06:00", end: "11:59", greeting: "Good Morning" },
  { id: 4, start: "12:00", end: "16:59", greeting: "Good Afternoon" },
  { id: 5, start: "17:00", end: "19:59", greeting: "Good Evening" },
  { id: 6, start: "20:00", end: "23:59", greeting: "Good Night" }
];

function DefaultLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0');
    
    for (const timeSlot of GREETING_TIMES) {
      if (currentTime >= timeSlot.start && currentTime <= timeSlot.end) {
        return timeSlot.greeting;
      }
    }
    
    return "Hello"; // Default fallback
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Guest menu
  const guestMenu = [
    { path: '/', icon: 'ri-home-4-line', name: 'Home' },
    { path: '/login', icon: 'ri-login-circle-line', name: 'Login', isAuth: true },
    { path: '/register', icon: 'ri-user-add-line', name: 'Register', isAuth: true },
  ];

  const adminMenu = [
    { path: '/admin', icon: 'ri-home-4-line', name: 'Home' },
    { path: '/bookings', icon: 'ri-file-list-line', name: 'Bookings' },
    { path: '/admin/buses', icon: 'ri-bus-line', name: 'Buses' },
    { path: '/admin/prices', icon: 'ri-money-dollar-circle-line', name: 'Prices' },
    { path: '/admin/users', icon: 'ri-user-line', name: 'Users' },
    { path: '/logout', icon: 'ri-logout-circle-line', name: 'Logout' },
  ];

  const vendorMenu = [
    { path: '/admin', icon: 'ri-home-4-line', name: 'Home' },
    { path: '/bookings', icon: 'ri-file-list-line', name: 'Bookings' },
    { path: '/admin/buses', icon: 'ri-bus-line', name: 'Buses' },
    { path: '/logout', icon: 'ri-logout-circle-line', name: 'Logout' },
  ];

  const userMenu = [
    { path: '/', icon: 'ri-home-4-line', name: 'Home' },
    { path: '/bookings', icon: 'ri-file-list-line', name: 'Bookings' },
    { path: '/logout', icon: 'ri-logout-circle-line', name: 'Logout' },
  ];

  const getMenu = () => {
    if (!user) return guestMenu;

    switch (user.role) {
      case ADMIN_ROLE:
        return adminMenu;
      case VENDOR_ROLE:
        return vendorMenu;
      case USER_ROLE:
        return userMenu;
      default:
        return userMenu;
    }
  };

  const menu = getMenu();
  const active = window.location.pathname;

  // Handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    navigate('/', { replace: true });
  };

  // Handle successful registration
  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    // After registration, show login modal
    message.info('Registration successful! Please login.');
    setShowLoginModal(true);
  };

  // Switch from login to register
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Switch from register to login
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleMenuClick = (item) => {
    if (item.isAuth && !user) {
      // Open appropriate modal for login/register
      if (item.path === '/register') {
        setShowRegisterModal(true);
      } else {
        setShowLoginModal(true);
      }
    } else if (item.path === '/logout') {
      localStorage.removeItem('token');
      dispatch(setUser(null));
      navigate('/');
      message.success('Logged out successfully');
    } else if (item.path === '/bookings' && !user) {
      message.warning('Please login to view your bookings');
      setShowLoginModal(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <div className="layout-parent">
        <div className="header">
          <div className="logo-section" onClick={() => navigate('/about')}>
            <h1 className="logo">BusQuick</h1>
            <h6 className="role">
              {user
                ? `${getTimeBasedGreeting()}, ${capitalizeFirstLetter(user.name)}`
                : `${getTimeBasedGreeting()}, Guest`}
            </h6>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <i className="ri-menu-line"></i>
          </button>

          <div className="menu"> 
            {menu.map((item) => (
              <div
                key={item.path}
                className={`menu-item ${active === item.path ? 'active-menu-item' : ''}`}
                onClick={() => handleMenuClick(item)}
                style={{ position: 'relative' }}
              >
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
          {menu.map((item) => (
            <div
              key={item.path}
              className={`menu-item ${active === item.path ? 'active-menu-item' : ''}`}
              onClick={() => {
                handleMenuClick(item);
                setIsSidebarOpen(false);
              }}
            >
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <div className="body">
          <div className="content">{children}</div>
        </div>
      </div>

      {/* NEW Login Modal - with Google Sign-In */}
      <LoginModal
        visible={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* NEW Register Modal - with Google Sign-In + First/Last Name */}
      <RegisterModal
        visible={showRegisterModal}
        onCancel={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <Footer />
    </>
  );
}

export default DefaultLayout;
