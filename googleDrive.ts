/**
 * File storage helper - uses Manus built-in S3 storage
 * Replaces Google Drive integration with S3 storage via Manus API
 */

import { storagePut } from "./storage";

export interface UploadFileResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  url?: string;
  error?: string;
}

/**
 * Upload file to S3 storage
 * @param fileName File name for storage
 * @param fileBuffer File buffer to upload
 * @param mimeType File MIME type
 * @returns Upload result with URL
 */
async function uploadToS3(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<UploadFileResult> {
  try {
    const { url } = await storagePut(
      `uploads/${fileName}`,
      fileBuffer,
      mimeType
    );

    return {
      success: true,
      fileId: fileName,
      webViewLink: url,
      webContentLink: url,
      url: url,
    };
  } catch (error: any) {
    console.error("[S3 Storage] Upload failed:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

/**
 * Upload foto peserta to S3
 * @param contestantNumber Nomor peserta (e.g., "001-001")
 * @param photoBuffer Photo file buffer
 * @param mimeType Photo MIME type
 * @returns Upload result
 */
export async function uploadContestantPhoto(
  contestantNumber: string,
  photoBuffer: Buffer,
  mimeType: string
): Promise<UploadFileResult> {
  const extension = mimeType.split("/")[1] || "jpg";
  const fileName = `${contestantNumber}_photo.${extension}`;

  return uploadToS3(fileName, photoBuffer, mimeType);
}

/**
 * Upload KTP peserta to S3
 * @param contestantNumber Nomor peserta (e.g., "001-001")
 * @param ktpBuffer KTP file buffer
 * @param mimeType KTP MIME type
 * @returns Upload result
 */
export async function uploadContestantKTP(
  contestantNumber: string,
  ktpBuffer: Buffer,
  mimeType: string
): Promise<UploadFileResult> {
  const extension = mimeType.split("/")[1] || "jpg";
  const fileName = `${contestantNumber}_ktp.${extension}`;

  return uploadToS3(fileName, ktpBuffer, mimeType);
}

/**
 * Upload parental consent letter to S3
 * @param contestantNumber Nomor peserta (e.g., "001-001")
 * @param consentBuffer Parental consent file buffer
 * @param mimeType File MIME type
 * @returns Upload result
 */
export async function uploadParentalConsent(
  contestantNumber: string,
  consentBuffer: Buffer,
  mimeType: string
): Promise<UploadFileResult> {
  const extension = mimeType.split("/")[1] || "pdf";
  const fileName = `${contestantNumber}_parental_consent.${extension}`;

  return uploadToS3(fileName, consentBuffer, mimeType);
}

/**
 * Upload payment proof to S3
 * @param contestantNumber Nomor peserta (e.g., "001-001")
 * @param proofBuffer Payment proof file buffer
 * @param mimeType File MIME type
 * @returns Upload result
 */
export async function uploadPaymentProof(
  contestantNumber: string,
  proofBuffer: Buffer,
  mimeType: string
): Promise<UploadFileResult> {
  const extension = mimeType.split("/")[1] || "jpg";
  const fileName = `${contestantNumber}_payment_proof.${extension}`;

  return uploadToS3(fileName, proofBuffer, mimeType);
}

/**
 * Check if storage is configured
 * @returns True (S3 storage is always available in Manus)
 */
export function isGoogleDriveConfigured(): boolean {
  return true; // S3 storage is always available
}
