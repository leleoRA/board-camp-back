import joi from "joi";

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  cpf: joi
    .string()
    .pattern(/^[0-9]{11}$/)
    .required(),
  birthday: joi.string().pattern(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/),
});

export default customerSchema;
