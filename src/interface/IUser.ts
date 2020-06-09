interface IUser {
    id?: number,
    name: string,
    email: string,
    password: string,
    image?: string,
    whatsapp?: string,
    city?: string,
    uf?: string
}

export default IUser;