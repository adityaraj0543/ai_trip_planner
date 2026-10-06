import { useContext, useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleMap, { type MapPoint } from '../components/GoogleMap';
import { MapPin, Calendar, Clock, Thermometer, Star, ArrowLeft, CreditCard, Share2, Download, Map as MapIcon, Cloud, CheckCircle } from 'lucide-react';
import { TripContext } from '../App';
import { ThemeContext } from '../context/ThemeContext';
import { getDestinationData, generateActivitiesForDestination } from '../data/destinations';



export default function ItineraryPage() {
  const { id } = useParams();
  const { trips, setCurrentTrip, getTrip, isLoadingTrips } = useContext(TripContext)!;
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(0);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [loadedTrip, setLoadedTrip] = useState<any>(null);
  const [tripError, setTripError] = useState('');

  const trip = trips.find((item: any) => item.id === id) || loadedTrip;

  useEffect(() => {
    let active = true;
    const savedTrip = trips.find((item: any) => item.id === id);
    if (savedTrip) {
      setLoadedTrip(null);
      setCurrentTrip(savedTrip);
      setTripError('');
    } else if (id && !isLoadingTrips) {
      getTrip(id)
        .then((saved) => {
          if (active) {
            setLoadedTrip(saved);
            setCurrentTrip(saved);
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
  }, [id, trips, isLoadingTrips, getTrip, setCurrentTrip]);

  const destinationData = useMemo(() => trip ? getDestinationData(trip.destination) : null, [trip]);
  const activities = useMemo(() => {
    if (!trip || !destinationData) return [];
    const base = generateActivitiesForDestination(trip.destination);
    const days = trip.days || 3;
    const result = [];
    
    for (let i = 0; i < days; i++) {
      const startIdx = i * 4;
      const dayActivities = base.slice(startIdx, startIdx + 4);
      if (dayActivities.length === 0) {
        // If we run out of base activities, create generic ones
        result.push([
          {
            time: '9:00 AM',
            title: `Day ${i + 1} Exploration`,
            type: 'activity',
            duration: '3-4 hrs',
            icon: '🎯',
            location: destinationData.attractions[i % destinationData.attractions.length]?.name || 'Local Area',
            rating: 4.5,
            cost: '₹1,500',
          },
          {
            time: '1:00 PM',
            title: 'Lunch',
            type: 'food',
            duration: '1.5 hrs',
            icon: '🍽️',
            location: destinationData.restaurants[i % destinationData.restaurants.length]?.name || 'Local Restaurant',
            rating: 4.5,
            cost: destinationData.restaurants[i % destinationData.restaurants.length]?.price || '₹2,000',
          },
          {
            time: '3:00 PM',
            title: `Sightseeing`,
            type: 'activity',
            duration: '2-3 hrs',
            icon: '🏛️',
            location: destinationData.attractions[(i + 1) % destinationData.attractions.length]?.name || 'City Center',
            rating: 4.6,
            cost: '₹1,000',
          },
        ]);
      } else {
        result.push(dayActivities);
      }
    }
    
    return result;
  }, [trip, destinationData]);

  if (isLoadingTrips || (!trip && !tripError)) {
    return <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center">Loading trip...</div>;
  }

  if (!trip || !destinationData) {
    return (
      <div className="min-h-screen bg-mesh pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tripError || 'Trip not found'}</h2>
          <Link to="/dashboard" className="text-primary-300 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentDayActivities = activities[activeDay] || [];
  const budgetBreakdown = [
    { label: 'Flights', amount: Math.round(trip.budget * 0.30), color: 'bg-blue-500' },
    { label: 'Accommodation', amount: Math.round(trip.budget * 0.25), color: 'bg-purple-500' },
    { label: 'Activities', amount: Math.round(trip.budget * 0.15), color: 'bg-amber-500' },
    { label: 'Food & Dining', amount: Math.round(trip.budget * 0.15), color: 'bg-rose-500' },
    { label: 'Transport', amount: Math.round(trip.budget * 0.08), color: 'bg-emerald-500' },
    { label: 'Shopping', amount: Math.round(trip.budget * 0.07), color: 'bg-cyan-500' },
  ];

  const handleShare = async () => {
    const shareText = `🌍 Trip to ${trip.destination}\n📅 ${trip.startDate} - ${trip.endDate}\n⏱️ ${trip.days || 3} Days / ${trip.nights || 2} Nights\n👥 ${trip.travelers} Travelers\n💰 Budget: ₹${trip.budget.toLocaleString('en-IN')}\n\nPlanned with TripGenius ✈️`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trip to ${trip.destination}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleExport = () => {
    let exportText = `TRIP ITINERARY\n${'='.repeat(50)}\n\n`;
    exportText += `Destination: ${trip.destination}\n`;
    exportText += `Dates: ${trip.startDate} - ${trip.endDate}\n`;
    exportText += `Duration: ${trip.days || 3} Days / ${trip.nights || 2} Nights\n`;
    exportText += `Travelers: ${trip.travelers}\n`;
    exportText += `Budget: ₹${trip.budget.toLocaleString('en-IN')}\n\n`;
    exportText += `${'='.repeat(50)}\n\n`;

    activities.forEach((dayActivities, dayIndex) => {
      exportText += `DAY ${dayIndex + 1}\n${'-'.repeat(50)}\n\n`;
      dayActivities.forEach((activity: any) => {
        exportText += `${activity.time} - ${activity.title}\n`;
        exportText += `  📍 ${activity.location}\n`;
        exportText += `  ⏱️ Duration: ${activity.duration}\n`;
        exportText += `  💰 Cost: ${activity.cost}\n`;
        exportText += `  ⭐ Rating: ${activity.rating}/5\n\n`;
      });
      exportText += `\n`;
    });

    exportText += `${'='.repeat(50)}\n`;
    exportText += `BUDGET BREAKDOWN\n${'-'.repeat(50)}\n\n`;
    budgetBreakdown.forEach(item => {
      exportText += `${item.label}: ₹${item.amount.toLocaleString('en-IN')}\n`;
    });
    exportText += `\nTotal: ₹${trip.budget.toLocaleString('en-IN')}\n\n`;
    exportText += `Generated by TripGenius ✈️`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.replace(/,/g, '')}-itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 mb-4 transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                <MapPin className="text-primary-300" size={32} /> {trip.destination}
              </h1>
              <div className={`flex flex-wrap items-center gap-4 mt-3 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                <span className="flex items-center gap-1"><Calendar size={16} /> {trip.startDate} - {trip.endDate}</span>
                <span className="flex items-center gap-1"><Clock size={16} /> {trip.days || 3} Days / {trip.nights || 2} Nights</span>
                <span className="flex items-center gap-1"><Thermometer size={16} /> {trip.weather.temp}°C {trip.weather.icon}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleShare} className={`px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2 ${isDark ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 text-white' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'}`}><Share2 size={14} /> Share</button>
              <button onClick={handleExport} className={`px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2 ${isDark ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700 text-white' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'}`}><Download size={14} /> Export</button>
              <button onClick={() => navigate(`/payment?tripId=${encodeURIComponent(trip.id)}`)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-300 to-purple-400 text-sm font-medium text-white hover:shadow-lg transition-all flex items-center gap-2"><CreditCard size={14} /> Book Now</button>
            </div>
          </div>
        </motion.div>

        {/* Success Notifications */}
        <AnimatePresence>
          {showShareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-4 z-50 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 shadow-lg"
            >
              <CheckCircle size={18} />
              <span>Trip details copied to clipboard!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showExportSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-4 z-50 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 shadow-lg"
            >
              <CheckCircle size={18} />
              <span>Itinerary exported successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`mb-8 p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <MapIcon className="text-primary-300" size={20} /> Interactive Map - {destinationData.name}
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">🏨</div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Hotels ({destinationData.hotels.length})</span></div>
            <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px]">🍽️</div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Restaurants ({destinationData.restaurants.length})</span></div>
            <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">🎯</div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Attractions ({destinationData.attractions.length})</span></div>
            <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">🚗</div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Transport ({destinationData.transport.length})</span></div>
            <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-[10px]">🛍️</div><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Shopping ({destinationData.shopping.length})</span></div>
          </div>
          <div className="relative h-96 rounded-xl overflow-hidden border border-slate-700/50">
            <GoogleMap
              center={destinationData.coordinates}
              zoom={13}
              dark={isDark}
              points={[
                { name: trip.destination, lat: destinationData.coordinates[0], lng: destinationData.coordinates[1], emoji: '📍', details: 'Trip destination' },
                ...destinationData.hotels.map((h) => ({ name: h.name, lat: h.lat, lng: h.lng, emoji: '🏨', details: `${h.price} • ⭐${h.rating}` })),
                ...destinationData.restaurants.map((r) => ({ name: r.name, lat: r.lat, lng: r.lng, emoji: '🍽️', details: `${r.cuisine} • ${r.price}` })),
                ...destinationData.attractions.map((a) => ({ name: a.name, lat: a.lat, lng: a.lng, emoji: '🎯', details: `${a.duration} • ${a.cost}` })),
                ...destinationData.transport.map((t) => ({ name: t.name, lat: t.lat, lng: t.lng, emoji: '🚗', details: t.type })),
                ...destinationData.shopping.map((s) => ({ name: s.name, lat: s.lat, lng: s.lng, emoji: '🛍️', details: s.type })),
              ] as MapPoint[]}
            />
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: trip.days || 3 }, (_, i) => (
            <button key={i} onClick={() => setActiveDay(i)} className={`px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${activeDay === i ? 'bg-gradient-to-r from-primary-300 to-purple-400 text-white shadow-lg' : isDark ? 'bg-slate-800/50 border border-slate-700/50 text-gray-400 hover:text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'}`}>Day {i + 1}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {currentDayActivities.map((activity: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg flex-shrink-0 ${isDark ? 'bg-slate-700/50 border-slate-600/50' : 'bg-white border-slate-200'}`}>{activity.icon}</div>
                  {i < currentDayActivities.length - 1 && <div className="w-0.5 flex-1 bg-gradient-to-b from-primary-300/50 to-purple-400/50 my-1" />}
                </div>
                <div className={`flex-1 p-4 rounded-xl border mb-2 ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:border-primary-300/30' : 'bg-white border-slate-200 hover:border-primary-300'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{activity.title}</h4>
                      <div className={`flex flex-wrap items-center gap-3 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-1"><Clock size={12} /> {activity.time} • {activity.duration}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {activity.location}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">{activity.cost}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2"><Star size={12} className="text-amber-400 fill-amber-400" /><span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{activity.rating}</span></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Cloud className="text-primary-300" size={18} /> Weather</h3>
              <div className="text-center"><span className="text-5xl">{trip.weather.icon}</span><p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{trip.weather.temp}°C</p><p className={isDark ? 'text-gray-400' : 'text-slate-600'}>{trip.weather.condition}</p></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><CreditCard className="text-emerald-400" size={18} /> Budget</h3>
              <div className="space-y-3">
                {budgetBreakdown.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1"><span className={isDark ? 'text-gray-400' : 'text-slate-600'}>{item.label}</span><span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{item.amount.toLocaleString('en-IN')}</span></div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}><div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.amount / trip.budget) * 100}%` }} /></div>
                  </div>
                ))}
                <div className={`pt-3 border-t flex justify-between font-bold ${isDark ? 'border-slate-700' : 'border-slate-200'}`}><span className={isDark ? 'text-white' : 'text-slate-900'}>Total</span><span className="text-emerald-400">₹{trip.budget.toLocaleString('en-IN')}</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
