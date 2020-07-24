export function convertToDatabaseDate(date: Date) {
    return new Date(date).toISOString().replace('Z','').replace('T', ' ')
}

export function isOrderValid(order: any) {
    const { user, purchase } = order;
    const paymentOrder = order.payment;
    const { address, payment } = paymentOrder;
    const { items, delivery } = purchase;


    if (user.id === undefined) return false;
    if (payment.payment_method !== 'boleto' && payment.payment_method !== 'credit_card') return false;
    if (items.length <= 0) return false;
    if (address.id === undefined) return false;

    if (payment.payment_method === 'credit_card') {
        if (payment.credit_card.id === undefined) {
            return false;
        }
    }

    if (payment.payment_method === 'boleto') {
        if (payment.boleto.name === '' ||
            payment.boleto.cpf === '' ||
            payment.boleto.birthday === '' ||
            payment.boleto.phone === '') {
                return false;
            }
    }

    if (delivery.code === 1) { //entrega em mãos
        if (delivery.store === undefined || delivery.store.id === undefined) return false;
    }
    return true;
}