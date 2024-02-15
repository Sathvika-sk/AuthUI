using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using AuthAPI.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileSystemGlobbing.Internal.Patterns;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;


namespace AuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController: ControllerBase
    {
        private readonly AppDbContext _authContext;

        public UserController(AppDbContext appDbContext)
        {
            _authContext = appDbContext;


        }
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();

            var user = await _authContext.Users
                .FirstOrDefaultAsync(x => x.Email == userObj.Email);
            if (user == null) 
                return NotFound(new { Message = "User Not Found!"});
            if(!PasswordHasher.VerifyPassword(userObj.Password,user.Password))
            {
                return BadRequest(new { Message = "Password is Incorrect" });
            }
            user.Token = CreateJwt(user);
            
            return Ok(new
            {
                Token=user.Token,
                Message= "login Success!"
            });
            
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if(userObj==null)
                return BadRequest();

        //username valid

        //email validity
        if(await CheckEmailExistAsync(userObj.Email))
            {
                
                return BadRequest(new { Message ="email already Exists!"});
            }

        //password validity
        var pass =CheckPasswordStrength(userObj.Password);
            if (!string.IsNullOrEmpty(pass))
                return BadRequest(new { Message = pass });

            userObj.Password= PasswordHasher.HashPassword(userObj.Password);
            userObj.Role = "User";
            userObj.Token = "";
            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();
            return Ok(new{
                Message ="User Registered!"
            });
        }

        //private Task<bool> CheckemailExistAsync(string email)=>   _authContext.Users.AnyAsync(x=>x.Email == email);
        private async Task<bool> CheckEmailExistAsync(string email)
        {
            string pattern = "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$";

            if (!Regex.IsMatch(email, pattern))
            {
                // Email is not valid
                return false;
            }

            // Email is valid, now check if it exists in the database
            return await _authContext.Users.AnyAsync(x => x.Email == email);
        }

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb= new StringBuilder();
            if(password.Length < 8) 
                sb.Append("Minimum Password length should be 8" + Environment.NewLine);
            if (!(Regex.IsMatch(password, "[a-z]") && (Regex.IsMatch(password, "[A-Z]")) && (Regex.IsMatch(password, "[0-9]"))))
                    sb.Append("Password should be Alphanumeric"+ Environment.NewLine);
            if (!Regex.IsMatch(password, "[<,>,@,!,#,*,?]"))
                    sb.Append("Password should contain special chars" + Environment.NewLine);
            return sb.ToString();

            
        }

        private string CreateJwt(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = new byte[32];
            using(var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(key);
            }
            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role,user.Role),
                new Claim(ClaimTypes.Name,$"{user.Name}")
            }
                );
            var credentials=new SigningCredentials(new SymmetricSecurityKey(key),SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };
            var token=jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);

        }
        [HttpGet("all")]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _authContext.Users.ToListAsync());
        }
        /*[HttpGet]
        public async Task<ActionResult<User>> GetAUser()
        
        [HttpPatch]
        */
        [HttpGet("{email}")]
        
        public async Task<ActionResult<User>> GetUser([FromRoute] string email)
        {
            var getUser = await _authContext.Users.FirstOrDefaultAsync(x => x.Email == email) ;
            if (getUser == null)
            {
                return NotFound();
            }
            return Ok(getUser);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<User>> UpdateUser([FromRoute] int id, User userObj)
        {
            var user = await _authContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }
            user.Name = userObj.Name??user.Name;
            user.Email = userObj.Email??user.Email;
            user.PhoneNumber = userObj.PhoneNumber!=0?userObj.PhoneNumber:user.PhoneNumber;
            user.Salary = userObj.Salary!=0?userObj.Salary:user.Salary;
            user.Department = userObj.Department ?? user.Department;
            user.Password= userObj.Password ?? user.Password;
            user.Role= userObj.Role ?? user.Role;

            await _authContext.SaveChangesAsync();

            return Ok(user);

        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee([FromRoute] int id)
        {
            var user = await _authContext.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }
            _authContext.Users.Remove(user);
            await _authContext.SaveChangesAsync();

            return Ok(user);
        }
    }


}
