#!/usr/bin/env node

/**
 * Utility functions for job processing
 */

/**
 * Format time ago for display
 */
function formatTimeAgo(dateString) {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1d ago';
        if (diffInDays < 7) return `${diffInDays}d ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
        return `${Math.floor(diffInDays / 30)}mo ago`;
    }
}

/**
 * Format location for display
 */
function formatLocation(city, state, country) {
    if (!city && !state) return 'Remote';

    if (city && city.toLowerCase() === 'remote') return 'Remote 🏠';

    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country && country.toLowerCase() !== 'us') parts.push(country);

    return parts.join(', ');
}

/**
 * Get company emoji based on company name
 */
function getCompanyEmoji(companyName) {
    const company = (companyName || '').toLowerCase();

    const emojiMap = {
        'google': '🔍',
        'microsoft': '🪟',
        'amazon': '📦',
        'apple': '🍎',
        'meta': '👥',
        'facebook': '👥',
        'netflix': '🎬',
        'spotify': '🎵',
        'uber': '🚗',
        'airbnb': '🏠',
        'twitter': '🐦',
        'linkedin': '💼',
        'salesforce': '☁️',
        'oracle': '🔴',
        'ibm': '🔵',
        'adobe': '🅰️',
        'nvidia': '🟢',
        'intel': '💻',
        'amd': '🔶',
        'samsung': '📱',
        'sony': '📺'
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (company.includes(key)) {
            return emoji;
        }
    }

    return '🏢';
}

/**
 * Get job category based on title and description
 */
function getJobCategory(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('ios') || text.includes('android') || text.includes('mobile')) {
        return 'Mobile Development';
    }
    if (text.includes('frontend') || text.includes('front-end') || text.includes('react') || text.includes('vue')) {
        return 'Frontend Development';
    }
    if (text.includes('backend') || text.includes('back-end') || text.includes('api') || text.includes('server')) {
        return 'Backend Development';
    }
    if (text.includes('full stack') || text.includes('fullstack')) {
        return 'Full Stack Development';
    }
    if (text.includes('devops') || text.includes('sre') || text.includes('site reliability')) {
        return 'DevOps/SRE';
    }
    if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp')) {
        return 'Cloud Engineering';
    }

    return 'Software Engineering';
}

module.exports = {
    formatTimeAgo,
    formatLocation,
    getCompanyEmoji,
    getJobCategory
};
