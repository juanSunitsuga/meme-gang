import { NextFunction, Request, Response } from "express";

type ExpressRouteHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T> | T;

export function controllerWrapper<T>(routeHandler: ExpressRouteHandler<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await routeHandler(req, res, next);
      console.log('xx',result);
      res.status(200).json(result);
      console.log('xx2')
    } catch (error) {
      console.log('alsdnfklsnadfk',error);
      next(error);
    }
  };
}
