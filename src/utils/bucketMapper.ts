export function mapBucketToInterval(bucket: '1m'|'5m'|'1h'|'1d'): string{
    const bucketMap: Record<string,string>={
        '1m':'1 minute',
        '5m':'5 minutes',
        '1h':'1 hour',
        '1d':'1 day'
    }
    return bucketMap[bucket];
}