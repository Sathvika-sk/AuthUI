using System.ComponentModel.DataAnnotations;

namespace AngularAuthAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public long PhoneNumber { get; set; }
        public int Salary { get; set; }
        public string Department { get; set; }
        public string Password { get; set; }

        public string Token { get; set; }
        public string Role { get; set; }


        
    }
}
