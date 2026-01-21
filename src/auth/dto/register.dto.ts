import z from "zod/v4";


export const registerPayloadSchema = z.object({
    email: z.email(),
    userName: z.string().nonempty(),
    password: z.string().nonempty()
})

export type RegisterPayload = z.infer<typeof registerPayloadSchema>