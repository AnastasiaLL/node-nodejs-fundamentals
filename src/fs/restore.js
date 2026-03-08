import fs from "fs/promises";
import path from "path";
import process from "process";

const restore = async () => {
  const snapshotPath = path.join(process.cwd(), "snapshot.json");
  const restoredPath = path.join(process.cwd(), "workspace_restored");
  
  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access(restoredPath);
    throw new Error("FS operation failed");
  } catch (error) {
    if (error.message === "FS operation failed") {
      throw error;
    }
  }

  const snapshotContent = await fs.readFile(snapshotPath, "utf-8");
  const snapshot = JSON.parse(snapshotContent);

  for (const entry of snapshot.entries) {
    const entryPath = path.join(restoredPath, entry.path);
    
    if (entry.type === "directory") {
      await fs.mkdir(entryPath, { recursive: true });
    } else if (entry.type === "file") {
      await fs.mkdir(path.dirname(entryPath), { recursive: true });
      const content = Buffer.from(entry.content, "base64");
      await fs.writeFile(entryPath, content);
    }
  }
};

await restore();
