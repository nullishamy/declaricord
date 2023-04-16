return {
    id = "172018499005317120",
    ---@param self GuildSetup
    setup = function(self)
        self.global.role {
            id = "172018499005317120",
            comment = "@everyone",

            manage_channels = true
        }

        self.global.role {
            id = "172018499005317120",
            comment = "inherits"
        }
    end
}
