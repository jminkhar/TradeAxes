import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    scrollToSection(id);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className={`fixed w-full bg-white shadow-md z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`} id="main-header">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <div className="font-bold text-2xl">
            <span style={{color: "#D92121"}}>AXES</span> <span style={{color: "#0A4D94"}}>TRADE</span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => handleNavClick("hero")} className="font-semibold hover:text-primary transition-colors">
            Accueil
          </button>
          <button onClick={() => handleNavClick("products")} className="font-semibold hover:text-primary transition-colors">
            Produits
          </button>
          <button onClick={() => handleNavClick("services")} className="font-semibold hover:text-primary transition-colors">
            Services
          </button>
          <button onClick={() => handleNavClick("about")} className="font-semibold hover:text-primary transition-colors">
            À Propos
          </button>
          <button onClick={() => handleNavClick("contact")} className="font-semibold hover:text-primary transition-colors">
            Contact
          </button>
          <Button onClick={() => handleNavClick("contact")} className="bg-secondary hover:bg-secondary-dark text-white">
            Demander un devis
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="md:hidden text-neutral-800 focus:outline-none"
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div className={`md:hidden bg-white pb-4 animate-fade-in ${isMenuOpen ? 'block' : 'hidden'}`}>
          <nav className="container mx-auto px-4 flex flex-col space-y-3">
            <button onClick={() => handleNavClick("hero")} className="py-2 font-semibold hover:text-primary transition-colors">
              Accueil
            </button>
            <button onClick={() => handleNavClick("products")} className="py-2 font-semibold hover:text-primary transition-colors">
              Produits
            </button>
            <button onClick={() => handleNavClick("services")} className="py-2 font-semibold hover:text-primary transition-colors">
              Services
            </button>
            <button onClick={() => handleNavClick("about")} className="py-2 font-semibold hover:text-primary transition-colors">
              À Propos
            </button>
            <button onClick={() => handleNavClick("contact")} className="py-2 font-semibold hover:text-primary transition-colors">
              Contact
            </button>
            <Button 
              onClick={() => handleNavClick("contact")} 
              className="bg-secondary hover:bg-secondary-dark text-white w-full mt-2"
            >
              Demander un devis
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
