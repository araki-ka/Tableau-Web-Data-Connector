(function () {
  var myConnector = tableau.makeConnector();
  myConnector.getSchema = function (schemaCallback) {
    var cols = [
      { id: "name", alias: "station_name", dataType: tableau.dataTypeEnum.string },
      { id: "prefecture", alias: "prefecture", dataType: tableau.dataTypeEnum.string },
      { id: "line", alias: "line_name", dataType: tableau.dataTypeEnum.string },
      { id: "x", alias: "longitude", dataType: tableau.dataTypeEnum.float },
      { id: "y", alias: "latitude", dataType: tableau.dataTypeEnum.float },
      { id: "postal", alias: "postal_code", dataType: tableau.dataTypeEnum.string },
      { id: "prev", alias: "previous_station_name", dataType: tableau.dataTypeEnum.string },
      { id: "next", alias: "next_station_name", dataType: tableau.dataTypeEnum.string }
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
                "name": stationRowData[row].name,
                "prefecture": stationRowData[row].prefecture,
                "line": stationRowData[row].line,
                "x": stationRowData[row].x,
                "y": stationRowData[row].y,
                "postal": stationRowData[row].postal,
                "prev": stationRowData[row].prev,
                "next": stationRowData[row].next
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
