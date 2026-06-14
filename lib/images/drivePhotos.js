/**
 * lib/images/drivePhotos.js
 *
 * Central map of all static site photos → Google Drive file IDs.
 *
 * HOW TO SET UP:
 * 1. Upload each photo to your Google Drive folder (the same folder
 *    used by the admin gallery uploader, GOOGLE_DRIVE_FOLDER_ID).
 * 2. Right-click the file → "Get link" → set to "Anyone with the link".
 * 3. Copy the file ID from the share URL:
 *    https://drive.google.com/file/d/FILE_ID_HERE/view
 * 4. Paste the FILE_ID below for the matching key.
 *
 * The helper getPhoto(key) returns the direct-embed URL used by Next.js <Image>.
 * Falls back to a local path if the Drive ID is not yet filled in.
 */

const DRIVE_PHOTOS = {
  "food-distribution-1": "19yTPH4bAoQV73pto8wqkezrzSl4gxcRb",   // replace with Google Drive file ID
  "food-distribution-2": "1Krj-QSR5Nj0SFk6Bm7UxxRYM79BjKDJx",
  "food-distribution-3": "1Qx9SgrDIkKwuNSRUJPmiG015TNrnFZwo",
  "education-support":   "1yWELQmV5Ap46uWkyg8VoNbZX6gJtcBvN",
  "grocery-support":     "129UTn2sQLRt9LUEjX8MhvvLUdDSZtvat",
  "orphanage-care":      "18Ii53gteYyjtzMRFsnq6GAI3v58Kgg0v",
  "old-age-care":        "1B26fMtQJ7H33c-wpcKLIbXmPzoMIWBrJ",
  "medical-support":     "1_M4LmmLsgaowEnjhDkPij6OXBpwZOVat",
};

/**
 * Returns the best available URL for a named photo.
 * - If a Drive ID is configured, uses the Drive thumbnail/embed URL.
 * - If not yet configured, falls back to the local /photos/ path so
 *   the site still works during setup.
 *
 * @param {string} key  — one of the keys above (without extension)
 * @param {number} [size=800] — requested pixel width for Drive thumbnail
 */
export function getPhoto(key, size = 800) {
  const id = DRIVE_PHOTOS[key];
  if (id) {
    // Drive thumbnail URL — works for publicly shared files
    return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
  }
  // Fallback to bundled /public/photos/ during initial setup
  const EXT = {
    "food-distribution-1": "jpg",
    "food-distribution-2": "jpg",
    "food-distribution-3": "jpg",
    "education-support":   "jpg",
    "grocery-support":     "jpeg",
    "orphanage-care":      "jpeg",
    "old-age-care":        "jpeg",
    "medical-support":     "jpeg",
  };
  return `/photos/${key}.${EXT[key] || "jpg"}`;
}

export default DRIVE_PHOTOS;
