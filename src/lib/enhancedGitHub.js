import GitHubService from './github.js'

class EnhancedGitHubService extends GitHubService {
  constructor(token = null) {
    super(token)
  }

  // Advanced commit history analysis
  async getCommitHistory(owner, repo, options = {}) {
    const { since, until, author, path, per_page = 100 } = options

    try {
      const params = {
        owner,
        repo,
        per_page: Math.min(per_page, 100),
        ...(since && { since }),
        ...(until && { until }),
        ...(author && { author }),
        ...(path && { path })
      }

      const response = await this.octokit.repos.listCommits(params)

      // Analyze commit patterns
      const commits = response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        url: commit.html_url,
        stats: commit.stats || null
      }))

      return {
        commits,
        total: commits.length,
        analysis: this.analyzeCommitPatterns(commits),
        contributors: this.analyzeContributors(commits),
        timeline: this.createCommitTimeline(commits)
      }
    } catch (error) {
      console.error('Error fetching commit history:', error)
      return { commits: [], total: 0, analysis: {}, contributors: [], timeline: [] }
    }
  }

  // Branch analysis and comparison
  async analyzeBranches(owner, repo) {
    try {
      const [branches, defaultBranch] = await Promise.all([
        this.octokit.repos.listBranches({ owner, repo }),
        this.octokit.repos.get({ owner, repo })
      ])

      const branchDetails = await Promise.all(
        branches.data.slice(0, 10).map(async (branch) => {
          try {
            const commit = await this.octokit.repos.getCommit({
              owner,
              repo,
              ref: branch.commit.sha
            })

            return {
              name: branch.name,
              sha: branch.commit.sha,
              protected: branch.protected,
              commit: {
                message: commit.data.commit.message,
                author: commit.data.commit.author.name,
                date: commit.data.commit.author.date,
                url: commit.data.html_url
              }
            }
          } catch (error) {
            return {
              name: branch.name,
              sha: branch.commit.sha,
              protected: branch.protected,
              commit: null
            }
          }
        })
      )

      return {
        branches: branchDetails,
        defaultBranch: defaultBranch.data.default_branch,
        totalBranches: branches.data.length,
        protectedBranches: branchDetails.filter(b => b.protected).length,
        analysis: this.analyzeBranchPatterns(branchDetails)
      }
    } catch (error) {
      console.error('Error analyzing branches:', error)
      return { branches: [], defaultBranch: '', totalBranches: 0, protectedBranches: 0 }
    }
  }

  // Advanced contributor analysis
  async getContributorStats(owner, repo, options = {}) {
    const { since, until } = options

    try {
      const [contributors, commits] = await Promise.all([
        this.octokit.repos.listContributors({ owner, repo, per_page: 100 }),
        this.getCommitHistory(owner, repo, { since, until, per_page: 1000 })
      ])

      const contributorStats = contributors.data.map(contributor => {
        const contributorCommits = commits.commits.filter(
          commit => commit.author.email === contributor.email ||
                   commit.committer.email === contributor.email
        )

        return {
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          contributions: contributor.contributions,
          type: contributor.type,
          commits: contributorCommits.length,
          first_commit: contributorCommits.length > 0 ?
            new Date(Math.min(...contributorCommits.map(c => new Date(c.author.date)))) : null,
          last_commit: contributorCommits.length > 0 ?
            new Date(Math.max(...contributorCommits.map(c => new Date(c.author.date)))) : null,
          activity_period: this.calculateActivityPeriod(contributorCommits),
          commit_frequency: this.calculateCommitFrequency(contributorCommits)
        }
      })

      return {
        contributors: contributorStats.sort((a, b) => b.contributions - a.contributions),
        totalContributors: contributorStats.length,
        activeContributors: contributorStats.filter(c => c.commits > 0).length,
        analysis: this.analyzeContributorPatterns(contributorStats)
      }
    } catch (error) {
      console.error('Error fetching contributor stats:', error)
      return { contributors: [], totalContributors: 0, activeContributors: 0 }
    }
  }

  // Repository health and maintenance metrics
  async getRepositoryHealth(owner, repo) {
    try {
      const [repoData, issues, pullRequests, releases] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.issues.listForRepo({ owner, repo, state: 'all', per_page: 100 }),
        this.octokit.pulls.list({ owner, repo, state: 'all', per_page: 100 }),
        this.octokit.repos.listReleases({ owner, repo, per_page: 10 })
      ])

      const healthMetrics = {
        repository: {
          name: repoData.data.name,
          created_at: repoData.data.created_at,
          updated_at: repoData.data.updated_at,
          size: repoData.data.size,
          language: repoData.data.language,
          stars: repoData.data.stargazers_count,
          forks: repoData.data.forks_count,
          watchers: repoData.data.watchers_count,
          open_issues: repoData.data.open_issues_count,
          has_wiki: repoData.data.has_wiki,
          has_pages: repoData.data.has_pages,
          has_projects: repoData.data.has_projects,
          has_downloads: repoData.data.has_downloads,
          archived: repoData.data.archived,
          disabled: repoData.data.disabled
        },
        issues: {
          total: issues.data.length,
          open: issues.data.filter(i => i.state === 'open').length,
          closed: issues.data.filter(i => i.state === 'closed').length,
          avg_resolution_time: this.calculateAverageResolutionTime(issues.data)
        },
        pullRequests: {
          total: pullRequests.data.length,
          open: pullRequests.data.filter(pr => pr.state === 'open').length,
          closed: pullRequests.data.filter(pr => pr.state === 'closed').length,
          merged: pullRequests.data.filter(pr => pr.merged).length
        },
        releases: {
          total: releases.data.length,
          latest: releases.data[0] ? {
            name: releases.data[0].name,
            tag_name: releases.data[0].tag_name,
            published_at: releases.data[0].published_at,
            prerelease: releases.data[0].prerelease
          } : null
        }
      }

      return {
        ...healthMetrics,
        scores: this.calculateHealthScores(healthMetrics),
        recommendations: this.generateHealthRecommendations(healthMetrics)
      }
    } catch (error) {
      console.error('Error fetching repository health:', error)
      return null
    }
  }

  // Code churn and development velocity analysis
  async getCodeChurn(owner, repo, options = {}) {
    const { since, until, period = 'month' } = options

    try {
      const commits = await this.getCommitHistory(owner, repo, {
        since,
        until,
        per_page: 1000
      })

      const churnAnalysis = {
        total_commits: commits.total,
        total_lines_added: 0,
        total_lines_deleted: 0,
        churn_by_period: {},
        churn_by_author: {},
        churn_by_file_type: {},
        velocity_metrics: {}
      }

      // Analyze each commit for code churn
      for (const commit of commits.commits) {
        if (commit.stats) {
          churnAnalysis.total_lines_added += commit.stats.additions
          churnAnalysis.total_lines_deleted += commit.stats.deletions

          // Group by period
          const commitDate = new Date(commit.author.date)
          const periodKey = this.getPeriodKey(commitDate, period)

          if (!churnAnalysis.churn_by_period[periodKey]) {
            churnAnalysis.churn_by_period[periodKey] = { additions: 0, deletions: 0, commits: 0 }
          }

          churnAnalysis.churn_by_period[periodKey].additions += commit.stats.additions
          churnAnalysis.churn_by_period[periodKey].deletions += commit.stats.deletions
          churnAnalysis.churn_by_period[periodKey].commits += 1

          // Group by author
          const authorKey = commit.author.name
          if (!churnAnalysis.churn_by_author[authorKey]) {
            churnAnalysis.churn_by_author[authorKey] = { additions: 0, deletions: 0, commits: 0 }
          }

          churnAnalysis.churn_by_author[authorKey].additions += commit.stats.additions
          churnAnalysis.churn_by_author[authorKey].deletions += commit.stats.deletions
          churnAnalysis.churn_by_author[authorKey].commits += 1
        }
      }

      // Calculate velocity metrics
      churnAnalysis.velocity_metrics = {
        commits_per_period: this.calculateCommitsPerPeriod(churnAnalysis.churn_by_period),
        churn_rate: this.calculateChurnRate(churnAnalysis),
        development_velocity: this.calculateDevelopmentVelocity(churnAnalysis)
      }

      return churnAnalysis
    } catch (error) {
      console.error('Error calculating code churn:', error)
      return null
    }
  }

  // Helper methods for analysis
  analyzeCommitPatterns(commits) {
    if (commits.length === 0) return {}

    const patterns = {
      total_commits: commits.length,
      avg_commit_size: 0,
      commit_frequency: {},
      time_distribution: {},
      message_patterns: {},
      largest_commits: []
    }

    // Calculate average commit size
    const commitsWithStats = commits.filter(c => c.stats)
    if (commitsWithStats.length > 0) {
      patterns.avg_commit_size = commitsWithStats.reduce(
        (sum, c) => sum + c.stats.additions + c.stats.deletions, 0
      ) / commitsWithStats.length
    }

    // Analyze commit frequency by day/hour
    commits.forEach(commit => {
      const date = new Date(commit.author.date)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      const hour = date.getHours()

      patterns.commit_frequency[day] = (patterns.commit_frequency[day] || 0) + 1
      patterns.time_distribution[hour] = (patterns.time_distribution[hour] || 0) + 1
    })

    // Find largest commits
    patterns.largest_commits = commitsWithStats
      .filter(c => c.stats)
      .sort((a, b) => (b.stats.additions + b.stats.deletions) - (a.stats.additions + a.stats.deletions))
      .slice(0, 5)
      .map(c => ({
        sha: c.sha,
        message: c.message,
        size: c.stats.additions + c.stats.deletions,
        author: c.author.name
      }))

    return patterns
  }

  analyzeContributors(commits) {
    const contributorMap = new Map()

    commits.forEach(commit => {
      const key = commit.author.email
      if (!contributorMap.has(key)) {
        contributorMap.set(key, {
          name: commit.author.name,
          email: commit.author.email,
          commits: 0,
          first_commit: commit.author.date,
          last_commit: commit.author.date
        })
      }

      const contributor = contributorMap.get(key)
      contributor.commits += 1
      contributor.first_commit = new Date(Math.min(
        new Date(contributor.first_commit),
        new Date(commit.author.date)
      ))
      contributor.last_commit = new Date(Math.max(
        new Date(contributor.last_commit),
        new Date(commit.author.date)
      ))
    })

    return Array.from(contributorMap.values()).map(contributor => ({
      ...contributor,
      activity_period_days: Math.ceil(
        (contributor.last_commit - contributor.first_commit) / (1000 * 60 * 60 * 24)
      ),
      commits_per_day: contributor.activity_period_days > 0 ?
        contributor.commits / contributor.activity_period_days : contributor.commits
    }))
  }

  createCommitTimeline(commits) {
    const timeline = commits
      .sort((a, b) => new Date(a.author.date) - new Date(b.author.date))
      .map(commit => ({
        date: commit.author.date,
        author: commit.author.name,
        message: commit.message.substring(0, 100),
        sha: commit.sha.substring(0, 7)
      }))

    return timeline
  }

  analyzeBranchPatterns(branches) {
    return {
      total_branches: branches.length,
      protected_branches: branches.filter(b => b.protected).length,
      active_branches: branches.filter(b => b.commit).length,
      branch_naming_patterns: this.analyzeBranchNaming(branches)
    }
  }

  analyzeBranchNaming(branches) {
    const patterns = {
      feature_branches: 0,
      bugfix_branches: 0,
      hotfix_branches: 0,
      release_branches: 0,
      other: 0
    }

    branches.forEach(branch => {
      const name = branch.name.toLowerCase()
      if (name.includes('feature/') || name.includes('feat/')) patterns.feature_branches++
      else if (name.includes('bugfix/') || name.includes('fix/')) patterns.bugfix_branches++
      else if (name.includes('hotfix/')) patterns.hotfix_branches++
      else if (name.includes('release/')) patterns.release_branches++
      else patterns.other++
    })

    return patterns
  }

  calculateActivityPeriod(commits) {
    if (commits.length === 0) return 0

    const dates = commits.map(c => new Date(c.author.date))
    const first = new Date(Math.min(...dates))
    const last = new Date(Math.max(...dates))

    return Math.ceil((last - first) / (1000 * 60 * 60 * 24))
  }

  calculateCommitFrequency(commits) {
    if (commits.length === 0) return 0

    const activityPeriod = this.calculateActivityPeriod(commits)
    return activityPeriod > 0 ? commits.length / activityPeriod : commits.length
  }

  analyzeContributorPatterns(contributors) {
    return {
      total_contributors: contributors.length,
      active_contributors: contributors.filter(c => c.commits > 0).length,
      top_contributors: contributors.slice(0, 5),
      contribution_distribution: this.calculateContributionDistribution(contributors),
      activity_patterns: this.analyzeActivityPatterns(contributors)
    }
  }

  calculateContributionDistribution(contributors) {
    const total = contributors.reduce((sum, c) => sum + c.contributions, 0)
    const distribution = {
      top_10_percent: 0,
      top_25_percent: 0,
      bottom_50_percent: 0
    }

    const sorted = contributors.sort((a, b) => b.contributions - a.contributions)
    const top10Count = Math.ceil(sorted.length * 0.1)
    const top25Count = Math.ceil(sorted.length * 0.25)

    distribution.top_10_percent = sorted.slice(0, top10Count).reduce((sum, c) => sum + c.contributions, 0) / total * 100
    distribution.top_25_percent = sorted.slice(0, top25Count).reduce((sum, c) => sum + c.contributions, 0) / total * 100
    distribution.bottom_50_percent = sorted.slice(-Math.ceil(sorted.length * 0.5)).reduce((sum, c) => sum + c.contributions, 0) / total * 100

    return distribution
  }

  analyzeActivityPatterns(contributors) {
    const patterns = {
      highly_active: contributors.filter(c => c.commits_per_day > 1).length,
      moderately_active: contributors.filter(c => c.commits_per_day > 0.1 && c.commits_per_day <= 1).length,
      occasionally_active: contributors.filter(c => c.commits_per_day <= 0.1).length,
      avg_commits_per_day: contributors.reduce((sum, c) => sum + c.commits_per_day, 0) / contributors.length
    }

    return patterns
  }

  calculateAverageResolutionTime(issues) {
    const resolvedIssues = issues.filter(issue =>
      issue.state === 'closed' && issue.created_at && issue.closed_at
    )

    if (resolvedIssues.length === 0) return 0

    const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
      const created = new Date(issue.created_at)
      const closed = new Date(issue.closed_at)
      return sum + (closed - created)
    }, 0)

    return totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60 * 24) // days
  }

  calculateHealthScores(metrics) {
    const scores = {
      overall: 0,
      maintenance: 0,
      community: 0,
      quality: 0
    }

    // Maintenance score (based on recent updates, issues, PRs)
    const daysSinceUpdate = (new Date() - new Date(metrics.repository.updated_at)) / (1000 * 60 * 60 * 24)
    scores.maintenance = Math.max(0, 100 - (daysSinceUpdate / 30) * 20) // Lose 20 points per month of inactivity

    // Community score (based on contributors, stars, forks)
    scores.community = Math.min(100,
      (metrics.repository.stargazers_count * 2) +
      (metrics.repository.forks_count * 3) +
      (metrics.repository.watchers_count * 1)
    )

    // Quality score (based on issues resolution, PR merge rate)
    const issueResolutionRate = metrics.issues.total > 0 ?
      (metrics.issues.closed / metrics.issues.total) * 100 : 100
    const prMergeRate = metrics.pullRequests.total > 0 ?
      (metrics.pullRequests.merged / metrics.pullRequests.total) * 100 : 100

    scores.quality = (issueResolutionRate + prMergeRate) / 2

    // Overall score (weighted average)
    scores.overall = Math.round(
      (scores.maintenance * 0.3) +
      (scores.community * 0.3) +
      (scores.quality * 0.4)
    )

    return scores
  }

  generateHealthRecommendations(metrics) {
    const recommendations = []

    if (metrics.scores.maintenance < 70) {
      recommendations.push('Consider updating the repository more frequently')
    }

    if (metrics.issues.open > metrics.issues.closed) {
      recommendations.push('Focus on resolving open issues to improve project health')
    }

    if (metrics.pullRequests.open > 10) {
      recommendations.push('Review and merge pending pull requests')
    }

    if (!metrics.repository.has_wiki && !metrics.repository.has_projects) {
      recommendations.push('Consider enabling wiki or projects for better organization')
    }

    if (metrics.releases.total === 0) {
      recommendations.push('Consider creating releases to help users adopt your project')
    }

    return recommendations
  }

  getPeriodKey(date, period) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    switch (period) {
      case 'year':
        return `${year}`
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`
      case 'week':
        const week = Math.ceil(date.getDate() / 7)
        return `${year}-W${week}`
      default:
        return `${year}-${month.toString().padStart(2, '0')}`
    }
  }

  calculateCommitsPerPeriod(periodData) {
    const periods = Object.keys(periodData)
    if (periods.length === 0) return 0

    const totalCommits = periods.reduce((sum, period) => sum + periodData[period].commits, 0)
    return totalCommits / periods.length
  }

  calculateChurnRate(analysis) {
    const totalChanges = analysis.total_lines_added + analysis.total_lines_deleted
    return analysis.total_commits > 0 ? totalChanges / analysis.total_commits : 0
  }

  calculateDevelopmentVelocity(analysis) {
    const periods = Object.keys(analysis.churn_by_period)
    if (periods.length < 2) return 0

    const recent = periods.slice(-3) // Last 3 periods
    const older = periods.slice(-6, -3) // Previous 3 periods

    const recentVelocity = recent.reduce((sum, period) =>
      sum + analysis.churn_by_period[period].commits, 0
    ) / recent.length

    const olderVelocity = older.length > 0 ?
      older.reduce((sum, period) => sum + analysis.churn_by_period[period].commits, 0) / older.length : 0

    return olderVelocity > 0 ? ((recentVelocity - olderVelocity) / olderVelocity) * 100 : 0
  }
}

export default EnhancedGitHubService
