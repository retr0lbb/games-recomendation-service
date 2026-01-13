import z from "zod";

export const updatePlayStatusSchema = z.object({
    status: z.union([z.literal("is_playing"), z.literal("has_finished")]),
    updateScore: z.int().max(100).min(0).optional(),
    finishedAt: z.coerce.date().optional(),
    hoursPlaying: z.int().positive().optional()
})

export type UpdatePlayerStatusDto = z.infer<typeof updatePlayStatusSchema>