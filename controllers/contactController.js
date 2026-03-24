const { Resend } = require('resend');

exports.submitContact = async (req, res) => {
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
      console.error('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
      console.error('CONTACT_TO_EMAIL length:', process.env.CONTACT_TO_EMAIL?.length || 0);
      return res.redirect('/contact?error=true');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailPayload = {
      from: 'B&W Cleaning <onboarding@resend.dev>',
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email.trim(),
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : ''}
        <p><strong>Message:</strong></p>
        <div>${message.trim().replace(/\n/g, '<br>')}</div>
      `
    };

    const emailResponse = await resend.emails.send(emailPayload);

    if (emailResponse.error) {
      console.error('Contact submission error: Resend API returned error', emailResponse.error);
      return res.redirect('/contact?error=true');
    }

    if (emailResponse.data && emailResponse.data.id) {
      return res.redirect('/contact?success=true');
    }

    console.error('Contact submission error: unexpected Resend response', emailResponse);
    return res.redirect('/contact?error=true');

  } catch (error) {
    console.error('Contact submission error:', error.message);
    res.redirect('/contact?error=true');
  }
};