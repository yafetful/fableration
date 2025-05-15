import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import { authenticate } from '../middleware/auth.js';

dotenv.config();
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check for existing user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }
    
    // Validate password
    const isMatch = bcrypt.compareSync(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return user and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check token validity route
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({ valid: false });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: verified });
  } catch (error) {
    res.json({ valid: false });
  }
});

// Change password route (protected)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user from database
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update user password
    await db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 