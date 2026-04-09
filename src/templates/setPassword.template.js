const setPasswordTemplate = (name, link) => {
  return `
    <h2>Welcome to CRM</h2>
    <p>Hello ${name},</p>
    <p>You have been added to the system.</p>
    <p>Click below to set your password:</p>
    <a href="${link}" target="_blank" 
       style="padding:10px 20px;background:#1976d2;color:#fff;text-decoration:none;">
       Set Password
    </a>
    <p>This link will expire in 24 hours.</p>
  `;
};

module.exports = { setPasswordTemplate };