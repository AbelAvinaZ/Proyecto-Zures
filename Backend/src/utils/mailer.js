import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import logger from "./logger.js";

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
        user: process.env.SMTP_USER || "mailtrap-user",
        pass: process.env.SMTP_PASS || "mailtrap-pass",
    },
});

const sendEmail = async ({ to, bcc = [], subject, text, html }) => {
    // Convertir to a array si es string
    const recipients = Array.isArray(to) ? to : to.split(",").map((email) => email.trim());

    const mailOptions = {
        from: process.env.EMAIL_FROM || "no-reply@tuappseguridad.com",
        to: recipients,
        bcc,
        subject,
        text,
        html,
    };

    try {
        if (process.env.NODE_ENV === "production" && process.env.SENDGRID_API_KEY) {
            await sgMail.send(mailOptions);
            logger.info(`Email enviado vía SendGrid a [${recipients.join(", ")}] - Asunto: ${subject}`);
        } else {
            await transporter.sendMail(mailOptions);
            logger.info(`Email enviado vía ${process.env.NODE_ENV === "production" ? "SMTP" : "Mailtrap"} a [${recipients.join(", ")}] - Asunto: ${subject}`);
        }
    } catch (error) {
        logger.error("Error al enviar email", { recipients: recipients.join(", "), error: error.message });
        throw new Error("No se pudo enviar el correo");
    }
};

export default sendEmail;