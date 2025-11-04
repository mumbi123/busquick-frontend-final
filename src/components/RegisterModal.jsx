import React from 'react';
import { Modal } from 'antd';
import Register from '../pages/Register';
import '../resources/auth.css';

function RegisterModal({ visible, onCancel, onSuccess, onSwitchToLogin }) {
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      className="auth-modal"
      wrapClassName="auth-modal-wrapper"
      centered
      width={500}
      maskClosable={true}
    >
      <div className="auth-dropdown-card">
        <button className="auth-close" onClick={onCancel}>
          &times;
        </button>
        <div className="auth-header"> 
          <h2>Create Account</h2>
          <p>Join us today and start your journey</p>
        </div>
        <Register 
          onSuccess={onSuccess} 
          isModal={true}
          onSwitchToLogin={onSwitchToLogin}
        />
      </div>
    </Modal>
  );
}

export default RegisterModal;
