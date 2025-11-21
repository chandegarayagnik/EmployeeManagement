import Joi from "joi";

export const createEmpSchema = Joi.object({
    empukid: Joi.string().max(200).required(),
    name: Joi.string().max(500).optional().allow(null, ""),
    email: Joi.string().max(100).optional().allow(null, ""),
    position: Joi.string().max(200).optional().allow(null, ""),
    salary:  Joi.number().optional().allow(null, ""),
    phone: Joi.number().optional().allow(null, ""),
    DepartmentID: Joi.number().optional().allow(null, ""),
    join_date: Joi.date().optional(),
    flag: Joi.string()
    .valid("A", "U")
    .required()
    .messages({
      "any.only": "flag can be A or U only",
      "any.required": "flag is required",
    }),
})

export const deleteEmpSchema = Joi.object({
  empukid: Joi.string().required(),
});

   