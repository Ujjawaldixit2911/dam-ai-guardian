const { User } = require('../database/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, role, status, organization } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Create new user (password will be hashed by pre-save hook)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      department: organization,
      role: role || 'viewer', // Default role
      status: status || 'pending'
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          organization: user.department
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Auto-approve Firebase users who might be stuck in pending
    if (user.status === 'pending') {
      if (password.startsWith('GoogleAuth#')) {
        user.status = 'approved';
        await user.save();
      } else {
        return res.status(403).json({ 
          success: false, 
          message: 'Account pending admin approval.' 
        });
      }
    }
    
    // Update last login
    user.lastLogin = new Date();
    
    // Generate token
    const token = generateToken(user);
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          organization: user.department
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        organization: user.department,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phoneNumber, email, organization } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if new email/username already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
      user.email = email;
    }
    
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already in use' 
        });
      }
      user.username = username;
    }
    
    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber;
    }
    
    if (organization !== undefined) {
      user.department = organization;
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        organization: user.department
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role is required' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      data: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deactivate user (admin only)
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User deactivated successfully' 
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending users (admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user status (admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `User status updated to ${status}`,
      data: { id: user._id, status: user.status }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'hydrolake-secret-key-2024',
    { expiresIn: '7d' }
  );
}

module.exports = exports;
