// src/components/PDFTicket.jsx
import React, { useState } from 'react';
import { usePDF } from 'react-to-pdf';
import '../resources/PDFTicket.css';

const PDFTicket = ({ booking, onDownload }) => {
  const { toPDF, targetRef } = usePDF({
    filename: `busquick-ticket-${booking._id?.slice(0, 8)}.pdf`,
  });

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      // Show a confirmation message before generating PDF
      const confirmed = window.confirm('Click OK to complete the download');
      
      if (!confirmed) {
        setDownloading(false);
        return;
      }

      await toPDF();

      if (onDownload) onDownload();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Sorry, the ticket could not be generated. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  /* Helper formatters */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const base = timeString.includes('T')
      ? new Date(timeString)
      : new Date(`2000-01-01T${timeString}`);
    return base.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getBusNumber = () =>
    booking.bus?.number ||
    booking.bus?.busNumber ||
    booking.busNumber ||
    'N/A';

  const getBusName = () =>
    booking.bus?.name ||
    booking.bus?.companyName ||
    booking.busName ||
    booking.companyName ||
    'Bus Company';

  const getBusRoute = () => ({
    from: booking.bus?.from || booking.fromCity || booking.from || 'N/A',
    to: booking.bus?.to || booking.toCity || booking.to || 'N/A',
  });

  const getBusTimes = () => {
    const departure =
      booking.bus?.departureTime ||
      booking.bus?.departure ||
      booking.departureTime;
    const arrival =
      booking.bus?.arrivalTime ||
      booking.bus?.arrival ||
      booking.arrivalTime;
    return { departure, arrival };
  };

  const getBusDate = () =>
    booking.bus?.date ||
    booking.bus?.journeydate ||
    booking.date ||
    booking.journeyDate;

  const route = getBusRoute();
  const times = getBusTimes();
  const busDate = getBusDate();
  const seatNumbers = (booking.seats ?? []).sort((a, b) => a - b);
  const seatCount = seatNumbers.length || 1;
  const pricePerSeat = booking.totalPrice
    ? booking.totalPrice / seatCount
    : 150;
  const bookingFee = 15;
  const total = pricePerSeat * seatCount + bookingFee;

  // Generate seat map (65 seats total)
  const renderSeatMap = () => {
    const bookedSeats = new Set(seatNumbers);
    const rows = [];
    
    // Rows 1-15: 4 seats per row (2-aisle-2 pattern) = 60 seats
    for (let row = 0; row < 15; row++) {
      const rowSeats = [];
      const startSeat = row * 4 + 1;
      
      // Left side: 2 seats
      for (let i = 0; i < 2; i++) {
        const seatNum = startSeat + i;
        rowSeats.push(
          <div 
            key={seatNum} 
            className={`seat ${bookedSeats.has(seatNum) ? 'booked' : ''}`}
          >
            {seatNum}
          </div>
        );
      }
      
      // Aisle
      rowSeats.push(<div key={`aisle-${row}`} className="aisle"></div>);
      
      // Right side: 2 seats
      for (let i = 2; i < 4; i++) {
        const seatNum = startSeat + i;
        rowSeats.push(
          <div 
            key={seatNum} 
            className={`seat ${bookedSeats.has(seatNum) ? 'booked' : ''}`}
          >
            {seatNum}
          </div>
        );
      }
      
      rows.push(
        <div key={`row-${row}`} className="seat-row">
          {rowSeats}
        </div>
      );
    }
    
    // Last row: 5 seats (61-65)
    const lastRowSeats = [];
    for (let i = 61; i <= 65; i++) {
      lastRowSeats.push(
        <div 
          key={i} 
          className={`seat ${bookedSeats.has(i) ? 'booked' : ''}`}
        >
          {i}
        </div>
      );
    }
    
    rows.push(
      <div key="row-last" className="seat-row last-row">
        {lastRowSeats}
      </div>
    );
    
    return rows;
  }; 

  return (
    <>
      {/* Hidden printable area */}
      <div
        ref={targetRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '210mm',
          background: '#ffffff',
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <div className="ticket-container">
          {/* Header */}
          <div className="ticket-header">
            <img src="/images/logo.jpg" alt="BusQuick" className="company-logo" />
            <div className="booking-info">
              <div className="booking-number">Booking No. {booking._id?.substring(0, 16) || 'N/A'}</div>
              <div className="booking-date">Booked On: {formatDate(booking.bookingDate || new Date())}</div>
            </div>
          </div>

          {/* Title */}
          <div className="ticket-title-row">
            <div className="ticket-title">Ticket(s) Issued</div>
            <div className="bus-info-header">
              {getBusName()}: {getBusNumber()}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="main-grid">
            {/* Left Section */}
            <div className="left-section">
              {/* Passenger Info */}
              <div className="info-row">
                <div className="info-label">Passengers:</div>
                <div className="info-value">{booking.passengerDetails?.name || 'N/A'}</div>
              </div>
              <div className="info-row">
                <div className="info-label">E-Receipt Issued:</div>
                <div className="info-value">{formatDate(booking.bookingDate || new Date())}</div>
              </div>

              {/* Itinerary Section */}
              <div className="section-heading">trip plan</div>
              <div className="itinerary-route ">
                {route.from} to {route.to}
              </div>
              <div className="itinerary-detail">
                Seat(s): {seatNumbers.join(', ') || 'N/A'}
              </div>
              <div className="itinerary-detail"> 
                Departure Time: {formatTime(times.departure)}, {formatDate(busDate)}
              </div>
              <div className="itinerary-detail">
                Arrival Time: {formatTime(times.arrival)}, {formatDate(busDate)}
              </div>

              {/* Payment Details */}
              <div className="section-heading">Payment Details</div>
              <div className="payment-table">
                <div className="payment-row">
                  <div className="payment-item">Seat x{seatCount}</div>
                  <div className="payment-amount">ZMW {(pricePerSeat * seatCount).toFixed(2)}</div>
                </div>
                <div className="payment-row">
                  <div className="payment-item">Booking fee x1</div>
                  <div className="payment-amount">ZMW {bookingFee.toFixed(2)}</div>
                </div>
                <div className="payment-row total-row">
                  <div className="payment-item">Total</div>
                  <div className="payment-amount total-amount">ZMW {total.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Right Section - Seat Map */}
            <div className="right-section">
              <div className="seat-map-container">
                <div className="seat-map-header">Seat Map</div>
                <div className="seat-map">
                  {renderSeatMap()}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ticket-footer">
            <div className="footer-info">
              <strong>Important:</strong> Please arrive 30 to 45 minutes before departure. Present this ticket at boarding. For inquiries: infobusquick@gmail.com or +260960964433
            </div>
            <div className="footer-status">
              Status: <strong>PAID</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Visible download button */}
      <button
        className="download-pdf-button-compact"
        onClick={handleDownload}
        disabled={downloading}
        title="Download PDF Ticket"
      >
        {downloading ? 'Generating…' : 'Download PDF'}
      </button>
    </>
  );
};

export default PDFTicket;
