import { useState, useContext, FormEvent } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useContext(AuthContext)!;
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const requestedPath = from?.pathname || '/dashboard';
  const redirectTo = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
    ? `${requestedPath}${from?.search || ''}${from?.hash || ''}`
    : '/dashboard';

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.identifier || !formData.password) { setError('Please fill in all fields'); return; }
    setIsSubmitting(true);
    try {
      const result = await login(formData.identifier, formData.password);
      if (result.success) { setSuccess(result.message); setTimeout(() => navigate(redirectTo, { replace: true }), 600); }
      else { setError(result.message); }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-300 to-purple-400 flex items-center justify-center"><MapPin className="text-white" size={24} /></div>
            <span className="text-2xl font-bold"><span className="text-gradient">Trip</span><span className={isDark ? 'text-white' : 'text-slate-900'}>Genius</span></span>
          </Link>
          <h2 className={`text-5xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Welcome back to your <span className="text-gradient">dream trips</span></h2>
          <p className={isDark ? 'text-gray-400 text-lg' : 'text-slate-600 text-lg'}>Sign in to continue planning your next adventure.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className={`inline-flex items-center gap-2 mb-8 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}><ArrowLeft size={18} /> Back to home</Link>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>Sign in to <span className="text-gradient">TripGenius</span></h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Don't have an account? <Link to="/signup" className="text-primary-300 hover:text-primary-400 font-medium">Sign up free</Link></p>

          {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3"><AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={18} /><p className="text-sm text-rose-300">{error}</p></motion.div>)}
          {success && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3"><CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} /><p className="text-sm text-emerald-300">{success}</p></motion.div>)}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Email address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type="text" autoComplete="username" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} placeholder="you@example.com or username" className={`w-full pl-12 pr-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={18} />
                <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter your password" className={`w-full pl-12 pr-12 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-gray-500 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-slate-400 hover:text-slate-600'}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isSubmitting ? (<><Loader2 size={18} className="animate-spin" />Signing in...</>) : (<><LogIn size={18} />Sign in</>)}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}
