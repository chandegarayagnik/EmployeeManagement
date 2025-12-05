import express from "express"
import router from "./routes/index.js"
import cors from "cors"
import "../src/config/db.js"
import "dotenv/config"

const app = express()
const port = process.env.PORT || 8080

app.use('/', express.static('./media'));
app.use(express.json())
app.use(cors());
app.use("/api", router)

app.get("/", (req, res) => {
    res.send("Employee Management Api Running...")
})

app.listen(port, () => {
    console.log(`Server Running At : ${port}`);
})