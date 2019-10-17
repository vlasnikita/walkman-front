let state = {
    active: [],
    session_id: 1,
    totem: false,
    cone: false,
    wc: false,
    way: false,
    court: false,
    food: false,
    pharmacy: false,
    bar: false,
    bank: false,
    hookah: false,
    product: false,
    tabak: false,
    flower: false
};

const lineStyle = {
    strokeColor: "#814ed1",
    strokeWidth: 4,
    strokeStyle: 'dot',
    animationTime: 2000
}

const courtStyle = {
    fillColor: '#FF000098',
    strokeWidth: 1,
    strokeColor: '#790101'
}

var tsumLine, tsumPoint, 
    gumLine, gumPoint,
    squareLine, squarePoint,
    cdmLine, cdmPoint,
    museumLine, museumPoint,
    theatreLine, theatrePoint,
    macLine, macPoint,
    starLine, starPoint,
    sberLine, sberPoint,
    shokoLine, shokoPoint,
    kfcLine, kfcPoint;

var pol1,pol2,pol3,pol4,pol5,pol6,pol7,pol8,pol9,pol10,pol11,pol12,pol13,pol14,pol15,pol16;

var timeout;


ymaps.ready(['AnimatedLine']).then(function(){ 
    //#region set weather
    $.ajax({ url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com" }).done(function(uData) {
        let data = JSON.parse(uData)
        document.querySelector('.pogodaImg').src = 'https://yastatic.net/weather/i/icons/blueye/color/svg/' + data.fact.icon + '.svg'
        document.querySelector('.pogoda').innerHTML = data.fact.temp + '°C'
    });
    //#endregion 

    //#region common funcs 
    function zoomIcon(zoom) {
    // Минимальный размер метки будет 8px, а максимальный 200px.
    // Размер метки будет расти с квадратичной зависимостью от уровня зума.
    return zoom > 17 ? zoom * 2 : zoom * 1.25;
    // return Math.min(Math.pow(zoom, 2) + 8, 20);
    }
    function setBalloonContentLayout (placemark, panorama) {
        var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div id="panorama" style="width:300px;height:200px"></div>', {
                build: function () {
                    BalloonContentLayout.superclass.build.call(this);
                    this._openPanorama();
                },
                clear: function () {
                    this._destroyPanoramaPlayer();
                    BalloonContentLayout.superclass.clear.call(this);
                },
                _openPanorama: function () {
                    if (!this._panoramaPlayer) {
                        var el = this.getParentElement().querySelector('#panorama');
                        this._panoramaPlayer = new ymaps.panorama.Player(el, panorama, {
                            controls: ['panoramaName']
                        });
                    }
                },
                _destroyPanoramaPlayer: function () {
                    if (this._panoramaPlayer) {
                        this._panoramaPlayer.destroy();
                        this._panoramaPlayer = null;
                    }
                }
            });
        placemark.options.set('balloonContentLayout', BalloonContentLayout);
    }
    function requestForPanorama (e) {
        var placemark = e.get('target'),
            // Координаты точки, для которой будем запрашивать панораму.
            coords = placemark.geometry.getCoordinates(),
            // Тип панорамы (воздушная или наземная).
            panoLayer = placemark.properties.get('panoLayer');

        placemark.properties.set('balloonContent', "Идет проверка на наличие панорамы...");

        // Запрашиваем объект панорамы.
        ymaps.panorama.locate(coords, {
            layer: panoLayer
        }).then(
            function (panoramas) {
                if (panoramas.length) {
                    // Устанавливаем для балуна макет, содержащий найденную панораму.
                    setBalloonContentLayout(placemark, panoramas[0]);
                } else {
                    // Если панорам не нашлось, задаем
                    // в содержимом балуна простой текст.
                    placemark.properties.set('balloonContent', "Для данной точки панорамы нет.");
                }
            },
            function (err) {
                placemark.properties.set('balloonContent',
                    "При попытке открыть панораму произошла ошибка: " + err.toString());
            }
        );
    }
    function clearWaypoints(){
        myMap.geoObjects.remove(tsumLine)
        myMap.geoObjects.remove(tsumPoint)
        myMap.geoObjects.remove(cdmLine)
        myMap.geoObjects.remove(cdmPoint)
        myMap.geoObjects.remove(squareLine)
        myMap.geoObjects.remove(squarePoint)
        myMap.geoObjects.remove(gumLine)
        myMap.geoObjects.remove(gumPoint)
        myMap.geoObjects.remove(museumLine)
        myMap.geoObjects.remove(museumPoint)
        myMap.geoObjects.remove(theatreLine)
        myMap.geoObjects.remove(theatrePoint)

        myMap.geoObjects.remove(macLine)
        myMap.geoObjects.remove(macPoint)
        myMap.geoObjects.remove(starLine)
        myMap.geoObjects.remove(starPoint)
        myMap.geoObjects.remove(sberLine)
        myMap.geoObjects.remove(sberPoint)
        myMap.geoObjects.remove(shokoLine)
        myMap.geoObjects.remove(shokoPoint)
        myMap.geoObjects.remove(kfcLine)
        myMap.geoObjects.remove(kfcPoint)

        omBank.removeAll()
        omBar.removeAll()
        omCone.removeAll()
        omCourt.removeAll()
        omFlower.removeAll()
        omFood.removeAll()
        omHookah.removeAll()
        omPharmacy.removeAll()
        omProduct.removeAll()
        omTabak.removeAll()
        omTotem.removeAll()
        omWC.removeAll()

        omCourt.removeAll();
        myMap.geoObjects.remove(pol1)
        myMap.geoObjects.remove(pol2)
        myMap.geoObjects.remove(pol3)
        myMap.geoObjects.remove(pol4)
        myMap.geoObjects.remove(pol5)
        myMap.geoObjects.remove(pol6)
        myMap.geoObjects.remove(pol7)
        myMap.geoObjects.remove(pol8)
        myMap.geoObjects.remove(pol9)
        myMap.geoObjects.remove(pol10)
        myMap.geoObjects.remove(pol11)
        myMap.geoObjects.remove(pol12)
        myMap.geoObjects.remove(pol13)
        myMap.geoObjects.remove(pol14)
        myMap.geoObjects.remove(pol15)
        myMap.geoObjects.remove(pol16)

        $('.panelButton').removeClass('active')

    }
    function centerAndDelay(lat, long, zoom, delay, func){
        clearWaypoints();
        myMap.setCenter([lat, long], zoom, { duration: delay })
        setTimeout(func, delay)
    }
    function reset(){
        ym(54823339, 'reachGoal', 'reset')
        state.way = false;
        clearWaypoints()
        // 55.757642, 37.633503
        myMap.setCenter([55.757642, 37.633503], 16) 
        setTimeout(clearWaypoints, 2000);
    }
    function startWay(){
        // clearTimeout(timeout);
        // state.way = true;
        // timeout = setTimeout(function(){
        //     if(state.way){
        //         state.way = false;
        //         reset();
        //     }
        // }, 25000)
    }
