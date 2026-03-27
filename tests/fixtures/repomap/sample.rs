use std::collections::HashMap;
use crate::db::Database;

pub struct UserService {
    db: Database,
}

impl UserService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub fn get_user(&self, id: u64) -> Option<User> {
        self.db.find(id)
    }

    fn internal_validate(&self) -> bool {
        true
    }
}

pub trait Repository {
    fn find_all(&self) -> Vec<User>;
    fn find_by_id(&self, id: u64) -> Option<User>;
}

pub enum UserRole {
    Admin,
    User,
    Guest,
}

fn private_helper() -> String {
    String::new()
}

pub fn create_service(db: Database) -> UserService {
    UserService::new(db)
}
