import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ArrowLeft, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VideoShowcase, ArtistBadge, SHOWCASE } from "./VideoShowcase";

const SUPABASE_URL = "https://ujlwuvkrxlvoswwkerdf.supabase.co";
const SUPABASE_KEY = "sb_publishable_O38oPBafrBoFrpi_rlWJvA_UJrulFsx";

interface Grant {
  id: number;
  applicant_id: string;
  status: string;
  gpu_type: string | null;
  recommended_hours: number | null;
  gpu_rate_usd: number | null;
  total_cost_usd: number | null;
  sol_amount: number | null;
  sol_price_usd: number | null;
  wallet_address: string | null;
  tx_signature: string | null;
  llm_assessment: string | null;
  thread_content: string | null;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
  rejected_at: string | null;
  attachment_urls: { url: string; filename: string }[];
}

interface Member {
  member_id: string;
  username: string;
  global_name: string | null;
  avatar_url: string | null;
  stored_avatar_url: string | null;
}

interface ParsedAssessment {
  reasoning: string;
  response: string;
}

const ACCEPTED_STATUSES = ["awaiting_wallet", "approved", "paid"];

function parseAssessment(raw: string | null): ParsedAssessment | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatGpuType(gpu: string | null): string {
  if (!gpu) return "—";
  return gpu.replace(/_/g, " ");
}

async function fetchFromSupabase<T>(table: string, params: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  // Parse with big integer safety — replace bare large numbers with strings
  const text = await res.text();
  const safe = text.replace(
    /:\s*(\d{16,})/g,
    ': "$1"'
  );
  return JSON.parse(safe);
}

