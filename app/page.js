"use client";
import Navbar from '../components/Navbar.jsx';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth.js';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import CTA from '../components/CTA.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <main>
      <Navbar user={user} />
      <div className="pt-32 sm:pt-40 md:pt-48">
        <Hero />
        <Features />
        <CTA />
      </div>
      <Footer />
    </main>
  );
}
