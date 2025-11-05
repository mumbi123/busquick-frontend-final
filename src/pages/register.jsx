import React, { useEffect } from 'react';
import { Form, Input, message, Button, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/alertsSlice';
import '../resources/auth.css';

const baseURL = 'https://busquick.onrender.com';

function Register({ onSuccess, isModal = false, onSwitchToLogin }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
          callback: handleGoogleResponse,
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      dispatch(showLoading());
      
      // Send the Google credential token to your backend
      const result = await axios.post(`${baseURL}/api/users/google-auth`, {
        credential: response.credential,
      });

      dispatch(hideLoading());

      if (result.data.success) {
        message.success('Registration successful!');
        // Store user data/token as needed
        if (result.data.token) {
          localStorage.setItem('token', result.data.token);
        }
        
        if (isModal && onSuccess) {
          onSuccess();
        } else {
          navigate('/');
        }
      } else {
        message.error(result.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.response?.data?.message || 'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt(); // Display the One Tap dialog
    } else {
      message.error('Google Sign-In is not loaded yet. Please try again.');
    }
  };

  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(`${baseURL}/api/users/register`, values);
      dispatch(hideLoading());

      if (response.data.success) {
        message.success(response.data.message);
        
        if (isModal && onSuccess) {
          onSuccess();
        } else {
          // After successful registration, switch to login
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            navigate('/login');
          }
        }
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  };

  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={isModal ? "" : "auth-container"}>
      {!isModal && <h3>Register</h3>}
      
      {/* Google Sign-In Button */}
      <Button 
        type="default" 
        icon={<GoogleOutlined />} 
        onClick={handleGoogleSignIn}
        className="google-btn"
      >
        Continue with Google
      </Button>

      <Divider>Or register with email</Divider>

      <Form layout="vertical" onFinish={onFinish}>
        <div className="auth-form-group">
          <Form.Item
            label={<label>First Name</label>}
            name="firstName"
            rules={[{ required: true, message: 'Please input your first name!' }]}
          >
            <Input className="auth-input" placeholder="Enter your first name" />
          </Form.Item>
        </div>
        <div className="auth-form-group">
          <Form.Item
            label={<label>Last Name</label>}
            name="lastName"
            rules={[{ required: true, message: 'Please input your last name!' }]}
          >
            <Input className="auth-input" placeholder="Enter your last name" />
          </Form.Item>
        </div>
        <div className="auth-form-group">
          <Form.Item
            label={<label>Email</label>}
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
          >
            <Input className="auth-input" placeholder="Enter your email" />
          </Form.Item>
        </div>
        <div className="auth-form-group">
          <Form.Item
            label={<label>Password</label>}
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password className="auth-input" placeholder="Create a password" />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" className="auth-btn">
          Register
        </Button>
        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={handleSwitchToLogin}>Login here</button>
        </div>
      </Form>
    </div>
  );
} 

export default Register; 
