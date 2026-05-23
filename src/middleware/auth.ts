import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { pool } from "../db";
import config from "../config";
import sendResponse from "../utility/sendResponse";
import type { Role } from "../types";


const auth = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        //console.log("Controller", roles)
        try {
            const token = (req.headers.authorization);
            //console.log(token);
            if (!token) {
               return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: "Unauthorized Access",
                })
            }
            //jwt verify
            const decoded = jwt.verify(
                token, 
                config.jwt_secret as string) as JwtPayload;
            //console.log(decoded)
            const userData = await pool.query(`
            SELECT * from users WHERE email=$1
            `, [decoded.email],)
            //console.log(userData.rows[0])

            if (userData.rows.length === 0) {
                    return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: "User Not Found",
                });
            }
            const user = userData.rows[0];

            if (roles.length && !roles.includes(user.role)) {
                return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: "Unauthorized Access, This role can not access",
                });
            }
            
            req.user = decoded;
            next()
        }
        catch (error) {
          return sendResponse(res, {
                statusCode: 401,
                success: false,
                message: "Invalid token",
            });
        }
    }
}

export default auth;