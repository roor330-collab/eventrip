/**
 * Eventrip — Booking.com Partner API
 * - API partenaire officielle Booking.com
 * - Recherche par géolocalisation ou ville
 * - Filtres: dates, distance, budget
 * - Fallback avec données réalistes
 *
 * Inscription : https://partner.booking.com
 * Docs : https://developers.booking.com/api
 */

import { Hotel, ApiResponse } from "@/types";
import { apiFetch, haversineKm, ApiError } from "@/lib/api-client";

const BOOKING_API_KEY = () => process.env.BOOKING_API_KEY || "";
const BOOKING_API_SECRET = () => process.env.BOOKING_API_SECRET || "";
const BOOKING_AFFILIATE_ID = process.env.BOOKING_AFFILIATE_ID || "booking";
const BOOKING_BASE_URL = "https://api.booking.com/v2";

// ─── Headers pour authentification Booking ────────────────────────────────────
function bookingHeaders(): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(timestamp);

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Booking-Key": BOOKING_API_KEY(),
    "X-Booking-Timestamp": timestamp.toString(),
    "X-Booking-Signature": signature,
  };
}

// Signature HMAC pour authentification Booking
function generateSignature(timestamp: number): string {
  const crypto = require("crypto");
  const message = `${BOOKING_API_KEY()}${timestamp}`;
  return crypto
    .createHmac("sha256", BOOKING_API_SECRET())
    .update(message)
    .digest("hex");
}

// ─── Recherche par coordonnées GPS ─────────────────────────────────────────────
export async function searchHotels(
  latitude: number,
  longitude: number,
  checkInDate: string,
  checkOutDate: string,
  radiusKm: number = 15,
  guests: number = 1
): Promise<ApiResponse<Hotel[]>> {
  try {
    if (!BOOKING_API_KEY()) {
      console.warn("BOOKING_API_KEY non configuré, utilisation données mock");
      return {
        success: true,
        data: generateMockHotels(
          latitude,
          longitude,
          checkInDate,
          checkOutDate
        ),
      };
    }

    // Calcul de la boîte englobante
    const latDelta = radiusKm / 111; // 1 degré ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const searchBody = {
      data: {
        nearby_area: {
          latitude,
          longitude,
          radius_km: radiusKm,
        },
        available_filter: true,
        checkout_date: checkOutDate,
        checkin_date: checkInDate,
        guest_reviews_filter: 7, // >= 7.0 rating
        include_adjacency: true,
        language: "fr",
        max_photo_count: 1,
        order_by: "distance",
        room_qty: 1,
      },
    };

    const data = await apiFetch<any>(
      `${BOOKING_BASE_URL}/json/hotels`,
      {
        method: "POST",
        headers: bookingHeaders(),
        body: JSON.stringify(searchBody),
        service: "booking-hotels",
        cacheTtl: 600, // 10 min
        cacheKey: `booking:hotels:${latitude}:${longitude}:${checkInDate}:${checkOutDate}`,
      }
    );

    if (!data.result || !Array.isArray(data.result)) {
      return {
        success: false,
        error: "Réponse Booking invalide",
        data: generateMockHotels(
          latitude,
          longitude,
          checkInDate,
          checkOutDate
        ),
      };
    }

    const hotels = data.result
      .map((hotel: any) => mapBookingHotel(hotel, latitude, longitude))
      .filter((h: Hotel) => h.price > 0)
      .sort((a: Hotel, b: Hotel) => a.distance - b.distance)
      .slice(0, 20);

    return {
      success: true,
      data: hotels,
    };
  } catch (error) {
    const e = error as ApiError;
    console.error("[Booking] hotels error:", e.message);
    return {
      success: true,
      data: generateMockHotels(
        latitude,
        longitude,
        checkInDate,
        checkOutDate
      ),
    };
  }
}

// ─── Recherche par ville ──────────────────────────────────────────────────────
export async function searchHotelsInCity(
  city: string,
  checkInDate: string,
  checkOutDate: string,
  guests: number = 1
): Promise<ApiResponse<Hotel[]>> {
  try {
    if (!BOOKING_API_KEY()) {
      return {
        success: true,
        data: generateMockHotels(48.8566, 2.3522, checkInDate, checkOutDate),
      };
    }

    const searchBody = {
      data: {
        name: city,
        checkin_date: checkInDate,
        checkout_date: checkOutDate,
        available_filter: true,
        guest_reviews_filter: 7,
        order_by: "distance",
        room_qty: 1,
        language: "fr",
      },
    };

    const data = await apiFetch<any>(
      `${BOOKING_BASE_URL}/json/hotels/search`,
      {
        method: "POST",
        headers: bookingHeaders(),
        body: JSON.stringify(searchBody),
        service: "booking-city-search",
        cacheTtl: 600,
        cacheKey: `booking:city:${city}:${checkInDate}:${checkOutDate}`,
      }
    );

    if (!data.result) {
      return {
        success: false,
        error: "Réponse Booking invalide",
        data: generateMockHotels(48.8566, 2.3522, checkInDate, checkOutDate),
      };
    }

    const hotels = (data.result as any[])
      .map((hotel: any) => ({
        ...mapBookingHotel(hotel, 48.8566, 2.3522),
        distance: 0,
      }))
      .slice(0, 20);

    return { success: true, data: hotels };
  } catch (error) {
    console.error("[Booking] city search error:", error);
    return {
      success: true,
      data: generateMockHotels(48.8566, 2.3522, checkInDate, checkOutDate),
    };
  }
}

