import { dbConnection, sequelize as defaultSequelize } from "../config/db.js";
import { loadModels } from "../model/index.js";

export const attachDatabase = async (req, res, next) => {
    let sequelize;

    try {
        // Extract CustId from decoded JWT token (req.user.CustId), query parameter, or headers
        const custId = req?.user?.CustId || req.query?.CustId || req.headers?.custid || req.headers?.CustId;

        if (custId) {
            sequelize = await dbConnection(custId);
        } else {
            sequelize = await dbConnection(); // Default Master Database (empMange)
        }

        if (!sequelize || typeof sequelize.define !== "function") {
            sequelize = defaultSequelize;
        }

        req.db = {
            sequelize,
            models: loadModels(sequelize),
        };

        return next();
    } catch (error) {
        console.error("attachDatabase Middleware Error:", error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
};
