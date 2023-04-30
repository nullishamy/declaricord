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

        self.global.role {
            id = "172018499005317120",
            comment = "inherits"
        }
    end
}
