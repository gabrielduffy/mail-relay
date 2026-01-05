import express from "express";
import nodemailer from "nodemailer";

const app = express();

/**
 * Config
 */
const PORT = Number(process.env.PORT || 80);
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_RELAY_API_KEY,
} = process.env;

/**
 * Middleware
 */
app.use(express.json({ limit: "1mb" }));

/**
 * Health check
 */
app.get("/health", (req, res) => {
  return res.json({ ok: true });
});

/**
 * Send email endpoint
 */
app.post("/send-email", async (req, res) => {
  try {
    const { apiKey, to, subject, html, text } = req.body || {};

    /**
     * Auth
     */
    if (!apiKey || apiKey !== MAIL_RELAY_API_KEY) {
      return res.status(401).json({
        ok: false,
        error: "unauthorized",
      });
    }

    /**
     * Validation
     */
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        ok: false,
        error: "missing_fields",
      });
    }

    /**
     * SMTP Transport (Poste.io / self-signed)
     */
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: false, // STARTTLS (587)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // essencial para Poste com certificado próprio
        servername: SMTP_HOST,
      },
    });

    /**
     * Send
     */
    const info = await transporter.sendMail({
      from: `"SorteBem" <${SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return res.json({
      ok: true,
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("SEND ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: err?.message || "internal_error",
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`mail-relay running on port ${PORT}`);
});
