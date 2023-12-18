"use strict";
"use strict";

var mapDelivery = document.querySelector('#map-delivery');

//if (mapDelivery) ymaps.ready(initYaMap);

function initYaMap() {
  var pointAddress = [55.884216, 37.689635];
  var myMap = new ymaps.Map('map-delivery', {
    center: pointAddress,
    zoom: 11,
    controls: []
  });
  var placemarkAddress = new ymaps.Placemark(pointAddress, {}, {
    iconLayout: 'default#image'
  });
  myMap.geoObjects.add(placemarkAddress);
  function onZonesLoad(json) {
    console.log(json);
    var deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
  }
  $.ajax({
    url: './assets/json/data.json',
    dataType: 'json',
    success: onZonesLoad
  });
}
;

// ----------------------------------------------------------------------------------------------------------------
// Добавление меток для всех ЗОН
var marks = [{
  coordinates: [55.890130, 37.688847],
  iconContent: 1,
  preset: 'islands#redStretchyIcon',
  balloonContentHeader: "ЗОНА 1",
  balloonContentBody: "Минимальная сумма заказа 1000р.",
  balloonContentFooter: "Стоимость доставки: заказ до 2500р. стоимость доставки - 150р заказ от 2500р доставка БЕСПЛАТНО!"
}, {
  coordinates: [55.872136, 37.635663],
  iconContent: 2,
  preset: 'islands#blueStretchyIcon',
  balloonContentHeader: "ЗОНА 2",
  balloonContentBody: "Минимальная сумма заказа 1500р.",
  balloonContentFooter: "Стоимость доставки: заказ до 3000р. стоимость доставки - 300р заказ от 3000р доставка БЕСПЛАТНО!"
}, {
  coordinates: [55.926948, 37.675029],
  iconContent: 3,
  preset: 'islands#greenStretchyIcon',
  balloonContentHeader: "ЗОНА 3",
  balloonContentBody: "Минимальная сумма заказа 2000р.",
  balloonContentFooter: "Стоимость доставки: заказ до 4000р - 500р. заказ от 4000р доставка БЕСПЛАТНО!"
}];
ymaps.ready(init);
function init() {
  var center = [55.884216, 37.689635];
  var myMap = new ymaps.Map('map-delivery', {
      center: center,
      zoom: 10,
      controls: ['searchControl']
      //controls: [],
    }),
    deliveryPoint = new ymaps.GeoObject({
      geometry: {
        type: 'Point'
      },
      properties: {
        iconCaption: 'Адрес'
      }
    }, {
      preset: 'islands#blackDotIconWithCaption',
      draggable: true,
      iconCaptionMaxWidth: '215'
    });
  var searchControl = myMap.controls.get('searchControl');
  searchControl.options.set({
    noPlacemark: true,
    placeholderContent: 'Введите адрес доставки'
  });
  myMap.geoObjects.add(deliveryPoint);

  // Добавление подсказок к строке поиска #suggest (город, улица, дом)
  var deliveryForm = document.getElementById("delivery");
  deliveryForm.addEventListener("submit", function (evt) {
    return evt.preventDefault();
  });
  var suggestView = new ymaps.SuggestView('suggest');

  // ----------!

  marks.forEach(function (mark) {
    var myPlacemark = new ymaps.Placemark(mark.coordinates, {
      iconContent: mark.iconContent,
      balloonContentHeader: mark.balloonContentHeader,
      balloonContentBody: mark.balloonContentBody,
      balloonContentFooter: mark.balloonContentFooter
    }, {
      preset: mark.preset
    });
    myMap.geoObjects.add(myPlacemark);
  });

  // Получение результата адреса из строки поиска
  suggestView.events.add('select', function (evt) {
    var searchRequest = evt.get('item').value;
    var myGeocoder = ymaps.geocode(
    // Строка с адресом, который нужно геокодировать
    searchRequest, {
      /* Опции поиска:
         - область поиска */
      boundedBy: myMap.getBounds(),
      // - искать только в этой области
      strictBounds: true,
      // - требуемое количество результатов
      results: 1
    });

    /* После того, как поиск вернул результат, вызывается
       callback-функция */
    myGeocoder.then(function (res) {
      /* Размещение полученной коллекции
         геообъектов на карте */
      myMap.geoObjects.add(res.geoObjects);
    });
  });

  // ----------!

  function onZonesLoad(json) {
    // Добавляем зоны на карту.
    var deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
    // Задаём цвет и контент балунов полигонов.
    deliveryZones.each(function (obj) {
      obj.options.set({
        fillColor: obj.properties.get('fill'),
        fillOpacity: obj.properties.get('fill-opacity'),
        strokeColor: obj.properties.get('stroke'),
        strokeWidth: obj.properties.get('stroke-width'),
        strokeOpacity: obj.properties.get('stroke-opacity')
      });
      obj.properties.set('balloonContent', obj.properties.get('description'));
    });

    // Проверим попадание результата поиска в одну из зон доставки.
    searchControl.events.add('resultshow', function (e) {
      highlightResult(searchControl.getResultsArray()[e.get('index')]);
    });

    // Проверим попадание метки геолокации в одну из зон доставки.
    myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
      highlightResult(e.get('geoObjects').get(0));
    });

    // При перемещении метки сбрасываем подпись, содержимое балуна и перекрашиваем метку.
    deliveryPoint.events.add('dragstart', function () {
      deliveryPoint.properties.set({
        iconCaption: '',
        balloonContent: ''
      });
      deliveryPoint.options.set('iconColor', 'black');
    });

    // По окончании перемещения метки вызываем функцию выделения зоны доставки.
    deliveryPoint.events.add('dragend', function () {
      highlightResult(deliveryPoint);
    });
    function highlightResult(obj) {
      // Сохраняем координаты переданного объекта.
      var coords = obj.geometry.getCoordinates(),
        // Находим полигон, в который входят переданные координаты.
        polygon = deliveryZones.searchContaining(coords).get(0);
      if (polygon) {
        // Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
        deliveryZones.setOptions('fillOpacity', 0.4);
        polygon.options.set('fillOpacity', 0.8);
        // Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
        deliveryPoint.geometry.setCoordinates(coords);
        deliveryPoint.options.set('iconColor', polygon.properties.get('fill'));
        // Задаем подпись для метки.
        if (typeof obj.getThoroughfare === 'function') {
          setData(obj);
        } else {
          // Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
          // закомментируйте код ниже.
          ymaps.geocode(coords, {
            results: 1
          }).then(function (res) {
            var obj = res.geoObjects.get(0);
            setData(obj);
          });
        }
      } else {
        // Если переданные координаты не попадают в полигон, то задаём стандартную прозрачность полигонов.
        deliveryZones.setOptions('fillOpacity', 0.4);
        // Перемещаем метку по переданным координатам.
        deliveryPoint.geometry.setCoordinates(coords);
        // Задаём контент балуна и метки.
        deliveryPoint.properties.set({
          iconCaption: 'Сюда не доставляем',
          balloonContent: 'Cвяжитесь с оператором',
          balloonContentHeader: ''
        });
        // Перекрашиваем метку в чёрный цвет.
        deliveryPoint.options.set('iconColor', 'black');
      }
      function setData(obj) {
        var address = [obj.getThoroughfare(), obj.getPremiseNumber(), obj.getPremise()].join(' ');
        if (address.trim() === '') {
          address = obj.getAddressLine();
        }
        var price = polygon.properties.get('description');
        price = price.match(/<strong>(.+)<\/strong>/)[1];
        deliveryPoint.properties.set({
          iconCaption: address,
          balloonContent: address,
          balloonContentHeader: price
        });
      }
      ;
    }
    ;
  }
  ;
  $.ajax({
    url: './assets/json/data.json',
    dataType: 'json',
    success: onZonesLoad
  });
}
"use strict";

function mobileFooterNav() {
  var footer = document.querySelector("footer.footer");
  if (!footer) return;
  var footerNavs = footer.querySelectorAll(".footer-nav");
  footerNavs.forEach(function (footerNav) {
    var footerTitle = footerNav.querySelector(".footer__title");
    footerTitle.addEventListener("click", function () {
      footerTitle.classList.toggle("js-mobile-nav-open");
    });
  });
}
mobileFooterNav();
"use strict";