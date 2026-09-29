import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure audio uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'audio');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${ext}`);
  },
});

// File filter: MP3, WAV, M4A
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.mp3', '.wav', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  const isAudioMime = file.mimetype.startsWith('audio/') || 
                      file.mimetype === 'video/mp4' || // Some systems report .m4a as video/mp4
                      file.mimetype === 'audio/mp4' ||
                      file.mimetype === 'audio/mpeg' ||
                      file.mimetype === 'audio/wav' ||
                      file.mimetype === 'audio/x-m4a';

  if (allowedExtensions.includes(ext) || isAudioMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio file format. Only MP3, WAV, and M4A files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB limit
  },
});

// POST /api/upload/audio
router.post(
  '/audio',
  upload.single('audio'),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' });
      return;
    }

    const fileUrl = `/uploads/audio/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Audio file uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
      file: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        size: req.file.size,
        mime_type: req.file.mimetype,
        url: fileUrl,
      },
    });
  }
);

export default router;
