import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, LayoutDashboard, Menu, X, Globe, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Clock from './Clock';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext)!;
  const { isDark, toggleTheme } = useContext(ThemeContext);

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const links = [
    { to: '/', label: 'Home', icon: <Globe size={18} /> },
    { to: '/planner', label: 'Plan Trip', icon: <Compass size={18} /> },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    setUserMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to complete sign out.');
    }
    navigate('/', { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 flex items-center justify-center text-[#173f4a] dark:text-primary-200 group-hover:scale-105 transition-transform">
              <Compass size={38} strokeWidth={1.8} />
              <span className="absolute text-[9px] font-black tracking-tight">TG</span>
            </div>
            <span className="leading-none">
              <span className={`block text-[1.05rem] font-black tracking-[0.14em] ${isDark ? 'text-white' : 'text-[#173f4a]'}`}>TRIPGENIUS</span>
              <span className={`block mt-1 text-[0.47rem] font-bold tracking-[0.2em] ${isDark ? 'text-primary-200' : 'text-[#315b64]'}`}>PLAN. DISCOVER. EXPLORE.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-300/20 text-primary-300 border border-primary-300/30'
                    : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Clock />
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all hover:scale-110 ${
                isDark
                  ? 'bg-slate-800/50 border border-slate-700/50 text-yellow-400 hover:bg-slate-700/50'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(user.name)}
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl overflow-hidden z-20 ${
                          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                        }`}
                      >
                        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-300 to-purple-400 flex items-center justify-center text-white font-semibold">
                              {getInitials(user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isDark ? 'text-gray-300 hover:bg-slate-700/50 hover:text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <LayoutDashboard size={16} />
                            My Dashboard
                          </Link>
                          <Link to="/planner" onClick={() => setUserMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isDark ? 'text-gray-300 hover:bg-slate-700/50 hover:text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
                            <Compass size={16} />
                            Plan New Trip
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                              isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <LogOut size={16} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'}`}>
                  Sign in
                </Link>
                <Link to="/signup" className="px-5 py-2.5 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all hover:scale-105">
                  Sign up free
                </Link>
              </>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Clock />
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-yellow-400' : 'hover:bg-slate-100 text-slate-700'}`}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} className={isDark ? 'text-white' : 'text-slate-900'} /> : <Menu size={24} className={isDark ? 'text-white' : 'text-slate-900'} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass-dark border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-primary-300/20 text-primary-300'
                      : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && user ? (
                <>
                  <div className={`flex items-center gap-3 px-4 py-3 mt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-purple-400 flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </>
              ) : (
                <div className={`flex gap-2 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <Link to="/login" onClick={() => setIsOpen(false)} className={`flex-1 text-center px-4 py-3 rounded-xl text-sm font-medium border transition-all ${isDark ? 'border-slate-600 hover:bg-slate-800 text-gray-300' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>
                    Sign in
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-300 to-purple-400 text-white">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
