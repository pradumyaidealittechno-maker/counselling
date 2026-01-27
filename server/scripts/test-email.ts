import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function verifyEmail() {
    console.log('--- Email Configuration Check ---');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS (len):', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'MISSING');
    console.log('SMTP_PASS (start):', process.env.SMTP_PASS ? process.env.SMTP_PASS.substring(0, 2) : 'N/A');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: 'aipradumyaverma@gmail.com', // User's email from screenshot
            subject: 'Test Email from Intelligens Debugger',
            text: 'If you receive this, the email configuration is working!',
        });
        console.log('✅ Test email sent:', info.messageId);
        console.log('Check your inbox (and spam folder) for aipradumyaverma@gmail.com');

    } catch (error: any) {
        console.error('❌ Email Error:', error.message);
        if (error.code === 'EAUTH') {
            console.error('👉 This usually means the App Password is incorrect or 2-Step Verification is not enabled.');
        }
    }
}

verifyEmail();
