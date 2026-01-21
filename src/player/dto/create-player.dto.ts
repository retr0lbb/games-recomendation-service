import z from "zod";

export const createPlayerDtoSchema = z.object({
    platforms: z.array(z.int().positive())
})


export type CreatePlayerDto = z.infer<typeof createPlayerDtoSchema>