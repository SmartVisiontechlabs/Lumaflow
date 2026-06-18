import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface SEOMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  jsonLdSchema?: string | Record<string, any>;
}

export const SEOMetadata: React.FC<SEOMetadataProps> = ({
  title: propTitle,
  description: propDescription,
  keywords: propKeywords,
  ogImage: propOgImage,
  jsonLdSchema
}) => {
  const location = useLocation();
  const [dbSeo, setDbSeo] = useState<{
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_image_url?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSeo = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('seo_config')
          .select('meta_title, meta_description, meta_keywords, og_image_url')
          .eq('page_route', location.pathname)
          .maybeSingle();

        if (error) {
          console.warn(`Error fetching SEO config for ${location.pathname}:`, error);
          return;
        }

        if (data && active) {
          setDbSeo(data);
        } else if (active) {
          setDbSeo(null);
        }
      } catch (err) {
        console.error('Error fetching dynamic SEO metadata:', err);
      }
    };

    fetchSeo();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  // Premium Fallbacks
  const defaultTitle = "LumaFlow | Luxury Somatic Breathwork & Healing Sanctuary";
  const defaultDescription = "Experience high-end somatic breathwork journeys and ritual bookings designed to restore nervous system balance.";
  const defaultKeywords = "wellness, somatic healing, breathwork, meditation, luxury wellness, healing journey";
  const defaultOgImage = "/og-image.png";

  // Tiered Fallbacks
  const title = dbSeo?.meta_title || propTitle || defaultTitle;
  const description = dbSeo?.meta_description || propDescription || defaultDescription;
  const keywords = dbSeo?.meta_keywords || propKeywords || defaultKeywords;
  const ogImage = dbSeo?.og_image_url || propOgImage || defaultOgImage;

  // Construct absolute URL for canonical link and Open Graph
  const canonicalUrl = `https://thelumaflow.com${location.pathname === '/' ? '' : location.pathname}`;

  // Ensure ogImage is absolute
  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `https://thelumaflow.com${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  const googleSiteVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

  const schemaMarkup = typeof jsonLdSchema === 'object'
    ? JSON.stringify(jsonLdSchema)
    : jsonLdSchema;

  return (
    <Helmet>
      {/* Title Tag */}
      <title>{title}</title>

      {/* Meta Tags */}
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {googleSiteVerification && (
        <meta name="google-site-verification" content={googleSiteVerification} />
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured JSON-LD Data */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {schemaMarkup}
        </script>
      )}
    </Helmet>
  );
};

export default SEOMetadata;
