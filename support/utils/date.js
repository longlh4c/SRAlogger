export default {
    addDays(date, quantity) {
        const result = new Date(date);

        result.setDate(result.getDate() + quantity);

        return result;
    },
}