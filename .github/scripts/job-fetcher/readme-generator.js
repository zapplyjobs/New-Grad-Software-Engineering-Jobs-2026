const fs = require("fs");
const companyCategory = require("./software.json");
const {
  companies,
  ALL_COMPANIES,
  getCompanyEmoji,
  getCompanyCareerUrl,
  getExperienceLevel,
  getJobCategory,
  formatLocation,
} = require("./utils");
// Import or load the JSON configuration

function generateJobTable(jobs) {
  console.log(
    `🔍 DEBUG: Starting generateJobTable with ${jobs.length} total jobs`
  );

  if (jobs.length === 0) {
    return `| Company | Role | Location | Apply Now | Age |
|---------|------|----------|-----------|-----|
| *No current openings* | *Check back tomorrow* | *-* | *-* | *-* |`;
  }

  // Create a map of lowercase company names to actual names for case-insensitive matching
  const companyNameMap = new Map();
  Object.entries(companyCategory).forEach(([categoryKey, category]) => {
    category.companies.forEach((company) => {
      companyNameMap.set(company.toLowerCase(), {
        name: company,
        category: categoryKey,
        categoryTitle: category.title,
      });
    });
  });

  console.log(`🏢 DEBUG: Configured companies by category:`);
  Object.entries(companyCategory).forEach(([categoryKey, category]) => {
    console.log(
      `  ${category.emoji} ${category.title}: ${category.companies.join(", ")}`
    );
  });

  // Get unique companies from job data
  const uniqueJobCompanies = [...new Set(jobs.map((job) => job.employer_name))];
  console.log(
    `\n📊 DEBUG: Unique companies found in job data (${uniqueJobCompanies.length}):`,
    uniqueJobCompanies
  );

  // Group jobs by company - only include jobs from valid companies
  const jobsByCompany = {};
  const processedCompanies = new Set();
  const skippedCompanies = new Set();

  jobs.forEach((job) => {
    const employerNameLower = job.employer_name.toLowerCase();
    const matchedCompany = companyNameMap.get(employerNameLower);

    // Only process jobs from companies in our category list
    if (matchedCompany) {
      processedCompanies.add(job.employer_name);
      if (!jobsByCompany[matchedCompany.name]) {
        jobsByCompany[matchedCompany.name] = [];
      }
      jobsByCompany[matchedCompany.name].push(job);
    } else {
      skippedCompanies.add(job.employer_name);
    }
  });

  console.log(`\n✅ DEBUG: Companies INCLUDED (${processedCompanies.size}):`, [
    ...processedCompanies,
  ]);
  console.log(`\n❌ DEBUG: Companies SKIPPED (${skippedCompanies.size}):`, [
    ...skippedCompanies,
  ]);

  // Log job counts by company
  console.log(`\n📈 DEBUG: Job counts by company:`);
  Object.entries(jobsByCompany).forEach(([company, jobs]) => {
    const companyInfo = companyNameMap.get(company.toLowerCase());
    console.log(
      `  ${company}: ${jobs.length} jobs (Category: ${
        companyInfo?.categoryTitle || "Unknown"
      })`
    );
  });

  let output = "";

  // Handle each category
  Object.entries(companyCategory).forEach(([categoryKey, categoryData]) => {
    // Filter companies that actually have jobs
    const companiesWithJobs = categoryData.companies.filter(
      (company) => jobsByCompany[company] && jobsByCompany[company].length > 0
    );

    if (companiesWithJobs.length > 0) {
      const totalJobs = companiesWithJobs.reduce(
        (sum, company) => sum + jobsByCompany[company].length,
        0
      );

      console.log(
        `\n📝 DEBUG: Processing category "${categoryData.title}" with ${companiesWithJobs.length} companies and ${totalJobs} total jobs:`
      );
      companiesWithJobs.forEach((company) => {
        console.log(`  - ${company}: ${jobsByCompany[company].length} jobs`);
      });

      // Use singular/plural based on job count
      const positionText = totalJobs === 1 ? "position" : "positions";
      output += `### ${categoryData.emoji} **${categoryData.title}** (${totalJobs} ${positionText})\n\n`;

      // Handle ALL companies with their own sections (regardless of job count)
      companiesWithJobs.forEach((companyName) => {
        const companyJobs = jobsByCompany[companyName];
        const emoji = getCompanyEmoji(companyName);
        const positionText =
          companyJobs.length === 1 ? "position" : "positions";

        // Use collapsible details for companies with more than 15 jobs
        if (companyJobs.length > 15) {
          output += `<details>\n`;
          output += `<summary><h4>${emoji} <strong>${companyName}</strong> (${companyJobs.length} ${positionText})</h4></summary>\n\n`;
        } else {
          output += `#### ${emoji} **${companyName}** (${companyJobs.length} ${positionText})\n\n`;
        }

        output += `| Role | Location | Apply Now | Age |\n`;
        output += `|------|----------|-----------|-----|\n`;

        companyJobs.forEach((job) => {
          const role = job.job_title;
          const location = formatLocation(job.job_city, job.job_state);
          const posted = job.job_posted_at;
          const applyLink =
            job.job_apply_link || getCompanyCareerUrl(job.employer_name);

          let statusIndicator = "";
          const description = (job.job_description || "").toLowerCase();
          if (
            description.includes("no sponsorship") ||
            description.includes("us citizen")
          ) {
            statusIndicator = " 🇺🇸";
          }
          if (description.includes("remote")) {
            statusIndicator += " 🏠";
          }

          output += `| ${role}${statusIndicator} | ${location} | [<img src="./image.png" width="100" alt="Apply">](${applyLink}) | ${posted} |\n`;
        });

        if (companyJobs.length > 15) {
          output += `\n</details>\n\n`;
        } else {
          output += "\n";
        }
      });
    }
  });

  console.log(
    `\n🎉 DEBUG: Finished generating job table with ${
      Object.keys(jobsByCompany).length
    } companies processed`
  );
  return output;
}

