import * as bcrypt from 'bcrypt';

export class Bcrypt {
  private readonly saltRounds = 10;

  /**
   * Hash a password
   * @param password
   * @returns hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    return hashedPassword;
  }

  /**
   * compare two string
   * @param password
   * @param hashedPassword
   * @returns
   */
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  }
}
