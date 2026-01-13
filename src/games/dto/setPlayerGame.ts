import z from "zod";

export const setPlayerGameSchema = z.object({
    gameId: z.number().int().positive(),
    status: z.union([
        z.literal("is_playing"),
        z.literal("has_finished"),
    ]),
    score: z.number().positive(),
    hours_played: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional()
})

export type SetPlayerGameBodyDTO = z.infer<typeof setPlayerGameSchema>