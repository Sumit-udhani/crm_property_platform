const cron = require("node-cron");
const prisma = require('../config/prisma');
const { sendEmail } = require("../utils/emailService");
const reactivatedTemplate = require("../templates/reactivatedTemplate");


cron.schedule("* * * * *", async () => {
  console.log("Running auto-reactivation cron job...");

  try {
    const expiredUsers = await prisma.users.findMany({
      where: {
        suspended_at:  { not: null },
        suspend_until: { lte: new Date() },
        is_active:     false,
      },
    });

    if (expiredUsers.length === 0) {
      console.log("No users to reactivate.");
      return;
    }

    for (const user of expiredUsers) {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          is_active:      true,
          suspend_reason: null,
          suspended_at:   null,
          suspend_until:  null,
        },
      });

      await sendEmail(
        user.email,
        "Your Account Has Been Reactivated",
        reactivatedTemplate(user.first_name)
      );

      console.log(`Auto-reactivated: ${user.email}`);
    }

    console.log(`Cron done. Reactivated ${expiredUsers.length} user(s).`);

  } catch (error) {
    console.error("Auto Reactivate Cron Error:", error);
  }
}, {
  timezone: "Asia/Kolkata"
});