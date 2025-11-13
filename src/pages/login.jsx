import React, { useEffect } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/alertsSlice';
import { setUser } from '../redux/usersSlice';
import '../resources/auth.css';

const baseURL = 'https://busquick.onrender.com';

function Login({ onSuccess, isModal = false, onSwitchToRegister }) {
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
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
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

      if (!result.data.success) {
        message.error(result.data.message);
        return;
      }

      const { token, user } = result.data.data;
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      message.success('Login successful!');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/', { replace: true });
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
      const response = await axios.post(`${baseURL}/api/users/login`, values);
      const { data } = response;
      dispatch(hideLoading());

      if (!data.success) {
        message.error(data.message);
        return;
      }

      const { token, user } = data.data;
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      message.success('Login successful');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error('Invalid credentials');
    }
  };

  const handleSwitchToRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={isModal ? "" : "auth-container"}>
      {!isModal && <h3>Login</h3>}
      
      {/* Google Sign-In Button */}
      <Button 
        type="default" 
        icon={<GoogleOutlined />} 
        onClick={handleGoogleSignIn}
        className="google-btn"
      >
        Continue with Google
      </Button>

      <Divider>Or login with email</Divider>

      <Form layout="vertical" onFinish={onFinish}>
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
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password className="auth-input" placeholder="Enter your password" />
          </Form.Item>
        </div>
        <Button type="primary" htmlType="submit" className="auth-btn">
          Login
        </Button>
        <div className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={handleSwitchToRegister}>Register here</button>
        </div>
      </Form>
    </div>
  );
}

export default Login; 
