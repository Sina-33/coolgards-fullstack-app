import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars';
import * as path from "path";

export const sendMail = (to, subject,template, message) =>{
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth : {
      user : process.env.EMAIL_USERNAME,
      pass : process.env.EMAIL_PASSWORD
    },
  })

  const handlebarsOptions = {
    viewEngine: {
      extName: '.handlebars',
      partialsDir: path.resolve('./src/views'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./src/views'),
    extName: '.handlebars'
  }


  transporter.use('compile', hbs(handlebarsOptions));


  const options = {
    from : process.env.EMAIL_FROM,
    to,
    subject,
    html: message,
    template: template,
  }

  transporter.sendMail(options, (error, info) =>{
    if(error) console.log(error)
    else console.log(info)
  })

}