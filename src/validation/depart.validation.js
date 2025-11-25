import Joi from "joi";

export const createDepartmentSchema = Joi.object({
    DepartmentID: Joi.number()
        .valid()
        .required(),
        // .message({
        //     "any.required": "Department Id Is Required"
        // }),
    DepartmentName: Joi.string().max(255).allow(null, ""),
    flag: Joi.string()
        .valid("A", "U")
        .required()
        .messages({
            "any.only": "flag can be A or U only",
            "any.required": "flag is required",
        }),
})

export const deleteDepartmentShema = Joi.object({
    DepartmentID: Joi.number().required()
})