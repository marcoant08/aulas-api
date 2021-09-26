import express from "express";
import routes from "./routes";
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./doc/swagger.json");

const app = express();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(routes);

app.listen(3333);
