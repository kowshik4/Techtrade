const rateLimit = require("express-rate-limit");

exports.Limiter = rateLimit({
  windowsMs: 60 * 1000,
  max: 3,
  // message: "Login limit Exceeded try after sometime."
  handler: (req, res, next) => {
    let err = new Error("Login limit Exceeded try after sometime.");
    err.status = 429;
    return next(err);
  },
});
