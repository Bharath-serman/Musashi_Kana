"use server";

import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { signSession, verifySession } from "./admin-auth";

const OTP_COOKIE_NAME = "deletion_otp_token";
const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback_deletion_otp_secret_key_123_abc";

/**
 * Generates a 6-digit OTP code and emails it to the user.
 * Stores a signed, secure cookie with the email, OTP, and expiration.
 */
export async function sendDeletionOtp(email: string) {
  if (!email) {
    throw new Error("Email is required");
  }

  // 1. Generate a 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

  // 2. Sign a token containing the email, OTP, and expiration
  const token = await signSession(
    {
      email,
      code,
      expires,
    },
    JWT_SECRET
  );

  // 3. Set the signed token as a secure, HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  // 4. Send email using Gmail SMTP via nodemailer
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`\n[DEV ONLY] EMAIL_USER or EMAIL_PASS is not set in .env. Use this OTP code to test account deletion for ${email}: \x1b[36m${code}\x1b[0m\n`);
      return { success: true };
    }
    console.error("EMAIL_USER or EMAIL_PASS is not configured in .env");
    throw new Error("Email service is temporarily unavailable. Please configure EMAIL_USER and EMAIL_PASS.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Musashi_Kana Support" <${emailUser}>`,
      to: email,
      subject: "Verify Account Deletion - Musashi_Kana",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ff4757; margin-top: 0;">Delete Account Request</h2>
          <p>We received a request to permanently delete your account. To proceed, please use the following 6-digit verification code:</p>
          <div style="background: #f1f2f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2f3542;">${code}</span>
          </div>
          <p style="font-size: 13px; color: #777;">This code is valid for 5 minutes. If you did not request this deletion, please ignore this email and secure your account immediately.</p>
        </div>
      `,
    });
  } catch (error: any) {
    console.error("Nodemailer Gmail SMTP error:", error);
    if (process.env.NODE_ENV !== "production") {
      console.warn(`\n[DEV ONLY] Gmail SMTP failed. Use this OTP code to test account deletion for ${email}: \x1b[36m${code}\x1b[0m\n`);
      return { success: true };
    }
    throw new Error("Failed to send verification email. Please try again.");
  }

  return { success: true };
}

/**
 * Verifies the 6-digit OTP code against the cookie token.
 */
export async function verifyDeletionOtp(email: string, enteredCode: string) {
  if (!email || !enteredCode) {
    throw new Error("Email and verification code are required");
  }

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(OTP_COOKIE_NAME);

  if (!tokenCookie || !tokenCookie.value) {
    throw new Error("Verification code has expired or is invalid. Please request a new one.");
  }

  const payload = await verifySession(tokenCookie.value, JWT_SECRET);

  if (!payload) {
    throw new Error("Verification session is invalid or expired. Please request a new code.");
  }

  // Verify fields match
  if (payload.email !== email) {
    throw new Error("This verification session belongs to a different email address.");
  }

  if (payload.code !== enteredCode) {
    throw new Error("Incorrect verification code. Please check your email and try again.");
  }

  if (payload.expires && typeof payload.expires === "number" && Date.now() > payload.expires) {
    throw new Error("Verification code has expired. Please request a new code.");
  }

  // OTP verified successfully! Clear the cookie.
  cookieStore.delete(OTP_COOKIE_NAME);

  return { success: true };
}
