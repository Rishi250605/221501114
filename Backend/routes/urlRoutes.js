const express = require('express');
const Url = require('../models/url');
const generateShortcode = require('../utils/generateShortcode');
const geoip = require('geoip-lite');
const { Log } = require('../middleware/logger');

const router = express.Router();

router.post('/shorturls', async (req, res) => {
    const { url, validity = 30, shortcode } = req.body;

    if (!url || typeof url !== 'string') {
        await Log("backend", "error", "handler", "Invalid URL format provided");
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    const expiryDate = new Date(Date.now() + validity * 60000);
    let finalCode = shortcode;

    if (shortcode) {
        const exists = await Url.findOne({ shortcode });
        if (exists) {
            await Log("backend", "warn", "db", "Shortcode already exists");
            return res.status(409).json({ error: 'Shortcode already exists' });
        }
    } else {
        finalCode = generateShortcode();
    }

    const newUrl = new Url({ originalUrl: url, shortcode: finalCode, expiresAt: expiryDate });
    await newUrl.save();

    await Log("backend", "info", "controller", `Short URL created for ${url}`);

    res.status(201).json({
        shortLink: `http://localhost:3000/${finalCode}`,
        expiry: expiryDate.toISOString(),
    });
});

router.get('/shorturls/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    const urlDoc = await Url.findOne({ shortcode });

    if (!urlDoc) {
        await Log("backend", "error", "handler", "Shortcode not found for stats");
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    res.json({
        originalUrl: urlDoc.originalUrl,
        createdAt: urlDoc.createdAt,
        expiresAt: urlDoc.expiresAt,
        clickCount: urlDoc.clicks.length,
        clicks: urlDoc.clicks,
    });
});

router.get('/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    const urlDoc = await Url.findOne({ shortcode });

    if (!urlDoc) {
        await Log("backend", "error", "handler", "Shortcode not found for redirect");
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    if (urlDoc.expiresAt < new Date()) {
        await Log("backend", "warn", "controller", "Shortcode expired");
        return res.status(410).json({ error: 'Link expired' });
    }

    const ip = req.ip;
    const geo = geoip.lookup(ip);

    urlDoc.clicks.push({
        timestamp: new Date(),
        referrer: req.headers.referer || 'direct',
        location: geo ? geo.country : 'unknown',
    });

    await urlDoc.save();
    await Log("backend", "info", "route", `Redirected to ${urlDoc.originalUrl}`);

    res.redirect(urlDoc.originalUrl);
});

module.exports = router;