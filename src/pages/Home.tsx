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

  const testimonials = useCmsStore(state => state.testimonials) || [];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LumaFlow",
    "url": "https://thelumaflow.com",
    "logo": "https://thelumaflow.com/gold-logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@thelumaflow.com",
      "url": "https://thelumaflow.com/contact"
    },
    "sameAs": [
      "https://www.instagram.com/lumaflow",
      "https://open.spotify.com/user/lumaflow",
      "https://g.page/lumaflow"
    ]
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "LumaFlow",
    "url": "https://thelumaflow.com",
    "image": "https://thelumaflow.com/og-image.png",
    "description": "Experience private breathwork, somatic healing, meditation, and nervous system restoration through personalized rituals designed to support deep healing and transformation.",
    "email": "support@thelumaflow.com",
    "areaServed": "United States",
    "sameAs": [
      "https://www.instagram.com/lumaflow",
      "https://open.spotify.com/user/lumaflow",
      "https://g.page/lumaflow"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Wellness Services",
      "itemListElement": [
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
            "name": "Breathwork"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Nervous System Regulation"
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
            "name": "Wellness Coaching"
          }
        }
      ]
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Somatic Healing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Somatic healing is a body-centered approach to wellness that helps release stress, trauma, and emotional tension stored within the physical body. By focusing on somatic awareness, conscious breath, and mindful movement, it supports deep nervous system regulation and transformation."
        }
      },
      {
        "@type": "Question",
        "name": "What happens during a session?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "During a session, you are guided through a personalized sequence of conscious breathing, body awareness practices, somatic movement, and integration. Every session is held in a safe, quiet, and sacred space tailored to support your nervous system's capacity."
        }
      },
      {
        "@type": "Question",
        "name": "Are sessions virtual?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we offer both Virtual sessions via Zoom and In-Person sessions at our private Soho sanctuary in Manhattan, New York."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can book directly through our digital booking scheduler at /book, choosing your preferred somatic path, format, and appointed date and time."
        }
      },
      {
        "@type": "Question",
        "name": "What should I expect before my first ritual?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Before your first session, we recommend wearing comfortable, loose-fitting clothing and refraining from eating heavy meals for at least two hours prior. Prepare a quiet space with headphones if virtual, or arrive 10 minutes early if attending in-person."
        }
      }
    ]
  };

  const reviewSchemaList = testimonials.map(t => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "ProfessionalService",
      "name": "LumaFlow",
      "image": "https://thelumaflow.com/gold-logo.png"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": t.rating || 5,
      "bestRating": 5
    },
    "author": {
      "@type": "Person",
      "name": t.client_name || "Valued Client"
    },
    "reviewBody": t.review_text || ""
  }));

  const allSchemas = [
    organizationSchema,
    professionalServiceSchema,
    faqSchema,
    ...reviewSchemaList
  ];

  return (
    <>
      <SEOMetadata 
        title="LumaFlow | Breathwork, Somatic Healing & Nervous System Restoration"
        description="Experience private breathwork, somatic healing, meditation, and nervous system restoration through personalized rituals designed to support deep healing and transformation."
        keywords="breathwork, somatic healing, nervous system regulation, meditation, wellness coaching, healing rituals, virtual healing sessions, trauma informed breathwork"
        jsonLdSchema={allSchemas}
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

