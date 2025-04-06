import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many request, wait 15 minutes",
  handler: (req, res) => {
    res
      .status(435)
      .json({ error: "You've done too many request. Try again in 15 minutes" });
  },
});
