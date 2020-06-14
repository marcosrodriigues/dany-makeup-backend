import ICategory from "./ICategory";

interface IProduct {
    id?: number,
    name: string,
    shortDescription: string,
    fullDescription: string,
    value: number,
    amount: number,
    available: boolean,
    categorys?: ICategory[],
    mainImage: string,
    images: string[]
}

export default IProduct;