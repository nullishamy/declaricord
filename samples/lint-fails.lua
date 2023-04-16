return {
    id = "1094801227080015882",
    ---@param self GuildSetup
    setup = function (self)
        self.global.role {
            id = "1094801227080015882",
            comment = "a-role",
            
            administrator = true
        }

        self.global.role {
            id = "1094801227080015882",
            comment = "@everyone",
            
            moderate_members = true
        }

        self.global.text {
            id = "1094801227080015882",
            comment = "test-channel",
            topic = ""
        }
    end
}