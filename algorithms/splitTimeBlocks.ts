const DEFAULT_BLOCK_SIZE = 5;

export function splitTimeBlocks(availableTime: number, blockSize = DEFAULT_BLOCK_SIZE) {
  if (availableTime < blockSize) {
    return [] as number[];
  }

  const blockCount = Math.floor(availableTime / blockSize);
  return Array.from({ length: blockCount }, () => blockSize);
}
