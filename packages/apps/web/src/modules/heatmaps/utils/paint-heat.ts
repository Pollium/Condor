export interface HeatSpot{
    x: number;
    y: number;
    weight: number;
}

const ORANGE = [255, 149, 0];
const RED = [255, 59, 48];

const mix = (channel: number, t: number) => Math.round(ORANGE[channel] + (RED[channel] - ORANGE[channel]) * t);

export const paintHeat = (canvas: HTMLCanvasElement, spots: HeatSpot[], width: number, height: number, radius: number) => {
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if(!context || !width || !height || !spots.length) return;

    const shadow = document.createElement('canvas');
    shadow.width = width;
    shadow.height = height;
    const ink = shadow.getContext('2d');
    if(!ink) return;

    const heaviest = Math.max(...spots.map((spot) => spot.weight));
    for(const spot of spots){
        const gradient = ink.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius);
        gradient.addColorStop(0, `rgba(0,0,0,${0.06 + 0.14 * (spot.weight / heaviest)})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ink.fillStyle = gradient;
        ink.fillRect(spot.x - radius, spot.y - radius, radius * 2, radius * 2);
    }

    const source = ink.getImageData(0, 0, width, height).data;
    let peak = 0;
    for(let i = 3; i < source.length; i += 4) peak = Math.max(peak, source[i]);
    if(peak === 0) return;

    const output = context.createImageData(width, height);
    const data = output.data;
    for(let i = 0; i < source.length; i += 4){
        const t = Math.min(1, source[i + 3] / peak);
        if(t < 0.035) continue;
        data[i] = mix(0, t);
        data[i + 1] = mix(1, t);
        data[i + 2] = mix(2, t);
        data[i + 3] = Math.round(Math.min(0.8, Math.pow(t, 0.7) * 0.85) * 255);
    }
    context.putImageData(output, 0, 0);
};
