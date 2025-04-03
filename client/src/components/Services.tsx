import React from "react";

const services = [
  {
    color: "primary",
    icon: "print",
    title: "Vente d'Équipements",
    description: "Large gamme d'imprimantes, scanners et multifonctions adaptés à vos besoins et votre budget.",
    features: [
      "Imprimantes laser & jet d'encre",
      "Multifonctions professionnels",
      "Scanners haute performance"
    ]
  },
  {
    color: "secondary",
    icon: "tools",
    title: "Maintenance & Réparation",
    description: "Service technique réactif pour garantir le bon fonctionnement de votre parc d'impression.",
    features: [
      "Contrats de maintenance adaptés",
      "Techniciens certifiés",
      "Intervention rapide sur site"
    ]
  },
  {
    color: "primary-light",
    icon: "tachometer-alt",
    title: "Solutions de Gestion",
    description: "Optimisez et contrôlez votre environnement d'impression pour plus d'efficacité.",
    features: [
      "Audit et optimisation",
      "Gestion centralisée du parc",
      "Sécurisation des documents"
    ]
  }
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Services</h2>
          <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
            Axes Trade vous propose un accompagnement complet pour vos solutions d'impression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-2 w-full bg-${service.color}`}></div>
              <div className={`text-4xl text-${service.color} mb-4`}>
                <i className={`fas fa-${service.icon}`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-neutral-800 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a 
                href="#contact" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-primary font-semibold hover:text-primary-dark transition-colors inline-flex items-center"
              >
                En savoir plus <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
