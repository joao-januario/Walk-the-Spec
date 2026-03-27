local json = require("json")
local utils = require("utils")

function start_server(port)
    print("Starting on " .. port)
end

function get_user(id)
    return { id = id, name = "User" }
end

local function internal_helper()
    -- private helper
    return true
end

function UserService(db)
    local self = {}
    self.db = db

    function self.find(id)
        return db:query(id)
    end

    return self
end
