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
            topic = "a topic",
            overrides = {
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods",
                    use_vad = true
                },
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods-2",
                    send_messages = true
                }
            }
        }

        self.global.voice {
            id = "1094801227080015882",
            comment = "test-channel-2",
            nsfw = true,
            overrides = {
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods",
                    speak = false,
                },
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods-2",
                    priority_speaker = true
                }
            }
        }


        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel-2",
            nsfw = true,
            slowmode = 25,


            overrides = {
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods",
                    manage_messages = true
                },
                self.override.user {
                    id = "1094801227080015882",
                    comment = "mods-2",
                    attach_files = false
                }
            }
        }

        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel-3",
            slowmode = 25,

            overrides = {
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods",
                    manage_roles = true
                },
                self.override.role {
                    id = "1094801227080015882",
                    comment = "mods-2",
                    move_members = true
                }
            }
        }
    end
}
