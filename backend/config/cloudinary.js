import { v2 as cloudinary } from 'cloudinary';

// Normalize env values (trim quotes if present)
function cleanEnv(value) {
  if (!value || typeof value !== 'string') return value;
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

const CLOUDINARY_CLOUD_NAME = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
const CLOUDINARY_API_KEY = cleanEnv(process.env.CLOUDINARY_API_KEY);
const CLOUDINARY_API_SECRET = cleanEnv(process.env.CLOUDINARY_API_SECRET);

// Basic validation – we don't exit the process, but log a clear warning
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    '⚠️  Cloudinary is not fully configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend .env'
  );
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
}

export { cloudinary };


