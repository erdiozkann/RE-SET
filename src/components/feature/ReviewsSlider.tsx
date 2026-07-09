import { useState, useEffect } from 'react';
import { reviewsApi } from '../../lib/api';
import type { Review } from '../../types';

export default function ReviewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewsApi.getAll();
        // Only show approved reviews
        setReviews(data.filter(r => r.approved));
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  useEffect(() => {
    // Tek yorum varken slider davranışı yok (boş vitrin hissi + gereksiz timer)
    if (reviews.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-stone-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-12"></div>
            <div className="bg-white rounded-3xl shadow-xl p-12">
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  const review = reviews[currentIndex];
  // rating tanımsız/ondalık/negatif olursa Array(rating) RangeError atardı → 0–5 tam sayıya sıkıştır.
  const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));

  return (
    <div className="bg-gradient-to-br from-stone-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-12">
          Danışanlarımızın Yorumları
        </h2>
        <div
          className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12"
          role="group"
          aria-roledescription="Danışan yorumu"
          aria-label={`Yorum ${currentIndex + 1} / ${reviews.length}`}
        >
          <div className="flex justify-center mb-4" aria-hidden="true">
            {[...Array(rating)].map((_, i) => (
              <i key={i} className="ri-star-fill text-2xl text-amber-400"></i>
            ))}
          </div>
          {rating > 0 && <span className="sr-only">{rating} / 5 yıldız</span>}
          <p className="text-xl text-gray-700 italic mb-6">"{review.text}"</p>
          <p className="text-lg font-semibold text-gray-900">{review.name}</p>
          {reviews.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`${index + 1}. yoruma git`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-[#D4AF37] w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
