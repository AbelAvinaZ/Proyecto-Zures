import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import logger from "./logger.js";

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async ({ to, bcc = [], subject, text, html }) => {
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
            // Solo para desarrollo - Usa Mailtrap
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
                port: Number(process.env.SMTP_PORT) || 2525,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            await transporter.sendMail(mailOptions);
            logger.info(`Email enviado a [${recipients.join(", ")}] - Asunto: ${subject}`);
        }
    } catch (error) {
        logger.error("Error detallado al enviar email", {
            error: error.message,
            stack: error.stack,
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER ? "configurado" : "no configurado"
        });
        throw new Error("No se pudo enviar el correo");
    }
};

export default sendEmail;