import React from 'react';
import { Bus, Building2, Users } from 'lucide-react';
import '../resources/partners.css';

const Partners = () => {
  const partners = [
    { id: 1, name: 'POWERTOOLS LOGISTICS', icon: Bus },
    { id: 2, name: 'UNITED BUSES ZAMBIA (UBZ)', icon: Bus },
    { id: 3, name: 'SHALOM BUS SERVICES', icon: Bus },
    { id: 4, name: 'ABDRICH COACH SERVICES', icon: Bus },
    { id: 5, name: 'LIKLI MOTORS', icon: Bus },
    { id: 6, name: 'POSTBUS', icon: Bus }
  ];

  const paymentMethods = [
    { id: 1, name: 'MTN Mobile Money', image: '/images/mtn.png' },
    { id: 2, name: 'Airtel Money', image: '/images/airtel.png' },
    { id: 3, name: 'Bank Transfer', image: '/images/bank.png' }
  ];

  return (
    <div className="partners-container">
      <div className="partners-wrapper">
        {/* Partners Section */}
        <div className="partners-section">
          <div className="section-header">
            <h1 className="main-title">Our Partners</h1>
            <p className="main-subtitle">
              We collaborate with leading transport companies to bring you the best service
            </p>
          </div>

          <div className="partners-grid">
            {partners.map((partner) => {
              const Icon = partner.icon;
              return (
                <div key={partner.id} className="partner-card">
                  <div className="partner-content">
                    <div className="partner-icon-wrapper">
                      <Icon className="partner-icon" />
                    </div>
                    <h3 className="partner-name">{partner.name}</h3>
                    <div className="partner-divider"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="payment-section">
          <div className="section-header">
            <h2 className="payment-title">Payment Methods</h2>
            <p className="payment-subtitle">Choose your preferred payment option</p>
          </div>

          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-card">
                <div className="payment-image-wrapper">
                  <img
                    src={method.image}
                    alt={method.name}
                    className="payment-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="payment-fallback">
                    <Users className="fallback-icon" />
                  </div>
                </div>
                <h3 className="payment-name">{method.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
