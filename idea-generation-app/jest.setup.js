// Jest setup file
// This file is loaded before all tests

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        route: '/',
        pathname: '/',
        query: {},
        asPath: '/',
        push: jest.fn(),
        replace: jest.fn(),
    })),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    })),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    usePathname: jest.fn(() => '/'),
}))

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Set up environment variables for testing
process.env.NODE_ENV = 'test'

// Increase timeout for async operations
jest.setTimeout(30000)

// Global test setup
beforeAll(() => {
    // Any global setup needed for all tests
})

afterAll(() => {
    // Any global cleanup needed after all tests
}) 