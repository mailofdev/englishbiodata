import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const TemplateSlider = ({ templates, onCustomizeClick, onPreviewClick }) => {
  const isMobile = useIsMobile();
  const groupedTemplates = [];
  for (let i = 0; i < templates.length; i += 12) {
    groupedTemplates.push(templates.slice(i, i + 12));
  }

  const templateCard = (template) => (
    <div key={template.id} className="card h-100 d-flex flex-column rounded-3 overflow-hidden shadow-sm border bg-white" style={{ borderColor: 'var(--maza-border)' }}>
      <img src={template.imageUrl} alt={template.altName || `Template ${template.id}`} className="card-img-top img-fluid bg-light" style={{ height: 280, objectFit: 'contain' }} />
      <div className="card-body gap-2 d-flex p-3">
        <button type="button" className="btn btn-outline-primary btn-sm w-50 rounded-pill" onClick={() => onPreviewClick(template)} aria-label="Preview">
          <i className="fas fa-eye me-1" aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-primary btn-sm w-50 rounded-pill" onClick={() => onCustomizeClick(template)}>Use</button>
      </div>
    </div>
  );

  return (
    <div className="w-100 p-3 p-md-4 overflow-hidden">
      {isMobile ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          className="p-3"
        >
          {groupedTemplates.map((group, index) => (
            <SwiperSlide key={index}>
              <div className="row g-3 mx-0">
                {group.map((template) => (
                  <div key={template.id} className="col-6">
                    {templateCard(template)}
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="row g-4">
          {templates.map((template) => (
            <div key={template.id} className="col-6 col-md-4 col-lg-3">
              {templateCard(template)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateSlider;
