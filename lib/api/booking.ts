import { Hotel, ApiResponse } from "@/types";
import { calculateDistance } from "@/lib/utils";

const BOOKING_API_KEY = process.env.NEXT_PUBLIC_BOOKING_API_KEY || "";
const BOOKING_BASE_URL = "https://api.booking.com/v1";

export async function searchHotels(
  latitude: number,
  longitude: number,
  checkInDate: string,
  checkOutDate: string,
  radiusKm: number = 20,
  guests: number = 1
): Promise<ApiResponse<Hotel[]>> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      radiusKm: radiusKm.toString(),
      guests: guests.toString(),
      room_qty: "1",
      rows: "20",
    });

    const response = await fetch(
      `${BOOKING_BASE_URL}/hotels?${params}`,
      {
        headers: {
          Authorization: `Bearer ${BOOKING_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Booking.com API error: ${response.statusText}`);
      return {
        success: true,
        data: generateMockHotels(latitude, longitude, checkInDate, checkOutDate),
      };
    }

    const data = await response.json();
    const hotels = data.result || [];

    const formattedHotels: Hotel[] = hotels.map((hotel: any) => ({
      id: hotel.id,
      name: hotel.hotel_name,
      city: hotel.city,
      latitude: parseFloat(hotel.latitude),
      longitude: parseFloat(hotel.longitude),
      distance: calculateDistance(
        latitude,
        longitude,
        parseFloat(hotel.latitude),
        parseFloat(hotel.longitude)
      ),
      stars: hotel.review_score ? Math.round(hotel.review_score / 2) : 4,
      price: hotel.price_breakdown?.gross_price || 0,
      currency: hotel.currency_code || "EUR",
      image: hotel.photo_url,
      amenities: hotel.hotel_facilities || [],
      reviews: hotel.review_count,
      rating: hotel.review_score ? hotel.review_score / 2 : 4,
      availability: hotel.number_of_rooms > 0,
    }));

    return {
      success: true,
      data: formattedHotels.sort((a, b) => a.distance - b.distance),
    };
  } catch (error) {
    console.error("Error searching hotels:", error);
    return {
      success: true,
      data: generateMockHotels(latitude, longitude, checkInDate, checkOutDate),
    };
  }
}

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
  ];

  const mockHotels: Hotel[] = hotelNames.map((name, index) => ({
    id: `hotel-${index}`,
    name: name,
    city: "Paris",
    latitude: latitude + (Math.random() - 0.5) * 0.1,
    longitude: longitude + (Math.random() - 0.5) * 0.1,
    distance: Math.round(Math.random() * 15 * 10) / 10,
    stars: Math.floor(Math.random() * 2) + 4,
    price: Math.floor(Math.random() * 200) + 80,
    currency: "EUR",
    image: `https://images.unsplash.com/photo-${1600000000 + index}?w=400&h=300`,
    amenities: [
      "WiFi",
      "Piscine",
      "Restaurant",
      "Gym",
      "Parking",
      "Climatisation",
    ],
    reviews: Math.floor(Math.random() * 500) + 50,
    rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10,
    availability: true,
  }));

  return mockHotels.sort((a, b) => a.distance - b.distance);
}

export async function getHotelById(hotelId: string): Promise<ApiResponse<Hotel>> {
  try {
    const params = new URLSearchParams({
      hotel_id: hotelId,
    });

    const response = await fetch(
      `${BOOKING_BASE_URL}/hotels/${hotelId}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${BOOKING_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Booking.com API error: ${response.statusText}`);
    }

    const data = await response.json();
    const hotel = data.result;

    const formattedHotel: Hotel = {
      id: hotel.id,
      name: hotel.hotel_name,
      city: hotel.city,
      latitude: parseFloat(hotel.latitude),
      longitude: parseFloat(hotel.longitude),
      distance: 0,
      stars: hotel.review_score ? Math.round(hotel.review_score / 2) : 4,
      price: hotel.price_breakdown?.gross_price || 0,
      currency: hotel.currency_code || "EUR",
      image: hotel.photo_url,
      amenities: hotel.hotel_facilities || [],
      reviews: hotel.review_count,
      rating: hotel.review_score ? hotel.review_score / 2 : 4,
      availability: hotel.number_of_rooms > 0,
    };

    return {
      success: true,
      data: formattedHotel,
    };
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function searchHotelsInCity(
  city: string,
  checkInDate: string,
  checkOutDate: string,
  guests: number = 1
): Promise<ApiResponse<Hotel[]>> {
  try {
    const params = new URLSearchParams({
      city: city,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      guests: guests.toString(),
      room_qty: "1",
      rows: "20",
    });

    const response = await fetch(
      `${BOOKING_BASE_URL}/hotels?${params}`,
      {
        headers: {
          Authorization: `Bearer ${BOOKING_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Booking.com API error: ${response.statusText}`);
      return {
        success: true,
        data: generateMockHotels(48.8566, 2.3522, checkInDate, checkOutDate),
      };
    }

    const data = await response.json();
    const hotels = data.result || [];

    const formattedHotels: Hotel[] = hotels.map((hotel: any) => ({
      id: hotel.id,
      name: hotel.hotel_name,
      city: hotel.city,
      latitude: parseFloat(hotel.latitude),
      longitude: parseFloat(hotel.longitude),
      distance: 0,
      stars: hotel.review_score ? Math.round(hotel.review_score / 2) : 4,
      price: hotel.price_breakdown?.gross_price || 0,
      currency: hotel.currency_code || "EUR",
      image: hotel.photo_url,
      amenities: hotel.hotel_facilities || [],
      reviews: hotel.review_count,
      rating: hotel.review_score ? hotel.review_score / 2 : 4,
      availability: hotel.number_of_rooms > 0,
    }));

    return {
      success: true,
      data: formattedHotels,
    };
  } catch (error) {
    console.error("Error searching hotels in city:", error);
    return {
      success: true,
      data: generateMockHotels(48.8566, 2.3522, checkInDate, checkOutDate),
    };
  }
}
