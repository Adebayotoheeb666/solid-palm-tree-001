import { RequestHandler } from "express";
import crypto from "crypto";
import { z } from "zod";

// In-memory storage for verification tokens (use database in production)
interface VerificationToken {
  email: string;
  token: string;
  expiresAt: Date;
  verified: boolean;
  userId?: string;
}

let verificationTokens: VerificationToken[] = [];

// Clean up expired tokens
const cleanupExpiredTokens = () => {
  const now = new Date();
  verificationTokens = verificationTokens.filter(
    (token) => token.expiresAt > now,
  );
};

// Generate verification token
const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Create verification token
export const createVerificationToken = (
  email: string,
  userId?: string,
): string => {
  cleanupExpiredTokens();

  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

  // Remove any existing tokens for this email
  verificationTokens = verificationTokens.filter((t) => t.email !== email);

  // Add new token
  verificationTokens.push({
    email,
    token,
    expiresAt,
    verified: false,
    userId,
  });

  console.log(`Created verification token for ${email}`);
  return token;
};

// Send verification email
const sendVerificationEmail = async (
  email: string,
  token: string,
  userName?: string,
) => {
  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/verify-email?token=${token}`;

  const emailData = {
    to: email,
    subject: "Verify Your OnboardTicket Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3839C9; font-size: 28px; margin: 0;">OnboardTicket</h1>
          <p style="color: #637996; font-size: 16px; margin: 10px 0 0 0;">Flight Reservations Made Easy</p>
        </div>
        
        <div style="background: #f8f9ff; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #20242A; font-size: 24px; margin: 0 0 20px 0;">Welcome${userName ? ` ${userName}` : ""}!</h2>
          <p style="color: #637996; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for creating your OnboardTicket account. To complete your registration and start booking flight reservations, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #3839C9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #637996; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #3839C9; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="border-top: 1px solid #E7E9FF; padding-top: 20px; text-align: center;">
          <p style="color: #A2A2A2; font-size: 14px; margin: 0;">
            This verification link will expire in 24 hours.
          </p>
          <p style="color: #A2A2A2; font-size: 14px; margin: 10px 0 0 0;">
            If you didn't create an account with OnboardTicket, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    // In a real app, send via your email service (SendGrid, etc.)
    console.log("Verification email would be sent:", emailData);

    // If you have email service configured, use it:
    // const response = await fetch('/api/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(emailData)
    // });

    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
};

// Validation schemas
const sendVerificationSchema = z.object({
  email: z.string().email(),
  userId: z.string().optional(),
  userName: z.string().optional(),
});

const verifyTokenSchema = z.object({
  token: z.string().min(1),
});

// Send verification email endpoint
export const handleSendVerificationEmail: RequestHandler = async (req, res) => {
  try {
    const validation = sendVerificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: validation.error.errors,
      });
    }

    const { email, userId, userName } = validation.data;

    // Create verification token
    const token = createVerificationToken(email, userId);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, userName);

    if (emailSent) {
      res.json({
        success: true,
        message: "Verification email sent successfully",
        email: email,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }
  } catch (error) {
    console.error("Send verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify email token endpoint
export const handleVerifyEmail: RequestHandler = async (req, res) => {
  try {
    const validation = verifyTokenSchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const { token } = validation.data;

    cleanupExpiredTokens();

    // Find verification token
    const verificationToken = verificationTokens.find((t) => t.token === token);

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    if (verificationToken.verified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Mark as verified
    verificationToken.verified = true;

    console.log(`Email verified successfully: ${verificationToken.email}`);

    res.json({
      success: true,
      message: "Email verified successfully",
      email: verificationToken.email,
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check verification status
export const handleCheckVerificationStatus: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required",
      });
    }

    cleanupExpiredTokens();

    const verificationToken = verificationTokens.find((t) => t.email === email);

    res.json({
      success: true,
      email: email,
      verified: verificationToken?.verified || false,
      tokenExists: !!verificationToken,
      expired: verificationToken
        ? verificationToken.expiresAt < new Date()
        : false,
    });
  } catch (error) {
    console.error("Check verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend verification email
export const handleResendVerificationEmail: RequestHandler = async (
  req,
  res,
) => {
  try {
    const validation = sendVerificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const { email, userId, userName } = validation.data;

    // Check if already verified
    const existingToken = verificationTokens.find((t) => t.email === email);
    if (existingToken?.verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Create new verification token
    const token = createVerificationToken(email, userId);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, userName);

    if (emailSent) {
      res.json({
        success: true,
        message: "Verification email resent successfully",
        email: email,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend verification email",
      });
    }
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Export verification utilities for use in auth routes
export { createVerificationToken as createEmailVerificationToken };
