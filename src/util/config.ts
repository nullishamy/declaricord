import { z } from "zod";

export const Config = z.object({
    token: z.string().nonempty(),
    discordConfig: z.string().nonempty(),
    verbosity: z.number().default(0)
})

export type Config = z.infer<typeof Config>