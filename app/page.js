import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import CTA from '../components/CTA.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <CTA />
      </div>
      <Footer />
    </main>
  );
}
