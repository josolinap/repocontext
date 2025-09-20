/**
 * PR Comment Script for GitHub Actions
 * Adds analysis results as comments to pull requests
 */

const fs = require('fs');
const path = require('path');

async function addPRComment() {
  try {
    const reportsDir = './reports';
    const files = fs.readdirSync(reportsDir)
      .filter(f => f.startsWith('analysis-report-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('No analysis report found');
      return;
    }

    const latestFile = files[0];
    const reportContent = fs.readFileSync(path.join(reportsDir, latestFile), 'utf8');

    // Truncate report for PR comment
    const truncatedReport = reportContent.split('\n').slice(0, 50).join('\n') +
      '\n\n... (truncated) See full report in artifacts.';

    const comment = `## 🤖 Automated Repository Analysis

${truncatedReport}

### 📊 Quick Stats
- **Repository Health:** ${process.env.HEALTH_SCORE || 'unknown'}
- **Total Commits Analyzed:** ${process.env.COMMIT_COUNT || 'unknown'}
- **Active Contributors:** ${process.env.CONTRIBUTOR_COUNT || 'unknown'}

*Full analysis report available in workflow artifacts*
`;

    // In a real implementation, this would use the GitHub API to post the comment
    console.log('📝 PR Comment Content:');
    console.log('=' .repeat(50));
    console.log(comment);
    console.log('=' .repeat(50));
    console.log('✅ PR comment prepared successfully');

  } catch (error) {
    console.error('❌ PR comment error:', error);
    // Don't fail the workflow for PR comment errors
  }
}

addPRComment();
