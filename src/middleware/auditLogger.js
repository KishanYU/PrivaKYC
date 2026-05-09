const crypto = require('crypto');
const { logToAuditTrail } = require('../modules/sponsor');

const auditLogger = async (req, res, next) => {
  const start = Date.now();
  const chunks = [];

  const originalJson = res.json.bind(res);

  res.json = (body) => {
    const durationMs = Date.now() - start;
    const safeBody = body && typeof body === 'object' ? { ...body } : body;

    try {
      const requestSnapshot = {
        method: req.method,
        path: req.originalUrl,
        durationMs,
        statusCode: res.statusCode || 200,
      };

      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ body: req.body, query: req.query, params: req.params }))
        .digest('hex');

      logToAuditTrail({
        ...requestSnapshot,
        requestHash: hash,
      }).catch(() => {});
    } catch {
      // Never block the response on audit errors
    }

    return originalJson(safeBody);
  };

  next();
};

module.exports = auditLogger;

