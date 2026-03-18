import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/image-templates', label: 'Templates' },
    { to: '/kundali-match', label: 'Kundali Match' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center rounded primary-color border border-secondary" onClick={closeMenu} aria-label="Mazabiodata Home">
          <img src={`${process.env.PUBLIC_URL || ''}/logo1.jpeg`} alt="Mazabiodata" className="d-block" style={{ height: '44px', width: 'auto', objectFit: 'contain', color: 'white' }} />
        </Link>
        <button
          className="navbar-toggler border"
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {navLinks.map(({ to, label }) => (
              <li key={to} className="nav-item">
                <Link to={to} className={`nav-link px-3 py-2 ${isActive(to) ? 'active fw-semibold' : ''}`} onClick={closeMenu}>{label}</Link>
              </li>
            ))}
            <li className="nav-item d-lg-none">
              <Link to="/terms" className="nav-link px-3 py-2" onClick={closeMenu}>Terms & Conditions</Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
