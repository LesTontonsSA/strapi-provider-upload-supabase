//const ENDPOINT_PATTERN = /^(.+\.)?s3[.-]([a-z0-9-]+)\./;

import {File} from "./types";

interface BucketInfo {
  bucket?: string | null;
  err?: string;
}

export function isUrlFromBucket(file: File, bucketName: string, apiUrl = '') {
  const url = new URL(file.url);
  const matches = file.url.includes(apiUrl);
  if (!matches) {
    return { err: `Invalid S3 url: hostname does not appear to be a valid S3 endpoint: ${url}` };
  }

  // File URL should be of an S3-compatible provider.
  // Check if the bucket name appears in the URL host or path.
  // e.g. https://minio.example.com/bucket-name/object-key
  // e.g. https://bucket.nyc3.digitaloceanspaces.com/folder/img.png
  const bucketIsValid = url.host.startsWith(`${bucketName}.`) || url.pathname.includes(`/${bucketName}/`)
  return { err: !bucketIsValid, bucket: bucketIsValid ? bucketName : null};
}
