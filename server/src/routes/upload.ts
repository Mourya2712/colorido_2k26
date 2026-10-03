import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
  dotenv.config({ path: path.join(process.cwd(), 'server/.env') });
}

const router = Router();

const BUCKET_NAME = 'audio-submissions';

// ── Supabase Storage client (uses service-role key for server-side uploads) ──
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ── Ensure bucket exists (idempotent, runs once) ───────────────────────────
let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady || !supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,          // private bucket — access via signed URLs
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'video/mp4'],
        fileSizeLimit: 26214400, // 25 MB
      });
      console.log(`✅ Supabase Storage bucket "${BUCKET_NAME}" created.`);
    }
    bucketReady = true;
  } catch (err: any) {
    console.warn('⚠️ Could not ensure Supabase bucket:', err?.message);
  }
}
ensureBucket().catch(() => {});

// ── Use memoryStorage — works on Vercel serverless (no writable disk) ─────
const memStorage = multer.memoryStorage();

// ── File filter: MP3, WAV, M4A ────────────────────────────────────────────
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.mp3', '.wav', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();

  const isAudioMime =
    file.mimetype.startsWith('audio/') ||
    file.mimetype === 'video/mp4' ||   // Some systems report .m4a as video/mp4
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
  storage: memStorage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
});

// ── POST /api/upload/audio ─────────────────────────────────────────────────
router.post(
  '/audio',
  upload.single('audio'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase() || '.mp3';
    const cleanBase = path
      .basename(req.file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 60);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filename = `${cleanBase}_${uniqueSuffix}${ext}`;

    // ── 1. Try Supabase Storage (production path) ──────────────────────────
    if (supabase) {
      try {
        await ensureBucket();
        const storagePath = `registrations/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase Storage upload error:', uploadError);
          throw new Error(uploadError.message);
        }

        // Generate a long-lived signed URL (10 years = enough for the event)
        const { data: signedData, error: signError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365 * 10);

        if (signError || !signedData?.signedUrl) {
          console.error('Supabase signed URL error:', signError);
          throw new Error(signError?.message || 'Could not create signed URL');
        }

        res.status(201).json({
          success: true,
          message: 'Audio file uploaded successfully',
          fileUrl: signedData.signedUrl,
          fileName: req.file.originalname,
          storagePath,
          file: {
            filename,
            original_name: req.file.originalname,
            size: req.file.size,
            mime_type: req.file.mimetype,
            url: signedData.signedUrl,
          },
        });
        return;
      } catch (err: any) {
        console.error('Supabase Storage upload failed, falling back to local:', err?.message);
        // Fall through to local /tmp fallback
      }
    }

    // ── 2. Local fallback — save to /tmp (works on Vercel cold-start debug) ─
    // NOTE: This fallback is for local dev only; /tmp files are ephemeral on Vercel.
    try {
      const tmpDir = process.env.VERCEL ? '/tmp/audio' : path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const fileUrl = process.env.VERCEL
        ? `/tmp/audio/${filename}` // ephemeral — won't survive function restarts
        : `/uploads/audio/${filename}`;

      res.status(201).json({
        success: true,
        message: 'Audio file uploaded (local storage)',
        fileUrl,
        fileName: req.file.originalname,
        file: {
          filename,
          original_name: req.file.originalname,
          size: req.file.size,
          mime_type: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (localErr: any) {
      console.error('Local audio upload also failed:', localErr?.message);
      res.status(500).json({ error: 'Audio upload failed. Please try again.' });
    }
  }
);

export default router;
