(function(THREE, OrbitControls, d3, topojson, satellite) {

    /* =============================================== */
    /* =============== CLOCK ========================= */
    /* =============================================== */
  
    /**
     * Factory function for keeping track of elapsed time and rates.
     */
    function clock() {
      var rate = 60; // 1ms elapsed : 60sec simulated
      var date = d3.now();
      var elapsed = 0;
  
      function clock() {}
    
      clock.date = function(timeInMs) {
        if (!arguments.length) return date + (elapsed * rate);
        date = timeInMs;
        return clock;
      }
    
      clock.elapsed = function(ms) {
        if (!arguments.length) return date - d3.now(); // calculates elapsed
        elapsed = ms;
        return clock;
      }
    
      clock.rate = function(secondsPerMsElapsed) {
        if (!arguments.length) return rate;
        rate = secondsPerMsElapsed;
        return clock;
      }
    
      return clock;
    }
  
    /* ==================================================== */
    /* =============== CONVERSION ========================= */
    /* ==================================================== */
  
    function radiansToDegrees(radians) {
      return radians * 180 / Math.PI;
    }
  
    function satrecToFeature(satrec, date, props) {
      var properties = props || {};
      var positionAndVelocity = satellite.propagate(satrec, date);
      var gmst = satellite.gstime(date);
      var positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      properties.height = positionGd.height;
      return {
        type: 'Feature',
        properties: properties,
        geometry: {
          type: 'Point',
          coordinates: [
            radiansToDegrees(positionGd.longitude),
            radiansToDegrees(positionGd.latitude)
          ]
        }
      };
    }
  
    function satrecToXYZ(satrec, date) {
      var positionAndVelocity = satellite.propagate(satrec, date);
      var gmst = satellite.gstime(date);
      var positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      return [positionGd.longitude, positionGd.latitude, positionGd.height];
    }
  
    /* ==================================================== */
    /* =============== TLE ================================ */
    /* ==================================================== */
  
    /**
     * Factory function for working with TLE.
     */
    function tle() {
      var _properties;
      var _date;
      var _lines = function (arry) {
        return arry.slice(0, 2);
      };
  
      function tle() {}
    
      tle.satrecs = function (tles) {
        return tles.map(function(d) {
          return satellite.twoline2satrec.apply(null, _lines(d));
        });
      }
    
      tle.features = function (tles) {
        var date = _date || d3.now();
    
        return tles.map(function(d) {
          var satrec = satellite.twoline2satrec.apply(null, _lines(d));
          return satrecToFeature(satrec, date, _properties(d));
        });
      }
    
      tle.lines = function (func) {
        if (!arguments.length) return _lines;
        _lines = func;
        return tle;
      }
    
      tle.properties = function (func) {
        if (!arguments.length) return _properties;
        _properties = func;
        return tle;
      }
    
      tle.date = function (ms) {
        if (!arguments.length) return _date;
        _date = ms;
        return tle;
      }
    
      return tle;
    }
  
  
    /* ==================================================== */
    /* =============== PARSE ============================== */
    /* ==================================================== */
  
    /**
     * Parses text file string of tle into groups.
     * @return {string[][]} Like [['tle line 1', 'tle line 2'], ...]
     */
    function parseTle(tleString) {
      // remove last newline so that we can properly split all the lines
      var lines = tleString.replace(/\r?\n$/g, '').split(/\r?\n/);
  
      return lines.reduce(function(acc, cur, index) {
        if (index % 2 === 0) acc.push([]);
        acc[acc.length - 1].push(cur);
        return acc;
      }, []);
    }
  
    /* =============================================== */
    /* =============== THREE MAP ===================== */
    /* =============================================== */
  
    // Approximate date the tle data was aquired from https://www.space-track.org/#recent
    var TLE_DATA_DATE = new Date(2022, 0, 26).getTime();
  
    var width = 960,
      height = 500,
      radius = 228,
      scene = new THREE.Scene,
      camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000),
      renderer = new THREE.WebGLRenderer({alpha: true}),
      controls = new (OrbitControls(THREE))(camera, renderer.domElement),
      dateElement = document.getElementById('date-time'),
      satrecs,
      satellites,
      graticule,
      countries,
      activeClock ;
  
    function init(parsedTles, topology) {
      satrecs = tle()
        .date(TLE_DATA_DATE)
        .satrecs(parsedTles);
  
      activeClock  = clock()
        .rate(1000)
        .date(TLE_DATA_DATE);
  
      camera.position.z = 1000;
      camera.position.x = -200;
      camera.position.y = 500;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      document.getElementById('map').appendChild(renderer.domElement);
  
      sphere = new THREE.Mesh(new THREE.SphereGeometry(radius - 0.5, 128, 128), new THREE.MeshBasicMaterial({color: 0xffffff}));
      scene.add(sphere);
    //   sphere.rotation.x += 10;
    //   sphere.rotation.y +=10;

      graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa}));
      scene.add(graticule);
  
      countries = wireframe(topojson.mesh(topology, topology.objects.land), new THREE.LineBasicMaterial({color: 0xff0000}));
      scene.add(countries);
  
      var satGeometry = new THREE.Geometry();
      var date = new Date(activeClock .date());
      satGeometry.vertices = satrecs.map(function(satrec) {return satelliteVector(satrec, date);});
      satellites = new THREE.Points(satGeometry, new THREE.PointsMaterial( { color: 0x000000, size: 10 } ));
      scene.add(satellites);

        // specify points to create planar trail-head geometry
      var trailHeadGeometry = [];
      trailHeadGeometry.push( 
      new THREE.Vector3( -10.0, 0.0, 0.0 ), 
      new THREE.Vector3( 0.0, 0.0, 0.0 ), 
      new THREE.Vector3( 10.0, 0.0, 0.0 ) 
      );

        // create the trail renderer object
      var trail = new THREE.TrailRenderer( scene, false );

        // create material for the trail renderer
      var trailMaterial = THREE.TrailRenderer.createBaseMaterial();	

        // specify length of trail
      var trailLength = 150;

        // initialize the trail
      trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, satGeometry);

  
      // Rotates 90 degrees. Must convert to radians.
      graticule.rotation.x = countries.rotation.x = satellites.rotation.x = -90 / 180 * Math.PI;
      d3.timer(animate);
    }
  
    function animate(t) {
      var date = new Date(activeClock .elapsed(t).date());
      for (let i = 0; i < satrecs.length; i++) {
        satellites.geometry.vertices[i] = satelliteVector(satrecs[i], date);
      }
      satellites.geometry.verticesNeedUpdate = true;
      sphere.rotation.x = 1;
      dateElement.textContent = date;
      controls.update();
      renderer.render(scene, camera);
    }
  
    // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
    function vertex(point) {
      var lambda = point[0] * Math.PI / 180,
          phi = point[1] * Math.PI / 180,
          cosPhi = Math.cos(phi);
      return new THREE.Vector3(
        radius * cosPhi * Math.cos(lambda),
        radius * cosPhi * Math.sin(lambda),
        radius * Math.sin(phi)
      );
    }
  
    function satelliteVector(satrec, date) {
      var xyz = satrecToXYZ(satrec, date);
      var lambda = xyz[0];
      var phi = xyz[1];
      var cosPhi = Math.cos(phi);
      var r = ((xyz[2] + 6371) / 6371) * 228;
      return new THREE.Vector3(
        r * cosPhi * Math.cos(lambda),
        r * cosPhi * Math.sin(lambda),
        r * Math.sin(phi)
      );
    }
  
    // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
    function wireframe(multilinestring, material) {
      var geometry = new THREE.Geometry;
      multilinestring.coordinates.forEach(function(line) {
        d3.pairs(line.map(vertex), function(a, b) {
          geometry.vertices.push(a, b);
        });
      });
      return new THREE.LineSegments(geometry, material);
    }
  
    // See https://github.com/d3/d3-geo/issues/95
    function graticule10() {
      var epsilon = 1e-6,
          x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
          X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
          x = graticuleX(y0, y1, 2.5), y = graticuleY(x0, x1, 2.5),
          X = graticuleX(Y0, Y1, 2.5), Y = graticuleY(X0, X1, 2.5);
  
      function graticuleX(y0, y1, dy) {
        var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
        return function(x) { return y.map(function(y) { return [x, y]; }); };
      }
  
      function graticuleY(x0, x1, dx) {
        var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
        return function(y) { return x.map(function(x) { return [x, y]; }); };
      }
  
      return {
        type: 'MultiLineString',
        coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
            .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
            .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
            .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
      };
    }
  
    Promise.all([
      d3.text('tles.txt'),
      d3.json('https://unpkg.com/world-atlas@1/world/110m.json')
    ]).then(function(results) {
      init(parseTle(results[0]), results[1]);
    });
  
  }(window.THREE, window.OrbitControls, window.d3, window.topojson, window.satellite))