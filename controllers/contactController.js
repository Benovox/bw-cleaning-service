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
      console.log('DEBUG contactController: validation failed (invalid email format)');
      return res.redirect('/contact?error=true');
    }

    // Check environment variables
    console.log('DEBUG contactController: checking environment variables...');
    console.log('DEBUG EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('DEBUG EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('DEBUG contactController: EMAIL_USER or EMAIL_PASS not set');
      return res.redirect('/contact?error=true');
    }

    console.log('DEBUG contactController: creating transporter...');

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('DEBUG contactController: verifying transporter...');

    // Verify transporter
    try {
      await transporter.verify();
      console.log('DEBUG contactController: transporter verification succeeded');
    } catch (verifyError) {
      console.error('DEBUG contactController: transporter verification failed:', {
        message: verifyError.message,
        code: verifyError.code,
        response: verifyError.response
      });
      return res.redirect('/contact?error=true');
    }

    console.log('DEBUG contactController: creating mail options...');

    // Create mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email, // Allow replies to go to the form submitter
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

    console.log('DEBUG contactController: attempting sendMail...');

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('DEBUG contactController: Nodemailer sendMail succeeded');
    const successUrl = '/contact?success=true';
    console.log('DEBUG redirecting to:', successUrl);
    return res.redirect(successUrl);

  } catch (error) {
    console.error('DEBUG contactController: Contact submission error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    const errorUrl = '/contact?error=true';
    console.log('DEBUG redirecting to:', errorUrl);
    return res.redirect(errorUrl);
  }
};