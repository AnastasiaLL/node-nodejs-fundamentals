import path from "path";
import process from "process";

const dynamic = async () => {
  const pluginName = process.argv[2];
  
  if (!pluginName) {
    console.log("Plugin not found");
    process.exit(1);
  }

  try {
    const pluginPath = path.join(process.cwd(), "plugins", `${pluginName}.js`);
    const plugin = await import(pluginPath);
    
    if (typeof plugin.run === "function") {
      const result = plugin.run();
      console.log(result);
    } else {
      console.log("Plugin not found");
      process.exit(1);
    }
  } catch {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
