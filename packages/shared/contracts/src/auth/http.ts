export interface SignInInput{
    /** @format email */
    email: string;
    /** @minLength 1 */
    password: string;
}

export interface SetupInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /** @format email */
    email: string;
    /**
     * @minLength 8
     * @maxLength 200
     */
    password: string;
}

export interface UpdateProfileInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name?: string;
    /** @format email */
    email?: string;
}

export interface ChangePasswordInput{
    /** @minLength 1 */
    current: string;
    /**
     * @minLength 8
     * @maxLength 200
     */
    next: string;
}
