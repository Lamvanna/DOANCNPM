// Frontend Testing Script for Na Food App
const API_BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
    baseURL: API_BASE_URL,
    timeout: 10000,
    testUser: {
        email: 'user@nafood.com',
        password: 'user123'
    },
    testAdmin: {
        email: 'admin@nafood.com',
        password: 'admin123'
    }
};

// Test results
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${testConfig.baseURL}${endpoint}`;
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return { success: response.ok, status: response.status, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test function wrapper
async function runTest(testName, testFunction) {
    testResults.total++;
    console.log(`🧪 Testing: ${testName}`);
    
    try {
        const result = await testFunction();
        if (result) {
            testResults.passed++;
            testResults.details.push({ name: testName, status: 'PASSED', message: 'Test completed successfully' });
            console.log(`✅ PASSED: ${testName}`);
        } else {
            testResults.failed++;
            testResults.details.push({ name: testName, status: 'FAILED', message: 'Test returned false' });
            console.log(`❌ FAILED: ${testName}`);
        }
    } catch (error) {
        testResults.failed++;
        testResults.details.push({ name: testName, status: 'FAILED', message: error.message });
        console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
}

// Test 1: Health Check
async function testHealthCheck() {
    const result = await apiRequest('/health');
    return result.success && result.data.success;
}

// Test 2: Get Products
async function testGetProducts() {
    const result = await apiRequest('/products');
    return result.success && result.data.success && Array.isArray(result.data.data.products);
}

// Test 3: Get Featured Products
async function testGetFeaturedProducts() {
    const result = await apiRequest('/products/featured');
    return result.success && result.data.success && Array.isArray(result.data.data.products);
}

// Test 4: Get Banners
async function testGetBanners() {
    const result = await apiRequest('/banners');
    return result.success && result.data.success && Array.isArray(result.data.data.banners);
}

// Test 5: User Authentication
async function testUserAuth() {
    const loginResult = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(testConfig.testUser)
    });
    
    if (!loginResult.success || !loginResult.data.success) {
        return false;
    }
    
    const token = loginResult.data.data.token;
    
    // Test protected route
    const profileResult = await apiRequest('/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    return profileResult.success && profileResult.data.success;
}

// Test 6: Admin Authentication
async function testAdminAuth() {
    const loginResult = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(testConfig.testAdmin)
    });
    
    if (!loginResult.success || !loginResult.data.success) {
        return false;
    }
    
    const token = loginResult.data.data.token;
    const user = loginResult.data.data.user;
    
    return user.role === 'admin' || user.role === 'staff';
}

// Test 7: CORS Headers
async function testCORS() {
    try {
        const response = await fetch(`${testConfig.baseURL}/health`, {
            method: 'OPTIONS'
        });
        return response.status === 200 || response.status === 204;
    } catch (error) {
        return false;
    }
}

// Test 8: Error Handling
async function testErrorHandling() {
    const result = await apiRequest('/nonexistent-endpoint');
    return !result.success && result.status === 404;
}

// Test 9: Rate Limiting
async function testRateLimiting() {
    // Make multiple requests quickly
    const promises = Array(5).fill().map(() => apiRequest('/health'));
    const results = await Promise.all(promises);
    
    // All requests should succeed (rate limit is high for testing)
    return results.every(result => result.success);
}

// Test 10: Data Validation
async function testDataValidation() {
    // Test invalid login data
    const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid', password: '' })
    });
    
    return !result.success;
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Na Food Frontend API Tests...\n');
    
    // Run all tests
    await runTest('Health Check', testHealthCheck);
    await runTest('Get Products', testGetProducts);
    await runTest('Get Featured Products', testGetFeaturedProducts);
    await runTest('Get Banners', testGetBanners);
    await runTest('User Authentication', testUserAuth);
    await runTest('Admin Authentication', testAdminAuth);
    await runTest('CORS Headers', testCORS);
    await runTest('Error Handling', testErrorHandling);
    await runTest('Rate Limiting', testRateLimiting);
    await runTest('Data Validation', testDataValidation);
    
    // Print results
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed} ✅`);
    console.log(`Failed: ${testResults.failed} ❌`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.details
            .filter(test => test.status === 'FAILED')
            .forEach(test => {
                console.log(`  - ${test.name}: ${test.message}`);
            });
    }
    
    console.log('\n🎉 Testing completed!');
    
    return testResults.failed === 0;
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
} else {
    // Browser environment
    window.runFrontendTests = runAllTests;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testConfig, testResults };
}
