import React from 'react';
import { content } from '../content/staticContent';

const UsePolicy = () => {
  const policy = content.pages?.usePolicy;
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <h1 className="h2 fw-bold text-center mb-2">{policy?.title}</h1>
          <p className="text-center text-muted mb-4"><strong>{policy?.effectiveDateLabel} {policy?.effectiveDate}</strong></p>

          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 p-md-5">
              {(policy?.sections || []).map((s, idx) => (
                <React.Fragment key={s.title || idx}>
                  <h2 className="h6 fw-bold mt-4 mb-2">{s.title}</h2>
                  {Array.isArray(s.bodyLines) ? (
                    <p className="small text-muted mb-0">
                      {s.bodyLines.map((line, lineIdx) => (
                        <React.Fragment key={lineIdx}>
                          {line}
                          {lineIdx === s.bodyLines.length - 1 ? null : <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  ) : (
                    <p className={`small text-muted ${idx === (policy?.sections || []).length - 1 ? 'mb-0' : 'mb-4'}`} style={idx === 0 || idx === 1 ? { lineHeight: 1.75 } : undefined}>
                      {s.body}
                    </p>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsePolicy;
