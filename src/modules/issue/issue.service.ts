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

//getAllIssueFromDB
const getAllIssueFromDB = async (query: any) => {
  const { sort, type, status } = query;

  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values: any[] = [];

  if (type) {
    values.push(type);
    sql += ` AND type = $${values.length}`;
  }

  
  if (status) {
    values.push(status);
    sql += ` AND status = $${values.length}`;
  }

  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  //get issues
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;

  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [...new Set(issues.map(i => i.reporter_id))];
  //console.log(reporterIds);

  
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

//getSingleIssuefromDB
const getSingleIssuefromDB = async (id: number) => {
    const issueResult = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id],)

    const issue = issueResult.rows[0];
    //console.log(issue.reporter_id);

    const userResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = $1`,
        [issue.reporter_id]
    );

    const reporter = userResult.rows[0] || null;
   // console.log(reporter);

    return {
        ...issue,
        reporter
    };
}

export const issueService = {
    createIssueIntoDB,
    getAllIssueFromDB,
    getSingleIssuefromDB
}