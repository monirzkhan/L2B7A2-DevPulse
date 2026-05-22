import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
    console.log(req.body);
    try {

        const user = req.user;

        // reporter_id from token
        const reporter_id = user.id;

        const result = await issueService.createIssueIntoDB(req.body, reporter_id);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue registered successfully",
            data: result.rows[0],
        });
    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,

        })
    }
}

const getAllIssue = async (req: Request, res: Response) => {

    try {
        const result = await issueService.getAllIssueFromDB()

        if (result.length === 0) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
                data: {}
            })
        }
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue Retrived Successfully",
            data: result
        })
    } catch (error: any) {
         sendResponse(res, {
                statusCode: 500,
                success: false,
                message: error.message,
                error: error
            })
    }
}


export const issuecontroller = {
    createIssue,
    getAllIssue
}