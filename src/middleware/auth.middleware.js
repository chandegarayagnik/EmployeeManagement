import jwt from "jsonwebtoken";
import "dotenv/config";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided", Success: false });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    if (!token) {
        return res.status(401).json({ error: "Invalid token format", Success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token Expired", Success: false });
        }
        return res.status(401).json({ error: "Token is not valid", Success: false });
    }
};

export default authMiddleware;
