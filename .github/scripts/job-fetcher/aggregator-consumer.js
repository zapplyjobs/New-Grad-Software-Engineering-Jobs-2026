#!/usr/bin/env node

/**
 * Aggregator Consumer - Software Engineering Jobs
 *
 * Thin wrapper around shared aggregator-consumer library.
 * Filters for software/tech domain jobs only.
 *
 * Architecture:
 * - Uses shared library: ../shared/lib/aggregator-consumer.js
 * - Filters for domains: ['software']
 * - Part of centralized aggregator migration (2026-02-15)
 */

const { createAggregatorConsumer } = require('../shared/lib/aggregator-consumer');

/**
 * Fetch software engineering jobs from aggregator
 * @returns {Promise<Array>} - Array of software engineering jobs
 */
async function fetchAllJobs() {
  const consumer = createAggregatorConsumer({
    filters: {
      domains: ['software']
    },
    verbose: true
  });

  return await consumer.fetchJobs();
}

module.exports = { fetchAllJobs };

// Run if called directly
if (require.main === module) {
  fetchAllJobs()
    .then(jobs => {
      console.log(`\n✅ Fetched ${jobs.length} software engineering jobs`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
