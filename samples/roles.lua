return {
    id = "1094801227080015882",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "1094801227080015882",
            comment = "@everyone"
        }

        self.global.role {
            id = "1094801227080015882",
            comment = "another-test-role",

            manage_channels = true
        }


        self.global.role {
            id = "1094801227080015882",
            comment = "another-another-test-role",

            manage_channels = true,
            manage_messages = true,
        }
    end
}
