import ICategory from "./ICategory";
import IManufacturer from "./IManufacturer";

interface IProduct {
    id?: number,
    name: string,
    shortDescription: string,
    fullDescription: string,
    value: number,
    amount: number,
    categorys?: ICategory[],
    image_url: string,
    images: string[],
    manufacturer?: IManufacturer
}

export default IProduct;