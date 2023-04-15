return {
    id = "1234",
    setup = function (self)
        self.global_role {
            id = "5678",
            comment = "test-role"
        }

        self.global_role {
            id = "91024",
            comment = "another-test-role",

            manage_channels = true
        }

        
        self.global_role {
            id = "91024",
            comment = "another-another-test-role",

            manage_channels = true,
            manage_messages = true,
        }
    end
}