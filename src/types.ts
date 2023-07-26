import {TransformOptions} from "@supabase/storage-js/dist/module/lib/types";

export interface File {
  hash: number;
  buffer: Buffer;
  mime: string;
  name: string;
  ext: string;
  path?: string;
  url?: string;
  stream?: NodeJS.ReadableStream;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  size: number;
  previewUrl?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
}

export interface Config {
  apiUrl: string;
  apiKey: string;
  bucket?: string;
  directory?: string;
  options?: {
    dynamic_directory?: boolean;
    sizeLimit?: number;
    expiryMinutes?: number;
    download?: string | boolean;
    transform?: TransformOptions;
    [key: string]: any;
  };
}
