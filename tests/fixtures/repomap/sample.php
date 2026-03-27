<?php

namespace App\Services;

use App\Models\User;
use App\Contracts\Repository;

class UserService
{
    public function getUser(int $id): User { }
    private function validate(int $id): bool { }
    protected function logAccess(): void { }
}

interface UserRepository
{
    public function find(int $id): ?User;
    public function save(User $user): void;
}

trait Cacheable
{
    public function getCacheKey(): string { }
}

enum UserRole: string
{
    case Admin = 'admin';
    case User = 'user';
}

function createApp(array $config): void { }
