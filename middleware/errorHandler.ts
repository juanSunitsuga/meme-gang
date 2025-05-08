import { Request, Response, NextFunction } from "express";

const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('errorHandler',error);
    if (error){
        console.log('error 123',error);
    res.status(res.locals.errorCode || 500).json({message: error.message});
    }
}

export default errorHandler;