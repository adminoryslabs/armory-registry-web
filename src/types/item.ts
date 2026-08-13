export type ItemType = "skill" | "prompt" | "mcp";

export interface ItemSummary {
  id: number;
  name: string;
  description: string;
  type: ItemType;
  tags: string[];
  path: string;
  updated_at: string;
  repo_url?: string;
  docs_url?: string;
}

export interface ItemDetail extends ItemSummary {
  body: string;
  install_command?: string;
}

export interface ItemsResponse {
  count: number;
  items: ItemSummary[];
}
