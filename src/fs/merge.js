import fs from "fs/promises";
import path from "path";
import process from "process";

const merge = async () => {
  const partsPath = path.join(process.cwd(), "workspace", "parts");
  const mergedPath = path.join(process.cwd(), "workspace", "merged.txt");
  
  try {
    await fs.access(partsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const filesIndex = process.argv.indexOf("--files");
  let filesToMerge = [];
  
  if (filesIndex !== -1 && filesIndex + 1 < process.argv.length) {
    filesToMerge = process.argv[filesIndex + 1].split(",");
    
    for (const file of filesToMerge) {
      try {
        await fs.access(path.join(partsPath, file));
      } catch {
        throw new Error("FS operation failed");
      }
    }
  } else {
    const allFiles = await fs.readdir(partsPath);
    filesToMerge = allFiles
      .filter(file => file.endsWith(".txt"))
      .sort((a, b) => a.localeCompare(b));
    
    if (filesToMerge.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  let mergedContent = "";
  
  for (const file of filesToMerge) {
    const content = await fs.readFile(path.join(partsPath, file), "utf-8");
    mergedContent += content;
  }
  
  await fs.writeFile(mergedPath, mergedContent);
};

await merge();
