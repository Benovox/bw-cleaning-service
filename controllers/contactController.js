const { Resend } = require('resend');

exports.submitContact = async (req, res) => {
  console.log('=== CONTACT FORM SUBMISSION START ===');
  console.log('POST /contact hit');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('CONTACT_TO_EMAIL exists:', !!process.env.CONTACT_TO_EMAIL);
  console.log('CONTACT_TO_EMAIL value:', process.env.CONTACT_TO_EMAIL);

  try {
    const { name, email, phone, message } = req.body;
    console.log('Form data received:', { name: !!name, email: !!email, phone: !!phone, message: !!message });
    console.log('Form data values:', { name, email, phone: phone || 'not provided', messageLength: message?.length || 0 });

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

    // Create Resend instance only when needed
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('About to call resend.emails.send');

    const emailPayload = {
      from: 'B&W Cleaning <onboarding@resend.dev>',
      to: process.env.CONTACT_TO_EMAIL,
      reply_to: email.trim(), // Allow replies to go back to the form submitter
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

    console.log('Email payload prepared:', {
      from: emailPayload.from,
      to: emailPayload.to,
      reply_to: emailPayload.reply_to,
      subject: emailPayload.subject,
      htmlLength: emailPayload.html.length
    });

    // Send email via Resend
    const emailResponse = await resend.emails.send(emailPayload);

    console.log('=== RESEND RESPONSE ANALYSIS ===');
    console.log('Resend response received');
    console.log('Resend response type:', typeof emailResponse);
    console.log('Resend response keys:', Object.keys(emailResponse));
    console.log('Resend response:', JSON.stringify(emailResponse, null, 2));

    // Detailed response analysis
    console.log('Response structure check:');
    console.log('- emailResponse exists:', !!emailResponse);
    console.log('- emailResponse.error exists:', !!emailResponse.error);
    console.log('- emailResponse.data exists:', !!emailResponse.data);
    console.log('- emailResponse.data.id exists:', !!(emailResponse.data && emailResponse.data.id));

    // Check if the response contains an error
    if (emailResponse.error) {
      console.error('=== RESEND API ERROR DETECTED ===');
      console.error('Resend API returned error object:');
      console.error('- error.message:', emailResponse.error.message);
      console.error('- error.name:', emailResponse.error.name);
      console.error('- error.statusCode:', emailResponse.error.statusCode);
      console.error('- error.code:', emailResponse.error.code);
      console.log('Full error response:', JSON.stringify(emailResponse, null, 2));
      console.log('=== REDIRECTING TO ERROR ===');
      return res.redirect('/contact?error=true');
    }

    // Check if response has data with id (successful send)
    if (emailResponse.data && emailResponse.data.id) {
      console.log('=== RESEND SUCCESS DETECTED ===');
      console.log('Email sent successfully. Email ID:', emailResponse.data.id);
      console.log('=== REDIRECTING TO SUCCESS ===');
      return res.redirect('/contact?success=true');
    }

    // If we get here, something unexpected happened
    console.error('=== UNEXPECTED RESPONSE STRUCTURE ===');
    console.error('Unexpected Resend response structure:');
    console.error('emailResponse.data exists:', !!emailResponse.data);
    console.error('emailResponse.data.id exists:', !!(emailResponse.data && emailResponse.data.id));
    console.error('Full response:', JSON.stringify(emailResponse, null, 2));
    console.log('=== REDIRECTING TO ERROR (UNEXPECTED) ===');
    return res.redirect('/contact?error=true');

  } catch (error) {
    console.error('=== CATCH BLOCK - EXCEPTION THROWN ===');
    console.error('Contact submission error details:');
    console.error('- error.message:', error.message);
    console.error('- error.name:', error.name);
    console.error('- error.statusCode:', error.statusCode);
    console.error('- error.code:', error.code);
    if (error.response) {
      console.error('- error.response:', JSON.stringify(error.response, null, 2));
    }
    if (error.cause) {
      console.error('- error.cause:', JSON.stringify(error.cause, null, 2));
    }
    console.log('=== REDIRECTING TO ERROR (EXCEPTION) ===');
    res.redirect('/contact?error=true');
  }
};