import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Eye,
  EyeOff
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

  // Data States
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [steps, setSteps] = useState<TransformationStep[]>([]);
  const [about, setAbout] = useState<AboutAlanna | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [paths, setPaths] = useState<HealingPath[]>([]);
  const [matrix, setMatrix] = useState<RecommendationMatrixEntry[]>([]);

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

  // Load all CMS data
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

      setHero(heroData);
      setSteps(stepsData);
      setAbout(aboutData);
      setQuotes(quotesData);
      setTestimonials(testimonialsData);
      setPaths(pathsData);
      setMatrix(matrixData);
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

  // Save Hero Content
  const handleSaveHero = async () => {
    if (!hero) return;
    setIsSaving(true);
    try {
      if (hero.id) {
        await cmsService.updateHeroContent(hero.id, hero);
      } else {
        await cmsService.createHeroContent(hero);
      }
      showToast('Hero content updated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update hero content', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save About Alanna bio
  const handleSaveAbout = async () => {
    if (!about) return;
    setIsSaving(true);
    try {
      await cmsService.updateAboutAlanna(about.id, about);
      showToast('About bio updated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update bio', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save specific transformation step
  const handleSaveStep = async () => {
    if (!editingStep) return;
    setIsSaving(true);
    try {
      await cmsService.updateTransformationStep(editingStep.id, editingStep);
      showToast('Transformation step updated', 'success');
      setSteps(prev => prev.map(s => s.id === editingStep.id ? editingStep : s));
      setEditingStep(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to update step', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save healing path / program details
  const handleSavePath = async () => {
    if (!editingPath) return;
    setIsSaving(false);
    try {
      await cmsService.updateHealingPath(editingPath.id, editingPath);
      showToast('Offering updated successfully', 'success');
      setPaths(prev => prev.map(p => p.id === editingPath.id ? editingPath : p));
      setEditingPath(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to update offering', 'error');
    }
  };

  // Save recommendation matrix row change
  const handleSaveMatrixEntry = async () => {
    if (!editingMatrix || !editingMatrix.id) return;
    setIsSaving(true);
    try {
      await cmsService.updateRecommendationMatrixEntry(editingMatrix.id, editingMatrix);
      showToast('Recommendation matrix aligned', 'success');
      setMatrix(prev => prev.map(m => m.id === editingMatrix.id ? editingMatrix : m));
      setEditingMatrix(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to align recommendation matrix', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Quote actions
  const handleSaveQuote = async () => {
    if (!editingQuote || !editingQuote.quote_text) return;
    try {
      if (editingQuote.id) {
        await cmsService.updateQuote(editingQuote.id, editingQuote);
        setQuotes(prev => prev.map(q => q.id === editingQuote.id ? { ...q, ...editingQuote } as Quote : q));
      } else {
        const newQuote = await cmsService.createQuote(editingQuote as Omit<Quote, 'id' | 'created_at'>);
        setQuotes(prev => [...prev, newQuote]);
      }
      showToast('Reflection quote archived', 'success');
      setShowQuoteModal(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to archive quote', 'error');
    }
  };

  // Testimonial actions
  const handleSaveTestimonial = async () => {
    if (!editingTestimonial || !editingTestimonial.name || !editingTestimonial.quote) return;
    try {
      if (editingTestimonial.id) {
        await cmsService.updateTestimonial(editingTestimonial.id, editingTestimonial);
        setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? { ...t, ...editingTestimonial } as Testimonial : t));
      } else {
        const newTest = await cmsService.createTestimonial(editingTestimonial as Omit<Testimonial, 'id' | 'created_at'>);
        setTestimonials(prev => [...prev, newTest]);
      }
      showToast('Testimonial archived', 'success');
      setShowTestimonialModal(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to archive testimonial', 'error');
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
    <div className="space-y-12">
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
                    <div className="flex gap-4 mt-6 pt-4 border-t border-text-dark/5">
                      <button
                        onClick={() => {
                          setEditingQuote(q);
                          setShowQuoteModal(true);
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-text-dark/40 hover:text-gold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Edit
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

                    <div className="flex gap-4 mt-6 pt-4 border-t border-text-dark/5">
                      <button
                        onClick={() => {
                          setEditingTestimonial(t);
                          setShowTestimonialModal(true);
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-text-dark/40 hover:text-gold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit className="w-3 h-3" /> Edit
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
