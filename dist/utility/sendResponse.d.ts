import type { Response } from "express";
type Tresponse<T> = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    error?: any;
};
declare const sendResponse: <T>(res: Response, data: Tresponse<T>) => void;
export default sendResponse;
//# sourceMappingURL=sendResponse.d.ts.map