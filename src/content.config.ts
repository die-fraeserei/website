import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    /** Alternative text for the cover image. Leave empty for decorative stock photos. */
    imageAlt: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

// Projekte: one folder per project in src/data/projekte/<YYYY-MM[-DD]-slug>/ with an index.md
// and JPEG photos. The URL slug is the folder name without the date prefix. See README "Adding a project".
export const PROJECT_CATEGORIES = ['Gitarrenteile', 'Schablonen', 'Werkstattzubehör', 'Sonderanfertigung'] as const;

const projectCollection = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: 'src/data/projekte',
    generateId: ({ entry }) => entry.split('/')[0].replace(/^\d{4}-\d{2}(-\d{2})?-/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      category: z.enum(PROJECT_CATEGORIES),
      tags: z.array(z.string()).optional(),
      teaser: z.string(),
      cover: image(),
      coverAlt: z.string(),
      /** Ordered key → value pairs shown in the fact box (e.g. Kunde, Material, Dauer). */
      facts: z.record(z.string(), z.string()).optional(),
      /** File name → caption for gallery photos (also used as alt text). */
      captions: z.record(z.string(), z.string()).optional(),
      testimonial: z
        .object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
        })
        .optional(),
      draft: z.boolean().default(false),
      metadata: metadataDefinition(),
    }),
});

export const collections = {
  post: postCollection,
  projekte: projectCollection,
};
