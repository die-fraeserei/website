import type { ImageMetadata } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projekte'>;

export interface ProjectImage {
  src: ImageMetadata;
  /** File name, e.g. "02-fraesen.jpg" */
  name: string;
  caption?: string;
  alt: string;
}

// Every JPEG in every project folder, resolved at build time (Astro optimises them).
const allImages = import.meta.glob<ImageMetadata>('/src/data/projekte/*/*.{jpg,jpeg,JPG,JPEG}', {
  eager: true,
  import: 'default',
});

/** Published projects, newest first. Drafts are only included in `npm run dev`. */
export const getProjects = async (): Promise<Project[]> => {
  const projects = await getCollection('projekte', ({ data }) => import.meta.env.DEV || !data.draft);
  return projects.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
};

/** Folder name of a project, e.g. "2026-10-tele-body-esche". */
const folderOf = (project: Project): string => (project.filePath ?? '').split('/').slice(-2, -1)[0] ?? '';

const baseName = (fileName: string): string => fileName.replace(/\.[^.]+$/, '');

/** All JPEGs in the project's folder: the cover first, then the others sorted by file name. */
export const getProjectImages = (project: Project): ProjectImage[] => {
  const { title, cover, coverAlt, captions = {} } = project.data;
  const prefix = `/src/data/projekte/${folderOf(project)}/`;
  // The resolved cover URL contains the original base name (dev: /@fs/…/cover.jpg, build: /_astro/cover.<hash>.jpg).
  const isCover = (name: string) => cover.src.includes(`/${baseName(name)}.`);

  const images = Object.entries(allImages)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, src]) => {
      const name = path.slice(prefix.length);
      const caption = captions[name] ?? (isCover(name) ? coverAlt : undefined);
      return { src, name, caption, alt: caption ?? `${title} – Foto ${baseName(name)}`, cover: isCover(name) };
    })
    .sort((a, b) => Number(b.cover) - Number(a.cover) || a.name.localeCompare(b.name, 'de', { numeric: true }));

  return images.map(({ cover: _cover, ...image }) => image);
};

/** Neighbours in the (newest-first) list: `newer` and `older` project, if any. */
export const getAdjacentProjects = (projects: Project[], id: string): { newer?: Project; older?: Project } => {
  const index = projects.findIndex((p) => p.id === id);
  return { newer: index > 0 ? projects[index - 1] : undefined, older: projects[index + 1] };
};

export const formatProjectDate = (date: Date): string =>
  new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date);
