const secretManager = require('../services/secretManager');

/**
 * Enhanced authentication controller with secure secret management
 */
const User = require("../../models/auth/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require('crypto');

// Generate secure admin key from secret manager
let validAdminKey = null;

async function getValidAdminKey() {
  if (!validAdminKey) {
    try {
      validAdminKey = await secretManager.getSecret('ADMIN_KEY');
    } catch (error) {
      // Generate a secure admin key if not found
      validAdminKey = crypto.randomBytes(32).toString('hex');
      await secretManager.setSecret('ADMIN_KEY', validAdminKey);
      console.log('🔑 Generated new secure admin key');
    }
  }
  return validAdminKey;
}

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role, adminKey } = req.body;

  try {
    // Validate admin key if the role is admin
    if (role === "admin") {
      const validKey = await getValidAdminKey();
      if (adminKey !== validKey) {
        return res.status(400).json({ msg: "Invalid admin key" });
      }
    }

    let user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ username, password, role });
    await user.save();

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
    };

    // Get JWT secret from secret manager
    const jwtSecret = await secretManager.getSecret('JWT_SECRET');
    
    jwt.sign(payload, jwtSecret, { expiresIn: "30d" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
    };

    // Get JWT secret from secret manager
    const jwtSecret = await secretManager.getSecret('JWT_SECRET');
    
    jwt.sign(payload, jwtSecret, { expiresIn: "30d" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Endpoint to get admin key for authorized users (development only)
exports.getAdminKey = async (req, res) => {
  try {
    // Only allow in development environment
    const nodeEnv = await secretManager.getSecret('NODE_ENV');
    if (nodeEnv === 'production') {
      return res.status(403).json({ msg: "Admin key access not allowed in production" });
    }

    // Require existing admin authentication
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const adminKey = await getValidAdminKey();
    res.json({ adminKey });
  } catch (error) {
    console.error('Error getting admin key:', error.message);
    res.status(500).json({ msg: "Server error" });
  }
};