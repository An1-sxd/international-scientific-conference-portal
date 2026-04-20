import multer from "multer";

import { sendError } from "../routes/public/helpers.js";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const createUploadMiddleware = (filter, maxSizeMB) => {
  const limits = { fileSize: maxSizeMB * 1024 * 1024 };
  const upload = multer({ storage, fileFilter: filter, limits });

  return (field) => {
    return (req, res, next) => {
      upload.single(field)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return sendError(res, 400, `Upload error: ${err.message}`);
        } else if (err) {
          return sendError(res, 400, err.message);
        }
        next();
      });
    };
  };
};

export const uploadPhoto = createUploadMiddleware(imageFileFilter, 5); // 5MB limit
export const uploadPdf = createUploadMiddleware(pdfFileFilter, 10); // 10MB limit
