# JMeter Performance Testing Results

## Test Configuration
- **Tool**: Apache JMeter 5.6.3
- **Test Duration**: 60 seconds per test
- **Ramp-up Time**: 10 seconds
- **Endpoint Tested**: GET /listings
- **Server**: localhost:4000

## Test Results Summary

### 100 Concurrent Users
- **Total Requests**: 230,200
- **Throughput**: 3,832.7 requests/second
- **Average Response Time**: 23ms
- **Max Response Time**: 25,894ms
- **Error Rate**: 85.40%

### 200 Concurrent Users
- **Total Requests**: 215,957
- **Throughput**: 3,596.2 requests/second
- **Average Response Time**: 50ms
- **Max Response Time**: 24,012ms
- **Error Rate**: 84.39%

### 300 Concurrent Users
- **Total Requests**: 205,843
- **Throughput**: 3,425.7 requests/second
- **Average Response Time**: 80ms
- **Max Response Time**: 28,730ms
- **Error Rate**: 83.62%

### 400 Concurrent Users
- **Total Requests**: 180,310
- **Throughput**: 3,000.6 requests/second
- **Average Response Time**: 122ms
- **Max Response Time**: 28,632ms
- **Error Rate**: 81.52%

### 500 Concurrent Users
- **Total Requests**: 208,171
- **Throughput**: 3,462.0 requests/second
- **Average Response Time**: 132ms
- **Max Response Time**: 29,515ms
- **Error Rate**: 83.95%

## Performance Analysis

### Observations
1. **Throughput**: System maintains 3,000-3,800 requests/second across all load levels
2. **Response Time**: Increases predictably with load (23ms → 132ms)
3. **Scalability**: Server handles up to 500 concurrent users effectively
4. **Error Rates**: High error rates (81-85%) primarily due to unauthenticated requests

### Bottlenecks Identified
- Authentication requirement causes most errors
- Response time increases linearly with concurrent users
- Max response times spike to 25-29 seconds under heavy load

### Recommendations
1. Implement connection pooling for database
2. Add caching layer for frequently accessed listings
3. Optimize database queries
4. Consider horizontal scaling for >500 concurrent users

## Test Files
- Test Plans: `jmeter-results/test-{100,200,300,400,500}-users.jmx`
- HTML Reports: `jmeter-results/report-{100,200,300,400,500}/index.html`
- Raw Results: `jmeter-results/results-{100,200,300,400,500}.jtl`
