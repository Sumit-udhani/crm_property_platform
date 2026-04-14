const reactivatedTemplate = (firstName) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding: 30px;">
  <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; padding:40px;">
    <h2 style="color:#2e7d32;">Account Reactivated</h2>
    <p>Hi <strong>${firstName}</strong>,</p>
    <p>Great news! Your account has been <strong>reactivated</strong> and you can now log in again.</p>
    <p>If you have any questions, feel free to contact support.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
    <p style="color:#999; font-size:12px;">This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;

module.exports = reactivatedTemplate;