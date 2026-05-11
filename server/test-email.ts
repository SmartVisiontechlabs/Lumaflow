import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(
    process.env.RESEND_API_KEY
);

async function sendTest() {
    const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'sahushyamsvtl@gmail.com',
        subject: 'Lumaflow Test ✨',
        html: `
      <div style="padding:40px;font-family:serif">
        <h1>Your sanctuary awaits</h1>
        <p>Resend is connected successfully.</p>
      </div>
    `,
    });

    console.log(result);
}

sendTest();