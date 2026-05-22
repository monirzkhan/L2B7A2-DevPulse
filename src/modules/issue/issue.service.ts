import { pool } from "../../db";
import type { Iissue } from "./issue.interface";

const createIssueIntoDB = async (payload: Iissue, reporter_id: number) => {
    //console.log(payload);
    const { title, description, type } = payload;
    console.log("reporter ID", reporter_id);

    const user = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [reporter_id],
    );


    if (user.rows.length === 0) {
        throw new Error("User no no Exist!!")
    }
    const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
        `, [title, description, type, 'open', reporter_id],)
    console.log('After Database Creation', result.rows);
    return result;
}

const getAllIssueFromDB = async () => {
    const issuesResult = await pool.query(`
        SELECT * FROM issues`
    );
    const issues = issuesResult.rows;

    const reporterIds = [...new Set(issues.map(i => i.reporter_id))];
    // console.log(reporterIds);

    const usersResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = ANY($1)`,
        [reporterIds]
    );

    const userMap = new Map(
        usersResult.rows.map(user => [user.id, user])
    );

    return issues.map(issue => ({
        ...issue,
        reporter: userMap.get(issue.reporter_id) || null
    }));
};

export const issueService = {
    createIssueIntoDB,
    getAllIssueFromDB,
}