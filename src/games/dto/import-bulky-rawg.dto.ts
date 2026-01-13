import z from "zod";


export const importBulkyFromRawgSchema = z.object({
    gamesIds: z.array(z.int())
})

export type ImportBulkyFromRawgDto = z.infer<typeof importBulkyFromRawgSchema>