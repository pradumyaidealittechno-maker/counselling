import { Request, Response } from 'express';
import CounsellingResource from '../models/CounsellingResource.js';

// Get all resources
export const getResources = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.type) filter.type = req.query.type;

        const resources = await CounsellingResource.find(filter).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Create new resource
export const createResource = async (req: any, res: Response) => {
    try {
        const resource = await CounsellingResource.create({
            ...req.body,
            uploadedBy: req.user.id || req.user._id
        });
        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update resource
export const updateResource = async (req: Request, res: Response) => {
    try {
        const resource = await CounsellingResource.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete resource
export const deleteResource = async (req: Request, res: Response) => {
    try {
        const resource = await CounsellingResource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ message: 'Resource deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Track views/downloads
export const trackResourceUsage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'view' or 'download'

        const update = action === 'download'
            ? { $inc: { 'stats.downloads': 1 } }
            : { $inc: { 'stats.views': 1 } };

        await CounsellingResource.findByIdAndUpdate(id, update);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
