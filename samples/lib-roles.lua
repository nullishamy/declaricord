local dc = require('discord')

return {
    id = "1234",
    setup = function(self)
        -- Store a role
        dc.stored {
            id = "42394823948909090",
            comment = "mods-2",
            move_members = true
        }

        self.global_channel.text {
            id = "482948923432",
            comment = "test-channel",
            topic = "a topic",
            overrides = {
                dc.stored("42394823948909090")
            }
        }
    end
}
