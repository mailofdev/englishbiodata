import React from 'react';
import { content } from '../content/staticContent';

const TermsAndConditions = () => {
  const terms = content.pages?.terms;
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <h1 className="h2 fw-bold text-center mb-4">{terms?.title}</h1>
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 p-md-5">
              <div className="small text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                {(terms?.paragraphs || []).map((p, idx) => (
                  <p key={idx} className={idx === (terms?.paragraphs || []).length - 1 ? 'mb-0' : 'mb-3'}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
