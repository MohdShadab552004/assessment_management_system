import { body } from 'express-validator';


export const reportValidation = [
  body('session_id').notEmpty().withMessage('session_id is required')
];