"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const supabase_js_1 = require("@supabase/supabase-js");
const promises_1 = __importDefault(require("fs/promises"));
const utils_1 = require("./utils");
function getKey(directory, file) {
    const path = file.path ? `${file.path}/` : "";
    const fname = file.name.replace(/\.[^/.]+$/, "");
    const filename = `${path}${fname}_${file.hash}${file.ext}`;
    if (!directory)
        return filename;
    return `${directory}/${filename}`.replace(/^\//g, "");
}
const upload = async (file, supabase, apiUrl, clientBucket, clientDirectory) => new Promise(async (resolve, reject) => {
    file.hash = new Date().getTime();
    const fileKey = getKey(clientDirectory, file);
    if (!file.stream && !file.buffer) {
        reject(new Error('Missing file stream or buffer'));
        return;
    }
    try {
        let fileData;
        if (file.stream) {
            if (!file.stream.path) {
                reject(new Error('File stream path is missing'));
                return;
            }
            // If there's a stream, read the file data into a Buffer.
            fileData = await promises_1.default.readFile(file.stream.path);
            // ToDo  convert the ReadStream to a duplex stream using a package like duplexify, check if supabase support duplex stream
        }
        else if (file.buffer) {
            // If there's already a Buffer, use that.
            fileData = Buffer.from(file.buffer, "binary");
        }
        const uploadResponse = await supabase.storage
            .from(clientBucket)
            .upload(fileKey, fileData, {
            cacheControl: "public, max-age=31536000, immutable",
            upsert: true,
            contentType: file.mime,
        });
        console.log(uploadResponse);
        const { data, error } = await supabase.storage
            .from(clientBucket)
            .getPublicUrl(fileKey);
        if (error) {
            console.error("Error getting public URL:", error);
            reject(error);
            return;
        }
        console.log(data.publicUrl);
        file.url = data.publicUrl;
        resolve();
    }
    catch (error) {
        reject(error);
    }
});
module.exports = {
    init(providerOptions) {
        const { apiUrl, apiKey, bucket, directory, options } = providerOptions;
        const clientBucket = bucket || "strapi-uploads";
        let clientDirectory = (directory || "").replace(/(^\/)|(\/$)/g, "");
        const year = new Date().getFullYear().toString();
        const month = (new Date().getMonth() + 1).toString();
        if (!clientDirectory && (options === null || options === void 0 ? void 0 : options.dynamic_directory)) {
            clientDirectory = `${year}/${month}`;
        }
        const supabaseOptions = options;
        const supabase = (0, supabase_js_1.createClient)(apiUrl, apiKey, supabaseOptions);
        return {
            upload: (file) => upload(file, supabase, apiUrl, clientBucket, clientDirectory),
            uploadStream: (file) => upload(file, supabase, apiUrl, clientBucket, clientDirectory),
            delete: (file) => new Promise(async (resolve, reject) => {
                const fileKey = getKey(clientDirectory, file);
                const { data, error } = await supabase.storage
                    .from(clientBucket)
                    .remove([fileKey]);
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            }),
            //checkFileSize not implemented
            getSignedUrl: (file) => new Promise(async (resolve, reject) => {
                var _a;
                // Do not sign the url if it does not come from the same bucket.
                const fileOrigin = (0, utils_1.isUrlFromBucket)(file, bucket, apiUrl);
                if (!fileOrigin.bucket) {
                    console.warn(fileOrigin.err);
                    resolve({ url: file.url });
                }
                const fileKey = getKey(clientDirectory, file);
                const result = await supabase.storage
                    .from(clientBucket)
                    .createSignedUrl(fileKey, (options === null || options === void 0 ? void 0 : options.expiryMinutes) || 60, {
                    download: options === null || options === void 0 ? void 0 : options.download,
                    transform: options === null || options === void 0 ? void 0 : options.transform,
                });
                if (result.error) {
                    console.error(result.error);
                    resolve({ url: file.url });
                    return;
                }
                resolve({ url: ((_a = result.data) === null || _a === void 0 ? void 0 : _a.signedUrl) || '' });
            }),
            isPrivate: () => true,
        };
    },
};
/* WIP duplexify
let fileStream;

// Check if the file has a stream property
if (file.stream) {
  if (!file.stream.path) {
    // If the stream doesn't have a path, reject the promise
    reject(new Error('File stream path is missing'));
    return;
  }
  // If there's a stream, create a duplex stream from it
  fileStream = duplexify();
  const readStream = fs.createReadStream(file.stream.path);
  readStream.on('error', (err) => {
    fileStream.emit('error', err);
  });
  fileStream.setReadable(readStream);
} else if (file.buffer) {
  // If there's already a Buffer, use that
  fileStream = duplexify();
  fileStream.setReadable(Buffer.from(file.buffer, "binary"));
}

// Upload the file to Supabase
const uploadResponse = await supabase.storage
  .from(clientBucket)
  .upload(fileKey, fileStream, {
    cacheControl: "public, max-age=31536000, immutable",
    upsert: true,
    contentType: file.mime,
    //duplex: "???"
  });
 */
