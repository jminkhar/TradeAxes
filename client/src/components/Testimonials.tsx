import React, { useState, useRef } from "react";

type Testimonial = {
  id: number;
  text: string;
  author: string;
  position: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "Axes Trade nous a fourni une solution d'impression complète qui nous a permis de réduire nos coûts de 30%. Le service client est exceptionnel et réactif.",
    author: "Sophie Martin",
    position: "Directrice Administrative, Groupe Dufour",
    rating: 5
  },
  {
    id: 2,
    text: "Nous travaillons avec Axes Trade depuis plus de 5 ans. Leur équipe technique est toujours disponible et intervient rapidement en cas de besoin. Je les recommande vivement.",
    author: "Thomas Dubois",
    position: "Responsable IT, Cabinet Juridique Lambert",
    rating: 5
  },
  {
    id: 3,
    text: "Axes Trade nous a aidés à mettre en place une solution d'impression éco-responsable. Leurs conseils nous ont permis d'optimiser notre consommation tout en améliorant la qualité.",
    author: "Marie Leclerc",
    position: "Gérante, Imprimerie Eco-Print",
    rating: 4.5
  }
];

const Testimonials: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToSlide = (index: number) => {
    setActiveSlide(index);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.querySelector('div')?.offsetWidth || 0;
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ce que nos clients disent</h2>
          <p className="text-lg max-w-3xl mx-auto opacity-90">
            Découvrez les témoignages de nos clients satisfaits par nos services et solutions.
          </p>
        </div>

        <div className="relative">
          <div 
            ref={carouselRef} 
            className="testimonial-carousel flex overflow-x-auto pb-8 -mx-4 px-4 gap-4 scrollbar-hide"
          >
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="min-w-[300px] w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-6 bg-white rounded-lg shadow-md text-neutral-800"
              >
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <p className="italic mb-6">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-neutral-300 rounded-full mr-4 flex items-center justify-center">
                    <i className="fas fa-user text-neutral-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-neutral-600">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                className={`w-3 h-3 rounded-full bg-white ${activeSlide === index ? 'opacity-100' : 'opacity-50'}`}
                onClick={() => scrollToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
