import fs from "fs/promises";
import path from "path";
import process from "process";

const findByExt = async () => {
  const workspacePath = path.join(process.cwd(), "workspace");
  
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const extIndex = process.argv.indexOf("--ext");
  let ext = extIndex !== -1 ? process.argv[extIndex + 1] : "txt";
  if (!ext.startsWith(".")) ext = "." + ext;

  const findFiles = async (dir, relativePath = "") => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await findFiles(fullPath, path.join(relativePath, entry.name));
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        files.push(path.join(relativePath, entry.name));
      }
    }
    
    return files;
  };

  const files = await findFiles(workspacePath);
  files.sort((a, b) => a.localeCompare(b));
  
  for (const file of files) {
    console.log(file);
  }
};

await findByExt();