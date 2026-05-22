import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"


import { nextTick } from "node:process";
import { pool } from "../db";
import config from "../config";


const auth = (...roles:any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log("Controller",roles)
        try {

            const token = (req.headers.authorization);
            console.log(token);
            if (!token) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized Access",

                })
            }
            //jwt verify
            const decoded = jwt.verify(token, config.jwt_secret);
            console.log(decoded)
            // const userData = await pool.query(`
            // SELECT * from users WHERE email=$1
            // `, [decoded.email],)
            //console.log(userData.rows[0])

            // if (userData.rows.length === 0) {
            //     res.status(404).json({
            //         success: false,
            //         message: "User Not Found",

            //     })
            // }
            // const user = userData.rows[0];
            // // if (!user.is_active) {
            // //     res.status(403).json({
            // //         success: false,
            // //         message: "Forbidden",

            // //     })
            // // }
            // if(roles.length && !roles.includes(user.role)){
            //     res.status(401).json({
            //         success: false,
            //         message: "Unauthorized Access, This role can not access",

            //     })
            // }

            // req.user = decoded;
            next()
        }
        catch (error) {
            next(error)
        }
    }
}

export default auth;