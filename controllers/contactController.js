const { Resend } = require('resend');

exports.submitContact = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      serviceType,
      bedrooms,
      bathrooms,
      frequency,
      message
    } = req.body;

    // Server-side validation
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !serviceType?.trim()) {
      return res.redirect('/contact?error=true');
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      subject: `Quote Request from ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Full Name:</strong> ${name.trim()}</p>
        <p><strong>Phone:</strong> ${phone.trim()}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Service Type:</strong> ${serviceType.trim()}</p>
        <p><strong>Bedrooms:</strong> ${bedrooms || 'Not provided'}</p>
        <p><strong>Bathrooms:</strong> ${bathrooms || 'Not provided'}</p>
        <p><strong>Frequency:</strong> ${frequency || 'Not provided'}</p>
        <p><strong>Notes:</strong></p>
        <div>${(message || '').trim().replace(/\n/g, '<br>')}</div>
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