import emailjs from '@emailjs/browser';

export async function sendEmail(formData: {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}) {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  if (!publicKey || !serviceId || !templateId) {
    throw new Error('Missing EmailJS credentials in environment variables');
  }

  try {
    emailjs.init(publicKey);

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: formData.subject,
      category: formData.category,
      message: formData.message,
      time: new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' }),
    };

    const result = await emailjs.send(serviceId, templateId, templateParams);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Error sending email' };
  }
}