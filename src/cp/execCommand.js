import { spawn } from 'child_process';
import process from 'process';

const execCommand = () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('No command provided');
    process.exit(1);
  }

  const commandString = args.join(' ');
  
  const child = spawn(commandString, [], {
    env: process.env,
    shell: true,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(`Failed to start process: ${err.message}`);
    process.exit(1);
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
};

execCommand();