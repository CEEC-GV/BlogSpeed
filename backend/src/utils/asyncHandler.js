export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error("FULL ERROR STACK:", error);
    next(error);
  });
