const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendStatusUpdate = async (resident, complaint, note) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured, skipping...');
    return;
  }
  try {
    const transporter = createTransporter();
    const statusColors = { 'Open': '#ef4444', 'In Progress': '#f59e0b', 'Resolved': '#22c55e' };
    const color = statusColors[complaint.status] || '#6366f1';
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: resident.email,
      subject: `Complaint Update: ${complaint.status} - Society Maintenance Tracker`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e293b; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Society Maintenance Tracker</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e293b;">Complaint Status Update</h2>
            <p>Hi ${resident.name},</p>
            <p>Your complaint has been updated:</p>
            <div style="background: white; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p><strong>Category:</strong> ${complaint.category}</p>
              <p><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${complaint.status}</span></p>
              ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
            </div>
            <p style="color: #64748b; font-size: 14px;">Log in to the portal to view full details.</p>
          </div>
        </div>
      `
    });
    console.log(`Email sent to ${resident.email}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

exports.sendImportantNotice = async (residents, notice) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured, skipping...');
    return;
  }
  try {
    const transporter = createTransporter();
    for (const resident of residents) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: resident.email,
        subject: `Important Notice: ${notice.title} - Society Maintenance Tracker`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e293b; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">Society Maintenance Tracker</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 10px 15px; margin-bottom: 20px;">
                <span style="color: #92400e; font-weight: bold;">Important Notice</span>
              </div>
              <h2 style="color: #1e293b;">${notice.title}</h2>
              <p>${notice.content}</p>
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Posted by Society Admin</p>
            </div>
          </div>
        `
      });
    }
    console.log(`Important notice sent to ${residents.length} residents`);
  } catch (err) {
    console.error('Notice email error:', err.message);
  }
};
