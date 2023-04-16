local dc = require('discord')

return {
    id = "1094801227080015882",
    setup = function (self)
        -- Test will fail if the visitor is not applied (snapshot recorded as manage_channels being true)
        dc.visit(function (role)
            role.permissions.manage_channels = true
        end, 'roles')

        self.global.role {
            id = "1094801227080015882",
            comment = "nil"
        }

        dc.visit(self)
    end
}