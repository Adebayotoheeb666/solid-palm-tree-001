import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import Supabase authentication routes
import {
  handleSupabaseRegister,
  handleSupabaseLogin,
  handleSupabaseValidateToken,
  supabaseAuthMiddleware,
} from "./routes/supabase-auth";

// Import database initialization
import { DatabaseInitializer } from "./lib/databaseInit";

// Import fallback authentication routes for demo
import {
  handleRegister,
  handleLogin,
  handleValidateToken,
  authenticateUser,
} from "./routes/auth";

// Import hybrid authentication routes
import {
  handleHybridRegister,
  handleHybridLogin,
  handleHybridValidateToken,
  hybridAuthMiddleware,
} from "./routes/hybrid-auth";

// Import user management routes
import {
  handleGetDashboard,
  handleGetBookings,
  handleGetBooking,
  handleUpdateProfile,
} from "./routes/user";

// Import Supabase booking routes
import {
  handleCreateSupabaseBooking,
  handleGetSupabaseUserBookings,
  handleGetSupabaseBooking,
  handleUpdateSupabaseBookingStatus,
  handleCancelSupabaseBooking,
  handleGetAllSupabaseBookings,
} from "./routes/supabase-bookings";

// Import fallback routes
import { fallbackAirportsRouter } from "./routes/fallback-airports";
import { dbHealthRouter } from "./routes/db-health";
import { dbTestRouter } from "./routes/db-test";

// Import fallback booking routes for demo
import {
  handleCreateBooking,
  handleGetUserBookings,
  handleGetBooking as handleGetBookingDetails,
  handleUpdateBookingStatus,
  handleCancelBooking,
  handleGetAllBookings,
} from "./routes/bookings";

// Import payment routes
import {
  handleProcessPayment,
  handleGetPaymentHistory,
  handleGetTransaction,
  handleRefundPayment,
  handleGetAllTransactions,
  handleCreatePayPalOrder,
  handleCapturePayPalPayment,
  handleCreateStripePaymentIntent,
  handleGetStripeConfig,
} from "./routes/payments";

// Import support routes
import {
  handleCreateSupportTicket,
  handleGetUserSupportTickets,
  handleGetSupportTicket,
  handleUpdateSupportTicketStatus,
  handleCloseSupportTicket,
  handleGetAllSupportTickets,
  handleGetSupportStats,
} from "./routes/support";

// Import admin routes
import {
  handleGetAdminStats,
  handleGetAllUsers,
  handleUpdateUserStatus,
} from "./routes/admin";

// Import email service routes
import {
  handleSendBookingConfirmation,
  handleSendPaymentConfirmation,
  handleSendSupportTicketConfirmation,
  handleSendPasswordReset,
  handleSendWelcomeEmail,
  handleTestEmail,
} from "./routes/email";

// Import Amadeus API routes
import {
  handleSearchFlights,
  handleSearchAirports,
  handleGetFlightPrice,
  handleGetSeatMaps,
  handleGetAirline,
  handleGetPopularDestinations,
  handleAmadeusHealthCheck,
} from "./routes/amadeus";

// Import Stripe webhook routes
import {
  handleStripeWebhook,
  handleWebhookHealth,
} from "./routes/stripe-webhooks";

// Import email verification routes
import {
  handleSendVerificationEmail,
  handleVerifyEmail,
  handleCheckVerificationStatus,
  handleResendVerificationEmail,
} from "./routes/email-verification";

