import joi from "joi";

const rentalSchema = object({
  customerId: joi.number().required(),
  gameId: joi.number().required(),
  daysRented: joi.number().min(1).required(),
});

export default rentalSchema;
