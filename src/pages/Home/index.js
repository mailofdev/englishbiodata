import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuoteSlideshow from '../../components/home/QuoteSlideshow';
import TemplateSlider from '../../components/home/TemplateSlider';
import marriage3Image from '../../assets/images/hands2.jpeg';

const FAQ_ITEMS = [
  { q: 'How to create Marathi marriage biodata online?', a: 'Select a template (टेम्प्लेट निवडा), fill in details (माहिती भरा), preview (पूर्वावलोकन पाहा), and download the PDF (PDF डाउनलोड करा).' },
  { q: 'Is Marathi biodata maker free?', a: 'Preview is free (मोफत पूर्वावलोकन). Final download may require a small fee (डाउनलोडसाठी शुल्क लागू शकते).' },
  { q: 'What details should be included in marriage biodata?', a: 'Name (नाव), Date of Birth (जन्मतारीख), Height (उंची), Education (शिक्षण), Profession (व्यवसाय), Family details (कुटुंब माहिती), Horoscope details (कुंडली माहिती), Contact number (संपर्क क्रमांक).' },
  { q: 'Is Kundali matching necessary for marriage?', a: 'In traditional Hindu marriages, Kundali matching (कुंडली जुळवणी) is considered important for compatibility analysis.' },
  { q: 'Can biodata be edited after creation?', a: 'Yes, you can edit details (माहिती संपादित करा) before final PDF download (अंतिम डाउनलोडपूर्वी बदल शक्य).' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const templates = [
    { id: 1, category: 'Hindu', imageUrl: './Marriage Biodata Template-01.png', bestSeller: true, altName: 'मराठी बायोडाटा मेकर' },
    { id: 2, category: 'Muslim', imageUrl: './Marriage Biodata Template-02.png', bestSeller: false, altName: 'फ्री बायोडाटा बनवा' },
    { id: 3, category: 'Hindu', imageUrl: './Marriage Biodata Template-03.png', bestSeller: false, altName: 'मराठी बायोडाटा टेम्प्लेट्स' },
    { id: 4, category: 'Hindu', imageUrl: './Marriage Biodata Template-04.png', bestSeller: false, altName: 'आकर्षक बायोडाटा तयार करा' },
    { id: 5, category: 'Hindu', imageUrl: './Marriage Biodata Template-05.png', bestSeller: false, altName: 'ऑनलाइन बायोडाटा जनरेटर' },
    { id: 6, category: 'Hindu', imageUrl: './Marriage Biodata Template-06.png', bestSeller: false, altName: 'बायोडाटा डिझाइन मराठीत' },
    { id: 7, category: 'Muslim', imageUrl: './Marriage Biodata Template-07.png', bestSeller: false, altName: 'बायोडाटा फॉर्म मराठी' },
    { id: 8, category: 'Jain', imageUrl: './Marriage Biodata Template-08.png', bestSeller: true, altName: 'आधुनिक बायोडाटा टेम्प्लेट' },
    { id: 9, category: 'Hindu', imageUrl: './Marriage Biodata Template-09.png', bestSeller: false, altName: 'लग्नाचा बायोडाटा' },
    { id: 10, category: 'Baudhha', imageUrl: './Marriage Biodata Template-10.png', bestSeller: false, altName: 'मराठी बायोडाटा मेकर' },
    { id: 11, category: 'Jain', imageUrl: './Marriage Biodata Template-11.png', bestSeller: false, altName: 'मराठी बायोडाटा उदाहरण' },
    { id: 12, category: 'Jain', imageUrl: './Marriage Biodata Template-12.png', bestSeller: false, altName: 'वैयक्तिक माहिती बायोडाटा मराठीत' },
  ];

  const handleCustomizeClick = (template) => navigate(`/input-form/${template.id}`);
  const handlePreviewClick = (template) => setPreviewTemplate(template);
  const handleClosePreview = () => setPreviewTemplate(null);
  const handleScrollToTemplates = () => document.getElementById('templates-section').scrollIntoView({ behavior: 'smooth' });
  const kundaliMatch = () => navigate('/kundali-match');
  const filteredTemplates = selectedCategory === 'All' ? templates : templates.filter((t) => t.category === selectedCategory);

  return (
    <div className="p-0">
      {/* 1. Hero – 3marrige image background + overlay for text readability */}
      <section
        className="hero-section hero-section-with-deco position-relative py-4 py-md-5 overflow-hidden hero-bg-image"
        style={{
          backgroundImage: `linear-gradient(rgba(92, 45, 110, 0.5), rgba(61, 31, 78, 0.82)), url(${marriage3Image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container position-relative py-4">
          <div className="row align-items-center justify-content-center g-4">
            {/* Left decorative SVG – document + heart (neutral, marriage theme) */}
            <div className="col-auto d-none d-lg-flex hero-deco hero-deco-left align-items-center justify-content-end pe-lg-4">
              {/* <HeroLeftSVG /> */}
            </div>
            {/* Center content */}
            <div className="col-12 text-center">
              <h1 className="hero-heading fw-bold mb-3">
                Marathi Marriage Biodata & 36 Gun Kundali Matching - All in One Place
              </h1>
              <p className="hero-subtitle lead mb-3 mx-auto opacity-90 marathi-text" style={{ maxWidth: '32rem' }}>
                Fast. Professional. Reliable.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-3 mb-3">
                <button type="button" className="btn btn-light btn-lg rounded-pill px-4 py-3 fw-semibold shadow" onClick={handleScrollToTemplates}>
                  बायोडाटा तयार करा
                </button>
                <button type="button" className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 fw-semibold border-2" onClick={kundaliMatch}>
                  कुंडली गुणमिलन
                </button>
              </div>

            </div>
            {/* Right decorative SVG – ring + hearts (neutral, marriage theme) */}
            <div className="col-auto d-none d-lg-flex hero-deco hero-deco-right align-items-center justify-content-start ps-lg-4">
              {/* <HeroRightSVG /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section – what you can generate & search keywords */}
      <section className="py-3 py-md-4 bg-light" aria-labelledby="intro-heading">
        <div className="container px-3 px-md-4">
          <div className="row g-3 g-md-4 align-items-start">
            <div className="col-12 col-lg-6">
              <p className="text-body mb-2">
                Create your Marathi Marriage Biodata online in just 2 minutes. MazaBiodata is a fast, simple, and professional Marathi Biodata Maker designed specifically for marriage purposes. Trending Marathi marriage biodata in Maharashtra.
              </p>
              <p className="text-body mb-2 fw-semibold">You can generate:</p>
              <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                <li className="d-flex align-items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Marathi marriage biodata PDF (मराठी लग्न बायोडाटा PDF)</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Bride & Groom biodata format (वधू-वर बायोडाटा फॉरमॅट)</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Online Kundali Matching (ऑनलाईन कुंडली जुळवणी)</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Traditional Marathi biodata designs (पारंपरिक मराठी डिझाईन)</span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Instant download without watermark (तत्काळ डाउनलोड)</span>
                </li>
              </ul>
            </div>
            <div className="col-12 col-lg-6">
              <div className="bg-white rounded-3 p-3 p-md-4 shadow-sm border border-1 h-100" style={{ borderColor: 'var(--maza-border)' }}>
                <p className="fw-semibold text-secondary mb-2 small">🔎 If you are searching for:</p>
                <ul className="list-unstyled d-flex flex-wrap gap-2 mb-2">
                  <li className="px-2 py-1 bg-light border rounded-pill small fw-medium" style={{ borderColor: 'var(--maza-border)' }}>&quot;marathi biodata maker online&quot;</li>
                  <li className="px-2 py-1 bg-light border rounded-pill small fw-medium" style={{ borderColor: 'var(--maza-border)' }}>&quot;marriage biodata format in marathi&quot;</li>
                  <li className="px-2 py-1 bg-light border rounded-pill small fw-medium" style={{ borderColor: 'var(--maza-border)' }}>&quot;kundali matching online marathi&quot;</li>
                  <li className="px-2 py-1 bg-light border rounded-pill small fw-medium" style={{ borderColor: 'var(--maza-border)' }}>&quot;lagna sathi biodata format&quot;</li>
                </ul>
                <p className="fw-semibold text-dark mb-0 small">This platform provides the fastest and easiest solution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How to Create Marathi Biodata in 2 Minutes */}
      <section className="py-3 py-md-4 bg-white" aria-labelledby="how-it-works-heading">
        <div className="container px-3 px-md-4">
          <h2 id="how-it-works-heading" className="h4 fw-bold text-primary text-center mb-2">How to Create Marathi Biodata in 2 Minutes</h2>
          <p className="text-center text-muted small mb-3">Follow these simple steps. No technical skills required. Mobile-friendly and user-friendly interface.</p>
          <div className="row g-3 g-md-4">
            <div className="col-12 col-md-4">
              <div className="card h-100 border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
                <div className="card-body text-center p-4 p-md-4">
                  <span className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold mb-3" style={{ width: 48, height: 48, fontSize: '1.25rem' }}>1</span>
                  <h3 className="h6 fw-bold text-primary mb-2">Choose a template (टेम्प्लेट निवडा)</h3>
                  <p className="text-muted small marathi-text mb-0">Click on &quot;Use Template&quot; (टेम्प्लेट वापरा).</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
                <div className="card-body text-center p-4 p-md-4">
                  <span className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold mb-3" style={{ width: 48, height: 48, fontSize: '1.25rem' }}>2</span>
                  <h3 className="h6 fw-bold text-primary mb-2">Fill required details (आवश्यक माहिती भरा)</h3>
                  <p className="text-muted small marathi-text mb-0">Enter your information in the simple form.</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100 border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
                <div className="card-body text-center p-4 p-md-4">
                  <span className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold mb-3" style={{ width: 48, height: 48, fontSize: '1.25rem' }}>3</span>
                  <h3 className="h6 fw-bold text-primary mb-2">Preview &amp; Download (पूर्वावलोकन पाहा • PDF डाउनलोड करा)</h3>
                  <p className="text-muted small marathi-text mb-0">Preview your biodata and download PDF instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuoteSlideshow />

      {/* Templates – card section header */}
      <section className="py-3 py-md-4 bg-white" id="templates-section">
        <div className="container px-3 px-md-4">
          <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
            <div className="card-body p-3 p-md-4 text-center border-bottom" style={{ borderColor: 'var(--maza-border)' }}>
              <h2 className="h4 fw-bold text-primary mb-2">Biodata Templates</h2>
              <p className="text-muted marathi-text mb-0">आपल्या आवडीचा टेम्प्लेट निवडा आणि वापरा बटनावर क्लिक करा.</p>
            </div>
            <TemplateSlider templates={filteredTemplates} onCustomizeClick={handleCustomizeClick} onPreviewClick={handlePreviewClick} />
          </div>
        </div>
      </section>

      {previewTemplate && (
        <div className="template-preview-modal modal fade show d-block bg-dark bg-opacity-75" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="previewModalTitle">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow rounded-3 border-0 overflow-hidden">
              <div className="modal-header border-0 position-relative flex-shrink-0 py-3 px-4">
                <h5 id="previewModalTitle" className="modal-title fw-bold">Template Preview</h5>
                <button type="button" className="btn-close position-absolute top-0 end-0 m-2" onClick={handleClosePreview} aria-label="Close" />
              </div>
              <div className="modal-body text-center p-4">
                <img src={previewTemplate.imageUrl} alt={previewTemplate.altName || `Template ${previewTemplate.id}`} className="img-fluid rounded-3 shadow-sm" />
                <div className="d-flex flex-wrap gap-2 justify-content-center mt-4 flex-shrink-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={handleClosePreview}>Close</button>
                  <button type="button" className="btn btn-primary rounded-pill px-3" onClick={() => handleCustomizeClick(previewTemplate)}>वापरा / Customize</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Marriage Biodata is Important */}
      <section className="py-3 py-md-4 bg-white" aria-labelledby="why-biodata-heading">
        <div className="container px-3 px-md-4">
          <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
            <div className="card-body p-3 p-md-4">
              <h2 id="why-biodata-heading" className="h4 fw-bold text-primary mb-3">Why Marriage Biodata is Important?</h2>
                  <p className="text-justify mb-3 small">
                    Marriage Biodata plays a critical role in arranged marriages. It helps families understand background, education, profession, and values clearly and systematically.
                  </p>
                  <p className="mb-2 small fw-semibold">A complete marriage biodata should include:</p>
                  <ul className="small mb-3">
                    <li>Personal details (नाव, जन्मतारीख, उंची)</li>
                    <li>Education information (शिक्षण माहिती)</li>
                    <li>Profession details (व्यवसाय माहिती)</li>
                    <li>Family background (कुटुंब माहिती)</li>
                    <li>Horoscope details (कुंडली माहिती)</li>
                    <li>Contact information (संपर्क तपशील)</li>
                  </ul>
                  <p className="text-justify mb-0 small">
                    A professionally structured biodata creates a strong first impression and builds trust between families.
                  </p>
                </div>
          </div>
        </div>
      </section>

      {/* Online Kundali Matching (36 Gun Milan) */}
      <section className="py-3 py-md-4 bg-light" aria-labelledby="kundali-heading">
        <div className="container px-3 px-md-4">
          <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ borderColor: 'var(--maza-border)' }}>
            <div className="card-body p-3 p-md-4">
              <h2 id="kundali-heading" className="h4 fw-bold text-primary mb-3">Online Kundali Matching (36 Gun Milan)</h2>
                  <p className="text-justify mb-3 small">
                    We provide a simple and fast online Kundali Matching tool. You need to enter:
                  </p>
                  <ul className="small mb-3">
                    <li>Name (नाव)</li>
                    <li>Date of Birth (जन्मतारीख)</li>
                    <li>Time of Birth (जन्मवेळ)</li>
                    <li>Place of Birth (जन्मस्थान)</li>
                  </ul>
                  <p className="text-justify mb-4 small">
                    The system calculates compatibility score instantly based on traditional 36 Gun Milan system (३६ गुण जुळवणी पद्धत). Kundali matching is considered an important factor in many Hindu marriages for compatibility evaluation.
                  </p>
              <div className="text-center mt-2">
                <button type="button" className="btn btn-primary rounded-pill px-4 py-2 shadow-sm" onClick={kundaliMatch}>
                  Match Kundali Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biodata Formats Available */}
      <section className="py-3 py-md-4 bg-white" aria-labelledby="formats-heading">
        <div className="container px-3 px-md-4">
          <h2 id="formats-heading" className="h4 fw-bold text-primary text-center mb-2">Biodata Formats Available</h2>
          <p className="text-center text-muted small mb-3">We offer multiple biodata styles. All formats are designed keeping Marathi cultural expectations in mind.</p>
          <ul className="list-unstyled row g-3 justify-content-center small text-center mb-0">
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Bride biodata format (वधू बायोडाटा फॉरमॅट)</span></li>
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Groom biodata format (वर बायोडाटा फॉरमॅट)</span></li>
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Simple biodata format (साधा बायोडाटा)</span></li>
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Modern biodata layout (आधुनिक डिझाईन)</span></li>
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Traditional lagna biodata (पारंपरिक लग्न बायोडाटा)</span></li>
            <li className="col-12 col-sm-6 col-md-4"><span className="d-inline-block px-3 py-2 bg-light rounded-3 shadow-sm" style={{ border: '1px solid var(--maza-border)' }}>Biodata with horoscope section (कुंडलीसह बायोडाटा)</span></li>
          </ul>
        </div>
      </section>

      {/* Why Choose This Platform */}
      <section className="py-3 py-md-4 bg-light" aria-labelledby="why-choose-heading">
        <div className="container px-3 px-md-4">
          <div className="card border shadow-sm rounded-3 overflow-hidden p-3 p-md-4" style={{ borderColor: 'var(--maza-border)' }}>
            <h2 id="why-choose-heading" className="h4 fw-bold text-primary text-center mb-2">Why Choose This Platform?</h2>
            <p className="text-center text-muted small mb-3">Compared to other biodata websites. The focus is on speed, simplicity, and professional Marathi presentation.</p>
            <ul className="list-unstyled small mb-0 row g-2">
              <li className="col-12 col-md-6 col-lg-4 d-flex align-items-start gap-2"><span className="text-success fw-bold">✔</span> Faster generation process (जलद प्रक्रिया)</li>
              <li className="col-12 col-md-6 col-lg-4 d-flex align-items-start gap-2"><span className="text-success fw-bold">✔</span> Accurate Marathi formatting (अचूक मराठी मांडणी)</li>
              <li className="col-12 col-md-6 col-lg-4 d-flex align-items-start gap-2"><span className="text-success fw-bold">✔</span> Clean and simple user interface (सोपे वापरकर्ता इंटरफेस)</li>
              <li className="col-12 col-md-6 col-lg-4 d-flex align-items-start gap-2"><span className="text-success fw-bold">✔</span> Affordable pricing model (परवडणारी योजना)</li>
              <li className="col-12 col-md-6 col-lg-4 d-flex align-items-start gap-2"><span className="text-success fw-bold">✔</span> No unnecessary steps (अनावश्यक टप्पे नाहीत)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="py-3 py-md-4 bg-white" aria-labelledby="faq-heading">
        <div className="container px-3 px-md-4">
          <h2 id="faq-heading" className="h4 fw-bold text-primary text-center mb-3">Frequently Asked Questions (FAQ)</h2>
          <div className="accordion" id="faqAccordion">
                {FAQ_ITEMS.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div key={i} className="accordion-item border rounded-3 mb-3 overflow-hidden shadow-sm" style={{ borderColor: 'var(--maza-border)' }}>
                      <h3 className="accordion-header">
                        <button
                          className={`accordion-button small fw-semibold py-3 ${isOpen ? '' : 'collapsed'}`}
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-${i}`}
                        >
                          {faq.q}
                        </button>
                      </h3>
                      <div id={`faq-${i}`} className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
                        <div className="accordion-body small text-muted py-3">{faq.a}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
        </div>
      </section>

      {/* CTA – primary CTA & trust line */}
      <section className="py-3 py-md-4 bg-light border-top border-1" style={{ borderColor: 'var(--maza-border)' }} aria-labelledby="cta-heading">
        <div className="container px-3 px-md-4">
          <div className="row align-items-center justify-content-between g-2">
            <div className="col-12 col-md-6 col-lg-5">
              <h2 id="cta-heading" className="h5 fw-bold text-primary mb-0">Create Biodata Now &amp; Match Kundali Now</h2>
              <p className="text-muted small mb-0 mt-1">Get your Marathi marriage biodata in 2 minutes. Instant PDF download and 36 Gun Kundali matching.</p>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
                <button type="button" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm" onClick={handleScrollToTemplates}>
                  👉 Create Biodata Now
                </button>
                <button type="button" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold" onClick={kundaliMatch}>
                  Match Kundali Now
                </button>
              </div>
              <p className="small text-muted mb-0 mt-2 text-center text-md-end">✔ Trusted by 10,000+ Families &nbsp; ✔ Simple &amp; Fast Process &nbsp; ✔ Secure Payment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
