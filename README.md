# Movie Convert

An automated video file converter that watches a directory for new video files and converts them to
MP4 format using FFmpeg. Perfect for batch converting video files with concurrent processing
support.

## Features

- 🎬 **Automatic File Watching**: Monitors a directory for new video files and processes them
  automatically
- ⚡ **Concurrent Processing**: Converts up to 5 videos simultaneously for faster batch processing
- 📊 **Progress Indicators**: Real-time animated progress bars showing conversion status
- 🔄 **Queue Management**: Automatically queues files when maximum concurrent conversions are
  reached
- ✅ **Smart Skipping**: Skips files that already exist in the output directory
- 📁 **Multiple Formats**: Supports `.mov`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`, and `.mp4`
  input formats
- 🎯 **Optimized Output**: Converts to MP4 with H.264 video codec and AAC audio codec for maximum
  compatibility

## Prerequisites

- **Node.js** (v14 or higher)
- **pnpm** (v10.28.2 or compatible)
- **FFmpeg** installed on your system

### Installing FFmpeg

**macOS:**

```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:** Download from [FFmpeg official website](https://ffmpeg.org/download.html) or use:

```bash
choco install ffmpeg
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd movie-convert
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your directories in `.env`:

```env
WATCH_DIR=/path/to/watch/directory
OUTPUT_DIR=/path/to/output/directory
```

**Important**: Use absolute paths for both `WATCH_DIR` and `OUTPUT_DIR`. The watch directory must
exist, while the output directory will be created automatically if it doesn't exist.

## Usage

### Development Mode

Start the watcher in development mode with hot-reload:

```bash
pnpm start
```

### Production Mode

1. Build the project:

```bash
pnpm build
```

2. Start the watcher:

```bash
pnpm start:prod
```

## How It Works

1. The watcher monitors the `WATCH_DIR` for new video files
2. When a new file is detected, it waits 2 seconds to ensure the file has finished copying
3. The file is validated (extension check) and checked if it already exists in the output directory
4. If valid and not already converted, it's added to the conversion queue
5. Up to 5 conversions run concurrently
6. Each conversion outputs an MP4 file with the naming pattern: `{original_filename}_converted.mp4`
7. Progress bars show the status of each active conversion
8. Upon completion, conversion details including file sizes are displayed

## Conversion Settings

The converter uses the following FFmpeg settings for optimal quality and compatibility:

- **Video Codec**: `libx264` (H.264)
- **Audio Codec**: `aac`
- **Pixel Format**: `yuv420p` (compatible with most devices)
- **Quality**: `CRF 23` (standard quality/size balance)

## Project Structure

```
movie-convert/
├── src/
│   ├── index.ts           # Entry point
│   ├── Watcher.ts         # Main watcher class with conversion logic
│   ├── ProgressBar.ts     # Progress indicator implementation
│   └── utils/             # Utility functions for formatting
│       ├── formatConversionStart.ts
│       ├── formatConversionEnd.ts
│       ├── formatFileSize.ts
│       └── index.ts
├── .env                   # Environment configuration (not in git)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

- `pnpm start` - Start the watcher in development mode with hot-reload
- `pnpm start:prod` - Start the watcher in production mode (requires build)
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm typecheck` - Type check without emitting files

## Troubleshooting

### "Watch directory does not exist" Error

Make sure your `WATCH_DIR` path in `.env` is:

- An absolute path (starts with `/` on macOS/Linux or `C:\` on Windows)
- Points to an existing directory

### FFmpeg Not Found

Ensure FFmpeg is installed and available in your system PATH. Test with:

```bash
ffmpeg -version
```

### Files Not Being Detected

- Ensure files are being copied to the watch directory (not moved from the same filesystem)
- Check that file extensions match supported formats
- Verify the watcher is running and monitoring the correct directory

## License

ISC
