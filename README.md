# Conky Editor

A modern Electron application for editing Conky configuration files with a clean, intuitive UI.

## Features

- Clean UI with sidebar navigation for different settings categories
- Read and parse existing Conky configuration from `~/.conkyrc`
- Edit configuration values using forms with appropriate input types
- Save changes back to the configuration file
- Automatic backup of existing config before saving
- Real-time change tracking
- Error handling and user feedback

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Conky installed on your system

## Installation

1. Navigate to the project directory:
   ```bash
   cd conky-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Important: Using NVM (Node Version Manager)

If you installed Node.js using NVM, you have two options to run npm commands:

### Option 1: Use the convenience scripts (Recommended)

We've included shell scripts that automatically load NVM for you:

```bash
./dev.sh       # Run in development mode
./start.sh     # Start the built application
./build.sh     # Build the application
```

### Option 2: Load NVM manually

Before running any npm command, source NVM:

```bash
source "$HOME/.nvm/nvm.sh"
npm run dev
```

### Option 3: Open a new terminal

If you just installed NVM, open a new terminal window to automatically load it from your `.bashrc` file.

## Development

To run the application in development mode:

**Using the convenience script:**
```bash
./dev.sh
```

**Or using npm directly (requires NVM to be loaded):**
```bash
npm run dev
```

This will:
- Start the Vite dev server for the React UI
- Launch Electron with hot-reload enabled
- Open DevTools automatically

## Building

### Build for current platform

```bash
npm run build
npm run package
```

### Build for specific platforms

```bash
npm run package:linux    # Linux AppImage
npm run package:mac      # macOS
npm run package:win      # Windows
```

The built application will be in the `release/` directory.

## Project Structure

```
conky-editor/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Main process entry point
│   │   └── preload.ts          # Preload script for IPC
│   └── renderer/                # React UI
│       ├── components/          # React components
│       │   ├── Sidebar.tsx     # Category navigation
│       │   ├── ConfigForm.tsx  # Settings form
│       │   └── Header.tsx      # Header with save button
│       ├── data/
│       │   └── categories.ts   # Config categories definition
│       ├── styles/
│       │   └── App.css         # Application styles
│       ├── App.tsx             # Main React component
│       ├── main.tsx            # Renderer entry point
│       └── types.d.ts          # TypeScript declarations
├── dist/                        # Build output
├── dev.sh                       # Convenience script for development
├── start.sh                     # Convenience script to start app
├── build.sh                     # Convenience script to build app
├── index.html                   # HTML entry point
├── package.json
├── tsconfig.json               # TypeScript config (renderer)
├── tsconfig.main.json          # TypeScript config (main)
└── vite.config.ts              # Vite configuration
```

## Configuration Categories

The editor organizes Conky settings into the following categories:

1. **Window & Display** - Window positioning and appearance
2. **Output Destinations** - Where Conky renders (X, console, Wayland)
3. **Visual Styling** - Fonts, colors, borders, and effects
4. **Dimensions & Spacing** - Size and positioning controls
5. **Performance & Behavior** - Update intervals and system settings
6. **Text Settings** - Font rendering options

## How It Works

### Main Process (src/main/main.ts)

- Creates the Electron browser window
- Handles IPC communication for file operations
- Reads and writes `~/.conkyrc`
- Parses Conky config format (Lua-based)
- Creates automatic backups before saving

### Preload Script (src/main/preload.ts)

- Exposes secure IPC bridge to renderer process
- Provides `window.conkyAPI` interface

### Renderer Process (src/renderer/)

- React-based UI with TypeScript
- State management for config values
- Form components for editing different setting types
- Real-time change detection

## Usage

1. Launch the application
2. The app will automatically load your `~/.conkyrc` file
3. Navigate through categories using the sidebar
4. Edit values in the form
5. Click "Save Changes" to write back to the config file
6. The original config is backed up to `~/.conkyrc.backup`

## Notes

- The app creates a backup of your config before saving
- Currently supports the Lua-based Conky configuration format
- The TEXT section uses a default template (you can extend this)
- Error messages are displayed at the top of the content area

## Development Tips

- Use DevTools in development mode to debug
- The main process logs errors to the console
- React DevTools work in development mode
- Hot reload is enabled for both main and renderer processes

## License

MIT

## Contributing

Feel free to open issues or submit pull requests for improvements.
