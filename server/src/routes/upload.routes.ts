import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadToS3 } from '../config/s3.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generic file upload endpoint (protected)
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { folder } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadFolder = folder || 'uploads';

    const result = await uploadToS3(
      file.buffer,
      uploadFolder,
      file.originalname,
      file.mimetype
    );

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
