import Settings from "../models/Settings.js";

// GET settings
export const getSettings = async (req, res) => {
  let settings = await Settings.findOne({ user: req.admin.id });

  if (!settings) {
    settings = await Settings.create({ user: req.admin.id });
  }
  console.log("Fetched settings for user", settings);

  res.json({
    success: true,
    data: settings
  });
};

// UPDATE settings
export const updateSettings = async (req, res) => {
  const { autoBlogEmail } = req.body;

  let settings = await Settings.findOne({ user: req.admin.id });
  if (!settings) {
    settings = await Settings.create({ user: req.admin.id });
  }

  settings.autoBlogEmail = autoBlogEmail;
  await settings.save();

  res.json({
    success: true,
    message: "Settings updated",
    data: settings
  });
};

export const updateCompanyInfo = async (req, res) => {
  const { companyName, companyLink } = req.body;

  let settings = await Settings.findOne({ user: req.admin.id });
  if (!settings) {
    settings = await Settings.create({ user: req.admin.id });
  }

  settings.companyName = companyName;
  settings.companyLink = companyLink;
  await settings.save();

  res.json({
    success: true,
    message: "Company info updated",
    data: settings
  });
};