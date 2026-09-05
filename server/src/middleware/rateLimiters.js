
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const getKey = (req) => {
    if (req.user?.id) {
        return `user_${req.user.id}`;
    }

    return ipKeyGenerator(req);
};

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    message: {
        error: "Too many tries, please try again after 15 minutes"
    }
});

const moderateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    message: {
        error: "Too many tries, please try again after 15 minutes"
    }
});

const relaxedLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getKey,
    message: {
        error: "Too many requests, please try again later"
    }
});

module.exports = {
    strictLimiter,
    moderateLimiter,
    relaxedLimiter
};