import { useState, useContext, FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, MapPin, Sparkles, Loader2, CheckCircle2, AlertCircle, User, Check, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function SignupPage() {
  const { signup, isAuthenticated } = useContext(AuthContext)!;
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const passwordStrength = (() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all required fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!formData.acceptTerms) { setError('Please accept the Terms of Service'); return; }
    setIsSubmitting(true);
    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.username);
      if (result.success) { setSuccess(result.message); setTimeout(() => navigate('/dashboard', { replace: true }), 800); }
      else { setError(result.message); }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-300 to-purple-400 flex items-center justify-center"><MapPin className="text-white" size={24} /></div>
            <span className="text-2xl font-bold"><span className="text-gradient">Trip</span><span className={isDark ? 'text-white' : 'text-slate-900'}>Genius</span></span>
          </Link>
          <h2 className={`text-5xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Start your <span className="text-gradient">journey</span> today</h2>
          <p className={isDark ? 'text-gray-400 text-lg' : 'text-slate-600 text-lg'}>Join thousands of travelers creating unforgettable experiences.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className={`inline-flex items-center gap-2 mb-8 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}><ArrowLeft size={18} /> Back to home</Link>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Create your <span className="text-gradient">account</span></h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Already have an account? <Link to="/login" className="text-primary-300 hover:text-primary-400 font-medium">Sign in</Link></p>

          {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3"><AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={18} /><p className="text-sm text-rose-300">{error}</p></motion.div>)}
          {success && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3"><CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} /><p className="text-sm text-emerald-300">{success}</p></motion.div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Full name</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Username (optional)</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type="text" autoComplete="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Choose a username" className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Email address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Create a strong password" className={`w-full pl-12 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">{[1, 2, 3, 4].map((level) => (<div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'}`} />))}</div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Strength: <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{passwordStrength.label}</span></p>
                </div>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Confirm password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your password" className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><Check size={12} /> Passwords match</p>
              )}
            </div>
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input type="checkbox" checked={formData.acceptTerms} onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })} className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-primary-300 focus:ring-primary-300/20" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>I agree to the <a href="#" className="text-primary-300 hover:text-primary-400">Terms of Service</a> and <a href="#" className="text-primary-300 hover:text-primary-400">Privacy Policy</a></span>
            </label>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
              {isSubmitting ? (<><Loader2 size={18} className="animate-spin" />Creating account...</>) : (<><UserPlus size={18} />Create account</>)}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
