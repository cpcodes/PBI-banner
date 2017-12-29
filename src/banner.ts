/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class VisualSettings extends DataViewObjectsParser {
      public defaultSettings: Settings = new Settings();
      }
      
    export class Settings {
        topColor: string;
        bottomColor: string;
        topSizePercent: number;
        maxHeightPercent: number
    }

    export class Banner {
        private svg: d3.Selection<SVGElement>;
        private container: d3.Selection<SVGElement>;
        private topText: d3.Selection<SVGElement>;
        private bottomText: d3.Selection<SVGElement>;
        private settings: Settings = { topColor: "Black", bottomColor: "Black", topSizePercent: 75, maxHeightPercent: 100};



        constructor(options: VisualConstructorOptions) {
            const element: HTMLElement = options.element;
            this.svg = d3.select(element)
                .append('svg')
                .classed('circleCard', true);

            this.container = this.svg.append("g")
                .classed('container', true);

            this.topText = this.container.append("text")
                .classed("textValue", true);

            this.bottomText = this.container.append("text")
                .classed("textLabel", true);
        }

        private formatValue(value): string {
            let result: string = "";
            if (typeof(value) === "number") result=value.toLocaleString();
            else result = value.toString();

            return result;
        }

        private parseSettings(dataView: DataView) {
            const dmObjects: DataViewObjects = dataView.metadata.objects;
            
            if (dmObjects) {
                const dmoSettings: DataViewObject = dmObjects["settings"];
                    this.settings.bottomColor = this.getTextColor<string>(dmoSettings, "bottomColor", this.settings.bottomColor);
                    this.settings.topColor = this.getTextColor<string>(dmoSettings, "topColor", this.settings.topColor);
                    this.settings.topSizePercent = this.getValue<number>(dmObjects, "settings", "topSizePercent", this.settings.topSizePercent);
                    this.settings.maxHeightPercent = this.getValue<number>(dmObjects, "settings", "maxHeightPercent", this.settings.maxHeightPercent);
            }
        }

        private getTextColor<T>(settings: DataViewObject, textName: string, defaultValue: T ): T {
            if (settings) {
                let property = settings[textName];
                if (property !== undefined) {
                    return <T>property["solid"]["color"]
                }
            }
            return defaultValue;
        }

        private getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T ): T {
            if (objects) {
                let object = objects[objectName];
                if (object) {
                    let property: T = <T>object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
            return defaultValue;
        }

        public update(options: VisualUpdateOptions) {
            const dataView: DataView = options
                && options.dataViews
                && options.dataViews[0];
            const dmoSettings = dataView.metadata.objects || null;
            const displayOptions = options.viewMode;
            const width: number = options.viewport.width;
            const height: number = options.viewport.height;
            const topText = this.formatValue(dataView.table.rows[0][0]);
            const bottomText = this.formatValue(dataView.table.rows[0][1]);

            this.parseSettings(dataView);
            const bottomColor: string = this.settings.bottomColor;
            const topColor: string = this.settings.topColor;
            const topFontSizePercent = this.settings.topSizePercent / 100;
            const maxHeightPercent = this.settings.maxHeightPercent / 100;

            //console.log('Update Variables', this.settings);
            
            this.svg.attr({
                width: width,
                height: height
            });

            // TODO: bound the font size to keep the text within the width of the view area
            let fontSizeValue: number = (height * maxHeightPercent) * topFontSizePercent;

            this.topText
                .text(topText.toString())
                .attr({
                    x: "50%",
                    y: "0%",
                    dy: fontSizeValue*.9,
                    "text-anchor": "middle"
                }).style("font-size", fontSizeValue + "px").style('fill', topColor);
            
            if (topFontSizePercent<=.9) { // One line banner
                let fontSizeLabel: number = ((height * maxHeightPercent) * (1 - topFontSizePercent)) * .9;
                
                this.bottomText
                    .text(bottomText.toString())
                    .attr({
                        x: "50%",
                        y: fontSizeValue,
                        dy: fontSizeLabel*.9,
                        "text-anchor": "middle"
                    }).style("font-size", fontSizeLabel + "px").style('fill', bottomColor);
            }
            else this.bottomText.text("");
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName: string = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];
            const bottomColor: string = this.settings.bottomColor;
            const topColor: string = this.settings.topColor;
            const topSize: number = this.settings.topSizePercent;
            const maxHeight: number = this.settings.maxHeightPercent;

            //console.log('Enumerate Object Instances', options, this.settings)
            switch( objectName ) {
                case 'settings':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: "Colors",
                        properties: { 
                            topColor: {
                                displayName: "Top Color",
                                displayNameKey: "Visual_DefaultColorTop",
                                type: {
                                    fill: {
                                        solid: {
                                            color: topColor,
                                        }
                                    }
                                }
                            },
                            bottomColor: {
                                displayName: "Bottom Color",
                                displayNameKey: "Visual_DefaultColorBottom",
                                type: {
                                    fill: {
                                        solid: {
                                            color: bottomColor,
                                        }
                                    }
                                }
                            },                            
                            topSizePercent: {
                                displayName: "Top Text %",
                                displayNameKey: "Visual_TopHeight",
                                type: {integer: topSize},
                            },
                            maxHeightPercent: {
                                displayName: "Max Height %",
                                displayNameKey: "Visual_MaxHeight",
                                type: {integer: maxHeight},
                            }
                        },
                        validValues: {
                            topSizePercent: {
                                numberRange: {
                                    min: 10,
                                    max: 100
                                }
                            },
                            maxHeightPercent: {
                                numberRange: {
                                    min: 50,
                                    max: 100
                                } 
                            }
                        },
                        selector: null
                    });
                break;    
            };

            return objectEnumeration;
        }
    }
}