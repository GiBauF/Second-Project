using System.ComponentModel.DataAnnotations;

namespace PasswordManager.API.Models
{
    public class User
    {
        [Key] // Specifies this is the primary key
        public int UserID { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
