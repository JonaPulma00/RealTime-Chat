import express from "express";
import dotenv from "dotenv";
import routes from "./routes/routes.js";
import cors from "cors";
import xss from "xss-clean";
import { logRequest } from "./middlewares/logRequest.js";
import { limiter } from "./middlewares/rateLimit.js";
import { dbMiddleware } from "./middlewares/dbMiddleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3500;

dotenv.config();

app.use(logRequest);
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());
app.use(limiter);
app.use(xss());
app.use(dbMiddleware);

app.use("/api/v1", routes);
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("");
});
app.listen(PORT, () => {
  console.log(`Servidor funcionant en el port ${PORT}`);
});
