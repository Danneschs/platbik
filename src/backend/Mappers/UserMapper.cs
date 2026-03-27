namespace backend.Mappers;

using backend.Models;
using backend.DTOs;

public static class UserMapper
{
	public static UserDto ToDto(User user, string rCode)
	{
		return new UserDto
		{
			Id = user.Id,
			Name = user.Name,
			Surname = user.Surname,
			AccountNumber = user.AccountNumber,
			Email = user.Email,
			RoleCode = rCode
		};
	}
}