// function generateInternshipSection(internshipData) {
//   if (!internshipData) return "";

//   return `
// ---

// ## 🎓 **SWE Internships 2026**

// > **Top internships for software engineers, programmers, and computer science majors.**

// ### 🏢 **FAANG+ Internship Programs**

// | Company | Program | Apply Now |
// |---------|---------|-----------|
// ${internshipData.companyPrograms
//   .map((program) => {
   
//     return `| ${program.emogi} **${program.company}** | ${program.program} |<a href="${program.url}"  target="_blank"><img src="./image.png" width="100" alt="Apply"></a>|`;
//   })
//   .join("\n")}

// ### 📚 **Top Software Internship Resources**

// | Platform | Description | Visit Now |
// |----------|-------------|-----------|
// ${internshipData.sources
//   .map(
//     (source) =>
//       `| **${source.emogi} ${source.name}** | ${source.description} | <a href="${source.url}"  target="_blank"><img src="./image1.png" width="100" alt="Visit Now"></a>|`
//   )
//   .join("\n")}

// `;
// }

function generateArchivedSection(archivedJobs, stats) {
  if (archivedJobs.length === 0) return "";

  const archivedFaangJobs = archivedJobs.filter((job) =>
    companies.faang_plus.some((c) => c.name === job.employer_name)
  ).length;

  return `
---

<details>
<summary><h2>📁 <strong>Archived SWE Jobs</strong> - ${
    archivedJobs.length
  } (7+ days old) - Click to Expand</h2></summary>

> Either still hiring or useful for research.

### **Archived Job Stats**
- **📁 Total Jobs**: ${archivedJobs.length} positions
- **🏢 Companies**: ${Object.keys(stats.totalByCompany).length} companies  
- **⭐ FAANG+ Jobs & Internships**: ${archivedFaangJobs} roles

${generateJobTable(archivedJobs)}

</details>

---

`;
}

