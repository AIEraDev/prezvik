/**
 * Google Slides API Client
 *
 * Auth + API client setup
 * Uses Service Account for simplicity (OAuth for production)
 */

import { google } from "googleapis";

/**
 * Create authenticated Google Slides client
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account key
 */
export function createSlidesClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/presentations"],
  });

  return google.slides({ version: "v1", auth });
}

/**
 * Check if credentials are configured
 */
export function hasCredentials(): boolean {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
