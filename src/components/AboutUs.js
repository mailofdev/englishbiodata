import React from 'react';
import { content } from '../content/staticContent';

const AboutUs = () => {
  const about = content.pages?.about;
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <h1 className="h2 fw-bold text-primary text-center mb-3">{about?.title}</h1>
          <p className="lead text-muted text-center mb-4">{about?.subtitle}</p>

          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <p className="lead text-muted mb-0" style={{ lineHeight: 1.75 }}>
                {about?.welcome}
              </p>
            </div>
          </div>

          <h2 className="h5 fw-bold text-primary mb-3 pb-2 border-bottom border-2 border-warning">{about?.whyTitle}</h2>
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <ul className="list-unstyled small mb-0">
                {(about?.whyBullets || []).map((b, idx) => (
                  <li key={b.title || idx} className={idx === (about?.whyBullets || []).length - 1 ? 'mb-0' : 'mb-3 pb-2 border-bottom'}>
                    <strong>{b.title}</strong> {b.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3 bg-light">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold mb-3">{about?.privacyTitle}</h2>
              <p className="small text-muted mb-0" style={{ lineHeight: 1.75 }}>
                {about?.privacyText}
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3 border-primary border-2">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold text-primary mb-3">{about?.ctaTitle}</h2>
              <p className="small text-muted mb-0" style={{ lineHeight: 1.75 }}>
                {about?.ctaText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
