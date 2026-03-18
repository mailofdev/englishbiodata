import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ToastProvider } from './components/ui/ToastContext';
import HomePage from './pages/Home';
import TemplatesPage from './pages/Templates';
import InputFormPage from './pages/InputForm';
import PreviewPage from './pages/Preview';
import KundaliMatchPage from './pages/KundaliMatch';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import TermsPage from './pages/Terms';
import UsePolicyPage from './pages/UsePolicy';
import JoinWhatsAppPage from './pages/JoinWhatsApp';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-L34TSEFVS9';

const JoinPage = () => (
  <div className="container py-5">
    <h2 className="text-center">Join Page Placeholder</h2>
  </div>
);

// Tracks page views on route changes (SPA navigation)
const GoogleAnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname + location.search;
    ReactGA.send({ hitType: 'pageview', page: path, title: document.title });
  }, [location.pathname, location.search]);
  return null;
};

const App = () => {
  useEffect(() => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }, []);
  return (
    <Router>
      <ToastProvider>
        <GoogleAnalyticsTracker />
        <AppLayout>
          <div className="py-3 py-md-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/image-templates" element={<TemplatesPage />} />
              <Route path="/input-form/:templateId" element={<InputFormPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/kundali-match" element={<KundaliMatchPage />} />
              <Route path="/use-policy" element={<UsePolicyPage />} />
              <Route path="/join-whatsapp-group" element={<JoinWhatsAppPage />} />
              <Route path="/join" element={<JoinPage />} />
            </Routes>
        </div>
      </AppLayout>
      </ToastProvider>
    </Router>
  );
};

export default App;
