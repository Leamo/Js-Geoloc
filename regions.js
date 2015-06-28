/* Déclaration des variables */
var geocoder;

function toggle(obj) {
	var el = document.getElementById(obj);
	if ( el.style.display != 'none' ) {
		el.style.display = 'none';
	}
	else {
		el.style.display = '';
	}
}

toggle('obtinfo');
toggle('obtconfirm');
toggle('obterror');
toggle('obtsuccess');

function displayPosition(position) {
	toggle('obtinfo');
	toggle('obtconfirm');
	var latit = position.coords.latitude;
	var longit = position.coords.longitude;
	var infopos = "Position déterminée :<br/>";
	infopos += "Latitude : "+ latit +"<br/>";
	infopos += "Longitude : "+ longit +"<br/>";
	infopos += "<br/>";
	var dept = getDepartement(latit,longit);
	document.getElementById("position").innerHTML = infopos;
}

function displayPositionError(error){
	toggle('obtinfo');
	toggle('obterror');
	var info = "Erreur lors de la géolocalisation : ";
    switch(error.code) {
    case error.TIMEOUT:
    	info += "Timeout !";
    break;
    case error.PERMISSION_DENIED:
    info += "Vous n’avez pas donné la permission";
    break;
    case error.POSITION_UNAVAILABLE:
    	info += "La position n’a pu être déterminée";
    break;
    case error.UNKNOWN_ERROR:
    	info += "Erreur inconnue";
    break;
	}
	document.getElementById("obterror").innerHTML = info;
	var connect = navigator.onLine ? 'Vous êtes pourtant connecté à internet' : 'Vous êtes actuellement hors ligne. Veuillez vous connecter pour être géolocalisé.';
	document.getElementById("obterror").innerHTML = document.getElementById("obterror").innerHTML + '<br/>' + connect;

	getResults();
}

if(navigator.geolocation) {
	toggle('obtinfo');
	navigator.geolocation.getCurrentPosition(displayPosition, displayPositionError, {maximumAge:5000, timeout:0});
	geocoder = new google.maps.Geocoder();
}

function retrieve(){
	var input = document.getElementById("latlng").value;
	codeLatLng(input);
}


function getDepartement(lat,lng){

	var latlng = new google.maps.LatLng(lat, lng);

	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				var elt = results[0].address_components;
				var deptnom = '';
				var deptcp = '';
				for(i in elt) {
					if(elt[i].types[0] == 'administrative_area_level_2'){
						deptnom = elt[i].long_name;
					}
					if(elt[i].types[0] == 'postal_code'){
						deptcp = elt[i].long_name;
						deptcp = deptcp.substr(0, 2);
					}
				}
				initDept(deptnom,deptcp);
			}
		} else {
			alert("Geocoder failed due to: " + status);
		}
	});
}
function initDept(dept,cp) {
	document.getElementById("region").innerHTML = cp +" - "+ dept;
	var check = cp;
	var checkvalue = localStorage.getItem(check);
	//localStorage.clear();
	if(checkvalue !== null && checkvalue == dept) {
		document.getElementById("obterror").innerHTML = 'Vous connaissez déjà ce département';
		toggle('obterror');
	} else {
		localStorage.setItem(check,dept);
		document.getElementById("obtsuccess").innerHTML = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span> Bravo ! vous avez découvert un nouveau département !';
		toggle('obtsuccess');
	}

	getResults();
}

function getResults(){
	for(var i=0, len=localStorage.length; i<len; i++) {
	    var key = localStorage.key(i);
	    var value = localStorage.getItem(key);
	    var result = '<div class="panel panel-default col-xs-12 col-sm-3"><div class="panel-body">';
	    result += key;
	    result += " - ";
	    result += value;
	    result += '</div></div>';
	    document.getElementById("results").innerHTML = document.getElementById("results").innerHTML + result;
	}
}