return {
    id = "74219472891732",
    setup = function(self)
        self.global_channel.text {
            id = "482948923432",
            comment = "test-channel",
            topic = "a topic",
            overrides = {
                self.role {
                    id = "42394823948",
                    comment = "mods",
                    use_vad = true
                },
                self.role {
                    id = "42394823948909090",
                    comment = "mods-2",
                    send_messages = true
                }
            }
        }

        self.global_channel.voice {
            id = "4782347298909",
            comment = "test-channel-2",
            nsfw = true,
            overrides = {
                self.role {
                    id = "42394823948",
                    comment = "mods",
                    speak = false,
                },
                self.role {
                    id = "42394823948909090",
                    comment = "mods-2",
                    priority_speaker = true
                }
            }
        }


        self.global_channel.text {
            id = "4829489242378472",
            comment = "test-channel-2",
            nsfw = true,
            slowmode = 25,


            overrides = {
                self.role {
                    id = "42394823948",
                    comment = "mods",
                    manage_messages = true
                },
                self.role {
                    id = "42394823948909090",
                    comment = "mods-2",
                    attach_files = false
                }
            }
        }

        self.global_channel.text {
            id = "47219193891483",
            comment = "test-channel-3",
            slowmode = 25,

            overrides = {
                self.role {
                    id = "42394823948",
                    comment = "mods",
                    manage_roles = true
                },
                self.role {
                    id = "42394823948909090",
                    comment = "mods-2",
                    move_members = true
                }
            }
        }
    end
}
