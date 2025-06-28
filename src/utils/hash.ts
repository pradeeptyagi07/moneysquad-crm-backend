import argon2 from 'argon2';

// Hash the password
export const hashPassword = async (plainPassword: string): Promise<string> => {
  return await argon2.hash(plainPassword);
};

// Verify the password
export const verifyPassword = async (hashedPassword: string, plainPassword: string): Promise<boolean> => {
    console.log("hash", hashedPassword);
    console.log("pass", plainPassword);
  return await argon2.verify(hashedPassword, plainPassword);
};