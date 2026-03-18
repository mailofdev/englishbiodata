import React from 'react';

const AboutUs = () => {
  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <h1 className="h2 fw-bold text-primary text-center mb-3">About Mazabiodata</h1>
          <p className="lead text-muted text-center mb-4">Your premier destination for personalized wedding biodata.</p>

          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <p className="lead text-muted mb-0" style={{ lineHeight: 1.75 }}>
                Welcome to Mazabiodata, your premier destination for creating personalized wedding biodata in PDF format. Our mission is to provide a seamless and efficient solution for couples seeking to showcase their love story in a beautiful and professional manner.
              </p>
            </div>
          </div>

          <h2 className="h5 fw-bold text-primary mb-3 pb-2 border-bottom border-2 border-warning">Why Choose Mazabiodata?</h2>
          <div className="card border-0 shadow-sm mb-4 rounded-3">
            <div className="card-body p-4 p-md-5">
              <ul className="list-unstyled small mb-0">
                <li className="mb-3 pb-2 border-bottom"><strong>Effortless Creation:</strong> Our user-friendly interface allows you to input your details with ease, guiding you through each step of the process.</li>
                <li className="mb-3 pb-2 border-bottom"><strong>Customization Options:</strong> Tailor your biodata to your preferences with various design templates and layout options.</li>
                <li className="mb-3 pb-2 border-bottom"><strong>High-Quality PDF Output:</strong> We ensure that every PDF biodata generated on our platform meets the highest standards of quality and professionalism.</li>
                <li className="mb-0"><strong>Instant Download:</strong> Once your biodata is ready, simply download it instantly and share it with your intended audience.</li>
              </ul>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3 bg-light">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold mb-3">Your Privacy Matters</h2>
              <p className="small text-muted mb-0" style={{ lineHeight: 1.75 }}>
                We understand the sensitivity of personal information, especially when it comes to matters of the heart. That&apos;s why we prioritize the privacy and security of your data, ensuring that your information remains confidential at all times.
              </p>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 rounded-3 border-primary border-2">
            <div className="card-body p-4 p-md-5">
              <h2 className="h5 fw-bold text-primary mb-3">Get Started Today!</h2>
              <p className="small text-muted mb-0" style={{ lineHeight: 1.75 }}>
                Ready to create your personalized PDF biodata? Sign up now and begin crafting a document that captures the essence of your love story. Mazabiodata is here to simplify the process and help you present your story with pride and confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
