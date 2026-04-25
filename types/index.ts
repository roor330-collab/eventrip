export interface Event {
  id: string;
  title: string;
  description?: string;
  image: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: "concert" | "sport" | "festival" | "theatre" | "conference";
  category?: string;
  artists?: string[];
  ticketsAvailable: number;
  minPrice: number;
  maxPrice: number;
  latitude?: number;
  longitude?: number;
  externalId?: string;
  source?: "ticketmaster" | "eventbrite" | "amadeus";
}

export interface Ticket {
  id: string;
  eventId: string;
  category: "fosse" | "tribune" | "vip";
  price: number;
  quantity: number;
  available: number;
}

export interface Flight {
  id: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  price: number;
  duration: number;
  stops: number;
  availability: number;
  flightNumber?: string;
  aircraft?: string;
}

export interface Train {
  id: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  operator: string;
  price: number;
  duration: number;
  availability: number;
  trainNumber?: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  distance: number;
  stars: number;
  price: number;
  currency: string;
  image?: string;
  amenities?: string[];
  reviews?: number;
  rating?: number;
  availability: boolean;
}

export interface PackageItem {
  type: "ticket" | "flight" | "train" | "hotel";
  id: string;
  quantity?: number;
  price: number;
  details: Record<string, any>;
}

export interface Package {
  id: string;
  eventId: string;
  userId?: string;
  items: PackageItem[];
  totalPrice: number;
  currency: string;
  createdAt?: string;
  status?: "draft" | "booked" | "completed";
  passengers?: Passenger[];
}

export interface Passenger {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface SearchFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  country?: string;
  artist?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
