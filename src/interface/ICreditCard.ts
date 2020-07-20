export default interface ICreditCard {
    id?: number;
    name: string
    card_id: string
    brand: string
    holder_name: string
    first_digits: string
    last_digits: string
    country: string
    fingerprint: string
    valid: boolean
    expiration_date: string
    date_created: Date
    date_updated: Date

    card_number: string
    card_cvv: string
}