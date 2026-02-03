import { exec } from 'child_process';
import 'dotenv/config';
import { Watcher } from './Watcher';

// Check to see if ffmpeg is installed
const ffmpegPath = exec('which ffmpeg');

if (ffmpegPath.stderr?.toString().trim()) {
  console.error('\n❌ FFmpeg is required for this application and is not installed.\n');
  console.error('Please install FFmpeg using one of the following methods:\n');
  console.error('macOS:');
  console.error('  brew install ffmpeg\n');
  console.error('Linux (Ubuntu/Debian):');
  console.error('  sudo apt-get update');
  console.error('  sudo apt-get install ffmpeg\n');
  console.error('Windows:');
  console.error('  choco install ffmpeg');
  console.error('  Or download from: https://ffmpeg.org/download.html\n');
  console.error('For more details, see the "Installing FFmpeg" section in README.md\n');
  process.exit(1);
}

const watcher = new Watcher();

watcher.start();
