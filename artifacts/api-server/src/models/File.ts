import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  fileId: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  ownerId: string;
  accessCode: string;
  originalName: string;
  mimeType: string;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  fileId: { type: String, required: true, unique: true, index: true },
  cloudinaryPublicId: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  ownerId: { type: String, required: true, index: true },
  accessCode: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const File = mongoose.model<IFile>("File", FileSchema);
