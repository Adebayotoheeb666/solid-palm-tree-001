import { RequestHandler } from "express";
import { z } from 'zod';
import EmailService, { BookingConfirmationData, PaymentConfirmationData, SupportTicketData } from '../lib/emailService';

// Email validation schemas
const sendBookingConfirmationSchema = z.object({
  to: z.string().email(),
  bookingData: z.object({
    customerName: z.string(),
    pnr: z.string(),
    route: z.object({
      from: z.string(),
      to: z.string(),
      departureDate: z.string()
    }),
    passengers: z.array(z.object({
      title: z.string(),
      firstName: z.string(),
      lastName: z.string()
    })),
    totalAmount: z.number(),
    currency: z.string(),
    bookingUrl: z.string()
  })
});

const sendPaymentConfirmationSchema = z.object({
  to: z.string().email(),
  paymentData: z.object({
    customerName: z.string(),
    pnr: z.string(),
    transactionId: z.string(),
    amount: z.number(),
    currency: z.string(),
    paymentMethod: z.string(),
    bookingUrl: z.string()
  })
});

const sendSupportTicketSchema = z.object({
  to: z.string().email(),
  ticketData: z.object({
    customerName: z.string(),
    ticketId: z.string(),
    subject: z.string(),
    message: z.string(),
    priority: z.string(),
    supportUrl: z.string()
  })
});

const sendPasswordResetSchema = z.object({
  to: z.string().email(),
  resetToken: z.string(),
  resetUrl: z.string()
});

const sendWelcomeEmailSchema = z.object({
  to: z.string().email(),
  customerName: z.string()
});

// Send booking confirmation email
export const handleSendBookingConfirmation: RequestHandler = async (req, res) => {
  try {
    const validation = sendBookingConfirmationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email data',
        errors: validation.error.errors
      });
    }

    const { to, bookingData } = validation.data;

    const success = await EmailService.sendBookingConfirmation(to, bookingData);

    if (success) {
      res.json({
        success: true,
        message: 'Booking confirmation email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send booking confirmation email'
      });
    }
  } catch (error) {
    console.error('Send booking confirmation email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send payment confirmation email
export const handleSendPaymentConfirmation: RequestHandler = async (req, res) => {
  try {
    const validation = sendPaymentConfirmationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email data',
        errors: validation.error.errors
      });
    }

    const { to, paymentData } = validation.data;

    const success = await EmailService.sendPaymentConfirmation(to, paymentData);

    if (success) {
      res.json({
        success: true,
        message: 'Payment confirmation email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send payment confirmation email'
      });
    }
  } catch (error) {
    console.error('Send payment confirmation email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send support ticket confirmation email
export const handleSendSupportTicketConfirmation: RequestHandler = async (req, res) => {
  try {
    const validation = sendSupportTicketSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email data',
        errors: validation.error.errors
      });
    }

    const { to, ticketData } = validation.data;

    const success = await EmailService.sendSupportTicketConfirmation(to, ticketData);

    if (success) {
      res.json({
        success: true,
        message: 'Support ticket confirmation email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send support ticket confirmation email'
      });
    }
  } catch (error) {
    console.error('Send support ticket confirmation email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send password reset email
export const handleSendPasswordReset: RequestHandler = async (req, res) => {
  try {
    const validation = sendPasswordResetSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email data',
        errors: validation.error.errors
      });
    }

    const { to, resetToken, resetUrl } = validation.data;

    const success = await EmailService.sendPasswordReset(to, resetToken, resetUrl);

    if (success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }
  } catch (error) {
    console.error('Send password reset email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send welcome email
export const handleSendWelcomeEmail: RequestHandler = async (req, res) => {
  try {
    const validation = sendWelcomeEmailSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email data',
        errors: validation.error.errors
      });
    }

    const { to, customerName } = validation.data;

    const success = await EmailService.sendWelcomeEmail(to, customerName);

    if (success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email'
      });
    }
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Test email service
export const handleTestEmail: RequestHandler = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const success = await EmailService.sendEmail({
      to,
      subject: 'OnboardTicket Email Service Test',
      html: `
        <h1>Email Service Test</h1>
        <p>This is a test email from OnboardTicket email service.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
        <p>If you received this email, the service is working correctly!</p>
      `
    });

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
