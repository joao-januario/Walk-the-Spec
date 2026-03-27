const std = @import("std");
const mem = @import("std").mem;

pub fn startServer(port: u16) !void {
    std.debug.print("Starting on {}\n", .{port});
}

pub const UserService = struct {
    db: *Database,

    pub fn getUser(self: *UserService, id: u32) ?User {
        return self.db.find(id);
    }

    fn internalValidate(self: *UserService, id: u32) bool {
        return id > 0;
    }
};

const Config = struct {
    port: u16,
    host: []const u8,
};

pub fn createApp(config: Config) UserService {
    return UserService{ .db = undefined };
}
