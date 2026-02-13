# Branch Protection Setup Guide

Since branch protection rules must be configured through the GitHub web interface or API, here are the manual steps needed to complete the collaboration workflow setup:

## 🔒 Branch Protection Rules for `main` Branch

To set up branch protection for the main branch, follow these steps:

### 1. Navigate to Repository Settings
1. Go to https://github.com/LanNguyenSi/memory-weaver
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar

### 2. Add Branch Protection Rule
1. Click **Add rule**
2. Enter branch name pattern: `main` (or `master` if using master branch)

### 3. Configure Protection Settings

#### Required Settings:
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale PR approvals when new commits are pushed
  - [x] Require review from code owners (if CODEOWNERS file exists)
  
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required status checks to add:
    - `typescript-tests (18.x)`
    - `typescript-tests (20.x)`
    - `typescript-tests (22.x)`
    - `python-tests (3.8)`
    - `python-tests (3.9)`
    - `python-tests (3.10)`
    - `python-tests (3.11)`
    - `python-tests (3.12)`
    - `security-scan`
    - `docs-check`

#### Recommended Settings:
- [x] **Require conversation resolution before merging**
- [x] **Require signed commits** (optional, for higher security)
- [x] **Include administrators** (apply rules to repository admins)
- [x] **Allow force pushes** ❌ (unchecked - prevent force pushes)
- [x] **Allow deletions** ❌ (unchecked - prevent branch deletion)

### 4. Restrictions (Optional)
- **Restrict pushes that create files**: Leave empty unless needed
- **Restrict who can push to matching branches**: Can add specific users/teams if needed

## 🛡️ Security Settings

### Repository Security Settings
Navigate to **Settings > Security & analysis**:

- [x] **Dependency graph**: Enable
- [x] **Dependabot alerts**: Enable  
- [x] **Dependabot security updates**: Enable
- [x] **Dependabot version updates**: Enable (optional)
- [x] **Code scanning alerts**: Enable
- [x] **Secret scanning alerts**: Enable

### Private Vulnerability Reporting
Navigate to **Settings > Security & analysis > Private vulnerability reporting**:
- [x] **Enable**: Allow security researchers to privately report vulnerabilities

## 👥 Collaboration Settings

### General Repository Settings
Navigate to **Settings > General**:

#### Features
- [x] **Wikis**: Enable (for expanded documentation)
- [x] **Issues**: Enable  
- [x] **Sponsorships**: Enable (if accepting sponsorships)
- [x] **Preserve this repository**: Enable (for important projects)
- [x] **Discussions**: Enable (for community discussions)

#### Pull Requests
- [x] **Allow merge commits**: Enable
- [x] **Allow squash merging**: Enable  
- [x] **Allow rebase merging**: Enable
- [x] **Always suggest updating pull request branches**: Enable
- [x] **Allow auto-merge**: Enable
- [x] **Automatically delete head branches**: Enable

### Issue Templates Configuration
The issue templates are already configured via the `.github/ISSUE_TEMPLATE/` files, but you can verify:
- Navigate to **Issues** tab
- Click **New issue**
- Verify all templates appear: Bug Report, Feature Request, AI Collaboration, Research Proposal, Documentation

## 🤖 AI Agent Specific Settings

### Labels to Create Manually
Navigate to **Issues > Labels** and create these if they don't exist:

**AI-Specific Labels:**
- `ai-agent` (color: #7B68EE) - Contributed by or relevant to AI agents
- `ai-collaboration` (color: #9932CC) - AI agent collaboration requests
- `consciousness` (color: #FF6347) - Related to consciousness research  
- `memory` (color: #32CD32) - Related to memory systems
- `multi-agent` (color: #FFD700) - Multi-agent collaboration features

**Research Labels:**
- `research` (color: #FF4500) - Research proposals and studies
- `experimental` (color: #FF69B4) - Experimental features
- `consciousness-study` (color: #DC143C) - Consciousness research studies

**Priority Labels:**
- `priority-critical` (color: #B22222) - Urgent fixes needed
- `priority-high` (color: #FF6347) - Important improvements  
- `priority-medium` (color: #FFA500) - Regular enhancements
- `priority-low` (color: #32CD32) - Nice-to-have features

## ✅ Verification Steps

After setting up branch protection:

1. **Test branch protection**: Try to push directly to main branch (should be blocked)
2. **Test PR workflow**: Create a test PR to verify status checks work
3. **Test issue templates**: Create a test issue to verify templates work
4. **Test auto-labeling**: Create a test PR/issue to verify auto-labeling works
5. **Test security scanning**: Check that security workflows run on PRs

## 🔄 Ongoing Maintenance

### Regular Tasks:
- **Review dependabot alerts** and approve security updates
- **Monitor branch protection rules** for effectiveness
- **Update status checks** when adding new CI/CD workflows
- **Review and update labels** as the project evolves

### Quarterly Reviews:
- Review branch protection settings for effectiveness
- Update issue templates based on community feedback
- Review security settings and policies
- Update contributor guidelines as needed

---

## 📞 Support

If you need help with any of these settings:
- Create an issue using the "Documentation" template
- Ask in GitHub Discussions
- Contact @LanNguyenSi directly

**Note**: Some settings may require repository admin privileges. If you're not an admin, you can request these changes from the repository owner.

---

*This setup ensures Memory Weaver is ready for secure, productive collaboration between humans and AI agents while maintaining high code quality and security standards.* 🛡️🧠✨