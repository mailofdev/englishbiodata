import React from 'react';
import { Link } from 'react-router-dom';
import { content } from '../../content/staticContent';

const Footer = () => {
  const quickLinks = content.footer?.quickLinks || [];
  return (
    <footer className="bg-primary text-white mt-auto py-4 py-lg-5">
      <div className="container">
        <div className="row g-4 g-lg-5">
          <div className="col-12 col-md-6 col-lg-4">
            <h5 className="fw-bold mb-3">{content.site?.domain || 'mazabiodata.com'}</h5>
            <div className="d-flex flex-column gap-2 small">
              <a href={content.contact?.phoneHref || '#'} className="text-white text-decoration-none d-flex align-items-center gap-2">
                <i className="fas fa-phone" aria-hidden="true" /> {content.contact?.phoneDisplay || ''}
              </a>
              <a href={content.contact?.emailHref || '#'} className="text-white text-decoration-none d-flex align-items-center gap-2">
                <i className="fas fa-envelope" aria-hidden="true" /> {content.contact?.emailDisplay || ''}
              </a>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-4">
            <h5 className="fw-bold mb-3">{content.footer?.followUsTitle || 'Follow Us'}</h5>
            <div className="d-flex gap-3 fs-5">
              <a href={content.social?.facebook?.href} target="_blank" rel="noopener noreferrer" className="text-white opacity-75 hover-opacity-100" aria-label={content.social?.facebook?.label || 'Facebook'}>
                <i className="fab fa-facebook" />
              </a>
              <a href={content.social?.instagram?.href} target="_blank" rel="noopener noreferrer" className="text-white opacity-75 hover-opacity-100" aria-label={content.social?.instagram?.label || 'Instagram'}>
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
          <div className="col-12 col-md-12 col-lg-4">
            <h5 className="fw-bold mb-3">{content.footer?.quickLinksTitle || 'Quick Links'}</h5>
            <ul className="list-unstyled small mb-0">
              {quickLinks.map(({ to, label }) => (
                <li key={to} className="mb-2"><Link to={to} className="text-white text-decoration-none">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <hr className="my-4 border-white border-opacity-25" />
        <p className="text-center small text-white text-opacity-90 mb-2" style={{ lineHeight: 1.6 }}>
          {content.footer?.seoLine || ''}
        </p>
        <p className="text-center small text-white text-opacity-75 mb-0 d-flex flex-wrap align-items-center justify-content-center gap-1">
          <span>&copy; {new Date().getFullYear()} {content.site?.domain || 'mazabiodata.com'}</span>
          <span className="text-white text-opacity-50">|</span>
          <span>{content.footer?.developedBy?.label || 'Developed by'}</span>
          <a
            href={content.footer?.developedBy?.url}
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
            <span className="font-monospace">{content.footer?.developedBy?.name || ''}</span>
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
