

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET"
];
requiredEnv.forEach((envKey) => {
  if (!process.env[envKey]) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }
});
var config = {
  port: Number(process.env.PORT ?? 5e3),
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.database_url,
  connectionTimeoutMillis: 5e3
});
var initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(30),
        email VARCHAR(30) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL
        CHECK (char_length(description) >= 20),

        type VARCHAR(20) NOT NULL
        CHECK (type IN ('bug', 'feature_request')),
        
        status VARCHAR(20) DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved')),

        reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
    `);
  console.log("Database Connected Successfully");
};

// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
var userRegisterIntDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
    INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    
    `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var userService = {
  userRegisterIntDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.userRegisterIntDB(req.body);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var usercontroller = {
  createUser
};

// src/modules/user/user.route.ts
var router = Router();
router.post("", usercontroller.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.controller.ts
import "console";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt from "jsonwebtoken";
var loginIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * from users WHERE email=$1
        
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    name: user.name,
    id: user.id,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(jwtPayload, config_default.jwt_secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { token, user };
};
var authService = {
  loginIntoDB
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginIntoDB(req.body);
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("", authController.loginUser);
var authRoute = router2;

// src/modules/issue/issue.route.ts
import { Router as Router3 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, reporter_id) => {
  const { title, description, type } = payload;
  const user = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [reporter_id]
  );
  if (user.rows.length === 0) {
    throw new Error("User no Exist!!");
  }
  const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) 
        VALUES($1, $2, $3, $4, $5) RETURNING *
        `, [title, description, type, "open", reporter_id]);
  return result;
};
var getAllIssueFromDB = async (query) => {
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
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;
  if (issues.length === 0) {
    return [];
  }
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );
  const userMap = new Map(
    usersResult.rows.map((user) => [user.id, user])
  );
  return issues.map((issue) => ({
    ...issue,
    reporter: userMap.get(issue.reporter_id) || null
  }));
};
var getSingleIssuefromDB = async (id) => {
  const issueResult = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        `, [id]);
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0] || null;
  return {
    ...issue,
    reporter
  };
};
var updateIssueIntoDB = async (id, payload, user) => {
  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  const isOpen = issue.status === "open";
  if (!isMaintainer) {
    if (!isOwner) {
      throw new Error(
        "You can update only your own issue"
      );
    }
    if (!isOpen) {
      throw new Error(
        "You can update only 'open' issues"
      );
    }
  }
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
        UPDATE issues 
        SET title=COALESCE($1, title), 
        description=COALESCE($2, title), 
        type=COALESCE($3, type),
        status=COALESCE($4, status)

        WHERE id=$5 RETURNING *
        
        `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssuefromDB = async (id) => {
  const result = await pool.query(`
        DELETE FROM users WHERE id=$1 RETURNING *
        `, [id]);
  delete result.rows[0].password;
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssuefromDB,
  updateIssueIntoDB,
  deleteIssuefromDB
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const user = req.user;
    const reporter_id = user.id;
    const result = await issueService.createIssueIntoDB(req.body, reporter_id);
    return sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issueService.getAllIssueFromDB(req.query);
    if (result.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: {}
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues Retrieved Successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await issueService.getSingleIssuefromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues Retrieved Successfully",
      data: result
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, type } = req.body;
  try {
    const result = await issueService.updateIssueIntoDB(id, req.body, req.user);
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues Updated Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssuefromDB(id);
    if (result.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues Deleted Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuecontroller = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.jwt_secret
      );
      const userData = await pool.query(`
            SELECT * from users WHERE email=$1
            `, [decoded.email]);
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User Not Found"
        });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access, This role can not access"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Invalid token"
      });
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/modules/issue/issue.route.ts
var router3 = Router3();
router3.post("", auth_default(USER_ROLE.maintainer, USER_ROLE.contributor), issuecontroller.createIssue);
router3.get("", issuecontroller.getAllIssue);
router3.get("/:id", issuecontroller.getSingleIssue);
router3.patch("/:id", auth_default(USER_ROLE.maintainer, USER_ROLE.contributor), issuecontroller.updateIssue);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issuecontroller.deleteIssue);
var issueRoute = router3;

// src/middleware/globalErrorHandler.ts
var globalErrohandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api/issues", issueRoute);
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Welcome to DevPulse",
    email: "devpulse@gmail.com",
    author: "Md Moniruzzaman"
  });
});
app.use(globalErrohandler);
var app_default = app;

// src/server.ts
var main = async () => {
  try {
    await initDB();
    app_default.listen(config_default.port, () => {
      console.log(`Example app listening on port ${config_default.port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
};
main();
//# sourceMappingURL=server.js.map