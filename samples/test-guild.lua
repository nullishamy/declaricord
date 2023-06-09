local dc = require('discord')

return {
    id = "1008440520168702053",
    ---@param self GuildSetup
    setup = function(self)
        self.global.text {
            id      = "1094801227080015882",
            comment = "global",
            topic   = "nothing"
        }

        self.global.voice {
            id         = "1095430872712347779",
            comment    = "globalvoice",
            topic      = "nothing",
            bitrate    = 64000,
            user_limit = 0
        }

        self.global.role {
            id = "1008440690470047805",
            comment = "mods",

            send_messages = true,
            create_instant_invite = true,
            add_reactions = true,
            stream = true,
            view_channel = true,
            embed_links = true,
            attach_files = true,
            read_message_history = true,
            mention_everyone = true,
            use_external_emojis = true,
            connect = true,
            speak = true,
            use_vad = true,
            change_nickname = true,
            use_application_commands = true,
            create_public_threads = true,
            create_private_threads = true,
            use_external_stickers = true,
            send_messages_in_threads = true,
            use_embedded_activities = true,
            request_to_speak = true
        }

        self.global.role {
            id = "1008440520168702053",
            comment = "@everyone",

            create_instant_invite = true,
            add_reactions = false,
            stream = true,
            view_channel = true,
            send_messages = true,
            embed_links = true,
            attach_files = true,
            read_message_history = true,
            use_external_emojis = true,
            connect = true,
            speak = true,
            use_vad = true,
            change_nickname = true,
            use_application_commands = true,
            create_public_threads = true,
            create_private_threads = true,
            use_external_stickers = true,
        }

        self.category {
            id = "1008440520672038993",
            comment = "Text channels",
            channels = {
                self.channel.text {
                    id = "1008440520672038995",
                    comment = "general",
                    topic = "nothing",

                    overrides = {
                        self.role {
                            id = "1008440520168702053",
                            comment = "@everyone"
                        }
                    }
                }
            },
            overrides = {
                self.role {
                    id = "1008440520168702053",
                    comment = "@everyone"
                }
            }
        }

        self.category {
            id = "1008440520672038994",
            comment = "Voice channels",
            channels = {
                self.channel.voice {
                    id = "1008440520672038996",
                    comment = "General",
                    bitrate = 64000,
                    user_limit = 0
                }
            }
        }
    end
}
