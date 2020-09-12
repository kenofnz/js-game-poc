import { map } from "lodash";

export const loadMapLayerData = (mapJson) => {
    let result = map(mapJson.layers, (layer) => {
        const array2d = Array.from({ length: mapJson.height }).map((_, i) =>
            layer.data.slice(i * mapJson.width, (i + 1) * mapJson.width)
        );
        return array2d
            .map((row, i) => {
                return row.map((tileId, j) => ({
                    id: `${i}_${j}`,
                    tileId,
                    x: mapJson.tilewidth * j,
                    y: mapJson.tileheight * i,
                    width: mapJson.tilewidth,
                    height: mapJson.tileheight
                }));
            })
            .reduce((acc, row) => row.concat(acc), [])
            .filter(tile => tile.tileId !== 0);
    });
    return result;
};

export default { loadMapLayerData };