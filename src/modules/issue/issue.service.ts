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

export const issueService = {
    createIssueIntoDB,
}