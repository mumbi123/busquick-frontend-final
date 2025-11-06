import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaLinkedin, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Modal, Form, Input, message, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from '../redux/alertsSlice';
import axios from 'axios';
import '../resources/footer.css';

const baseURL = 'https://busquick.onrender.com';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [isVendorModalVisible, setIsVendorModalVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const showVendorModal = () => {
    setIsVendorModalVisible(true);
  };

  const handleVendorModalCancel = () => {
    setIsVendorModalVisible(false);
    form.resetFields();
  };

  const onFinishVendorRegistration = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(`${baseURL}/api/users/vendor-register`, values);
      dispatch(hideLoading());

      if (response.data.success) {
        message.success(response.data.message);
        setIsVendorModalVisible(false);
        form.resetFields();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      message.error(error.response?.data?.message || 'Vendor registration failed. Please try again.');
      console.error('Vendor registration error:', error);
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:support@busquick.co.zm">support@busquick.co.zm</a>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <a href="tel:+260960964433">+260960964433</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
          </div>

          <div className="footer-section">
            <h3>Become Partners</h3>
            <button
              onClick={showVendorModal}
              className="footer-link"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Become a Partner
            </button>
          </div>

          <div className="footer-section">
            <h3>Follow Us On</h3>
            <div className="social-links">
              <a
                href="https://www.facebook.com/BusQuickZM"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-link"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/busquick_tickets?igsh=eHNxengzODQ2cThy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-link"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@busquick.tickets?_r=1&_t=ZM-91BPfKe3vIa"
                onClick={(e) => e.preventDefault()}
                aria-label="TikTok"
                className="social-link "
                title="Coming soon"
              >
                <FaTiktok />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label="LinkedIn"
                className="social-link social-link-disabled"
                title="Coming soon"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label="X (Twitter)"
                className="social-link social-link-disabled"
                title="Coming soon"
              >
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} BusQuick. All rights reserved.</p>
        </div>
      </footer>

      {/* Vendor Registration Modal */}
      <Modal
        title="Registration Form"
        open={isVendorModalVisible}
        onCancel={handleVendorModalCancel}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishVendorRegistration}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Business Name"
            name="name"
            rules={[{ required: true, message: 'Please input your business name!' }]}
          >
            <Input placeholder="Enter your business name" />
          </Form.Item>

          <Form.Item
            label="Business Email"
            name="email"
            rules={[
              { required: true, type: 'email', message: 'Please input a valid business email!' }
            ]}
          >
            <Input placeholder="Enter your business email" />
          </Form.Item>

          <Form.Item
            label="Contact Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input your contact phone!' }]}
          >
            <Input placeholder="Enter your contact phone" />
          </Form.Item>

          <Form.Item
            label="Business Address"
            name="address"
            rules={[{ required: true, message: 'Please input your business address!' }]}
          >
            <Input.TextArea
              placeholder="Enter your business address"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              onClick={handleVendorModalCancel}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Register as a partner
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Footer;
