import z from "zod";

export const createPlayerDtoSchema = z.object({
    name: z.string(),
    id: z.uuid().optional()
})


export type CreatePlayerDto = z.infer<typeof createPlayerDtoSchema>