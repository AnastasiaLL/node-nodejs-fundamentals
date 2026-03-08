import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import process from "process";
import zlib from "zlib";
import { pipeline } from "stream/promises";

const compressDir = async () => {
  const toCompressPath = path.join(process.cwd(), "workspace", "toCompress");
  const compressedDirPath = path.join(process.cwd(), "workspace", "compressed");
  const archivePath = path.join(compressedDirPath, "archive.br");
  
  try {
    await fsPromises.access(toCompressPath);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(compressedDirPath, { recursive: true });

  const files = [];
  
  const collectFiles = async (dir, relativePath = "") => {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await collectFiles(fullPath, entryRelativePath);
      } else if (entry.isFile()) {
        files.push({
          path: entryRelativePath,
          fullPath
        });
      }
    }
  };

  await collectFiles(toCompressPath);

  const brotli = zlib.createBrotliCompress();
  const writeStream = fs.createWriteStream(archivePath);

  for (const file of files) {
    const fileStream = fs.createReadStream(file.fullPath);
    const header = Buffer.from(`${file.path}\n`);
    writeStream.write(header);
    await pipeline(fileStream, brotli, { end: false });
  }

  brotli.end();
  await pipeline(brotli, writeStream);
};

await compressDir();