export default function GrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [members, setMembers] = useState<Map<string, Member>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch accepted grants
        const statusFilter = ACCEPTED_STATUSES.map((s) => `"${s}"`).join(",");
        const grantData = await fetchFromSupabase<Grant[]>(
          "grant_applications",
          `select=*&status=in.(${statusFilter})&order=created_at.desc`
        );
        setGrants(grantData);

        // Fetch member info for all applicants
        const applicantIds = [...new Set(grantData.map((g) => g.applicant_id))];
        if (applicantIds.length > 0) {
          const memberData = await fetchFromSupabase<Member[]>(
            "members",
            `select=member_id,username,global_name,avatar_url,stored_avatar_url&member_id=in.(${applicantIds.join(",")})`
          );
          const memberMap = new Map<string, Member>();
          memberData.forEach((m) => memberMap.set(String(m.member_id), m));
          setMembers(memberMap);
        }
      } catch (e) {
        console.error("Failed to load grants:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalFunded = grants.reduce((sum, g) => sum + (g.total_cost_usd || 0), 0);
  const totalHours = grants.reduce((sum, g) => sum + (g.recommended_hours || 0), 0);

  return (
    <div className="min-h-screen scanlines grain relative flex flex-col">
      {SHOWCASE.map((s) => s.avatar.startsWith("/") ? <link key={s.avatar} rel="preload" as="image" href={s.avatar} /> : null)}
      <VideoShowcase>
        {(showcaseControls) => (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* Header */}
        <header className="border-b border-white/8 px-5 md:px-10 py-3 md:py-4 flex justify-between items-center">
          <Link
            to="/"
            className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-[#39ff14]/60 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={12} />
            ArtCompute
          </Link>
          <ArtistBadge {...showcaseControls} />
        </header>

        {/* Content */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-5 md:px-10 py-8 md:py-16">
          {/* Title */}
          <section className="mb-8 md:mb-14">
            <h2 className="font-serif text-2xl md:text-4xl font-normal leading-tight text-white/95 tracking-tight">
              Approved Grants
            </h2>
            <p className="text-xs md:text-sm leading-6 text-white/45 mt-3 max-w-lg">
              Open source AI art projects funded through ArtCompute micro-grants.
            </p>
          </section>

          {/* Stats */}
          {!loading && grants.length > 0 && (
            <section className="grid grid-cols-3 gap-px mb-8 md:mb-14">
              <div className="border border-[#39ff14]/10 bg-[#39ff14]/[0.03] p-2.5 md:p-5">
                <p className="text-[8px] md:text-[9px] font-bold tracking-[0.15em] uppercase text-[#39ff14]/40">
                  Grants
                </p>
                <p className="text-xs md:text-lg font-bold mt-1 md:mt-1.5 text-white/80">
                  {grants.length}
                </p>
                <p className="text-[9px] md:text-[10px] text-white/40 mt-0.5 md:mt-1">
                  approved
                </p>
              </div>
              <div className="border border-[#a78bfa]/10 bg-[#a78bfa]/[0.03] p-2.5 md:p-5">
                <p className="text-[8px] md:text-[9px] font-bold tracking-[0.15em] uppercase text-[#a78bfa]/50">
                  Compute
                </p>
                <p className="text-xs md:text-lg font-bold mt-1 md:mt-1.5 text-white/80">
                  {totalHours}h
                </p>
                <p className="text-[9px] md:text-[10px] text-white/40 mt-0.5 md:mt-1">
                  GPU hours allocated
                </p>
              </div>
              <div className="border border-[#38bdf8]/10 bg-[#38bdf8]/[0.03] p-2.5 md:p-5">
                <p className="text-[8px] md:text-[9px] font-bold tracking-[0.15em] uppercase text-[#38bdf8]/50">
                  Funded
                </p>
                <p className="text-xs md:text-lg font-bold mt-1 md:mt-1.5 text-white/80">
                  ${totalFunded.toFixed(0)}
                </p>
                <p className="text-[9px] md:text-[10px] text-white/40 mt-0.5 md:mt-1">
                  total value
                </p>
              </div>
            </section>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-xs text-white/30 tracking-[0.15em] uppercase animate-pulse">
                Loading grants...
              </p>
            </div>
          )}

          {/* No grants */}
          {!loading && grants.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xs text-white/30 tracking-[0.15em] uppercase">
                No approved grants yet
              </p>
            </div>
          )}

          {/* Grant list */}
          <div className="space-y-px">
            {grants.map((grant) => {
              const member = members.get(String(grant.applicant_id));
              const assessment = parseAssessment(grant.llm_assessment);
              const isExpanded = expandedId === grant.id;
              const displayName =
                member?.global_name || member?.username || "Unknown";

              return (
                <motion.div
                  key={grant.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: grants.indexOf(grant) * 0.08 }}
                  className="border border-white/8 bg-white/[0.02]"
                >
                  {/* Grant header — clickable */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : grant.id)}
                    className="w-full flex items-center justify-between gap-4 px-4 md:px-6 py-4 md:py-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/8 flex-shrink-0 overflow-hidden border border-white/10">
                        {(member?.stored_avatar_url || member?.avatar_url) ? (
                          <img
                            src={member.stored_avatar_url || member.avatar_url!}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/40">
                            {displayName[0]}
                          </div>
                        )}
                      </div>
                      {/* Name + project title */}
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-white/80 truncate">
                          {displayName}
                        </p>
                        <p className="text-[10px] md:text-[11px] text-white/30 truncate">
                          {grant.thread_content?.match(/^\*\*(.+?)\*\*/)?.[1] || "Grant Application"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
                      {/* GPU info */}
                      {grant.gpu_type && (
                        <span className="hidden md:block text-[9px] tracking-[0.1em] uppercase text-white/25">
                          {formatGpuType(grant.gpu_type)} &middot; {grant.recommended_hours}h
                        </span>
                      )}
                      {/* Cost */}
                      {grant.total_cost_usd && (
                        <span className="text-xs md:text-sm font-bold text-[#39ff14]/70">
                          ${grant.total_cost_usd.toFixed(0)}
                        </span>
                      )}
                      {/* Status badge */}
                      <span
                        className={`text-[8px] md:text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 border ${
                          grant.status === "paid"
                            ? "text-[#39ff14]/60 border-[#39ff14]/20 bg-[#39ff14]/[0.05]"
                            : "text-[#a78bfa]/60 border-[#a78bfa]/20 bg-[#a78bfa]/[0.05]"
                        }`}
                      >
                        {grant.status === "awaiting_wallet"
                          ? "Approved"
                          : grant.status}
                      </span>
                      {/* Expand icon */}
                      <ChevronDown
                        size={14}
                        className={`text-white/20 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-6 pb-5 md:pb-6 border-t border-white/5">
                          {/* Detail grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-4 md:mt-5">
                            {grant.gpu_type && (
                              <div className="bg-white/[0.02] p-3">
                                <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-white/25">
                                  GPU
                                </p>
                                <p className="text-[11px] text-white/60 mt-1">
                                  {formatGpuType(grant.gpu_type)}
                                </p>
                              </div>
                            )}
                            {grant.recommended_hours && (
                              <div className="bg-white/[0.02] p-3">
                                <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-white/25">
                                  Hours
                                </p>
                                <p className="text-[11px] text-white/60 mt-1">
                                  {grant.recommended_hours}h
                                </p>
                              </div>
                            )}
                            {grant.gpu_rate_usd && (
                              <div className="bg-white/[0.02] p-3">
                                <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-white/25">
                                  Rate
                                </p>
                                <p className="text-[11px] text-white/60 mt-1">
                                  ${grant.gpu_rate_usd.toFixed(2)}/hr
                                </p>
                              </div>
                            )}
                            {grant.total_cost_usd && (
                              <div className="bg-white/[0.02] p-3">
                                <p className="text-[8px] font-bold tracking-[0.15em] uppercase text-white/25">
                                  Total
                                </p>
                                <p className="text-[11px] text-[#39ff14]/60 font-bold mt-1">
                                  ${grant.total_cost_usd.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex gap-6 mt-4 text-[10px] text-white/25">
                            <span>
                              Applied{" "}
                              <span className="text-white/40">
                                {formatDate(grant.created_at)}
                              </span>
                            </span>
                            {grant.approved_at && (
                              <span>
                                Approved{" "}
                                <span className="text-[#39ff14]/40">
                                  {formatDate(grant.approved_at)}
                                </span>
                              </span>
                            )}
                            {grant.paid_at && (
                              <span>
                                Paid{" "}
                                <span className="text-[#39ff14]/40">
                                  {formatDate(grant.paid_at)}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Transaction info */}
                          {grant.tx_signature && (
                            <div className="mt-3 text-[10px]">
                              <span className="text-white/25">Tx: </span>
                              <a
                                href={`https://solscan.io/tx/${grant.tx_signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/40 hover:text-[#39ff14]/60 underline break-all"
                              >
                                {grant.tx_signature.slice(0, 20)}...
                                <ExternalLink size={9} className="inline ml-1" />
                              </a>
                            </div>
                          )}

                          {/* Application content */}
                          <div className="mt-5 md:mt-6">
                            <p className="text-[8px] font-bold tracking-[0.25em] uppercase text-white/20 mb-3">
                              Application
                            </p>
                            <div className="text-[11px] md:text-xs leading-relaxed text-white/45 border-l-2 border-white/8 pl-4 whitespace-pre-wrap">
                              {grant.thread_content
                                ?.replace(/^\*\*(.+?)\*\*\n*/, "")
                                .trim()}
                            </div>
                          </div>

                          {/* Attachments */}
                          {grant.attachment_urls?.length > 0 && (
                            <div className="mt-5 md:mt-6">
                              <p className="text-[8px] font-bold tracking-[0.25em] uppercase text-white/20 mb-3">
                                Attachments
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {grant.attachment_urls.map((att, i) =>
                                  /\.(mp4|webm|mov)$/i.test(att.filename) ? (
                                    <video
                                      key={i}
                                      src={att.url}
                                      controls
                                      muted
                                      playsInline
                                      className="w-full rounded border border-white/8 bg-black"
                                    />
                                  ) : (
                                    <a
                                      key={i}
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <img
                                        src={att.url}
                                        alt={att.filename}
                                        className="w-full rounded border border-white/8 bg-white/[0.02] hover:border-white/20 transition-colors"
                                      />
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Assessment */}
                          {assessment && (
                            <div className="mt-5 md:mt-6">
                              <p className="text-[8px] font-bold tracking-[0.25em] uppercase text-white/20 mb-3">
                                Assessment
                              </p>
                              <div className="border-l-2 border-[#39ff14]/20 pl-4 space-y-2">
                                <p className="text-[11px] md:text-xs leading-relaxed text-white/55">
                                  {assessment.response}
                                </p>
                                <p className="text-[10px] leading-relaxed text-white/25 italic">
                                  {assessment.reasoning}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          {!loading && (
            <section className="mt-10 md:mt-16">
              <a
                href="https://discord.gg/kEqEbsAb8Q"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-[#39ff14]/15 border border-[#39ff14]/30 text-[#39ff14] text-xs md:text-sm hover:bg-[#39ff14]/25 transition-colors shadow-[0_0_20px_rgba(57,255,20,0.05)]"
              >
                Request Compute <ExternalLink size={14} />
              </a>
              <p className="text-[11px] md:text-xs text-white/35 mt-2 md:mt-3 max-w-sm leading-5">
                Apply in Discord &rarr; AI reviews &rarr; response in minutes.
              </p>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/8 px-5 md:px-10 py-3 md:py-4 flex justify-between items-center text-[10px] uppercase tracking-[0.15em] text-white/30">
          <span>&copy; 2026 ArtCompute</span>
          <span>
            A{" "}
            <a
              href="https://banodoco.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#39ff14]/40"
            >
              Banodoco
            </a>{" "}
            project
          </span>
        </footer>
      </motion.main>
        )}
      </VideoShowcase>
    </div>
  );
}
