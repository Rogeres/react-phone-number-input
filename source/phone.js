export const formats =
{
	RU:
	{
		country : '7',
		city    : 3,
		number  : [3, 2, 2]
	},
	UA:
	{
		country : '380',
		city    : 2,
		number  : [3, 2, 2]
	},
	BY:
	{
		country : '375',
		city    : 2,
		number  : [3, 2, 2]
	},
	US:
	{
		country : '1',
		city    : 3,
		number  : [3, 4]
	}
}

// Validates an international cleartext phone number
export function validate(cleartext_international, format)
{
	if (!format)
	{
		throw new Error(`No "format" specified for phone number validation`)
	}

	return cleartext_international.length === 
		'+'.length + format.country.length + digits_in_number(format)
}

// Reduces a formatted phone number to a cleartext one (with country code).
// E.g. "(999) 123-45-67" -> "+79991234567"
export function cleartext_international(formatted, format)
{
	const phone_digits = digits(formatted, format)

	if (!phone_digits)
	{
		return ''
	}
	
	return `+${format.country}${phone_digits}`
}

// Generates phone number template based on the phone format structure.
// e.g. { code: '7', city: 3, number: [3, 2, 2] } -> '(xxx) xxx-xx-xx'
export function template(format)
{
	return '(' + repeat('x', format.city) + ') ' + format.number.map(n => repeat('x', n)).join('-')
}

// Converts formatted phone number to just digits
// (e.g. "(999) 123-45-67" -> "9991234567")
export function digits(value, format)
{
	return value.replace(/[^0-9]/g, '').substring(0, digits_in_number(format))
}

// Counts digits in a string
export function count_digits(value)
{
  return value.replace(/[^0-9]/g, '').length
}

// Formats a cleartext phone number
// as a local phone number.
//
// E.g.: "+79991234567" -> "(999) 123-45-67"
//         "9991234567" -> "(999) 123-45-67"
//
export function format(value, format)
{
	// Trims the value
	value = value.trim()

	// If the value starts with a plus sign,
	// then trim it along with the country code.
	// (because country code is not editable)
	if (value[0] === '+')
	{
		value = value.substring('+'.length + format.country.length)
	}

	if (!value)
	{
		return ''
	}

	// If the value has something except digits, then abort
	if (value.match(/[^0-9]/))
	{
		return value
	}

	// Transform raw digits "9991234567"
	// into a structure { city: '999', number: '1234567' }
	const phone = parse_digits(value, format)

	// Adds hyphens to phone number
	// (e.g. '1234567' -> '123-45-67')

	const number_parts = []

	let cursor = 0
	for (let digit_count of format.number)
	{
		const number_part = phone.number.slice(cursor, cursor + digit_count)
		if (number_part)
		{
			number_parts.push(number_part)
		}
		cursor += digit_count
	}

	const number = number_parts.join('-')

	// Adds city code whitespace
	// (e.g. '9' -> '9  ')
	let city = phone.city
	while (city.length < format.city)
	{
		city += ' '
	}

	// The resulting formatted phone number
	// (e.g. '(999) 123-45-67')
	return `(${city}) ${number}`
}

// Formats a cleartext phone number
// as an international phone number.
//
// E.g.: "+79991234567" -> "+7 (999) 123-45-67"
//         "9991234567" -> "+7 (999) 123-45-67"
//
export function format_international(cleartext, phone_format)
{
	const prefix = `+${phone_format.country}`
	const number = format(cleartext, phone_format)
	
	if (!number)
	{
		return ''
	}

	return `${prefix} ${number}`
}

// Transforms raw digits "9991234567"
// into a structure { city: '999', number: '1234567' }
export function parse_digits(digits, format)
{
	const phone =
	{
		// country : '7',
		city    : digits.slice(0, format.city),
		number  : digits.slice(format.city, format.city + format.number.reduce((a, b) => a + b, 0))
	}

	return phone
}

// Returns digit count in phone number format
export function digits_in_number(format)
{
	return format.city + format.number.reduce((a, b) => a + b, 0)
}

// Finds digit index in value at caret position
// (if there's no digit at caret position then 
//  returns the index of the closest next digit)
export function digit_index(value, caret_position)
{
  return count_digits(value.substring(0, caret_position))
}

// Finds index of digit symbol in template
export function index_in_template(digit_index, format)
{
  const phone_template = template(format)

  let digit_index_so_far = -1
  let i = 0
  while (i <= phone_template.length)
  {
    if (phone_template[i] === 'x')
    {
      digit_index_so_far++
    }

    if (digit_index_so_far === digit_index)
    {
      return i
    }

    i++
  }
}

// Repeats string N times
export function repeat(pattern, count)
{
	if (count < 1)
	{
		return ''
	}

	let result = ''
	
	while (count > 1)
	{
		if (count & 1)
		{
			result += pattern
		}
		count >>= 1
		pattern += pattern
	}

	return result + pattern
}