// Generate comprehensive README
async function generateReadme(
  currentJobs,
  archivedJobs = [],
  internshipData = null,
  stats = null
) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalCompanies = Object.keys(stats?.totalByCompany || {}).length;
  const faangJobs = currentJobs.filter((job) =>
    companies.faang_plus.some((c) => c.name === job.employer_name)
  ).length;

  return `<div align="center">

<!-- Banner -->
<img src="jobboard/public/mega-zapply.png" alt="Zapply - New Grad Jobs" width="200">

<h3>💼 New Grad Software Engineering Jobs 2025-2026</h3>
<p><em>Real-time job opportunities from ${totalCompanies}</em></p>

<br>

<!-- Row 1: Job Stats (Custom Static Badges) -->
![Total Jobs](https://img.shields.io/badge/Total_Jobs-${currentJobs.length}-brightgreen?style=flat&logo=briefcase)
![Companies](https://img.shields.io/badge/Companies-${totalCompanies}-blue?style=flat&logo=building)
![FAANG+ Jobs](https://img.shields.io/badge/FAANG+_Jobs-${faangJobs}-red?style=flat&logo=star)
![Updated](https://img.shields.io/badge/Updated-Every_15_Minutes-orange?style=flat&logo=calendar)
![License](https://img.shields.io/badge/License-CC--BY--NC--4.0-purple?style=flat&logo=creativecommons)

<!-- Row 2: Repository Stats -->
![GitHub stars](https://img.shields.io/github/stars/zapplyjobs/New-Grad-Software-Engineering-Jobs?style=flat&logo=github&color=yellow)
![GitHub forks](https://img.shields.io/github/forks/zapplyjobs/New-Grad-Software-Engineering-Jobs?style=flat&logo=github&color=blue)
![Last commit](https://img.shields.io/github/last-commit/zapplyjobs/New-Grad-Software-Engineering-Jobs?style=flat&color=red)
![Contributors](https://img.shields.io/github/contributors/zapplyjobs/New-Grad-Software-Engineering-Jobs?style=flat&color=green)

<!-- Row 3: Workflow Health -->
![Update Jobs](https://img.shields.io/github/actions/workflow/status/zapplyjobs/New-Grad-Software-Engineering-Jobs/update-jobs.yml?style=flat&label=job-updates&logo=github-actions&logoColor=white)

<!-- Row 4: Community & Links (for-the-badge style) -->
[![Browse Jobs](https://img.shields.io/badge/Browse_Jobs-Live_Site-FF6B35?style=for-the-badge&logo=rocket&logoColor=white)](https://new-grad-positions.vercel.app/)
[![Zapply](https://img.shields.io/badge/Zapply-Company_Site-4F46E5?style=for-the-badge&logo=zap&logoColor=white)](https://zapply-jobs.vercel.app/)
[![Discord](https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/yKWw28q7Yq)
[![Reddit](https://img.shields.io/badge/Reddit-Join-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/r/Zapply/)
[![Report Issue](https://img.shields.io/badge/Report_Issue-Bug_Tracker-yellow?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zapplyjobs/New-Grad-Software-Engineering-Jobs/issues)

<!-- Zapply extension badge - add when extension launches -->
<!-- [![Zapply Extension](https://img.shields.io/badge/Extension-Apply_Faster-4F46E5?style=for-the-badge&logo=chrome&logoColor=white)](https://zapply-extension-url) -->

</div>

---
  
  
  # 💻 Software Engineering Jobs 2026 by Zapply

**🚀 Real-time software engineering, programming, and IT jobs from ${totalCompanies}+ top companies like Tesla, NVIDIA, and Raytheon. Updated every 15 minutes with ${
    currentJobs.length
  }+ fresh opportunities for new graduates, CS students, and entry-level software developers.**

**🎯 Includes roles across tech giants, fast-growing startups, and engineering-first companies like Chewy, CACI, and TD Bank.**

**🛠 Help us grow! Add new jobs by submitting an issue! View CONTRIBUTING steps [here](CONTRIBUTING-GUIDE.md).**

---

## Join Our Community

<img src="images/community.png" alt="Join Our Community - Illustration of people holding hands.">

Connect with fellow job seekers, get career advice, share experiences, and stay updated on the latest opportunities. Join our community of developers and CS students navigating their career journey together!

<p align="center">
  <a href="https://discord.gg/EXR6rWnd"><img src="images/discord.png" alt="Join Our Discord" width="235"></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.reddit.com/r/Zapply/"><img src="images/reddit.png" alt="Join Our Reddit" width="200"></a>
</p>

---

## Alerts

<img src="images/alerts.png" alt="Watch, fork, and star the repo to get alerts on new jobs.">

**Don't miss new opportunities!**  
- 🌟 **Star this repo** to get updates on your GitHub dashboard
- 👁️ **Watch** for instant notifications on new jobs
- 🔔 **Turn on notifications** to never miss FAANG+ postings

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zapplyjobs/New-Grad-Jobs&type=Date&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zapplyjobs/New-Grad-Jobs&type=Date" />
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zapplyjobs/New-Grad-Jobs&type=Date" />
</picture>

---

## **Live Stats**

<img src="images/stats.png" alt="Real-time counts of roles and companies.">

🔥 **Current Positions:** ${currentJobs.length} hot software engineering jobs  
🏢 **Top Companies:** ${totalCompanies} elite tech including Tesla, NVIDIA, Raytheon  
⭐ **FAANG+ Jobs & Internships:** ${faangJobs} premium opportunities  
📅 **Last Updated:** ${currentDate}  
🤖 **Next Update:** Tomorrow at 9 AM UTC  
📁 **Archived Developer Jobs:** ${archivedJobs.length} (older than 1 week)

---

## 🎯 **Fresh Software Job Listings 2026 (under 1 week)**

${generateJobTable(currentJobs)}


---
## **✨ Insights on the Repo**

<img src="images/insights.png" alt="Insights pulled from current listings.">

### 🏢 **Top Companies**

#### ⭐ **FAANG+** (${(() => {
  const count = companies?.faang_plus?.filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).length || 0;
  return `${count} ${count === 1 ? 'company' : 'companies'}`;
})()})
${companies?.faang_plus?.filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).map((c, index) => {
  const totalJobs = currentJobs.filter(job => job.employer_name === c.name).length;
  const jobText = totalJobs === 1 ? 'position' : 'positions';
  if (index === 0) {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs} ${jobText})`;
  } else {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs})`;
  }
}).join(" • ") || "No companies available"}


#### 💰 **Fintech Leaders** (${(() => {
  const count = companies?.fintech?.filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).length || 0;
  return `${count} ${count === 1 ? 'company' : 'companies'}`;
})()})
${companies?.fintech?.filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).map((c, index) => {
  const totalJobs = currentJobs.filter(job => job.employer_name === c.name).length;
  const jobText = totalJobs === 1 ? 'position' : 'positions';
  if (index === 0) {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs} ${jobText})`;
  } else {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs})`;
  }
}).join(" • ") || "No companies available"}


#### ☁️ **Enterprise & Cloud** (${(() => {
  const count = [...(companies?.enterprise_saas || []), ...(companies?.top_tech || [])].filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).length || 0;
  return `${count} ${count === 1 ? 'company' : 'companies'}`;
})()})
${[...(companies?.enterprise_saas || []), ...(companies?.top_tech || [])].filter(c => currentJobs.filter(job => job.employer_name === c.name).length > 0).map((c, index) => {
  const totalJobs = currentJobs.filter(job => job.employer_name === c.name).length;
  const jobText = totalJobs === 1 ? 'position' : 'positions';
  if (index === 0) {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs} ${jobText})`;
  } else {
    return `${c.emoji} **[${c.name}](${c.career_url})** (${totalJobs})`;
  }
}).join(" • ") || "No companies available"}

