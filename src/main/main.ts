const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs/promises');

import type { BrowserWindow as BrowserWindowType, IpcMainInvokeEvent } from 'electron';

const execPromise = promisify(exec);

let mainWindow: BrowserWindowType | null = null;

const DEFAULT_CONKY_CONFIG_PATH = '/etc/conky/conky.conf';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow!.loadURL('http://localhost:5173');
    mainWindow!.webContents.openDevTools();
  } else {
    mainWindow!.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow!.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Helper Functions

// Check if a file requires elevated privileges
async function needsElevatedPrivileges(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.W_OK);
    return false; // File is writable, no elevation needed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return true; // Permission denied, elevation needed
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, check parent directory
      const dir = path.dirname(filePath);
      try {
        await fs.access(dir, fs.constants.W_OK);
        return false; // Directory is writable
      } catch {
        return true; // Directory not writable, need elevation
      }
    }
    throw error;
  }
}

// Execute a command with pkexec if needed
async function executeWithElevation(command: string, args: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const fullCommand = `pkexec ${command} ${args.join(' ')}`;
    await execPromise(fullCommand);
    return { success: true };
  } catch (error) {
    const err = error as { code?: number; stderr?: string; message?: string };
    if (err.code === 126 || err.code === 127) {
      return { success: false, error: 'pkexec not found. Please install policykit-1 or polkit.' };
    }
    return { success: false, error: err.message || 'Failed to execute with elevation' };
  }
}

// Write file with pkexec if needed (includes backup in same operation to avoid multiple password prompts)
async function writeFileWithElevation(filePath: string, content: string): Promise<void> {
  const tempFile = path.join(app.getPath('temp'), `conky-editor-${Date.now()}.conf`);
  const scriptFile = path.join(app.getPath('temp'), `conky-editor-script-${Date.now()}.sh`);

  try {
    // Write content to temp file
    await fs.writeFile(tempFile, content, 'utf-8');

    // Create a script that does backup AND copy in one pkexec call
    const script = `#!/bin/bash
# Backup if file exists
if [ -f "${filePath}" ]; then
  cp "${filePath}" "${filePath}.backup"
fi
# Copy new file
cp "${tempFile}" "${filePath}"
`;
    await fs.writeFile(scriptFile, script, 'utf-8');
    await fs.chmod(scriptFile, 0o755);

    // Execute the script with pkexec (single password prompt)
    const result = await executeWithElevation('sh', [scriptFile]);

    if (!result.success) {
      throw new Error(result.error);
    }
  } finally {
    // Clean up temp files
    try {
      await fs.unlink(tempFile);
      await fs.unlink(scriptFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// IPC Handlers

// Get default config file path
ipcMain.handle('get-default-config-path', () => {
  return DEFAULT_CONKY_CONFIG_PATH;
});

// Select config file via dialog
ipcMain.handle('select-config-file', async () => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Conky Configuration File',
      defaultPath: DEFAULT_CONKY_CONFIG_PATH,
      filters: [
        { name: 'Conky Config', extensions: ['conf'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    return { success: true, filePath: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Read Conky configuration file
ipcMain.handle('read-config', async (_event: IpcMainInvokeEvent, configPath: string) => {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const { config, textSection } = parseConkyConfig(content);
    return { success: true, data: config, rawContent: content, textSection };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { success: false, error: `Config file not found: ${configPath}` };
    }
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      return { success: false, error: `Permission denied: ${configPath}. Try running with sudo or changing file permissions.` };
    }
    return { success: false, error: (error as Error).message };
  }
});

// Write Conky configuration file
ipcMain.handle('write-config', async (_event: IpcMainInvokeEvent, configPath: string, configData: Record<string, string>) => {
  try {
    const configContent = generateConkyConfig(configData);
    const needsElevation = await needsElevatedPrivileges(configPath);

    if (needsElevation) {
      // Write with elevation (includes backup in single pkexec call)
      await writeFileWithElevation(configPath, configContent);
    } else {
      // Regular write (no elevation needed)
      try {
        await fs.copyFile(configPath, `${configPath}.backup`);
      } catch {
        // Backup failed, but continue
      }
      await fs.writeFile(configPath, configContent, 'utf-8');
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Restart Conky
ipcMain.handle('restart-conky', async (_event: IpcMainInvokeEvent, configPath: string) => {
  try {
    // Kill all running conky processes
    try {
      await execPromise('pkill conky');
      // Wait a bit for processes to terminate
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // pkill returns non-zero if no processes found, which is fine
      console.log('pkill result:', error);
    }

    // Start conky in daemon mode with specific config file
    const startCommand = `conky -c "${configPath}" -d`;
    console.log('Starting conky with command:', startCommand);
    const result = await execPromise(startCommand);
    console.log('Conky start result:', result);

    return { success: true };
  } catch (error) {
    console.error('Failed to restart conky:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Parse Conky configuration
function parseConkyConfig(content: string): Record<string, string> {
  const config: Record<string, string> = {};
  const lines = content.split('\n');
  let inConfigSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for config section start
    if (trimmed === 'conky.config = {') {
      inConfigSection = true;
      continue;
    }

    // Check for config section end
    if (inConfigSection && (trimmed === '}' || trimmed === '};')) {
      inConfigSection = false;
      continue;
    }

    // Parse config lines
    if (inConfigSection && trimmed && !trimmed.startsWith('--')) {
      const match = trimmed.match(/^(\w+)\s*=\s*(.+?),?\s*$/);
      if (match) {
        const [, key, value] = match;
        // Remove quotes and trailing comma
        config[key] = value.replace(/^['"]|['"],?$/g, '').replace(/,\s*$/, '');
      }
    }
  }

  return config;
}

// Generate Conky configuration content
function generateConkyConfig(config: Record<string, string>): string {
  const lines = ['conky.config = {'];

  for (const [key, value] of Object.entries(config)) {
    // Determine if value needs quotes
    const needsQuotes = isNaN(Number(value)) && value !== 'true' && value !== 'false';
    const formattedValue = needsQuotes ? `'${value}'` : value;
    lines.push(`    ${key} = ${formattedValue},`);
  }

  lines.push('}');
  lines.push('');
  lines.push('conky.text = [[');
  lines.push('${color grey}Info:$color ${scroll 32 Conky $conky_version - $sysname $nodename $kernel $machine}');
  lines.push('${color grey}Uptime:$color $uptime');
  lines.push('${color grey}Frequency (in MHz):$color $freq');
  lines.push('${color grey}Frequency (in GHz):$color $freq_g');
  lines.push('${color grey}RAM Usage:$color $mem/$memmax - $memperc% ${membar 4}');
  lines.push('${color grey}Swap Usage:$color $swap/$swapmax - $swapperc% ${swapbar 4}');
  lines.push('${color grey}CPU Usage:$color $cpu% ${cpubar 4}');
  lines.push('${color grey}Processes:$color $processes  ${color grey}Running:$color $running_processes');
  lines.push('$hr');
  lines.push('${color grey}File systems:');
  lines.push(' / $color${fs_used /}/${fs_size /} ${fs_bar 6 /}');
  lines.push('${color grey}Networking:');
  lines.push('Up:$color ${upspeed} ${color grey} - Down:$color ${downspeed}');
  lines.push(']]');

  return lines.join('\n');
}
