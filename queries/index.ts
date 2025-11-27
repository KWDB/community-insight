// 统一查询模块入口，避免 webpack 动态上下文扫描整个项目
export const QUERIES: Record<string, () => Promise<any>> = {
  downloadsTotal: () => import('./downloadsTotal'),
  downloadsNumLine: () => import('./downloadsNumLine'),
  downloadsDocker: () => import('./downloadsDocker'),
  downloadsGithub: () => import('./downloadsGithub'),
  githubTotal: () => import('./githubTotal'),
  cloneGitee: () => import('./cloneGitee'),
  giteeCloneLine: () => import('./giteeCloneLine'),
  releaseNumLine: () => import('./releaseNumLine'),
}
