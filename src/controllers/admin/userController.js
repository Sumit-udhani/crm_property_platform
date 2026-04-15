const prisma = require("../../config/prisma");
const { generateToken } = require("../../utils/jwt");
const { sendEmail } = require("../../utils/emailService");
const suspendedTemplate = require("../../templates/suspendedTemplate");
const reactivatedTemplate = require('../../templates/reactivatedTemplate')
const { setPasswordTemplate } = require("../../templates/setPassword.template");

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, role_id } = req.body;

    
    if (!first_name || !email || !role_id) {
      return res.status(400).json({
        success: false,
        message: "first_name, email, role_id are required",
      });
    }

    
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

   
    const user = await prisma.users.create({
      data: {
        first_name,
        last_name,
        email,
        phone,
        password_hash: "", 
      },
    });

   
    await prisma.user_roles.create({
      data: {
        user_id: user.id,
        role_id: BigInt(role_id),
      },
    });

    const role = await prisma.roles.findUnique({
  where: { id: BigInt(role_id) }
})

    const token = generateToken({
      userId: user.id,
      email: user.email,
      type: "SET_PASSWORD",
    },"15m");

    
    const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    
    await sendEmail(
      email,
      "Set Your Password",
      setPasswordTemplate(first_name, link)
    );

    return res.status(201).json({
      success: true,
      message: "User created and email sent",
      data: {
    ...user,
    role_name: role?.name || null  
  },
    });

  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// exports.getRoles = async (req, res) => {
//   try {
//     const roles = await prisma.roles.findMany({
//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Roles fetched successfully",
//       data: roles,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching roles",
//     });
//   }
// };
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        created_at: true,
         is_active: true,
          suspended_at: true,       
    suspend_reason: true,  
        user_roles: {
          select: {
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    
    const formatted = users.map((user) => {
      const { user_roles, ...rest } = user;
      const role = user_roles?.[0]?.roles ?? null;
      return {
        ...rest,
        role_id: role?.id ?? null,
        role_name: role?.name ?? null,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: formatted,
    });

  } catch (error) {
    console.error('Get Users Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name,email, phone, role_id } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.users.update({
      where: { id: BigInt(id) },
      data: {
        ...(first_name && { first_name }),
        ...(last_name  && { last_name }),
        ...(phone      && { phone }),
        ...(email      && { email }),

      },
    });

    
    if (role_id) {
      await prisma.user_roles.updateMany({
        where: { user_id: BigInt(id) },
        data: { role_id: BigInt(role_id) },
      });
    }

    const role = await prisma.user_roles.findFirst({
      where: { user_id: BigInt(id) },
      include: { roles: { select: { id: true, name: true } } },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        ...updatedUser,
        role_id:   role?.roles?.id   ?? null,
        role_name: role?.roles?.name ?? null,
      },
    });

  } catch (error) {
    console.error("Edit User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.users.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   
    await prisma.$transaction([
      
      prisma.user_roles.deleteMany({
        where: { user_id: BigInt(id) },
      }),

     
      prisma.users.delete({
        where: { id: BigInt(id) },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, suspend_reason, suspend_days } = req.body;

    
    if (!action || !["suspend", "reactivate", "deactivate"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action is required and must be 'suspend', 'reactivate' or 'deactivate'",
      });
    }

   
    if (action === "suspend" && (!suspend_reason || !suspend_days)) {
      return res.status(400).json({
        success: false,
        message: "suspend_reason and suspend_days are required when suspending",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (action === "suspend") {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + Number(suspend_days));

    const updatedUser  = await prisma.users.update({
        where: { id: BigInt(id) },
        data: {
          suspend_reason,
          suspended_at:  new Date(),
          suspend_until: suspendUntil,
          is_active:     false,
        },
      });

      await sendEmail(
        user.email,
        "Your Account Has Been Suspended",
        suspendedTemplate(user.first_name, suspend_reason, suspendUntil)
      );

      return res.status(200).json({
        success: true,
        message: `User suspended for ${suspend_days} day(s)`,
         data: updatedUser,
      });
    }

    if (action === "deactivate") {
     const updatedUser = await prisma.users.update({
        where: { id: BigInt(id) },
        data: {
          is_active:      false,
          suspend_reason: null,  
          suspended_at:   null,
          suspend_until:  null,
        },
      });

      return res.status(200).json({
        success: true,
        message: "User deactivated successfully",
        data: updatedUser
      });
    }

    if (action === "reactivate") {
     const updatedUser = await prisma.users.update({
        where: { id: BigInt(id) },
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

      return res.status(200).json({
        success: true,
        message: "User reactivated successfully",
        data: updatedUser
      });
    }

  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};