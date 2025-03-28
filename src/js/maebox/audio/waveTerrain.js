function generateSurfaceData(resolution) {
    const data = [];
    const halfResolution = resolution / 2;

    for (let y = -1; y < halfResolution; y++) {
        const row = [];
        const normalizedY = (y - halfResolution) / halfResolution;

        for (let x = -1; x < halfResolution; x++) {
            const normalizedX = (x - halfResolution) / halfResolution;
            const z = -normalizedX * Math.sin(Math.sqrt(Math.abs(normalizedX))) - normalizedY * Math.sin(Math.sqrt(Math.abs(normalizedY)));
            row.push(z);
        }
        data.push(row);
    }
    return data;
}

function interpolateSurface(surfaceData, x, y) {
    const resolution = surfaceData.length;
    const halfResolution = resolution / 2;

    const normalizedX = x; //Assuming x is already normalized (-1 to 1)
    const normalizedY = y; //Assuming y is already normalized (-1 to 1)

    const xIndex = (normalizedX * halfResolution) + halfResolution;
    const yIndex = (normalizedY * halfResolution) + halfResolution;

    const xFloor = Math.floor(xIndex);
    const yFloor = Math.floor(yIndex);
    const xCeil = Math.ceil(xIndex);
    const yCeil = Math.ceil(yIndex);

    if (xFloor < 0 || xCeil >= resolution || yFloor < 0 || yCeil >= resolution) {
        // Out of bounds, return 0 or any default value
        return 0;
    }

    const xFraction = xIndex - xFloor;
    const yFraction = yIndex - yFloor;

    const z00 = surfaceData[yFloor][xFloor];
    const z01 = surfaceData[yFloor][xCeil];
    const z10 = surfaceData[yCeil][xFloor];
    const z11 = surfaceData[yCeil][xCeil];

    const z0 = z00 * (1 - xFraction) + z01 * xFraction;
    const z1 = z10 * (1 - xFraction) + z11 * xFraction;

    const z = z0 * (1 - yFraction) + z1 * yFraction;

    return z;
}

const resolution = 64;
const surfaceData = generateSurfaceData(resolution);

// Example usage:
const x = 0.5; // Normalized x coordinate (-1 to 1)
const y = -0.25; // Normalized y coordinate (-1 to 1)

const interpolatedZ = interpolateSurface(surfaceData, x, y);
console.log(`Interpolated z at (x=${x}, y=${y}): ${interpolatedZ}`);

// Example for accessing data without interpolation
// console.log(surfaceData[32][32]);
