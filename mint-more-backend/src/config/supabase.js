const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const logger = require('../utils/logger');

if (!env.supabase.url || !env.supabase.serviceKey) {
  throw new Error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}

/**
 * Service-role client — bypasses RLS.
 * ONLY use server-side. Never expose the service key to the frontend.
 */
const supabase = createClient(env.supabase.url, env.supabase.serviceKey, {
  auth: { persistSession: false },
});

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param {string} bucket     - Storage bucket name (e.g. 'avatars', 'kyc-docs')
 * @param {string} filePath   - Path inside bucket (e.g. 'user-id/front.jpg')
 * @param {Buffer} buffer     - File buffer from multer memoryStorage
 * @param {string} mimeType   - MIME type of the file
 * @returns {string}          - Public URL of the uploaded file
 */
const uploadFile = async (bucket, filePath, buffer, mimeType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true, // overwrite if exists (e.g. re-uploading avatar)
    });

  if (error) {
    logger.error('Supabase Storage upload failed', { bucket, filePath, error: error.message });
    throw new Error(`File upload failed: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Delete a file from Supabase Storage.
 */
const deleteFile = async (bucket, filePath) => {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    logger.warn('Supabase Storage delete failed', { bucket, filePath, error: error.message });
  }
};

module.exports = { supabase, uploadFile, deleteFile };