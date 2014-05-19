'use strict';

// single file using Openlayers for presenting a map of cologne and the candidates
// for communal election 2014. each party can be toggled on or off.

angular.module('candidatesCologneElectionApp')
  .controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {

    var element = document.getElementById('map');
    element.style.height = '' + (window.innerHeight * 0.8) + 'px';

    var map = new OpenLayers.Map('map');
    map.addLayer(new OpenLayers.Layer.OSM());

    var fromProjection = new OpenLayers.Projection('EPSG:4326');
    var toProjection   = new OpenLayers.Projection('EPSG:900913'); 

    // this is the center of cologne
    var position       = new OpenLayers.LonLat(6.9599115, 50.9406645).transform(fromProjection, toProjection);

    // 11.5 was the scale found by trial and error
    map.setCenter(position, 11.5);

    var markerLayer = new OpenLayers.Layer.Markers('Markers');

    map.addLayer(markerLayer);

    // TODO: move this to a configuration file
    var colors = {
      'spd': 'ff0000',
      'cdu': '000000',
      'fdp': 'fed530',
      'grne': '7ab857',
      'dielinke': 'dc0000',
      'afd': '009ee0',
      'fwk': '004191',
      'deinefreunde': '00aff3',
      'diepartei': 'b5152b',
      'piraten': 'fa8810',
      'einzelbewerber': 'ffffff',
      'einheit': 'ffae00',
      'big': '061f71',
      'npd': '572d00',
      'prokln': '875d02',
      'ld': 'ca6010'
    };

    $scope.parties = [];

    var parties = {};

    function partyhash(party) {
      var result = party.toLowerCase().replace(/[^a-z]/g,'');

      return result;
    }

    $scope.toggleSelection = function(party) {
      party.selected = !party.selected;

      if (party.selected) {
        for (var index in party.markers) {
          var marker = party.markers[index];
          markerLayer.addMarker(marker);        
        }
      }
      else {
        for (var index in party.markers) {
          var marker = party.markers[index];
          markerLayer.removeMarker(marker);        
        }
      }
    }
    
    $scope.selectionAlpha = function(party) {
      return party.selected ? 1 : 0.5;
    }

    var markers = [];

    //TODO: move party service to a controller
    $http.get('data.json').success(function(candidates) {
      for (var index in candidates) {
        var candidate = candidates[index];
        var key = candidate.partei_kurzname;

        if (!parties[key]) parties[key] = 0;
        parties[key] = parties[key] + 1;

        var partyshort = partyhash(key);

        position = new OpenLayers.LonLat(parseFloat(candidate.GeocodeLng), parseFloat(candidate.GeocodeLat));
        position = position.transform(fromProjection, toProjection);

        var size = new OpenLayers.Size(28, 43);
        var icon = new OpenLayers.Icon('/images/' + partyshort + '.png', size);

        var marker = new OpenLayers.Marker(position, icon);

        markerLayer.addMarker(marker);

        if (!markers[key]) markers[key] = [];
        markers[key].push(marker);
      }

      for (var key in parties) {
        var partyshort = partyhash(key);

        $scope.parties.push({
          'name':key,
          'color':colors[partyshort],
          'count':parties[key],
          'selected':true,
          'markers':markers[key]
        });
      }
    });
  }]);
