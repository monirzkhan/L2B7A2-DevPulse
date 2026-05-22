import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
    console.log(req.body);
    try {
        const result = await issueService.createIssueIntoDB(req.body)
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
            error: error,
        });

    }

}

export const issuecontroller = {
    createIssue
}