return {
    id = "172018499005317120",
    version = "v1.0.0",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",

            manage_channels = true
        }

        self.category {
            id = "1008440520672038994",
            comment = "Text channels",
            channels = {
                self.channel.text {
                    id = "1008440520672038996",
                    comment = "General",
                },
                self.channel.text {
                    id = "1008940520672038996",
                    comment = "no-manage",
                    overrides = {
                        self.override.role {
                            id = "172018499005317120",
                            comment = "@everyone",

                            manage_channels = false,
                            manage_guild = true
                        }
                    }
                },
                self.channel.text {
                    id = "1008940520672038986",
                    comment = "inherit-manage",
                    overrides = {
                        self.override.role {
                            id = "172018499005317120",
                            comment = "@everyone",

                            speak = true
                        }
                    }
                }
            },
            overrides = {
                self.override.role {
                    id = "172018499005317120",
                    comment = "@everyone",

                    manage_channels = true,
                    manage_guild = false
                }
            }
        }
    end
}
