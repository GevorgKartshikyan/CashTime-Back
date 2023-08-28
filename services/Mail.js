import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import _ from 'lodash';

const {
  EMAIL_HOST, EMAIL_FROM, EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT,
} = process.env;
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

class Mail {
  static send(email, subject, template, params = {}) {
    const ejs = fs.readFileSync(path.join('views/mail', `${template}.ejs`), 'utf-8');
    const html = _.template(ejs)(params);
    return transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject,
      html,
    });
  }
}

export default Mail;
