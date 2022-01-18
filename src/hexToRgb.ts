export default function hexToRgb(hex: string, opacity: number=200) {
    hex = hex.substr(1)
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r,g,b, opacity]
}
