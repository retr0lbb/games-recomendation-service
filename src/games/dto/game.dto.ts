import z from "zod";


export const gameSchema = z.object({
    id: z.number(),
    title: z.string(),
    metacriticScore: z.number(),
    imageUrl: z.url(),
    slug: z.string(),
    released: z.coerce.date(),
    summary: z.string(),
    
    platforms: z.array(z.object({
        id: z.number(),
        slug: z.string().slugify(),
        name: z.string()
    })),
    genres: z.array(z.object({
        id: z.number(),
        slug: z.string().slugify(),
        name: z.string()
    }))
})

export type GameDto = z.infer<typeof gameSchema>