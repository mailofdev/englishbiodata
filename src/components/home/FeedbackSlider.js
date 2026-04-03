import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import flowerIcon from '../../assets/Shape 44 1.svg';

const feedbacks = [
  {
    text: 'This biodata maker saved me a lot of time. I was able to create a biodata at an affordable price, and the templates are very attractive.',
    name: 'Shrinivas Kadam',
  },
  {
    text: 'I created the exact biodata I wanted in very little time. I could choose my favorite template and save time. It was really helpful.',
    name: 'Vishakha Patil',
  },
  {
    text: 'Very fast, simple, and cost-effective service! It helped me present my biodata professionally. The templates are high quality.',
    name: 'Rohit Shinde',
  }
];

const FeedbackSlider = () => {
  return (
    <section className="border-0 shadow rounded-3 mb-4 py-4 py-md-5 bg-white">
      <div className="">
        <div className="">
          <div className="card-body p-4 text-center">
            <h2 className="h4 fw-bold text-primary mb-2">Customer Feedback</h2>
            <p className="text-muted mb-0 small">What our users say.</p>
          </div>
        </div>
        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          speed={600}
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          className="p-3"
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 }
          }}
        >
          {feedbacks.map((feedback, index) => (
            <SwiperSlide key={index}>
              <div className="card h-100 d-flex flex-column rounded-3 shadow border-0 bg-white overflow-hidden">
                <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <img src={flowerIcon} alt="" width="24" height="24" aria-hidden="true" />
                  <img src={flowerIcon} alt="" width="24" height="24" aria-hidden="true" />
                  <img src={flowerIcon} alt="" width="24" height="24" aria-hidden="true" />
                </div>
                <p className="flex-grow-1 text-muted small mb-3 app-body-text" style={{ lineHeight: 1.7 }}>{feedback.text}</p>
                <h3 className="h6 fw-bold mb-0 text-primary app-body-text">{feedback.name}</h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeedbackSlider;
