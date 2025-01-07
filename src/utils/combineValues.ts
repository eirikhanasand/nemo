export default function combineValues(arr: Field[]) {
    const combined: Field[] = []

    arr.forEach((item) => {
        const existing = combined.find(entry => entry.name.trim() === item.name.trim())
        if (existing) {
            if (!existing.value.includes(item.value)) {
                existing.value += existing.value.endsWith('\n') ? item.value : `\n${item.value}`
            }
        } else {
            combined.push(item)
        }
    })

    return combined
}
