import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Sparkles, Search, Loader2, Check, ArrowRight, Compass, Camera, Utensils, ShoppingBag, Heart, Sun, Moon } from 'lucide-react';
import { TripContext } from '../App';
import { ThemeContext } from '../context/ThemeContext';

const allDestinations = [
  { name: 'Paris, France', emoji: '🇫🇷' },
  { name: 'Tokyo, Japan', emoji: '🇯🇵' },
  { name: 'Bali, Indonesia', emoji: '🇮🇩' },
  { name: 'New York, USA', emoji: '🇺🇸' },
  { name: 'Dubai, UAE', emoji: '🇦🇪' },
  { name: 'Mumbai, India', emoji: '🇮🇳' },
  { name: 'London, UK', emoji: '🇬🇧' },
  { name: 'Rome, Italy', emoji: '🇮🇹' },
  { name: 'Barcelona, Spain', emoji: '🇪🇸' },
  { name: 'Bangkok, Thailand', emoji: '🇹🇭' },
  { name: 'Singapore', emoji: '🇸🇬' },
  { name: 'Seoul, South Korea', emoji: '🇰🇷' },
  { name: 'Sydney, Australia', emoji: '🇦🇺' },
  { name: 'Istanbul, Turkey', emoji: '🇹🇷' },
  { name: 'Berlin, Germany', emoji: '🇩🇪' },
  { name: 'Amsterdam, Netherlands', emoji: '🇳🇱' },
];

const travelStyles = [
  { id: 'adventure', label: 'Adventure', icon: <Compass size={18} />, color: 'from-orange-400 to-red-500' },
  { id: 'culture', label: 'Culture', icon: <Camera size={18} />, color: 'from-purple-400 to-pink-500' },
  { id: 'food', label: 'Food & Wine', icon: <Utensils size={18} />, color: 'from-amber-400 to-orange-500' },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={18} />, color: 'from-pink-400 to-rose-500' },
  { id: 'relaxation', label: 'Relaxation', icon: <Heart size={18} />, color: 'from-cyan-400 to-blue-500' },
];

