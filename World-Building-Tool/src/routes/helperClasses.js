
export class City {
    constructor() {
        this.name;
        this.position; //`${x1},${y1}`
        this.paths = [];
        this.population;
        this.exports = [];
        this.imports = [];
    }
    //If an import is imported to sell as an export
    tradeImport() {

    }
}
export class Goods {
    constructor() {
        this.name;
        this.amount;
    }
}

export class Path {
    constructor() {
        this.name;
        this.path;
        this.canvasPath;
        this.goods = [];
        this.cities = []; //Saves the name of cities this path is connected to.
    }
    addCity(cityPosition, cities) {
        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            if (city.position == cityPosition) {
                this.cities.push(city);
                city.exports.forEach(exportGoods => {
                    this.goods.push(exportGoods);
                });
                break;
            }
        }
    }
    removeGoods(goodsName, goodsAmount) {
        for (let i = 0; i < this.goods.length; i++) {
            const good = this.goods[i];
            if (goodsName == good.name && goodsAmount == good.amount) {
                this.goods.splice(i, 1);
                break;
            }
        }
    }
    removeCityImports(cityName, cities) {
        cities.forEach(city => {
            //Checks if we have the right city
            if (city.name === cityName) {
                for (let i = 0; i < this.cities.length; i++) {
                    const pathCityName = this.cities[i];
                    //Checks if the city is also connected to the path
                    if (pathCityName.name == cityName) {
                        //Removes the export goods from that city
                        city.exports.forEach(exportGoods => {
                            this.removeGoods(exportGoods.name, exportGoods.amount);
                        });
                        break;
                    }
                }
            }
        });
    }
    mergePaths(pathName, paths) {
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            if (path.name === pathName) {

            }
        }
    }
}