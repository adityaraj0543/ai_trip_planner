import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle, Plus, Thermometer, Cloud, Eye, CreditCard, Trash2, X } from 'lucide-react';
import { TripContext } from '../App';
import { ThemeContext } from '../context/ThemeContext';

export default function DashboardPage() {
  const { trips, setCurrentTrip, deleteTrip, isLoadingTrips, tripsError } = useContext(TripContext)!;
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const totalBudget = trips.reduce((sum: number, t: any) => sum + t.budget, 0);
  const totalTravelers = trips.reduce((sum: number, t: any) => sum + t.travelers, 0);
  const confirmedTrips = trips.filter((t: any) => t.status === 'confirmed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'planned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'planned': return <Clock size={14} />;
      case 'draft': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const handleDelete = async (tripId: string) => {
    setDeleteError('');
    try {
      await deleteTrip(tripId);
      setDeleteConfirm(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete this trip.');
    }
  };

  return (
    <div className="min-h-screen bg-mesh pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Delete Success Toast */}
        <AnimatePresence>
          {deleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-50 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2"
            >
              <CheckCircle size={18} />
              <span>Trip deleted successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`max-w-md w-full rounded-2xl p-6 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete Trip?</h3>
                  <button onClick={() => setDeleteConfirm(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                    <X size={20} className={isDark ? 'text-gray-400' : 'text-slate-500'} />
                  </button>
                </div>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Are you sure you want to delete this trip? This action cannot be undone and all trip data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className={`flex-1 py-3 rounded-xl font-semibold border transition-all ${isDark ? 'border-slate-600 hover:bg-slate-700 text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { void handleDelete(deleteConfirm); }}
                    className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg hover:shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Trip
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
              Travel <span className="text-gradient">Dashboard</span>
            </h1>
            <p className={isDark ? 'text-gray-400 mt-2' : 'text-slate-600 mt-2'}>Manage all your trips in one place</p>
          </div>
          <Link to="/planner" className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-primary-300/25 transition-all hover:scale-105">
            <Plus size={18} /> New Trip
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Trips', value: trips.length, icon: <MapPin size={20} />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
            { label: 'Total Budget', value: `₹${totalBudget.toLocaleString('en-IN')}`, icon: <DollarSign size={20} />, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Travelers', value: totalTravelers, icon: <Users size={20} />, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10' },
            { label: 'Confirmed', value: confirmedTrips, icon: <CheckCircle size={20} />, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <div className={`bg-gradient-to-r ${stat.color} rounded-lg p-1.5 text-white`}>{stat.icon}</div>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trips List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Trips</h3>
          
          {tripsError || deleteError ? (
            <p role="alert" className="mb-4 text-sm text-rose-400">{tripsError || deleteError}</p>
          ) : null}

          {isLoadingTrips ? (
            <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Loading your trips...</p>
          ) : trips.length === 0 && !tripsError ? (
            <div className={`text-center py-16 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
              <MapPin className={`mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} size={48} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No trips yet</h3>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Start planning your first adventure!</p>
              <Link to="/planner" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-300 to-purple-400 rounded-xl font-semibold text-white hover:shadow-lg transition-all">
                <Plus size={18} /> Plan Your First Trip
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip: any, i: number) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`p-4 sm:p-6 rounded-2xl border card-hover ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <MapPin size={16} className="text-primary-300" />
                            {trip.destination}
                          </h4>
                          <div className={`flex items-center gap-4 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                            <span className="flex items-center gap-1"><Calendar size={14} />{trip.startDate} - {trip.endDate}</span>
                            <span className="flex items-center gap-1"><Clock size={14} />{trip.days || 3}D / {trip.nights || 2}N</span>
                            <span className="flex items-center gap-1"><Users size={14} />{trip.travelers}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)} {trip.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(trip.activities || []).slice(0, 3).map((activity: string, j: number) => (
                          <span key={j} className={`px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-slate-700/50 text-gray-300' : 'bg-slate-100 text-slate-700'}`}>{activity}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => { setCurrentTrip(trip); navigate(`/itinerary/${trip.id}`); }}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all"
                        >
                          <Eye size={14} /> View Itinerary
                        </button>
                        <button
                          onClick={() => { setCurrentTrip(trip); navigate(`/payment?tripId=${encodeURIComponent(trip.id)}`); }}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
                        >
                          <CreditCard size={14} /> Pay Now
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(trip.id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-all ml-auto"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-400">₹{trip.budget.toLocaleString('en-IN')}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Budget</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
