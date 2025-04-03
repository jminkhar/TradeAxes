import React from "react";
import { scrollToSection } from "@/lib/utils";

const quickLinks = [
  { id: "hero", label: "Accueil" },
  { id: "products", label: "Produits" },
  { id: "services", label: "Services" },
  { id: "about", label: "À Propos" },
  { id: "contact", label: "Contact" },
  { id: "#", label: "Blog" }
];

const products = [
  { id: "#", label: "Imprimantes laser" },
  { id: "#", label: "Imprimantes jet d'encre" },
  { id: "#", label: "Multifonctions" },
  { id: "#", label: "Scanners" },
  { id: "#", label: "Consommables" },
  { id: "#", label: "Accessoires" }
];

const Footer: React.FC = () => {
  const handleLinkClick = (id: string) => {
    if (id !== "#") {
      scrollToSection(id);
    }
  };

  return (
    <footer className="bg-neutral-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-6">
              <span className="text-secondary">AXES</span> TRADE
            </div>
            <p className="mb-6 text-neutral-400">
              Votre partenaire de confiance pour toutes vos solutions d'impression professionnelles depuis 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-secondary transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-secondary transition-colors" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-secondary transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-neutral-400 hover:text-secondary transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liens rapides</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="text-neutral-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Nos produits</h3>
            <ul className="space-y-3">
              {products.map((product, index) => (
                <li key={index}>
                  <a href={product.id} className="text-neutral-400 hover:text-secondary transition-colors">
                    {product.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-3 text-neutral-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-secondary"></i>
                <span>123 Avenue des Imprimeurs<br/>75001 Paris, France</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-3 text-secondary"></i>
                <a href="tel:+33123456789" className="hover:text-secondary transition-colors">01 23 45 67 89</a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-secondary"></i>
                <a href="mailto:contact@axestrade.com" className="hover:text-secondary transition-colors">contact@axestrade.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-neutral-800 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-neutral-500 text-sm">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Axes Trade. Tous droits réservés.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-secondary transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-secondary transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-secondary transition-colors">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
