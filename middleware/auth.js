const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ 
                message: "Authentication required",
                code: "NO_TOKEN"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Session expired, please login again",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(401).json({ 
            message: "Invalid token",
            code: "INVALID_TOKEN"
        });
    }
};

module.exports = { authenticateUser }; 