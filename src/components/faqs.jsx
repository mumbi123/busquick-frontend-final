import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faTicket, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import '../resources/faqs.css';

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      question: "How do I book a ticket?",
      answer: "Search and find the bus of where you are going, click book, enter your details (number, emergency number, name and select seat) then proceed to payment.",
      icon: <FontAwesomeIcon icon={faTicket} className="text-2xl" />
    },
    {
      question: "How do I get tickets after booking?",
      answer: "On the menu bar you can click on bookings and see the upcoming trips or past trips.",
      icon: <FontAwesomeIcon icon={faTicket} className="text-2xl" />
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Airtel, MTN, and bank payments (Visa card, Master card).",
      icon: <FontAwesomeIcon icon={faCreditCard} className="text-2xl" />
    },
    {
      question: "What amenities are available on the bus?",
      answer: "Each bus has different amenities. Most common are WiFi, luggage storage, TV, charger ports, AC, and bathroom.",
      icon: <FontAwesomeIcon icon={faBus} className="text-2xl" />
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqs-container">
      <div className="faqs-max-width">
        {/* Header Section with Animation */}
        <div className="faqs-header">
          <div className="faqs-icon-circle">
            <HelpCircle size={40} className="text-white" />
          </div>
          <h1 className="faqs-title">
            How Can We Help You?
          </h1>
          <p className="faqs-subtitle">
            Find answers to common questions about our bus booking service
          </p>
        </div>

        {/* Search Bar */}
        <div className="faqs-search-container">
          <div className="faqs-search-wrapper">
            <div className="faqs-search-icon">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faqs-search-input"
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="faqs-items-container">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`faq-item ${
                  hoveredIndex === index ? 'faq-item-hovered' : ''
                } ${openIndex === index ? 'faq-item-active' : ''}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="faq-question-button"
                >
                  <div className="faq-question-content">
                    <span className="faq-icon">
                      {faq.icon}
                    </span>
                    <span className="faq-question-text">
                      {faq.question}
                    </span>
                  </div>
                  <span className={`faq-chevron ${openIndex === index ? 'faq-chevron-open' : ''}`}>
                    <ChevronDown size={24} />
                  </span>
                </button>
                
                <div className={`faq-answer-wrapper ${openIndex === index ? 'faq-answer-open' : ''}`}>
                  <div className="faq-answer-content">
                    <p className="faq-answer-text">{faq.answer}</p>
                    <div className="faq-helpful-section">
                      <button className="faq-helpful-button">
                        Was this helpful?
                        <span className="ml-2">👍</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="faqs-no-results">
              <p className="text-gray-500 text-lg">No FAQs match your search. Try different keywords!</p>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="faqs-contact-support">
          <MessageCircle size={48} className="mx-auto mb-4" />
          <h3 className="faqs-contact-title">Still Need Help?</h3>
          <p className="faqs-contact-subtitle">
            Our support team is here to assist you 24/7
          </p>
          <button className="faqs-contact-button" onClick={scrollToFooter}>
            Contact Support
          </button>
        </div>

        {/* Quick Stats */}
        <div className="faqs-stats-grid">
          <div className="faqs-stat-card">
            <div className="faqs-stat-number">{faqs.length}</div>
            <div className="faqs-stat-label">FAQs</div>
          </div>
          <div className="faqs-stat-card">
            <div className="faqs-stat-number">24/7</div>
            <div className="faqs-stat-label">Support</div>
          </div>
          <div className="faqs-stat-card">
            <div className="faqs-stat-number">100%</div>
            <div className="faqs-stat-label">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
