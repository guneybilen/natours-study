const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from =  `ReferansData <${process.env.EMAIL_FROM}>`;
  }

  // if not in production, you can use
  // mailtrap Web application.
  // In production you can use
  // sendgrid app.
  newTransport() {
    console.log("process.env.NODE_ENV", process.env.NODE_ENV)
    // if (process.env.NODE_ENV === 'production') {
      // console.log('bilen');
      // sendgrid is a known servicein
      // nodemailer, so we do not need to specify
      // everything such as 
      // Server	smtp.sendgrid.net
      // Ports	25, 587	(for unencrypted/TLS connections)
      //        465	(for SSL connections)
      // return nodemailer.createTransport({
      //   host: process.env.SENDGRID_HOST,
      //   port: process.env.SENDGRID_PORT,
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD
      //   }
      // })};
    
    
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          }
        }
      )
    } 

    async send(template, subject) {
      // send the actual email
      // 1. render the html based on a pug template
      const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
        firstName: this.firstName,
        url: this.url,
        subject: subject
      });

      // 2. define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: htmlToText.fromString(html)
      };

      // 3. create transport and send email
      await this.newTransport().sendMail(mailOptions);
      
    }

    async sendWelcome() {
      await this.send('welcome', 'welcome to our reach!')
    }

    async sendPasswordReset() {
      await this.send('passwordReset', 'password reset link.')
    }
  };
  
