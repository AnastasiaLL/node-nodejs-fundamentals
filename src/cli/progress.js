const progress = () => {
  const args = process.argv.slice(2);
  
  let duration = 5000; 
  let interval = 100;  
  let length = 30;     
  let color = null;    
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      duration = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--interval' && args[i + 1]) {
      interval = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--length' && args[i + 1]) {
      length = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--color' && args[i + 1]) {
      const colorHex = args[i + 1];
      if (/^#[0-9A-Fa-f]{6}$/.test(colorHex)) {
        color = colorHex;
      }
      i++;
    }
  }
  
  let colorAnsi = '';
  if (color) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    colorAnsi = `\x1b[38;2;${r};${g};${b}m`;
  }
  
  const resetAnsi = '\x1b[0m';
  const steps = Math.floor(duration / interval);
  let currentStep = 0;
  
  const updateProgress = () => {
    currentStep++;
    const progress = Math.min(100, Math.floor((currentStep / steps) * 100));
    
    const filledLength = Math.floor((progress / 100) * length);
    const emptyLength = length - filledLength;
    
    const filledBar = '█'.repeat(filledLength);
    const emptyBar = ' '.repeat(emptyLength);
    
    let bar;
    if (color) {
      bar = `${colorAnsi}${filledBar}${resetAnsi}${emptyBar}`;
    } else {
      bar = filledBar + emptyBar;
    }
    
    process.stdout.write(`\r[${bar}] ${progress}%`);
    
    if (progress >= 100) {
      clearInterval(timer);
      console.log('\nDone!');
    }
  };
  
  const timer = setInterval(updateProgress, interval);
  
  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log('\nProgress cancelled');
    process.exit(0);
  });
};

progress();
