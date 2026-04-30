const prisma = require("../../../config/prisma");
const { generateCode } = require("../../../utils/generateCode");

const getAccessibleOrgIds = async (req) => {
  const userId = BigInt(req.user.userId);

  const createdOrgs = await prisma.organizations.findMany({
    where: { created_by: userId },
    select: { id: true },
  });

  const createdOrgIds = createdOrgs.map((o) => o.id);

  const assignedOrgId = req.user.organization_id
    ? BigInt(req.user.organization_id)
    : null;

  return [
    ...createdOrgIds,
    ...(assignedOrgId ? [assignedOrgId] : []),
  ];
};

const canAccessBranch = async (req, branchId) => {
  if (req.isSuperAdmin) return true;

  const userId = BigInt(req.user.userId);
  const orgIds = await getAccessibleOrgIds(req);


  if (orgIds.length > 0) {
    const branch = await prisma.branches.findFirst({
      where: {
        id: branchId,
        organization_id: { in: orgIds },
      },
    });

    if (branch) return true;
  }

  const assigned = await prisma.user_branches.findFirst({
    where: {
      user_id: userId,
      branch_id: branchId,
    },
  });

  return !!assigned;
};

exports.createProject = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    const userId = BigInt(user.userId);

    const requiredFields = [
      "project_status_id",
      "name",
      "address_line_1",
      "city",
      "state",
      "country",
      "postal_code",
      "start_date",
      "end_date",
    ];

    if (requiredFields.some((f) => !data[f])) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const orgIds = await getAccessibleOrgIds(req);

    if (!req.isSuperAdmin && orgIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to create project",
      });
    }

    const code = await generateCode();

    const formatDate = (date) =>
      date ? new Date(date).toISOString() : null;

    const project = await prisma.projects.create({
      data: {
        ...data,
        project_status_id: BigInt(data.project_status_id),
        start_date: formatDate(data.start_date),
        end_date: formatDate(data.end_date),
        created_by: userId,
        code,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (err) {
    console.error("Create Project Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProjectStatuses = async (req, res) => {
  try {
    const statuses = await prisma.project_statuses.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      message: "Project statuses fetched successfully",
      data: statuses,
    });
  } catch (err) {
    console.error("Get Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);
    const { userId: filterUserId } = req.query;

    let where = {};

    if (filterUserId) {
      where.user_projects = {
        some: {
          user_id: BigInt(filterUserId),
        },
      };
    } else if (!req.isSuperAdmin) {
      const orgIds = await getAccessibleOrgIds(req);


      if (orgIds.length > 0) {
        where.branch_projects = {
          some: {
            branches: {
              organization_id: { in: orgIds },
            },
          },
        };
      } else {
        const userProjects = await prisma.user_projects.findMany({
          where: { user_id: userId },
          select: { project_id: true },
        });

        const projectIds = userProjects.map((p) => p.project_id);

        if (!projectIds.length) {
          return res.status(200).json({
            success: true,
            message: "No access",
            data: [],
          });
        }

        where.id = { in: projectIds };
      }
    }

    const projects = await prisma.projects.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        project_statuses: { select: { name: true } },
        branch_projects: {
          include: {
            branches: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const data = projects.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      code: p.code,
      project_status_id: p.project_status_id?.toString(),
      project_status_name: p.project_statuses?.name || "-",
      city: p.city || "-",
      state: p.state || "-",
      country: p.country || "-",
      address: p.address_line_1 || "-",
      branches: p.branch_projects.map((bp) => ({
        id: bp.branches.id.toString(),
        name: bp.branches.name,
      })),
      start_date: p.start_date,
      end_date: p.end_date,
    }));

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data,
    });
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    return res.status(500).json({ success: false });
  }
};

exports.getAvailableProjects = async (req, res) => {
  try {
    const { branch_id } = req.query;

    const assigned = await prisma.branch_projects.findMany({
      select: {
        project_id: true,
        branch_id: true,
      },
    });

    const assignedToOtherBranches = assigned
      .filter((p) => String(p.branch_id) !== String(branch_id))
      .map((p) => p.project_id);

    const projects = await prisma.projects.findMany({
      where: {
        OR: [
          {
            id: { notIn: assignedToOtherBranches },
          },
          {
            branch_projects: {
              some: {
                branch_id: BigInt(branch_id),
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: projects.map((p) => ({
        id: p.id.toString(),
        name: p.name,
      })),
    });
  } catch (err) {
    console.error("Available Projects Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const project = await prisma.projects.findUnique({
      where: { id: BigInt(id) },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const branchProject = await prisma.branch_projects.findFirst({
      where: {
        project_id: BigInt(id),
      },
      select: {
        branch_id: true,
      },
    });

    if (branchProject) {
      const allowed = await canAccessBranch(
        req,
        branchProject.branch_id
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to edit project",
        });
      }
    }

    const updateData = {
      ...data,
      project_status_id: data.project_status_id
        ? BigInt(data.project_status_id)
        : undefined,
      start_date: data.start_date
        ? new Date(data.start_date)
        : null,
      end_date: data.end_date
        ? new Date(data.end_date)
        : null,
    };

    const updatedProject = await prisma.projects.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (err) {
    console.error("Edit Project Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const projectId = BigInt(id);

    // ✅ Check project exists
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        branch_projects: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ Access Control
    if (!req.isSuperAdmin) {
      const orgIds = await getAccessibleOrgIds(req);

      let hasAccess = false;

     
      if (orgIds.length > 0) {
        const branchIds = project.branch_projects.map(bp => bp.branch_id);

        const branches = await prisma.branches.findMany({
          where: {
            id: { in: branchIds },
            organization_id: { in: orgIds },
          },
        });

        if (branches.length > 0) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        const assigned = await prisma.user_projects.findFirst({
          where: {
            user_id: BigInt(req.user.userId),
            project_id: projectId,
          },
        });

        hasAccess = !!assigned;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Not allowed to delete this project",
        });
      }
    }

    // // ⚠️ Dependency Check (VERY IMPORTANT)
    // const [branches, users] = await Promise.all([
    //   prisma.branch_projects.findFirst({
    //     where: { project_id: projectId },
    //   }),
    //   prisma.user_projects.findFirst({
    //     where: { project_id: projectId },
    //   }),
    // ]);

    // if (branches || users) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Cannot delete project. It is linked with branches or users. Remove dependencies first.",
    //   });
    // }
    await prisma.$transaction(async (tx) => {
      await tx.branch_projects.deleteMany({
        where: { project_id: projectId },
      });

      await tx.user_projects.deleteMany({
        where: { project_id: projectId },
      });

      await tx.projects.delete({
        where: { id: projectId },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });

  } catch (err) {
    console.error("Delete Project Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};