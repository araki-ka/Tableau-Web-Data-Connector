(function () {
  var myConnector = tableau.makeConnector();
  myConnector.getSchema = function (schemaCallback) {
    var cols = [
      { id: "line", dataType: tableau.dataTypeEnum.string, alias: "line_name", description:"路線名" },
      { id: "name", dataType: tableau.dataTypeEnum.string, alias: "station_name", description:"駅名" },
      { id: "y", dataType: tableau.dataTypeEnum.float, alias: "latitude", description:"緯度" },
      { id: "x", dataType: tableau.dataTypeEnum.float, alias: "longitude", description:"軽度" },
      { id: "postal", dataType: tableau.dataTypeEnum.string, alias: "postal_code", description:"郵便番号" },
      { id: "prefecture", dataType: tableau.dataTypeEnum.string, alias: "prefecture", description:"都道府県" },
      { id: "prev", dataType: tableau.dataTypeEnum.string, alias: "previous_station_name", description:"前の駅名" },
      { id: "next", dataType: tableau.dataTypeEnum.string, alias: "next_station_name", description:"次の駅名" },
      { id: "order", dataType: tableau.dataTypeEnum.int, alias: "order", description:"駅順(登録順なので正確か不明)" }
    ];

    var tableSchema = {
      id: "station",
      alias: "heartrails data",
      columns: cols
    };

    schemaCallback([tableSchema]);
  };

  myConnector.getData = function (table, doneCallback) {
    // 非同期処理が全て終わるまでcallbackしないようにする
    $.when(
      getLineNameList("東京都").done(function (result) {
        // 東京都の路線名を取得
        var lineNameList = result.response.line;
        for (cnt = 0; cnt < lineNameList.length; cnt++) {
          // 路線毎に駅情報を取得
          getStationData(lineNameList[cnt]).done(function (result) {
            var stationRowData = result.response.station;
            var stationData = [];
            for (row = 0; row < stationRowData.length; row++) {
              stationData.push({
                "line": stationRowData[row].line,
                "name": stationRowData[row].name,
                "y": stationRowData[row].y,
                "x": stationRowData[row].x,
                "postal": stationRowData[row].postal,
                "prefecture": stationRowData[row].prefecture,
                "prev": stationRowData[row].prev,
                "next": stationRowData[row].next,
                "order": row + 1
              });
            }
            table.appendRows(stationData);
          }).fail(function (result) {
            console.log("fail to get station data.");
          });
        }
      }).fail(function (result) {
        console.log("fail to get line data.");
      })
    ).done(function (result) {
      doneCallback();
    }).fail(function (result) {
      console.log("fail to async.");
      doneCallback();
    });
  };

  tableau.registerConnector(myConnector);

  $(document).ready(function () {
    $("#submitButton").click(function () {
      tableau.connectionName = "heartrails data";
      tableau.submit();
    });
  });
})();

// 路線情報取得(都道府県指定)
// http://express.heartrails.com/api.html#line
function getLineNameList(prefecture) {
  const API_LINE_DATA = "http://express.heartrails.com/api/json?method=getLines&prefecture=" + prefecture + "&jsonp=?";
  return $.getJSON(API_LINE_DATA)
}

// 駅情報取得
// http://express.heartrails.com/api.html#station
function getStationData(lineName) {
  const API_STATION_DATA = "http://express.heartrails.com/api/json?method=getStations&line=" + lineName + "&jsonp=?"
  return $.getJSON(API_STATION_DATA)
}
