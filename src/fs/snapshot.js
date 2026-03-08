import fs from "fs/promises";
import path from "path";
import process from "process";

const snapshot = async () => {
  const workspacePath = path.join(process.cwd(), "workspace");
  const snapshotPath = path.join(process.cwd(), "snapshot.json");
  
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const scanDirectory = async (currentPath, relativePath = "") => {
    const items = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);
      const itemRelativePath = path.join(relativePath, item.name).replace(/\\/g, "/");
      
      if (item.isDirectory()) {
        entries.push({
          path: itemRelativePath,
          type: "directory"
        });
        await scanDirectory(fullPath, itemRelativePath);
      } else if (item.isFile()) {
        const stats = await fs.stat(fullPath);
        const content = await fs.readFile(fullPath);
        
        entries.push({
          path: itemRelativePath,
          type: "file",
          size: stats.size,
          content: content.toString("base64")
        });
      }
    }
  };

  await scanDirectory(workspacePath);

  const snapshotData = {
    rootPath: workspacePath.replace(/\\/g, "/"),
    entries: entries
  };

  await fs.writeFile(snapshotPath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();