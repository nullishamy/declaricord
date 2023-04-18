---@class PermissionsBase
---@field create_instant_invite boolean? Defaults to false
---@field kick_members boolean? Defaults to false
---@field ban_members boolean? Defaults to false
---@field administrator boolean? Defaults to false
---@field manage_channels boolean? Defaults to false
---@field manage_guild boolean? Defaults to false
---@field add_reactions boolean? Defaults to false
---@field view_audit_log boolean? Defaults to false
---@field priority_speaker boolean? Defaults to false
---@field stream boolean? Defaults to false
---@field view_channel boolean? Defaults to false
---@field send_messages boolean? Defaults to false
---@field send_tts_messages boolean? Defaults to false
---@field manage_messages boolean? Defaults to false
---@field embed_links boolean? Defaults to false
---@field attach_files boolean? Defaults to false
---@field read_message_history boolean? Defaults to false
---@field mention_everyone boolean? Defaults to false
---@field use_external_emojis boolean? Defaults to false
---@field view_guild_insights boolean? Defaults to false
---@field connect boolean? Defaults to false
---@field speak boolean? Defaults to false
---@field mute_members boolean? Defaults to false
---@field deafen_members boolean? Defaults to false
---@field move_members boolean? Defaults to false
---@field use_vad boolean? Defaults to false
---@field change_nickname boolean? Defaults to false
---@field manage_nicknames boolean? Defaults to false
---@field manage_roles boolean? Defaults to false
---@field manage_webhooks boolean? Defaults to false
---@field manage_guild_expressions boolean? Defaults to false
---@field use_application_commands boolean? Defaults to false
---@field request_to_speak boolean? Defaults to false
---@field manage_events boolean? Defaults to false
---@field manage_threads boolean? Defaults to false
---@field create_public_threads boolean? Defaults to false
---@field create_private_threads boolean? Defaults to false
---@field use_external_stickers boolean? Defaults to false
---@field send_messages_in_threads boolean? Defaults to false
---@field use_embedded_activities boolean? Defaults to false
---@field moderate_members boolean? Defaults to false
---@field view_creator_monetization_analytics boolean? Defaults to false
---@field use_soundboard boolean? Defaults to false

---@class CategoryTable 
---@field id string
---@field comment string
---@field overrides (RoleOverrideMarker | UserOverrideMarker)[]
---@field channels CategoryChannelMarker[]

---@class CategoryChannelMarker
---@class GlobalChannelMarker
---@class RoleOverrideMarker
---@class UserOverrideMarker

---@class TextChannelTable
---@field id string
---@field comment string
---@field overrides (RoleOverrideMarker | UserOverrideMarker)[]
---@field nsfw boolean?
---@field topic string?
---@field slowmode number?

---@class VoiceChannelTable
---@field id string
---@field comment string
---@field overrides (RoleOverrideMarker | UserOverrideMarker)[]
---@field nsfw boolean?
---@field bitrate number?
---@field user_limit number?

---@class RoleOverrideTable: PermissionsBase
---@field id string
---@field comment string

---@class RoleTable: PermissionsBase
---@field id string
---@field comment string
---@field colour number?
---@field mentionable boolean?
---@field hoisted boolean?

---@class UserOverrideTable: PermissionsBase
---@field id string
---@field comment string

---@class GuildSetup
---@field global { text: (fun(tbl: TextChannelTable): GlobalChannelMarker), voice: (fun(tbl: VoiceChannelTable): GlobalChannelMarker), role: (fun(tbl: RoleTable): nil) }
---@field category fun(tbl: CategoryTable)
---@field channel { text: (fun(tbl: TextChannelTable): CategoryChannelMarker), voice: (fun(tbl: VoiceChannelTable): CategoryChannelMarker) }
---@field override { role: (fun(tbl: RoleOverrideTable): RoleOverrideMarker), user: fun(tbl: UserOverrideTable): UserOverrideMarker }

--- LuaLib module ---
--- Declare separate variants because we get passed back the validated tables
---@class VisitTextChannelTable
---@field id string
---@field comment string
---@field type "text"
---@field overrides (RoleOverrideMarker | UserOverrideMarker)[]
---@field options {nsfw: boolean?, topic: string?, slowmode: number?}
---@field permissions PermissionsBase

---@class VisitVoiceChannelTable
---@field id string
---@field comment string
---@field type "voice"
---@field overrides (RoleOverrideMarker | UserOverrideMarker)[]
---@field options {nsfw: boolean?, user_limit: number?, bitrate: number?}
---@field permissions PermissionsBase

---@class VisitRoleTable
---@field id string
---@field comment string
---@field permissions PermissionsBase

---@class TableUtils
---@field map fun(tbl: table, mapper: fun(obj: any): any)
---@field stringify fun(tbl: any): string
---@field stringify_pretty fun(tbl: any): string

---@class Discord
---@field stored fun(key: string, val?: RoleOverrideTable)
---@field visit fun(val: fun(tbl: VisitRoleTable), scope: "roles") | fun(tbl: VisitTextChannelTable | VisitVoiceChannelTable, scope: "channels") | fun(val: GuildSetup)
---@field table TableUtils

---@return Discord
function discord()
   error('Stub!')
end