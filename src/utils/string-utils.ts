export function mapBucketToInterval(bucket: '1m'|'5m'|'1h'|'1d'): string{
    const bucketMap: Record<string,string>={
        '1m':'1 minute',
        '5m':'5 minutes',
        '1h':'1 hour',
        '1d':'1 day'
    }
    return bucketMap[bucket];
}

export function escapeText(value: string): string {
  return value
  .replace(/\\/g, "\\\\") // replace \ with \\
  .replace(/\t/g, "\\t") // replace actual tab \t in the string with text tab \\t => '\t'
  .replace(/\n/g, "\\n"); // replace actual enter \n int the string with text enter \\n => '\n'
}
