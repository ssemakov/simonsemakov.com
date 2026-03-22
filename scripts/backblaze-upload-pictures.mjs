#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
  ".heif",
]);

const MIME_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

function printHelp() {
  console.log(`
Upload local pictures from a folder to Backblaze B2.

Usage:
  backblaze-upload-pictures.mjs --source <folder> --bucket <bucket-name> --key-id <id> --application-key <key> [options]

Required:
  -s, --source <folder>             Local folder that contains pictures
  -b, --bucket <bucket-name>        Target B2 bucket name
      --key-id <id>                 Backblaze key ID (or B2_KEY_ID env var)
      --application-key <key>       Backblaze application key (or B2_APPLICATION_KEY env var)

Options:
  -p, --prefix <path>               Optional key prefix inside bucket (example: photos/2026)
      --auth-url <url>              B2 auth URL (default: https://api.backblazeb2.com/b2api/v2/b2_authorize_account)
      --dry-run                     Show what would upload without sending files
  -h, --help                        Show this help

Examples:
  backblaze-upload-pictures.mjs -s ./photos -b my-bucket --key-id <id> --application-key <key>
  backblaze-upload-pictures.mjs -s ./photos -b my-bucket --key-id <id> --application-key <key> -p gallery/2026 --dry-run
  `);
}

function parseArgs(argv) {
  const args = {
    source: "",
    bucket: "",
    prefix: "",
    keyId: process.env.B2_KEY_ID || "",
    applicationKey: process.env.B2_APPLICATION_KEY || "",
    authUrl: "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case "-s":
      case "--source":
        if (!next) throw new Error(`${arg} requires a value`);
        args.source = next;
        i += 1;
        break;
      case "-b":
      case "--bucket":
        if (!next) throw new Error(`${arg} requires a value`);
        args.bucket = next;
        i += 1;
        break;
      case "-p":
      case "--prefix":
        if (!next) throw new Error(`${arg} requires a value`);
        args.prefix = next;
        i += 1;
        break;
      case "--key-id":
        if (!next) throw new Error(`${arg} requires a value`);
        args.keyId = next;
        i += 1;
        break;
      case "--application-key":
        if (!next) throw new Error(`${arg} requires a value`);
        args.applicationKey = next;
        i += 1;
        break;
      case "--auth-url":
        if (!next) throw new Error(`${arg} requires a value`);
        args.authUrl = next;
        i += 1;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "-h":
      case "--help":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  args.prefix = args.prefix.replace(/^\/+|\/+$/g, "");
  return args;
}

async function sha1File(filePath) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha1");
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function toB2FileName(key) {
  return encodeURIComponent(key).replace(/%2F/g, "/");
}

function extToMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXTENSION[ext] || "b2/x-auto";
}

async function listImageFiles(root) {
  const files = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      files.push(fullPath);
    }
  }

  await walk(root);
  return files.sort((a, b) => a.localeCompare(b));
}

async function authorizeAccount(keyId, applicationKey, authUrl) {
  const basic = Buffer.from(`${keyId}:${applicationKey}`).toString("base64");
  const res = await fetch(authUrl, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basic}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Authorization failed (${res.status}): ${text}`);
  }

  return await res.json();
}

async function findBucket(apiUrl, authToken, accountId, bucketName) {
  const res = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
    method: "POST",
    headers: {
      Authorization: authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      bucketName,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bucket lookup failed (${res.status}): ${text}`);
  }

  const body = await res.json();
  const bucket = body.buckets?.find((item) => item.bucketName === bucketName);
  if (!bucket) {
    throw new Error(`Bucket not found: ${bucketName}`);
  }
  return bucket;
}

async function getUploadEndpoint(apiUrl, authToken, bucketId) {
  const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: authToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get upload URL (${res.status}): ${text}`);
  }

  return await res.json();
}

async function uploadSingleFile(filePath, key, uploadUrl, uploadAuthToken) {
  const [sha1, contentBuffer, stat] = await Promise.all([
    sha1File(filePath),
    fs.readFile(filePath),
    fs.stat(filePath),
  ]);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadAuthToken,
      "X-Bz-File-Name": toB2FileName(key),
      "Content-Type": extToMime(filePath),
      "Content-Length": String(stat.size),
      "X-Bz-Content-Sha1": sha1,
    },
    body: contentBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed for "${filePath}" (${res.status}): ${text}`);
  }

  return await res.json();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (!args.source || !args.bucket) {
    throw new Error("--source and --bucket are required");
  }
  if (!args.keyId || !args.applicationKey) {
    throw new Error("--key-id and --application-key are required (or set B2_KEY_ID and B2_APPLICATION_KEY)");
  }

  const sourcePath = path.resolve(args.source);
  const sourceStat = await fs.stat(sourcePath).catch(() => null);
  if (!sourceStat || !sourceStat.isDirectory()) {
    throw new Error(`Source folder not found: ${sourcePath}`);
  }

  const files = await listImageFiles(sourcePath);
  if (files.length === 0) {
    console.log(`No images found in ${sourcePath}`);
    return;
  }

  console.log(`Source:      ${sourcePath}`);
  console.log(`Bucket:      ${args.bucket}`);
  if (args.prefix) console.log(`Prefix:      ${args.prefix}`);
  if (args.dryRun) console.log("Mode:        dry-run");
  console.log(`Images:      ${files.length}`);

  if (args.dryRun) {
    for (const absFile of files) {
      const relative = path
        .relative(sourcePath, absFile)
        .split(path.sep)
        .join("/");
      const objectKey = args.prefix ? `${args.prefix}/${relative}` : relative;
      console.log(`Would upload: ${absFile} -> ${objectKey}`);
    }
    return;
  }

  const auth = await authorizeAccount(args.keyId, args.applicationKey, args.authUrl);
  const bucket = await findBucket(
    auth.apiUrl,
    auth.authorizationToken,
    auth.accountId,
    args.bucket,
  );
  let uploadEndpoint = await getUploadEndpoint(
    auth.apiUrl,
    auth.authorizationToken,
    bucket.bucketId,
  );

  let uploaded = 0;
  for (const absFile of files) {
    const relative = path
      .relative(sourcePath, absFile)
      .split(path.sep)
      .join("/");
    const objectKey = args.prefix ? `${args.prefix}/${relative}` : relative;

    try {
      await uploadSingleFile(
        absFile,
        objectKey,
        uploadEndpoint.uploadUrl,
        uploadEndpoint.authorizationToken,
      );
      uploaded += 1;
      console.log(`[${uploaded}/${files.length}] Uploaded: ${objectKey}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("(401)")) {
        uploadEndpoint = await getUploadEndpoint(
          auth.apiUrl,
          auth.authorizationToken,
          bucket.bucketId,
        );
        await uploadSingleFile(
          absFile,
          objectKey,
          uploadEndpoint.uploadUrl,
          uploadEndpoint.authorizationToken,
        );
        uploaded += 1;
        console.log(`[${uploaded}/${files.length}] Uploaded: ${objectKey}`);
      } else {
        throw error;
      }
    }
  }

  console.log(`Upload completed. Uploaded ${uploaded} image(s).`);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
