export async function sendEmail(formData: {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}) {
  const tenantId = import.meta.env.VITE_TENANT_ID;
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const fromEmail = import.meta.env.VITE_FROM_EMAIL;

  if (!tenantId || !clientId || !clientSecret || !fromEmail) {
    throw new Error('Missing Azure app credentials in environment variables');
  }

  try {
    // Step 1: Acquire access token using client credentials flow
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token response error:', errorData);
      throw new Error(`Token acquisition failed: ${tokenResponse.statusText} - ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    // Step 2: Send email using Graph API
    const emailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${fromEmail}/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: formData.subject || `New Contact Form Submission from ${formData.name}`,
          body: {
            contentType: 'HTML',
            content: `
              <h3>New Contact Form Submission</h3>
              <p><strong>Name:</strong> ${formData.name}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Category:</strong> ${formData.category}</p>
              <p><strong>Subject:</strong> ${formData.subject}</p>
              <p><strong>Message:</strong><br/>${formData.message}</p>
            `,
          },
          toRecipients: [
            {
              emailAddress: {
                address: fromEmail,
              },
            },
          ],
        },
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Email response error:', errorData);
      throw new Error(`Email send failed: ${emailResponse.statusText} - ${JSON.stringify(errorData)}`);
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Error sending email' };
  }
}