const forgotPasswordTemplate = (firstName, resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f6f8;
      color: #333;
    }
    .wrapper {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: #4F46E5;
      padding: 36px 40px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .body {
      padding: 40px;
    }
    .body p {
      font-size: 15px;
      line-height: 1.7;
      color: #444;
      margin-bottom: 16px;
    }
    .btn-wrap {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: #4F46E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .link-fallback {
      font-size: 13px;
      color: #888;
      word-break: break-all;
      margin-top: 8px;
    }
    .link-fallback a {
      color: #4F46E5;
    }
    .warning {
      background: #FFF8E1;
      border-left: 4px solid #F59E0B;
      border-radius: 6px;
      padding: 14px 18px;
      font-size: 13.5px;
      color: #78520a;
      margin-top: 24px;
      line-height: 1.6;
    }
    .footer {
      background: #f4f6f8;
      text-align: center;
      padding: 24px 40px;
      font-size: 12.5px;
      color: #999;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>Password Reset Request</h1>
    </div>

    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>
        We received a request to reset the password for your account.
        Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.
      </p>

      <div class="btn-wrap">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </div>

      <p class="link-fallback">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetLink}">${resetLink}</a>
      </p>

      <div class="warning">
        ⚠️ If you did not request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </div>
    </div>

    <div class="footer">
      This is an automated message — please do not reply to this email.<br/>
      © ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>

  </div>
</body>
</html>
`;

module.exports = forgotPasswordTemplate;