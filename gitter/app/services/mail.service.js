/**
 * Send Mail in a script
 * https://gist.github.com/Samurais/685348ca4369d6317ec7
 * npm install optimist nodemailer -g
 */
const config = require("../config/environment");
const debug = require("debug")("webot:mail");
const nodemailer = require("nodemailer");

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(config.smtp);

function sendEmail(receivers, subject, content, attachments) {
  debug(
    `sendEmail: receivers [${receivers}], subject [${subject}], content [${content}], attachments [${attachments}]`
  );

  // setup e-mail data with unicode symbols
  let mailOptions = {
    from: config.smtp.from, // sender address
    to: receivers, // list of receivers
    subject: subject, // Subject line
    text: "", // plaintext body
    html: content, // html body
    attachments: attachments,
  };

  return new Promise(function (resolve, reject) {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        resolve(info.response);
      }
    });
  });
}

exports = module.exports = {
  sendEmail,
};