---
### 📈 **Experience Breakdown**

| Level               | Count | Percentage | Top Companies                     |
|---------------------|-------|------------|-----------------------------------|
| 🟢 Entry Level & New Grad | ${stats?.byLevel["Entry-Level"] || 0} | ${
    stats
      ? Math.round((stats.byLevel["Entry-Level"] / currentJobs.length) * 100)
      : 0
  }% | No or minimal experience |
| 🟡 Beginner & Early Career | ${stats?.byLevel["Mid-Level"] || 0} | ${
    stats
      ? Math.round((stats.byLevel["Mid-Level"] / currentJobs.length) * 100)
      : 0
  }% | 1-2 years of experience |
| 🔴 Manager         | ${stats?.byLevel["Senior"] || 0} | ${
    stats ? Math.round((stats.byLevel["Senior"] / currentJobs.length) * 100) : 0
  }% | 2+ years of experience |

---

### 🌍 **Top Locations**
${
  stats
    ? Object.entries(stats.byLocation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([location, count]) => `- **${location}**: ${count} positions`)
        .join("\n")
    : ""
}

---

### 🔮 **Why Software Engineers Choose Our Job Board**

✅ **100% Real Jobs:** ${
    currentJobs.length
  }+ verified CS internships and entry-level software roles from ${totalCompanies} elite tech companies.

✅ **Fresh Daily Updates:** Live company data from Tesla, Raytheon, Chewy, and CACI refreshed every 15 minutes automatically.

✅ **Entry-Level Focused:** Smart filtering for CS majors, new grads, and early-career engineers.

✅ **Intern-to-FTE Pipeline:** Track internships that convert to full-time SWE roles.

✅ **Direct Applications:** Skip recruiters -- apply straight to company career pages for Tesla, Amazon, and NVIDIA positions.

✅ **Mobile-Optimized:** Perfect mobile experience for CS students job hunting between classes.

---

## 🚀 **Job Hunt Tips That Actually Work**

<img src="images/tips.png" alt="No fluff — just strategies that help.">

