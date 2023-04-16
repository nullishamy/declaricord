local dc = require('discord')

return {
    id = "1094801227080015882",
    ---@param self GuildSetup
    setup = function(self)
        -- Store a role
        dc.stored {
            id = "42394823948909090",
            comment = "@everyone",
            move_members = true
        }

        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",
        }

        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel",
            topic = "a topic",
            overrides = {
                -- Fetch it back
                dc.stored("42394823948909090")
            }
        }
    end
}
