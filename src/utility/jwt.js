import jwt from 'jsonwebtoken';
import { env } from "../config/env.js";


export const generateJWTT = (Payload) => {
    // Set 1 month in seconds (30 days x 24 hours x 60 minutes x 60 seconds)
    const oneMonthInSeconds = 0 * 24 * 60 * 60; 
    return jwt.sign(Payload, env.JWT_SECRET, { expiresIn: oneMonthInSeconds });
};
