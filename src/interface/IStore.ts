import IAddress from "./IAddress";

export default interface IStore {
    id?:number,
    name: string,
    description?: string,
    image_url: string,
    removed?: boolean,
    created_at?: Date,
    address: IAddress
}