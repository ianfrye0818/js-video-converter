// Simple converting indicator with animated dots
export class ProgressBar {
  public lastPercent = 0;
  private id: number;
  private fileName: string;
  private dotCount: number = 0;
  private static activeBars: Map<number, ProgressBar> = new Map();
  private static nextId = 0;
  private static startLine = -1; // Track where progress bars start
  private static animationTimer?: NodeJS.Timeout;

  constructor(fileName?: string) {
    this.fileName = fileName || '';
    this.id = ProgressBar.nextId++;
    ProgressBar.activeBars.set(this.id, this);

    // If this is the first bar, mark the start line and start animation
    if (ProgressBar.startLine === -1) {
      ProgressBar.startLine = 0;
      // Print a newline to start progress bars on a new line
      process.stdout.write('\n');
      // Start the global animation timer
      ProgressBar.startAnimation();
    } else {
      // For subsequent bars, just ensure we're on a new line
      process.stdout.write('\n');
    }
  }

  private static startAnimation(): void {
    // Clear any existing timer
    if (ProgressBar.animationTimer) {
      clearInterval(ProgressBar.animationTimer);
    }

    // Animate all bars every 500ms
    ProgressBar.animationTimer = setInterval(() => {
      ProgressBar.renderAll();
    }, 500);
  }

  private static stopAnimation(): void {
    if (ProgressBar.animationTimer) {
      clearInterval(ProgressBar.animationTimer);
      ProgressBar.animationTimer = undefined;
    }
  }

  private static renderAll(): void {
    const bars = Array.from(ProgressBar.activeBars.values()).sort((a, b) => a.id - b.id);

    if (bars.length === 0) return;

    // Save cursor position
    process.stdout.write('\x1b[s');

    // Move up to where progress bars start (number of bars)
    const numBars = bars.length;
    if (numBars > 0) {
      process.stdout.write(`\x1b[${numBars}A`);
    }

    // Render each bar on its own line
    bars.forEach((bar, index) => {
      if (index > 0) {
        process.stdout.write('\n');
      }

      // Cycle dot count (0, 1, 2, 3, then back to 0)
      bar.dotCount = (bar.dotCount + 1) % 4;
      const dots = '.'.repeat(bar.dotCount);
      const line = `  ${bar.fileName}: Converting${dots}`;

      // Clear line and write
      process.stdout.write(' '.repeat(120) + '\r');
      process.stdout.write(line);
    });

    // Restore cursor position
    process.stdout.write('\x1b[u');
  }

  update(percent: number, timemark?: string, currentKbps?: number): void {
    // Just track the percent, but don't render based on it
    // The animation timer handles rendering
    this.lastPercent = percent;
  }

  clear(): void {
    // Remove this bar
    ProgressBar.activeBars.delete(this.id);

    // If no more bars, stop animation and reset start line
    if (ProgressBar.activeBars.size === 0) {
      ProgressBar.stopAnimation();
      ProgressBar.startLine = -1;
      // Clear the line and add a newline
      process.stdout.write('\r' + ' '.repeat(120) + '\r\n');
    } else {
      // Re-render remaining bars
      ProgressBar.renderAll();
    }
  }
}
