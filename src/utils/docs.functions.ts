import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'
import { renderMarkdown } from '~/utils/markdown'

type FetchDocsParams = {
  repo: string
  branch: string
  filePath: string
}

export const fetchRemoteMarkdown = createServerFn({ method: 'GET' })
  .inputValidator((params: FetchDocsParams) => params)
  .handler(async ({ data: { repo, branch, filePath } }) => {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.status}`)
    }

    const rawContent = await response.text()
    const { data: frontmatter, content } = matter(rawContent)
    const { markup, headings } = await renderMarkdown(content)

    return {
      frontmatter,
      markup,
      headings,
      filePath,
    }
  })

type GitHubContent = {
  name: string
  path: string
  type: 'file' | 'dir'
}

export const fetchRepoContents = createServerFn({ method: 'GET' })
  .inputValidator(
    (params: { repo: string; branch: string; path: string }) => params,
  )
  .handler(async ({ data: { repo, branch, path } }) => {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contents: ${response.status}`)
    }

    const contents = (await response.json()) as Array<GitHubContent>

    return contents
      .filter((item) => item.type === 'file' && item.name.endsWith('.md'))
      .map((item) => ({
        name: item.name.replace('.md', ''),
        path: item.path,
      }))
  })
