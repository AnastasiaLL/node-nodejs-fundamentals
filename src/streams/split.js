import fs from "fs";
import path from "path";
import process from "process";
import { Readable } from "stream";

const split = async () => {
  const sourcePath = path.join(process.cwd(), "source.txt");
  
  const linesIndex = process.argv.indexOf("--lines");
  let maxLines = 10;
  
  if (linesIndex !== -1 && linesIndex + 1 < process.argv.length) {
    maxLines = parseInt(process.argv[linesIndex + 1], 10);
  }

  const readStream = fs.createReadStream(sourcePath, { encoding: "utf-8" });
  
  let chunkNumber = 1;
  let lineBuffer = [];
  let remaining = "";

  readStream.on("data", (chunk) => {
    const lines = (remaining + chunk).split("\n");
    remaining = lines.pop() || "";
    
    for (const line of lines) {
      lineBuffer.push(line);
      
      if (lineBuffer.length >= maxLines) {
        const chunkContent = lineBuffer.join("\n");
        fs.writeFileSync(`chunk_${chunkNumber}.txt`, chunkContent);
        chunkNumber++;
        lineBuffer = [];
      }
    }
  });

  readStream.on("end", () => {
    if (lineBuffer.length > 0) {
      const chunkContent = lineBuffer.join("\n");
      fs.writeFileSync(`chunk_${chunkNumber}.txt`, chunkContent);
    }
  });

  readStream.on("error", () => {
    throw new Error("FS operation failed");
  });
};

await split();