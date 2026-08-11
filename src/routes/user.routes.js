import { Router } from "express";
import { signup, listUser, listUserById, createregister, createlogin, forgetPassword, deleteUser } from "../controller/user.controller.js";

const router = Router();

router.post("/signup", signup);
router.get("/list", listUser);
router.get("/getbyid/:userukid", listUserById);
router.post("/register", createregister);
router.post("/login", createlogin);
router.put("/forgetpassword", forgetPassword);
router.delete("/deleteuser/:userukid", deleteUser);

export default router;
