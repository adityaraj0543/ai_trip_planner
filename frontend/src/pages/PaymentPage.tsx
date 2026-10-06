import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Shield, CheckCircle, ArrowLeft, Lock, Smartphone, Building, Wallet, Loader2, Receipt, MapPin, Users } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { TripContext } from '../App';
import { createPaymentOrder, verifyPayment } from '../services/api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

async function loadRazorpayScript() {
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}


export default function PaymentPage() {
  const navigate = useNavigate();
  const { isDark } = useContext(ThemeContext);
  const { trips, currentTrip, getTrip, isLoadingTrips } = useContext(TripContext)!;
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const requestedTripId = searchParams.get('tripId');
  const [loadedTrip, setLoadedTrip] = useState<any>(null);
  const [tripError, setTripError] = useState('');

  const selectedTrip = requestedTripId
    ? trips.find((trip: any) => trip.id === requestedTripId) || loadedTrip
    : (currentTrip?.id ? trips.find((trip: any) => trip.id === currentTrip.id) : trips[0]) || loadedTrip;
  const tripAmount = selectedTrip?.budget || 0;
  const gst = Math.round(tripAmount * 0.18);
  const convenienceFee = selectedTrip ? 999 : 0;
  const totalAmount = tripAmount + gst + convenienceFee;

  useEffect(() => {
    let active = true;
    const savedTrip = requestedTripId ? trips.find((trip: any) => trip.id === requestedTripId) : null;
    if (savedTrip) {
      setLoadedTrip(null);
      setTripError('');
    } else if (requestedTripId && !isLoadingTrips) {
      getTrip(requestedTripId)
        .then((trip) => {
          if (active) {
            setLoadedTrip(trip);
            setTripError('');
          }
        })
        .catch((error: unknown) => {
          if (active) setTripError(error instanceof Error ? error.message : 'Unable to load this trip.');
        });
    }
    return () => {
      active = false;
    };
  }, [requestedTripId, trips, isLoadingTrips, getTrip]);

  const handlePayment = async () => {
    if (!selectedTrip) return;
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error('Razorpay checkout could not be loaded.');

      const order = await createPaymentOrder({ tripId: selectedTrip.id });

      const Razorpay = window.Razorpay;
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TripGenius',
        description: `Trip booking - ${selectedTrip?.destination || 'Travel'}`,
        order_id: order.orderId,
        theme: { color: '#8b5cf6' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyPayment(response);
            setIsSuccess(true);
          } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });

      checkout.open();
    } catch (error) {
      setIsProcessing(false);
      window.alert(error instanceof Error ? error.message : 'Unable to start payment.');
    }
  };

  if (isLoadingTrips || (requestedTripId && !selectedTrip && !tripError)) {
    return <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center">Loading trip...</div>;
  }

  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tripError || 'Select a saved trip to continue'}</h1>
          <Link to={trips.length ? '/dashboard' : '/planner'} className="text-primary-300 hover:underline">
            {trips.length ? 'Back to your trips' : 'Plan a trip'}
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 max-w-md mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
            <CheckCircle size={48} className="text-white" />
          </motion.div>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Successful!</h2>
          <p className={isDark ? 'text-gray-400 mb-6' : 'text-slate-600 mb-6'}>Your trip has been confirmed.</p>
          <div className={`p-6 rounded-2xl border text-left mb-6 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Transaction ID</span><span className="font-mono text-primary-300">TXN{Date.now().toString().slice(-8)}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Amount Paid</span><span className="font-semibold text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Status</span><span className="text-emerald-400 font-medium">Confirmed ✓</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-300 to-purple-400 font-semibold text-white">View Dashboard</button>
            <button onClick={() => navigate('/')} className={`flex-1 py-3 rounded-xl border font-semibold ${isDark ? 'border-slate-600 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>Go Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 mb-4 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}><ArrowLeft size={18} /> Back</button>
          <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Secure <span className="text-gradient">Payment</span></h1>
          <p className={isDark ? 'text-gray-400 mt-2' : 'text-slate-600 mt-2'}>Powered by Razorpay • 100% Secure</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ id: 'card', label: 'Card', icon: <CreditCard size={20} />, color: 'text-blue-400' }, { id: 'upi', label: 'UPI', icon: <Smartphone size={20} />, color: 'text-purple-400' }, { id: 'netbanking', label: 'Net Banking', icon: <Building size={20} />, color: 'text-emerald-400' }, { id: 'wallet', label: 'Wallets', icon: <Wallet size={20} />, color: 'text-amber-400' }].map((method) => (
                  <button key={method.id} onClick={() => setSelectedMethod(method.id)} className={`p-4 rounded-xl border text-center transition-all hover:scale-105 ${selectedMethod === method.id ? 'border-primary-300 bg-primary-300/10 ring-2 ring-primary-300/20' : isDark ? 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500' : 'border-slate-300 bg-slate-50 hover:border-primary-300'}`}>
                    <div className={`${method.color} mx-auto mb-2 flex justify-center`}>{method.icon}</div>
                    <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{method.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Lock className="text-primary-300" size={20} /> Secure Razorpay Checkout</h3>
              <p className={`text-sm leading-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                Your card, UPI, net-banking, and wallet details are entered securely inside Razorpay Checkout. TripGenius never collects or stores your card number, expiry, or CVV.
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
                <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>🔒 PCI-aware checkout</div>
                <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>✓ Server signature verification</div>
                <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700/30 text-gray-300' : 'bg-slate-50 text-slate-600'}`}>🧪 Test mode ready</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <Shield className="text-emerald-400 flex-shrink-0" size={24} />
              <div><p className="text-sm font-medium text-emerald-400">256-bit SSL Encrypted</p><p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Your payment information is secure</p></div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-2xl border sticky top-24 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Receipt className="text-primary-300" size={20} /> Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <MapPin size={16} className="text-primary-300" />
                  <div className="flex-1"><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTrip?.destination || 'Paris, France'}</p><p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{selectedTrip?.startDate} - {selectedTrip?.endDate}</p></div>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                  <Users size={16} className="text-purple-400" />
                  <div className="flex-1"><p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTrip?.travelers || 2} Travelers</p><p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Custom Package</p></div>
                </div>
              </div>
              <div className={`border-t pt-4 space-y-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex justify-between text-sm"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Trip Package</span><span className={isDark ? 'text-white' : 'text-slate-900'}>₹{tripAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>GST (18%)</span><span className={isDark ? 'text-white' : 'text-slate-900'}>₹{gst.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-sm"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Convenience Fee</span><span className={isDark ? 'text-white' : 'text-slate-900'}>₹{convenienceFee}</span></div>
                <div className={`border-t pt-3 flex justify-between font-bold text-lg ${isDark ? 'border-slate-700' : 'border-slate-200'}`}><span className={isDark ? 'text-white' : 'text-slate-900'}>Total</span><span className="text-emerald-400">₹{totalAmount.toLocaleString('en-IN')}</span></div>
              </div>
              <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-6 py-4 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {isProcessing ? (<><Loader2 size={20} className="animate-spin" />Processing...</>) : (<><Lock size={18} />Pay ₹{totalAmount.toLocaleString('en-IN')}</>)}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
