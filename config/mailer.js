const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendPriceAlert({ to, userName, productName, currentPrice, targetPrice, productUrl, storeName }) {
  await transporter.sendMail({
    from: `"BetterPrice" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 ¡Bajó el precio de ${productName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">BetterPrice</h2>
        <p>Hola <strong>${userName}</strong>,</p>
        <p>¡Buenas noticias! El precio de <strong>${productName}</strong> en <strong>${storeName}</strong> bajó a tu precio objetivo.</p>
        <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
          <tr>
            <td style="padding:10px; background:#f3f4f6;"><strong>Precio actual:</strong></td>
            <td style="padding:10px; color:#16a34a; font-size:1.4em;"><strong>RD$ ${currentPrice}</strong></td>
          </tr>
          <tr>
            <td style="padding:10px;"><strong>Tu precio objetivo:</strong></td>
            <td style="padding:10px;">RD$ ${targetPrice}</td>
          </tr>
        </table>
        <a href="${productUrl}" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none;">
          Ver producto
        </a>
        <p style="color:#6b7280; margin-top:20px; font-size:0.9em;">BetterPrice - Compara precios en RD</p>
      </div>
    `,
  });
}

module.exports = { sendPriceAlert };
