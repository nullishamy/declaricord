local record discord
     record PermissionsBase
        create_instant_invite: boolean 
        kick_members: boolean 
        ban_members: boolean 
        administrator: boolean 
        manage_channels: boolean 
        manage_guild: boolean 
        add_reactions: boolean 
        view_audit_log: boolean 
        priority_speaker: boolean 
        stream: boolean 
        view_channel: boolean 
        send_messages: boolean 
        send_tts_messages: boolean 
        manage_messages: boolean 
        embed_links: boolean 
        attach_files: boolean 
        read_message_history: boolean 
        mention_everyone: boolean 
        use_external_emojis: boolean 
        view_guild_insights: boolean 
        connect: boolean 
        speak: boolean 
        mute_members: boolean 
        deafen_members: boolean 
        move_members: boolean 
        use_vad: boolean 
        change_nickname: boolean 
        manage_nicknames: boolean 
        manage_roles: boolean 
        manage_webhooks: boolean 
        manage_guild_expressions: boolean 
        use_application_commands: boolean 
        request_to_speak: boolean 
        manage_events: boolean 
        manage_threads: boolean 
        create_public_threads: boolean 
        create_private_threads: boolean 
        use_external_stickers: boolean 
        send_messages_in_threads: boolean 
        use_embedded_activities: boolean 
        moderate_members: boolean 
        view_creator_monetization_analytics: boolean 
        use_soundboard: boolean 
    end

     record PermissionOverride
        id: string
        comment: string

        create_instant_invite: boolean 
        kick_members: boolean 
        ban_members: boolean 
        administrator: boolean 
        manage_channels: boolean 
        manage_guild: boolean 
        add_reactions: boolean 
        view_audit_log: boolean 
        priority_speaker: boolean 
        stream: boolean 
        view_channel: boolean 
        send_messages: boolean 
        send_tts_messages: boolean 
        manage_messages: boolean 
        embed_links: boolean 
        attach_files: boolean 
        read_message_history: boolean 
        mention_everyone: boolean 
        use_external_emojis: boolean 
        view_guild_insights: boolean 
        connect: boolean 
        speak: boolean 
        mute_members: boolean 
        deafen_members: boolean 
        move_members: boolean 
        use_vad: boolean 
        change_nickname: boolean 
        manage_nicknames: boolean 
        manage_roles: boolean 
        manage_webhooks: boolean 
        manage_guild_expressions: boolean 
        use_application_commands: boolean 
        request_to_speak: boolean 
        manage_events: boolean 
        manage_threads: boolean 
        create_public_threads: boolean 
        create_private_threads: boolean 
        use_external_stickers: boolean 
        send_messages_in_threads: boolean 
        use_embedded_activities: boolean 
        moderate_members: boolean 
        view_creator_monetization_analytics: boolean 
        use_soundboard: boolean 
    end

     record Role 
        id: string
        comment: string
        colour: number
        mentionable: boolean
        hoisted: boolean

        create_instant_invite: boolean 
        kick_members: boolean 
        ban_members: boolean 
        administrator: boolean 
        manage_channels: boolean 
        manage_guild: boolean 
        add_reactions: boolean 
        view_audit_log: boolean 
        priority_speaker: boolean 
        stream: boolean 
        view_channel: boolean 
        send_messages: boolean 
        send_tts_messages: boolean 
        manage_messages: boolean 
        embed_links: boolean 
        attach_files: boolean 
        read_message_history: boolean 
        mention_everyone: boolean 
        use_external_emojis: boolean 
        view_guild_insights: boolean 
        connect: boolean 
        speak: boolean 
        mute_members: boolean 
        deafen_members: boolean 
        move_members: boolean 
        use_vad: boolean 
        change_nickname: boolean 
        manage_nicknames: boolean 
        manage_roles: boolean 
        manage_webhooks: boolean 
        manage_guild_expressions: boolean 
        use_application_commands: boolean 
        request_to_speak: boolean 
        manage_events: boolean 
        manage_threads: boolean 
        create_public_threads: boolean 
        create_private_threads: boolean 
        use_external_stickers: boolean 
        send_messages_in_threads: boolean 
        use_embedded_activities: boolean 
        moderate_members: boolean 
        view_creator_monetization_analytics: boolean 
        use_soundboard: boolean 
    end

     record CategoryChannelMarker end
     record GlobalChannelMarker end
     record RoleMarker end
     record CategoryMarker end
     record PermissionOverrideMarker end

     record Category
        id: string
        comment: string
        overrides: {PermissionOverrideMarker}
        channels: {CategoryChannelMarker}
        
        record PredicateArg
            id: string
            comment: string
            overrides: {PermissionOverrideMarker}
            nsfw: boolean


            topic: string | nil
            slowmode: number | nil

            bitrate: number | nil
            user_limit: number | nil
        end
        predicate: function(PredicateArg): boolean

    end

     record TextChannel
        id: string
        comment: string
        overrides: {PermissionOverrideMarker}
        nsfw: boolean
        topic: string
        slowmode: number
    end


     record VoiceChannel
        id: string
        comment: string
        overrides: {PermissionOverrideMarker}
        nsfw: boolean
        bitrate: number
        user_limit: number
    end

     record GuildSetup
        record global
            text: function(TextChannel): GlobalChannelMarker
            voice: function(VoiceChannel): GlobalChannelMarker
            role: function(Role): RoleMarker
        end

        category: function(Category): CategoryMarker

        record channel
            text: function(TextChannel): CategoryChannelMarker
            voice: function(VoiceChannel): CategoryChannelMarker
        end

        record override
            role: function(PermissionOverride): PermissionOverrideMarker
            user: function(PermissionOverride): PermissionOverrideMarker
        end
    end
    

    -- Lua lib    
    stored: function(key: string, val: PermissionOverride | nil) 

    record table 
        map: function<T, U>({T}, function(T):U): {U}
        stringify: function(any): string
        stringify_pretty: function(any): string
    end

end

return discord
