import { Bookmark, Copy, Download, Eye, Layers3, Lock, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { CodeBlock } from "../components/CodeBlock";
import { ComponentCard } from "../components/ComponentCard";
import { CollectionPicker } from "../components/modals/CollectionPicker";
import { UpgradeModal } from "../components/modals/UpgradeModal";
import { Button } from "../components/ui/Button";
import { CodeSkeleton } from "../components/ui/CodeSkeleton";
import { useAuth } from "../hooks/useAuth";
import { useComponent, useCopyComponent, useDownloadComponent, useRelatedComponents } from "../hooks/useComponent";
import { pageShell, panelClass } from "../site";

export default function ComponentDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useComponent(slug);
  const relatedQuery = useRelatedComponents(slug);
  const copyMutation = useCopyComponent();
  const downloadMutation = useDownloadComponent();
  const { user, isLoggedIn, isPro } = useAuth();
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setSelectedFileIndex(0);
    }
  }, [data?.id]);

  const activeFile = useMemo(() => data?.code_files?.[selectedFileIndex] ?? data?.code_files?.[0], [data, selectedFileIndex]);

  function handleGate(action: () => void) {
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/components/${slug}`)}`);
      return;
    }
    if (data?.requires_pro && !isPro) {
      setUpgradeOpen(true);
      return;
    }
    action();
  }

  async function handleCopyPrimary() {
    const response = await copyMutation.mutateAsync(slug);
    const primary = response.code_files.find((item) => item.is_primary) ?? response.code_files[0];
    if (primary) {
      await navigator.clipboard.writeText(primary.code);
      toast.success("Copied to clipboard!");
    }
  }

  async function handleCopyAll() {
    if (!data) return;
    const contents = data.code_files.map((file) => `// ${file.filename}\n${file.code}`).join("\n\n");
    await navigator.clipboard.writeText(contents);
    toast.success("All files copied!");
  }

  function handleDownload() {
    downloadMutation.mutate(slug, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${slug}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary">
        <Navbar />
        <div className={`${pageShell} pt-10`}>
          <CodeSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-base text-text-primary">
        <Navbar />
        <div className={`${pageShell} pt-20 text-center`}>
          <p className="font-display text-4xl tracking-[-0.04em]">Component not found</p>
          <Link to="/components">
            <Button className="mt-6">Back to components</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar />
      <div className={`${pageShell} space-y-8 pt-10`}>
        <div className="text-sm text-text-secondary">
          <Link className="hover:text-text-primary" to="/components">
            Components
          </Link>{" "}
          / {data.category ?? "Library"} / {data.name}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className={`${panelClass} overflow-hidden rounded-[20px]`}>
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3 text-sm text-text-secondary">
                <span>Preview</span>
                <span className="font-mono text-xs text-text-muted">v{data.version}</span>
              </div>
              <div className="aspect-[16/10] bg-black">
                {data.preview_video_url ? (
                  <video autoPlay className="h-full w-full object-cover" loop muted playsInline src={data.preview_video_url} />
                ) : data.preview_image_url ? (
                  <img alt={data.name} className="h-full w-full object-cover" loading="lazy" src={data.preview_image_url} />
                ) : data.preview_url ? (
                  <iframe className="h-full w-full" src={data.preview_url} title={data.name} />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted">Preview unavailable</div>
                )}
              </div>
            </section>

            <section className={`${panelClass} rounded-[20px]`}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {data.category ? <span className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-secondary">{data.category}</span> : null}
                    <span className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-secondary">{data.framework}</span>
                    {data.is_pro ? <span className="rounded-full bg-accent-cyan px-2.5 py-1 text-xs font-semibold text-black">PRO</span> : <span className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-secondary">FREE</span>}
                  </div>
                  <h1 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.04em]">{data.name}</h1>
                  <p className="mt-4 max-w-3xl text-text-secondary">{data.description}</p>
                </div>
                <div className="rounded-[16px] border border-border-default bg-white/4 px-4 py-3 text-right text-sm text-text-secondary">
                  <p>by @{data.author.username}</p>
                  <p className="text-xs text-text-muted">{data.author.full_name ?? "Independent creator"}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <Link key={tag} className="rounded-full border border-border-default px-3 py-2 text-xs text-text-secondary hover:text-text-primary" to={`/components?tags=${tag}`}>
                    {tag}
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4" />{data.views_count} views</span>
                <span className="inline-flex items-center gap-2"><Copy className="h-4 w-4" />{data.copies_count} copies</span>
                <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" />{data.downloads_count} downloads</span>
                <span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4" />{data.code_files.length} files</span>
              </div>

              {data.trust_badges.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {data.trust_badges.map((badge) => (
                    <span key={badge.badge_type} className="rounded-full border border-border-default bg-white/4 px-3 py-2 text-xs text-text-primary">
                      {badge.badge_type.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="prose prose-invert mt-8 max-w-none prose-p:text-text-secondary prose-li:text-text-secondary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.long_description ?? "No additional documentation yet."}</ReactMarkdown>
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className={`${panelClass} rounded-[20px]`}>
              <div className="space-y-3">
                <Button fullWidth loading={copyMutation.isPending} onClick={() => handleGate(handleCopyPrimary)}>
                  <Copy className="h-4 w-4" />
                  {data.requires_pro && !isPro ? "Unlock with Pro" : "Copy Code"}
                </Button>
                <Button fullWidth variant="secondary" loading={downloadMutation.isPending} onClick={() => handleGate(handleDownload)}>
                  <Download className="h-4 w-4" />
                  Download ZIP
                </Button>
                <Button fullWidth variant="ghost" onClick={() => setPickerOpen((value) => !value)}>
                  <Bookmark className="h-4 w-4" />
                  Save to Collection
                </Button>
                {pickerOpen ? <CollectionPicker componentId={data.id} /> : null}
              </div>

              {data.install_command ? (
                <div className="mt-5 rounded-[16px] border border-border-default bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Install</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <code className="font-mono text-sm text-text-primary">{data.install_command}</code>
                    <button className="text-text-secondary hover:text-text-primary" onClick={() => navigator.clipboard.writeText(data.install_command ?? "")} type="button">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {data.dependencies.length ? (
                <div className="mt-5 rounded-[16px] border border-border-default bg-white/4 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Dependencies</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.dependencies.map((dependency) => (
                      <span key={dependency} className="rounded-full border border-border-default px-2.5 py-1 text-xs text-text-secondary">{dependency}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className={`${panelClass} rounded-[20px] relative`}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">Files</p>
                <button className="text-xs text-text-secondary hover:text-text-primary" onClick={handleCopyAll} type="button">Copy all files</button>
              </div>
              <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle pb-4">
                {data.code_files.map((file, index) => (
                  <button
                    key={file.filename}
                    className={`rounded-[10px] px-3 py-2 text-sm ${index === selectedFileIndex ? "border border-border-default bg-white/6 text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
                    onClick={() => setSelectedFileIndex(index)}
                    type="button"
                  >
                    {file.filename}
                  </button>
                ))}
              </div>
              {activeFile ? <CodeBlock file={activeFile} /> : null}

              {data.requires_pro && !isPro ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/55 p-6 backdrop-blur-md">
                  <div className="max-w-xs rounded-[18px] border border-border-default bg-bg-card p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/6 text-accent-cyan">
                      <Lock className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-text-primary">This is a Pro component</p>
                    <p className="mt-2 text-sm text-text-secondary">Preview the structure now and unlock the source files with your Pro plan.</p>
                    <div className="mt-5 space-y-3">
                      {user ? (
                        <Link to="/dashboard/billing"><Button fullWidth><Sparkles className="h-4 w-4" />Upgrade to Pro</Button></Link>
                      ) : (
                        <Link to={`/login?redirect=${encodeURIComponent(`/components/${slug}`)}`}><Button fullWidth>Sign in</Button></Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </aside>
        </div>

        {relatedQuery.data?.length ? (
          <section className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Related</p>
              <h2 className="mt-2 font-display text-3xl tracking-[-0.04em]">More components you might use</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {relatedQuery.data.slice(0, 4).map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <Footer />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
