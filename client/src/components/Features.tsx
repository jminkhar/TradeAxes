import React from "react";

const features = [
  {
    icon: "award",
    title: "Expertise & Qualité",
    description: "Plus de 10 ans d'expérience dans la vente et maintenance d'équipements d'impression."
  },
  {
    icon: "hand-holding-usd",
    title: "Économies Garanties",
    description: "Des solutions optimisées pour réduire vos coûts d'impression et votre consommation d'énergie."
  },
  {
    icon: "tools",
    title: "Service Après-vente",
    description: "Maintenance rapide et efficace avec des techniciens qualifiés pour minimiser les interruptions."
  },
  {
    icon: "leaf",
    title: "Engagement Écologique",
    description: "Solutions éco-responsables et recyclage des consommables pour réduire l'impact environnemental."
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4">Pourquoi choisir Axes Trade ?</h2>
          <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
            Nous offrons des solutions complètes pour répondre à tous vos besoins d'impression professionnelle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover-scale">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className={`fas fa-${feature.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">{feature.title}</h3>
              <p className="text-center text-neutral-800">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
