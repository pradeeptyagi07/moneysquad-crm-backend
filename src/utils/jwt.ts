import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "fxmobileapp";

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET);
};