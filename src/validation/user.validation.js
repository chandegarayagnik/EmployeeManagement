import Joi from "joi";

export const createuserShema = Joi.object({
    id : Joi.number().required(),
    username: Joi.string().max(255).required(),
    password: Joi.string().optional()
})

