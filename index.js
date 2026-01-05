import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/send-email", async (req, res) => {
  try {
    const { apiKey, to, subject, html, text } = req.body || {};

    if (!apiKey || apiKey !== process.env.MAIL_RELAY_API_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ ok: false, error: "missing_fields" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || "587"),
      secure: false, // 587 = STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Poste (self-signed)
        servername: process.env.SMTP_HOST,
      },
    });

    const info = await transporter.sendMail({
      from: `"SorteBem" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("mail-relay running"));
