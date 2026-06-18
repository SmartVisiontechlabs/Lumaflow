import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  User, 
  Quote as QuoteIcon, 
  Compass, 
  Brain, 
  Save, 
  Plus, 
  Edit, 
  Trash,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Mail,
  Gift
} from 'lucide-react';
import { cmsService } from '../../services/cmsService';
import { adminSupabase as supabase } from '../../lib/supabase';
import { useCmsStore } from '../../store/cmsStore';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
import { 
  HeroContent, 
  TransformationStep, 
  AboutAlanna, 
  Quote, 
  Testimonial, 
  HealingPath, 
  RecommendationMatrixEntry 
} from '../../types/cms';
import { Toast, ToastType } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

export default function CmsManager() {
  const [activeTab, setActiveTab] = useState<'hero' | 'steps' | 'about' | 'quotes' | 'paths' | 'matrix' | 'classes' | 'contact' | 'packages'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom pages content configurations (Classes, Contact)
  const [pagesContent, setPagesContent] = useState<Record<string, any>>({});
  const [pristinePagesContent, setPristinePagesContent] = useState<Record<string, any>>({});

  // Current Working Data States
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [steps, setSteps] = useState<TransformationStep[]>([]);
  const [about, setAbout] = useState<AboutAlanna | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paths, setPaths] = useState<HealingPath[]>([]);
  const [matrix, setMatrix] = useState<RecommendationMatrixEntry[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Pristine Copy for Dirty Checking
  const [pristineState, setPristineState] = useState<{
    hero: HeroContent | null;
    steps: TransformationStep[];
    about: AboutAlanna | null;
    quotes: Quote[];
    testimonials: Testimonial[];
    paths: HealingPath[];
    matrix: RecommendationMatrixEntry[];
  }>({
    hero: null,
    steps: [],
    about: null,
    quotes: [],
    testimonials: [],
    paths: [],
    matrix: []
  });

  // Editing Sub-states
  const [editingStep, setEditingStep] = useState<TransformationStep | null>(null);
  const [editingPath, setEditingPath] = useState<HealingPath | null>(null);
  const [editingMatrix, setEditingMatrix] = useState<RecommendationMatrixEntry | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Partial<Quote> | null>(null);
  
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
    } catch (e) {
      console.error('CMS auth token extraction error:', e);
    }
    return headers;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max_size = 1200;

            if (width > height) {
              if (width > max_size) {
                height *= max_size / width;
                width = max_size;
              }
            } else {
              if (height > max_size) {
                width *= max_size / height;
                height = max_size;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas 2D context not available');

            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

            const headers = await getAuthHeaders();
            const response = await fetch(`${API_URL}/cms/upload`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ image: compressedDataUrl })
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.error || 'Failed to upload image');
            }

            const data = await response.json();
            
            // Set the new photo_url in state
            setAbout(prev => prev ? { ...prev, photo_url: data.path } : null);
            showToast('Portrait image uploaded and compressed.', 'success');
          } catch (err: any) {
            console.error('Processing/uploading image error:', err);
            showToast(err.message || 'Error processing portrait image.', 'error');
          } finally {
            setIsUploading(false);
          }
        };
        img.onerror = () => {
          showToast('Failed to load image file.', 'error');
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File reading error:', error);
      showToast('Error reading selected file.', 'error');
      setIsUploading(false);
    }
  };

  // Load and map CMS data from DB
  const loadCmsData = async () => {
    setIsLoading(true);
    try {
      const [
        heroData,
        stepsData,
        aboutData,
        quotesData,
        testimonialsData,
        pathsData,
        matrixData,
        pagesData,
        packagesRes
      ] = await Promise.all([
        cmsService.getHeroContent(),
        cmsService.getTransformationSteps(),
        cmsService.getAboutAlanna(),
        cmsService.getQuotes(),
        cmsService.getTestimonials(),
        cmsService.getHealingPaths(),
        cmsService.getRecommendationMatrix(),
        cmsService.getPagesContent(),
        supabase.from('packages').select('*').order('created_at', { ascending: true })
      ]);

      // Form input mappings — check heroData?.id to avoid treating {} as a valid record
      const mappedHero: HeroContent = heroData?.id ? {
        id: heroData.id,
        headline: (heroData as any).title || heroData.headline || '',
        subheadline: (heroData as any).subtitle || heroData.subheadline || '',
        cta_text: (heroData as any).primary_cta_label || heroData.cta_text || '',
        cta_link: (heroData as any).primary_cta_link || heroData.cta_link || '',
        secondary_cta_text: (heroData as any).secondary_cta_label || heroData.secondary_cta_text || '',
        secondary_cta_link: (heroData as any).secondary_cta_link || heroData.secondary_cta_link || '',
        background_visual_url: heroData.background_visual_url || '',
        is_active: heroData.is_active || false
      } : { id: '', headline: '', subheadline: '', cta_text: '', cta_link: '', secondary_cta_text: '', secondary_cta_link: '' };

      const mappedSteps = stepsData.map(s => ({
        id: s.id,
        step_number: (s as any).step_number || s.sort_order || 1,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        icon_name: (s as any).icon || s.icon || 'Sparkles',
        is_active: s.is_active,
        created_at: s.created_at,
        updated_at: s.updated_at
      }));

      // check aboutData?.id to avoid treating {} as a valid record
      const mappedAbout: AboutAlanna = aboutData?.id ? {
        id: aboutData.id,
        name: aboutData.name || 'Alanna',
        photo_url: (aboutData as any).image_url || aboutData.photo_url || '',
        bio_title: (aboutData as any).title || aboutData.bio_title || '',
        quote: aboutData.quote || '',
        bio_body: (aboutData as any).bio || aboutData.bio_body || '',
        credentials: (aboutData as any).credentials || [],
        cta_label: (aboutData as any).button_label || aboutData.cta_label || 'Begin Your Journey',
        cta_link: (aboutData as any).button_link || aboutData.cta_link || '/book',
        updated_at: aboutData.updated_at
      } : {
        id: 'new-about-id',
        name: 'Alanna',
        photo_url: '',
        bio_title: 'Meet Alanna',
        quote: 'Healing is not about fixing ourselves; it is about remembering the alignment that was always there.',
        bio_body: 'Alanna is a dedicated somatic practitioner and breathwork therapist with over a decade of experience guiding individuals toward inner balance and nervous system resilience.',
        credentials: ['Certified Somatic Breathwork Facilitator', 'Nervous System Regulation Therapist', 'Integrative Sound Healer'],
        cta_label: 'Begin Your Journey',
        cta_link: '/book'
      };

      const mappedQuotes = quotesData.map(q => ({
        id: q.id,
        quote_text: (q as any).quote || q.quote_text || '',
        author_text: (q as any).author || q.author_text || 'Client Reflection',
        is_active: (q as any).is_active !== false,
        display_order: (q as any).sort_order || q.display_order || 1,
        created_at: q.created_at
      }));

      const mappedTestimonials = testimonialsData.map(t => ({
        id: t.id,
        name: (t as any).client_name || t.name || '',
        role: (t as any).program || t.role || '',
        quote: (t as any).review_text || t.quote || '',
        rating: t.rating || 5,
        is_featured: t.is_featured || false,
        is_active: (t as any).is_active !== false,
        display_order: (t as any).sort_order || t.display_order || 1,
        created_at: t.created_at
      }));

      const mappedPaths = pathsData.map(p => ({
        id: p.id,
        title: p.title,
        slug: (p as any).slug || p.title.toLowerCase().replace(/ /g, '-'),
        benefit: (p as any).description || p.benefit,
        duration_minutes: (p as any).duration || p.duration_minutes,
        price: p.price,
        cta_text: p.cta_text,
        display_order: (p as any).sort_order || p.display_order,
        is_active: p.is_active,
        created_at: p.created_at
      }));

      const mappedMatrix = matrixData.map(m => ({
        id: m.id,
        journey_type: (m as any).journey || m.journey_type,
        feeling: m.feeling,
        recommended_ritual: m.recommended_ritual,
        focus: m.focus,
        duration_minutes: (m as any).duration || m.duration_minutes,
        explanation: (m as any).recommended_plan || m.explanation,
        quote: (m as any).quote || '',
        confidence: (m as any).confidence_score || m.confidence,
        confidence_reason: (m as any).confidence_reason || 'Deeply aligned with your organic somatic rhythm.',
        alt_durations: (m as any).alt_durations || [(m as any).duration || m.duration_minutes],
        archetype: (m as any).archetype || 'Seeker'
      }));

      setHero(mappedHero);
      setSteps(mappedSteps);
      setAbout(mappedAbout);
      setQuotes(mappedQuotes);
      setTestimonials(mappedTestimonials);
      setPaths(mappedPaths);
      setMatrix(mappedMatrix);
      setPagesContent(pagesData || {});
      setPackages(packagesRes?.data || []);

      // Save baseline for dirty checking
      setPristineState({
        hero: JSON.parse(JSON.stringify(mappedHero)),
        steps: JSON.parse(JSON.stringify(mappedSteps)),
        about: JSON.parse(JSON.stringify(mappedAbout)),
        quotes: JSON.parse(JSON.stringify(mappedQuotes)),
        testimonials: JSON.parse(JSON.stringify(mappedTestimonials)),
        paths: JSON.parse(JSON.stringify(mappedPaths)),
        matrix: JSON.parse(JSON.stringify(mappedMatrix))
      });
      setPristinePagesContent(JSON.parse(JSON.stringify(pagesData || {})));

    } catch (e) {
      console.error('Error loading CMS data:', e);
      showToast('Failed to load some dashboard sections. Check console.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // Dirty state checks
  const isHeroDirty = JSON.stringify(hero) !== JSON.stringify(pristineState.hero);
  const isAboutDirty = JSON.stringify(about) !== JSON.stringify(pristineState.about);
  const isStepsDirty = JSON.stringify(steps) !== JSON.stringify(pristineState.steps);
  const isQuotesDirty = JSON.stringify(quotes) !== JSON.stringify(pristineState.quotes);
  const isTestimonialsDirty = JSON.stringify(testimonials) !== JSON.stringify(pristineState.testimonials);
  const isPathsDirty = JSON.stringify(paths) !== JSON.stringify(pristineState.paths);
  const isMatrixDirty = JSON.stringify(matrix) !== JSON.stringify(pristineState.matrix);
  const isClassesDirty = JSON.stringify(pagesContent.classes) !== JSON.stringify(pristinePagesContent.classes);
  const isContactDirty = JSON.stringify(pagesContent.contact) !== JSON.stringify(pristinePagesContent.contact);

  const getDirtyTabName = () => {
    if (isHeroDirty) return 'Hero Section';
    if (isAboutDirty) return 'Founder Bio';
    if (isStepsDirty) return 'Steps Flow';
    if (isQuotesDirty || isTestimonialsDirty) return 'Quotes & Reviews';
    if (isPathsDirty) return 'Offerings';
    if (isMatrixDirty) return 'Intelligence Matrix';
    if (isClassesDirty) return 'Classes Page';
    if (isContactDirty) return 'Contact Page';
    return null;
  };

  const isDirty = isHeroDirty || isAboutDirty || isStepsDirty || isQuotesDirty || isTestimonialsDirty || isPathsDirty || isMatrixDirty || isClassesDirty || isContactDirty;

  // Discard all changes
  const handleDiscardChanges = () => {
    setHero(JSON.parse(JSON.stringify(pristineState.hero)));
    setSteps(JSON.parse(JSON.stringify(pristineState.steps)));
    setAbout(JSON.parse(JSON.stringify(pristineState.about)));
    setQuotes(JSON.parse(JSON.stringify(pristineState.quotes)));
    setTestimonials(JSON.parse(JSON.stringify(pristineState.testimonials)));
    setPaths(JSON.parse(JSON.stringify(pristineState.paths)));
    setMatrix(JSON.parse(JSON.stringify(pristineState.matrix)));
    setPagesContent(JSON.parse(JSON.stringify(pristinePagesContent)));
    setEditingStep(null);
    setEditingPath(null);
    setEditingMatrix(null);
    showToast('All unsaved modifications discarded.', 'info');
  };

  // Save Hero Content
  const handleSaveHero = async () => {
    if (!hero) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        title: hero.headline,
        subtitle: hero.subheadline,
        primary_cta_label: hero.cta_text,
        primary_cta_link: hero.cta_link,
        secondary_cta_label: hero.secondary_cta_text,
        secondary_cta_link: hero.secondary_cta_link
      };
      
      const updated = await cmsService.updateHeroContent(hero.id, dbPayload as any);
      await useCmsStore.getState().refetchCMS();
      
      showToast('Hero configuration synchronized successfully.', 'success');
      // Update pristine
      const newHero = { ...hero, updated_at: updated.updated_at };
      setHero(newHero);
      setPristineState(prev => ({ ...prev, hero: JSON.parse(JSON.stringify(newHero)) }));
    } catch (e) {
      console.error(e);
      showToast('Failed to archive hero changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!about) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        name: about.name || 'Alanna',
        image_url: about.photo_url,
        title: about.bio_title,
        quote: about.quote,
        bio: about.bio_body,
        credentials: about.credentials || [],
        button_label: about.cta_label,
        button_link: about.cta_link
      };

      await cmsService.updateAboutAlanna(about.id, dbPayload as any);
      await useCmsStore.getState().refetchCMS();
      showToast('Founder profile updated', 'success');
      setPristineState(prev => ({ ...prev, about: JSON.parse(JSON.stringify(about)) }));
    } catch (e) {
      console.error(e);
      showToast('Unable to save founder profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClasses = async () => {
    if (!pagesContent.classes) return;
    setIsSaving(true);
    try {
      await cmsService.updatePageContent('classes', pagesContent.classes);
      showToast('Classes Page configuration saved successfully.', 'success');
      setPristinePagesContent(prev => ({
        ...prev,
        classes: JSON.parse(JSON.stringify(pagesContent.classes))
      }));
    } catch (e) {
      console.error(e);
      showToast('Failed to save Classes Page changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async () => {
    if (!pagesContent.contact) return;
    setIsSaving(true);
    try {
      await cmsService.updatePageContent('contact', pagesContent.contact);
      showToast('Contact Page configuration saved successfully.', 'success');
      setPristinePagesContent(prev => ({
        ...prev,
        contact: JSON.parse(JSON.stringify(pagesContent.contact))
      }));
    } catch (e) {
      console.error(e);
      showToast('Failed to save Contact Page changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save specific transformation step
  const handleSaveStep = async () => {
    if (!editingStep) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        step_number: editingStep.step_number,
        title: editingStep.title,
        subtitle: editingStep.subtitle,
        description: editingStep.description,
        icon: editingStep.icon_name,
        is_active: editingStep.is_active
      };

      await cmsService.updateTransformationStep(editingStep.id, dbPayload as any);
      await useCmsStore.getState().refetchCMS();
      showToast(`Transformation step ${editingStep.step_number} updated.`, 'success');
      
      const newSteps = steps.map(s => s.id === editingStep.id ? editingStep : s);
      setSteps(newSteps);
      setPristineState(prev => ({ ...prev, steps: JSON.parse(JSON.stringify(newSteps)) }));
      setEditingStep(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to update step.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save healing path / offering details
  const handleSavePath = async () => {
    if (!editingPath) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        title: editingPath.title,
        description: editingPath.benefit || '',
        duration: editingPath.duration_minutes || 60,
        price: editingPath.price || 0,
        is_active: editingPath.is_active !== false,
        is_featured: editingPath.is_featured === true,
        sort_order: editingPath.sort_order || 0,
        image_url: editingPath.image_url || '/breathwork.jpg'
      };

      if (editingPath.id) {
        // Update existing path
        await cmsService.updateHealingPath(editingPath.id, dbPayload as any);
        showToast('Offering changes synchronized.', 'success');
      } else {
        // Create new path
        await cmsService.createHealingPath(dbPayload as any);
        showToast('New offering created successfully.', 'success');
      }
      
      await useCmsStore.getState().refetchCMS();
      const freshOfferings = useCmsStore.getState().offerings;
      const mappedPaths = freshOfferings.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        duration: p.duration,
        price: p.price,
        image_url: p.image_url,
        is_featured: p.is_featured,
        is_active: p.is_active,
        sort_order: p.sort_order,

        // Mapped client properties
        benefit: p.description,
        duration_minutes: p.duration,
        cta_text: p.cta_text,
        display_order: p.display_order,
        created_at: p.created_at
      }));
      setPaths(mappedPaths);
      setPristineState(prev => ({ ...prev, paths: JSON.parse(JSON.stringify(mappedPaths)) }));
      setEditingPath(null);
    } catch (e) {
      console.error(e);
      showToast(editingPath.id ? 'Failed to update offering details.' : 'Failed to create new offering.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete healing path / offering
  const handleDeletePath = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offering? This will also remove it from the home page and booking gateways.')) return;
    setIsSaving(true);
    try {
      await cmsService.deleteHealingPath(id);
      showToast('Offering deleted successfully.', 'success');
      await useCmsStore.getState().refetchCMS();
      
      const freshOfferings = useCmsStore.getState().offerings;
      const mappedPaths = freshOfferings.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        duration: p.duration,
        price: p.price,
        image_url: p.image_url,
        is_featured: p.is_featured,
        is_active: p.is_active,
        sort_order: p.sort_order,

        // Mapped client properties
        benefit: p.description,
        duration_minutes: p.duration,
        cta_text: p.cta_text,
        display_order: p.display_order,
        created_at: p.created_at
      }));
      setPaths(mappedPaths);
      setPristineState(prev => ({ ...prev, paths: JSON.parse(JSON.stringify(mappedPaths)) }));
      if (editingPath?.id === id) {
        setEditingPath(null);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to delete offering.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save recommendation matrix row change
  const handleSaveMatrixEntry = async () => {
    if (!editingMatrix || !editingMatrix.id) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        journey: editingMatrix.journey_type,
        feeling: editingMatrix.feeling,
        recommended_ritual: editingMatrix.recommended_ritual,
        duration: editingMatrix.duration_minutes,
        recommended_plan: editingMatrix.explanation,
        focus: editingMatrix.focus,
        confidence_score: editingMatrix.confidence
      };

      await cmsService.updateRecommendationMatrixEntry(editingMatrix.id, dbPayload as any);
      await useCmsStore.getState().refetchCMS();
      showToast('Intelligence matrix aligned.', 'success');
      
      const newMatrix = matrix.map(m => m.id === editingMatrix.id ? editingMatrix : m);
      setMatrix(newMatrix);
      setPristineState(prev => ({ ...prev, matrix: JSON.parse(JSON.stringify(newMatrix)) }));
      setEditingMatrix(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to align intelligence mapping.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save package changes
  const handleSavePackage = async () => {
    if (!editingPackage) return;
    setIsSaving(true);
    try {
      const payload: any = {
        name: editingPackage.name,
        description: editingPackage.description || '',
        price: Number(editingPackage.price) || 0,
        total_credits: Number(editingPackage.total_credits) || 0,
        is_featured: editingPackage.is_featured === true,
        is_active: editingPackage.is_active !== false,
        validity_months: Number(editingPackage.validity_months) || 1
      };

      if (editingPackage.id) {
        // Update existing package
        const { error } = await supabase
          .from('packages')
          .update(payload)
          .eq('id', editingPackage.id);

        if (error) throw error;
        showToast('Package details updated successfully.', 'success');
      } else {
        // Insert new package
        const slug = editingPackage.slug || editingPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { error } = await supabase
          .from('packages')
          .insert({
            ...payload,
            slug
          });

        if (error) throw error;
        showToast('New package created successfully.', 'success');
      }

      // Reload packages list from database
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: true });
      setPackages(data || []);
      setEditingPackage(null);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to save package.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete package
  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package? This will affect new client purchases.')) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) {
        // Check for foreign key constraint violation (Postgres code 23503 or HTTP 409)
        if (error.code === '23503' || error.status === 409 || error.message?.toLowerCase().includes('foreign key')) {
          console.log('Package is referenced by other records. Deactivating it instead.');
          const { error: updateError } = await supabase
            .from('packages')
            .update({ is_active: false })
            .eq('id', id);
          
          if (updateError) throw updateError;
          showToast('Package is referenced by active clients. It has been deactivated to preserve their history.', 'info');
        } else {
          throw error;
        }
      } else {
        showToast('Package deleted successfully.', 'success');
      }
      
      const { data } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: true });
      setPackages(data || []);
      if (editingPackage?.id === id) {
        setEditingPackage(null);
      }
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Failed to delete package.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Quote actions
  const handleSaveQuote = async () => {
    if (!editingQuote || !editingQuote.quote_text) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        quote: editingQuote.quote_text,
        author: editingQuote.author_text || 'Client Reflection',
        // For new quotes: auto-increment sort_order so they appear after existing ones in the cycle
        sort_order: editingQuote.id
          ? (editingQuote.display_order || 1)
          : (quotes.length + 1),
        is_featured: true
      };

      if (editingQuote.id) {
        const updated = await cmsService.updateQuote(editingQuote.id, dbPayload as any);
        const mappedUpdated = {
          id: updated.id,
          quote_text: (updated as any).quote,
          author_text: (updated as any).author,
          is_active: true,
          display_order: (updated as any).sort_order || 1,
          created_at: updated.created_at
        };
        const newQuotes = quotes.map(q => q.id === editingQuote.id ? mappedUpdated : q);
        setQuotes(newQuotes);
        setPristineState(prev => ({ ...prev, quotes: JSON.parse(JSON.stringify(newQuotes)) }));
      } else {
        const created = await cmsService.createQuote(dbPayload as any);
        const mappedCreated = {
          id: created.id,
          quote_text: (created as any).quote,
          author_text: (created as any).author,
          is_active: true,
          display_order: (created as any).sort_order || 1,
          created_at: created.created_at
        };
        const newQuotes = [...quotes, mappedCreated];
        setQuotes(newQuotes);
        setPristineState(prev => ({ ...prev, quotes: JSON.parse(JSON.stringify(newQuotes)) }));
      }
      await useCmsStore.getState().refetchCMS();
      showToast('Reflection quote archived.', 'success');
      setShowQuoteModal(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to archive quote.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to remove this quote from the archive?')) return;
    setIsSaving(true);
    try {
      await cmsService.deleteQuote(id);
      await useCmsStore.getState().refetchCMS();
      showToast('Quote removed successfully.', 'success');
      const newQuotes = quotes.filter(q => q.id !== id);
      setQuotes(newQuotes);
      setPristineState(prev => ({ ...prev, quotes: JSON.parse(JSON.stringify(newQuotes)) }));
    } catch (e) {
      console.error(e);
      showToast('Failed to delete quote.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Testimonial actions
  const handleSaveTestimonial = async () => {
    if (!editingTestimonial) return;
    if (!editingTestimonial.name) {
      showToast('Client name is required.', 'error');
      return;
    }
    if (!editingTestimonial.quote) {
      showToast('Review quote text is required.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const dbPayload = {
        client_name: editingTestimonial.name,
        program: editingTestimonial.role || 'Somatic Journey',
        review_text: editingTestimonial.quote,
        rating: editingTestimonial.rating || 5,
        is_featured: editingTestimonial.is_featured || false,
        sort_order: editingTestimonial.display_order || 1
      };

      if (editingTestimonial.id) {
        const updated = await cmsService.updateTestimonial(editingTestimonial.id, dbPayload as any);
        const mappedUpdated = {
          id: updated.id,
          name: (updated as any).client_name,
          role: (updated as any).program,
          quote: (updated as any).review_text,
          rating: updated.rating,
          is_featured: updated.is_featured,
          is_active: true,
          display_order: (updated as any).sort_order || 1,
          created_at: updated.created_at
        };
        const newTestimonials = testimonials.map(t => t.id === editingTestimonial.id ? mappedUpdated : t);
        setTestimonials(newTestimonials);
        setPristineState(prev => ({ ...prev, testimonials: JSON.parse(JSON.stringify(newTestimonials)) }));
      } else {
        const created = await cmsService.createTestimonial(dbPayload as any);
        const mappedCreated = {
          id: created.id,
          name: (created as any).client_name,
          role: (created as any).program,
          quote: (created as any).review_text,
          rating: created.rating,
          is_featured: created.is_featured,
          is_active: true,
          display_order: (created as any).sort_order || 1,
          created_at: created.created_at
        };
        const newTestimonials = [...testimonials, mappedCreated];
        setTestimonials(newTestimonials);
        setPristineState(prev => ({ ...prev, testimonials: JSON.parse(JSON.stringify(newTestimonials)) }));
      }
      await useCmsStore.getState().refetchCMS();
      showToast('Transformation story archived.', 'success');
      setShowTestimonialModal(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to archive review.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setIsSaving(true);
    try {
      await cmsService.deleteTestimonial(id);
      await useCmsStore.getState().refetchCMS();
      showToast('Review deleted successfully.', 'success');
      const newTestimonials = testimonials.filter(t => t.id !== id);
      setTestimonials(newTestimonials);
      setPristineState(prev => ({ ...prev, testimonials: JSON.parse(JSON.stringify(newTestimonials)) }));
    } catch (e) {
      console.error(e);
      showToast('Failed to delete review.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Accessing Sanctuary Elements...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: FileText },
    { id: 'steps', name: 'Steps Flow', icon: Sparkles },
    { id: 'about', name: 'Founder Bio', icon: User },
    { id: 'quotes', name: 'Quotes & Reviews', icon: QuoteIcon },
    { id: 'paths', name: 'Offerings', icon: Compass },
    { id: 'matrix', name: 'Intelligence Matrix', icon: Brain },
    { id: 'classes', name: 'Classes Page', icon: BookOpen },
    { id: 'contact', name: 'Contact Page', icon: Mail },
    { id: 'packages', name: 'Packages', icon: Gift },
  ] as const;

  return (
    <div className="space-y-12 pb-24 relative">
      
      {/* Sticky Synchronize Bar */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] max-w-xl w-[90%] glass border border-gold/20 px-8 py-4.5 rounded-full flex items-center justify-between shadow-luxury bg-white/80 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            {isSaving ? (
              <RefreshCw className="w-4 h-4 text-gold animate-spin" />
            ) : isDirty ? (
              <AlertCircle className="w-4 h-4 text-gold animate-pulseGlow" />
            ) : (
              <CheckCircle className="w-4 h-4 text-gold" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dark">
              {isSaving 
                ? 'Archiving changes to database...' 
                : isDirty 
                ? `Unsaved changes in ${getDirtyTabName()}` 
                : 'Sanctuary fully synchronized.'
              }
            </span>
          </div>

          {isDirty && !isSaving && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscardChanges}
                className="text-[9px] font-bold uppercase tracking-[0.25em] text-text-dark/40 hover:text-text-dark transition-colors cursor-pointer"
              >
                Discard
              </button>
              
              <button
                onClick={
                  activeTab === 'hero' ? handleSaveHero :
                  activeTab === 'about' ? handleSaveAbout :
                  activeTab === 'steps' && editingStep ? handleSaveStep :
                  activeTab === 'paths' && editingPath ? handleSavePath :
                  activeTab === 'matrix' && editingMatrix ? handleSaveMatrixEntry :
                  activeTab === 'classes' ? handleSaveClasses :
                  activeTab === 'contact' ? handleSaveContact :
                  () => showToast('Save changes inside specific cards below.', 'info')
                }
                className="px-6 py-2.5 bg-text-dark text-white hover:bg-gold rounded-full text-[9px] font-bold uppercase tracking-[0.25em] transition-all cursor-pointer shadow-luxury"
              >
                Sync Now
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tab Selector Capsule */}
      <div className="flex flex-wrap gap-3 bg-white/40 border border-text-dark/5 p-2 rounded-3xl backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 cursor-pointer",
              activeTab === tab.id 
                ? "bg-text-dark text-white shadow-luxury" 
                : "text-text-dark/50 hover:bg-white hover:text-text-dark"
            )}
          >
            <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-gold" : "text-text-dark/20")} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] p-12 shadow-luxury">
        {/* TAB 1: HERO CONTENT */}
        {activeTab === 'hero' && hero && (
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Redesign Hero Section</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Walking into healing light copy configurations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Title / Headline (Use \n for newlines)</label>
                <textarea
                  value={hero.headline}
                  onChange={e => setHero(prev => ({ ...prev!, headline: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all min-h-[100px]"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Subheadline</label>
                <textarea
                  value={hero.subheadline}
                  onChange={e => setHero(prev => ({ ...prev!, subheadline: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Primary CTA Label</label>
                <input
                  type="text"
                  value={hero.cta_text}
                  onChange={e => setHero(prev => ({ ...prev!, cta_text: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Primary CTA Link</label>
                <input
                  type="text"
                  value={hero.cta_link}
                  onChange={e => setHero(prev => ({ ...prev!, cta_link: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Secondary CTA Label</label>
                <input
                  type="text"
                  value={hero.secondary_cta_text}
                  onChange={e => setHero(prev => ({ ...prev!, secondary_cta_text: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Secondary CTA Link</label>
                <input
                  type="text"
                  value={hero.secondary_cta_link}
                  onChange={e => setHero(prev => ({ ...prev!, secondary_cta_link: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-text-dark/5">
              <button
                onClick={handleSaveHero}
                disabled={isSaving}
                className="flex items-center gap-3 px-12 py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-gold" />
                {isSaving ? 'Archiving...' : 'Archive Hero Changes'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFORMATION STEPS */}
        {activeTab === 'steps' && (
          <div className="space-y-10">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Transformation Steps</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify step-by-step healing process</p>
            </div>

            {editingStep ? (
              <div className="bg-cream/40 border border-text-dark/5 p-8 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Editing Step {editingStep.step_number}</span>
                  <button 
                    onClick={() => setEditingStep(null)} 
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40 hover:text-text-dark cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Step Title</label>
                    <input
                      type="text"
                      value={editingStep.title}
                      onChange={e => setEditingStep(prev => ({ ...prev!, title: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Subtitle / Action</label>
                    <input
                      type="text"
                      value={editingStep.subtitle}
                      onChange={e => setEditingStep(prev => ({ ...prev!, subtitle: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Description</label>
                    <textarea
                      value={editingStep.description}
                      onChange={e => setEditingStep(prev => ({ ...prev!, description: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Icon (Lucide name)</label>
                    <input
                      type="text"
                      value={editingStep.icon_name}
                      onChange={e => setEditingStep(prev => ({ ...prev!, icon_name: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveStep}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-8 py-4 bg-text-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-gold" />
                    Save Step {editingStep.step_number}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(step => (
                <div key={step.id} className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-[10px] font-bold text-gold">0{step.step_number}</span>
                      <span className="text-[9px] text-text-dark/20 font-bold uppercase tracking-widest">{step.icon_name}</span>
                    </div>
                    <div>
                      <h5 className="font-display text-xl text-text-dark">{step.title}</h5>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mt-1 block">{step.subtitle}</span>
                    </div>
                    <p className="text-xs text-text-dark/60 leading-relaxed font-light">{step.description}</p>
                  </div>

                  <button
                    onClick={() => setEditingStep(step)}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-cream hover:bg-gold/15 text-[10px] text-text-dark font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    <Edit className="w-3 h-3 text-gold" />
                    Modify Step
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FOUNDER BIO */}
        {activeTab === 'about' && about && (
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Meet Alanna — Bio Section</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify founder info, quote and credentials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Founder Portrait Upload Component */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Founder Portrait</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-text-dark/5 rounded-[2rem]">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-cream border border-text-dark/5 flex items-center justify-center group shadow-md shrink-0">
                    {about.photo_url ? (
                      <img 
                        src={about.photo_url} 
                        alt="Founder Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-text-dark/20" />
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-gold animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-center sm:text-left">
                    <h5 className="text-xs font-semibold text-text-dark">Sanctuary Portrait</h5>
                    <p className="text-[10px] text-text-dark/40 font-light leading-relaxed max-w-[240px]">
                      Select a high-resolution portrait. It will be compressed to an optimized JPG for fast, high-performance loading.
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-6 py-2.5 bg-cream hover:bg-gold/15 text-text-dark rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        {about.photo_url ? 'Replace Portrait' : 'Upload Portrait'}
                      </button>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder Name Input */}
              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Founder Name</label>
                <input
                  type="text"
                  value={about.name || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, name: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                  placeholder="e.g. Alanna"
                />
              </div>

              {/* Bio Title Input */}
              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Bio Title</label>
                <input
                  type="text"
                  value={about.bio_title || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, bio_title: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                  placeholder="e.g. Meet Alanna"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Personal Quote</label>
                <textarea
                  value={about.quote || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, quote: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Bio Narrative / Body</label>
                <textarea
                  value={about.bio_body || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, bio_body: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[120px]"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Credentials / Accreditations (One per line)</label>
                <textarea
                  value={(about.credentials || []).join('\n')}
                  onChange={e => setAbout(prev => ({ ...prev!, credentials: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Button Label</label>
                <input
                  type="text"
                  value={about.cta_label || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, cta_label: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Link</label>
                <input
                  type="text"
                  value={about.cta_link || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, cta_link: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-text-dark/5">
              <button
                onClick={handleSaveAbout}
                disabled={isSaving}
                className="flex items-center gap-3 px-12 py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700 cursor-pointer"
              >
                <Save className="w-4 h-4 text-gold" />
                {isSaving ? 'Saving...' : 'Save Sanctuary Updates'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: QUOTES & TESTIMONIALS */}
        {activeTab === 'quotes' && (
          <div className="space-y-12">
            {/* Quotes Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-display text-text-dark tracking-tight">Wisdom Quotes</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Large editorial section reflections</p>
                </div>
                <button
                  onClick={() => {
                    setEditingQuote({ quote_text: '', author_text: 'Client Reflection', is_active: true, display_order: 1 });
                    setShowQuoteModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-text-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-gold" />
                  Add Quote
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quotes.map(q => (
                  <div key={q.id} className="p-8 bg-white border border-text-dark/5 rounded-[2rem] flex flex-col justify-between">
                    <div>
                      <p className="font-display italic text-lg text-text-dark/95 leading-relaxed">“{q.quote_text}”</p>
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold mt-4 block">— {q.author_text || 'Anonymous'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-text-dark/5">
                      <button
                        onClick={() => {
                          setEditingQuote(q);
                          setShowQuoteModal(true);
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-text-dark/40 hover:text-gold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest cursor-pointer"
                      >
                        <Trash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="space-y-6 pt-8 border-t border-text-dark/5">
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-xl font-display text-text-dark tracking-tight">Stories of Transformation</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Review cards at the bottom grid</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTestimonial({ name: '', role: '', quote: '', rating: 5, is_featured: false, is_active: true, display_order: 1 });
                    setShowTestimonialModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-text-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-gold" />
                  Add Review
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map(t => (
                  <div 
                    key={t.id} 
                    className={cn(
                      "p-8 border rounded-[2rem] flex flex-col justify-between relative",
                      t.is_featured 
                        ? "bg-[#FAF8F5] border-[#CBAE73]/50 shadow-md" 
                        : "bg-white border-text-dark/5"
                    )}
                  >
                    {t.is_featured && (
                      <span className="absolute -top-3 right-6 px-3 py-1 bg-gold text-black text-[8px] font-bold uppercase tracking-widest rounded-full">
                        Featured Study
                      </span>
                    )}

                    <div className="space-y-4">
                      <p className="font-display italic text-sm text-text-dark/85 leading-relaxed">“{t.quote}”</p>
                      <div>
                        <p className="text-xs font-semibold text-text-dark">{t.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold mt-0.5">{t.role}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-text-dark/5">
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setShowTestimonialModal(true);
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-text-dark/40 hover:text-gold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest cursor-pointer"
                      >
                        <Trash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HEALING PATHS / OFFERINGS */}
        {activeTab === 'paths' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-2xl font-display text-text-dark tracking-tight">Sanctuary Offerings</h4>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Manage Core Somatic Healing Paths</p>
              </div>
              <button
                onClick={() => {
                  setEditingPath({
                    title: '',
                    benefit: '',
                    duration_minutes: 60,
                    price: 150,
                    is_active: true,
                    is_featured: false,
                    image_url: '/breathwork.jpg',
                    sort_order: paths.length + 1
                  } as any);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-text-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-gold" />
                Add Offering
              </button>
            </div>

            {editingPath ? (
              <div className="bg-cream/40 border border-text-dark/5 p-8 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                    {editingPath.id ? `Modifying: ${editingPath.title}` : 'Add New Sanctuary Offering'}
                  </span>
                  <button 
                    onClick={() => setEditingPath(null)} 
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40 hover:text-text-dark cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Offering Title</label>
                    <input
                      type="text"
                      value={editingPath.title || ''}
                      onChange={e => setEditingPath(prev => ({ ...prev!, title: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Short Benefit description</label>
                    <input
                      type="text"
                      value={editingPath.benefit || ''}
                      onChange={e => setEditingPath(prev => ({ ...prev!, benefit: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Base Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingPath.duration_minutes || 60}
                      onChange={e => setEditingPath(prev => ({ ...prev!, duration_minutes: parseInt(e.target.value) || 60 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Standard Price ($)</label>
                    <input
                      type="number"
                      value={editingPath.price || 0}
                      onChange={e => setEditingPath(prev => ({ ...prev!, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Sort Order</label>
                    <input
                      type="number"
                      value={editingPath.sort_order || 0}
                      onChange={e => setEditingPath(prev => ({ ...prev!, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Image Path / URL</label>
                    <input
                      type="text"
                      value={editingPath.image_url || '/breathwork.jpg'}
                      onChange={e => setEditingPath(prev => ({ ...prev!, image_url: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-text-dark/5 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Featured Offering</span>
                      <p className="text-[8px] text-text-dark/20 uppercase tracking-wider">Highlight on frontend</p>
                    </div>
                    <div 
                      onClick={() => setEditingPath(prev => ({ ...prev!, is_featured: !prev?.is_featured }))}
                      className="w-10 h-6 bg-text-dark/5 rounded-full p-1 cursor-pointer"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300",
                        editingPath.is_featured ? "bg-gold translate-x-4" : "bg-text-dark/15"
                      )} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-text-dark/5 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Active Status</span>
                      <p className="text-[8px] text-text-dark/20 uppercase tracking-wider">Show in client flows</p>
                    </div>
                    <div 
                      onClick={() => setEditingPath(prev => ({ ...prev!, is_active: prev?.is_active !== false ? false : true }))}
                      className="w-10 h-6 bg-text-dark/5 rounded-full p-1 cursor-pointer"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300",
                        editingPath.is_active !== false ? "bg-gold translate-x-4" : "bg-text-dark/15"
                      )} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSavePath}
                    className="flex items-center gap-3 px-8 py-4 bg-text-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-gold" />
                    Save Offering Details
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {paths.map(path => (
                <div key={path.id} className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{path.duration_minutes} Min Journey</span>
                      <span className="text-sm font-bold text-text-dark">${path.price}</span>
                    </div>
                    <h5 className="font-display text-2xl text-text-dark flex items-center gap-2">
                      {path.title}
                      {path.is_featured && <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>}
                      {!path.is_active && <span className="text-[8px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Inactive</span>}
                    </h5>
                    <p className="text-xs text-text-dark/60 leading-relaxed font-light">{path.benefit}</p>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        setEditingPath({
                          id: path.id,
                          title: path.title || '',
                          benefit: path.benefit || '',
                          duration_minutes: path.duration_minutes || 60,
                          price: path.price || 0,
                          sort_order: path.display_order !== undefined ? path.display_order : (path as any).sort_order || 0,
                          image_url: (path as any).image_url || '/breathwork.jpg',
                          is_active: path.is_active !== false,
                          is_featured: (path as any).is_featured === true
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-grow flex items-center justify-center gap-2 py-3.5 bg-cream hover:bg-gold/15 text-[10px] text-text-dark font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-gold" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePath(path.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 hover:bg-red-100 text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-red-100"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: RECOMMENDATION INTELLIGENCE MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-10">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Booking Intelligence Matrix</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify recommendation mappings for Journey Path + Emotional State</p>
            </div>

            {editingMatrix ? (
              <div className="bg-cream/40 border border-text-dark/5 p-10 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Aligning Mappings</span>
                    <h5 className="text-lg font-display text-text-dark">{editingMatrix.journey_type} for feeling "{editingMatrix.feeling}"</h5>
                  </div>
                  <button 
                    onClick={() => setEditingMatrix(null)} 
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40 hover:text-text-dark cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Recommended Ritual Name</label>
                    <input
                      type="text"
                      value={editingMatrix.recommended_ritual}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, recommended_ritual: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Ritual Focus Description</label>
                    <input
                      type="text"
                      value={editingMatrix.focus}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, focus: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Base Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingMatrix.duration_minutes}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, duration_minutes: parseInt(e.target.value) || 60 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Alternative Durations (Comma separated)</label>
                    <input
                      type="text"
                      value={editingMatrix.alt_durations.join(', ')}
                      onChange={e => setEditingMatrix(prev => ({ 
                        ...prev!, 
                        alt_durations: e.target.value.split(',').map(d => parseInt(d.trim())).filter(Boolean) 
                      }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Confidence Tier</label>
                    <select
                      value={editingMatrix.confidence}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, confidence: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    >
                      <option value="Highly Aligned">Highly Aligned</option>
                      <option value="Strong Match">Strong Match</option>
                      <option value="Resonant Path">Resonant Path</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Confidence Justification Statement</label>
                    <input
                      type="text"
                      value={editingMatrix.confidence_reason}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, confidence_reason: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Emotional Anchor Quote</label>
                    <input
                      type="text"
                      value={editingMatrix.quote}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, quote: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Explanation / Insight Body</label>
                    <textarea
                      value={editingMatrix.explanation}
                      onChange={e => setEditingMatrix(prev => ({ ...prev!, explanation: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveMatrixEntry}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-8 py-4 bg-text-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-gold" />
                    Save Mapping Alignment
                  </button>
                </div>
              </div>
            ) : null}

            {/* Matrix Mapping Grid */}
            <div className="overflow-x-auto rounded-[2rem] border border-text-dark/5 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream/40 border-b border-text-dark/5">
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40">Journey Type</th>
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40">Feeling</th>
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40">Recommended Ritual</th>
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40">Focus</th>
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40">Confidence</th>
                    <th className="p-6 text-[9px] font-bold uppercase tracking-widest text-text-dark/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.id} className="border-b border-text-dark/[0.03] hover:bg-cream/10 transition-colors">
                      <td className="p-6 text-xs font-semibold text-text-dark capitalize">{row.journey_type}</td>
                      <td className="p-6 text-xs text-text-dark/85 capitalize">{row.feeling}</td>
                      <td className="p-6 text-xs font-medium text-gold">{row.recommended_ritual}</td>
                      <td className="p-6 text-xs text-text-dark/60 font-light truncate max-w-[200px]">{row.focus}</td>
                      <td className="p-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                          row.confidence === 'Highly Aligned' 
                            ? "bg-gold/10 text-gold" 
                            : row.confidence === 'Strong Match'
                            ? "bg-gold/5 text-gold/80"
                            : "bg-text-dark/5 text-text-dark/60"
                        )}>
                          {row.confidence}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setEditingMatrix(row)}
                          className="p-2 bg-cream hover:bg-gold/15 text-text-dark/50 hover:text-gold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"
                        >
                          <Edit className="w-3.5 h-3.5" /> Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CLASSES PAGE CMS */}
        {activeTab === 'classes' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Classes Page CMS Configuration</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify class descriptions, headers, benefits, and call to action.</p>
            </div>

            {!pagesContent.classes ? (
              <div className="text-sm text-text-dark/40">Loading Classes Page CMS configuration...</div>
            ) : (
              <div className="space-y-8">
                {/* Hero section inside Classes page */}
                <div className="p-8 bg-cream/10 border border-text-dark/5 rounded-[2rem] space-y-6">
                  <h5 className="font-display text-lg text-text-dark">Hero Section</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Title (Use \n for newlines)</label>
                      <input
                        type="text"
                        value={pagesContent.classes.hero_title || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          classes: { ...prev.classes, hero_title: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Subtitle</label>
                      <input
                        type="text"
                        value={pagesContent.classes.hero_subtitle || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          classes: { ...prev.classes, hero_subtitle: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Services/Ritual Cards config */}
                <div className="p-8 bg-cream/10 border border-text-dark/5 rounded-[2rem] space-y-8">
                  <h5 className="font-display text-lg text-text-dark">Rituals & Services Cards</h5>
                  <div className="space-y-8 divide-y divide-text-dark/5">
                    {(pagesContent.classes.services || []).map((service: any, sIdx: number) => (
                      <div key={sIdx} className={cn("space-y-6", sIdx > 0 && "pt-8")}>
                        <h6 className="font-display text-sm font-semibold text-gold capitalize">{service.title || `Service ${sIdx + 1}`}</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Card Title</label>
                            <input
                              type="text"
                              value={service.title || ''}
                              onChange={e => {
                                const updatedServices = [...pagesContent.classes.services];
                                updatedServices[sIdx] = { ...service, title: e.target.value };
                                setPagesContent(prev => ({
                                  ...prev,
                                  classes: { ...prev.classes, services: updatedServices }
                                }));
                              }}
                              className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Card Icon</label>
                            <input
                              type="text"
                              value={service.icon || ''}
                              onChange={e => {
                                const updatedServices = [...pagesContent.classes.services];
                                updatedServices[sIdx] = { ...service, icon: e.target.value };
                                setPagesContent(prev => ({
                                  ...prev,
                                  classes: { ...prev.classes, services: updatedServices }
                                }));
                              }}
                              className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Card Description</label>
                            <textarea
                              value={service.description || ''}
                              onChange={e => {
                                const updatedServices = [...pagesContent.classes.services];
                                updatedServices[sIdx] = { ...service, description: e.target.value };
                                setPagesContent(prev => ({
                                  ...prev,
                                  classes: { ...prev.classes, services: updatedServices }
                                }));
                              }}
                              className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all min-h-[80px]"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Benefits (Comma-separated list)</label>
                            <input
                              type="text"
                              value={(service.benefits || []).join(', ')}
                              onChange={e => {
                                const updatedServices = [...pagesContent.classes.services];
                                updatedServices[sIdx] = { 
                                  ...service, 
                                  benefits: e.target.value.split(',').map(b => b.trim()).filter(Boolean)
                                };
                                setPagesContent(prev => ({
                                  ...prev,
                                  classes: { ...prev.classes, services: updatedServices }
                                }));
                              }}
                              className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Classes CTA copy */}
                <div className="p-8 bg-cream/10 border border-text-dark/5 rounded-[2rem] space-y-6">
                  <h5 className="font-display text-lg text-text-dark">Bottom Call to Action Banner</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Title (Use \n for newlines)</label>
                      <input
                        type="text"
                        value={pagesContent.classes.cta_title || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          classes: { ...prev.classes, cta_title: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Description</label>
                      <textarea
                        value={pagesContent.classes.cta_description || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          classes: { ...prev.classes, cta_description: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Button Text</label>
                      <input
                        type="text"
                        value={pagesContent.classes.cta_button_text || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          classes: { ...prev.classes, cta_button_text: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: CONTACT PAGE CMS */}
        {activeTab === 'contact' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Contact Page CMS Configuration</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify contact descriptions, headers, trust metrics, quotes, and layouts.</p>
            </div>

            {!pagesContent.contact ? (
              <div className="text-sm text-text-dark/40">Loading Contact Page CMS configuration...</div>
            ) : (
              <div className="space-y-8">
                {/* Hero section inside Contact page */}
                <div className="p-8 bg-cream/10 border border-text-dark/5 rounded-[2rem] space-y-6">
                  <h5 className="font-display text-lg text-text-dark">Hero Section</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Title (Use \n for newlines)</label>
                      <input
                        type="text"
                        value={pagesContent.contact.hero_title || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, hero_title: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Hero Subtitle</label>
                      <input
                        type="text"
                        value={pagesContent.contact.hero_subtitle || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, hero_subtitle: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Form header and Trust details */}
                <div className="p-8 bg-cream/10 border border-text-dark/5 rounded-[2rem] space-y-6">
                  <h5 className="font-display text-lg text-text-dark">Form & Trust Setup</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Form Title</label>
                      <input
                        type="text"
                        value={pagesContent.contact.form_title || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, form_title: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Form Microcopy / Quote</label>
                      <input
                        type="text"
                        value={pagesContent.contact.form_microcopy || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, form_microcopy: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Form Submit Button Text</label>
                      <input
                        type="text"
                        value={pagesContent.contact.button_text || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, button_text: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Right Quote / Supportive Statement</label>
                      <input
                        type="text"
                        value={pagesContent.contact.right_quote || ''}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { ...prev.contact, right_quote: e.target.value }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Trust Details / Bullet Points (Comma-separated)</label>
                      <input
                        type="text"
                        value={(pagesContent.contact.trust_details || []).join(', ')}
                        onChange={e => setPagesContent(prev => ({
                          ...prev,
                          contact: { 
                            ...prev.contact, 
                            trust_details: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          }
                        }))}
                        className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: PACKAGES CMS */}
        {activeTab === 'packages' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-2xl font-display text-text-dark tracking-tight">Packages & Validity Settings</h4>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Modify package names, pricing, credits, and subscription validity durations.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPackage({
                    name: '',
                    slug: '',
                    price: 99,
                    total_credits: 3,
                    validity_months: 3,
                    description: '',
                    is_active: true,
                    is_featured: false
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-text-dark hover:bg-gold text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-gold" />
                Add Package
              </button>
            </div>

            {editingPackage ? (
              <div className="bg-cream/40 border border-text-dark/5 p-8 rounded-3xl space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                    {editingPackage.id ? `Modifying Package: ${editingPackage.name}` : 'Add New Package'}
                  </span>
                  <button 
                    onClick={() => setEditingPackage(null)} 
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/40 hover:text-text-dark cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Package Name</label>
                    <input
                      type="text"
                      value={editingPackage.name || ''}
                      onChange={e => setEditingPackage(prev => ({ ...prev!, name: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Price ($)</label>
                    <input
                      type="number"
                      value={editingPackage.price || 0}
                      onChange={e => setEditingPackage(prev => ({ ...prev!, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Total Credits (Sessions)</label>
                    <input
                      type="number"
                      value={editingPackage.total_credits || 0}
                      onChange={e => setEditingPackage(prev => ({ ...prev!, total_credits: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Validity (Months)</label>
                    <input
                      type="number"
                      value={editingPackage.validity_months !== undefined ? editingPackage.validity_months : 1}
                      onChange={e => setEditingPackage(prev => ({ ...prev!, validity_months: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Description</label>
                    <textarea
                      value={editingPackage.description || ''}
                      onChange={e => setEditingPackage(prev => ({ ...prev!, description: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[80px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-text-dark/5 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Featured Package</span>
                      <p className="text-[8px] text-text-dark/20 uppercase tracking-wider">Highlight on Investment page</p>
                    </div>
                    <div 
                      onClick={() => setEditingPackage(prev => ({ ...prev!, is_featured: !prev?.is_featured }))}
                      className="w-10 h-6 bg-text-dark/5 rounded-full p-1 cursor-pointer"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300",
                        editingPackage.is_featured ? "bg-gold translate-x-4" : "bg-text-dark/15"
                      )} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-text-dark/5 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/40">Active Status</span>
                      <p className="text-[8px] text-text-dark/20 uppercase tracking-wider">Show in client flows</p>
                    </div>
                    <div 
                      onClick={() => setEditingPackage(prev => ({ ...prev!, is_active: prev?.is_active !== false ? false : true }))}
                      className="w-10 h-6 bg-text-dark/5 rounded-full p-1 cursor-pointer"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300",
                        editingPackage.is_active !== false ? "bg-gold translate-x-4" : "bg-text-dark/15"
                      )} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSavePackage}
                    className="flex items-center gap-3 px-8 py-4 bg-text-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold transition-all duration-500 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-gold" />
                    Save Package Details
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map(pkg => (
                <div key={pkg.id} className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] flex flex-col justify-between group text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{pkg.total_credits} Session{pkg.total_credits > 1 ? 's' : ''}</span>
                      <span className="text-sm font-bold text-text-dark">${pkg.price}</span>
                    </div>
                    <h5 className="font-display text-2xl text-text-dark flex items-center gap-2">
                      {pkg.name}
                      {pkg.is_featured && <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>}
                      {!pkg.is_active && <span className="text-[8px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Inactive</span>}
                    </h5>
                    <p className="text-xs text-text-dark/60 leading-relaxed font-light">{pkg.description}</p>
                    <div className="pt-2 border-t border-text-dark/5 text-[9px] font-bold uppercase tracking-wider text-text-dark/40">
                      Validity: {pkg.validity_months !== undefined ? pkg.validity_months : 1} Month{(pkg.validity_months !== undefined ? pkg.validity_months : 1) > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        console.log('Edit package clicked:', pkg);
                        setEditingPackage({
                          id: pkg.id,
                          name: pkg.name || '',
                          slug: pkg.slug || '',
                          price: pkg.price || 0,
                          total_credits: pkg.total_credits || 0,
                          validity_months: pkg.validity_months !== undefined ? pkg.validity_months : 1,
                          description: pkg.description || '',
                          is_active: pkg.is_active !== false,
                          is_featured: pkg.is_featured === true
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-grow flex items-center justify-center gap-2 py-3.5 bg-cream hover:bg-gold/15 text-[10px] text-text-dark font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-gold" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 hover:bg-red-100 text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer border border-red-100"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Dialog */}
      {showQuoteModal && editingQuote && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md" onClick={() => setShowQuoteModal(false)} />
          <div className="relative bg-white border border-text-dark/5 p-10 rounded-[2.5rem] shadow-luxury max-w-lg w-full space-y-6 z-10">
            <h4 className="text-xl font-display text-text-dark tracking-tight">Wisdom Quote Archive</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Quote Text</label>
                <textarea
                  value={editingQuote.quote_text || ''}
                  onChange={e => setEditingQuote(prev => ({ ...prev, quote_text: e.target.value }))}
                  className="w-full bg-cream/30 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Author / Label</label>
                <input
                  type="text"
                  value={editingQuote.author_text || ''}
                  onChange={e => setEditingQuote(prev => ({ ...prev, author_text: e.target.value }))}
                  className="w-full bg-cream/30 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowQuoteModal(false)}
                className="px-6 py-3 border border-text-dark/10 rounded-xl text-[9px] font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveQuote}
                className="px-6 py-3 bg-text-dark text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all cursor-pointer"
              >
                Archive Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Dialog */}
      {showTestimonialModal && editingTestimonial && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-md" onClick={() => setShowTestimonialModal(false)} />
          <div className="relative bg-white border border-text-dark/5 p-10 rounded-[2.5rem] shadow-luxury max-w-lg w-full space-y-6 z-10">
            <h4 className="text-xl font-display text-text-dark tracking-tight">Review Archive</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Client Name</label>
                <input
                  type="text"
                  value={editingTestimonial.name || ''}
                  onChange={e => setEditingTestimonial(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-cream/30 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Role / Pathway</label>
                <input
                  type="text"
                  value={editingTestimonial.role || ''}
                  onChange={e => setEditingTestimonial(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-cream/30 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Review Quote</label>
                <textarea
                  value={editingTestimonial.quote || ''}
                  onChange={e => setEditingTestimonial(prev => ({ ...prev, quote: e.target.value }))}
                  className="w-full bg-cream/30 border border-text-dark/5 p-4 rounded-xl text-xs focus:outline-none min-h-[80px]"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-cream/20 border border-text-dark/5 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-text-dark uppercase tracking-widest">Featured Review</p>
                  <p className="text-[8px] text-text-dark/30 uppercase tracking-[0.2em] mt-0.5">Places badge on cards grid</p>
                </div>
                <input
                  type="checkbox"
                  checked={editingTestimonial.is_featured || false}
                  onChange={e => setEditingTestimonial(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-5 h-5 accent-gold border-text-dark/5 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowTestimonialModal(false)}
                className="px-6 py-3 border border-text-dark/10 rounded-xl text-[9px] font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTestimonial}
                className="px-6 py-3 bg-text-dark text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-gold transition-all cursor-pointer"
              >
                Archive Review
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </div>
  );
}
