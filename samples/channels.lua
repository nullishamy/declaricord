return {
    id = "1094801227080015882",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",
        }

        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel",
            topic = "a topic"
        }

        self.global.voice {
            id = "1094801227080015882",
            comment = "test-channel-2",
            nsfw = true,
        }


        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel-2",
            nsfw = true,
            slowmode = 25,
        }

        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel-3",
            slowmode = 25,
        }
    end
}
