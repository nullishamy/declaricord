return {
    id = "74219472891732",
    setup = function (self)
        self.global_channel.text {
            id = "482948923432",
            comment = "test-channel",
            topic = "a topic"
        }

        self.global_channel.voice {
            id = "4782347298909",
            comment = "test-channel-2",
            nsfw = true,
        }


        self.global_channel.text {
            id = "4829489242378472",
            comment = "test-channel-2",
            nsfw = true,
            slowmode = 25,
        }

        self.global_channel.text {
            id = "47219193891483",
            comment = "test-channel-3",
            slowmode = 25,
        }
    end
}