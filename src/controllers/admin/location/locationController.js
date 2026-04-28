const prisma = require("../../../config/prisma");


exports.getCountries = async (req, res) => {
  try {
    const countries = await prisma.countries.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: countries });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


exports.getStates = async (req, res) => {
  try {
    const { countryId } = req.params;

    const states = await prisma.states.findMany({
      where: { country_id: BigInt(countryId) },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: states });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getCities = async (req, res) => {
  try {
    const { stateId } = req.params;

    const cities = await prisma.cities.findMany({
      where: { state_id: BigInt(stateId) },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};