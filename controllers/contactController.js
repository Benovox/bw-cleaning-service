const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.submitContact = async (req, res) => {
  console.log('Contact form submitted');
  try {
    const { name, email, phone, message } = req.body;

    // Server-side validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      console.log('Contact validation failed (missing required field)');
      return res.redirect('/contact?error=true');
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('Contact validation failed (invalid email format)');
      return res.redirect('/contact?error=true');
    }

    // Check environment variables
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
      console.error('RESEND_API_KEY or CONTACT_TO_EMAIL not set');
      return res.redirect('/contact?error=true');
    }

    // Send email via Resend
    await resend.emails.send({
      from: 'B&W Cleaning <onboarding@resend.dev>',
      to: process.env.CONTACT_TO_EMAIL,
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
        <p><strong>Message:</strong></p>
        <div>${message.trim().replace(/\n/g, '<br>')}</div>
      `
    });

    console.log('Email sent via Resend');
    res.redirect('/contact?success=true');

  } catch (error) {
    console.error('Contact submission error:', error.message);
    res.redirect('/contact?error=true');
  }
};