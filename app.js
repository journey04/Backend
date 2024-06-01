const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'journeyendless4@gmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

function getFLightTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
  
    function replacePlaceholders(template, data, prefix = '') {
      for (const key in data) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(data[key])) {
          const listItems = data[key].map(item => `<li>${item}</li>`).join('');
          template = template.replace(new RegExp(`{{${fullKey}}}`, 'g'), listItems);
        } else if (typeof data[key] === 'object') {
          template = replacePlaceholders(template, data[key], fullKey);
        } else {
          template = template.replace(new RegExp(`{{${fullKey}}}`, 'g'), data[key]);
        }
      }
      return template;
    }
  
    template = replacePlaceholders(template, data);
    return template;
  }
  

  function getCarTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
  
    function replacePlaceholders(template, data) {
      for (const key in data) {
        if (typeof data[key] === 'object') {
          template = replacePlaceholders(template, data[key]);
        } else {
          template = template.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
      }
      return template;
    }
  
    template = replacePlaceholders(template, data);
    return template;
  }
function sendFlightEmail(subject, templateName, data, to) {
  const body = getFLightTemplate(templateName, data);

  const mailOptions = {
    from: 'journeyendless4@gmail.com',
    to,
    subject,
    html: body,
  };

  smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent:', response);
    }
  });
}

function sendCarEmail(subject, templateName, data, to) {
    const body = getCarTemplate(templateName, data);
  
    const mailOptions = {
      from: 'journeyendless4@gmail.com',
      to,
      subject,
      html: body,
    };
  
    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent:');
      }
    });
  }

  function sendHotelEmail(subject, templateName, data, to) {
    const body = getHotelTemplate(templateName, data);
  
    const mailOptions = {
      from: 'journeyendless4@gmail.com',
      to,
      subject,
      html: body,
    };
  
    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent:', response);
      }
    });
  }

  function getHotelTemplate(templateName, data) {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf8');
  
    function replacePlaceholders(template, data) {
        for (const key in data) {
            if (Array.isArray(data[key])) {
                // If the value is an array, replace each occurrence of '{{key}}' with the array values
                const arrayPlaceholder = `{{${key}}}`;
                const arrayValues = data[key].map(value => `<li>${value}</li>`).join('');
                template = template.replace(new RegExp(arrayPlaceholder, 'g'), arrayValues);
            } else if (typeof data[key] === 'object') {
                // If the value is an object, recursively replace placeholders in the nested object
                template = replacePlaceholders(template, data[key]);
            } else {
                // Otherwise, replace '{{key}}' with the corresponding value
                template = template.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
            }
        }
        return template;
    }
    
  
    template = replacePlaceholders(template, data);
    return template;
  }

app.post('/sendCarEmail', (req, res) => {
  const { subject, to, booking_details } = req.body;
  sendCarEmail(subject, 'car-email', booking_details, to);
  res.send('Car email sent');
});

app.post('/sendFlightEmail', (req, res) => {
  const { subject, to, flight_booking_details } = req.body;
  sendFlightEmail(subject, 'flight-email', flight_booking_details, to);
  res.send('Flight email sent');
});

app.post('/sendHotelEmail', (req, res) => {
  const { subject, to, ...data } = req.body;
  sendHotelEmail(subject, 'hotel-email', data, to);
  res.send('Hotel email sent');
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  const VerifyPassword = process.env.USER_PASSWORD;

  if (!VerifyPassword) {
    return res.status(500).json({ error: 'USER_PASSWORD environment variable is not set' });
  }

  if (VerifyPassword !== password) {
    return res.status(401).json({ error: 'Wrong user' });
  }

  res.json({ status: 'ok', message: 'Login successful' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
