import { dbConnection, sequelize as defaultSequelize } from "../config/db.js";
import { loadModels } from "../model/index.js";

export const attachDatabase = async (req, res, next) => {
    let sequelize;

    try {
        if (req?.user?.CustId) {
            sequelize = await dbConnection(req.user.CustId);
        } else if (req.query?.CustId) {
            sequelize = await dbConnection(req.query.CustId);
        } else {
            sequelize = await dbConnection();
        }

        if (!sequelize || typeof sequelize.define !== "function") {
            sequelize = defaultSequelize;
        }

        req.db = {
            sequelize,
            models: loadModels(sequelize),
        };

        if (req?.user?.CustId) {
            const { User } = req.db.models;

            if (User && (req.user.userukid || req.user.UserUkeyID)) {
                const getUserInfo = await User.findOne({
                    where: {
                        userukid: req.user.userukid || req.user.UserUkeyID,
                    },
                    attributes: ["LoginTime", "LogoutTime"],
                    raw: true,
                });

                if (getUserInfo?.LogoutTime) {
                    const tokenLoginTime = new Date(req.user.LoginTime);
                    const dbLogoutTime = new Date(getUserInfo.LogoutTime);

                    if (tokenLoginTime <= dbLogoutTime) {
                        // return res.status(401).json({
                        //     success: false,
                        //     message: "logout !!! invalid token."
                        // });
                    }
                }
            }
        }

        return next();
    } catch (error) {
        console.error("attachDatabase Middleware Error:", error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
};
