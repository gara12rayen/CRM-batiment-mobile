/**
 * Types et interfaces pour le module Scan de documents multi-pages (Binôme 1B - Socle Outils Communs).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface DocumentCorners {
  topLeft: Point2D;
  topRight: Point2D;
  bottomRight: Point2D;
  bottomLeft: Point2D;
}

export type DocumentFilterType =
  | "original"
  | "bw_enhanced"
  | "grayscale"
  | "magic_color";

export type CompressionLevel = "low" | "medium" | "high";

export interface CompressionSettings {
  level: CompressionLevel;
  label: string;
  jpegQuality: number;
  maxDimension: number;
  estimatedSizePerPageKb: number;
}

export interface ScannedPage {
  id: string;
  pageNumber: number;
  originalUri: string;
  processedUri: string;
  corners: DocumentCorners;
  filter: DocumentFilterType;
  rotation: 0 | 90 | 180 | 270;
  width: number;
  height: number;
  detectedConfidence: number; // 0 à 100%
  createdAt: number;
}

export interface DocumentScanSession {
  id: string;
  title: string;
  pages: ScannedPage[];
  status: "idle" | "capturing" | "cropping" | "previewing" | "exporting" | "completed";
  currentPageIndex: number;
  compressionLevel: CompressionLevel;
  createdAt: number;
  updatedAt: number;
}

export interface ScanPdfResult {
  fileUri: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pages: ScannedPage[];
  compressionLevel: CompressionLevel;
  createdAt: number;
}

export interface DocumentScanOptions {
  maxPages?: number;
  defaultFilter?: DocumentFilterType;
  defaultCompression?: CompressionLevel;
  title?: string;
  allowGallery?: boolean;
  mockMode?: boolean;
}
