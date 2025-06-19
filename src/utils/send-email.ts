// import { env } from '@/env'
// import nodemailer from 'nodemailer'

// export async function sendEmail(email: string, link: string) {
//   const transporter = nodemailer.createTransport({
//     service: env.MAIL_SERVICE,
//     host: env.MAIL_HOST,
//     port: env.MAIL_PORT,
//     secure: env.MAIL_SECURE,
//     auth: {
//       user: env.MAIL_USER,
//       pass: env.MAIL_PASS, // https://security.google.com/settings/security/apppasswords
//     },
//   })

//   await transporter.sendMail({
//     from: 'no-reply@your-app.com',
//     to: email,
//     subject: 'Your Login Link',
//     text: `Click this link to login: ${link}`,
//   })
// }