//#endregion

    //#region Создание метки myGeo и карты
    var createChipsLayoutMyGeo = function (calculateSize) {
        // Создадим макет метки.
        var Chips = ymaps.templateLayoutFactory.createClass(
            '<div class="myGeo"></div>',
            {
                build: function () {
                    Chips.superclass.build.call(this);
                    var map = this.getData().geoObject.getMap();
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('myGeo')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return Chips;
    };
    var createChipsLayoutMyMin = function (calculateSize) {
        // Создадим макет метки.
        var ChipsMin = ymaps.templateLayoutFactory.createClass(
            '<div class="min"></div>',
            {
                build: function () {
                    ChipsMin.superclass.build.call(this);
                    var map = this.getData().geoObject.getMap();
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('min')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsMin;
    };
   
    var myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [55.757631, 37.633452],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 16,
        controls: ['rulerControl', 'zoomControl']
    }, {
        restrictMapArea: [
            [55.766014, 37.616819],
            [55.750012, 37.646153]
        ],
        suppressMapOpenBlock: true
    });

    myMap.geoObjects.events.add('balloonopen', function (e) {
        ym(54823339, 'reachGoal', 'poi_panorama_' + e.get('target').options._options.pointName)
    })
    //#endregion

    //#region chips
    var createChipsLayoutTotems = function (calculateSize) {
        // Создадим макет метки.
        var ChipsTotem = ymaps.templateLayoutFactory.createClass(
            '<div class="totem"></div>',
            {
                build: function () {
                    ChipsTotem.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('totem')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsTotem;
    };
    var createChipsLayoutCones = function (calculateSize) {
        // Создадим макет метки.
        var ChipsCone = ymaps.templateLayoutFactory.createClass(
            '<div class="cone"></div>',
            {
                build: function () {
                    ChipsCone.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('cone')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsCone;
    };
    var createChipsLayoutWC = function (calculateSize) {
        // Создадим макет метки.
        var ChipsWC = ymaps.templateLayoutFactory.createClass(
            '<div class="wc"></div>',
            {
                build: function () {
                    ChipsWC.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('wc')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsWC;
    };
    var createChipsLayoutPharmacy = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPharmacy = ymaps.templateLayoutFactory.createClass(
            '<div class="pharmacy"></div>',
            {
                build: function () {
                    ChipsPharmacy.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('pharmacy')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPharmacy;
    };
    var createChipsLayoutFood = function (calculateSize) {
        // Создадим макет метки.
        var ChipsFood = ymaps.templateLayoutFactory.createClass(
            '<div class="food"></div>',
            {
                build: function () {
                    ChipsFood.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('food')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsFood;
    };
    var createChipsLayoutHookah = function (calculateSize) {
        // Создадим макет метки.
        var ChipsHookah = ymaps.templateLayoutFactory.createClass(
            '<div class="hookah"></div>',
            {
                build: function () {
                    ChipsHookah.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('hookah')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsHookah;
    };
    var createChipsLayoutBar = function (calculateSize) {
        // Создадим макет метки.
        var ChipsBar = ymaps.templateLayoutFactory.createClass(
            '<div class="bar"></div>',
            {
                build: function () {
                    ChipsBar.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('bar')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsBar;
    };
    var createChipsLayoutBank = function (calculateSize) {
        // Создадим макет метки.
        var ChipsBank = ymaps.templateLayoutFactory.createClass(
            '<div class="bank"></div>',
            {
                build: function () {
                    ChipsBank.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('bank')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsBank;
    };
    var createChipsLayoutProduct = function (calculateSize) {
        // Создадим макет метки.
        var ChipsProduct = ymaps.templateLayoutFactory.createClass(
            '<div class="product"></div>',
            {
                build: function () {
                    ChipsProduct.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('product')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsProduct;
    };
    var createChipsLayoutTabak = function (calculateSize) {
        // Создадим макет метки.
        var ChipsTabak = ymaps.templateLayoutFactory.createClass(
            '<div class="tabak"></div>',
            {
                build: function () {
                    ChipsTabak.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('tabak')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsTabak;
    };
    var createChipsLayoutFlower = function (calculateSize) {
        // Создадим макет метки.
        var ChipsFlower = ymaps.templateLayoutFactory.createClass(
            '<div class="flower"></div>',
            {
                build: function () {
                    ChipsFlower.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('flower')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsFlower;
    };
    

    var createChipsLayoutExit1 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit1 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit1"></div>',
            {
                build: function () {
                    ChipsExit1.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit1')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit1;
    };
    var createChipsLayoutExit2 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit2 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit2"></div>',
            {
                build: function () {
                    ChipsExit2.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit2')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit2;
    };
    var createChipsLayoutExit3 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit3 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit3"></div>',
            {
                build: function () {
                    ChipsExit3.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit3')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit3;
    };
    var createChipsLayoutExit4 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit4 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit4"></div>',
            {
                build: function () {
                    ChipsExit4.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit4')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit4;
    };
    var createChipsLayoutExit5 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit5 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit5"></div>',
            {
                build: function () {
                    ChipsExit5.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit5')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit5;
    };
    var createChipsLayoutExit6 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit6 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit6"></div>',
            {
                build: function () {
                    ChipsExit6.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit6')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit6;
    };
    var createChipsLayoutExit7 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit7 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit7"></div>',
            {
                build: function () {
                    ChipsExit7.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit7')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit7;
    };
    var createChipsLayoutExit8 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit8 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit8"></div>',
            {
                build: function () {
                    ChipsExit8.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit8')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit8;
    };
    var createChipsLayoutExit9 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit9 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit9"></div>',
            {
                build: function () {
                    ChipsExit9.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit9')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit9;
    };
    var createChipsLayoutExit10 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit10 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit10"></div>',
            {
                build: function () {
                    ChipsExit10.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit10')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit10;
    };
    var createChipsLayoutExit11 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit11 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit11"></div>',
            {
                build: function () {
                    ChipsExit11.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit11')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit11;
    };
    var createChipsLayoutExit12 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsExit12 = ymaps.templateLayoutFactory.createClass(
            '<div class="exit12"></div>',
            {
                build: function () {
                    ChipsExit12.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('exit12')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsExit12;
    };

    var createChipsLayoutPoint1 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint1 = ymaps.templateLayoutFactory.createClass(
            '<div class="point1"></div>',
            {
                build: function () {
                    ChipsPoint1.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point1')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint1;
    };
    var createChipsLayoutPoint3 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint3 = ymaps.templateLayoutFactory.createClass(
            '<div class="point3"></div>',
            {
                build: function () {
                    ChipsPoint3.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point3')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint3;
    };
    var createChipsLayoutPoint5 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint5 = ymaps.templateLayoutFactory.createClass(
            '<div class="point5"></div>',
            {
                build: function () {
                    ChipsPoint5.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point5')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint5;
    };
    var createChipsLayoutPoint7 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint7 = ymaps.templateLayoutFactory.createClass(
            '<div class="point7"></div>',
            {
                build: function () {
                    ChipsPoint7.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point7')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint7;
    };
    var createChipsLayoutPoint9 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint9 = ymaps.templateLayoutFactory.createClass(
            '<div class="point9"></div>',
            {
                build: function () {
                    ChipsPoint9.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point9')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint9;
    };
    var createChipsLayoutPoint12 = function (calculateSize) {
        // Создадим макет метки.
        var ChipsPoint12 = ymaps.templateLayoutFactory.createClass(
            '<div class="point12"></div>',
            {
                build: function () {
                    ChipsPoint12.superclass.build.call(this);
                    let map = myMap;
                    if (!this.inited) {
                        this.inited = true;
                        // Получим текущий уровень зума.
                        var zoom = map.getZoom();
                        // Подпишемся на событие изменения области просмотра карты.
                        map.events.add('boundschange', function () {
                            // Запустим перестраивание макета при изменении уровня зума.
                            var currentZoom = map.getZoom();
                            if (currentZoom != zoom) {
                                zoom = currentZoom;
                                this.rebuild();
                            }
                        }, this);
                    }
                    var options = this.getData().options,
                        // Получим размер метки в зависимости от уровня зума.
                        size = calculateSize(map.getZoom()),
                        element = this.getParentElement().getElementsByClassName('point12')[0],
                        // По умолчанию при задании своего HTML макета фигура активной области не задается,
                        // и её нужно задать самостоятельно.
                        // Создадим фигуру активной области "Круг".
                        circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                    // Зададим высоту и ширину метки.
                    element.style.width = element.style.height = size + 'px';
                    // Зададим смещение.
                    element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                    // Зададим фигуру активной области.
                    options.set('shape', circleShape);
                }
            }
        );
    
        return ChipsPoint12;
    };
//#endregion 

    //#region Геометка, круги, пешеход
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
    );

    var myGeo = new ymaps.Placemark([55.757642, 37.633503], {
        balloonContent: 'Я нахожусь здесь!'
    }, {
        iconLayout: createChipsLayoutMyGeo(function (zoom) {
            return zoom * 2 + 25;
        }),
        // Своё изображение иконки метки.
        iconImageHref: 'images/myGeo.svg',
        // Размеры метки.
        iconImageSize: [36, 36],
        // Макет содержимого.
        iconContentLayout: MyIconContentLayout
    });
    myMap.geoObjects.add(myGeo)

    var myCircle = new ymaps.Circle([
        [55.757631, 37.633452],
        400
    ], {}, {
        draggable: false,
        fillOpacity: 0,
        strokeColor: "#990000",
        strokeOpacity: 0.5,
        strokeWidth: 1
    });
    myMap.geoObjects.add(myCircle);

    var myCircle2 = new ymaps.Circle([
        [55.757631, 37.633452],
        407
    ], {}, {
        draggable: false,
        fillOpacity: 0,
        strokeColor: "#990000",
        strokeOpacity: 0.5,
        strokeWidth: 1
    });
    myMap.geoObjects.add(myCircle2);
    
    var myMin = new ymaps.Placemark([55.761259, 37.633503], {}, {
        iconLayout: createChipsLayoutMyMin(function (zoom) {
            switch(zoom){
                case 16: return zoom * 8 + 5;
                case 17: return zoom * 8 + 30;
                case 18: return zoom * 15 + 30;
                case 18: return zoom * 24 + 30;
                case 19: return zoom * 30 + 30;
                default: return zoom * 8 + 5;
            }
        }),
        // Своё изображение иконки метки.
        iconImageHref: 'images/min.svg',
        // Размеры метки.
        iconImageSize: [10, 10],
        // Макет содержимого.
        iconContentLayout: MyIconContentLayout
    });
    myMap.geoObjects.add(myMin)
    //#endregion 

    //#region Создание кластера меток: тотем, выходы из метро и БМ 
    var omTotem = new ymaps.ObjectManager();
    var omCone = new ymaps.ObjectManager();
    var omWC = new ymaps.ObjectManager();
    var omCourt = new ymaps.ObjectManager();
    var omPharmacy = new ymaps.ObjectManager();
    var omFood = new ymaps.ObjectManager();
    var omHookah = new ymaps.ObjectManager();
    var omBar = new ymaps.ObjectManager();
    var omBank = new ymaps.ObjectManager();
    var omProduct = new ymaps.ObjectManager();
    var omTabak = new ymaps.ObjectManager();
    var omFlower = new ymaps.ObjectManager();


    var omExit1 = new ymaps.ObjectManager();
    var omExit2 = new ymaps.ObjectManager();
    var omExit3 = new ymaps.ObjectManager();
    var omExit4 = new ymaps.ObjectManager();
    var omExit5 = new ymaps.ObjectManager();
    var omExit6 = new ymaps.ObjectManager();
    var omExit7 = new ymaps.ObjectManager();
    var omExit8 = new ymaps.ObjectManager();
    var omExit9 = new ymaps.ObjectManager();
    var omExit10 = new ymaps.ObjectManager();
    var omExit11 = new ymaps.ObjectManager();
    var omExit12 = new ymaps.ObjectManager();

    var omPoint1 = new ymaps.ObjectManager();
    var omPoint3 = new ymaps.ObjectManager();
    var omPoint5 = new ymaps.ObjectManager();
    var omPoint7 = new ymaps.ObjectManager();
    var omPoint9 = new ymaps.ObjectManager();
    var omPoint12 = new ymaps.ObjectManager();

    myMap.geoObjects.add(omTotem);
    myMap.geoObjects.add(omCone);
    myMap.geoObjects.add(omWC);
    myMap.geoObjects.add(omCourt);
    myMap.geoObjects.add(omPharmacy);
    myMap.geoObjects.add(omFood);
    myMap.geoObjects.add(omHookah);
    myMap.geoObjects.add(omBar);
    myMap.geoObjects.add(omBank);
    myMap.geoObjects.add(omProduct);
    myMap.geoObjects.add(omTabak);
    myMap.geoObjects.add(omFlower);

    myMap.geoObjects.add(omExit1);
    myMap.geoObjects.add(omExit2);
    myMap.geoObjects.add(omExit3);
    myMap.geoObjects.add(omExit4);
    myMap.geoObjects.add(omExit5);
    myMap.geoObjects.add(omExit6);
    myMap.geoObjects.add(omExit7);
    myMap.geoObjects.add(omExit8);
    myMap.geoObjects.add(omExit9);
    myMap.geoObjects.add(omExit10);
    myMap.geoObjects.add(omExit11);
    myMap.geoObjects.add(omExit12);

    myMap.geoObjects.add(omPoint1);
    myMap.geoObjects.add(omPoint3);
    myMap.geoObjects.add(omPoint5);
    myMap.geoObjects.add(omPoint7);
    myMap.geoObjects.add(omPoint9);
    myMap.geoObjects.add(omPoint12);

    omTotem.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_totem')
    })
    omCone.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_cone')
    })
    omWC.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_wc')
    })
    omPharmacy.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_pharmacy')
    })
    omFood.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_food')
    })
    omHookah.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_hookah')
    })
    omBar.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_bar')
    })
    omBank.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_bank')
    })
    omProduct.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_product')
    })
    omTabak.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_tabak')
    })
    omFlower.objects.events.add('click', function (e) {
        ym(54823339, 'reachGoal', 'cat_click_flower')
    })
    //#endregion 

    //#region AJAXs for exits
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit1"
    }).done(function(data) {
        omExit1.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit2"
    }).done(function(data) {
        omExit2.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit3"
    }).done(function(data) {
        omExit3.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit4"
    }).done(function(data) {
        omExit4.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit5"
    }).done(function(data) {
        omExit5.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit6"
    }).done(function(data) {
        omExit6.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit7"
    }).done(function(data) {
        omExit7.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit8"
    }).done(function(data) {
        omExit8.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit9"
    }).done(function(data) {
        omExit9.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit10"
    }).done(function(data) {
        omExit10.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit11"
    }).done(function(data) {
        omExit11.add(data);
    });
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://walkmap.herokuapp.com/exit12"
    }).done(function(data) {
        omExit12.add(data);
    });
//#endregion

    //#region chips setters
    omTotem.options.set("geoObjectIconLayout", createChipsLayoutTotems(zoomIcon, myMap)
    );
    omCone.options.set("geoObjectIconLayout", createChipsLayoutCones(zoomIcon, myMap)
    );
    omWC.options.set("geoObjectIconLayout", createChipsLayoutWC(zoomIcon, myMap));
    omPharmacy.options.set("geoObjectIconLayout", createChipsLayoutPharmacy(zoomIcon, myMap));
    omFood.options.set("geoObjectIconLayout", createChipsLayoutFood(zoomIcon, myMap));
    omHookah.options.set("geoObjectIconLayout", createChipsLayoutHookah(zoomIcon, myMap));
    omBar.options.set("geoObjectIconLayout", createChipsLayoutBar(zoomIcon, myMap));
    omBank.options.set("geoObjectIconLayout", createChipsLayoutBank(zoomIcon, myMap));
    omProduct.options.set("geoObjectIconLayout", createChipsLayoutProduct(zoomIcon, myMap));
    omTabak.options.set("geoObjectIconLayout", createChipsLayoutTabak(zoomIcon, myMap));
    omFlower.options.set("geoObjectIconLayout", createChipsLayoutFlower(zoomIcon, myMap));

    omExit1.options.set("geoObjectIconLayout", createChipsLayoutExit1(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit2.options.set("geoObjectIconLayout", createChipsLayoutExit2(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit3.options.set("geoObjectIconLayout", createChipsLayoutExit3(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit4.options.set("geoObjectIconLayout", createChipsLayoutExit4(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit5.options.set("geoObjectIconLayout", createChipsLayoutExit5(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit6.options.set("geoObjectIconLayout", createChipsLayoutExit6(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit7.options.set("geoObjectIconLayout", createChipsLayoutExit7(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit8.options.set("geoObjectIconLayout", createChipsLayoutExit8(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit9.options.set("geoObjectIconLayout", createChipsLayoutExit9(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit10.options.set("geoObjectIconLayout", createChipsLayoutExit10(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit11.options.set("geoObjectIconLayout", createChipsLayoutExit11(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omExit12.options.set("geoObjectIconLayout", createChipsLayoutExit12(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 14 : 0;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );


    omPoint1.options.set("geoObjectIconLayout", createChipsLayoutPoint1(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omPoint3.options.set("geoObjectIconLayout", createChipsLayoutPoint3(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omPoint5.options.set("geoObjectIconLayout", createChipsLayoutPoint5(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omPoint7.options.set("geoObjectIconLayout", createChipsLayoutPoint7(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omPoint9.options.set("geoObjectIconLayout", createChipsLayoutPoint9(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
    omPoint12.options.set("geoObjectIconLayout", createChipsLayoutPoint12(function (zoom) {
        // Минимальный размер метки будет 8px, а максимальный 200px.
        // Размер метки будет расти с квадратичной зависимостью от уровня зума.
        return zoom > 17 ? 28 : 40;
        // return Math.min(Math.pow(zoom, 2) + 8, 20);
        }, myMap)
    );
//#endregion

    //#region buttons 

    document.querySelector('.totemButton').addEventListener('click', function(e){
        if(state.totem){
            omTotem.removeAll()
            $('.totemButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_totem')
            omTotem.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760364, 37.626333]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759761, 37.625284]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759318, 37.624310]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759478, 37.623704]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758834, 37.620613]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758592, 37.617922]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756286, 37.629759]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760839, 37.620691]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760684, 37.623597]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.764030, 37.619776]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760278, 37.631555]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757682, 37.633503]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760932, 37.631708]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 14, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760448, 37.631568]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 15, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761716, 37.633086]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 16, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762330, 37.634531]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 17, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759740, 37.628025]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 18, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754227, 37.634640]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 19, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757846, 37.646437]
                        }
                    }
                ]
            });
            $('.totemButton').addClass('active')
        }
        state.totem = !state.totem
    })
    document.querySelector('.coneButton').addEventListener('click', function(e){
        if(state.cone){
            omCone.removeAll()
            $('.coneButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_cone')
            omCone.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758617, 37.628298]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756452, 37.626942]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.752588, 37.626189]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.753791, 37.634824]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757061, 37.634458]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760769, 37.632435]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756699, 37.634610]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.755251, 37.639657]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756538, 37.639392]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757812, 37.639104]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756978, 37.630776]
                        }
                    }
                ]
            });
            $('.coneButton').addClass('active')
        }
        state.cone = !state.cone
    })
    document.querySelector('.wcButton').addEventListener('click', function(e){
        if(state.wc){
            omWC.removeAll()
            $('.wcButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_wc')
            omWC.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759877, 37.624791]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.755356, 37.620004]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754789, 37.617269]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754400, 37.621033]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.755609, 37.621961]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758099, 37.625942]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759462, 37.630875]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757696, 37.634218]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756440, 37.631978]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.755974, 37.632703]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.755937, 37.647809]
                        }
                    }
                ]
            });
            $('.wcButton').addClass('active')
        }
        state.wc = !state.wc
    })
    document.querySelector('.courtButton').addEventListener('click', function(e){
        if(state.court){
            omCourt.removeAll();
            myMap.geoObjects.remove(pol1)
            myMap.geoObjects.remove(pol2)
            myMap.geoObjects.remove(pol3)
            myMap.geoObjects.remove(pol4)
            myMap.geoObjects.remove(pol5)
            myMap.geoObjects.remove(pol6)
            myMap.geoObjects.remove(pol7)
            myMap.geoObjects.remove(pol8)
            myMap.geoObjects.remove(pol9)
            myMap.geoObjects.remove(pol10)
            myMap.geoObjects.remove(pol11)
            myMap.geoObjects.remove(pol12)
            myMap.geoObjects.remove(pol13)
            myMap.geoObjects.remove(pol14)
            myMap.geoObjects.remove(pol15)
            myMap.geoObjects.remove(pol16)
            $('.courtButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_court')
            pol1 = new ymaps.Polygon([
                [
                    [55.761505, 37.626133],
                    [55.761366, 37.626659],
                    [55.761057, 37.626389],
                    [55.761178, 37.625852]
                ]
            ], {}, courtStyle);
            pol2 = new ymaps.Polygon([
                [
                    [55.760032, 37.620295],
                    [55.760076, 37.620544],
                    [55.759949, 37.620614],
                    [55.759910, 37.620367]
                ],
            ], {}, courtStyle);
            pol3 = new ymaps.Polygon([
                [
                    [55.760829, 37.628879],
                    [55.760712, 37.629179],
                    [55.760242, 37.628210],
                    [55.760411, 37.627871]
                ],
            ], {}, courtStyle);
            pol4 = new ymaps.Polygon([
                [
                    [55.761883, 37.629081],
                    [55.761859, 37.629260],
                    [55.761600, 37.629033],
                    [55.761635, 37.628883]
                ],
            ], {}, courtStyle);
            pol5 = new ymaps.Polygon([
                [
                    [55.763964, 37.630080],
                    [55.763942, 37.630270],
                    [55.763779, 37.630226],
                    [55.763813, 37.629989]
                ],
            ], {}, courtStyle);
            pol6 = new ymaps.Polygon([
                [
                    [55.762854, 37.626347],
                    [55.762796, 37.626762],
                    [55.762705, 37.626304]
                ],
            ], {}, courtStyle);
            pol7 = new ymaps.Polygon([
                [
                    [55.762599, 37.627389],
                    [55.762556, 37.627798],
                    [55.762435, 37.627749],
                    [55.762456, 37.627503],
                    [55.762586, 37.627358]
                ],
            ], {}, courtStyle);

            pol8 = new ymaps.Polygon([
                [
                    [55.761272, 37.627986],
                    [55.760965, 37.628646],
                    [55.760518, 37.627573],
                    [55.760596, 37.627364]
                ],
            ], {}, courtStyle);
            pol9 = new ymaps.Polygon([
                [
                    [55.758188, 37.629024],
                    [55.758110, 37.628818],
                    [55.757868, 37.629161],
                    [55.757925, 37.629424]
                ],
            ], {}, courtStyle);
            pol10 = new ymaps.Polygon([
                [
                    [55.757682, 37.629791],
                    [55.757245, 37.630470],
                    [55.757118, 37.630105],
                    [55.757553, 37.629531]
                ],
            ], {}, courtStyle);
            pol11 = new ymaps.Polygon([
                [
                    [55.758678, 37.622026],
                    [55.758485, 37.621994],
                    [55.758464, 37.621838],
                    [55.758580, 37.621774],
                    [55.758651, 37.621849]
                ],
            ], {}, courtStyle);
            pol12 = new ymaps.Polygon([
                [
                    [55.757541, 37.617295],
                    [55.757251, 37.617874],
                    [55.756779, 37.617059],
                    [55.757057, 37.616501]
                ],
            ], {}, courtStyle);

            pol13 = new ymaps.Polygon([
                [
                    [55.758214, 37.636971],
                    [55.758292, 37.637109],
                    [55.758108, 37.637250],
                    [55.758078, 37.637091]
                ],
            ], {}, courtStyle);
            pol14 = new ymaps.Polygon([
                [
                    [55.754145, 37.637505],
                    [55.754208, 37.637684],
                    [55.754007, 37.637965],
                    [55.753926, 37.637810]
                ],
            ], {}, courtStyle);
            pol15 = new ymaps.Polygon([
                [
                    [55.753629, 37.638402],
                    [55.753829, 37.638880],
                    [55.753786, 37.638929],
                    [55.753544, 37.638718]
                ],
            ], {}, courtStyle);
            pol16 = new ymaps.Polygon([
                [
                    [55.759815, 37.637188],
                    [55.759884, 37.637322],
                    [55.759677, 37.637604],
                    [55.759552, 37.637379]
                ],
            ], {}, courtStyle);

            myMap.geoObjects.add(pol1);
            myMap.geoObjects.add(pol2);
            myMap.geoObjects.add(pol3);
            myMap.geoObjects.add(pol4);
            myMap.geoObjects.add(pol5);
            myMap.geoObjects.add(pol6);
            myMap.geoObjects.add(pol7);
            myMap.geoObjects.add(pol8);
            myMap.geoObjects.add(pol9);
            myMap.geoObjects.add(pol10);
            myMap.geoObjects.add(pol11);
            myMap.geoObjects.add(pol12);
            myMap.geoObjects.add(pol13);
            myMap.geoObjects.add(pol14);
            myMap.geoObjects.add(pol15);
            myMap.geoObjects.add(pol16);

            pol1.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol2.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol3.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol4.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol5.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol6.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol7.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol8.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol9.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol10.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol11.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol12.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol13.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol14.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol15.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })
            pol16.events.add('click', function(e){
                ym(54823339, 'reachGoal', 'cat_click_court')
            })

            $('.courtButton').addClass('active')
        }
        state.court = !state.court
    })
    document.querySelector('.foodButton').addEventListener('click', function(e){
        if(state.food){
            omFood.removeAll()
            $('.foodButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_food')
            omFood.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760105, 37.624933]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Бургер Кинг</li><li>Макдональдс</li><li>Буше</li><li>Суши Make</li><li>Ванвок</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759156, 37.624912]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Московская Сеть Кальянных</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758872, 37.625062]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Farш</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758184, 37.625657]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Мандарин. Лапша и утки</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758502, 37.623421]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Wine&Crab</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759801, 37.631661]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Тануки</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760737, 37.632038]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Му-му</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758576, 37.632755]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Пропаганда</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758170, 37.624848]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Вокруг света</li><li>Poke</li><li>Burger Factory</li><li>Вок и Утка</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756965, 37.628572]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Натахтари</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760881, 37.622702]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Ткемали</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761111, 37.623306]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Greek Freak</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761588, 37.623708]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Cofix</li><li>KFC</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 14, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762042, 37.625771]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Шашлыкoff</li><li>Напитки</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 15, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762623, 37.627144]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Грузинские каникулы</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 16, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761513, 37.632419]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Старбакс</li><li>Бургер Кинг</li><li>KFC</li><li>Pita\'s</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 17, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757759, 37.634225]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Макдональдс</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 18, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757408, 37.633403]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Центральный на Маросейке</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 19, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758576, 37.632755]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>Пропаганда</li></ul>'
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 20, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758340, 37.638790]
                        },
                        properties: {
                            balloonContentBody: '<ul class="balloonList"><li>МосДонер</li></ul>'
                        }
                    }
                ]
            })
            $('.foodButton').addClass('active')
        }
        state.food = !state.food
    })
    document.querySelector('.pharmacyButton').addEventListener('click', function(e){
        if(state.pharmacy){
            omPharmacy.removeAll()
            $('.pharmacyButton').removeClass('active')
        } else {    
            ym(54823339, 'reachGoal', 'cat_pharmacy')      
            omPharmacy.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760105, 37.624933]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760731, 37.626306]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758457, 37.624000]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756998, 37.622536]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756241, 37.627882]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757141, 37.632129]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756590, 37.632428]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761063, 37.620809]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757446, 37.633300]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756581, 37.632327]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758319, 37.638582]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758095, 37.638812]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.753536, 37.638112]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 14, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754350, 37.637160]
                        }
                    }
                ]
            })
            $('.pharmacyButton').addClass('active')
        }
        state.pharmacy = !state.pharmacy
    })
    document.querySelector('.hookahButton').addEventListener('click', function(e){
        if(state.hookah){
            omHookah.removeAll()
            $('.hookahButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_hookah')
            omHookah.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759156, 37.624912]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760296, 37.622010]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758550, 37.629510]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759998, 37.621286]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760862, 37.622882]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757992, 37.639051]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757563, 37.636524]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757501, 37.635332]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754534, 37.637252]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758580, 37.633674]
                        }
                    }
                ]
            })
            $('.hookahButton').addClass('active')
        }
        state.hookah = !state.hookah
    })
    document.querySelector('.barButton').addEventListener('click', function(e){
        if(state.bar){
            omBar.removeAll()
            $('.barButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_bar')
            omBar.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762296, 37.621767]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760101, 37.621289]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757976, 37.627423]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757723, 37.624213]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759971, 37.631616]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757567, 37.635383]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757864, 37.636613]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757106, 37.635188]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756246, 37.635246]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758730, 37.640582]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761077, 37.632288]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762171, 37.634748]
                        }
                    }
                ]
            })
            $('.barButton').addClass('active')
        }
        state.bar = !state.bar
    })
    document.querySelector('.bankButton').addEventListener('click', function(e){
        if(state.bank){
            omBank.removeAll()
            $('.bankButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_bank')
            omBank.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760105, 37.624933]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759458, 37.626744]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760329, 37.623345]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759172, 37.625078]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761523, 37.624584]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759843, 37.630022]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761719, 37.628405]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762309, 37.623738]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.763504, 37.635467]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762307, 37.634571]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761487, 37.631793]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758775, 37.631384]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757376, 37.631381]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 14, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757698, 37.634119]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 15, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757300, 37.636399]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 16, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758009, 37.639108]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 17, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756452, 37.638144]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 18, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754048, 37.635858]
                        }
                    }
                ]
            })
            $('.bankButton').addClass('active')
        }
        state.bank = !state.bank
    })
    document.querySelector('.productButton').addEventListener('click', function(e){
        if(state.product){
            omProduct.removeAll()
            $('.productButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_product')
            omProduct.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760105, 37.624933]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761800, 37.628195]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759144, 37.624723]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758135, 37.624616]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761532, 37.623350]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761668, 37.620828]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759280, 37.632459]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760978, 37.632322]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757800, 37.635314]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759325, 37.632370]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [555.761033, 37.632513]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758106, 37.638914]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757914, 37.638229]
                        }
                    }
                ]
            })
            $('.productButton').addClass('active')
        }
        state.product = !state.product
    })
    document.querySelector('.tabakButton').addEventListener('click', function(e){
        if(state.tabak){
            omTabak.removeAll()
            $('.tabakButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_tabak')
            omTabak.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759195, 37.624746]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761995, 37.628618]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757239, 37.632611]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760178, 37.618957]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757251, 37.632666]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757690, 37.634774]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754557, 37.637541]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762469, 37.635506]
                        }
                    }
                ]
            })
            $('.tabakButton').addClass('active')
        }
        state.tabak = !state.tabak
    })
    document.querySelector('.flowerButton').addEventListener('click', function(e){
        if(state.flower){
            omFlower.removeAll()
            $('.flowerButton').removeClass('active')
        } else {
            ym(54823339, 'reachGoal', 'cat_flower')
            omFlower.add({
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature", 
                        "id": 1, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760989, 37.623755]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 2, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759128, 37.624702]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 3, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.757975, 37.627382]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 4, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758231, 37.624416]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 5, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759856, 37.630049]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 6, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761840, 37.623717]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 7, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760848, 37.623803]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 8, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760645, 37.622022]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 9, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.759826, 37.630068]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 10, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.761051, 37.632273]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 11, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.762645, 37.636969]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 12, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.760170, 37.640497]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 13, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758397, 37.638844]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 14, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.758352, 37.631802]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 15, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.754679, 37.636581]
                        }
                    },
                    {
                        "type": "Feature", 
                        "id": 16, 
                        "geometry": {
                            "type": "Point", 
                            "coordinates": [55.756817, 37.632305]
                        }
                    }
                ]
            })
            $('.flowerButton').addClass('active')
        }
        state.flower = !state.flower
    })

    //#endregion
    
    //#region set TSUM way 
    document.querySelector('.tsum').addEventListener('click', function(e){
        // Way to TSUM
        ym(54823339, 'reachGoal', 'tsum')
        centerAndDelay(55.759833, 37.626770, 16, 500, function(){
            tsumLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757274, 37.631460],
                [55.757972, 37.630070],
                [55.759464, 37.628186],
                [55.759872, 37.628233],
                [55.760506, 37.626889],
                [55.760577, 37.626319],
                [55.760437, 37.626270],
                [55.760640, 37.623465],
                [55.760847, 37.620754],
                [55.760771, 37.620433],
                [55.760690, 37.620427]
            ], {}, lineStyle);
            myMap.geoObjects.add(tsumLine);
            tsumPoint = new ymaps.Placemark([55.760690, 37.620427], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint12(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point12.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'tsum'
            }, {
            });

            tsumLine.animate()
            .then(function() {
                tsumPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(tsumPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
//#endregion
    //#region set GUM way
    document.querySelector('.gum').addEventListener('click', function(e){
        ym(54823339, 'reachGoal', 'gum')
        centerAndDelay(55.755847, 37.628210, 15, 500, function(){
            gumLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757474, 37.633501],
                [55.757144, 37.631604],
                [55.757050, 37.631679],
                [55.756328, 37.629785],
                [55.755854, 37.628954],
                [55.754244, 37.624128],
                [55.754060, 37.623665],
                [55.754138, 37.623536],
                [55.754029, 37.623277]
            ], {}, lineStyle);
            myMap.geoObjects.add(gumLine);

            gumPoint = new ymaps.Placemark([55.754029, 37.623277], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint9(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point9.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'gum'
            }, {
            });

            gumLine.animate()
            .then(function() {
                gumPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(gumPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 500);
            })
        })
        startWay();
    })
//#endregion 
    //#region set SQUARE way 
     document.querySelector('.square').addEventListener('click', function(e){
        // Way to Red Square
        ym(54823339, 'reachGoal', 'square')
        centerAndDelay(55.757279, 37.626327, 15, 500, function(){
            squareLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757474, 37.633501],
                [55.757144, 37.631604],
                [55.757050, 37.631679],
                [55.756328, 37.629785],
                [55.755854, 37.628954],
                [55.754244, 37.624128],
                [55.754060, 37.623665],
                [55.754138, 37.623536],
                [55.753595, 37.622298],
                [55.754027, 37.620333]
            ], {}, lineStyle);
            myMap.geoObjects.add(squareLine);

            squarePoint = new ymaps.Placemark([55.754027, 37.620333], {
                panoLayer: 'yandex#panorama'
            }, {
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                iconLayout: createChipsLayoutPoint12(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point12.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                pointName: 'square'
            }, {
            });
    
            squareLine.animate()
            .then(function() {
                squarePoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(squarePoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
    //#endregion
    //#region set CDM way 
    document.querySelector('.cdm').addEventListener('click', function(e){
        ym(54823339, 'reachGoal', 'cdm')
        centerAndDelay(55.758692, 37.629572, 16, 750, function(){
            cdmLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757274, 37.631460],
                [55.757972, 37.630070],
                [55.759464, 37.628186],
                [55.759872, 37.628233],
                [55.760506, 37.626889],
                [55.760577, 37.626319],
                [55.760437, 37.626270],
                [55.760342, 37.626205],
                [55.760094, 37.625978]
            ], {}, lineStyle);
            myMap.geoObjects.add(cdmLine);
            cdmPoint = new ymaps.Placemark([55.760094, 37.625978], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint7(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point7.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'cdm'
            }, {
            });

            cdmLine.animate()
            .then(function() {
                cdmPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(cdmPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
    //#endregion
    //#region set MUSEUM way 
    document.querySelector('.museum').addEventListener('click', function(e){
        ym(54823339, 'reachGoal', 'museum')
        centerAndDelay(55.758129, 37.630760, 17, 750, function(){
            museumLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757274, 37.631460],
                [55.757972, 37.630070],
                [55.759518, 37.628234],
                [55.759364, 37.627862],
                [55.759235, 37.627993],
                [55.759073, 37.627632],
                [55.758583, 37.628319]
            ], {}, lineStyle);
            myMap.geoObjects.add(museumLine);
            museumPoint = new ymaps.Placemark([55.758583, 37.628319], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint5(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point5.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'museum'
            }, {
            });

            museumLine.animate()
            .then(function() {
                museumPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(museumPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
    //#endregion

    //#region set MAC way 
document.querySelector('.mac').addEventListener('click', function(e){
    ym(54823339, 'reachGoal', 'mac')
    centerAndDelay(55.757642, 37.633503, 19, 500, function(){
        macLine = new ymaps.AnimatedLine([
            [55.757642, 37.633503],
            [55.757592, 37.633492],
            [55.757646, 37.634240]
        ], {}, lineStyle);
        myMap.geoObjects.add(macLine);
        macPoint = new ymaps.Placemark([55.757646, 37.634240], {
            panoLayer: 'yandex#panorama'
        }, {
            iconLayout: createChipsLayoutPoint1(function (zoom) {
                return zoom * 10 + 5;
            }),
            // Своё изображение иконки метки.
            iconImageHref: 'images/point1.svg',
            // Размеры метки.
            iconImageSize: [36, 36],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout,
            openEmptyBalloon: true,
            balloonPanelMaxMapArea: 0,
            pointName: 'mac'
        }, {
        });

        macLine.animate()
        .then(function() {
            macPoint.events.once('balloonopen', requestForPanorama);
            return myMap.geoObjects.add(macPoint);
        })
        .then(function() {
            return ymaps.vow.delay(null, 2000);
        })
    })
    startWay();
})
//#endregion
    //#region set STAR way 
document.querySelector('.star').addEventListener('click', function(e){
    ym(54823339, 'reachGoal', 'star')
    centerAndDelay(55.759183, 37.631939, 16, 750, function(){
        starLine = new ymaps.AnimatedLine([
            [55.757642, 37.633503],
            [55.759086, 37.631855],
            [55.759183, 37.631939],
            [55.760199, 37.631375],
            [55.760968, 37.632121],
            [55.761061, 37.631911],
            [55.761291, 37.632331]
        ], {}, lineStyle);
        myMap.geoObjects.add(starLine);
        starPoint = new ymaps.Placemark([55.761291, 37.632331], {
            panoLayer: 'yandex#panorama'
        }, {
            iconLayout: createChipsLayoutPoint5(function (zoom) {
                return zoom * 15 + 5;
            }),
            // Своё изображение иконки метки.
            iconImageHref: 'images/point5.svg',
            // Размеры метки.
            iconImageSize: [36, 36],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout,
            openEmptyBalloon: true,
            balloonPanelMaxMapArea: 0,
            pointName: 'star'
        }, {
        });

        starLine.animate()
        .then(function() {
            starPoint.events.once('balloonopen', requestForPanorama);
            return myMap.geoObjects.add(starPoint);
        })
        .then(function() {
            return ymaps.vow.delay(null, 2000);
        })
    })
    startWay();
})
//#endregion
    //#region set SBER way 
    document.querySelector('.sber').addEventListener('click', function(e){
        ym(54823339, 'reachGoal', 'sber')
        centerAndDelay(55.756765, 37.633569, 17, 750, function(){
            sberLine = new ymaps.AnimatedLine([
                [55.757470, 37.633493],
                [55.757524, 37.634069],
                [55.756615, 37.634681],
                [55.756067, 37.632964],
                [55.755869, 37.633219]
            ], {}, lineStyle);
            myMap.geoObjects.add(sberLine);
            sberPoint = new ymaps.Placemark([55.755869, 37.633219], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint3(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point3.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'sber'
            }, {
            });

            sberLine.animate()
            .then(function() {
                sberPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(sberPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
    //#endregion
    //#region set SHOKO way 
    document.querySelector('.shoko').addEventListener('click', function(e){
        ym(54823339, 'reachGoal', 'shoko')
        centerAndDelay(55.757470, 37.632486, 18, 1000, function(){
            shokoLine = new ymaps.AnimatedLine([
                [55.757642, 37.633503],
                [55.757587, 37.633451],
                [55.757274, 37.631460],
                [55.757349, 37.631348]
            ], {}, lineStyle);
            myMap.geoObjects.add(shokoLine);
            shokoPoint = new ymaps.Placemark([55.757349, 37.631348], {
                panoLayer: 'yandex#panorama'
            }, {
                iconLayout: createChipsLayoutPoint1(function (zoom) {
                    return zoom * 15 + 5;
                }),
                // Своё изображение иконки метки.
                iconImageHref: 'images/point1.svg',
                // Размеры метки.
                iconImageSize: [36, 36],
                // Макет содержимого.
                iconContentLayout: MyIconContentLayout,
                openEmptyBalloon: true,
                balloonPanelMaxMapArea: 0,
                pointName: 'shoko'
            }, {
            });

            shokoLine.animate()
            .then(function() {
                shokoPoint.events.once('balloonopen', requestForPanorama);
                return myMap.geoObjects.add(shokoPoint);
            })
            .then(function() {
                return ymaps.vow.delay(null, 2000);
            })
        })
        startWay();
    })
    //#endregion
    //#region set KFC way 
document.querySelector('.kfc').addEventListener('click', function(e){
    ym(54823339, 'reachGoal', 'kfc')
    centerAndDelay(55.759183, 37.631939, 16, 750, function(){
        kfcLine = new ymaps.AnimatedLine([
            [55.757642, 37.633503],
            [55.759086, 37.631855],
            [55.759183, 37.631939],
            [55.760199, 37.631375],
            [55.760968, 37.632121],
            [55.761061, 37.631911],
            [55.761492, 37.632690]
        ], {}, lineStyle);
        myMap.geoObjects.add(kfcLine);
        kfcPoint = new ymaps.Placemark([55.761492, 37.632690], {
            panoLayer: 'yandex#panorama'
        }, {
            iconLayout: createChipsLayoutPoint5(function (zoom) {
                return zoom * 15 + 5;
            }),
            // Своё изображение иконки метки.
            iconImageHref: 'images/point5.svg',
            // Размеры метки.
            iconImageSize: [36, 36],
            // Макет содержимого.
            iconContentLayout: MyIconContentLayout,
            openEmptyBalloon: true,
            balloonPanelMaxMapArea: 0,
            pointName: 'kfc'
        }, {
        });

        kfcLine.animate()
        .then(function() {
            kfcPoint.events.once('balloonopen', requestForPanorama);
            return myMap.geoObjects.add(kfcPoint);
        })
        .then(function() {
            return ymaps.vow.delay(null, 2000);
        })
    })
    startWay();
})
//#endregion
    
    document.querySelector('.cancel').addEventListener('click', reset)
});