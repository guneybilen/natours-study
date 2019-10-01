const sgMail = require('@sendgrid/mail');
const pug = require('pug');
const htmlToText = require('html-to-text');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class SG {

    constructor(user, url){
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from =  process.env.EMAIL_FROM;
    }
    
    
    async sendIt(template, subject) {
       const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
            firstName: this.firstname,
            url: this.url,
            subject: subject
         })

        const msg =  {
            to: this.to,
            from: this.from,
            subject: subject,
            text: htmlToText.fromString(html),
            html: html       
        }

        try {  
          await sgMail.send(msg)
        } catch (e) {
          console.log(e.response.body);
        }
    } 

    async sendWelcome() {
      await this.sendIt('welcome', 'welcome to our reach!')
    }
  
    async sendPasswordReset() {
      await this.sendIt('passwordReset', 'password reset link.')
    }
};


    
//     console.log("process.env.NODE_ENV", process.env.NODE_ENV)
// if (process.env.NODE_ENV === 'production') {
//   console.log('bilen');
  
//    



// 
// }
