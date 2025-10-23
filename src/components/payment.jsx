import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../resources/payment.css';

const API_BASE_URL = 'https://busquick.onrender.com';

// Notification Component
const Notification = ({ message, type, onTryAgain, onCancel, show }) => {
  if (!show) return null;
  
  return (
    <div className="notification-overlay">
      <div className={`notification ${type}`}>
        <div className="notification-content">
          <div className="notification-icon">
            {type === 'error' ? '' : type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <p>{message}</p>
          <div className="notification-actions">
            {onTryAgain && (
              <button className="btn-try-again" onClick={onTryAgain}>
                Try Again
              </button>
            )}
            {onCancel && (
              <button className="btn-cancel" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const loadLencoScript = () => {
  return new Promise((resolve, reject) => {
    if (window.LencoPay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://pay.lenco.co/js/v1/inline.js';
    script.async = true;
    script.onload = () => {
      if (!window.LencoPay) {
        reject(new Error('LencoPay not initialized after script load'));
      } else {
        resolve();
      }
    };
    script.onerror = () => reject(new Error('Failed to load LencoPay script'));
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  let initialState = location.state || {};
  if (!initialState.bus && localStorage.getItem('pendingBooking')) {
    try {
      const storedBooking = JSON.parse(localStorage.getItem('pendingBooking'));
      initialState = {
        bus: storedBooking.bus,
        seats: storedBooking.seats,
        totalPrice: storedBooking.totalPrice,
        passengerDetails: storedBooking.passengerDetails
      };
    } catch (err) {
      console.error('Error parsing pendingBooking from localStorage:', err);
    }
  }
  
  const { bus, seats, totalPrice, passengerDetails } = initialState;

  const [name, setName] = useState(passengerDetails?.name || '');
  const [phone, setPhone] = useState(passengerDetails?.phone || '');
  const [amount, setAmount] = useState(totalPrice || '');
  const [otp, setOtp] = useState('');
  const [reference, setReference] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Use refs for values that shouldn't trigger re-renders
  const pollingIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);
  const paymentAbortControllerRef = useRef(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  const email = 'support@busquick.co.zm';

  // Format phone number for saving
  const formatPhoneForPayment = (phoneValue) => {
    if (!phoneValue) return '';
    const cleaned = phoneValue.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+260' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('260') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    
    return cleaned.startsWith('+') ? cleaned : cleaned;
  };

  // Format phone number input
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned.substring(0, 13);
    } else {
      return cleaned.substring(0, 12);
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const getPhoneHint = (phoneValue) => {
    const cleaned = phoneValue.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `Will be used as: +260${cleaned.substring(1)}`;
    }
    return '';
  };

  const showNotification = (message, type = 'info', showActions = false) => {
    setNotification({
      show: true,
      message,
      type,
      showActions
    });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'info' });
  };

  const mapPaymentMethod = (channel) => {
    const channelMap = {
      'mobile-money': 'mobile',
      'card': 'card',
      'bank': 'bank'
    };
    return channelMap[channel] || 'mobile';
  };

  // Cleanup function
  const cleanupPaymentProcess = () => {
    // Stop polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Abort any ongoing API requests
    if (paymentAbortControllerRef.current) {
      paymentAbortControllerRef.current.abort();
      paymentAbortControllerRef.current = null;
    }
    
    // Reset cancellation flag
    isCancelledRef.current = false;
  };

  useEffect(() => {
    loadLencoScript()
      .then(() => setScriptLoaded(true))
      .catch((err) => {
        console.error('Error loading LencoPay script:', err);
        showNotification('Failed to load payment system. Please refresh the page.', 'error', true);
      });

    return () => {
      cleanupPaymentProcess();
    };
  }, []);

  const validateInputs = () => {
    const formattedPhone = formatPhoneForPayment(phone);
    const phoneRegex = /^\+260\d{9}$/;
    
    if (!phoneRegex.test(formattedPhone)) {
      return 'Please enter a valid Zambian phone number (e.g., 0977123456 or +260977123456)';
    }
    if (!name.trim()) {
      return 'Name is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Amount must be a valid positive number';
    }
    if (bus && (!seats?.length || !totalPrice || !passengerDetails)) {
      return 'Missing booking details. Please go back to selection.';
    }
    return null;
  };

  const initiatePayment = async () => {
    if (!scriptLoaded || !window.LencoPay) {
      showNotification('Payment system not ready. Please try again.', 'error', true);
      return;
    }

    const publicKey = import.meta.env.VITE_LENCO_PUBLIC_KEY || 'pub-060bad0d346b88a8505deb903de28a51847ee1c095fa5543';
    if (!publicKey) {
      showNotification('Payment configuration error. Please contact support.', 'error', true);
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      showNotification(validationError, 'error', true);
      return;
    }

    // Reset states and cleanup previous processes
    cleanupPaymentProcess();
    setLoading(true);
    hideNotification();
    setPaymentStatus('processing');
    isCancelledRef.current = false;

    // Create new abort controller for this payment session
    paymentAbortControllerRef.current = new AbortController();

    const ref = 'ref-' + Date.now();
    setReference(ref);

    const [firstName, ...lastNameParts] = name.trim().split(' ');
    const lastName = lastNameParts.join(' ') || 'N/A';

    const formattedPhone = formatPhoneForPayment(phone);

    const paymentData = {
      key: publicKey,
      reference: ref,
      email: email,
      amount: parseFloat(amount).toFixed(2),
      currency: 'ZMW',
      channels: ['card', 'mobile-money'],
      customer: {
        firstName: firstName || 'Customer',
        lastName: lastName,
        phone: formattedPhone,
      },
    };

    try {
      window.LencoPay.getPaid({
        ...paymentData,
        onSuccess: async (response) => {
          if (isCancelledRef.current) return;
          setLoading(false);
          await handlePaymentSuccess(response);
        },
        onClose: async () => {
          if (isCancelledRef.current) return;
          setLoading(false);
          await handlePaymentCancellation(ref);
        },
        onConfirmationPending: () => {
          if (isCancelledRef.current) return;
          setLoading(false);
          setPaymentStatus('pay-offline');
          showNotification('Please authorize the payment on your mobile phone.', 'info');
          startPolling(ref);
        },
      });
    } catch (err) {
      console.error('LencoPay.getPaid failed:', err);
      setLoading(false);
      setPaymentStatus(null);
      showNotification('Failed to open payment window. Please try again.', 'error', true);
    }
  };

  const handlePaymentCancellation = async (ref) => {
    // Immediately stop all processes
    isCancelledRef.current = true;
    cleanupPaymentProcess();
    
    setPaymentStatus('cancelled');
    setReference(null);
    setOtp('');
    
    // Show immediate cancellation message
    showNotification(
      'Payment cancelled. All payment processes have been stopped. No further prompts will be sent to your phone.',
      'error',
      true
    );

    // Notify backend about cancellation
    try {
      await axios.post(`${API_BASE_URL}/api/payment/cancel`, 
        { reference: ref }, 
        {
          headers: { 'Content-Type': 'application/json' },
          signal: paymentAbortControllerRef.current?.signal
        }
      );
      console.log('Payment cancellation confirmed for reference:', ref);
    } catch (err) {
      console.log('Cancellation notification sent (backend may process it asynchronously)');
    }

    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    
    // Navigate after short delay
    setTimeout(() => navigate('/'), 5000);
  };

  const handlePaymentSuccess = async (response) => {
    if (isCancelledRef.current) return;

    try {
      const verifyResponse = await fetch(
        `${API_BASE_URL}/api/payment/verify/${response.reference}`,
        { signal: paymentAbortControllerRef.current?.signal }
      );
      
      const data = await verifyResponse.json();

      if (!verifyResponse.ok && verifyResponse.status !== 401) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      const status = data.data?.data?.status;
      
      if (status === 'successful' || verifyResponse.status === 401) {
        await createBooking(response.reference, response.channel);
      } else if (status === 'otp-required') {
        setPaymentStatus('otp-required');
        setReference(response.reference);
        showNotification('Check your phone for the OTP.', 'info');
      } else {
        setPaymentStatus('pending');
        startPolling(response.reference);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Payment verification aborted');
        return;
      }
      console.error('Verification error:', err);
      showNotification('Payment verification failed. Please try again.', 'error', true);
      setPaymentStatus(null);
    }
  };

  const createBooking = async (transactionId, channel = null) => {
    if (isCancelledRef.current || !bus || !seats?.length || !totalPrice || !passengerDetails) {
      showNotification('Booking data incomplete. Contact support with ref: ' + transactionId, 'error', true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please log in again.', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const mappedPaymentMethod = channel ? mapPaymentMethod(channel) : 'mobile';
      
      const updatedPassengerDetails = {
        ...passengerDetails,
        phone: formatPhoneForPayment(passengerDetails.phone || phone)
      };
      
      const bookingResponse = await axios.post(`${API_BASE_URL}/api/bookings/book-seat`, {
        bus,
        seats,
        transactionId,
        totalPrice,
        passengerDetails: updatedPassengerDetails,
        paymentMethod: mappedPaymentMethod,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: paymentAbortControllerRef.current?.signal
      });

      if (bookingResponse.data.success) {
        const event = new CustomEvent('bookingUpdated', { detail: bookingResponse.data.data });
        window.dispatchEvent(event);
        setPaymentStatus('success');
        setReference(transactionId);
        localStorage.removeItem('pendingBooking');
        cleanupPaymentProcess();
        showNotification('Payment and booking successful!', 'success');
        setTimeout(() => navigate('/bookings'), 3000);
      } else {
        throw new Error(bookingResponse.data.message || 'Booking creation failed');
      }
    } catch (bookingErr) {
      if (bookingErr.name === 'AbortError') {
        console.log('Booking creation aborted');
        return;
      }
      console.error('Booking creation error:', bookingErr);
      showNotification(`Payment succeeded, but booking failed. Contact support with ref: ${transactionId}`, 'error', true);
    }
  };

  const submitOtp = async () => {
    if (isCancelledRef.current) return;
    
    if (!/^\d{4,6}$/.test(otp)) {
      showNotification('OTP must be 4-6 digits', 'error');
      return;
    }

    setLoading(true);
    hideNotification();

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/submit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, otp }),
        signal: paymentAbortControllerRef.current?.signal
      });

      const data = await response.json();

      if (!response.ok && response.status !== 401) {
        throw new Error(data.error || 'Failed to submit OTP');
      }

      const collectionStatus = data.data?.data?.status;

      if (collectionStatus === 'successful') {
        await createBooking(reference);
      } else if (collectionStatus === 'pay-offline') {
        setPaymentStatus('pay-offline');
        startPolling(reference);
      } else {
        setPaymentStatus('pending');
        startPolling(reference);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('OTP submission aborted');
        return;
      }
      console.error('OTP submission error:', err);
      showNotification('OTP submission failed. Please try again.', 'error', true);
      setPaymentStatus('pending');
      startPolling(reference);
    } finally {
      setLoading(false);
      setOtp('');
    }
  };

  const startPolling = (ref) => {
    if (isCancelledRef.current || pollingIntervalRef.current) return;
    
    const interval = setInterval(() => {
      if (isCancelledRef.current) {
        clearInterval(interval);
        return;
      }
      verifyPayment(ref);
    }, 5000);
    
    pollingIntervalRef.current = interval;
    
    // Auto-stop polling after 5 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current === interval) {
        stopPolling();
        if (!isCancelledRef.current && (paymentStatus === 'pending' || paymentStatus === 'pay-offline')) {
          showNotification(
            'Payment verification timeout. Please check with support.',
            'error',
            true
          );
          setPaymentStatus('cancelled');
        }
      }
    }, 300000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const verifyPayment = async (ref) => {
    if (isCancelledRef.current) {
      stopPolling();
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payment/verify/${ref}`,
        { signal: paymentAbortControllerRef.current?.signal }
      );
      const data = await response.json();

      if (!response.ok && response.status !== 401) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      const status = data.data?.data?.status;

      if (status === 'successful') {
        await createBooking(ref);
        stopPolling();
      } else if (status === 'failed' || status === 'cancelled') {
        setPaymentStatus('cancelled');
        showNotification(
          'Payment cancelled or failed. No further notifications will be sent.',
          'error',
          true
        );
        stopPolling();
      } else if (status === 'otp-required') {
        setPaymentStatus('otp-required');
        showNotification('Check your phone for the OTP.', 'info');
        stopPolling();
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Payment verification aborted');
        return;
      }
      console.error('Verification error:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    initiatePayment();
  };

  const handleTryAgain = () => {
    hideNotification();
    setPaymentStatus(null);
    setLoading(false);
    isCancelledRef.current = false;
  };

  const handleCancel = async () => {
    if (reference) {
      await handlePaymentCancellation(reference);
    } else {
      setPaymentStatus('cancelled');
      isCancelledRef.current = true;
      cleanupPaymentProcess();
      localStorage.removeItem('pendingBooking');
      showNotification(
        'Payment cancelled. No further notifications will be sent.',
        'error',
        true
      );
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <>
      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onTryAgain={notification.showActions ? handleTryAgain : null}
        onCancel={notification.showActions ? handleCancel : null}
      />

      <div className="payment-wrapper">
        <div className="payment-container">
          <div className="payment-header">
            <div className="amount-display">
              <span className="currency">K</span>
              <span className="amount-value">{amount}</span>
            </div>
            <h2>Complete Your Payment</h2>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || paymentStatus === 'success' || paymentStatus === 'cancelled'}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading || paymentStatus === 'success' || paymentStatus === 'cancelled'}
                placeholder="Enter phone number (e.g., 0977123456 or +260977123456)"
                required
              />
              {getPhoneHint(phone) && (
                <div className="format-hint" style={{color: '#10b981', fontSize: '12px', marginTop: '4px'}}>
                  {getPhoneHint(phone)}
                </div>
              )}
            </div>

            {paymentStatus === 'otp-required' && (
              <div className="otp-section">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading || isCancelledRef.current}
                  placeholder="Enter 4-6 digit OTP"
                  maxLength="6"
                  required
                />
                <button
                  type="button"
                  className="otp-submit-button"
                  onClick={submitOtp}
                  disabled={loading || !otp || isCancelledRef.current}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            <button
              type="submit"
              className={`pay-button ${loading ? 'loading' : ''}`}
              disabled={
                loading || 
                !scriptLoaded || 
                paymentStatus === 'success' || 
                paymentStatus === 'otp-required' || 
                paymentStatus === 'processing' ||
                paymentStatus === 'cancelled' ||
                isCancelledRef.current
              }
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="pay-icon"></span>
                  Pay with Lenco
                </>
              )}
            </button>
          </form>

          {paymentStatus === 'success' && (
            <div className="success-status">
              <div className="success-icon">✅</div>
              <h3>Payment Successful!</h3>
              <p>Reference: {reference}</p>
              <p>Redirecting to your bookings...</p>
            </div>
          )}

          {paymentStatus === 'pay-offline' && (
            <div className="pending-status">
              <div className="pending-icon">📱</div>
              <h3>Authorization Required</h3>
              <p>Please check your phone and authorize the payment</p>
            </div>
          )}

          {paymentStatus === 'cancelled' && (
            <div className="cancelled-status">
              <div className="cancelled-icon">❌</div>
              <h3>Payment Cancelled</h3>
              <p>All payment processes have been stopped. No further payment requests will be sent to your phone.</p>
              <p>Redirecting to homepage...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