export default function PlannerPage() {
  const { createTrip, currentTrip } = useContext(TripContext)!;
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creationError, setCreationError] = useState('');
  const [stepOneError, setStepOneError] = useState('');
  const [formData, setFormData] = useState({
    destination: currentTrip?.destination || '',
    startDate: '',
    endDate: '',
    days: 3,
    nights: 2,
    travelers: 2,
    budget: 250000,
    travelStyle: [] as string[],
    notes: '',
  });

  // Auto-calculate days and nights from date range
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0 && diffDays <= 30) {
        setFormData(prev => ({
          ...prev,
          days: diffDays,
          nights: diffDays - 1,
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);
  const [searchQuery, setSearchQuery] = useState(currentTrip?.destination || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredDestinations = searchQuery
    ? allDestinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allDestinations.slice(0, 16);

  const handleDestinationSelect = (destination: string) => {
    setFormData(prev => ({ ...prev, destination }));
    setSearchQuery(destination);
    setStepOneError('');
    setShowSuggestions(false);
  };

  const continueToTravelers = () => {
    if (!formData.destination.trim()) {
      setStepOneError('Enter or select a destination to continue.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      setStepOneError('Select both travel dates to continue.');
      return;
    }
    if (!hasValidDates) {
      setStepOneError('End date must be on or after the start date.');
      return;
    }

    setStepOneError('');
    setStep(2);
  };

  const toggleStyle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(id)
        ? prev.travelStyle.filter(s => s !== id)
        : [...prev.travelStyle, id],
    }));
  };

  const handleGenerate = async () => {
    setCreationError('');
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newTrip = await createTrip({
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        nights: formData.nights,
        travelers: formData.travelers,
        budget: formData.budget,
        status: 'planned',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
        weather: { temp: Math.floor(Math.random() * 25) + 10, condition: 'Partly Cloudy', icon: '⛅' },
        activities: [],
        travelStyle: formData.travelStyle,
        notes: formData.notes,
      });
      navigate(`/itinerary/${newTrip.id}`);
    } catch (error) {
      setCreationError(error instanceof Error ? error.message : 'Unable to save this trip.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasValidDates = !!formData.startDate && !!formData.endDate && formData.endDate >= formData.startDate;

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Plan Your <span className="text-gradient">Perfect Trip</span>
          </h1>
          <p className={isDark ? 'text-gray-400 text-lg' : 'text-slate-600 text-lg'}>Let AI create a personalized itinerary just for you</p>
        </motion.div>

        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${step >= s ? 'bg-gradient-to-r from-primary-300 to-purple-400 text-white' : 'bg-slate-700 text-gray-400'}`}>
                {step > s ? <Check size={18} /> : s}
              </div>
              {i < 2 && <div className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-primary-300 to-purple-400' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <MapPin className="text-primary-300" />
                    Where do you want to go?
                  </h2>
                  <div className="relative mb-6">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} size={20} />
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      value={searchQuery}
                      onChange={(e) => {
                        const destination = e.target.value;
                        setSearchQuery(destination);
                        setFormData(prev => ({ ...prev, destination }));
                        setStepOneError('');
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-400 focus:ring-primary-200'}`}
                    />
                    
                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && searchQuery && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 max-h-64 overflow-y-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                        >
                          {filteredDestinations.length > 0 ? (
                            filteredDestinations.map((dest) => (
                              <button
                                key={dest.name}
                                onClick={() => handleDestinationSelect(dest.name)}
                                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                              >
                                <span className="text-2xl">{dest.emoji}</span>
                                <div className="text-left">
                                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{dest.name}</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className={`px-4 py-6 text-center ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                              No destinations found
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="max-h-80 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredDestinations.map((dest) => (
                        <button
                          key={dest.name}
                          onClick={() => handleDestinationSelect(dest.name)}
                          className={`p-3 rounded-xl border text-left transition-all hover:scale-105 ${
                            formData.destination === dest.name
                              ? 'border-primary-300 bg-primary-300/10 ring-2 ring-primary-300/20'
                              : isDark ? 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500' : 'border-slate-300 bg-slate-50 hover:border-primary-300'
                          }`}
                        >
                          <span className="text-2xl">{dest.emoji}</span>
                          <p className={`text-sm font-medium mt-1 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{dest.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Calendar className="text-purple-400" />
                    When are you traveling?
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm mb-2 block ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Start Date</label>
                      <input type="date" value={formData.startDate} onChange={(e) => {
                        setFormData(prev => ({ ...prev, startDate: e.target.value }));
                        setStepOneError('');
                      }} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 focus:border-primary-400 focus:ring-primary-200'}`} />
                    </div>
                    <div>
                      <label className={`text-sm mb-2 block ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>End Date</label>
                      <input type="date" min={formData.startDate || undefined} value={formData.endDate} onChange={(e) => {
                        setFormData(prev => ({ ...prev, endDate: e.target.value }));
                        setStepOneError('');
                      }} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-primary-300/50 focus:ring-primary-300/20' : 'bg-white border-slate-300 text-slate-900 focus:border-primary-400 focus:ring-primary-200'}`} />
                    </div>
                  </div>

                  {/* Days & Nights Selector */}
                  <div className="mt-6">
                    <label className={`text-sm mb-3 block ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Trip Duration</label>
                    <div className={`p-6 rounded-xl border ${isDark ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50' : 'bg-gradient-to-br from-slate-50 to-white border-slate-200'}`}>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Days */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Sun className="text-amber-400" size={24} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Days</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, days: Math.max(1, prev.days - 1), nights: Math.max(0, prev.nights - 1) }))}
                              className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900'}`}
                            >
                              -
                            </button>
                            <div className="w-20">
                              <span className="text-4xl font-bold text-gradient">{formData.days}</span>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, days: Math.min(30, prev.days + 1), nights: prev.nights + 1 }))}
                              className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900'}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Nights */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <Moon className="text-indigo-400" size={24} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Nights</span>
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, nights: Math.max(0, prev.nights - 1), days: Math.max(1, prev.days - 1) }))}
                              className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900'}`}
                            >
                              -
                            </button>
                            <div className="w-20">
                              <span className="text-4xl font-bold text-gradient">{formData.nights}</span>
                            </div>
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, nights: Math.min(29, prev.nights + 1), days: prev.days + 1 }))}
                              className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900'}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Select Presets */}
                      <div className="mt-6 pt-6 border-t border-slate-600/30">
                        <p className={`text-xs mb-3 text-center ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Quick Select</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            { label: 'Weekend', days: 2, nights: 1 },
                            { label: '3 Days', days: 3, nights: 2 },
                            { label: '1 Week', days: 7, nights: 6 },
                            { label: '2 Weeks', days: 14, nights: 13 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => setFormData(prev => ({ ...prev, days: preset.days, nights: preset.nights }))}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                formData.days === preset.days && formData.nights === preset.nights
                                  ? 'bg-gradient-to-r from-primary-300 to-purple-400 text-white'
                                  : isDark ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={continueToTravelers}
                  className="w-full py-4 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-lg text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
                {stepOneError && <p role="alert" className="text-center text-sm text-rose-400">{stepOneError}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Users className="text-emerald-400" />
                    How many travelers?
                  </h2>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setFormData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))} className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-colors ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-900'}`}>-</button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-bold text-gradient">{formData.travelers}</span>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>travelers</p>
                    </div>
                    <button onClick={() => setFormData(prev => ({ ...prev, travelers: Math.min(20, prev.travelers + 1) }))} className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-colors ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-white' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-900'}`}>+</button>
                  </div>
                </div>

                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <DollarSign className="text-amber-400" />
                    What's your budget?
                  </h2>
                  <div className="space-y-4">
                    <input type="range" min="25000" max="1000000" step="5000" value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-300" />
                    <div className={`flex justify-between text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      <span>₹25,000</span>
                      <span className="text-2xl font-bold text-gradient">₹{formData.budget.toLocaleString('en-IN')}</span>
                      <span>₹10,00,000</span>
                    </div>
                    <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                      Per person • Approximately ₹{Math.round(formData.budget / formData.travelers).toLocaleString('en-IN')} per person
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className={`flex-1 py-4 rounded-xl font-semibold border transition-all ${isDark ? 'border-slate-600 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2">
                    Continue <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className={`p-8 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="text-purple-400" />
                    What's your travel style?
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {travelStyles.map((style) => (
                      <button key={style.id} onClick={() => toggleStyle(style.id)} className={`p-4 rounded-xl border text-center transition-all hover:scale-105 ${formData.travelStyle.includes(style.id) ? 'border-primary-300 bg-primary-300/10 ring-2 ring-primary-300/20' : isDark ? 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500' : 'border-slate-300 bg-slate-50 hover:border-primary-300'}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${style.color} flex items-center justify-center mx-auto mb-2 text-white`}>{style.icon}</div>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-primary-300/10 border-primary-300/20' : 'bg-primary-50 border-primary-200'}`}>
                  <h3 className="font-semibold mb-3 text-primary-300">Trip Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Destination:</span> <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.destination}</span></div>
                    <div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Duration:</span> <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.days}D / {formData.nights}N</span></div>
                    <div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Travelers:</span> <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.travelers}</span></div>
                    <div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Budget:</span> <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{formData.budget.toLocaleString('en-IN')}</span></div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className={`flex-1 py-4 rounded-xl font-semibold border transition-all ${isDark ? 'border-slate-600 hover:bg-slate-800 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}>Back</button>
                  <button onClick={handleGenerate} disabled={isGenerating} className="flex-[2] py-4 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {isGenerating ? (<><Loader2 size={20} className="animate-spin" />Saving Your Trip...</>) : (<><Sparkles size={20} />Generate AI Itinerary</>)}
                  </button>
                </div>
                {creationError && <p role="alert" className="text-center text-sm text-rose-400">{creationError}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-300/30 animate-ping" />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-r from-primary-300 to-purple-400 flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="text-white" size={32} />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Creating Your Itinerary</h3>
                <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>AI is crafting the perfect trip for {formData.destination}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
