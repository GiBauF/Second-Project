namespace PasswordManager.API.Dtos
{
    public class CreateVaultItemDto
    {
        public string WebsiteName { get; set; }
        public string? WebsiteURL { get; set; }
        public string Username { get; set; }
        public string Password { get; set; } 
    }
}
