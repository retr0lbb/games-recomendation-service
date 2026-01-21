import z from "zod/v4";


export const loginPayloadSchema = z.object({
    email: z.email(),
    password: z.string().nonempty()
})

export type LoginPayload = z.infer<typeof loginPayloadSchema>