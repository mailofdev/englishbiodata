import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateSlider from '../../components/home/TemplateSlider';
import { content } from '../../content/staticContent';

// const categories = ['All', 'Hindu', 'Muslim', 'Jain', 'Baudhha'];

const TemplatesPage = () => {
  const navigate = useNavigate();
  // const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const templatesPage = content.pages?.templates;

  const templates = [
    { id: 1, category: 'Hindu', imageUrl: './Marriage Biodata Template-01.png', bestSeller: true },
    { id: 2, category: 'Muslim', imageUrl: './Marriage Biodata Template-02.png', bestSeller: false },
    { id: 3, category: 'Hindu', imageUrl: './Marriage Biodata Template-03.png', bestSeller: false },
    { id: 4, category: 'Hindu', imageUrl: './Marriage Biodata Template-04.png', bestSeller: false },
    { id: 5, category: 'Hindu', imageUrl: './Marriage Biodata Template-05.png', bestSeller: false },
    { id: 6, category: 'Hindu', imageUrl: './Marriage Biodata Template-06.png', bestSeller: false },
    { id: 7, category: 'Muslim', imageUrl: './Marriage Biodata Template-07.png', bestSeller: false },
    { id: 8, category: 'Jain', imageUrl: './Marriage Biodata Template-08.png', bestSeller: true },
    { id: 9, category: 'Hindu', imageUrl: './Marriage Biodata Template-09.png', bestSeller: false },
    { id: 10, category: 'Baudhha', imageUrl: './Marriage Biodata Template-10.png', bestSeller: false },
    { id: 11, category: 'Jain', imageUrl: './Marriage Biodata Template-11.png', bestSeller: false },
    { id: 12, category: 'Jain', imageUrl: './Marriage Biodata Template-12.png', bestSeller: false },
  ];

  const handleCustomizeClick = (template) => navigate(`/input-form/${template.id}`);
  const handlePreviewClick = (template) => setPreviewTemplate(template);
  const handleClosePreview = () => setPreviewTemplate(null);
  // const filteredTemplates = selectedCategory === 'All' ? templates : templates.filter((t) => t.category === selectedCategory);
  const filteredTemplates = templates;

  return (
    <div className="container py-4 py-lg-5">
      <section id="templates-section">
        <h1 className="h2 fw-bold text-center mb-2">{templatesPage?.title}</h1>
        <p className="text-muted text-center app-body-text mb-4">{templatesPage?.subtitle}</p>
        {/* <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn rounded-pill px-3 px-md-4 py-2 ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div> */}
        <TemplateSlider templates={filteredTemplates} onCustomizeClick={handleCustomizeClick} onPreviewClick={handlePreviewClick} />
      </section>

      {previewTemplate && (
        <div className="template-preview-modal modal d-block bg-dark bg-opacity-50" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="templatesPreviewTitle">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow rounded-3">
              <div className="modal-header border-0 position-relative flex-shrink-0">
                <h5 id="templatesPreviewTitle" className="modal-title fw-bold">{templatesPage?.previewTitle}</h5>
                <button type="button" className="btn-close position-absolute top-0 end-0 m-2" aria-label="Close" onClick={handleClosePreview} />
              </div>
              <div className="modal-body text-center">
                <img src={previewTemplate.imageUrl} alt={`Template ${previewTemplate.id}`} className="img-fluid rounded shadow-sm" />
                <div className="d-flex flex-wrap gap-2 justify-content-center mt-3 flex-shrink-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleClosePreview}>{templatesPage?.close}</button>
                  <button type="button" className="btn btn-primary" onClick={() => handleCustomizeClick(previewTemplate)}>{templatesPage?.customize}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
