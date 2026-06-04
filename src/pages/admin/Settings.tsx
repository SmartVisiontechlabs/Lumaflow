import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Clock,
  Database
} from 'lucide-react';
import { adminSupabase as supabase } from '../../lib/supabase';
import { Toast, ToastType } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [sanctuaryEmail, setSanctuaryEmail] = useState('rituals@lumaflow.com');

  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [dbColumns, setDbColumns] = useState<string[]>([]);

  const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const fetchSchedule = async () => {
    setIsLoadingSchedule(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDbColumns(Object.keys(data[0]));
      }

      const fullSchedule = Array.from({ length: 7 }, (_, i) => {
        const existing = (data || []).find((s: any) => s.day_of_week === i);
        if (existing) {
          const activeVal = existing.is_active !== undefined ? existing.is_active : existing.is_available;
          return {
            ...existing,
            start_time: existing.start_time.substring(0, 5),
            end_time: existing.end_time.substring(0, 5),
            is_active: activeVal !== false
          };
        }
        
        let start = '09:00';
        let end = '17:00';
        let is_active = false;
        let buffer = 30;

        if (i === 1) {
          start = '09:00';
          end = '13:00';
          is_active = true;
        } else if (i === 3) {
          start = '11:00';
          end = '16:00';
          is_active = true;
        } else if (i === 5) {
          start = '08:00';
          end = '12:00';
          is_active = true;
        }

        return {
          day_of_week: i,
          start_time: start,
          end_time: end,
          buffer_minutes: buffer,
          is_active: is_active
        };
      });

      setSchedule(fullSchedule);
    } catch (err) {
      console.error('Error fetching schedule settings:', err);
      showToast('Failed to load availability settings', 'error');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    try {
      if (!supabase) return;
      
      const payload = schedule.map(s => {
        const item: any = {
          day_of_week: s.day_of_week,
          start_time: s.start_time.includes(':') && s.start_time.split(':').length === 2 ? `${s.start_time}:00` : s.start_time,
          end_time: s.end_time.includes(':') && s.end_time.split(':').length === 2 ? `${s.end_time}:00` : s.end_time,
          buffer_minutes: parseInt(s.buffer_minutes, 10),
        };
        
        if (dbColumns.includes('is_available')) {
          item.is_available = s.is_active;
        }
        if (dbColumns.includes('is_active') || dbColumns.length === 0) {
          item.is_active = s.is_active;
        }
        return item;
      });

      const { error } = await supabase
        .from('availability_settings')
        .upsert(payload, { onConflict: 'day_of_week' });

      if (error) throw error;
      showToast('Availability settings archived successfully', 'success');
      fetchSchedule();
    } catch (err) {
      console.error('Error saving schedule settings:', err);
      showToast('Failed to archive availability settings', 'error');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setSchedule(prev => prev.map(item => 
      item.day_of_week === dayIndex ? { ...item, is_active: !item.is_active } : item
    ));
  };

  const handleFieldChange = (dayIndex: number, field: string, value: any) => {
    setSchedule(prev => prev.map(item => 
      item.day_of_week === dayIndex ? { ...item, [field]: value } : item
    ));
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          key: 'general_config', 
          value: { sanctuaryEmail }, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      showToast('Sanctuary archives updated successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to archive changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'general', name: 'General Settings', icon: SettingsIcon },
    { id: 'availability', name: 'Sanctuary Hours', icon: Clock },
    { id: 'emails', name: 'Communications', icon: Mail },
    { id: 'security', name: 'Access Control', icon: Shield },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end px-4 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-display text-text-dark tracking-tight">Archives & Logic</h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Configuring Sanctuary Operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Navigation Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center justify-between p-6 rounded-2xl transition-all duration-500 group",
                activeSection === section.id 
                  ? "bg-text-dark text-white shadow-luxury" 
                  : "bg-white/40 border border-text-dark/5 text-text-dark/40 hover:bg-white hover:text-text-dark"
              )}
            >
              <div className="flex items-center gap-4">
                <section.icon className={cn(
                  "w-4 h-4 transition-colors duration-500",
                  activeSection === section.id ? "text-gold" : "text-text-dark/20 group-hover:text-gold/60"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{section.name}</span>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 opacity-10 group-hover:opacity-40 transition-opacity",
                activeSection === section.id && "opacity-40"
              )} />
            </button>
          ))}

          <div className="mt-12 p-8 bg-gold/5 border border-gold/10 rounded-[2.5rem] space-y-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-gold/60 leading-relaxed italic">
              “Changes to core logic may shift upcoming ritual resonance.”
            </p>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/40 backdrop-blur-xl border border-text-dark/5 rounded-[3rem] p-12 shadow-luxury space-y-12"
          >
            {activeSection === 'general' && (
              <div className="space-y-10">
                <div className="space-y-1">
                  <h4 className="text-2xl font-display text-text-dark tracking-tight">Identity & Reach</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Primary sanctuary configuration</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 ml-2">Sanctuary Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/20" />
                      <input 
                        type="email" 
                        value={sanctuaryEmail}
                        onChange={(e) => setSanctuaryEmail(e.target.value)}
                        className="w-full bg-white border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-xs focus:outline-none focus:border-gold/30 transition-all placeholder:text-text-dark/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-text-dark/20 ml-2">Local Timezone</label>
                    <div className="relative group">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/20" />
                      <input 
                        type="text" 
                        defaultValue="America/New_York (EST)"
                        readOnly
                        className="w-full bg-cream/50 border border-text-dark/5 py-5 pl-14 pr-6 rounded-2xl text-xs cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-text-dark/5 flex justify-end">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-12 py-5 bg-text-dark text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700 disabled:opacity-50"
                  >
                    <Save className={cn("w-4 h-4 text-gold", isSaving && "animate-pulse")} />
                    {isSaving ? 'Archiving...' : 'Archive Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'availability' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-display text-text-dark tracking-tight">Sanctuary Hours</h4>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Manage your weekly operating hours and buffers</p>
                  </div>
                  <button 
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule || isLoadingSchedule}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-text-dark text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.4em] shadow-button hover:bg-gold transition-all duration-700 disabled:opacity-50"
                  >
                    <Save className={cn("w-3.5 h-3.5 text-gold", isSavingSchedule && "animate-pulse")} />
                    {isSavingSchedule ? 'Saving...' : 'Save Hours'}
                  </button>
                </div>

                {isLoadingSchedule ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedule.map((item) => {
                      const dayName = DAY_NAMES[item.day_of_week];
                      return (
                        <div 
                          key={item.day_of_week} 
                          className={cn(
                            "flex flex-col md:flex-row md:items-center justify-between p-6 bg-cream/30 border rounded-2xl transition-all duration-500 gap-4",
                            item.is_active ? "border-gold/20 bg-white" : "border-text-dark/5 opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-4 min-w-[150px]">
                            {/* Switch */}
                            <div 
                              onClick={() => handleToggleDay(item.day_of_week)}
                              className={cn(
                                "w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 relative",
                                item.is_active ? "bg-gold" : "bg-text-dark/10"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                                item.is_active ? "translate-x-6" : "translate-x-0"
                              )} />
                            </div>
                            <span className="text-[11px] font-bold text-text-dark tracking-widest uppercase">{dayName}</span>
                          </div>

                          {item.is_active ? (
                            <div className="flex flex-wrap items-center gap-6">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/30">Start</span>
                                <input 
                                  type="time" 
                                  value={item.start_time}
                                  onChange={(e) => handleFieldChange(item.day_of_week, 'start_time', e.target.value)}
                                  className="bg-cream/20 border border-text-dark/5 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-gold/30 text-text-dark"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/30">End</span>
                                <input 
                                  type="time" 
                                  value={item.end_time}
                                  onChange={(e) => handleFieldChange(item.day_of_week, 'end_time', e.target.value)}
                                  className="bg-cream/20 border border-text-dark/5 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-gold/30 text-text-dark"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/30">Buffer</span>
                                <select 
                                  value={item.buffer_minutes}
                                  onChange={(e) => handleFieldChange(item.day_of_week, 'buffer_minutes', e.target.value)}
                                  className="bg-cream/20 border border-text-dark/5 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-gold/30 text-text-dark"
                                >
                                  <option value="0">0m Buffer</option>
                                  <option value="15">15m Buffer</option>
                                  <option value="30">30m Buffer</option>
                                  <option value="45">45m Buffer</option>
                                  <option value="60">60m Buffer</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-text-dark/20 uppercase tracking-[0.2em]">Sanctuary Closed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="p-8 bg-gold/5 border border-gold/10 rounded-[2.5rem] flex items-center gap-6">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-text-dark uppercase tracking-widest">Dynamic Time Generation</p>
                    <p className="text-[9px] text-text-dark/40 uppercase tracking-[0.2em] mt-1 leading-relaxed">
                      Slots are generated in 30-minute intervals based on selected ritual duration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'emails' && (
              <div className="space-y-10">
                <div className="space-y-1">
                  <h4 className="text-2xl font-display text-text-dark tracking-tight">Communications</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Automation & Notification Logic</p>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Booking Confirmations', sub: 'Instant ritual verification', active: true },
                    { label: '24-Hour Anticipation', sub: 'Gentle soul reminders', active: true },
                    { label: '2-Hour Preparation', sub: 'Soft arrival guidance', active: true },
                    { label: 'Admin Notifications', sub: 'New sanctuary alert', active: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700",
                          item.active ? "bg-gold text-white" : "bg-text-dark/5 text-text-dark/20"
                        )}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-dark tracking-widest uppercase">{item.label}</p>
                          <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">{item.sub}</p>
                        </div>
                      </div>
                      <div className="w-14 h-8 bg-text-dark/5 rounded-full p-1 cursor-pointer">
                        <div className={cn(
                          "w-6 h-6 rounded-full transition-all duration-500",
                          item.active ? "bg-gold translate-x-6 shadow-luxury" : "bg-text-dark/10"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-10">
                <div className="space-y-1">
                  <h4 className="text-2xl font-display text-text-dark tracking-tight">Access Control</h4>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-text-dark/20 italic">Securing the Sanctuary Archives</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                    <Database className="w-6 h-6 text-gold/40" />
                    <div>
                      <p className="text-xs font-bold text-text-dark uppercase tracking-widest">Supabase Engine</p>
                      <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">Version 2.4.1 • Operational</p>
                    </div>
                  </div>
                  <div className="p-8 bg-white border border-text-dark/5 rounded-[2.5rem] shadow-sm flex items-center gap-6">
                    <Shield className="w-6 h-6 text-gold/40" />
                    <div>
                      <p className="text-xs font-bold text-text-dark uppercase tracking-widest">Session Persistence</p>
                      <p className="text-[9px] text-text-dark/30 uppercase tracking-[0.2em] mt-1">7 Days • Encrypted</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50/50 border border-red-100 p-10 rounded-[3rem] space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-red-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-400">Danger Zone</p>
                  </div>
                  <p className="text-xs text-red-400/60 italic leading-relaxed">
                    “Terminating all sanctuary sessions will require a new soul-entry password for all administrators.”
                  </p>
                  <button className="px-10 py-5 bg-red-400 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-red-500 transition-all duration-700 shadow-sm">
                    Reset Portal Security
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
    </div>
  );
};

export default AdminSettings;
