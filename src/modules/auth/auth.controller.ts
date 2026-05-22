import type { Request, Response } from "express";
import { log } from "node:console";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    //console.log(email)

    try {
        const result = await authService.loginIntoDB(req.body)

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successfully",
            data: result,
        });

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }

}

export const authController = {
    loginUser,
}