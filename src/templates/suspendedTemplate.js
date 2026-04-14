const suspendedTemplate = (firstName, reason, suspendUntil) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding: 30px;">
  <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:40px;">
    <h2 style="color:#d32f2f;">Account Suspended</h2>
    <p>Hi <strong>${firstName}</strong>,</p>
    <p>Your account has been <strong>suspended</strong> by the administrator.</p>
    <div style="background:#fff3f3; border-left:4px solid #d32f2f; padding:12px 16px; margin:20px 0; border-radius:4px;">
      <strong>Reason:</strong>
      <p style="margin:6px 0 0;">${reason}</p>
    </div>
    <p>Your account will be automatically reactivated on:</p>
    <p style="font-size:16px; font-weight:bold; color:#333;">
      ${new Date(suspendUntil).toDateString()}
    </p>
    <p>If you believe this is a mistake, please contact support.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
    <p style="color:#999; font-size:12px;">This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;

module.exports = suspendedTemplate;