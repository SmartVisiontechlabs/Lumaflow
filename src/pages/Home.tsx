import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import Healing from '../components/home/Healing';
import AboutMe from '../components/home/AboutMe';
import Quote from '../components/home/Quote';
import Testimonials from '../components/home/Testimonials';
import Program from '../components/home/Program';
import FinalCTA from '../components/home/FinalCTA';
import { useCmsStore } from '../store/cmsStore';
import SEOMetadata from '../components/seo/SEOMetadata';

export default function Home() {
  const fetchCMS = useCmsStore(state => state.fetchCMS);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WellnessCenter",
    "name": "LumaFlow",
    "image": "https://lumaflow.com/gold-logo.png",
    "description": "Experience high-end somatic breathwork journeys and ritual bookings designed to restore nervous system balance.",
    "url": "https://lumaflow.com/",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "addressCountry": "US"
    }
  };

  return (
    <>
      <SEOMetadata jsonLdSchema={homeSchema} />
      <Hero />
      <Healing />
      <AboutMe />
      <Quote />
      <Testimonials />
      <Program />
      <FinalCTA />
    </>
  );
}

