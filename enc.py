def encrypt_character(char, key):
    # 1. Check if the character is an alphabet letter
    if 'A' <= char <= 'Z':
        # Uppercase letters
        start_char_value = ord('A')  # 65
        
    elif 'a' <= char <= 'z':
        # Lowercase letters
        start_char_value = ord('a')  # 97
        
    else:
        return char

    #Convert character to a 0-25 index (A=0, B=1, etc.)
    original_index = ord(char) - start_char_value
    # The result must be between 0 and 25
    shifted_index = (original_index + key) % 26

    # Convert the new index back to an ASCII value, then back to a character
    new_char_value = shifted_index + start_char_value
    
    return chr(new_char_value)