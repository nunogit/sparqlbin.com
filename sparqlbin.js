var SPARQLBIN_EXECUTEQUERY_PATH = "execute";
var SPARQLBIN_SHAREQUERY_PATH = "share";
var SPARQLBIN_PERMALINK_PATH = "q";

$(document).ready(function(){
	var currentURL = window.location.href;
	
	if(currentURL.indexOf("#") != -1){ // we have a paste entry
		$.getJSON(SPARQLBIN_PERMALINK_PATH + "/" +  currentURL.substring(currentURL.indexOf("#") + 1), function(data) {
			$("#endpoint").val(data.endpoint);
			$("#query").val(data.querystr);
			addMetadata(data.timestamp, currentURL);
		});
	}
	
	$("#execute").click(function(event){
		executeQuery();
	});
	
	$("#share").click(function(event){
		shareQuery();
	});
});

// shares a SPARQL query using the SPARQLBin web service
function shareQuery() {
	var data =  { endpoint : "", query : "" };
	
	// some input validation
	if($("#endpoint").val().substring(0, "http://".length) == "http://" && $("#query").val() != "") {
		data.endpoint = escape($("#endpoint").val());
		data.query = $("#query").val();
	}
	else {
		alert("Hey, you haven't provided valid input. Check your query and/or endpoint please and try again.");
		return;
	}
	
	$.ajax({
		type: "POST",
		url: SPARQLBIN_SHAREQUERY_PATH,
		data: data,
		dataType : "json",
		success: function(d){
			if(d) {
				// $("#permalink").html("You can now share your query via this <a href='" + "#" + d.entryid + "'>permalink</a>.");
				// $("#results").slideDown('200');
				window.location = "#" + d.entryid;
				addMetadata("Now", "#" + d.entryid);
			}
		},	
		error:  function(msg){
			$("#out").html("<p>There was a problem sharing the query:</p><code>" + msg.responseText + "</cdoe>");
			$("#results").slideDown('200');
		} 
	});
}

// executes a SPARQL query using the SPARQLBin web service
function executeQuery() {
	var data =  { endpoint : "", query : "" };
	
	// some input validation
	if($("#endpoint").val().substring(0, "http://".length) == "http://" && $("#query").val() != "") {
		data.endpoint = escape($("#endpoint").val());
		data.query = $("#query").val();
	}
	else {
		alert("Hey, you haven't provided valid input. Check your query and/or endpoint please and try again.");
		return;
	}
	
	$.ajax({
		type: "POST",
		url: SPARQLBIN_EXECUTEQUERY_PATH,
		data: data,
		dataType : "json",
		success: function(d){
			if(d) {
				renderResults(d);
				$("#results").slideDown('200');
			}
		},	
		error:  function(msg){
			$("#out").html("<p>There was a problem executing the query:</p><code>" + msg.responseText + "</cdoe>");
			$("#results").slideDown('200');
		} 
	});
}

// renders the results
function renderResults(data){
	var vars =  Array();
	var buffer = "";
	$("#out").html("");
	
	// we had a SELECT query - render results as table
	if(data.head.vars) {
		buffer = "<table><tr>";
		for(rvar in data.head.vars) { // table head with vars
			buffer += "<th>" + data.head.vars[rvar] + "</th>";
		}
		buffer += "</tr>";
		for(entry in data.results.bindings) { // iterate over rows
			if(entry%2) buffer += "<tr>";
			else buffer += "<tr class='invrow'>";
			for(rvar in data.head.vars) { // iterate over columns per row
				var col = data.head.vars[rvar];
				buffer += "<td>" + data.results.bindings[entry][col].value + "</td>";
			}
			buffer += "</tr>";
		}
		buffer += "</table>";
	}
	// we had a ASK query - render results as single value
	if(data.boolean) {
		buffer = "<p style='font-size:140%'>" + data.boolean + "</p>";
	}
	
	$("#out").append(buffer);
}

function addMetadata(timestamp, permalink){
	$("#metadata").html("");
	$("#query-container").prepend("<div id='metadata'>Last update: " + timestamp + " | <a href='" + permalink + "'>Permalink</a></div>");
}