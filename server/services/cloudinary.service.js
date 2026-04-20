import cloudinary from "../config/cloudinary.js";

/**
 * Uploads a file buffer to Cloudinary via upload_stream
 * @param {Buffer} fileBuffer - The file buffer from Multer
 * @param {string} folder - The Cloudinary folder to store the asset
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<object>} Returns { url, publicId }
 */
export const uploadBuffer = (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary
 * @param {string} publicId - The public ID of the asset
 * @returns {Promise<void>}
 */
export const deleteAsset = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Cloudinary delete error for ${publicId}:`, error);
  }
};
