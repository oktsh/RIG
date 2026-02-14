# RIG Content Directory

This directory contains all seed content for the RIG knowledge base stored as Markdown files with YAML frontmatter. Content is organized by type and can be read by both the frontend (via `gray-matter`) and the backend seed process.

## Directory Structure

```
content/
├── README.md                           # This file
├── prompts/                            # AI prompts and prompt frameworks
│   ├── 01-competitor-analysis.md
│   ├── 02-code-review-agent.md
│   ├── 03-user-segmentation.md
│   └── 04-microservices-architecture.md
├── guides/                             # Step-by-step guides and tutorials
│   ├── 01-rig-deployment.md
│   ├── 02-repo-configuration.md
│   ├── 03-decision-journal.md
│   └── 04-advanced-agents.md
└── rulesets/                           # Code style rules for AI assistants
    ├── react-typescript.md
    └── fastapi-python.md
```

## File Naming Convention

- **Prompts and Guides**: Prefixed with a two-digit number for ordering: `NN-slug.md` (e.g., `01-competitor-analysis.md`)
- **Rulesets**: Named by the technology they cover: `technology-name.md` (e.g., `react-typescript.md`)
- Slugs use lowercase with hyphens (kebab-case)
- No spaces or special characters in file names

## Frontmatter Schema

Each file begins with YAML frontmatter between `---` delimiters. Fields vary by content type.

### Prompts

| Field         | Type       | Required | Description                             |
|---------------|------------|----------|-----------------------------------------|
| `title`       | string     | yes      | Display title                           |
| `description` | string     | yes      | Short description (1-2 sentences)       |
| `author`      | string     | yes      | Author name                             |
| `tags`        | string[]   | yes      | Category tags (uppercase)               |
| `tech`        | string     | yes      | Recommended AI tools or technologies    |
| `copies`      | number     | no       | Number of times the prompt was copied   |
| `status`      | string     | yes      | `published`, `draft`, or `pending`      |

### Guides

| Field         | Type       | Required | Description                             |
|---------------|------------|----------|-----------------------------------------|
| `title`       | string     | yes      | Display title                           |
| `description` | string     | yes      | Short description (1-2 sentences)       |
| `author`      | string     | yes      | Author name                             |
| `category`    | string     | yes      | Category (e.g., CLAUDE CODE, CURSOR)    |
| `time`        | string     | yes      | Estimated reading time                  |
| `views`       | number     | no       | View count                              |
| `date`        | string     | yes      | Publication date                        |
| `status`      | string     | yes      | `published`, `draft`, or `pending`      |

### Rulesets

| Field         | Type       | Required | Description                             |
|---------------|------------|----------|-----------------------------------------|
| `title`       | string     | yes      | Display title                           |
| `description` | string     | yes      | Short description (1-2 sentences)       |
| `language`    | string     | yes      | Primary language (uppercase)            |
| `status`      | string     | yes      | `published`, `draft`, or `pending`      |

## How to Contribute New Content

1. **Pick the content type** (prompt, guide, or ruleset) and navigate to the corresponding directory.

2. **Create a new Markdown file** following the naming convention:
   - For prompts/guides: use the next available number prefix (e.g., `05-my-new-prompt.md`)
   - For rulesets: use the technology name (e.g., `go-stdlib.md`)

3. **Add YAML frontmatter** at the top of the file with all required fields for the content type (see schema above). Set `status: draft` for new content.

4. **Write the body content** in Markdown below the frontmatter. Use Russian for all user-facing content. Structure with headings (`##`), code blocks, and lists.

5. **Submit a pull request** for review. A moderator will review the content and change the status to `published` when approved.

### Content Guidelines

- All user-facing content should be written in Russian
- Use proper Markdown formatting: headings, code blocks with language tags, lists
- Include practical examples and code snippets where applicable
- Keep descriptions concise but informative
- Tags in frontmatter should be uppercase Russian words
