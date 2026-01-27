import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
    console.log(`📧 Preparing to send OTP ${otp} to ${email}`);

    try {
        // Configuration requested by user
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // Explicitly set to false as requested
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            logger: true,
            debug: true
        });

        // Send email
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: "Intelligens Verification Code",
            text: `Your OTP is ${otp}`, // Plain text fallback
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #E91E63; text-align: center;">Welcome to Intelligens</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #888; font-size: 12px; margin-top: 20px; text-align: center;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
        });

        console.log('✅ OTP email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending registered email:', error);
        throw error;
    }
};
