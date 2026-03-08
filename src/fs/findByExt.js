import fs from "fs/promises";
import path from "path";
import process from "process";

const findExt = () => {
  let ext = ".txt";
  const extIndex = process.argv.indexOf("--ext");
  
  if (extIndex !== -1 && extIndex + 1 < process.argv.length) {
    let argExt = process.argv[extIndex + 1];
    ext = argExt.startsWith(".") ? argExt : `.${argExt}`;
  }
  return ext;
};

const findFilesByExt = async (currentPath, extension, relativePath = "") => {
  const foundFiles = [];
  const items = await fs.readdir(currentPath);

  for (const item of items) {
    const fullPath = path.join(currentPath, item);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const subDirFiles = await findFilesByExt(
        fullPath,
        extension,
        path.join(relativePath, item),
      );
      foundFiles.push(...subDirFiles);
    } else if (stats.isFile() && item.endsWith(extension)) {
      foundFiles.push(path.join(relativePath, item));
    }
  }

  return foundFiles;
};

const findByExt = async () => {
  const workspacePath = path.join(process.cwd(), "workspace");

  try {
    await fs.access(workspacePath);
    const stats = await fs.stat(workspacePath);

    if (!stats.isDirectory()) {
      throw new Error("FS operation failed");
    }

    const ext = findExt();
    const foundFiles = await findFilesByExt(workspacePath, ext, "");
    
    foundFiles.sort();
    
    for (const filePath of foundFiles) {
      console.log(filePath);
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();