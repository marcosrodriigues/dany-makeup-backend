export function convertToDatabaseDate(date: Date) {
    return new Date(date).toISOString().replace('Z','').replace('T', ' ')
}