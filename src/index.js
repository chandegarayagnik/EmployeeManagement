import express from "express"
import { emprouter } from "./router/emp.router.js"
import cors from "cors"
import "../src/config/db.js"
import "dotenv/config"


const app = express()
const port = process.env.PORT || 8080

app.use(express.json())
app.use(cors());
app.use('/api', emprouter)

app.get("/", (req, res) => {
    res.send("Employee Management Api Running...")
})

app.listen(port, () => {
    console.log(`Server Running At : ${port}`);
})