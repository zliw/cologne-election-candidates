'use strict';

angular.module('candidatesCologneElectionApp')
  .controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {

    var map = new OpenLayers.Map('map');
    map.addLayer(new OpenLayers.Layer.OSM());

    var fromProjection = new OpenLayers.Projection('EPSG:4326');   // Transform from WGS 1984
    var toProjection   = new OpenLayers.Projection('EPSG:900913'); // to Spherical Mercator Projection
    var position       = new OpenLayers.LonLat(6.9599115, 50.9406645).transform(fromProjection, toProjection);
    map.setCenter(position, 11.25);

    var markers = new OpenLayers.Layer.Markers('Markers');
    
    map.addLayer(markers);
    
    var index;

    var colors = {
      'spd': 'ff0000',
      'cdu': '000000',
      'fdp': 'fed530',
      'grüne': '7ab857',
      'linke': 'dc0000',
      'afd': '009ee0',
      'fwk': '004191',
      'deinefreunde': '00aff3',
      'piraten': '#fa8810'
    }
    
    $scope.parties = [];
    
    var parties = {}
    $http.get('data.json').success(function(candidates) {
      for (index in candidates) {
        var candidate = candidates[index];
        parties[candidate.partei_kurzname] = parties[candidate.partei_kurzname] + 1;

        var partyshort = candidate.partei_kurzname.toLowerCase().replace(/[^a-z]/g,'');

        position = new OpenLayers.LonLat(parseFloat(candidate.GeocodeLng), parseFloat(candidate.GeocodeLat));
        position = position.transform(fromProjection, toProjection);
        
        var icon = new OpenLayers.Icon('/images/' + partyshort + '.png');

        var marker = new OpenLayers.Marker(position, icon);

        markers.addMarker(marker);
      }

      for (var key in parties) {
        var partyshort = key.toLowerCase().replace(/[^a-z]/g,'');
        $scope.parties.push({
          name:key,
          color:colors[partyshort]
        });
      }
    }
  )

  }]);
