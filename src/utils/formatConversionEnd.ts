import { formatFileSize } from './formatFileSize';

// Helper function to format conversion complete message
export const formatConversionComplete = (
  fileName: string,
  inputPath: string,
  outputPath: string,
  inputSize: number,
  outputSize: number
): void => {
  const compressionRatio = ((1 - outputSize / inputSize) * 100).toFixed(1);
  const sizeDiff = inputSize - outputSize;

  console.log('\n' + '='.repeat(80));
  console.log('✅ CONVERSION COMPLETE');
  console.log('─'.repeat(80));
  console.log(`  File:            ${fileName}`);
  console.log(`  Input Path:      ${inputPath}`);
  console.log(`  Output Path:     ${outputPath}`);
  console.log(`  Input Size:      ${formatFileSize(inputSize)}`);
  console.log(`  Output Size:     ${formatFileSize(outputSize)}`);
  console.log(`  Size Reduction:  ${formatFileSize(sizeDiff)} (${compressionRatio}% smaller)`);
  console.log('─'.repeat(80) + '\n');
};
