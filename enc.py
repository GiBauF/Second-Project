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


    #--------TEST--------

    #Convert character to a 0-25 index (A=0, B=1, etc.)
    original_index = ord(char) - start_char_value
    # The result must be between 0 and 25
    shifted_index = (original_index + key) % 26

    # Convert the new index back to an ASCII value, then back to a character
    new_char_value = shifted_index + start_char_value
    
    return chr(new_char_value)

# Set a key (the shift amount)
test_key = 3
print(f"--- Testing Caesar Cipher with Key: {test_key} ---")

# Test 1: Simple shift (H -> K)
print(f"H shifts to: {encrypt_character('H', test_key)}") 

# Test 2: Wrap-around (z -> c)
print(f"z shifts to: {encrypt_character('z', test_key)}")

# Test 3: Non-alphabetic character (should remain unchanged)
print(f"! shifts to: {encrypt_character('!', test_key)}")

# Test 4: Full word
test_word = "TestinG"
encrypted_word = ""
for char in test_word:
    encrypted_word += encrypt_character(char, test_key)

print(f"'{test_word}' encrypts to: '{encrypted_word}'") 


