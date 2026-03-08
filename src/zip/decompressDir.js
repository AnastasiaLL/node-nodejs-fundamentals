import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import process from "process";
import zlib from "zlib";
import { pipeline } from "stream/promises";

const decompressDir = async () => {
  const compressedDirPath = path.join(process.cwd(), "workspace", "compressed");
  const archivePath = path.join(compressedDirPath, "archive.br");
  const decompressedPath = path.join(process.cwd(), "workspace", "decompressed");
  
  try {
    await fsPromises.access(compressedDirPath);
    await fsPromises.access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(decompressedPath, { recursive: true });

  const brotli = zlib.createBrotliDecompress();
  const readStream = fs.createReadStream(archivePath);
  
  let currentFile = null;
  let currentFilePath = "";
  let isReadingHeader = true;
  let headerBuffer = "";

  brotli.on("data", (chunk) => {
    const data = chunk.toString();
    
    if (isReadingHeader) {
      headerBuffer += data;
      const newlineIndex = headerBuffer.indexOf("\n");
      
      if (newlineIndex !== -1) {
        currentFilePath = headerBuffer.substring(0, newlineIndex);
        headerBuffer = headerBuffer.substring(newlineIndex + 1);
        isReadingHeader = false;
        
        const fullPath = path.join(decompressedPath, currentFilePath);
        const dirPath = path.dirname(fullPath);
        
        fsPromises.mkdir(dirPath, { recursive: true }).then(() => {
          currentFile = fs.createWriteStream(fullPath);
          if (headerBuffer.length > 0) {
            currentFile.write(headerBuffer);
            headerBuffer = "";
          }
        });
      }
    } else if (currentFile) {
      const newlineIndex = data.indexOf("\n");
      
      if (newlineIndex !== -1) {
        const fileContent = data.substring(0, newlineIndex);
        currentFile.write(fileContent);
        currentFile.end();
        
        const remainingData = data.substring(newlineIndex + 1);
        if (remainingData.length > 0) {
          headerBuffer = remainingData;
          isReadingHeader = true;
          currentFile = null;
        }
      } else {
        currentFile.write(data);
      }
    }
  });

  brotli.on("end", () => {
    if (currentFile) {
      currentFile.end();
    }
  });

  readStream.pipe(brotli);
};

await decompressDir();
