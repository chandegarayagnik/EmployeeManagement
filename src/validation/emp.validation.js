import Joi from "joi";

export const createEmpSchema = Joi.object({

  FirstName: Joi.string().max(100).required().messages({
    "any.required": "FirstName is required",
    "string.empty": "FirstName cannot be empty",
    "string.base": "FirstName must be a string",
    "string.max": "FirstName cannot exceed 100 characters",
  }),

  Role: Joi.string().max(50).optional().allow(null, "").messages({
    "string.base": "Role must be a string",
    "string.max": "Role cannot exceed 50 characters",
  }),

  CustId: Joi.string().max(100).required().messages({
    "any.required": "CustId is required",
    "string.empty": "CustId cannot be empty",
    "string.base": "CustId must be a string",
    "string.max": "CustId cannot exceed 100 characters",
  }),

  UserName: Joi.string().max(100).required().messages({
    "any.required": "UserName is required",
    "string.empty": "UserName cannot be empty",
    "string.max": "UserName cannot exceed 100 characters",
  }),

  Password: Joi.string().max(500).required().messages({
    "any.required": "Password is required",
    "string.max": "Password cannot exceed 500 characters",
  }),

  Flag: Joi.string().trim().valid("A", "U").required().messages({
    "any.required": "Flag is required",
    "string.empty": "Flag cannot be empty",
    "any.only": "Flag can be A or U only",
  })

});

export const deleteEmpSchema = Joi.object({
  empukid: Joi.string().required(),
});

