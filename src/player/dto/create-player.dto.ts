import z from "zod";

export const createPlayerDtoSchema = z.object({
    name: z.string(),
    id: z.uuid().optional(),
    platforms: z.array(z.int().positive())
})


export type CreatePlayerDto = z.infer<typeof createPlayerDtoSchema>