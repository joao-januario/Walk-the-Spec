package com.example.app;

import java.util.List;
import java.util.Optional;
import com.example.db.DatabaseService;

public class UserController {

    private final DatabaseService db;

    public UserController(DatabaseService db) {
        this.db = db;
    }

    public List<User> getUsers() {
        return db.findAll();
    }

    private void validateInput(String input) {
        // private — should be filtered out
    }

    protected void logAccess() {
        // protected — should be filtered out
    }
}

interface UserRepository {
    Optional<User> findById(long id);
    List<User> findAll();
}

enum UserRole {
    ADMIN,
    USER,
    GUEST
}
