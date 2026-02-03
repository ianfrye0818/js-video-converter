import { formatFileSize } from './formatFileSize';

// Helper function to format conversion start message
export const formatConversionStart = (
  fileName: string,
  inputPath: string,
  inputSize: number,
  timestamp: string
): void => {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 CONVERSION STARTED');
  console.log('─'.repeat(80));
  console.log(`  File:     ${fileName}`);
  console.log(`  Input:    ${inputPath}`);
  console.log(`  Size:     ${formatFileSize(inputSize)}`);
  console.log(`  Started:  ${timestamp}`);
  console.log('─'.repeat(80) + '\n');
};
