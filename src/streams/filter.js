import { Transform } from "stream";
import process from "process";

const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  let pattern = "";
  
  if (patternIndex !== -1 && patternIndex + 1 < process.argv.length) {
    pattern = process.argv[patternIndex + 1];
  }

  const filterStream = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split("\n");
      
      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }
      
      callback();
    }
  });

  process.stdin.pipe(filterStream).pipe(process.stdout);
};

filter();
