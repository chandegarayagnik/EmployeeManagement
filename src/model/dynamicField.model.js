import { DataTypes, Sequelize } from "sequelize";

export const DynamicFieldMaster = (sequelize) => {
    return sequelize.define(
        "DynamicFieldMaster",
        {
            FieldID: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },

            TableName: {
                type: DataTypes.STRING(200),
                allowNull: false
            },

            ColumnName: {
                type: DataTypes.STRING(200),
                allowNull: false
            },

            FieldLabel: {
                type: DataTypes.STRING(200),
                allowNull: true
            },

            DataType: {
                type: DataTypes.STRING(50),
                allowNull: false
            },

            IsRequired: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },

            IsActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },

            CreatedAt: {
                type: DataTypes.DATE,
                defaultValue: Sequelize.literal("GETDATE()")
            }
        },
        {
            tableName: "DynamicFieldMaster",
            timestamps: false
        }
    );
};
