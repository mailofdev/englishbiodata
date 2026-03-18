import React from 'react';
import { useNavigate } from 'react-router-dom';

const KUNDALI_BG_IMAGE = '/kundalimilan.webp';

const QuoteSlideshow = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/kundali-match');
  };

  return (
    <section
      className="kundali-cta-section position-relative py-3 py-md-4 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(92, 45, 110, 0.72), rgba(61, 31, 78, 0.88)), url(${KUNDALI_BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--maza-primary)',
      }}
      aria-labelledby="kundali-cta-heading"
    >
      <div className="container position-relative px-3 px-md-4 py-3">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <h2 id="kundali-cta-heading" className="h4 fw-bold mb-1 mb-md-2 text-white">
              Online 36 Gun Kundali Milan (कुंडली गुणमिलन)
            </h2>
          </div>
          <div className="col-12 col-md-4 text-center text-md-end mt-2 mt-md-0">
            <button
              type="button"
              className="btn btn-light rounded-pill px-4 py-2 fw-semibold shadow-sm"
              onClick={handleJoinNow}
            >
              कुंडली गुणमिलन करा
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteSlideshow;
