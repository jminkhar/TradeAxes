import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  badge?: {
    text: string;
    color: string;
  };
  categories: string[];
};

const products: Product[] = [
  {
    id: 1,
    name: "HP LaserJet Pro M404",
    description: "Imprimante laser monochrome rapide et efficace pour les petites et moyennes entreprises.",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 299€",
    badge: {
      text: "Bestseller",
      color: "bg-primary-light"
    },
    categories: ["imprimantes"]
  },
  {
    id: 2,
    name: "Canon ImageCLASS MF743Cdw",
    description: "Multifonction couleur tout-en-un avec impression, numérisation, copie et télécopie.",
    image: "https://images.unsplash.com/photo-1586308985647-8c573b1349a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 499€",
    badge: {
      text: "Populaire",
      color: "bg-secondary"
    },
    categories: ["multifonctions"]
  },
  {
    id: 3,
    name: "Epson EcoTank ET-5850",
    description: "Imprimante à réservoirs d'encre rechargeables pour un coût à la page ultra-faible.",
    image: "https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 649€",
    badge: {
      text: "Écologique",
      color: "bg-green-600"
    },
    categories: ["imprimantes"]
  },
  {
    id: 4,
    name: "Brother HL-L3270CDW",
    description: "Imprimante laser couleur sans fil avec impression recto-verso automatique.",
    image: "https://images.unsplash.com/photo-1586829135343-933edb373c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 339€",
    categories: ["imprimantes"]
  },
  {
    id: 5,
    name: "Xerox WorkCentre 6515",
    description: "Multifonction couleur hautes performances pour groupes de travail de petite taille.",
    image: "https://images.unsplash.com/photo-1595006559489-4445576f3de0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 589€",
    categories: ["multifonctions"]
  },
  {
    id: 6,
    name: "Fujitsu ScanSnap iX1600",
    description: "Scanner de documents ultra-rapide avec chargeur automatique et connexion Wi-Fi.",
    image: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "À partir de 399€",
    categories: ["scanners"]
  }
];

const categories = [
  { id: "all", name: "Tous les produits" },
  { id: "imprimantes", name: "Imprimantes" },
  { id: "multifonctions", name: "Multifonctions" },
  { id: "scanners", name: "Scanners" },
  { id: "consommables", name: "Consommables" }
];

const Products: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(product => product.categories.includes(activeCategory));

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Solutions d'Impression</h2>
          <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
            Découvrez notre gamme d'imprimantes et de solutions d'impression adaptées à tous types d'entreprises.
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-neutral-200 hover:bg-neutral-300"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover-scale">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  {product.badge && (
                    <span className={`${product.badge.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                      {product.badge.text}
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-800 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-semibold">{product.price}</span>
                  <Button 
                    onClick={() => scrollToSection("contact")} 
                    className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1 h-auto text-sm"
                  >
                    Demander un devis
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => scrollToSection("contact")} 
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 h-auto"
          >
            Consulter notre catalogue complet
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
