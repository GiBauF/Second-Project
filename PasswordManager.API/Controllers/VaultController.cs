using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PasswordManager.API.Data;
using PasswordManager.API.Models;
using System.Security.Claims;
using System.Text;
using PasswordManager.API.Dtos;

namespace PasswordManager.API.Controllers
{
    [Authorize] 
    [ApiController]
    [Route("api/[controller]")]
    public class VaultController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VaultController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserID()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        }

        private string Encrypt(string plainText)
        {
            var bytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(bytes);
        }

        private string Decrypt(string base64Encoded)
        {
            try
            {
                
                var bytes = Convert.FromBase64String(base64Encoded);
                return Encoding.UTF8.GetString(bytes);
            }
            catch (FormatException)
            { 
                return "!!INVALID_DATA!!";
            }
            catch (Exception)
            {
                
                return "!!DECRYPT_ERROR!!";
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaultItemDto>>> GetVaultItems()
        {
            var userId = GetCurrentUserID();

            var dbItems = await _context.PasswordVaults
                .Where(v => v.UserID == userId)
                .ToListAsync();
            var items = dbItems.Select(v => new VaultItemDto
            {
                VaultID = v.VaultID,
                WebsiteName = v.WebsiteName,
                WebsiteURL = v.WebsiteURL,
                Username = v.Username,
                Password = Decrypt(v.EncryptedPassword) 
            });

            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<VaultItemDto>> PostVaultItem(CreateVaultItemDto itemDto)
        {
            var userId = GetCurrentUserID();

            var newVaultItem = new PasswordVault
            {
                UserID = userId,
                WebsiteName = itemDto.WebsiteName,
                WebsiteURL = itemDto.WebsiteURL,
                Username = itemDto.Username,
                EncryptedPassword = Encrypt(itemDto.Password) 
            };

            _context.PasswordVaults.Add(newVaultItem);
            await _context.SaveChangesAsync();

            
            var resultDto = new VaultItemDto
            {
                VaultID = newVaultItem.VaultID,
                WebsiteName = newVaultItem.WebsiteName,
                WebsiteURL = newVaultItem.WebsiteURL,
                Username = newVaultItem.Username,
                Password = itemDto.Password 
            };

            return CreatedAtAction(nameof(GetVaultItems), new { id = newVaultItem.VaultID }, resultDto);
        }

        
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVaultItem(int id)
        {
            var userId = GetCurrentUserID();

            var vaultItem = await _context.PasswordVaults
                .FirstOrDefaultAsync(v => v.VaultID == id && v.UserID == userId);

            if (vaultItem == null)
            {
                
                return NotFound();
            }

            _context.PasswordVaults.Remove(vaultItem);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

    }
}
