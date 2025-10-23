using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PasswordManager.API.Models
{
    [Table("password_vault")]
    public class PasswordVault
    {
        [Key]
        public int VaultID { get; set; }
        public int UserID { get; set; }
        public string WebsiteName { get; set; }
        public string? WebsiteURL { get; set; }
        public string Username { get; set; }
        public string EncryptedPassword { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserID")]
        public virtual User User { get; set; }
    }
}
