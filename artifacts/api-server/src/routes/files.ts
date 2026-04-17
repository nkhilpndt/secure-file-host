import { Router, Request, Response } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { cloudinary } from "../lib/cloudinary";
import { File } from "../models/File";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { Readable } from "stream";

const router = Router();

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Only JPEG, PNG, WebP, GIF, and PDF are accepted."));
    }
  },
});

function generateAccessCode(): string {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function uploadToCloudinary(buffer: Buffer, options: object): Promise<{ public_id: string; secure_url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      if (!result) return reject(new Error("No result from Cloudinary"));
      resolve({ public_id: result.public_id, secure_url: result.secure_url });
    });
    bufferToStream(buffer).pipe(uploadStream);
  });
}

router.post("/upload", requireAuth, upload.single("file"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const fileId = nanoid(10);
  const accessCode = generateAccessCode();
  const resourceType = req.file.mimetype === "application/pdf" ? "raw" : "image";

  const { public_id, secure_url } = await uploadToCloudinary(req.file.buffer, {
    public_id: `fileshare/${fileId}`,
    resource_type: resourceType,
  });

  await File.create({
    fileId,
    cloudinaryPublicId: public_id,
    cloudinaryUrl: secure_url,
    ownerId: req.user!.userId,
    accessCode,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
  });

  res.status(201).json({ fileId, accessCode });
});

router.get("/file/:fileId", async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: "Access code is required" });
    return;
  }
  const file = await File.findOne({ fileId });
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  if (file.accessCode !== code) {
    res.status(403).json({ error: "Invalid access code" });
    return;
  }
  res.redirect(file.cloudinaryUrl);
});

router.delete("/file/:fileId", requireAuth, async (req: AuthRequest, res: Response) => {
  const { fileId } = req.params;
  const file = await File.findOne({ fileId });
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  if (file.ownerId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const resourceType = file.mimeType === "application/pdf" ? "raw" : "image";
  await cloudinary.uploader.destroy(file.cloudinaryPublicId, { resource_type: resourceType });
  await File.deleteOne({ fileId });
  res.json({ message: "File deleted" });
});

router.get("/my-files", requireAuth, async (req: AuthRequest, res: Response) => {
  const files = await File.find({ ownerId: req.user!.userId }).sort({ createdAt: -1 });
  res.json(files.map(f => ({
    fileId: f.fileId,
    originalName: f.originalName,
    mimeType: f.mimeType,
    accessCode: f.accessCode,
    createdAt: f.createdAt,
  })));
});

export default router;
