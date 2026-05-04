const prisma = require("../../../config/prisma");
const { getAccessibleOrgIds, isOrgAdminUser } = require("../../../utils/accessControl");
const {generateCode} = require('../../../utils/generateCode');
const validateBuildingPayload = (data) => {
  const requiredFields = [
    "project_id",
    "building_type_id",
    "name",
    "total_floors",
    "total_units",
    "address_line_1",
    "city",
    "state",
    "country",
    "postal_code",
  ];

  const missing = requiredFields.find((f) => !data[f] && data[f] !== 0);
  if (missing) return `${missing} is required`;

  return null;
};
const canManageBuildings = async (req) => {
  if (req.isSuperAdmin) return true;

  const userId = BigInt(req.user.userId);
  const isOrgAdmin = await isOrgAdminUser(userId);

  return !!isOrgAdmin;
};

exports.createBuilding = async (req, res) => {
  try {
    const hasAccess = await canManageBuildings(req);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to create building",
      });
    }

    const error = validateBuildingPayload(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const data = req.body;
    const code = await generateCode(); // ✅ correct usage
    const projectId = BigInt(data.project_id);

    const orgIds = await getAccessibleOrgIds(req);

    const project = await prisma.projects.findFirst({
      where: {
        id: projectId,
        ...(req.isSuperAdmin
          ? {}
          : {
              branch_projects: {
                some: {
                  branches: {
                    organization_id: { in: orgIds },
                  },
                },
              },
            }),
      },
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    const exists = await prisma.buildings.findFirst({
      where: {
        project_id: projectId,
        code,
      },
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Building code already exists for this project",
      });
    }

    const building = await prisma.buildings.create({
      data: {
        project_id: projectId,
        building_type_id: BigInt(data.building_type_id),
        code: code, // ✅ FIXED
        name: data.name,
        total_floors: Number(data.total_floors),
        total_units: Number(data.total_units),
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2 || null,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Building created successfully",
      data: {
        ...building,
        id: building.id.toString(),
        project_id: building.project_id.toString(),
      },
    });

  } catch (err) {
    console.error("Create Building Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getBuildings = async (req, res) => {
  try {
    const userId = BigInt(req.user.userId);

    let where = {};

    if (!req.isSuperAdmin) {
      const orgIds = await getAccessibleOrgIds(req);

      const userBranches = await prisma.user_branches.findMany({
        where: { user_id: userId },
        select: { branch_id: true },
      });

      const branchIds = userBranches.map((b) => b.branch_id);

     where = {
  OR: [
    ...(orgIds.length > 0
      ? [
          {
            projects: {
              branch_projects: {
                some: {
                  branches: {
                    organization_id: { in: orgIds },
                  },
                },
              },
            },
          },
        ]
      : []),
    ...(branchIds.length > 0
      ? [
          {
            projects: {
              branch_projects: {
                some: {
                  branch_id: { in: branchIds },
                },
              },
            },
          },
        ]
      : []),
    {
      projects: {
        user_projects: {
          some: {
            user_id: userId,
          },
        },
      },
    },
  ],
};
    }

    const buildings = await prisma.buildings.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        building_types: { select: { name: true } },
        projects: { select: { id: true, name: true } },
      },
    });

  const data = await Promise.all(
  buildings.map(async (b) => {
    const isCountryId = b.country && !isNaN(b.country);
    const isStateId = b.state && !isNaN(b.state);

    const [country, state] = await Promise.all([
      isCountryId
        ? prisma.countries.findUnique({
            where: { id: BigInt(b.country) },
            select: { name: true },
          })
        : null,
      isStateId
        ? prisma.states.findUnique({
            where: { id: BigInt(b.state) },
            select: { name: true },
          })
        : null,
    ]);

    return {
      id: b.id.toString(),
      name: b.name,
      code: b.code,

      project_id: b.project_id.toString(),
      project_name: b.projects?.name || "-",

      building_type_id: b.building_type_id?.toString() || null,
building_type: b.building_types?.name || "-",

      total_floors: b.total_floors,
      total_units: b.total_units,

      address: b.address_line_1 || "-",
      city: b.city || "-",

      country: isCountryId ? (country?.name || "-") : (b.country || "-"),
      state: isStateId ? (state?.name || "-") : (b.state || "-"),

      country_id: isCountryId ? b.country.toString() : null,
      state_id: isStateId ? b.state.toString() : null,

      postal_code: b.postal_code || "-",
    };
  })
);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Get Buildings Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getBuildingTypes = async (req, res) => {
  try {
        const hasAccess = await canManageBuildings(req);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to get  buildingTypes",
      });
    }
    const types = await prisma.building_types.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: types.map((t) => ({
        id: t.id.toString(),
        name: t.name,
      })),
    });
  } catch (err) {
    console.error("Get Building Types Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateBuilding = async (req, res) => {
  try {
    const hasAccess = await canManageBuildings(req);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update building",
      });
    }

    const buildingId = BigInt(req.params.id);

    const error = validateBuildingPayload(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const existing = await prisma.buildings.findUnique({
      where: { id: buildingId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    const data = req.body;
    if (data.code !== existing.code) {
      const exists = await prisma.buildings.findFirst({
        where: {
          project_id: existing.project_id,
          code: data.code,
          NOT: { id: buildingId },
        },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Building code already exists",
        });
      }
    }

    const updated = await prisma.buildings.update({
      where: { id: buildingId },
      data: {
        building_type_id: BigInt(data.building_type_id),
        code: data.code,
        name: data.name,
        total_floors: Number(data.total_floors),
        total_units: Number(data.total_units),
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2 || null,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Building updated successfully",
      data: {
        ...updated,
        id: updated.id.toString(),
      },
    });
  } catch (err) {
    console.error("Update Building Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteBuilding = async (req, res) => {
  try {
    const hasAccess = await canManageBuildings(req);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete building",
      });
    }

    const buildingId = BigInt(req.params.id);

    const existing = await prisma.buildings.findUnique({
      where: { id: buildingId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    await prisma.buildings.delete({
      where: { id: buildingId },
    });

    return res.status(200).json({
      success: true,
      message: "Building deleted successfully",
    });
  } catch (err) {
    console.error("Delete Building Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};