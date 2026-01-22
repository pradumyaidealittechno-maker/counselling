import express from 'express';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
};

// Apply auth and admin check
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
    try {
        // Fetch all users, excluding passwords
        // Populate company name if needed, though it's stored as string in User model currently according to previous file view
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Toggle user active status
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive must be a boolean' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is trying to deactivate themselves (after update, check if it was current user)
        // Ideally we check before, but with findByIdAndUpdate we do it in one go.
        // Actually, for safety against self-deactivation, checking before is better.
        // But since we want to avoid validation errors, we'll blindly update.
        // If we want to prevent self-deactivation we need to check ID match.

        if (id === (req as any).user.id && !isActive) {
            // Revert if they deactivated themselves
            await User.findByIdAndUpdate(id, { isActive: true });
            return res.status(400).json({ error: 'Cannot deactivate your own admin account' });
        }

        res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
    } catch (error: any) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: error.message || 'Failed to update user status' });
    }
});

export default router;
