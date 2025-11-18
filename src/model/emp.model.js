import { DataTypes} from "sequelize";
import { dbConnection } from "../config/db.js";

const sequelize = await dbConnection();

const Employee = sequelize.define("Employee", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salary: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default Employee
