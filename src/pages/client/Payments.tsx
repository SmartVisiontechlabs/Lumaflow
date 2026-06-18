import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  ExternalLink, 
  Receipt,
  AlertCircle
} from 'lucide-react';

interface PaymentRecord {
  bookingId: string;
  ritual: string;
  amount: number;
  status: string;
  paymentMethod: string;
  receiptUrl: string | null;
  paymentDate: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active sanctuary session found');
        }

        const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';
        const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

        const response = await fetch(`${API_URL}/client/payments`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to retrieve payments');
        }

        const data = await response.json();
        setPayments(data);
      } catch (err: any) {
        console.error('[Payments Page] Error:', err);
        setError(err.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-sm text-red-400 font-bold uppercase tracking-wider">Error Loading Payments</p>
        <p className="text-xs text-text-dark/40 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <div className="bg-white/40 border border-white/60 p-10 rounded-[2.5rem] shadow-luxury relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center pb-6 border-b border-gold/10 mb-8">
          <div>
            <h3 className="font-display text-2xl text-text-dark font-light">Payment History</h3>
            <p className="text-xs text-text-dark/40 font-light mt-1">Stripe billing records and transactions for your sanctuary rituals.</p>
          </div>
          <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-gold" />
          </div>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
              <div className="overflow-hidden border border-text-dark/5 rounded-2xl bg-white/20">
                <table className="min-w-full divide-y divide-text-dark/5">
                  <thead>
                    <tr className="bg-text-dark/5">
                      <th scope="col" className="px-6 py-4.5 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-4.5 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Ritual
                      </th>
                      <th scope="col" className="px-6 py-4.5 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-4.5 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Method
                      </th>
                      <th scope="col" className="px-6 py-4.5 text-left text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4.5 text-right text-[9px] font-bold uppercase tracking-[0.2em] text-text-dark/60">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-dark/5 bg-transparent">
                    {payments.map((p, idx) => (
                      <tr key={p.bookingId || idx} className="hover:bg-white/20 transition-all duration-300">
                        <td className="whitespace-nowrap px-6 py-5.5 text-xs text-text-dark font-medium">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="px-6 py-5.5 text-xs text-text-dark/80 font-medium max-w-xs truncate">
                          {p.ritual}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5.5 text-xs text-text-dark font-semibold">
                          ${p.amount.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5.5 text-xs text-text-dark/60">
                          {p.paymentMethod}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5.5 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-green-500/10 border border-green-500/20 text-green-600">
                            {p.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5.5 text-right text-xs">
                          {p.receiptUrl ? (
                            <a
                              href={p.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              View Receipt
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-dark/30 italic">
                              Unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/10 rounded-2xl border border-text-dark/5">
            <AlertCircle className="w-8 h-8 text-text-dark/20 mx-auto mb-4" />
            <p className="text-xs text-text-dark/50 italic leading-relaxed max-w-sm mx-auto">
              Your payment history will appear here once your first ritual is booked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
