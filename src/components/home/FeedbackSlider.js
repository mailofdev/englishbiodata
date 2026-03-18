import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import flowerIcon from '../../assets/Shape 44 1.svg';

const feedbacks = [
  {
    text: 'माझा बायोडाटा माध्यमामुळे माझा खूप वेळ वाचला. कमी किमतीमध्ये मला बायोडाटा बनवता आला. माझा बायोडाटा वरती अतिशय आकर्षक टेम्प्लेट उपलब्ध आहेत.',
    name: 'श्रीनिवास कदम',
  },
  {
    text: 'मला हवा तसा बायोडाटा खूप कमी वेळात बनवता आला. मला माझ्या आवडीचा टेम्प्लेट निवडता आला आणि वेळेची बचत झाली. मला हवा तसा जोडीदारही मिळाला- ',
    name: 'विशाखा पाटील',
  },
  {
    text: 'अतिशय जलद, सोपी, आणि किफायतशीर सेवा! या माध्यमामुळे मला माझा बायोडाटा प्रभावीपणे सादर करता आला. टेम्प्लेट्स खूप चांगल्या दर्जाच्या आहेत.',
    name: 'रोहित शिंदे',
  }
];

const FeedbackSlider = () => {
  return (
    <section className="border-0 shadow rounded-3 mb-4 py-4 py-md-5 bg-white">
      <div className="">
        <div className="">
          <div className="card-body p-4 text-center">
            <h2 className="h4 fw-bold text-primary mb-2">ग्राहकांचे अभिप्राय</h2>
            <p className="text-muted mb-0 marathi-text small">आमच्या वापरकर्त्यांचे अनुभव.</p>
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
                <p className="flex-grow-1 text-muted small mb-3 marathi-text" style={{ lineHeight: 1.7 }}>{feedback.text}</p>
                <h3 className="h6 fw-bold mb-0 text-primary marathi-text">{feedback.name}</h3>
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
