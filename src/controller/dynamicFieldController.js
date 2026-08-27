const fieldTypeMap = {
    string: "NVARCHAR(200)",
    text: "NVARCHAR(MAX)",
    number: "INT",
    decimal: "DECIMAL(18,2)",
    boolean: "BIT",
    date: "DATE",
    datetime: "DATETIME"
};


export const createDynamicField = async (req, res) => {

    const { DynamicFieldMaster } = req.db.models;
    const { sequelize } = req.db;
    const transaction = await sequelize.transaction();

    try {

        const {
            tableName,
            fieldName,
            fieldLabel,
            fieldType,
            isRequired
        } = req.body;


        // --------------------------------
        // Validation
        // --------------------------------

        if (!tableName || !fieldName || !fieldType) {

            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "tableName, fieldName and fieldType are required"
            });
        }


        // --------------------------------
        // Validate table/column name
        // --------------------------------

        const nameRegex =
            /^[A-Za-z_][A-Za-z0-9_]*$/;


        if (!nameRegex.test(tableName)) {

            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message: "Invalid table name"
            });
        }


        if (!nameRegex.test(fieldName)) {

            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message: "Invalid field name"
            });
        }


        // --------------------------------
        // Data type mapping
        // --------------------------------

        const sqlDataType =
            fieldTypeMap[fieldType];


        if (!sqlDataType) {

            await transaction.rollback();

            return res.status(400).json({
                success: false,
                message: "Invalid field type"
            });
        }


        // --------------------------------
        // Check table
        // --------------------------------

        const [tableResult] =
            await sequelize.query(
                `
                SELECT 1
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_NAME = :tableName
                `,
                {
                    replacements: {
                        tableName
                    },
                    transaction
                }
            );


        if (tableResult.length === 0) {

            await transaction.rollback();

            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }


        // --------------------------------
        // Check column
        // --------------------------------

        const [columnResult] =
            await sequelize.query(
                `
                SELECT 1
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = :tableName
                AND COLUMN_NAME = :columnName
                `,
                {
                    replacements: {
                        tableName,
                        columnName: fieldName
                    },
                    transaction
                }
            );


        if (columnResult.length > 0) {

            await transaction.rollback();

            return res.status(409).json({
                success: false,
                message:
                    "This field already exists in database"
            });
        }


        // --------------------------------
        // Create database column
        // --------------------------------

        await sequelize.query(
            `
            ALTER TABLE [${tableName}]
            ADD [${fieldName}]
            ${sqlDataType}
            NULL
            `,
            {
                transaction
            }
        );


        // --------------------------------
        // Save dynamic field information
        // --------------------------------

        await DynamicFieldMaster.create(
            {
                TableName: tableName,
                ColumnName: fieldName,
                FieldLabel: fieldLabel || fieldName,
                DataType: fieldType,
                IsRequired: isRequired || false
            },
            {
                // transaction
            }
        );


        await transaction.commit();


        return res.status(201).json({
            success: true,
            message:
                "Dynamic field created successfully",
            data: {
                tableName,
                fieldName,
                fieldType
            }
        });


    } catch (error) {

        await transaction.rollback();

        console.error(
            "createDynamicField error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to create dynamic field",
            error: error.message
        });
    }
};