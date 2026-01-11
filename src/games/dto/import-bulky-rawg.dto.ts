import z from "zod";


export const importBulkyFromRawgSchema = z.object({
    gamesIds: z.array(z.string())
})

export type ImportBulkyFromRawgDto = z.infer<typeof importBulkyFromRawgSchema>