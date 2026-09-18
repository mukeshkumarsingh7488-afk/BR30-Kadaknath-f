import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Rahul Kumar",
    location: "Patna",
    review: "The overall experience was smooth and the farm-focused approach gave me confidence while choosing Kadaknath products.",
  },
  {
    name: "Amit Singh",
    location: "Muzaffarpur",
    review: "I liked the simple ordering experience and the attention given to product quality and farm hygiene.",
  },
  {
    name: "Sanjay Verma",
    location: "Darbhanga",
    review: "The natural farming approach and focus on careful handling make the experience feel more personal.",
  },
  {
    name: "Vikas Kumar",
    location: "Sitamarhi",
    review: "Good communication and a straightforward experience. I especially liked the focus on farm-to-table products.",
  },
  {
    name: "Deepak Yadav",
    location: "Bihar",
    review: "Kadaknath products are not always easy to find. Having a dedicated farm makes the buying experience much easier.",
  },
  {
    name: "Rohit Sharma",
    location: "Hajipur",
    review: "I appreciate the clean presentation of the farm and the emphasis on responsible care of the birds.",
  },
  {
    name: "Manish Kumar",
    location: "Darbhanga",
    review: "The website makes it easy to understand the farm, products and the overall process before placing an order.",
  },
  {
    name: "Ankit Singh",
    location: "Shehor",
    review: "A farm-first approach is what I was looking for. The product information and presentation are easy to understand.",
  },
  {
    name: "Pankaj Verma",
    location: "Madhubani",
    review: "I liked the attention to cleanliness and careful handling. It gives a better understanding of where the products come from.",
  },
  {
    name: "Arjun Kumar",
    location: "Samastipur",
    review: "The overall experience feels simple and transparent, from learning about the farm to exploring the products.",
  },
  {
    name: "Naveen Kumar",
    location: "Patna",
    review: "The focus on naturally raised Kadaknath and responsible farm practices is what caught my attention.",
  },
  {
    name: "Vivek Singh",
    location: "Hajipur",
    review: "A clean and professional farm presentation with a clear focus on quality and customer experience.",
  },
];

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const desktopPages = Math.ceil(reviews.length / 3);

  const goNext = () => {
    setCurrentPage((prev) => (prev < desktopPages - 1 ? prev + 1 : 0));
  };

  const goPrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : desktopPages - 1));
  };

  const visibleReviews = reviews.slice(currentPage * 3, currentPage * 3 + 3);

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <div className="reviews-header">
          <div className="section-heading reviews-heading">
            <span className="section-eyebrow">Customer Voices</span>

            <h2>What Our Customers Say.</h2>

            <p>We believe good farm products should come with good care, transparency and a reliable customer experience.</p>
          </div>

          <div className="reviews-controls">
            <button type="button" className="review-arrow" onClick={goPrevious} aria-label="Previous reviews">
              <ChevronLeft size={22} />
            </button>

            <button type="button" className="review-arrow" onClick={goNext} aria-label="Next reviews">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div className="reviews-slider">
          {visibleReviews.map((review, index) => (
            <article className="review-card" key={`${review.name}-${currentPage}-${index}`}>
              <div className="review-card-top">
                <div className="quote-icon">
                  <Quote size={22} strokeWidth={2.2} />
                </div>

                <div className="stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} strokeWidth={2} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="review-text">“{review.review}”</p>

              <div className="review-author">
                <div className="author-avatar">{review.name.charAt(0)}</div>

                <div>
                  <h3>{review.name}</h3>
                  <span>{review.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="reviews-footer">
          <div className="review-dots">
            {Array.from({ length: desktopPages }).map((_, index) => (
              <button key={index} type="button" className={`review-dot ${currentPage === index ? "active" : ""}`} onClick={() => setCurrentPage(index)} aria-label={`Go to review group ${index + 1}`} />
            ))}
          </div>

          <div className="review-count">
            <span>
              {currentPage * 3 + 1}–{Math.min((currentPage + 1) * 3, reviews.length)}
            </span>
            <small>of {reviews.length} reviews</small>
          </div>
        </div>
      </div>

      <style>{`.reviews-section{padding:90px 0;background:var(--bg-page)}.reviews-header{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin-bottom:48px}.reviews-heading{max-width:700px;margin-bottom:0}.reviews-heading p{color:#1a120c}.reviews-controls{display:flex;align-items:center;gap:10px;flex-shrink:0}.review-arrow{display:flex;align-items:center;justify-content:center;width:46px;height:46px;padding:0;color:var(--color-primary);background:var(--color-white);border:1px solid var(--color-border-dark);border-radius:50%;transition:transform var(--transition-fast),background var(--transition-fast),color var(--transition-fast),border-color var(--transition-fast),box-shadow var(--transition-fast)}.review-arrow:hover{color:var(--color-white);background:var(--color-green);border-color:var(--color-green);transform:translateY(-2px);box-shadow:var(--shadow-sm)}.reviews-slider{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.review-card{position:relative;display:flex;flex-direction:column;min-height:310px;padding:30px;background:var(--color-white);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);animation:reviewFadeIn .35s ease;transition:transform var(--transition-normal),box-shadow var(--transition-normal),border-color var(--transition-normal)}.review-card:hover{transform:translateY(-5px);border-color:var(--color-border-dark);box-shadow:var(--shadow-md)}.review-card-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:26px}.quote-icon{display:flex;align-items:center;justify-content:center;width:46px;height:46px;color:var(--color-green);background:var(--color-green-pale);border-radius:50%}.stars{display:flex;align-items:center;gap:3px;color:var(--color-gold)}.review-text{flex:1;margin-bottom:28px;color:#1a120c;font-size:1rem;line-height:1.8}.review-author{display:flex;align-items:center;gap:13px;padding-top:20px;border-top:1px solid var(--color-border)}.author-avatar{display:flex;align-items:center;justify-content:center;flex:0 0 auto;width:42px;height:42px;color:var(--color-white);background:var(--color-green);border-radius:50%;font-size:.95rem;font-weight:800}.review-author h3{margin-bottom:2px;color:var(--color-primary);font-size:.95rem;font-weight:800}.review-author span{color:#1a120c;font-size:.8rem}.reviews-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:30px}.review-dots{display:flex;align-items:center;gap:7px}.review-dot{width:8px;height:8px;padding:0;background:var(--color-border-dark);border:0;border-radius:50%;transition:width var(--transition-fast),background var(--transition-fast)}.review-dot.active{width:26px;background:var(--color-green);border-radius:var(--radius-pill)}.review-count{display:flex;align-items:baseline;gap:6px;color:var(--color-primary);font-size:.9rem;font-weight:800}.review-count small{color:#1a120c;font-size:.78rem;font-weight:500}@keyframes reviewFadeIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}@media (max-width:991px){.reviews-header{align-items:flex-end}.reviews-slider{grid-template-columns:repeat(2,minmax(0,1fr))}.review-card:last-child{display:none}}@media (max-width:767px){.reviews-section{padding:65px 0}.reviews-header{align-items:flex-start;flex-direction:column;gap:24px;margin-bottom:34px}.reviews-controls{align-self:flex-end}.reviews-slider{grid-template-columns:1fr}.review-card{min-height:auto;padding:24px}.review-card:nth-child(n+2){display:none}.reviews-footer{margin-top:24px}}@media (max-width:480px){.review-arrow{width:42px;height:42px}.reviews-footer{align-items:center}}`}</style>
    </section>
  );
};

export default Reviews;
