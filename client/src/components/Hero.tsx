import React from "react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative pt-24 md:pt-0">
      <div className="relative h-[70vh] min-h-[500px] bg-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Environnement de bureau professionnel avec imprimantes" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Solutions d'impression professionnelles pour votre entreprise
            </h1>
            <p className="text-lg md:text-xl text-white opacity-90 mb-8">
              Axes Trade vous accompagne dans le choix et la gestion de vos équipements d'impression. Expertise, conseil et service de qualité.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => scrollToSection("products")} 
                className="bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 py-3 h-auto"
              >
                Découvrir nos produits
              </Button>
              <Button 
                onClick={() => scrollToSection("contact")} 
                variant="outline"
                className="bg-white hover:bg-neutral-100 text-primary font-semibold px-6 py-3 h-auto"
              >
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Bar */}
      <div className="bg-primary py-3 text-white">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-6 my-2">
            <a href="tel:+33123456789" className="flex items-center hover:text-secondary transition-colors">
              <i className="fas fa-phone-alt mr-2"></i>
              <span>01 23 45 67 89</span>
            </a>
            <a href="mailto:contact@axestrade.com" className="flex items-center hover:text-secondary transition-colors">
              <i className="fas fa-envelope mr-2"></i>
              <span>contact@axestrade.com</span>
            </a>
          </div>
          <div className="flex items-center space-x-4 my-2">
            <a href="#" className="hover:text-secondary transition-colors" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-secondary transition-colors" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="https://wa.me/33123456789" className="hover:text-secondary transition-colors" aria-label="WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
