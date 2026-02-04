import Settings from "../models/Settings.js";

// GET settings
export const getSettings = async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  res.json({
    success: true,
    data: settings
  });
};

// UPDATE settings
export const updateSettings = async (req, res) => {
  const { autoBlogEmail } = req.body;

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  settings.autoBlogEmail = autoBlogEmail;
  await settings.save();

  res.json({
    success: true,
    message: "Settings updated",
    data: settings
  });
};
