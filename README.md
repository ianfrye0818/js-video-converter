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

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd movie-convert
```

2. Install dependencies:

```bash
pnpm install
```

3. The application uses `input` and `output` directories relative to the application root. These
   will be created automatically if they don't exist.

### Docker Deployment

The application is containerized and ready for Docker deployment. FFmpeg is included in the Docker
image, so no additional installation is required.

## Usage

### Local Development

Start the watcher in development mode with hot-reload:

```bash
pnpm dev
```

### Production Mode (Local)

1. Build the project:

```bash
pnpm build
```

2. Start the watcher:

```bash
pnpm start
```

### Docker Deployment

#### Using Docker Compose

1. Edit `docker-compose.yaml` and update the volume paths:

```yaml
volumes:
  - /path/to/your/input:/app/input
  - /path/to/your/output:/app/output
```

2. Start the container:

```bash
docker-compose up -d
```

#### Using Docker Directly

1. Build the image:

```bash
docker build -t movie-convert .
```

2. Run the container:

```bash
docker run -d \
  --name movie-convert \
  -v /path/to/your/input:/app/input \
  -v /path/to/your/output:/app/output \
  movie-convert
```

#### Building and Pushing Docker Image

Use the provided script to build and push multi-architecture images:

```bash
./build-and-push.sh [VERSION]
```

Examples:

- `./build-and-push.sh v1.0.0` - Build and push with version tag
- `./build-and-push.sh latest` - Build and push with latest tag
- `./build-and-push.sh` - Build and push with default 'prod' tag

The script builds for both `linux/amd64` and `linux/arm64` architectures.

## How It Works

1. On startup, the application checks if FFmpeg is installed and exits with an error if not found
2. The watcher monitors the `input` directory (relative to the application root) for new video files
3. When a new file is detected, it waits 2 seconds to ensure the file has finished copying
4. The file is validated (extension check) and checked if it already exists in the output directory
5. If valid and not already converted, it's added to the conversion queue
6. Up to 5 conversions run concurrently
7. Each conversion outputs an MP4 file to the `output` directory with the naming pattern:
   `{original_filename}_converted.mp4`
8. Progress bars show the status of each active conversion
9. Upon completion, conversion details including file sizes are displayed

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
│   ├── index.ts           # Entry point with FFmpeg check
│   ├── Watcher.ts         # Main watcher class with conversion logic
│   ├── ProgressBar.ts     # Progress indicator implementation
│   ├── input/             # Input directory (watched for new files)
│   ├── output/            # Output directory (converted files)
│   └── utils/             # Utility functions for formatting
│       ├── formatConversionStart.ts
│       ├── formatConversionEnd.ts
│       ├── formatFileSize.ts
│       └── index.ts
├── dockerfile             # Docker image definition
├── docker-compose.yaml    # Docker Compose configuration
├── build-and-push.sh     # Script for building and pushing Docker images
├── .dockerignore         # Files excluded from Docker build
├── .env.example          # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

- `pnpm dev` - Start the watcher in development mode with hot-reload (uses `tsx watch`)
- `pnpm start` - Start the watcher in production mode (requires build, runs compiled JavaScript)
- `pnpm start:env` - Start the watcher with environment variables from `.env` file
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm typecheck` - Type check without emitting files

## Troubleshooting

### FFmpeg Not Found

The application checks for FFmpeg on startup and will exit with an error if not found.

**Local Development:** Ensure FFmpeg is installed and available in your system PATH. Test with:

```bash
ffmpeg -version
```

**Docker:** FFmpeg is included in the Docker image, so this shouldn't be an issue. If you encounter
FFmpeg errors in Docker, ensure you're using the official image.

### Files Not Being Detected

- Ensure files are being copied to the `input` directory (or mounted volume in Docker)
- Check that file extensions match supported formats (`.mov`, `.avi`, `.mkv`, `.wmv`, `.flv`,
  `.webm`, `.mp4`)
- Verify the watcher is running and monitoring the correct directory
- In Docker, ensure volume mounts are correctly configured

### Docker Volume Permissions

If you encounter permission issues with Docker volumes:

- Ensure the container has read access to the input directory
- Ensure the container has write access to the output directory
- You may need to adjust file permissions or use a user mapping in Docker

## License

ISC
