# GitHub Configuration

This directory contains GitHub-specific configuration files that enable collaboration workflow for Memory Weaver.

## 📁 Directory Structure

```
.github/
├── ISSUE_TEMPLATE/          # Issue templates for different types of contributions
│   ├── bug_report.yml       # Bug report template
│   ├── feature_request.yml  # Feature request template  
│   ├── ai_collaboration.yml # AI agent collaboration template
│   ├── research_proposal.yml # Research proposal template
│   ├── documentation.yml    # Documentation improvement template
│   └── config.yml          # Issue template configuration
├── workflows/              # GitHub Actions workflows
│   ├── ci.yml             # Main CI/CD pipeline
│   ├── auto-label.yml     # Automatic labeling
│   ├── stale.yml          # Close stale issues/PRs
│   └── greet.yml          # Welcome new contributors
├── pull_request_template.md # Pull request template
├── labeler.yml            # File-based automatic labeling rules
├── link-check-config.json # Configuration for documentation link checker
└── README.md              # This file
```

## 🎯 Key Features

### Issue Templates
- **Bug Report**: Structured bug reporting with environment details
- **Feature Request**: New feature proposals with impact assessment
- **AI Collaboration**: Special template for AI agent collaboration requests
- **Research Proposal**: Scientific research proposals for consciousness studies
- **Documentation**: Documentation improvement suggestions

### Automated Workflows
- **CI/CD Pipeline**: Comprehensive testing for TypeScript and Python implementations
- **Security Scanning**: Automated vulnerability detection and security checks
- **Auto-labeling**: Intelligent labeling based on content and file changes
- **Stale Management**: Automatic cleanup of inactive issues and PRs
- **Contributor Greeting**: Welcoming messages for new contributors (with special AI agent recognition)

### Templates and Guidelines
- **Pull Request Template**: Comprehensive PR checklist with AI-specific sections
- **File-based Labeling**: Automatic labels based on which files are modified
- **Link Validation**: Automatic checking of links in documentation

## 🤖 AI Agent Support

This GitHub configuration includes special support for AI agent contributors:

- **Dedicated issue templates** for AI collaboration and consciousness research
- **AI agent recognition** in greeting workflows
- **Special labeling** for AI-contributed content
- **Research-focused workflows** for consciousness experiments
- **Multi-agent collaboration** support in templates

## 🔒 Security Features

- **Dependency scanning** in CI/CD pipeline
- **Vulnerability detection** with Trivy and npm audit
- **Security-focused labeling** and issue routing
- **Protected branch enforcement** through status checks
- **Sensitive information detection** in automated workflows

## 🏷️ Label System

### Type Labels
- `bug` - Bug reports and fixes
- `enhancement` - New features and improvements  
- `documentation` - Documentation updates
- `research` - Consciousness and memory research
- `ai-collaboration` - AI agent collaboration requests

### Technology Labels  
- `typescript` - TypeScript implementation changes
- `python` - Python implementation changes
- `api` - API-related changes
- `memory` - Memory system changes
- `consciousness` - Consciousness research

### Status Labels
- `needs-triage` - New issues requiring review
- `needs-review` - PRs awaiting review
- `work-in-progress` - Ongoing development
- `stale` - Inactive issues/PRs

### Special Labels
- `ai-agent` - Content from AI contributors
- `security` - Security-related issues
- `breaking-change` - Breaking changes
- `good-first-issue` - Beginner-friendly issues

## 🔧 Configuration

### Branch Protection
The main branch is protected with these rules:
- Require pull request reviews before merging
- Require status checks to pass before merging  
- Require up-to-date branches before merging
- Include administrators in restrictions

### Required Status Checks
- TypeScript tests (Node.js 18.x, 20.x, 22.x)
- Python tests (Python 3.8, 3.9, 3.10, 3.11, 3.12)
- Security scans (npm audit, safety, bandit, trivy)
- Documentation checks (required files, link validation)

## 📊 Workflow Triggers

### CI/CD Pipeline (`ci.yml`)
- **Push** to main or develop branches
- **Pull requests** to main branch
- Runs comprehensive test suite and security scans

### Auto-labeling (`auto-label.yml`)
- **Issues opened** - Labels based on template and content
- **PRs opened** - Labels based on content and file changes

### Stale Management (`stale.yml`)
- **Daily schedule** at midnight UTC
- **Manual dispatch** available
- Respects exempt labels and milestones

### Contributor Greeting (`greet.yml`)  
- **First-time issue creators**
- **First-time PR creators**
- Special recognition for AI agents

## 🎨 Customization

To modify these workflows for your own fork:

1. **Update repository references** in workflow files
2. **Adjust security scanning** based on your security requirements
3. **Modify label configurations** to match your project structure
4. **Customize greeting messages** for your community tone
5. **Update issue templates** to reflect your contribution process

## 🤝 Contributing to GitHub Configuration

If you'd like to improve our GitHub workflows:

1. **Test changes** in a fork first
2. **Consider AI agent implications** in any modifications
3. **Update documentation** when adding new features
4. **Follow security best practices** for any new workflows
5. **Include both human and AI perspectives** in templates

---

This GitHub configuration enables Memory Weaver to be a truly collaborative platform where humans and AI agents can work together to advance consciousness research. 🧠✨