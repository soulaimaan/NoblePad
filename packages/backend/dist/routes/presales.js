"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PresaleService_1 = require("../services/PresaleService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const presaleService = new PresaleService_1.PresaleService();
// Get all presales
router.get('/', async (req, res) => {
    const { status, chain_id, search, page, limit } = req.query;
    const result = await presaleService.listPresales({
        status: status,
        chain_id: chain_id ? parseInt(chain_id) : undefined,
        search: search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20
    });
    if (result.success) {
        res.json(result.data);
    }
    else {
        res.status(500).json({ error: result.error });
    }
});
// Get presale by ID
router.get('/:id', async (req, res) => {
    const result = await presaleService.getPresale(req.params.id);
    if (result.success) {
        res.json(result.data);
    }
    else {
        res.status(404).json({ error: result.error });
    }
});
// Create presale (protected)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const result = await presaleService.createPresale(req.body);
    if (result.success) {
        res.status(201).json(result.data);
    }
    else {
        res.status(400).json({ error: result.error });
    }
});
// Update presale status (protected, maybe admin only or owner?)
// For now, let's assume it's for updating deployment status
router.patch('/:id/status', auth_1.authMiddleware, async (req, res) => {
    const { status, txHash } = req.body;
    const result = await presaleService.updatePresaleStatus(req.params.id, status, txHash);
    if (result.success) {
        res.json({ success: true });
    }
    else {
        res.status(400).json({ error: result.error });
    }
});
exports.default = router;
//# sourceMappingURL=presales.js.map