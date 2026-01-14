import z from "zod";


export const saveRecommendationsSchema = z.object({
    games: z.array(z.object({
        gameId: z.number(),
        recommendationScore: z.coerce.number()
    }))
})


export type SaveRecommendationsDto = z.infer<typeof saveRecommendationsSchema>