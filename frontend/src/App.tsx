import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { createTrip as createTripRequest, deleteTrip as deleteTripRequest, getTrip as getTripRequest, getTrips, type NewTrip, type Trip } from './services/api';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import ItineraryPage from './pages/ItineraryPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

type TripSelection = Partial<Trip> | null;

interface TripContextType {
  trips: Trip[];
  currentTrip: TripSelection;
  setCurrentTrip: Dispatch<SetStateAction<TripSelection>>;
  createTrip: (trip: NewTrip) => Promise<Trip>;
  deleteTrip: (tripId: string) => Promise<void>;
  getTrip: (tripId: string) => Promise<Trip>;
  isLoadingTrips: boolean;
  tripsError: string;
}

export const TripContext = createContext<TripContextType | null>(null);

function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext)!;
  const location = useLocation();

  if (auth.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (auth.authError) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center">{auth.authError}</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useContext(AuthContext)!;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<TripSelection>(null);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState('');

  useEffect(() => {
    let active = true;
    setTrips([]);
    setCurrentTrip(null);
    setTripsError('');

    if (isLoadingAuth) return () => { active = false; };
    if (!isAuthenticated) {
      setIsLoadingTrips(false);
      return () => { active = false; };
    }

    setIsLoadingTrips(true);
    getTrips()
      .then(({ trips: savedTrips }) => {
        if (active) setTrips(savedTrips);
      })
      .catch((error: unknown) => {
        if (active) setTripsError(error instanceof Error ? error.message : 'Unable to load your trips.');
      })
      .finally(() => {
        if (active) setIsLoadingTrips(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, isLoadingAuth, user?.id]);

  const createTrip = useCallback(async (tripInput: NewTrip) => {
    const { trip } = await createTripRequest(tripInput);
    setTrips((previous) => [trip, ...previous.filter((item) => item.id !== trip.id)]);
    setCurrentTrip(trip);
    setTripsError('');
    return trip;
  }, []);

  const deleteTrip = useCallback(async (tripId: string) => {
    await deleteTripRequest(tripId);
    setTrips((previous) => previous.filter((trip) => trip.id !== tripId));
    setCurrentTrip((previous) => previous?.id === tripId ? null : previous);
  }, []);

  const getTrip = useCallback(async (tripId: string) => {
    const { trip } = await getTripRequest(tripId);
    setTrips((previous) => [trip, ...previous.filter((item) => item.id !== trip.id)]);
    return trip;
  }, []);

  const tripContext = useMemo(() => ({
    trips,
    currentTrip,
    setCurrentTrip,
    createTrip,
    deleteTrip,
    getTrip,
    isLoadingTrips,
    tripsError,
  }), [trips, currentTrip, createTrip, deleteTrip, getTrip, isLoadingTrips, tripsError]);

  return (
    <TripContext.Provider value={tripContext}>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/planner" element={<RequireAuth><PlannerPage /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/itinerary/:id" element={<RequireAuth><ItineraryPage /></RequireAuth>} />
            <Route path="/payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </div>
      </Router>
    </TripContext.Provider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
