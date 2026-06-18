declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID) {
    return;
  }

  // Already initialized?
  if (window.gtag) return;

  // 1. Inject gtag script tag
  const scriptId = 'google-analytics-gtag';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.async = true;
    script.id = scriptId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Inject inline configuration script
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        send_page_view: false
      });
    `;
    document.head.appendChild(inlineScript);
  }
};

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  initGA();
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title
    });
  }
};

export const trackEvent = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number, 
  additionalParams?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return;
  initGA();
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams
    });
  }
};

export const trackBookSessionClick = (location: string) => {
  trackEvent('book_session_click', 'Engagement', location);
};

export const trackBookingStarted = (ritualName: string, price: number) => {
  trackEvent('booking_started', 'Checkout', ritualName, price, { ritual_name: ritualName, price });
};

export const trackBookingCompleted = (ritualName: string, price: number) => {
  trackEvent('booking_completed', 'Checkout', ritualName, price, { ritual_name: ritualName, price });
};

export const trackMagicLinkRequest = (email: string) => {
  trackEvent('magic_link_request', 'Authentication', email);
};

export const trackDashboardVisit = (userId?: string) => {
  trackEvent('dashboard_visit', 'Engagement', userId || 'anonymous');
};
