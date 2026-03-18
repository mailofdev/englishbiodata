import React from 'react';

const Contact = () => {
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <h1 className="h2 fw-bold text-center mb-3">Contact Us</h1>
          <p className="text-muted text-center marathi-text mb-4">आमच्याशी संपर्क साधण्यासाठी खालील माहिती वापरा.</p>

          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold text-primary mb-4">mazabiodata.com</h2>
              <div className="d-flex flex-column gap-3 small">
                <a href="mailto:mazabiodata@gmail.com" className="text-decoration-none d-flex align-items-center gap-3 p-3 rounded border border-secondary border-opacity-25 text-body">
                  <i className="fas fa-envelope text-primary" style={{ width: '1.5rem' }} aria-hidden="true" />
                  mazabiodata@gmail.com
                </a>
                <a href="tel:+917776914543" className="text-decoration-none d-flex align-items-center gap-3 p-3 rounded border border-secondary border-opacity-25 text-body">
                  <i className="fas fa-phone text-primary" style={{ width: '1.5rem' }} aria-hidden="true" />
                  +91 77769 14543
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
