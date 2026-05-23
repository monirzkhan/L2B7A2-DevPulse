import { pool } from "../../db";
const createIssueIntoDB = async (payload, reporter_id) => {
    //console.log(payload);
    const { title, description, type } = payload;
    //console.log("reporter ID", reporter_id);
    const user = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [reporter_id]);
    if (user.rows.length === 0) {
        throw new Error("User no Exist!!");
    }
    const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
        `, [title, description, type, 'open', reporter_id]);
    //console.log('After Database Creation', result.rows);
    return result;
};
//getAllIssueFromDB
const getAllIssueFromDB = async (query) => {
    const { sort, type, status } = query;
    let sql = `SELECT * FROM issues WHERE 1=1`;
    const values = [];
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
    }
    else {
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
    const usersResult = await pool.query(`SELECT id, name, role FROM users WHERE id = ANY($1)`, [reporterIds]);
    const userMap = new Map(usersResult.rows.map(user => [user.id, user]));
    return issues.map(issue => ({
        ...issue,
        reporter: userMap.get(issue.reporter_id) || null
    }));
};
//getSingleIssuefromDB
const getSingleIssuefromDB = async (id) => {
    const issueResult = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id]);
    const issue = issueResult.rows[0];
    //console.log(issue.reporter_id);
    const userResult = await pool.query(`SELECT id, name, role FROM users WHERE id = $1`, [issue.reporter_id]);
    const reporter = userResult.rows[0] || null;
    // console.log(reporter);
    return {
        ...issue,
        reporter
    };
};
const updateIssueIntoDB = async (id, payload, user) => {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
    const issue = issueResult.rows[0];
    // console.log(user);
    if (!issue) {
        throw new Error("Issue not found");
    }
    // 2. role-based authorization
    const isMaintainer = user.role === 'maintainer';
    const isOwner = issue.reporter_id === user.id;
    const isOpen = issue.status === "open";
    if (!isMaintainer) {
        //console.log("admin",isMaintainer)
        if (!isOwner) {
            //console.log('owner', isOwner);
            throw new Error("You can update only your own issue");
        }
        if (!isOpen) {
            throw new Error("You can update only 'open' issues");
        }
    }
    const { title, description, type, status } = payload;
    const result = await pool.query(`
        UPDATE issues 
        SET title=COALESCE($1, title), 
        description=COALESCE($2, title), 
        type=COALESCE($3, type),
        status=COALESCE($4, status)

        WHERE id=$5 RETURNING *
        
        `, [title, description, type, status, id]);
    // console.log("from updated page", result)
    return result;
};
const deleteIssuefromDB = async (id) => {
    const result = await pool.query(`
        DELETE FROM users WHERE id=$1 RETURNING *
        `, [id]);
    delete result.rows[0].password;
    return result;
};
export const issueService = {
    createIssueIntoDB,
    getAllIssueFromDB,
    getSingleIssuefromDB,
    updateIssueIntoDB,
    deleteIssuefromDB
};
//# sourceMappingURL=issue.service.js.map