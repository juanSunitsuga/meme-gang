import path from 'path';
import fs from 'fs';

// Base paths
const BASE_UPLOAD_DIR = path.join(__dirname, '../../uploads');
const AVATARS_DIR = path.join(BASE_UPLOAD_DIR, 'avatars');
const POSTS_DIR = path.join(BASE_UPLOAD_DIR, 'posts');

// Create directories if they don't exist
const ensureDirectoriesExist = () => {
  [BASE_UPLOAD_DIR, AVATARS_DIR, POSTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this when your server starts
ensureDirectoriesExist();

// URL paths (how they're accessed from frontend)
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yoursite.com' 
  : 'http://localhost:3000';

const FILE_URLS = {
  AVATARS: `${BASE_URL}/uploads/avatars`,
  POSTS: `${BASE_URL}/uploads/posts`,
};

// Functions to generate paths

/**
 * Get the file system path for storing an avatar
 * @param filename The avatar filename
 * @returns The complete filesystem path
 */
export const getAvatarFilePath = (filename: string): string => {
  return path.join(AVATARS_DIR, filename);
};

/**
 * Get the file system path for storing a post image
 * @param filename The post image filename
 * @returns The complete filesystem path
 */
export const getPostFilePath = (filename: string): string => {
  return path.join(POSTS_DIR, filename);
};

/**
 * Get the URL for an avatar that can be used in frontend
 * @param filename The avatar filename
 * @returns The complete URL path
 */
export const getAvatarUrl = (filename: string): string => {
  return `${FILE_URLS.AVATARS}/${filename}`;
};

/**
 * Get the URL for a post image that can be used in frontend
 * @param filename The post image filename
 * @returns The complete URL path
 */
export const getPostImageUrl = (filename: string): string => {
  return `${FILE_URLS.POSTS}/${filename}`;
};

/**
 * Generate a unique filename for an uploaded file
 * @param originalFilename The original filename from the client
 * @returns A unique filename with timestamp
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const extension = path.extname(originalFilename);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Extract filename from a full URL
 * @param url The full URL of the file
 * @returns The filename
 */
export const getFilenameFromUrl = (url: string): string => {
  return url.split('/').pop() || '';
};

/**
 * Determine if a path is an avatar URL
 * @param url The URL to check
 * @returns boolean
 */
export const isAvatarUrl = (url: string): boolean => {
  return url.includes('/uploads/avatars/');
};

/**
 * Determine if a path is a post image URL
 * @param url The URL to check
 * @returns boolean
 */
export const isPostImageUrl = (url: string): boolean => {
  return url.includes('/uploads/posts/');
};

export default {
  ensureDirectoriesExist,
  getAvatarFilePath,
  getPostFilePath,
  getAvatarUrl,
  getPostImageUrl,
  generateUniqueFilename,
  getFilenameFromUrl,
  isAvatarUrl,
  isPostImageUrl,
};