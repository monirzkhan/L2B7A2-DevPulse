import { pool } from "../../db";
import type { Iissue } from "./issue.interface";

const createIssueIntoDB = async (payload: Iissue) => {
    //console.log(payload);
    const { reporter_id, title, description, type } = payload;

    const user = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [reporter_id],
    );

    console.log(user.rows[0]);
    if (user.rows.length === 0) {
        throw new Error("User no no Exist!!")
    }
    const result = await pool.query(`
        INSERT INTO issues(reporter_id, title, description, type) 
        VALUES($1,$2,$3,$4) RETURNING *
        `, [reporter_id, title, description, type],)
    return result;
}

export const issueService = {
    createIssueIntoDB,
}