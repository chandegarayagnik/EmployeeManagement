import { DataTypes } from "sequelize";
import { dbConnection } from "../config/db.js";

const sequelize = await dbConnection();

const Employee = sequelize.define(
    "emp",
    {
        empukid: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        position: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        salary: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        phone: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        depart_id: {
            type: DataTypes.INTEGER,
            allowNull: false

        },
        join_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        flag: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
    },
    {
        tableName: "emp",
        timestamps: true
    }
);

export default Employee
