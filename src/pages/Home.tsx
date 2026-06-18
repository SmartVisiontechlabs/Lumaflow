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

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LumaFlow",
    "url": "https://thelumaflow.com",
    "logo": "https://thelumaflow.com/gold-logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://thelumaflow.com/contact"
    }
  };

  const wellnessBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "WellnessCenter",
    "name": "LumaFlow",
    "url": "https://thelumaflow.com",
    "image": "https://thelumaflow.com/gold-logo.png",
    "description": "Experience private breathwork, somatic healing, meditation, and nervous system restoration through personalized rituals designed to support deep healing and transformation.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "addressCountry": "US"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wellness Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Breathwork"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Somatic Healing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Meditation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Private Ritual Sessions"
          }
        }
      ]
    }
  };

  return (
    <>
      <SEOMetadata 
        title="LumaFlow | Breathwork, Somatic Healing & Nervous System Restoration"
        description="Experience private breathwork, somatic healing, meditation, and nervous system restoration through personalized rituals designed to support deep healing and transformation."
        keywords="breathwork, somatic healing, nervous system regulation, meditation, wellness coaching, healing rituals, virtual healing sessions, trauma informed breathwork"
        jsonLdSchema={[organizationSchema, wellnessBusinessSchema]}
      />
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

