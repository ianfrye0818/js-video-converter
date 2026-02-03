import * as chokidar from 'chokidar';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { ProgressBar } from './ProgressBar';
import { formatConversionComplete } from './utils';
import { formatConversionStart } from './utils/formatConversionStart';

interface ConversionTask {
  filePath: string;
  fileName: string;
  outputFilePath: string;
  inputFileSize: number;
}

export class Watcher {
  private watchDir: string;
  private outputDir: string;
  private ffmpegPath: string;
  private queue: ConversionTask[] = [];
  private runningCount: number = 0;
  private readonly maxConcurrent: number = 5;

  constructor(watchDir?: string, outputDir?: string, ffmpegPath?: string) {
    if (!watchDir || !outputDir || !ffmpegPath) {
      throw new Error('Missing required parameters');
    }
    this.watchDir = watchDir;
    this.outputDir = outputDir;
    this.ffmpegPath = ffmpegPath;
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

    watcher.on('add', (filePath) => {
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
    let lastOutputSize = 0;
    const progressInterval = setInterval(() => {
      // Fallback: estimate progress from output file size if percent not available
      if (fs.existsSync(task.outputFilePath)) {
        try {
          const currentSize = fs.statSync(task.outputFilePath).size;
          if (currentSize > lastOutputSize) {
            // Rough estimate: assume output will be similar size to input (or smaller)
            // This is just a visual indicator, not precise
            const estimatedPercent = Math.min(95, (currentSize / task.inputFileSize) * 100);
            if (estimatedPercent > progressBar.lastPercent) {
              progressBar.update(estimatedPercent);
            }
            lastOutputSize = currentSize;
          }
        } catch {
          // File might be locked, ignore
        }
      }
    }, 500); // Check every 500ms

    const onComplete = () => {
      clearInterval(progressInterval);
      progressBar.update(100); // Ensure it shows 100%
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
      .on('start', () => {
        console.log('  Converting...\n');
      })
      .on('progress', (progress) => {
        const percent = progress.percent;
        const timemark = progress.timemark || '00:00:00';
        const currentKbps = progress.currentKbps || 0;
        if (percent !== undefined) {
          progressBar.update(percent, timemark, currentKbps);
        } else {
          // If no percent, at least show time and speed
          progressBar.update(progressBar.lastPercent, timemark, currentKbps);
        }
      })
      .on('error', (err) => {
        clearInterval(progressInterval);
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
