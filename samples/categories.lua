return {
    id = "1094801227080015882",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",
        }

        self.category {
            id = "1094801227080015882",
            comment = "a-category",
            channels = {
                self.channel.text {
                    id = "1094801227080015882",
                    comment = "a-channel",
                },
                self.channel.voice {
                    id = "1094801227080015882",
                    comment = "a-voice-channel"
                }
            },
        }

        self.category {
            id = "1094801227080015882",
            comment = "another-category",
            channels = {
                self.channel.text {
                    id = "1094801227080015882",
                    comment = "an-nsfw-channel",
                    nsfw = true
                },
                self.channel.voice {
                    id = "1094801227080015882",
                    comment = "a-voice-channel"
                }
            },
        }
    end
}
