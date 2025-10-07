using Microsoft.EntityFrameworkCore;
using PasswordManager.API.Models;

namespace PasswordManager.API.Data
{
   
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } // Represents the 'users' table
                                               // We'll add the PasswordVault DbSet here later
    }
}