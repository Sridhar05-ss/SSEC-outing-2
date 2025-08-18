# Transaction Caching System

## Overview

The transaction caching system has been implemented to solve the issue where EasyTime Pro only keeps a limited number of recent transactions (around 10) and deletes older ones when new transactions come in. This system ensures that all transactions are preserved and available for the attendance management system.

## How It Works

### 1. **Automatic Caching**
- Every time transactions are fetched from EasyTime Pro, new transactions are automatically added to the local cache
- The cache is stored in `BACKEND/data/transactions_cache.json`
- Transactions are uniquely identified by `emp_code + punch_time`

### 2. **Data Persistence**
- Cache is automatically loaded when the backend starts
- Cache is saved after each transaction fetch
- Cache persists between server restarts

### 3. **Smart Merging**
- New transactions from EasyTime Pro are merged with existing cached transactions
- Duplicate transactions are automatically handled
- All transactions are preserved, not just the most recent ones

### 4. **Automatic Cleanup**
- Transactions older than 30 days are automatically removed from cache
- This prevents the cache from growing indefinitely
- Keeps the system performant

## API Endpoints

### Get Transactions (Enhanced)
```
GET /api/zkteco/transactions?limit=10000
```

**Response includes cache information:**
```json
{
  "success": true,
  "data": [...],
  "message": "ZKteco transactions fetched successfully",
  "metadata": {
    "totalTransactions": 1500,
    "newTransactions": 10,
    "cachedTransactions": 1490,
    "note": null
  }
}
```

### Cache Statistics
```
GET /api/zkteco/cache/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCachedTransactions": 1500,
    "cacheSize": 245760,
    "oldestTransaction": "2025-08-01 09:00:00",
    "newestTransaction": "2025-08-18 17:30:00"
  }
}
```

### Clear Cache
```
DELETE /api/zkteco/cache
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction cache cleared successfully"
}
```

## Benefits

### ✅ **Data Preservation**
- No more lost transactions when EasyTime Pro deletes old data
- All attendance records are preserved locally

### ✅ **Improved Reliability**
- System continues to work even if EasyTime Pro API is down
- Uses cached data as fallback

### ✅ **Better Performance**
- Faster access to historical data
- Reduced API calls to EasyTime Pro

### ✅ **Automatic Management**
- Self-cleaning cache (removes old data)
- No manual maintenance required

## Configuration

### Cache File Location
```
BACKEND/data/transactions_cache.json
```

### Cache Retention
- **Default**: 30 days
- **Configurable**: Modify the `cleanOldTransactions()` method in `apiService.js`

### Cache Size Limits
- **No hard limit**: Cache grows based on transaction volume
- **Automatic cleanup**: Old transactions are removed automatically
- **File size**: Monitored through cache statistics endpoint

## Testing

### Test Cache Functionality
```bash
cd BACKEND
node test-cache.js
```

### Monitor Cache Performance
1. Check cache statistics: `GET /api/zkteco/cache/stats`
2. Monitor backend logs for cache operations
3. Verify transaction counts in frontend

## Troubleshooting

### Cache Not Working
1. **Check file permissions**: Ensure backend can write to `BACKEND/data/`
2. **Verify EasyTime Pro connection**: Check if API calls are successful
3. **Check logs**: Look for cache-related error messages

### Cache Too Large
1. **Reduce retention period**: Modify `cleanOldTransactions()` method
2. **Manual cleanup**: Use `DELETE /api/zkteco/cache` endpoint
3. **Monitor usage**: Check cache statistics regularly

### Performance Issues
1. **Check cache size**: Use cache statistics endpoint
2. **Reduce transaction limit**: Lower the `limit` parameter in API calls
3. **Optimize queries**: Filter transactions by date if needed

## Migration

### From Old System
- **Automatic**: Cache is automatically populated on first API call
- **No data loss**: Existing transactions are preserved
- **Backward compatible**: All existing functionality continues to work

### To New System
- **No action required**: System automatically uses caching
- **Immediate benefits**: Better transaction preservation
- **Enhanced monitoring**: Additional cache statistics available

## Future Enhancements

### Planned Features
- **Database storage**: Move cache to database for better performance
- **Compression**: Compress cache data to reduce storage
- **Backup system**: Automatic cache backup and recovery
- **Advanced filtering**: Date range and user-specific queries
- **Real-time sync**: WebSocket-based real-time transaction updates
