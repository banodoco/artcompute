export interface ShowcaseItem {
  src: string;
  artist: string;
  handle: string;
  avatar: string;
  bgStart?: number;
  tool?: string;
  poster?: string;
}

export interface ShowcaseControls {
  item: ShowcaseItem;
  progress: number;
  canNavigate: boolean;
  next: (fast?: boolean) => void;
  prev: (fast?: boolean) => void;
  openFullscreen: () => void;
}
