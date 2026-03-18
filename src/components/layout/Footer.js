import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-auto py-4 py-lg-5">
      <div className="container">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-md-6 col-lg-4">
            <h5 className="fw-bold mb-3">mazabiodata.com</h5>
            <div className="d-flex flex-column gap-2 small">
              <a href="tel:+917776914543" className="text-white text-decoration-none d-flex align-items-center gap-2">
                <i className="fas fa-phone" aria-hidden="true" /> +91 77769 14543
              </a>
              <a href="mailto:mazabiodata@gmail.com" className="text-white text-decoration-none d-flex align-items-center gap-2">
                <i className="fas fa-envelope" aria-hidden="true" /> mazabiodata@gmail.com
              </a>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <h5 className="fw-bold mb-3">Follow Us</h5>
            <div className="d-flex gap-3 fs-5">
              <a href="https://www.facebook.com/people/Mazabiodata/61588046134260/" target="_blank" rel="noopener noreferrer" className="text-white opacity-75 hover-opacity-100" aria-label="Facebook">
                <i className="fab fa-facebook" />
              </a>
              <a href="https://www.instagram.com/mazabiodata?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-white opacity-75 hover-opacity-100" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
          <div className="col-12 col-md-12 col-lg-4">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2"><Link to="/about" className="text-white text-decoration-none">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-white text-decoration-none">Contact Us</Link></li>
              <li className="mb-2"><Link to="/terms" className="text-white text-decoration-none">Terms and Conditions</Link></li>
              <li className="mb-2"><Link to="/use-policy" className="text-white text-decoration-none">Use Policies</Link></li>
            </ul>
          </div>
        </div>
        <hr className="my-4 border-white border-opacity-25" />
        <p className="text-center small text-white text-opacity-90 mb-2" style={{ lineHeight: 1.6 }}>
          Marathi Marriage Biodata Maker | Marathi Biodata Maker | Online Biodata Maker | Marathi Biodata PDF Download | Kundali Matching Online | 36 Gun Milan | Bride Biodata | Groom Biodata | Marathi Lagna Patrika Format
        </p>
        <p className="text-center small text-white text-opacity-75 mb-0 d-flex flex-wrap align-items-center justify-content-center gap-1">
          <span>&copy; {new Date().getFullYear()} mazabiodata.com</span>
          <span className="text-white text-opacity-50">|</span>
          <span>Developed by</span>
          <a
            href="https://ankit-portfolio-website-lime.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none d-inline-flex align-items-center gap-1 px-2 py-1 rounded text-white fw-semibold border border-white border-opacity-50 bg-white bg-opacity-10 transition-all"
            style={{
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="font-monospace">&lt;Alpha Ankit/&gt;</span>
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