export async function createServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Stripe webhook needs raw body, so add it before express.json()
  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

  // JSON parsing middleware with increased limit
  app.use(
    express.json({
      limit: "10mb",
      type: ["application/json"],
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database health check
  app.get("/api/health/database", async (req, res) => {
    const useSupabase = !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_URL.includes("placeholder") &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
    );

    if (!useSupabase) {
      return res.json({
        healthy: true,
        message: "Using fallback system (no database)",
        system: "fallback",
      });
    }

    const health = await DatabaseInitializer.checkHealth();
    res.status(health.healthy ? 200 : 500).json({
      ...health,
      system: "supabase",
    });
  });

  // System status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const useSupabase = !!(
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        !process.env.SUPABASE_URL.includes("placeholder") &&
        process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
      );
      const dbHealth = useSupabase
        ? await DatabaseInitializer.checkHealth()
        : { healthy: true, message: "Not using database" };

      res.json({
        server: "online",
        authSystem: "hybrid",
        database: {
          configured: useSupabase,
          healthy: dbHealth.healthy,
          message: dbHealth.message,
          system: useSupabase ? "supabase" : "fallback",
        },
        features: {
          authentication: "✅ Available (hybrid)",
          userRegistration: "✅ Available (hybrid)",
          booking: useSupabase ? "✅ Database + fallback" : "⚠️ Fallback only",
          admin: useSupabase ? "✅ Database + fallback" : "⚠️ Fallback only",
          airports:
            useSupabase && dbHealth.healthy
              ? "✅ Database"
              : "⚠️ Static data only",
        },
        adminCredentials: {
          email: "onboard@admin.com",
          password: "onboardadmin",
        },
      });
    } catch (error) {
      console.error("Status endpoint error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get system status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Add fallback airports route
  app.use("/api", fallbackAirportsRouter);

  // Health check routes
  app.get("/api/health", (_req, res) => {
    const useSupabase = !!(
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_URL.includes("placeholder") &&
      process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
    );

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        server: "healthy",
        database: useSupabase ? "configured" : "fallback",
        authentication: "hybrid",
      },
    };

    res.json(health);
  });

  // Database routes
  app.use("/api", dbHealthRouter);
  app.use("/api", dbTestRouter);

  // Check which authentication and database system to use
  const useSupabase = !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_URL.includes("placeholder") &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "placeholder-service-role-key"
  );

  console.log("🔧 Auth system configuration:");
  console.log("  SUPABASE_URL:", !!process.env.SUPABASE_URL);
  console.log(
    "  SUPABASE_SERVICE_ROLE_KEY:",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  console.log("  useSupabase:", useSupabase);
  console.log("  Auth routes: Using", useSupabase ? "Supabase" : "fallback");

  // Use hybrid auth middleware to support both Supabase and fallback authentication
  const authMiddleware = hybridAuthMiddleware;

  console.log(
    "📋 Setting up auth middleware: Hybrid (supports both Supabase and fallback)",
  );

  // Initialize database if using Supabase (only at runtime, not during build)
  if (
    useSupabase &&
    (process.env.NODE_ENV !== "production" || process.env.PORT)
  ) {
    console.log("🔄 Initializing database...");
    DatabaseInitializer.initialize()
      .then((success) => {
        if (success) {
          console.log("✅ Database initialization completed");
        } else {
          console.log(
            "⚠️ Database initialization failed, some features may not work",
          );
        }
      })
      .catch((error) => {
        console.log("❌ Database initialization error:", error);
      });
  }

  // Authentication routes (public) - using hybrid system
  console.log("📋 Setting up hybrid auth routes (Supabase + fallback)");
  app.post("/api/auth/register", handleHybridRegister);
  app.post("/api/auth/login", handleHybridLogin);
  app.get("/api/auth/validate", handleHybridValidateToken);

  // User management routes (authenticated)
  app.get("/api/user/dashboard", authMiddleware, handleGetDashboard);
  app.get("/api/user/bookings", authMiddleware, handleGetBookings);
  app.get("/api/user/bookings/:bookingId", authMiddleware, handleGetBooking);
  app.put("/api/user/profile", authMiddleware, handleUpdateProfile);

  // Guest booking routes (no authentication required)
  const { handleCreateGuestBooking, handleGetGuestBooking } = await import(
    "./routes/guest-bookings"
  );

  // Guest booking route (uses global JSON parser)
  app.post("/api/guest/bookings", handleCreateGuestBooking);
  app.get("/api/guest/bookings/:pnr", handleGetGuestBooking);

  // Booking routes (authenticated) - use hybrid auth system for consistency
  app.post("/api/bookings", authMiddleware, handleCreateBooking);
  app.get("/api/bookings", authMiddleware, handleGetUserBookings);
  app.get("/api/bookings/:bookingId", authMiddleware, handleGetBookingDetails);
  app.put(
    "/api/bookings/:bookingId/cancel",
    authMiddleware,
    handleCancelBooking,
  );

  // Payment routes (authenticated)
  app.post("/api/payments", authMiddleware, handleProcessPayment);
  app.post("/api/payments/paypal/create-order", handleCreatePayPalOrder);
  app.post("/api/payments/paypal/capture", handleCapturePayPalPayment);
  app.post(
    "/api/payments/stripe/create-intent",
    authMiddleware,
    handleCreateStripePaymentIntent,
  );
  app.get("/api/payments/stripe/config", handleGetStripeConfig);
  app.get("/api/payments/history", authMiddleware, handleGetPaymentHistory);
  app.get("/api/payments/:transactionId", authMiddleware, handleGetTransaction);

  // Support ticket routes (authenticated)
  app.post("/api/support/tickets", authMiddleware, handleCreateSupportTicket);
  app.get("/api/support/tickets", authMiddleware, handleGetUserSupportTickets);
  app.get(
    "/api/support/tickets/:ticketId",
    authMiddleware,
    handleGetSupportTicket,
  );
  app.put(
    "/api/support/tickets/:ticketId/close",
    authMiddleware,
    handleCloseSupportTicket,
  );

  // Email service routes (authenticated)
  app.post(
    "/api/email/booking-confirmation",
    authMiddleware,
    handleSendBookingConfirmation,
  );
  app.post(
    "/api/email/payment-confirmation",
    authMiddleware,
    handleSendPaymentConfirmation,
  );
  app.post(
    "/api/email/support-ticket",
    authMiddleware,
    handleSendSupportTicketConfirmation,
  );
  app.post("/api/email/password-reset", handleSendPasswordReset);
  app.post("/api/email/welcome", authMiddleware, handleSendWelcomeEmail);
  app.post("/api/email/test", authMiddleware, handleTestEmail);

  // Public contact route
  const { handleContactSubmit } = await import("./routes/contact.js");
  app.post("/api/contact", handleContactSubmit);

  // Email verification routes (public)
  app.post("/api/email/verify/send", handleSendVerificationEmail);
  app.post("/api/email/verify/confirm", handleVerifyEmail);
  app.get("/api/email/verify/status/:token", handleCheckVerificationStatus);
  app.post("/api/email/verify/resend", handleResendVerificationEmail);

  // Amadeus API routes (public)
  app.get("/api/amadeus/flights/search", handleSearchFlights);
  app.get("/api/amadeus/airports/search", handleSearchAirports);
  app.get("/api/amadeus/flights/price", handleGetFlightPrice);
  app.get("/api/amadeus/flights/seatmaps", handleGetSeatMaps);
  app.get("/api/amadeus/airlines/:airlineCode", handleGetAirline);
  app.get("/api/amadeus/destinations/popular", handleGetPopularDestinations);
  app.get("/api/amadeus/health", handleAmadeusHealthCheck);

  // Stripe webhook routes (public, but authenticated via Stripe signature)
  app.post("/api/webhooks/stripe", handleStripeWebhook);
  app.get("/api/webhooks/health", handleWebhookHealth);

  // Admin routes (authenticated) - Note: These should have additional admin role checks
  app.get("/api/admin/stats", authMiddleware, handleGetAdminStats);
  app.get("/api/admin/users", authMiddleware, handleGetAllUsers);
  app.put(
    "/api/admin/users/:userId/status",
    authMiddleware,
    handleUpdateUserStatus,
  );
  app.get("/api/admin/bookings", authMiddleware, handleGetAllBookings);
  app.put(
    "/api/admin/bookings/:bookingId/status",
    authMiddleware,
    handleUpdateBookingStatus,
  );
  app.get(
    "/api/admin/support/tickets",
    authMiddleware,
    handleGetAllSupportTickets,
  );
  app.put(
    "/api/admin/support/tickets/:ticketId/status",
    authMiddleware,
    handleUpdateSupportTicketStatus,
  );
  app.get("/api/admin/support/stats", authMiddleware, handleGetSupportStats);
  app.get("/api/admin/payments", authMiddleware, handleGetAllTransactions);
  app.post(
    "/api/admin/payments/:transactionId/refund",
    authMiddleware,
    handleRefundPayment,
  );

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.path}`,
      availableEndpoints: [
        "GET /api/ping",
        "GET /api/status",
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/guest/bookings",
        "GET /api/guest/bookings/:pnr",
      ],
    });
  });

  return app;
}

// Start the server only in development mode when not running via Vite
// In production, node-build.ts is the entry point
const PORT = process.env.PORT || 3000;
const isViteMode =
  process.env.VITE_MODE || process.env.NODE_ENV === "development";

// Prevent server startup during build process or in production (node-build.ts handles production)
const isBuildMode = process.env.NODE_ENV === "production";

// Only start standalone server if not running via Vite dev server and not in production/build mode
if (!isViteMode && !isBuildMode) {
  createServer().then((app) => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📋 API status: http://localhost:${PORT}/api/status`);
    });
  });
}
