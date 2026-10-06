export interface DestinationData {
  name: string;
  country: string;
  coordinates: [number, number];
  hotels: Array<{ name: string; lat: number; lng: number; price: string; rating: number }>;
  restaurants: Array<{ name: string; lat: number; lng: number; cuisine: string; price: string; rating: number }>;
  attractions: Array<{ name: string; lat: number; lng: number; type: string; duration: string; cost: string; rating: number }>;
  transport: Array<{ name: string; lat: number; lng: number; type: string }>;
  shopping: Array<{ name: string; lat: number; lng: number; type: string }>;
}

export const destinationsDatabase: Record<string, DestinationData> = {
  'Paris, France': {
    name: 'Paris',
    country: 'France',
    coordinates: [48.8566, 2.3522],
    hotels: [
      { name: 'Hotel Le Marais', lat: 48.8566, lng: 2.3622, price: '₹12,000/night', rating: 4.7 },
      { name: 'Paris Grand Hotel', lat: 48.8606, lng: 2.3476, price: '₹18,000/night', rating: 4.8 },
      { name: 'Louvre View Inn', lat: 48.8616, lng: 2.3356, price: '₹15,000/night', rating: 4.6 },
    ],
    restaurants: [
      { name: 'Le Petit Bistro', lat: 48.8530, lng: 2.3499, cuisine: 'French', price: '₹2,500', rating: 4.8 },
      { name: 'Café de Flore', lat: 48.8540, lng: 2.3326, cuisine: 'French Café', price: '₹1,800', rating: 4.7 },
      { name: 'L\'Ambroisie', lat: 48.8550, lng: 2.3610, cuisine: 'Fine Dining', price: '₹8,000', rating: 4.9 },
    ],
    attractions: [
      { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, type: 'landmark', duration: '2-3 hrs', cost: '₹2,100', rating: 4.9 },
      { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376, type: 'museum', duration: '3-4 hrs', cost: '₹1,400', rating: 4.9 },
      { name: 'Notre-Dame Cathedral', lat: 48.8530, lng: 2.3499, type: 'landmark', duration: '1-2 hrs', cost: 'Free', rating: 4.8 },
      { name: 'Arc de Triomphe', lat: 48.8738, lng: 2.2950, type: 'landmark', duration: '1-2 hrs', cost: '₹1,050', rating: 4.7 },
    ],
    transport: [
      { name: 'Gare du Nord Station', lat: 48.8809, lng: 2.3553, type: 'train' },
      { name: 'Charles de Gaulle Airport', lat: 49.0097, lng: 2.5479, type: 'airport' },
    ],
    shopping: [
      { name: 'Champs-Élysées', lat: 48.8698, lng: 2.3076, type: 'luxury' },
      { name: 'Galeries Lafayette', lat: 48.8737, lng: 2.3320, type: 'department_store' },
    ],
  },
  'Tokyo, Japan': {
    name: 'Tokyo',
    country: 'Japan',
    coordinates: [35.6762, 139.6503],
    hotels: [
      { name: 'Shinjuku Grand Hotel', lat: 35.6938, lng: 139.7034, price: '₹15,000/night', rating: 4.7 },
      { name: 'Tokyo Bay Hotel', lat: 35.6580, lng: 139.7514, price: '₹20,000/night', rating: 4.8 },
    ],
    restaurants: [
      { name: 'Sukiyabashi Jiro', lat: 35.6736, lng: 139.7382, cuisine: 'Sushi', price: '₹15,000', rating: 4.9 },
      { name: 'Ichiran Ramen', lat: 35.6595, lng: 139.7004, cuisine: 'Ramen', price: '₹1,200', rating: 4.7 },
    ],
    attractions: [
      { name: 'Tokyo Tower', lat: 35.6586, lng: 139.7454, type: 'landmark', duration: '1-2 hrs', cost: '₹1,050', rating: 4.7 },
      { name: 'Senso-ji Temple', lat: 35.7148, lng: 139.7967, type: 'temple', duration: '1-2 hrs', cost: 'Free', rating: 4.8 },
      { name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004, type: 'landmark', duration: '30 min', cost: 'Free', rating: 4.6 },
    ],
    transport: [
      { name: 'Tokyo Station', lat: 35.6812, lng: 139.7671, type: 'train' },
      { name: 'Narita Airport', lat: 35.7720, lng: 140.3929, type: 'airport' },
    ],
    shopping: [
      { name: 'Ginza District', lat: 35.6717, lng: 139.7649, type: 'luxury' },
    ],
  },
  'Mumbai, India': {
    name: 'Mumbai',
    country: 'India',
    coordinates: [19.0760, 72.8777],
    hotels: [
      { name: 'Taj Mahal Palace', lat: 18.9217, lng: 72.8330, price: '₹25,000/night', rating: 4.9 },
      { name: 'The Oberoi Mumbai', lat: 18.9378, lng: 72.8218, price: '₹18,000/night', rating: 4.8 },
    ],
    restaurants: [
      { name: 'Britannia & Co', lat: 18.9220, lng: 72.8347, cuisine: 'Parsi', price: '₹1,500', rating: 4.7 },
      { name: 'Leopold Cafe', lat: 18.9225, lng: 72.8338, cuisine: 'Multi-cuisine', price: '₹1,200', rating: 4.5 },
    ],
    attractions: [
      { name: 'Gateway of India', lat: 18.9220, lng: 72.8347, type: 'landmark', duration: '1 hr', cost: 'Free', rating: 4.7 },
      { name: 'Marine Drive', lat: 18.9432, lng: 72.8234, type: 'landmark', duration: '1-2 hrs', cost: 'Free', rating: 4.6 },
      { name: 'Elephanta Caves', lat: 18.9637, lng: 72.9314, type: 'heritage', duration: '4-5 hrs', cost: '₹500', rating: 4.5 },
    ],
    transport: [
      { name: 'Chhatrapati Shivaji Terminus', lat: 18.9398, lng: 72.8354, type: 'train' },
      { name: 'Mumbai International Airport', lat: 19.0896, lng: 72.8656, type: 'airport' },
    ],
    shopping: [
      { name: 'Colaba Causeway', lat: 18.9167, lng: 72.8300, type: 'street_market' },
    ],
  },
  'Dubai, UAE': {
    name: 'Dubai',
    country: 'UAE',
    coordinates: [25.2048, 55.2708],
    hotels: [
      { name: 'Burj Al Arab', lat: 25.1410, lng: 55.1850, price: '₹80,000/night', rating: 4.9 },
      { name: 'Atlantis The Palm', lat: 25.1300, lng: 55.1170, price: '₹35,000/night', rating: 4.8 },
    ],
    restaurants: [
      { name: 'At.mosphere', lat: 25.1972, lng: 55.2744, cuisine: 'Fine Dining', price: '₹12,000', rating: 4.8 },
      { name: 'Pierchic', lat: 25.1300, lng: 55.1190, cuisine: 'Seafood', price: '₹8,000', rating: 4.9 },
    ],
    attractions: [
      { name: 'Burj Khalifa', lat: 25.1972, lng: 55.2744, type: 'landmark', duration: '2 hrs', cost: '₹3,500', rating: 4.9 },
      { name: 'Dubai Mall', lat: 25.1972, lng: 55.2795, type: 'shopping', duration: '3-4 hrs', cost: 'Free', rating: 4.7 },
      { name: 'Desert Safari', lat: 25.0500, lng: 55.4000, type: 'activity', duration: '6 hrs', cost: '₹5,000', rating: 4.8 },
    ],
    transport: [
      { name: 'Dubai International Airport', lat: 25.2532, lng: 55.3657, type: 'airport' },
    ],
    shopping: [
      { name: 'Dubai Mall', lat: 25.1972, lng: 55.2795, type: 'luxury_mall' },
    ],
  },
  'Bali, Indonesia': {
    name: 'Bali',
    country: 'Indonesia',
    coordinates: [-8.3405, 115.0920],
    hotels: [
      { name: 'Four Seasons Ubud', lat: -8.5069, lng: 115.2625, price: '₹40,000/night', rating: 4.9 },
      { name: 'The Mulia Nusa Dua', lat: -8.8050, lng: 115.2250, price: '₹25,000/night', rating: 4.8 },
    ],
    restaurants: [
      { name: 'Locavore', lat: -8.5050, lng: 115.2620, cuisine: 'Modern Indonesian', price: '₹4,500', rating: 4.9 },
      { name: 'Ku De Ta', lat: -8.6850, lng: 115.1550, cuisine: 'International', price: '₹3,500', rating: 4.7 },
    ],
    attractions: [
      { name: 'Ubud Rice Terraces', lat: -8.4312, lng: 115.2795, type: 'nature', duration: '2-3 hrs', cost: '₹300', rating: 4.8 },
      { name: 'Tanah Lot Temple', lat: -8.6213, lng: 115.0868, type: 'temple', duration: '2 hrs', cost: '₹450', rating: 4.7 },
      { name: 'Seminyak Beach', lat: -8.6905, lng: 115.1689, type: 'beach', duration: '3-4 hrs', cost: 'Free', rating: 4.6 },
    ],
    transport: [
      { name: 'Ngurah Rai Airport', lat: -8.7475, lng: 115.1678, type: 'airport' },
    ],
    shopping: [
      { name: 'Ubud Art Market', lat: -8.5060, lng: 115.2625, type: 'art_market' },
    ],
  },
  'New York, USA': {
    name: 'New York',
    country: 'USA',
    coordinates: [40.7128, -74.0060],
    hotels: [
      { name: 'The Plaza Hotel', lat: 40.7644, lng: -73.9740, price: '₹55,000/night', rating: 4.8 },
      { name: 'The Standard High Line', lat: 40.7409, lng: -74.0079, price: '₹30,000/night', rating: 4.7 },
    ],
    restaurants: [
      { name: 'Katz\'s Delicatessen', lat: 40.7223, lng: -73.9874, cuisine: 'Deli', price: '₹2,000', rating: 4.7 },
      { name: 'Peter Luger Steakhouse', lat: 40.7099, lng: -73.9625, cuisine: 'Steakhouse', price: '₹8,000', rating: 4.8 },
    ],
    attractions: [
      { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445, type: 'landmark', duration: '3-4 hrs', cost: '₹1,750', rating: 4.8 },
      { name: 'Central Park', lat: 40.7829, lng: -73.9654, type: 'park', duration: '2-3 hrs', cost: 'Free', rating: 4.7 },
      { name: 'Times Square', lat: 40.7580, lng: -73.9855, type: 'landmark', duration: '1-2 hrs', cost: 'Free', rating: 4.5 },
    ],
    transport: [
      { name: 'Grand Central Terminal', lat: 40.7527, lng: -73.9772, type: 'train' },
      { name: 'JFK Airport', lat: 40.6413, lng: -73.7781, type: 'airport' },
    ],
    shopping: [
      { name: 'Fifth Avenue', lat: 40.7624, lng: -73.9738, type: 'luxury' },
    ],
  },
};

