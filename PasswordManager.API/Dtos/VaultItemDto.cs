namespace PasswordManager.API.Dtos
{
    public class VaultItemDto
    {
        public int VaultID { get; set; }
        public string WebsiteName { get; set; }
        public string? WebsiteURL { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}

