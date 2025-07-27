import multer from "multer";

// For generic uploads (PDFs, images, etc.)
export const upload = multer({
  storage: multer.memoryStorage(), // No disk writes
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// For strict PDF-only uploads (e.g., chatWithPDF)
export const pdfUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true); // Accept PDFs
    else cb(new Error("Only PDFs allowed"), false); // Reject non-PDFs
  },
});

// For strict image-only uploads (e.g., removeImageBackground)
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true); // Accept images
    else cb(new Error("Only images allowed"), false); // Reject non-images
  },
});