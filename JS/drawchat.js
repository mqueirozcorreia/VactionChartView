// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart', 'timeline']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

var teamsLoaded = false;
function fillTeams() {
    var query = new google.visualization.Query("https://spreadsheets.google.com/tq?key=" + sheetId + "&sheet=times");
    query.setQuery('SELECT B WHERE B IS NOT NULL ORDER BY B');
    query.send(handleTeamsQueryResponse);
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function validTeamName(value, index, self) { 
    return value.indexOf(",") === -1 && onlyUnique(value, index, self);
}

function handleTeamsQueryResponse(response) {
    var dataTable = response.getDataTable();

    if (!dataTable) {
        alert("Fonte de dados inválida");
    }
    else {

        var timeArray = dataTable.og.map(function(item) {
            return item.c[0].v;
            });

        timeArray = timeArray.filter(validTeamName);
        
        var teamSelect = document.getElementById('teamsSelect');
        //Ignorando linha 1, que é o titulo da tabela no Google Plan
        for (var i=1; i< timeArray.length; i++) {
            var option = document.createElement("option");
            option.value = timeArray[i];
            option.text = timeArray[i];
            teamSelect.add(option);
        }
        teamsLoaded = true;
    }
}

function drawChart() {
    if (!teamsLoaded) {
        fillTeams();
    }

    var teamSelect = document.getElementById("teamsSelect");

    var teamFilter = '';
    if (teamSelect.selectedIndex != -1) {
        var selectedTeam = teamSelect.options[teamSelect.selectedIndex].value;
        if (selectedTeam != "") {
            teamFilter = "AND B CONTAINS ('" + selectedTeam + "') ";
        }
    }

    var query = new google.visualization.Query("https://spreadsheets.google.com/tq?key=" + sheetId + "&sheet=Ausencias");
    query.setQuery('SELECT A, F, C, D WHERE C > now() ' + teamFilter + 'ORDER BY A');
    query.send(handleFeriasQueryResponse);
}

function handleFeriasQueryResponse(response) {
    var dataTable = response.getDataTable();

    if (!dataTable) {
        alert("Fonte de dados para férias inválida");
    }
    else {
        var options = {
            hAxis: {
                format: 'dd/MM/yy',
                gridlines: {count: 15}
            },
    
            };
    
        var container = document.getElementById('columnchart');
        var chart = new google.visualization.Timeline(container);
        chart.draw(dataTable, options);
    }
}