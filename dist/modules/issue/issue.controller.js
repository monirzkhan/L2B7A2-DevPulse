import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import { userService } from "../user/user.service";
const createIssue = async (req, res) => {
    // console.log(req.body);
    try {
        const user = req.user;
        // reporter_id from jwttoken
        const reporter_id = user.id;
        const result = await issueService.createIssueIntoDB(req.body, reporter_id);
        return sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue registered successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
        });
    }
};
const getAllIssue = async (req, res) => {
    try {
        const result = await issueService.getAllIssueFromDB(req.query);
        if (result.length === 0) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
                data: {}
            });
        }
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues Retrieved Successfully",
            data: result
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        });
    }
};
const getSingleIssue = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const result = await issueService.getSingleIssuefromDB(id);
        console.log(result);
        if (!result) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: {}
            });
        }
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues Retrieved Successfully",
            data: result
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        });
    }
};
const updateIssue = async (req, res) => {
    const id = Number(req.params.id);
    const { title, description, type } = req.body;
    try {
        const result = await issueService.updateIssueIntoDB(id, req.body, req.user);
        if (result.rows.length === 0) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: {}
            });
        }
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues Updated Successfully",
            data: result.rows[0]
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        });
    }
};
const deleteIssue = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await issueService.deleteIssuefromDB(id);
        if (result.rows.length === 0) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: {}
            });
        }
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues Deleted Successfully",
            data: result.rows[0]
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        });
    }
};
export const issuecontroller = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
};
//# sourceMappingURL=issue.controller.js.map