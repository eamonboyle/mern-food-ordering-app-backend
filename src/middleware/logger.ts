import morgan from "morgan";
import { Request, Response, NextFunction } from "express";

const logger = morgan("combined");

export default logger;
