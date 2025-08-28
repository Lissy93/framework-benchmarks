const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const color = (text, colorName) => `${colors[colorName]}${text}${colors.reset}`;

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

const runCommand = (command, args = [], options = {}) => {
  return new Promise((resolve) => {
    let stdout = '', stderr = '';
    
    // Determine stdio configuration based on needs
    const stdioConfig = options.quiet ? 'pipe' : 
                       options.captureOutput ? ['pipe', 'pipe', 'pipe'] : 
                       'inherit';
    
    const child = spawn(command, args, { 
      stdio: stdioConfig,
      shell: true,
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, FORCE_COLOR: '1' } // Preserve colors in child processes
    });
    
    // Capture and/or display output if needed
    if (options.captureOutput || options.quiet) {
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
          if (!options.quiet) process.stdout.write(data);
        });
      }
      
      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
          if (!options.quiet) process.stderr.write(data);
        });
      }
    }
    
    child.on('close', (code) => resolve({ 
      success: code === 0, 
      output: stdout, 
      errors: stderr, 
      code 
    }));
    
    child.on('error', (error) => resolve({ 
      success: false, 
      output: '', 
      errors: error.message, 
      code: -1 
    }));
  });
};

const loadFrameworks = () => {
  try {
    const { loadFrameworks } = require('./setup/generate-scripts.js');
    return loadFrameworks();
  } catch (error) {
    const configPath = path.join(__dirname, '..', 'frameworks.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.frameworks || [];
  }
};

const parseLintOutput = (output) => {
  const match = output.match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  return match ? { 
    errors: parseInt(match[2]) || 0, 
    warnings: parseInt(match[3]) || 0 
  } : { errors: 0, warnings: 0 };
};

module.exports = {
  color,
  colors,
  formatDuration,
  runCommand,
  loadFrameworks,
  parseLintOutput
};