using System;
using System.Collections.Generic;

namespace App.Services
{
    public class UserService
    {
        public void GetUser(int id) { }
        private void Validate(int id) { }
        protected void LogAccess() { }
    }

    public interface IRepository
    {
        void Save(object entity);
    }

    public struct UserData
    {
        public int Id;
        public string Name;
    }

    public enum UserRole
    {
        Admin,
        User,
        Guest
    }
}
