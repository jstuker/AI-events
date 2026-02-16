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

export interface GitHubFileContent {
  readonly sha: string
  readonly content: string
  readonly encoding: string
  readonly size: number
  readonly name: string
  readonly path: string
}

export interface GitHubUpdateResponse {
  readonly content: {
    readonly sha: string
    readonly path: string
  }
  readonly commit: {
    readonly sha: string
    readonly message: string
  }
}

export interface GitHubCommitEntry {
  readonly sha: string
  readonly commit: {
    readonly message: string
    readonly author: {
      readonly name: string
      readonly date: string
    }
  }
  readonly html_url: string
}
