import express from "express";
import router from "./routes/index.js";
import cors from "cors";
import { env } from "./config/env.js";
import "dotenv/config";
import { dbConnection } from "./config/db.js";

const app = express();
const port = env.PORT || 4444;

app.use("/media", express.static("./media"));
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use("/api", router);

app.get("/", (req, res) => {
    res.send("Employee Management Api Running...");
});

dbConnection();

app.listen(port, () => {
    console.log(`Server Running At : ${port}`);
});