import React from "react";

const values = [
  {
    name: "Expertise",
    description: "Une connaissance approfondie du secteur et des technologies d'impression"
  },
  {
    name: "Qualité",
    description: "Des produits et services irréprochables"
  },
  {
    name: "Proximité",
    description: "Une relation client privilégiée et un accompagnement personnalisé"
  },
  {
    name: "Responsabilité",
    description: "Un engagement fort pour des solutions éco-responsables"
  }
];

const images = [
  {
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    alt: "Équipe Axes Trade en réunion"
  },
  {
    src: "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    alt: "Showroom Axes Trade"
  },
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    alt: "Consultant Axes Trade avec client"
  },
  {
    src: "https://images.unsplash.com/photo-1581092787765-e31e8ecbf181?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    alt: "Technicien Axes Trade en intervention"
  }
];

const About: React.FC = () => {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">À Propos d'Axes Trade</h2>
            <p className="text-lg mb-4">
              Fondée en 2010, Axes Trade s'est rapidement imposée comme un acteur incontournable dans le domaine des solutions d'impression professionnelles.
            </p>
            <p className="mb-4">
              Notre mission est d'accompagner les entreprises dans l'optimisation de leur environnement d'impression, en proposant des solutions adaptées, économiques et respectueuses de l'environnement.
            </p>
            <p className="mb-6">
              Avec plus de 500 clients satisfaits et une équipe de 25 experts passionnés, nous mettons notre expertise au service de votre réussite.
            </p>
            
            <div className="bg-neutral-100 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">Nos Valeurs</h3>
              <ul className="space-y-3">
                {values.map((value, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                    <span><strong>{value.name}</strong> - {value.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
