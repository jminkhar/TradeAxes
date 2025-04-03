import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [privacy, setPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacy) {
      toast({
        title: "Erreur",
        description: "Veuillez accepter la politique de confidentialité.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/contact', formData);
      
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setPrivacy(false);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contactez-nous</h2>
          <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans vos projets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6">Envoyez-nous un message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">Nom complet *</label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold mb-2">Entreprise</label>
                  <Input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">Email *</label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold mb-2">Téléphone</label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2">Sujet *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="devis">Demande de devis</option>
                  <option value="information">Demande d'information</option>
                  <option value="support">Support technique</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2">Message *</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={privacy}
                  onChange={() => setPrivacy(!privacy)}
                  required
                  className="mt-1 mr-3"
                />
                <label htmlFor="privacy" className="text-sm">
                  J'accepte que mes données soient traitées conformément à la <a href="#" className="text-primary hover:underline">politique de confidentialité</a> *
                </label>
              </div>
              
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 h-auto"
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Contact Information */}
          <div>
            <div className="bg-primary text-white p-8 rounded-lg shadow-md mb-8">
              <h3 className="text-2xl font-semibold mb-6">Informations de contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-secondary text-xl mt-1 mr-4">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Adresse</h4>
                    <p>123 Avenue des Imprimeurs<br/>75001 Paris, France</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-secondary text-xl mt-1 mr-4">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Téléphone</h4>
                    <p><a href="tel:+33123456789" className="hover:text-secondary transition-colors">01 23 45 67 89</a></p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-secondary text-xl mt-1 mr-4">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p><a href="mailto:contact@axestrade.com" className="hover:text-secondary transition-colors">contact@axestrade.com</a></p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-secondary text-xl mt-1 mr-4">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">Horaires d'ouverture</h4>
                    <p>Lundi - Vendredi: 9h00 - 18h00<br/>Samedi: 9h00 - 12h00</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-semibold mb-3">Suivez-nous</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a href="#" className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Contactez-nous directement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="tel:+33123456789" className="flex items-center justify-center bg-primary hover:bg-primary-dark text-white p-4 rounded-md transition-colors">
                  <i className="fas fa-phone-alt mr-2"></i> Appelez-nous
                </a>
                <a href="https://wa.me/33123456789" className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-4 rounded-md transition-colors">
                  <i className="fab fa-whatsapp mr-2"></i> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
