import type { Request, Response } from "express";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";

const createUser = async (req: Request, res: Response) => {
    // console.log("Request Body",req.body)
    //  const { name, email, password ,role} = req.body;
    try {
        const result = await userService.userRegisterIntDB(req.body);
        // console.log(result);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    }
    catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
}

export const usercontroller = {
    createUser,
}