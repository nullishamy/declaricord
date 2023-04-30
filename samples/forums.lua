return {
    id = "1094801227080015882",
    version = "v1.0.0",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",
        }

        self.global.forum {
            id = "172018499005317120",
            comment = "the-forum",
            tags = {
                self.forum.tag {
                    id = "172018499005317120",
                    comment = "the-forum",
                    emoji = self.forum.custom "172018499005317120"
                },
                self.forum.tag {
                    id = "172018499005317120",
                    comment = "the-forum",
                    emoji = self.forum.unicode "🔨"
                }
            }
        }

    end
}
