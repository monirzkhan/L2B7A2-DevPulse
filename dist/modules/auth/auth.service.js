import config from "../../config";
import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const loginIntoDB = async (payload) => {
    //console.log(payload);
    const { email, password } = payload;
    const userData = await pool.query(`
        SELECT * from users WHERE email=$1
        
        `, [email]);
    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials");
    }
    const user = userData.rows[0];
    // console.log(userData.rows[0])
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        throw new Error("Invalid Credentials");
    }
    //Token Generation
    const jwtPayload = {
        name: user.name,
        id: user.id,
        role: user.role,
        email: user.email
    };
    const token = jwt.sign(jwtPayload, config.jwt_secret, {
        expiresIn: "1d"
    });
    // const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret as string, {
    //     expiresIn: "10d"
    // })
    delete user.password;
    return { token, user };
};
export const authService = {
    loginIntoDB,
};
//# sourceMappingURL=auth.service.js.map