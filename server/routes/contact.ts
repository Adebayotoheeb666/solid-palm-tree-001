import { RequestHandler } from "express";
import { z } from "zod";
import EmailService from "../lib/emailService";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export const handleContactSubmit: RequestHandler = async (req, res) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid form data",
          errors: parsed.error.errors,
        });
    }
    const { name, email, message } = parsed.data;

    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    const ok = await EmailService.sendEmail({
      to: "services@onboardticket.com",
      subject: `New contact form submission from ${name}`,
      html,
    });

    if (!ok) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email" });
    }

    return res.json({ success: true, message: "Message sent" });
  } catch (e) {
    console.error("Contact form error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
