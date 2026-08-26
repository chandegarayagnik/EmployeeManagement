import { dbConnection } from '../config/db.js';
import { loadModels } from "../model/index.js";

export const attachDatabase = async (req, res, next) => {
    let sequelize;

    try {

        sequelize = await dbConnection();

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
