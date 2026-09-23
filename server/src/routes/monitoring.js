const express = require('express');
const logger = require('../config/logger');
const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: "ok" }));

router.post('/sentry-tunnel', express.raw({ type: "*/*", limit: "2mb" }), async (req, res) => {
    try {
        const envelope = req.body.toString("utf8");
        const [headerPiece] = envelope.split("\n");
        const header = JSON.parse(headerPiece);
        const dsn = new URL(header.dsn);
        const projectId = dsn.pathname.replace("/", "");

        if (dsn.host !== process.env.SENTRY_HOST) {
            return res.status(403).json({ error: "Disallowed target host" });
        }

        const sentryUrl = `https://${process.env.SENTRY_HOST}/api/${projectId}/envelope/`;
        const response = await fetch(sentryUrl, {
            method: "POST",
            body: req.body,
            headers: {
                "Content-Type": "application/x-sentry-envelope",
            }
        });

        res.status(response.status).send(await response.text());
    } catch (error) {
        logger.error({ error }, "Error in Sentry tunnel");
        res.status(500).json({ error: "Tunnel forwarding failed" });
    }
});

module.exports = router;