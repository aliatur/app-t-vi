"use strict";
/**
 * API Service - RESTful API for Tử Vi calculation
 *
 * This module provides HTTP endpoints for:
 * - Calculating birth chart from solar date/time
 * - Validating input data
 * - Getting lunar date information
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const calculation_service_1 = require("../services/calculation-service");
const PORT = parseInt(process.env.PORT || '3000', 10);
const PUBLIC_DIR = path_1.default.join(__dirname, '../../public');
/**
 * Parse JSON body from request
 */
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            }
            catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}
/**
 * Send JSON response
 */
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
}
/**
 * CORS headers
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
}
/**
 * Request handler
 */
async function handleRequest(req, res) {
    setCorsHeaders(res);
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    // GET /health - Health check endpoint
    if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
        return;
    }
    // POST /api/calculate - Calculate birth chart
    if (req.method === 'POST' && url.pathname === '/api/calculate') {
        try {
            const body = await parseBody(req);
            // Validate API key if provided (Bring-Your-Own-Key model)
            const apiKey = req.headers['x-api-key'];
            if (process.env.REQUIRE_API_KEY && !apiKey) {
                const error = {
                    error: 'API key required',
                    code: 'MISSING_API_KEY',
                    details: 'Please provide X-API-Key header or set REQUIRE_API_KEY=false'
                };
                sendJson(res, 401, error);
                return;
            }
            // Validate input
            const validation = (0, calculation_service_1.validateBirthData)(body);
            if (!validation.valid) {
                const error = {
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.errors
                };
                sendJson(res, 400, error);
                return;
            }
            // Calculate birth chart
            const result = (0, calculation_service_1.calculateBirthChart)(body);
            sendJson(res, 200, result);
        }
        catch (error) {
            const err = error;
            const errorResponse = {
                error: err.message,
                code: 'CALCULATION_ERROR',
                details: err.stack
            };
            sendJson(res, 500, errorResponse);
        }
        return;
    }
    // POST /api/validate - Validate input without calculating
    if (req.method === 'POST' && url.pathname === '/api/validate') {
        try {
            const body = await parseBody(req);
            const validation = (0, calculation_service_1.validateBirthData)(body);
            sendJson(res, 200, validation);
        }
        catch (error) {
            const err = error;
            const errorResponse = {
                error: err.message,
                code: 'VALIDATION_ERROR'
            };
            sendJson(res, 500, errorResponse);
        }
        return;
    }
    // GET / - Serve static HTML file
    if (req.method === 'GET' && url.pathname === '/') {
        const indexPath = path_1.default.join(PUBLIC_DIR, 'index.html');
        try {
            if (fs_1.default.existsSync(indexPath)) {
                const html = fs_1.default.readFileSync(indexPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
                return;
            }
        }
        catch (e) {
            // Fall through to API docs
        }
        // Fallback to API documentation
        const docs = {
            name: 'Tử Vi Calculator API',
            version: '1.0.0',
            description: 'API for calculating Vietnamese astrological birth charts using TuviGLOBAL standard',
            endpoints: {
                'GET /health': 'Health check',
                'POST /api/calculate': 'Calculate birth chart',
                'POST /api/validate': 'Validate input data'
            },
            example_request: {
                solar_date: '09/06/2009',
                solar_time: '23:03',
                birthplace: 'Hồ Chí Minh',
                gender: 'male',
                fullName: 'Nguyễn Văn A'
            },
            authentication: {
                header: 'X-API-Key',
                note: 'Set REQUIRE_API_KEY=true to enforce API key validation'
            }
        };
        sendJson(res, 200, docs);
        return;
    }
    // GET /index.html - Serve static HTML file
    if (req.method === 'GET' && url.pathname === '/index.html') {
        const indexPath = path_1.default.join(PUBLIC_DIR, 'index.html');
        try {
            if (fs_1.default.existsSync(indexPath)) {
                const html = fs_1.default.readFileSync(indexPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(html);
                return;
            }
        }
        catch (e) {
            // Ignore
        }
    }
    // 404 for unknown routes
    const error = {
        error: 'Not Found',
        code: 'ROUTE_NOT_FOUND',
        details: `Unknown route: ${req.method} ${url.pathname}`
    };
    sendJson(res, 404, error);
}
/**
 * Create and start server
 */
function startServer(port = PORT) {
    const server = http_1.default.createServer(handleRequest);
    server.listen(port, () => {
        console.log(`🔮 Tử Vi Calculator API running on http://localhost:${port}`);
        console.log(`   - GET  /health       - Health check`);
        console.log(`   - POST /api/calculate - Calculate birth chart`);
        console.log(`   - POST /api/validate  - Validate input`);
        console.log(`   - GET  /             - API documentation`);
        console.log(`\n   Environment:`);
        console.log(`   - REQUIRE_API_KEY: ${process.env.REQUIRE_API_KEY || 'false'}`);
        console.log(`   - PORT: ${port}`);
    });
    return server;
}
// Start server if run directly
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map