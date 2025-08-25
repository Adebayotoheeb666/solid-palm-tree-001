import { RequestHandler } from "express";
import { BookingRequest, BookingResponse, Booking } from "@shared/api";
import { z } from "zod";
import { getAllBookings, addBooking } from "./user";

// Get shared bookings array
let bookings = getAllBookings();
let bookingIdCounter = bookings.length + 1;

// Validation schema for booking request
const bookingSchema = z.object({
  route: z.object({
    from: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    to: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    departureDate: z.string(),
    returnDate: z.string().optional(),
    tripType: z.enum(["oneway", "roundtrip"]),
  }),
  passengers: z
    .array(
      z.object({
        title: z.enum(["Mr", "Ms", "Mrs"]),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
      }),
    )
    .min(1),
  contactEmail: z.string().email(),
  termsAccepted: z.boolean(),
  selectedFlight: z.any().optional(),
  totalAmount: z.number().optional(),
});

// Generate PNR (Passenger Name Record)
const generatePNR = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calculate booking amount based on selected flight or fallback
const calculateBookingAmount = (
  passengers: any[],
  selectedFlight?: any,
  providedAmount?: number,
): number => {
  // Use provided total amount if available
  if (providedAmount && providedAmount > 0) {
    return providedAmount;
  }

  // Use selected flight pricing if available
  if (selectedFlight && selectedFlight.price && selectedFlight.price.total) {
    const flightPrice = parseFloat(selectedFlight.price.total);
    return flightPrice * passengers.length;
  }

  // Fallback to $15 per passenger
  return passengers.length * 15;
};

// Create new booking
export const handleCreateBooking: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      console.error(
        "No user found in request - authentication may have failed",
      );
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    console.log("Creating booking for user:", user.id);
    console.log("Booking request data:", JSON.stringify(req.body, null, 2));

    const validation = bookingSchema.safeParse(req.body);

    if (!validation.success) {
      console.error("Booking validation failed:", validation.error.errors);
      const response: BookingResponse = {
        success: false,
        message: `Invalid booking data: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      };
      return res.status(400).json(response);
    }

    const bookingData = validation.data;

    if (!bookingData.termsAccepted) {
      const response: BookingResponse = {
        success: false,
        message: "Terms and conditions must be accepted",
      };
      return res.status(400).json(response);
    }

    // Calculate amounts
    const totalAmount = calculateBookingAmount(
      bookingData.passengers,
      bookingData.selectedFlight,
      bookingData.totalAmount,
    );

    const basePrice = bookingData.selectedFlight?.price
      ? parseFloat(bookingData.selectedFlight.price.total)
      : 15;

    const currency = bookingData.selectedFlight?.price?.currency || "USD";

    // Create booking
    const booking: Booking = {
      id: `booking_${bookingIdCounter}`,
      userId: user.id,
      pnr: generatePNR(),
      status: "pending",
      route: bookingData.route as any,
      passengers: bookingData.passengers as any,
      totalAmount: totalAmount,
      currency: currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      selectedFlight: bookingData.selectedFlight || null,
      basePrice: basePrice,
    };

    addBooking(booking);
    bookingIdCounter++;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response: BookingResponse = {
      success: true,
      booking,
      message: "Booking created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create booking error:", error);
    const response: BookingResponse = {
      success: false,
      message: "Internal server error",
    };
    res.status(500).json(response);
  }
};

// Get user's bookings
export const handleGetUserBookings: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;

    const userBookings = bookings
      .filter((booking) => booking.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    res.json(userBookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get specific booking
export const handleGetBooking: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;

    const booking = bookings.find(
      (b) => b.id === bookingId && b.userId === user.id,
    );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update booking status
export const handleUpdateBookingStatus: RequestHandler = (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "expired"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...(status === "confirmed" && {
        ticketUrl: `/tickets/${bookings[bookingIndex].pnr}.pdf`,
      }),
    };

    res.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cancel booking
export const handleCancelBooking: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { bookingId } = req.params;

    const bookingIndex = bookings.findIndex(
      (b) => b.id === bookingId && b.userId === user.id,
    );

    if (bookingIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const booking = bookings[bookingIndex];

    if (booking.status === "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel confirmed booking. Please contact support.",
      });
    }

    bookings[bookingIndex] = {
      ...booking,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all bookings (admin only)
export const handleGetAllBookings: RequestHandler = (req, res) => {
  try {
    // In a real application, check if user is admin
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    let filteredBookings = bookings;

    if (status && status !== "all") {
      filteredBookings = bookings.filter(
        (booking) => booking.status === status,
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(startIndex, endIndex);

    res.json({
      bookings: paginatedBookings,
      total: filteredBookings.length,
      page,
      limit,
      totalPages: Math.ceil(filteredBookings.length / limit),
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Export bookings for external use
export { bookings };
