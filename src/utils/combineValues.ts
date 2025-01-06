export default function combineValues(arr: Field[]) {
    const combined: Field[] = []

    arr.forEach((item) => {
        const existing = combined.find(entry => entry.name === item.name)
        if (existing) {
            if (!existing.value.includes(item.value)) {
                existing.value += item.value
            }
        } else {
            combined.push(item)
        }
    })

    return combined
}
