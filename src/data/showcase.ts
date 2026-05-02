import { ShowcaseItem } from "../types/showcase";

export const WALLET_ADDRESS = "FBXSuVueW9Z1U2RmgmYazAX1GGdzay75AKHD9ijJpszq";
export const FALLBACK_BALANCE = 34.0001;

export const REQUEST_COMPUTE_URL = "https://discord.gg/kEqEbsAb8Q";
export const BANODOCO_URL = "https://banodoco.ai";
export const ACCOUNTABILITY_URL = "https://pom.voyage/assorted/accountability#pisscoin-grants";

const X_PROFILE_BASE_URL = "https://x.com";
const SOLSCAN_ACCOUNT_BASE_URL = "https://solscan.io/account";

export function getArtistProfileUrl(handle: string): string {
  return `${X_PROFILE_BASE_URL}/${handle.replace(/^@/, "")}`;
}

export function getWalletExplorerUrl(walletAddress: string): string {
  return `${SOLSCAN_ACCOUNT_BASE_URL}/${walletAddress}`;
}

export const SHOWCASE: ShowcaseItem[] = [
  {
    src: "/datavoid.mp4",
    artist: "Datavoid",
    handle: "@DataPlusEngine",
    avatar: "/datavoid.jpg",
    poster: "/datavoid_poster.jpg",
    tool: "NeRF",
  },
  {
    src: "/visualfrisson.mp4",
    artist: "Visual Frisson",
    handle: "@visualfrisson",
    avatar: "/visualfrisson.jpg",
    poster: "/visualfrisson_poster.jpg",
    tool: "AnimateDiff",
  },
  {
    src: "/emmacatnip.mp4",
    artist: "Emma Catnip",
    handle: "@emmacatnip",
    avatar: "/emmacatnip.jpg",
    poster: "/emmacatnip_poster.jpg",
    tool: "HotshotXL",
  },
  {
    src: "/hannah_submarine.mp4",
    artist: "Hannah Submarine",
    handle: "@hannahsubmarine",
    avatar: "/hannah_submarine.jpg",
    poster: "/hannah_submarine_poster.jpg",
    bgStart: 5,
    tool: "LTX",
  },
  {
    src: "/_ArtOnTap.mp4",
    artist: "ArtOnTap",
    handle: "@_ArtOnTap",
    avatar: "/_ArtOnTap.jpg",
    poster: "/_ArtOnTap_poster.jpg",
    tool: "Deforum",
    bgStart: 5,
  },
  {
    src: "/flipping_sigmas.mp4",
    artist: "Flipping Sigmas",
    handle: "@FlippingSigmas",
    avatar: "/flipping_sigmas.jpg",
    poster: "/flipping_sigmas_poster.jpg",
    tool: "WarpFusion",
    bgStart: 3,
  },
  {
    src: "/machine_delusions.mp4",
    artist: "Machine Delusions",
    handle: "@Machinedelusion",
    avatar: "/machine_delusions.jpg",
    poster: "/machine_delusions_poster.jpg",
    tool: "AnimateLCM",
    bgStart: 2,
  },
];
