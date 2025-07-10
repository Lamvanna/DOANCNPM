#!/usr/bin/env node

// System Test Script for Na Food
const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

// HTTP request helper
const makeRequest = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, {
            method: 'GET',
            timeout: 5000,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = res.headers['content-type']?.includes('application/json') 
                        ? JSON.parse(data) 
                        : data;
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (error) {
                    resolve({ status: res.statusCode, data, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
};

// Test functions
const tests = {
    async testBackendHealth() {
        log.info('Testing backend health...');
        try {
            const response = await makeRequest(`${API_BASE}/health`);
            if (response.status === 200 && response.data.success) {
                log.success('Backend is running and healthy');
                return true;
            } else {
                log.error(`Backend health check failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            log.error(`Backend is not accessible: ${error.message}`);
            return false;
        }
    },

    async testFrontend() {
        log.info('Testing frontend...');
        try {
            const response = await makeRequest(`${FRONTEND_BASE}/`);
            if (response.status === 200) {
                log.success('Frontend is accessible');
                return true;
            } else {
                log.error(`Frontend returned status: ${response.status}`);
                return false;
            }
        } catch (error) {
            log.error(`Frontend is not accessible: ${error.message}`);
            return false;
        }
    },

    async testAPIEndpoints() {
        log.info('Testing API endpoints...');
        const endpoints = [
            '/api/products',
            '/api/banners',
        ];

        let passed = 0;
        for (const endpoint of endpoints) {
            try {
                const response = await makeRequest(`${API_BASE}${endpoint}`);
                if (response.status === 200) {
                    log.success(`${endpoint} - OK`);
                    passed++;
                } else {
                    log.warning(`${endpoint} - Status: ${response.status}`);
                }
            } catch (error) {
                log.error(`${endpoint} - Error: ${error.message}`);
            }
        }

        const total = endpoints.length;
        log.info(`API endpoints test: ${passed}/${total} passed`);
        return passed === total;
    },

    async testAuthentication() {
        log.info('Testing authentication...');
        try {
            const response = await makeRequest(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    email: 'admin@nafood.com',
                    password: 'admin123'
                }
            });

            if (response.status === 200 && response.data.success) {
                log.success('Authentication is working');
                return true;
            } else {
                log.error(`Authentication failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            log.error(`Authentication test failed: ${error.message}`);
            return false;
        }
    },

    async testDatabase() {
        log.info('Testing database connection...');
        try {
            const response = await makeRequest(`${API_BASE}/api/products`);
            if (response.status === 200 && response.data.success) {
                const productCount = response.data.data?.products?.length || 0;
                log.success(`Database is connected (${productCount} products found)`);
                return true;
            } else {
                log.error('Database connection test failed');
                return false;
            }
        } catch (error) {
            log.error(`Database test failed: ${error.message}`);
            return false;
        }
    }
};

// Main test runner
async function runTests() {
    console.log('\n🧪 Na Food System Test\n');
    console.log('=' * 50);

    const results = {};
    const testList = [
        { name: 'Backend Health', test: tests.testBackendHealth },
        { name: 'Frontend Access', test: tests.testFrontend },
        { name: 'Database Connection', test: tests.testDatabase },
        { name: 'API Endpoints', test: tests.testAPIEndpoints },
        { name: 'Authentication', test: tests.testAuthentication }
    ];

    for (const { name, test } of testList) {
        console.log(`\n🔍 ${name}`);
        console.log('-'.repeat(30));
        
        try {
            results[name] = await test();
        } catch (error) {
            log.error(`Test "${name}" crashed: ${error.message}`);
            results[name] = false;
        }
    }

    // Summary
    console.log('\n📊 Test Summary');
    console.log('=' * 50);
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([name, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${name}`);
    });

    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        log.success('All tests passed! System is ready 🚀');
        console.log('\n🌐 Access your application:');
        console.log(`   Frontend: ${FRONTEND_BASE}`);
        console.log(`   Admin:    ${FRONTEND_BASE}/admin.html`);
        console.log(`   API:      ${API_BASE}`);
    } else {
        log.error('Some tests failed. Please check the issues above.');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure backend is running: npm run dev');
        console.log('   2. Make sure frontend is running: python -m http.server 3000');
        console.log('   3. Check MongoDB Atlas connection');
        console.log('   4. Verify environment variables in .env');
    }

    process.exit(passed === total ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(error => {
        log.error(`Test runner crashed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { runTests, tests };
