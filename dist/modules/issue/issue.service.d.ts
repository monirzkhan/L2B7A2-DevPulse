import type { Iissue } from "./issue.interface";
export declare const issueService: {
    createIssueIntoDB: (payload: Iissue, reporter_id: number) => Promise<import("pg").QueryResult<any>>;
    getAllIssueFromDB: (query: any) => Promise<any[]>;
    getSingleIssuefromDB: (id: number) => Promise<any>;
    updateIssueIntoDB: (id: number, payload: Iissue, user: any) => Promise<import("pg").QueryResult<any>>;
    deleteIssuefromDB: (id: string) => Promise<import("pg").QueryResult<any>>;
};
//# sourceMappingURL=issue.service.d.ts.map