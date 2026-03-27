using backend.DTOs;
using System.Collections.Generic;
using System.Text.RegularExpressions;

public class UserValidator
{
	public static Dictionary<string, string> ValidateRegisterForm(RegisterUserDto formData)
	{
		var errors = new Dictionary<string, string>();

		// Validate name
		if (string.IsNullOrWhiteSpace(formData.Name))
		{
			errors["name"] = "Zadejte jméno";
		}
		else if (formData.Name.Length > 40)
		{
			errors["name"] = "Jméno je příliš dlouhé";
		}

		// Validate surname
		if (string.IsNullOrWhiteSpace(formData.Surname))
		{
			errors["surname"] = "Zadejte příjmení";
		}
		else if (formData.Surname.Length > 40)
		{
			errors["surname"] = "Příjmení je příliš dlouhé";
		}

		// Validate account number
		string account = formData.AccountNumber;
		if (!Regex.IsMatch(account, @"^[0-9/-]+$"))
		{
			errors["accountNumber"] = "Špatný formát čísla účtu";
		}
		else if (!account.Contains("/"))
		{
			errors["accountNumber"] = "Neplatné číslo účtu";
		}
		else
		{
			var parts = account.Split('/');
			string numberPart = parts[0];
			string bankCode = parts[1];
			
			if (!Regex.IsMatch(bankCode, @"^\d{4}$"))
			{
				errors["accountNumber"] = "Neplatný kód banky";
			}
			else
			{
				string? prefix = null;
				string baseNumber;
				
				if (numberPart.Contains("-"))
				{
					var accountParts = numberPart.Split('-');
					prefix = accountParts[0];
					baseNumber = accountParts[1];
				}
				else
				{
					baseNumber = numberPart;
				}
				
				// Total length check (prefix + base can be up to 16 digits)
				int totalLength = (prefix != null ? prefix.Length : 0) + baseNumber.Length;
				
				if (totalLength > 16)
				{
					errors["accountNumber"] = "Číslo účtu je příliš dlouhé (max 16 číslic)";
				}
				else if (prefix != null && (prefix.Length < 1 || prefix.Length > 6 || !Regex.IsMatch(prefix, @"^\d+$")))
				{
					errors["accountNumber"] = "Předčíslí má chybný formát (max 6 číslic)";
				}
				else if (baseNumber.Length < 2 || baseNumber.Length > 10 || !Regex.IsMatch(baseNumber, @"^\d+$"))
				{
					errors["accountNumber"] = "Základní část má chybný formát (2-10 číslic)";
				}
				else
				{
					// Check modulo 11 for the complete account number (prefix + base)
					if (!Modulo11Valid(prefix ?? "") || !Modulo11Valid(baseNumber))
					{
						errors["accountNumber"] = "Číslo účtu není validní (modulo 11)";
					}
				}
			}
		}

		// Validate email
		if (!Regex.IsMatch(formData.Email ?? "", @"^[^@]+@[^@]+\.[^@]+$"))
		{
			errors["email"] = "Neplatný email";
		}

		// Validate password
		if (formData.Password == null || formData.Password.Length < 6)
		{
			errors["password"] = "Heslo musí mít alespoň 6 znaků";
		}

		return errors;
	}

	private static bool Modulo11Valid(string number)
	{
		int[] weights = { 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 };
		var padded = number.PadLeft(10, '0');

		int sum = 0;
		for (int i = 0; i < 10; i++)
		{
			sum += (padded[i] - '0') * weights[i];
		}
		return sum % 11 == 0;
	}
}
