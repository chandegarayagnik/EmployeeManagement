import { Router } from "express";
import { signup, listUser, listUserById, createregister, createlogin, forgetPassword, deleteUser } from "../controller/user.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";

const router = Router();

router.post("/signup", attachDatabase, signup);
router.post("/register", attachDatabase, createregister);
router.post("/login", attachDatabase, createlogin);
router.get("/list", authenticateJWT, attachDatabase, listUser);
router.get("/getbyid/:userukid", authenticateJWT, attachDatabase, listUserById);
router.put("/forgetpassword", attachDatabase, forgetPassword);
router.delete("/deleteuser/:userukid", authenticateJWT, attachDatabase, deleteUser);

export default router;
