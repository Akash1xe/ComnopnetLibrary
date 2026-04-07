import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as componentsApi from "../../api/components";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { CodeFile, ComponentFramework, ComponentStatus, TrustBadgeType } from "../../types";

const badgeOptions: TrustBadgeType[] = [
  "team_curated",
  "verified_creator",
  "accessible",
  "responsive",
  "dark_mode_ready",
  "recently_updated",
  "popular",
  "trending",
  "typescript",
  "tested",
];

export default function ComponentEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState("button");
  const [framework, setFramework] = useState<ComponentFramework>("react");
  const [tagInput, setTagInput] = useState("button, ui");
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [installCommand, setInstallCommand] = useState("");
  const [dependenciesInput, setDependenciesInput] = useState("");
  const [status, setStatus] = useState<ComponentStatus>("draft");
  const [isFree, setIsFree] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<TrustBadgeType[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([
    { filename: "Component.tsx", language: "tsx", code: "export function Component() {\n  return <div />;\n}\n", is_primary: true, order: 0 },
  ]);

  const detailQuery = useQuery({
    queryKey: ["component-editor-detail", id],
    queryFn: () => componentsApi.getAdminComponent(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!detailQuery.data) return;
    const component = detailQuery.data;
    setName(component.name);
    setShortDescription(component.description ?? "");
    setLongDescription(component.long_description ?? "");
    setCategorySlug(component.category_slug ?? "button");
    setFramework(component.framework);
    setTagInput(component.tags.join(", "));
    setPreviewImageUrl(component.preview_image_url ?? "");
    setPreviewVideoUrl(component.preview_video_url ?? "");
    setInstallCommand(component.install_command ?? "");
    setDependenciesInput(component.dependencies.join(", "));
    setStatus("draft");
    setIsFree(component.is_free);
    setSelectedBadges(component.trust_badges.map((badge) => badge.badge_type));
    setFiles(component.code_files);
  }, [detailQuery.data]);

  const payload = useMemo(() => ({
    name,
    short_description: shortDescription || null,
    long_description: longDescription || null,
    category_slug: categorySlug,
    tag_slugs: tagInput.split(",").map((item) => item.trim()).filter(Boolean),
    framework,
    code_files: files.map((file, index) => ({ ...file, order: index, is_primary: index === 0 ? true : file.is_primary })),
    is_free: isFree,
    status,
    is_featured: isFeatured,
    is_trending: isTrending,
    preview_image_url: previewImageUrl || null,
    preview_video_url: previewVideoUrl || null,
    install_command: installCommand || null,
    dependencies: dependenciesInput.split(",").map((item) => item.trim()).filter(Boolean),
    trust_badges: selectedBadges,
  }), [name, shortDescription, longDescription, categorySlug, tagInput, framework, files, isFree, status, isFeatured, isTrending, previewImageUrl, previewVideoUrl, installCommand, dependenciesInput, selectedBadges]);

  const saveMutation = useMutation({
    mutationFn: () => (isEditing && id ? componentsApi.updateComponent(id, payload, true) : componentsApi.createComponent(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-components"] });
      navigate("/admin/components");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">{isEditing ? "Edit Component" : "Create Component"}</h1>
            <p className="mt-2 text-sm text-text-secondary">Manage presentation, delivery files, and trust metadata from one editor.</p>
          </div>
          <Link to="/admin/components"><Button variant="secondary">Back</Button></Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 rounded-[18px] border border-border-subtle bg-bg-card p-6">
            <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
            <Input label="Short description" onChange={(event) => setShortDescription(event.target.value)} value={shortDescription} />
            <label className="grid gap-2 text-sm text-text-primary">
              <span>Documentation</span>
              <textarea className="min-h-[220px] rounded-[6px] border border-border-default bg-black p-4 text-text-primary outline-none focus-visible:focus-ring" onChange={(event) => setLongDescription(event.target.value)} value={longDescription} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Category slug" onChange={(event) => setCategorySlug(event.target.value)} value={categorySlug} />
              <label className="grid gap-2 text-sm text-text-primary">
                <span>Framework</span>
                <select className="min-h-11 rounded-[6px] border border-border-default bg-black px-4 text-text-primary" onChange={(event) => setFramework(event.target.value as ComponentFramework)} value={framework}>
                  <option value="react">React</option>
                  <option value="vue">Vue</option>
                  <option value="svelte">Svelte</option>
                  <option value="angular">Angular</option>
                  <option value="html">HTML</option>
                </select>
              </label>
            </div>
            <Input label="Tags" onChange={(event) => setTagInput(event.target.value)} value={tagInput} />
            <Input label="Preview image URL" onChange={(event) => setPreviewImageUrl(event.target.value)} value={previewImageUrl} />
            <Input label="Preview video URL" onChange={(event) => setPreviewVideoUrl(event.target.value)} value={previewVideoUrl} />
            <Input label="Install command" onChange={(event) => setInstallCommand(event.target.value)} value={installCommand} />
            <Input label="Dependencies" onChange={(event) => setDependenciesInput(event.target.value)} value={dependenciesInput} />
          </div>

          <div className="space-y-5 rounded-[18px] border border-border-subtle bg-bg-card p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 text-sm text-text-primary"><input checked={isFree} onChange={(event) => setIsFree(event.target.checked)} type="checkbox" />Free component</label>
              <label className="flex items-center gap-3 text-sm text-text-primary"><input checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} type="checkbox" />Featured</label>
              <label className="flex items-center gap-3 text-sm text-text-primary"><input checked={isTrending} onChange={(event) => setIsTrending(event.target.checked)} type="checkbox" />Trending</label>
              <label className="grid gap-2 text-sm text-text-primary">
                <span>Status</span>
                <select className="min-h-11 rounded-[6px] border border-border-default bg-black px-4 text-text-primary" onChange={(event) => setStatus(event.target.value as ComponentStatus)} value={status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-text-primary">Trust badges</p>
              <div className="flex flex-wrap gap-2">
                {badgeOptions.map((badge) => {
                  const active = selectedBadges.includes(badge);
                  return (
                    <button
                      key={badge}
                      className={`rounded-full border px-3 py-2 text-xs ${active ? "border-accent-cyan bg-white/6 text-accent-cyan" : "border-border-default text-text-secondary"}`}
                      onClick={() => setSelectedBadges((current) => (active ? current.filter((item) => item !== badge) : [...current, badge]))}
                      type="button"
                    >
                      {badge.replace(/_/g, " ")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">Files</p>
                <Button variant="secondary" onClick={() => setFiles((current) => [...current, { filename: `file-${current.length + 1}.tsx`, language: "tsx", code: "", is_primary: false, order: current.length }])}>Add file</Button>
              </div>
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div key={`${file.filename}-${index}`} className="rounded-[16px] border border-border-default bg-black/40 p-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                      <Input label="Filename" onChange={(event) => setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, filename: event.target.value } : item))} value={file.filename} />
                      <label className="grid gap-2 text-sm text-text-primary">
                        <span>Language</span>
                        <select className="min-h-11 rounded-[6px] border border-border-default bg-black px-4 text-text-primary" onChange={(event) => setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, language: event.target.value as CodeFile['language'] } : item))} value={file.language}>
                          {['tsx','jsx','ts','js','css','json','html','md'].map((language) => <option key={language} value={language}>{language}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="mt-3 flex items-center gap-3 text-sm text-text-primary"><input checked={file.is_primary} onChange={(event) => setFiles((current) => current.map((item, itemIndex) => ({ ...item, is_primary: itemIndex === index ? event.target.checked : false })))} type="checkbox" />Primary file</label>
                    <textarea className="mt-3 min-h-[180px] w-full rounded-[6px] border border-border-default bg-black p-4 font-mono text-sm text-text-primary outline-none focus-visible:focus-ring" onChange={(event) => setFiles((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, code: event.target.value } : item))} value={file.code} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{isEditing ? 'Save changes' : 'Create component'}</Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/admin/components')}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
