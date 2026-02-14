#!/usr/bin/env node

/**
 * JSearch API Fetcher for Software Engineering Jobs
 * Wrapper for shared JSearch fetcher library (Phase 4.3)
 */

const createJSearchFetcher = require('../shared/lib/jsearch-fetcher');

// Domain-specific search queries for Software Engineering
const SEARCH_QUERIES = [
    'software engineer',
    'software developer',
    'full stack developer',
    'full stack engineer',
    'frontend developer',
    'frontend engineer',
    'backend developer',
    'backend engineer',
    'web developer',
    'mobile developer',
    'ios developer',
    'android developer',
    'react developer',
    'node.js developer',
    'python developer',
    'java developer',
    'devops engineer',
    'site reliability engineer',
    'platform engineer',
    'cloud engineer'
];

// Create fetcher instance with domain queries
const fetcher = createJSearchFetcher(
    SEARCH_QUERIES,
    process.env.JSEARCH_API_KEY,
    { maxRequestsPerDay: 30 }
);

module.exports = {
    fetchAllJSearchJobs: fetcher.fetchAllJSearchJobs,
    SEARCH_QUERIES: fetcher.SEARCH_QUERIES
};
