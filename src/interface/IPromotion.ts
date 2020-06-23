import IProduct from "./IProduct";

interface IPromotion {
    id?: number,
    name: string,
    start: Date,
    end: Date,
    originalValue: number,
    discountType: string,
    discount: number,
    promotionValue: number,
    mainImage: string,
    products: IProduct[],
    images: string[]
}

export default IPromotion;