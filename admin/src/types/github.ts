export interface GitHubTreeItem {
  readonly path: string
  readonly mode: string
  readonly type: string
  readonly sha: string
  readonly size?: number
  readonly url: string
}

export interface GitHubTreeResponse {
  readonly sha: string
  readonly url: string
  readonly tree: readonly GitHubTreeItem[]
  readonly truncated: boolean
}

export interface GitHubBlobResponse {
  readonly sha: string
  readonly node_id: string
  readonly size: number
  readonly url: string
  readonly content: string
  readonly encoding: string
}
