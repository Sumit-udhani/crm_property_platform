const prisma = require("../../config/prisma");
const { generateToken } = require("../../utils/jwt");
const { sendEmail } = require("../../utils/emailService");
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
      data: user,
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
exports.getRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching roles",
    });
  }
};