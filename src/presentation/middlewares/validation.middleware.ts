import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateAddDocument = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    content: Joi.string().required().min(10),
    title: Joi.string().optional(),
    source: Joi.string().optional(),
    category: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(d => d.message) 
    });
  }
  
  next();
};

export const validateSearch = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    query: Joi.string().required().min(3),
    limit: Joi.number().optional().min(1).max(50),
    threshold: Joi.number().optional().min(0).max(1),
    category: Joi.string().optional(),
    includeResponse: Joi.boolean().optional()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details.map(d => d.message) 
    });
  }
  
  next();
};