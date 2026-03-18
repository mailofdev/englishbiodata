import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main app layout: Header (fixed), scrollable content, Footer.
 * Uses Bootstrap for responsive structure. Padding-top on main compensates for fixed navbar.
 */
const AppLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
