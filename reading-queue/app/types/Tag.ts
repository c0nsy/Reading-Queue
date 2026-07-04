export type Tag = "tech" | "entertainment" | "sports" | "esports" | "finance";

export interface TagFilterValue {
  selectedTags: Tag[];
  toggle: (tag: Tag) => void;
}
