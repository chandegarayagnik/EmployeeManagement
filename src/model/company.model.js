import { DataTypes } from "sequelize";

export default (sequelize) => {
    return sequelize.define(
        "Company",
        {
            CompanyId: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            CompanyName: {
                type: DataTypes.STRING(200),
                allowNull: true
            },

            Add1: {
                type: DataTypes.STRING(250),
                allowNull: true
            },

            Add2: {
                type: DataTypes.STRING(250),
                allowNull: true
            },

            Add3: {
                type: DataTypes.STRING(250),
                allowNull: true
            },

            PincodeId: {
                type: DataTypes.BIGINT,
                allowNull: true
            },

            CityId: {
                type: DataTypes.BIGINT,
                allowNull: true
            },

            StateId: {
                type: DataTypes.BIGINT,
                allowNull: true
            },

            Phone1: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            Mobile1: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            Mobile2: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            Email: {
                type: DataTypes.STRING(200),
                allowNull: true
            },

            PAN: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            GST: {
                type: DataTypes.STRING(20),
                allowNull: true
            },

            Guid: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            EntryTime: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW
            },

            IsActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },

            CustId: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            ClientUkeyId: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            UserName: {
                type: DataTypes.STRING(100),
                allowNull: true
            },

            ServerName: {
                type: DataTypes.STRING(200),
                allowNull: true
            },

            IPAddress: {
                type: DataTypes.STRING(50),
                allowNull: true
            },

            Flag: {
                type: DataTypes.STRING(50),
                allowNull: true
            },

            ContactPerson: {
                type: DataTypes.STRING(150),
                allowNull: true
            },

            Longitude: {
                type: DataTypes.STRING(50),
                allowNull: true
            },

            Latitude: {
                type: DataTypes.STRING(50),
                allowNull: true
            },

            LocationRadius: {
                type: DataTypes.BIGINT,
                allowNull: true
            }
        },
        {
            tableName: "CompanyMaster",
            timestamps: false
        }
    );
};
