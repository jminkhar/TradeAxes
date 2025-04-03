import React from "react";
import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Products from "@/components/Products";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import CallToAction from "@/components/CallToAction";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <NavBar />
      <main>
        <Hero />
        <Features />
        <Products />
        <Services />
        <Testimonials />
        <About />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
