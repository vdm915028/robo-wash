// Числительные 11-14 требуют формы «много» вопреки последней цифре: 12 машин, но 2 машины.
export function pluralizeRussian(count: number, one: string, few: string, many: string): string {
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return many;
    }

    const lastDigit = count % 10;
    if (lastDigit === 1) {
        return one;
    }

    return lastDigit >= 2 && lastDigit <= 4 ? few : many;
}
