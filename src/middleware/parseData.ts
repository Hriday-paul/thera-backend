import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';

const parseData = () => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);

    } if (req.body?.image) {
      req.body.image = JSON.parse(req.body.image)
    }
    next();
  });
};

export default parseData;
