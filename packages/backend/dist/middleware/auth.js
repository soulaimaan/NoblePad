"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    // Mock auth middleware
    // In production, verify JWT or Supabase session
    const token = req.headers.authorization;
    if (!token) {
        // For development/demo, maybe allow without token or check for specific mock token
        // return res.status(401).json({ error: 'Unauthorized' })
    }
    next();
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map