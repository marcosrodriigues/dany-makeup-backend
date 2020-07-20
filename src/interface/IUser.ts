interface IUser {
    id?: number,
    name: string,
    email: string,
    password?: string,
    avatar?: string,
    whatsapp?: string,
    fb_id?: string,
    created_at: string,
}

export default IUser;