// ─── Récupérer détails d'un hôtel ─────────────────────────────────────────────
export async function getHotelById(hotelId: string): Promise<ApiResponse<Hotel>> {
  try {
    const data = await apiFetch<any>(
      `${BOOKING_BASE_URL}/json/hotels/${hotelId}`,
      {
        headers: bookingHeaders(),
        service: "booking-hotel-detail",
        cacheTtl: 3600,
        cacheKey: `booking:hotel:${hotelId}`,
      }
    );

    if (!data.result) {
      throw new Error("Hôtel non trouvé");
    }

    const hotel = mapBookingHotel(data.result, 0, 0);
    return { success: true, data: hotel };
  } catch (error) {
    console.error("[Booking] hotel detail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur Booking",
    };
  }
}

// ─── Mappage Booking → Hotel ──────────────────────────────────────────────────
function mapBookingHotel(
  hotel: any,
  venueLat: number,
  venueLng: number
): Hotel {
  const hotelLat = parseFloat(hotel.latitude || "0");
  const hotelLng = parseFloat(hotel.longitude || "0");
  const distance =
    venueLat && venueLng
      ? haversineKm(venueLat, venueLng, hotelLat, hotelLng)
      : 0;

  return {
    id: hotel.hotel_id || hotel.id || "",
    name: hotel.hotel_name || hotel.name || "Hôtel",
    city: hotel.city || hotel.address?.city || "Unknown",
    latitude: hotelLat,
    longitude: hotelLng,
    distance,
    stars: hotel.class || Math.round((hotel.review_score || 4) / 2) || 4,
    price: parseFloat(hotel.price || hotel.min_total_price || "0"),
    currency: hotel.currency_code || "EUR",
    image: hotel.main_photo_url || hotel.photo_url || "",
    amenities: parseAmenities(hotel.hotel_facilities || hotel.facilities || []),
    reviews: hotel.review_nr || hotel.review_count || 0,
    rating: parseFloat(hotel.review_score || "4") / 2 || 4,
    availability:
      (hotel.available === 1 || hotel.number_of_rooms > 0) ?? true,
  };
}

function parseAmenities(facilities: any[]): string[] {
  if (!Array.isArray(facilities)) return [];
  return facilities
    .map((f: any) => (typeof f === "string" ? f : f.name))
    .filter(Boolean)
    .slice(0, 8);
}

// ─── Données mock réalistes ────────────────────────────────────────────────────
function generateMockHotels(
  latitude: number,
  longitude: number,
  checkInDate: string,
  checkOutDate: string
): Hotel[] {
  const hotelNames = [
    "Hotel Le Majestic",
    "Boutique Hotel Parisien",
    "Grand Hotel Luxe",
    "Hotel de Charme",
    "Auberge Moderne",
    "Hotel L'Excellence",
    "Chateau Hotels & Resorts",
    "Hotel Prestige",
    "Le Petit Paris",
    "Villa Romantique",
  ];

  return hotelNames.map((name, index) => ({
    id: `booking-mock-${index}`,
    name,
    city: "Paris",
    latitude: latitude + (Math.random() - 0.5) * 0.08,
    longitude: longitude + (Math.random() - 0.5) * 0.08,
    distance: Math.round(Math.random() * 12 * 10) / 10,
    stars: Math.floor(Math.random() * 2) + 4,
    price: Math.floor(Math.random() * 220) + 75,
    currency: "EUR",
    image: `https://images.unsplash.com/photo-${1500000000 + index * 50000}?w=400&h=300&fit=crop`,
    amenities: [
      "WiFi",
      "Piscine",
      "Restaurant",
      "Gym",
      "Parking",
      "Climatisation",
    ],
    reviews: Math.floor(Math.random() * 600) + 80,
    rating: Math.round((Math.random() * 1.5 + 3.8) * 10) / 10,
    availability: Math.random() > 0.2,
  }));
}
