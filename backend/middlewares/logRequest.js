import logger from "../logger.js";

export const logRequest = (req, res, next) => {
  const { method, url } = req;
  const ip = req.socket.remoteAddress.replace(/^::ffff:/, "");

  res.on("finish", () => {
    const { statusCode } = res;
    const logMessage = `${method} ${url} - Status: ${statusCode} - IP: ${ip}`;

    if (statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};
