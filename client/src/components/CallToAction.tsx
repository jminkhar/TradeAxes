import React from "react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

const CallToAction: React.FC = () => {
  return (
    <section className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à optimiser vos solutions d'impression ?</h2>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Contactez-nous dès aujourd'hui pour une étude personnalisée de vos besoins et un devis gratuit.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={() => scrollToSection("contact")} 
            className="bg-white text-secondary hover:bg-neutral-100 font-semibold px-8 py-3 h-auto text-lg"
          >
            Demander un devis
          </Button>
          <a 
            href="tel:+33123456789" 
            className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white hover:text-secondary font-semibold px-8 py-3 rounded-md transition-colors text-lg"
          >
            <i className="fas fa-phone-alt mr-2"></i> Nous appeler
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
