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
        res.status(500).json({
            success: false,
            message: error.message,
            error,
        });

    }

}

export const issuecontroller = {
    createIssue
}