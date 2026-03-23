const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  console.log('DEBUG contactController.submitContact: hit POST /contact');
  console.log('DEBUG req.body:', req.body);
  try {
    const { name, email, phone, message } = req.body;

    // Server-side validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      console.log('DEBUG contactController: validation failed (missing required field)');
      return res.redirect('/contact?error=true');
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.redirect('/contact?error=true');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Email:</strong> ${email.trim()}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 3px; border-left: 4px solid #007bff;">
              ${message.trim().replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This message was sent from your website contact form.
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('DEBUG contactController: Nodemailer sendMail succeeded');
    const successUrl = '/contact?success=true';
    console.log('DEBUG redirecting to:', successUrl);
    return res.redirect(successUrl);

  } catch (error) {
    console.error('Contact submission error:', error);
    const errorUrl = '/contact?error=true';
    console.log('DEBUG redirecting to:', errorUrl);
    return res.redirect(errorUrl);
  }
};