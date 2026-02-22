/**
 * New-Grad-Software-Engineering-Jobs-2026 Configuration
 *
 * Purpose: Per-repo customization for shared job board library
 * Version: 1.0 (2026-02-12)
 *
 * Template Variables:
 * - {totalCompanies} - Replaced with unique company count
 * - {currentJobs} - Replaced with active job count
 */

module.exports = {
  // Schema version
  version: 1,

  // Image configuration
  repoPrefix: 'sej',
  headingImageAlt: 'Software Engineering Jobs 2026 - Illustration of people working on tech.',

  // Branding text
  title: 'Software Engineering Jobs 2026',
  tagline: '',  // No tagline for SEO repos

  // Description paragraphs (with template variables)
  descriptionLine1: '🚀 Real-time software engineering, programming, and IT jobs from {totalCompanies}+ top companies like Stripe, Datadog, and Vercel. Updated every 15 minutes with {currentJobs}+ fresh opportunities for new graduates, CS students, and entry-level software developers.',
  descriptionLine2: '🎯 Includes roles across tech giants, fast-growing startups, and engineering-first companies like Stripe, Datadog, and Vercel.',

  // Note box
  noteType: 'TIP',
  noteText: '🛠 Help us grow! Add new jobs by submitting an issue! View contributing steps [here](CONTRIBUTING-GUIDE.md).',

  // Section headers
  jobsSectionHeader: 'Fresh Software Jobs 2026',

  // Feature flags
  features: {
    internships: false,     // Images exist but feature disabled
    moreResources: true     // SEO repos link to other repos
  },

  // Job categorization
  defaultCategory: 'backend'  // Fallback for uncategorized jobs
};
