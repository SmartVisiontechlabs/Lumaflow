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
  RefreshCw
} from 'lucide-react';
import { cmsService } from '../../services/cmsService';
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
  const [activeTab, setActiveTab] = useState<'hero' | 'steps' | 'about' | 'quotes' | 'paths' | 'matrix'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Current Working Data States
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [steps, setSteps] = useState<TransformationStep[]>([]);
  const [about, setAbout] = useState<AboutAlanna | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paths, setPaths] = useState<HealingPath[]>([]);
  const [matrix, setMatrix] = useState<RecommendationMatrixEntry[]>([]);

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
        matrixData
      ] = await Promise.all([
        cmsService.getHeroContent(),
        cmsService.getTransformationSteps(),
        cmsService.getAboutAlanna(),
        cmsService.getQuotes(),
        cmsService.getTestimonials(),
        cmsService.getHealingPaths(),
        cmsService.getRecommendationMatrix()
      ]);

      // Form input mappings
      const mappedHero: HeroContent = heroData ? {
        id: heroData.id,
        headline: (heroData as any).title || heroData.headline,
        subheadline: (heroData as any).subtitle || heroData.subheadline,
        cta_text: (heroData as any).primary_cta_label || heroData.cta_text,
        cta_link: (heroData as any).primary_cta_link || heroData.cta_link,
        secondary_cta_text: (heroData as any).secondary_cta_label || heroData.secondary_cta_text,
        secondary_cta_link: (heroData as any).secondary_cta_link || heroData.secondary_cta_link,
        background_visual_url: heroData.background_visual_url,
        is_active: heroData.is_active,
        updated_at: heroData.updated_at
      } as any : null;

      const mappedSteps = stepsData.map(s => ({
        id: s.id,
        step_number: s.step_number,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        icon_name: (s as any).icon || s.icon_name,
        is_active: s.is_active,
        created_at: s.created_at,
        updated_at: s.updated_at
      }));

      const mappedAbout: AboutAlanna = aboutData ? {
        id: aboutData.id,
        photo_url: (aboutData as any).image_url || aboutData.photo_url,
        bio_title: (aboutData as any).title || aboutData.bio_title,
        quote: aboutData.quote,
        bio_body: (aboutData as any).bio || aboutData.bio_body,
        credentials: (aboutData as any).credentials || [],
        cta_label: (aboutData as any).button_label || aboutData.cta_label,
        cta_link: (aboutData as any).button_link || aboutData.cta_link,
        updated_at: aboutData.updated_at
      } : null;

      const mappedQuotes = quotesData.map(q => ({
        id: q.id,
        quote_text: (q as any).quote || q.quote_text,
        author_text: (q as any).author || q.author_text,
        is_active: (q as any).is_active !== false,
        display_order: (q as any).sort_order || q.display_order,
        created_at: q.created_at
      }));

      const mappedTestimonials = testimonialsData.map(t => ({
        id: t.id,
        name: (t as any).client_name || t.name,
        role: (t as any).program || t.role,
        quote: (t as any).review_text || t.quote,
        rating: t.rating,
        is_featured: t.is_featured,
        is_active: (t as any).is_active !== false,
        display_order: (t as any).sort_order || t.display_order,
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

  const getDirtyTabName = () => {
    if (isHeroDirty) return 'Hero Section';
    if (isAboutDirty) return 'Founder Bio';
    if (isStepsDirty) return 'Steps Flow';
    if (isQuotesDirty || isTestimonialsDirty) return 'Quotes & Reviews';
    if (isPathsDirty) return 'Offerings';
    if (isMatrixDirty) return 'Intelligence Matrix';
    return null;
  };

  const isDirty = isHeroDirty || isAboutDirty || isStepsDirty || isQuotesDirty || isTestimonialsDirty || isPathsDirty || isMatrixDirty;

  // Discard all changes
  const handleDiscardChanges = () => {
    setHero(JSON.parse(JSON.stringify(pristineState.hero)));
    setSteps(JSON.parse(JSON.stringify(pristineState.steps)));
    setAbout(JSON.parse(JSON.stringify(pristineState.about)));
    setQuotes(JSON.parse(JSON.stringify(pristineState.quotes)));
    setTestimonials(JSON.parse(JSON.stringify(pristineState.testimonials)));
    setPaths(JSON.parse(JSON.stringify(pristineState.paths)));
    setMatrix(JSON.parse(JSON.stringify(pristineState.matrix)));
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

  // Save About Alanna bio
  const handleSaveAbout = async () => {
    if (!about) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        image_url: about.photo_url,
        title: about.bio_title,
        quote: about.quote,
        bio: about.bio_body,
        button_label: about.cta_label,
        button_link: about.cta_link
      };

      await cmsService.updateAboutAlanna(about.id, dbPayload as any);
      showToast('Founder profile synchronized.', 'success');
      setPristineState(prev => ({ ...prev, about: JSON.parse(JSON.stringify(about)) }));
    } catch (e) {
      console.error(e);
      showToast('Failed to archive profile.', 'error');
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
        description: editingPath.benefit,
        duration: editingPath.duration_minutes,
        price: editingPath.price,
        is_active: editingPath.is_active
      };

      await cmsService.updateHealingPath(editingPath.id, dbPayload as any);
      showToast('Offering changes synchronized.', 'success');
      
      const newPaths = paths.map(p => p.id === editingPath.id ? editingPath : p);
      setPaths(newPaths);
      setPristineState(prev => ({ ...prev, paths: JSON.parse(JSON.stringify(newPaths)) }));
      setEditingPath(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to update offering details.', 'error');
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

  // Quote actions
  const handleSaveQuote = async () => {
    if (!editingQuote || !editingQuote.quote_text) return;
    setIsSaving(true);
    try {
      const dbPayload = {
        quote: editingQuote.quote_text,
        author: editingQuote.author_text || 'Client Reflection',
        sort_order: editingQuote.display_order || 1,
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
    if (!editingTestimonial || !editingTestimonial.name || !editingTestimonial.quote) return;
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
              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Photo URL</label>
                <input
                  type="text"
                  value={about.photo_url || ''}
                  onChange={e => setAbout(prev => ({ ...prev!, photo_url: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Bio Title</label>
                <input
                  type="text"
                  value={about.bio_title}
                  onChange={e => setAbout(prev => ({ ...prev!, bio_title: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
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
                  value={about.bio_body}
                  onChange={e => setAbout(prev => ({ ...prev!, bio_body: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[120px]"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Credentials / Accreditations (One per line)</label>
                <textarea
                  value={about.credentials.join('\n')}
                  onChange={e => setAbout(prev => ({ ...prev!, credentials: e.target.value.split('\n').filter(Boolean) }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Button Label</label>
                <input
                  type="text"
                  value={about.cta_label}
                  onChange={e => setAbout(prev => ({ ...prev!, cta_label: e.target.value }))}
                  className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">CTA Link</label>
                <input
                  type="text"
                  value={about.cta_link}
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
                {isSaving ? 'Archiving...' : 'Archive Bio Changes'}
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
          <div className="space-y-10">
            <div>
              <h4 className="text-2xl font-display text-text-dark tracking-tight">Sanctuary Offerings</h4>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Edit Core paths (Breathwork, Somatic Flow, Meditation)</p>
            </div>

            {editingPath ? (
              <div className="bg-cream/40 border border-text-dark/5 p-8 rounded-3xl space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Modifying: {editingPath.title}</span>
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
                      value={editingPath.title}
                      onChange={e => setEditingPath(prev => ({ ...prev!, title: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Short Benefit description</label>
                    <input
                      type="text"
                      value={editingPath.benefit}
                      onChange={e => setEditingPath(prev => ({ ...prev!, benefit: e.target.value }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Base Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingPath.duration_minutes}
                      onChange={e => setEditingPath(prev => ({ ...prev!, duration_minutes: parseInt(e.target.value) || 60 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/40">Standard Price ($)</label>
                    <input
                      type="number"
                      value={editingPath.price}
                      onChange={e => setEditingPath(prev => ({ ...prev!, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-white border border-text-dark/5 py-4 px-6 rounded-2xl text-xs focus:outline-none"
                    />
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
                    <h5 className="font-display text-2xl text-text-dark">{path.title}</h5>
                    <p className="text-xs text-text-dark/60 leading-relaxed font-light">{path.benefit}</p>
                  </div>

                  <button
                    onClick={() => setEditingPath(path)}
                    className="mt-8 flex items-center justify-center gap-2 w-full py-3.5 bg-cream hover:bg-gold/15 text-[10px] text-text-dark font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    <Edit className="w-3 h-3 text-gold" />
                    Edit Offering
                  </button>
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
                  value={editingQuote.quote_text}
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
                  value={editingTestimonial.name}
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
                  value={editingTestimonial.quote}
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
