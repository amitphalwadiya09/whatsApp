import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';
dotenv.config();

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

const sendOtpToEmailJS = async (email, otp) => {
    try {
        const templateParams = {
            to_email: email,
            otp,
            message: `Your OTP is ${otp}. This code is valid for 5 minutes.`,
        };

        const result = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            {
                publicKey: PUBLIC_KEY,
                privateKey: PRIVATE_KEY
            }
        );

        console.log('EmailJS OTP sent successfully', result);
        return true;
    } catch (err) {
        console.error('EmailJS send error:', err);
        throw new Error('Failed to send OTP via EmailJS');
    }
};

export default sendOtpToEmailJS;