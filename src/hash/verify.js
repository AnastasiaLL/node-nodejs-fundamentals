import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import process from "process";
import crypto from "crypto";

const verify = async () => {
  const checksumsPath = path.join(process.cwd(), "checksums.json");
  
  try {
    await fsPromises.access(checksumsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const checksumsContent = await fsPromises.readFile(checksumsPath, "utf-8");
  const checksums = JSON.parse(checksumsContent);

  for (const [filename, expectedHash] of Object.entries(checksums)) {
    const filePath = path.join(process.cwd(), filename);
    
    try {
      await fsPromises.access(filePath);
    } catch {
      console.log(`${filename} — FAIL`);
      continue;
    }

    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    
    await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const calculatedHash = hash.digest("hex");
    const result = calculatedHash === expectedHash ? "OK" : "FAIL";
    console.log(`${filename} — ${result}`);
  }
};

await verify();