### 🔍 **Research Before Applying**

- **Find the hiring manager:** Search "[Company] [Team] engineering manager" on LinkedIn.
- **Check recent tech decisions:** Read their engineering blog for stack changes or new initiatives.
- **Verify visa requirements:** Look for 🇺🇸 indicator or "US persons only" in job description.
- [Use this 100% ATS-compliant and job-targeted resume template](https://docs.google.com/document/d/1EcP_vX-vTTblCe1hYSJn9apwrop0Df7h/export?format=docx).

### 📄 **Resume Best Practices**

- **Mirror their tech stack:** Copy exact keywords from job post (React, Django, Node.js, etc.).
- **Lead with business impact:** "Improved app speed by 30%" > "Used JavaScript."
- **Show product familiarity:** "Built Netflix-style recommendation engine" or "Created Stripe payment integration."
- [Read this informative guide on tweaking your resume](https://drive.google.com/uc?export=download&id=1H6ljywqVnxONdYUD304V1QRayYxr0D1e).

### 🎯 **Interview Best Practices**

- **Ask tech-specific questions:** "How do you handle CI/CD at scale?" shows real research.
- **Prepare failure stories:** "Migration failed, learned X, rebuilt with Y" demonstrates growth mindset.
- **Reference their products:** "As a daily Slack user, I've noticed..." proves genuine interest.
- [Review this comprehensive interview guide on common behavioral, technical, and curveball questions](https://drive.google.com/uc?export=download&id=1MGRv7ANu9zEnnQJv4sstshsmc_Nj0Tl0).

<img src="images/sample-resume.png" alt="A sample format of a software engineering resume." width="310">
<img src="images/tweaking-resume.png" alt="A guide on tweaking your resume with keywords." width="310">
<img src="images/interview-guide.png" alt="The most common interview questions and how to answer them." width="310">

---

## 🤝 **Become a Contributor**

<img src="images/contributor.png" alt="Add roles, report issues, or suggest improvements.">

Add new jobs! See the [contributing guide](#contributing-guide).

### Contributing Guide
#### 🎯 Roles We Accept
- Located in the US, Canada, or Remote.
- Not already in our database.
- Currently accepting applications.

#### 🚀 How to Add Jobs
1. Create a new issue.
2. Select the "New Job" template.
3. Fill out and submit the form.
   > Submit separate issues for each position, even from the same company.

#### ✏️ How to Update Jobs
1. Copy the job URL to edit.
2. Create a new issue.
3. Select the "Edit Job" template.
4. Paste the URL and describe changes.

#### ⚡ What Happens Next
- Our team reviews within 24-48 hours.
- Approved jobs are added to the main list.
- The README updates automatically via script.
- Contributions go live at the next daily refresh (9 AM UTC).
- Questions? Create a miscellaneous issue, and we’ll assist! 🙏

### Thanks to all our contributors! **The real MVPs. 🏆**

<a href="https://github.com/zapplyjobs/Research-Internships-for-Undergraduates/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=zapplyjobs/Research-Internships-for-Undergraduates"/>
</a>

---

${archivedJobs.length > 0 ? generateArchivedSection(archivedJobs, stats) : ""}


<div align="center">

**🎯 ${
    currentJobs.length
  } current opportunities from ${totalCompanies} elite companies.**

**Found this helpful? Give it a ⭐ to support us!**

*Not affiliated with any companies listed. All applications redirect to official career pages.*

---

**Last Updated:** ${currentDate} • **Next Update:** Daily at 9 AM UTC

</div>`;
}

// Update README file
async function updateReadme(currentJobs, archivedJobs, internshipData, stats) {
  try {
    console.log("📝 Generating README content...");
    const readmeContent = await generateReadme(
      currentJobs,
      archivedJobs,
      internshipData,
      stats
    );
    fs.writeFileSync("README.md", readmeContent, "utf8");
    console.log(`✅ README.md updated with ${currentJobs.length} current jobs`);

    console.log("\n📊 Summary:");
    console.log(`- Total current: ${currentJobs.length}`);
    console.log(`- Archived:      ${archivedJobs.length}`);
    console.log(
      `- Companies:     ${Object.keys(stats?.totalByCompany || {}).length}`
    );
  } catch (err) {
    console.error("❌ Error updating README:", err);
    throw err;
  }
}

module.exports = {
  generateJobTable,
  
  generateArchivedSection,
  generateReadme,
  updateReadme,
};
