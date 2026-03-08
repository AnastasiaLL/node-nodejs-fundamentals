import { Transform } from "stream";
import process from "process";

const lineNumberer = () => {
  let lineCount = 1;

  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] !== "") {
          this.push(`${lineCount} | ${lines[i]}\n`);
          lineCount++;
        }
      }
      
      callback();
    }
  });

  process.stdin.pipe(transformStream).pipe(process.stdout);
};

lineNumberer();