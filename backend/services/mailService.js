import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
