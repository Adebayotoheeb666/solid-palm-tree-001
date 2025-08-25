import { RequestHandler } from "express";
import { z } from "zod";
import AmadeusService, {
  FlightSearchParams,
  AirportSearchParams,
} from "../lib/amadeusService";

// Validation schemas
const flightSearchSchema = z.object({
  originLocationCode: z.string().length(3),
  destinationLocationCode: z.string().length(3),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(8).optional(),
  infants: z.number().min(0).max(8).optional(),
  travelClass: z
    .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"])
    .optional(),
  currencyCode: z.string().length(3).optional(),
  max: z.number().min(1).max(250).optional(),
});

const airportSearchSchema = z.object({
  keyword: z.string().min(2),
  subType: z.enum(["AIRPORT", "CITY"]).optional(),
});

const flightPriceSchema = z.object({
  flightOffers: z.array(z.any()).min(1),
});

const seatMapSchema = z.object({
  flightOfferId: z.string(),
});

const airlineSchema = z.object({
  airlineCode: z.string().length(2),
});

// Search flight offers
export const handleSearchFlights: RequestHandler = async (req, res) => {
  try {
    // Convert string query parameters to proper types
    const queryParams = {
      ...req.query,
      ...(req.query.adults && { adults: parseInt(req.query.adults as string) }),
      ...(req.query.children && {
        children: parseInt(req.query.children as string),
      }),
      ...(req.query.infants && {
        infants: parseInt(req.query.infants as string),
      }),
      ...(req.query.max && { max: parseInt(req.query.max as string) }),
    };

    const validation = flightSearchSchema.safeParse(queryParams);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid search parameters",
        errors: validation.error.errors,
      });
    }

    const searchParams: FlightSearchParams = validation.data;

    console.log("Searching flights:", searchParams);

    const flightOffers = await AmadeusService.searchFlightOffers(searchParams);

    res.json({
      success: true,
      data: flightOffers,
      meta: {
        count: flightOffers.length,
        searchParams,
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search flights",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Search airports and cities
export const handleSearchAirports: RequestHandler = async (req, res) => {
  try {
    const validation = airportSearchSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid search parameters",
        errors: validation.error.errors,
      });
    }

    const searchParams: AirportSearchParams = validation.data;

    console.log("Searching airports:", searchParams);

    const airports = await AmadeusService.searchAirports(searchParams);

    res.json({
      success: true,
      data: airports,
      meta: {
        count: airports.length,
        searchParams,
      },
    });
  } catch (error) {
    console.error("Airport search error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search airports",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get flight price details
export const handleGetFlightPrice: RequestHandler = async (req, res) => {
  try {
    const validation = flightPriceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid flight offers data",
        errors: validation.error.errors,
      });
    }

    const { flightOffers } = validation.data;

    console.log("Getting flight price for:", flightOffers.length, "offers");

    const priceData = await AmadeusService.getFlightPrice({ flightOffers });

    res.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    console.error("Flight price error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get flight price",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get seat maps
export const handleGetSeatMaps: RequestHandler = async (req, res) => {
  try {
    const validation = seatMapSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat map parameters",
        errors: validation.error.errors,
      });
    }

    const { flightOfferId } = validation.data;

    console.log("Getting seat maps for flight offer:", flightOfferId);

    const seatMaps = await AmadeusService.getSeatMaps({ flightOfferId });

    res.json({
      success: true,
      data: seatMaps,
    });
  } catch (error) {
    console.error("Seat map error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get seat maps",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get airline information
export const handleGetAirline: RequestHandler = async (req, res) => {
  try {
    const validation = airlineSchema.safeParse(req.params);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid airline code",
        errors: validation.error.errors,
      });
    }

    const { airlineCode } = validation.data;

    console.log("Getting airline info for:", airlineCode);

    const airlineInfo = await AmadeusService.getAirline(airlineCode);

    res.json({
      success: true,
      data: airlineInfo,
    });
  } catch (error) {
    console.error("Airline info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get airline information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get popular destinations
export const handleGetPopularDestinations: RequestHandler = async (
  req,
  res,
) => {
  try {
    // This is a mock implementation as Amadeus doesn't have a direct "popular destinations" endpoint
    // In a real implementation, you could use flight inspiration search or travel recommendations

    const popularDestinations = [
      {
        iataCode: "NYC",
        cityName: "New York",
        countryCode: "US",
        countryName: "United States",
        image:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
        description: "The city that never sleeps",
      },
      {
        iataCode: "LON",
        cityName: "London",
        countryCode: "GB",
        countryName: "United Kingdom",
        image:
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
        description: "Historic charm meets modern culture",
      },
      {
        iataCode: "PAR",
        cityName: "Paris",
        countryCode: "FR",
        countryName: "France",
        image:
          "https://images.unsplash.com/photo-1549144511-f099e773c147?w=400",
        description: "The city of lights and romance",
      },
      {
        iataCode: "TOK",
        cityName: "Tokyo",
        countryCode: "JP",
        countryName: "Japan",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
        description: "Where tradition meets innovation",
      },
      {
        iataCode: "SYD",
        cityName: "Sydney",
        countryCode: "AU",
        countryName: "Australia",
        image:
          "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400",
        description: "Harbor views and beach culture",
      },
      {
        iataCode: "DXB",
        cityName: "Dubai",
        countryCode: "AE",
        countryName: "United Arab Emirates",
        image:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
        description: "Luxury and adventure in the desert",
      },
    ];

    res.json({
      success: true,
      data: popularDestinations,
      meta: {
        count: popularDestinations.length,
        note: "Popular destinations based on travel trends",
      },
    });
  } catch (error) {
    console.error("Popular destinations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popular destinations",
    });
  }
};

// Health check for Amadeus service
export const handleAmadeusHealthCheck: RequestHandler = async (req, res) => {
  try {
    // Test with a simple airport search
    const testResult = await AmadeusService.searchAirports({ keyword: "JFK" });

    res.json({
      success: true,
      message: "Amadeus service is operational",
      configured: !!process.env.AMADEUS_API_KEY,
      environment:
        process.env.NODE_ENV === "production" ? "production" : "test",
      testResult: testResult.length > 0 ? "passed" : "no_results",
    });
  } catch (error) {
    console.error("Amadeus health check error:", error);
    res.status(500).json({
      success: false,
      message: "Amadeus service health check failed",
      configured: !!process.env.AMADEUS_API_KEY,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
