import * as chokidar from 'chokidar';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { ProgressBar } from './ProgressBar';
import { formatConversionComplete, formatConversionStart } from './utils';

interface ConversionTask {
  filePath: string;
  fileName: string;
  outputFilePath: string;
  inputFileSize: number;
}

export class Watcher {
  private watchDir: string;
  private outputDir: string;
  private queue: ConversionTask[] = [];
  private runningCount: number = 0;
  private readonly maxConcurrent: number = 5;

  constructor() {
    // Use process.cwd() to get the app root directory (works in both dev and production)
    // In Docker, this will be /app; in local dev, it will be the project root
    const appRoot = process.cwd();
    this.watchDir = path.join(appRoot, 'input');
    this.outputDir = path.join(appRoot, 'output');

    if (!fs.existsSync(this.watchDir)) {
      fs.mkdirSync(this.watchDir, { recursive: true });
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public start() {
    const watcher = chokidar.watch(this.watchDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Wait for a file to finish copying
        pollInterval: 100, // Check for file changes every 100ms
      },
    });

    console.log(`Watching for files in ${this.watchDir}`);

    watcher.on('add', (filePath: string) => {
      const fileName = path.basename(filePath);
      const outputFileName = `${path.parse(fileName).name}_converted.mp4`;
      const outputFilePath = path.join(this.outputDir, outputFileName);

      // Check to see if the file already exists in the output dir. If it does, skip the conversion.
      if (fs.existsSync(outputFilePath)) {
        console.log(`Skipping conversion: ${fileName} already exists in output directory.`);
        return;
      }

      // Extension filter (Safety Check)
      const ext = path.extname(filePath).toLowerCase();
      const validExtensions = ['.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.mp4'];

      if (!validExtensions.includes(ext)) {
        console.log(`Skipping conversion: ${fileName} is not a valid video file.`);
        return;
      }

      const inputFileSize = fs.statSync(filePath).size;

      // Add to queue or start immediately
      const task: ConversionTask = {
        filePath,
        fileName,
        outputFilePath,
        inputFileSize,
      };

      if (this.runningCount < this.maxConcurrent) {
        this.startConversion(task);
      } else {
        this.queue.push(task);
      }
    });
  }

  private startConversion(task: ConversionTask): void {
    this.runningCount++;

    formatConversionStart(
      task.fileName,
      task.filePath,
      task.inputFileSize,
      new Date().toISOString()
    );

    const progressBar = new ProgressBar(task.fileName);

    // Keep event loop active so ProgressBar animation timer fires reliably
    const keepAlive = setInterval(() => {}, 500);

    const onComplete = () => {
      clearInterval(keepAlive);
      progressBar.clear();
      const outputFileSize = fs.statSync(task.outputFilePath).size;
      formatConversionComplete(
        task.fileName,
        task.filePath,
        task.outputFilePath,
        task.inputFileSize,
        outputFileSize
      );

      this.runningCount--;

      // Start next conversion from queue if available
      if (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
        const nextTask = this.queue.shift()!;
        this.startConversion(nextTask);
      }

      console.log(`Watching for more files...`);
    };

    ffmpeg(task.filePath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-pix_fmt yuv420p', // Compatible with most devices
        '-crf 23', // Standard Quality / Size Balance
      ])
      .on('error', (err) => {
        clearInterval(keepAlive);
        progressBar.clear();
        console.error(`\n❌ Error converting ${task.fileName}: ${err.message}\n`);

        this.runningCount--;

        // Start next conversion from queue if available
        if (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
          const nextTask = this.queue.shift()!;
          this.startConversion(nextTask);
        }
      })
      .on('end', onComplete)
      .save(task.outputFilePath);
  }
}