export function getDestinationData(destinationName: string): DestinationData {
  return destinationsDatabase[destinationName] || {
    name: destinationName.split(',')[0],
    country: destinationName.split(',')[1]?.trim() || 'Unknown',
    coordinates: [40.7128, -74.0060] as [number, number],
    hotels: [],
    restaurants: [],
    attractions: [],
    transport: [],
    shopping: [],
  };
}

export function generateActivitiesForDestination(destinationName: string): any[] {
  const data = getDestinationData(destinationName);
  const activities: any[] = [];

  if (data.transport.length > 0) {
    activities.push({
      time: '7:00 AM',
      title: 'Airport Arrival & Transfer',
      type: 'transport',
      duration: '1.5 hrs',
      icon: '🚗',
      location: data.transport[0].name,
      rating: 4.5,
      cost: '₹3,750',
    });
  }

  if (data.hotels.length > 0) {
    activities.push({
      time: '9:00 AM',
      title: 'Hotel Check-in',
      type: 'accommodation',
      duration: '1 hr',
      icon: '🏨',
      location: data.hotels[0].name,
      rating: data.hotels[0].rating,
      cost: data.hotels[0].price,
    });
  }

  if (data.attractions.length > 0) {
    activities.push({
      time: '10:30 AM',
      title: `Visit ${data.attractions[0].name}`,
      type: 'activity',
      duration: data.attractions[0].duration,
      icon: '🏛️',
      location: data.attractions[0].name,
      rating: data.attractions[0].rating,
      cost: data.attractions[0].cost,
    });
  }

  if (data.restaurants.length > 0) {
    activities.push({
      time: '1:00 PM',
      title: `Lunch at ${data.restaurants[0].name}`,
      type: 'food',
      duration: '1.5 hrs',
      icon: '🍽️',
      location: data.restaurants[0].name,
      rating: data.restaurants[0].rating,
      cost: data.restaurants[0].price,
    });
  }

  return activities;
}
