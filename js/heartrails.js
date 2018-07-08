(function () {
  var myConnector = tableau.makeConnector();
  myConnector.getSchema = function (schemaCallback) {
    var cols = [
      { id: "name", dataType: tableau.dataTypeEnum.string },
      { id: "prefecture", dataType: tableau.dataTypeEnum.string },
      { id: "line", dataType: tableau.dataTypeEnum.string },
      { id: "x", dataType: tableau.dataTypeEnum.float },
      { id: "y", dataType: tableau.dataTypeEnum.float },
      { id: "postal", dataType: tableau.dataTypeEnum.string },
      { id: "prev", dataType: tableau.dataTypeEnum.string },
      { id: "next", dataType: tableau.dataTypeEnum.string }
    ];

    var tableSchema = {
      id: "station",
      alias: "heartrails data",
      columns: cols
    };

    schemaCallback([tableSchema]);
  };

  myConnector.getData = function (table, doneCallback) {
    var line = [];
    var lineUri = "http://express.heartrails.com/api/json?method=getLines&prefecture=東京都&jsonp=?";
    $.getJSON(lineUri).done(function (lineResponse) {
      var lineList = lineResponse.response.line;
      lineList.forEach(function (value) {
        line.push(value);
      });
      line.forEach(function (prefecture) {
        var stationUri = "http://express.heartrails.com/api/json?method=getStations&line=" + prefecture + "&jsonp=?"
        $.getJSON(stationUri).done(function (stationResponse) {
          var stationList = stationResponse.response.station;
          var tableData = [];
          stationList.forEach(function (value) {
            tableData.push({
              "name": value.name,
              "prefecture": value.prefecture,
              "line": value.line,
              "x": value.x,
              "y": value.y,
              "postal": value.postal,
              "prev": value.prev,
              "next": value.next
            });
          });
          table.appendRows(JSON.parse(JSON.stringify(tableData)));
        });
      });
    });
    doneCallback();
  };

  tableau.registerConnector(myConnector);

  $(document).ready(function () {
    $("#submitButton").click(function () {
      tableau.connectionName = "heartrails data";
      tableau.submit();
    });
  });
})();