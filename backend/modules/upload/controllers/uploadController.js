import { successResponse, errorResponse } from '../../../shared/utils/response.js';
import { uploadToCloudinary } from '../../../shared/utils/cloudinaryService.js';

export const uploadSingleMedia = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No file provided');
    }

    const folder = req.body.folder || 'appzeto/uploads';

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'auto'
    });

    return successResponse(res, 200, 'File uploaded successfully', {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      bytes: result.bytes,
      format: result.format
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return errorResponse(res, 500, 'Failed to upload file');
  }
};


