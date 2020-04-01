"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2019  */

/*                                                                                   MIT Licence  */

/* www.movable-type.co.uk/scripts/latlong.html                                                    */

/* www.movable-type.co.uk/scripts/geodesy-library.html#latlon-spherical                           */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
//import Dms from './dms.js';
var PI = Math.PI;
/**
 * Library of geodesy functions for operations on a spherical earth model.
 *
 * Includes distances, bearings, destinations, etc, for both great circle paths and rhumb lines,
 * and other related functions.
 *
 * All calculations are done using simple spherical trigonometric formulae.
 *
 * @module latlon-spherical
 */
// note greek letters (e.g. PHI, LAMBDA, THETA) are used for angles in radians to distinguish from angles in
// degrees (e.g. lat, lon, brng)

/* LatLonSpherical - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Latitude/longitude points on a spherical model earth, and methods for calculating distances,
 * bearings, destinations, etc on (orthodromic) great-circle paths and (loxodromic) rhumb lines.
 */

var LatLonSpherical = /*#__PURE__*/function () {
  /**
   * Creates a latitude/longitude point on the earth’s surface, using a spherical model earth.
   *
   * @param  {number} lat - Latitude (in degrees).
   * @param  {number} lon - Longitude (in degrees).
   * @throws {TypeError} Non-numeric lat/lon.
   *
   * @example
   *   import LatLon from '/js/geodesy/latlon-spherical.js';
   *   const p = new LatLon(52.205, 0.119);
   */
  function LatLonSpherical(lat, lon) {
    _classCallCheck(this, LatLonSpherical);

    if (isNaN(lat)) throw new TypeError("Invalid lat \u2018".concat(lat, "\u2019"));
    if (isNaN(lon)) throw new TypeError("Invalid lon \u2018".concat(lon, "\u2019"));
    this._lat = Dms.wrap90(lat);
    this._lon = Dms.wrap180(lon);
  }
  /**
   * Latitude in degrees north from equator (including aliases lat, latitude): can be set as
   * numeric or hexagesimal (deg-min-sec); returned as numeric.
   */


  _createClass(LatLonSpherical, [{
    key: "distanceTo",

    /**
     * Returns the distance along the surface of the earth from ‘this’ point to destination point.
     *
     * Uses haversine formula: a = sin²(DELTAPHI/2) + cosPHI1·cosPHI2 · sin²(DELTA_LAMBDA/2); d = 2 · atan2(√a, √(a-1)).
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} [radius=6371e3] - Radius of earth (defaults to mean radius in metres).
     * @returns {number} Distance between this point and destination point, in same units as radius.
     * @throws  {TypeError} Radius is not a number.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const d = p1.distanceTo(p2);       // 404.3×10³ m
     *   const m = p1.distanceTo(p2, 3959); // 251.2 miles
     */
    value: function distanceTo(point) {
      var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6371e3;
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms

      if (isNaN(radius)) throw new TypeError('Radius is not a number'); // a = sin²(DELTAPHI/2) + cos(PHI1)⋅cos(PHI2)⋅sin²(DELTA_LAMBDA/2)
      // DELTA = 2·atan2(√(a), √(1−a))
      // see mathforum.org/library/drmath/view/51879.html for derivation

      var R = radius;
      var PHI1 = this.lat.toRadians(),
          LAMBDA1 = this.lon.toRadians();
      var PHI2 = point.lat.toRadians(),
          LAMBDA2 = point.lon.toRadians();
      var DELTAPHI = PHI2 - PHI1;
      var DELTA_LAMBDA = LAMBDA2 - LAMBDA1;
      var a = Math.sin(DELTAPHI / 2) * Math.sin(DELTAPHI / 2) + Math.cos(PHI1) * Math.cos(PHI2) * Math.sin(DELTA_LAMBDA / 2) * Math.sin(DELTA_LAMBDA / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }
    /**
     * Returns the initial bearing from ‘this’ point to destination point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Initial bearing in degrees from north (0°..360°).
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const b1 = p1.initialBearingTo(p2); // 156.2°
     */

  }, {
    key: "initialBearingTo",
    value: function initialBearingTo(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms
      // tanTHETA = sinDELTA_LAMBDA⋅cosPHI2 / cosPHI1⋅sinPHI2 − sinPHI1⋅cosPHI2⋅cosDELTA_LAMBDA
      // see mathforum.org/library/drmath/view/55417.html for derivation

      var PHI1 = this.lat.toRadians(),
          PHI2 = point.lat.toRadians();
      var DELTA_LAMBDA = (point.lon - this.lon).toRadians();
      var x = Math.cos(PHI1) * Math.sin(PHI2) - Math.sin(PHI1) * Math.cos(PHI2) * Math.cos(DELTA_LAMBDA);
      var y = Math.sin(DELTA_LAMBDA) * Math.cos(PHI2);
      var THETA = Math.atan2(y, x);
      var bearing = THETA.toDegrees();
      return Dms.wrap360(bearing);
    }
    /**
     * Returns final bearing arriving at destination point from ‘this’ point; the final bearing will
     * differ from the initial bearing by varying degrees according to distance and latitude.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {number} Final bearing in degrees from north (0°..360°).
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const b2 = p1.finalBearingTo(p2); // 157.9°
     */

  }, {
    key: "finalBearingTo",
    value: function finalBearingTo(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms
      // get initial bearing from destination point to this point & reverse it by adding 180°

      var bearing = point.initialBearingTo(this) + 180;
      return Dms.wrap360(bearing);
    }
    /**
     * Returns the midpoint between ‘this’ point and destination point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @returns {LatLon} Midpoint between this point and destination point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
     */

  }, {
    key: "midpointTo",
    value: function midpointTo(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms
      // PHIm = atan2( sinPHI1 + sinPHI2, √( (cosPHI1 + cosPHI2⋅cosDELTA_LAMBDA) ⋅ (cosPHI1 + cosPHI2⋅cosDELTA_LAMBDA) ) + cos²PHI2⋅sin²DELTA_LAMBDA )
      // LAMBDAm = LAMBDA1 + atan2(cosPHI2⋅sinDELTA_LAMBDA, cosPHI1 + cosPHI2⋅cosDELTA_LAMBDA)
      // see mathforum.org/library/drmath/view/51822.html for derivation

      var PHI1 = this.lat.toRadians(),
          LAMBDA1 = this.lon.toRadians();
      var PHI2 = point.lat.toRadians();
      var DELTA_LAMBDA = (point.lon - this.lon).toRadians();
      var Bx = Math.cos(PHI2) * Math.cos(DELTA_LAMBDA);
      var By = Math.cos(PHI2) * Math.sin(DELTA_LAMBDA);
      var x = Math.sqrt((Math.cos(PHI1) + Bx) * (Math.cos(PHI1) + Bx) + By * By);
      var y = Math.sin(PHI1) + Math.sin(PHI2);
      var PHI3 = Math.atan2(y, x);
      var LAMBDA3 = LAMBDA1 + Math.atan2(By, Math.cos(PHI1) + Bx);
      var lat = PHI3.toDegrees();
      var lon = LAMBDA3.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
    /**
     * Returns the point at given fraction between ‘this’ point and given point.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
     * @returns {LatLon} Intermediate point between this point and destination point.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(48.857, 2.351);
     *   const pInt = p1.intermediatePointTo(p2, 0.25); // 51.3721°N, 000.7073°E
     */

  }, {
    key: "intermediatePointTo",
    value: function intermediatePointTo(point, fraction) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms

      var PHI1 = this.lat.toRadians(),
          LAMBDA1 = this.lon.toRadians();
      var PHI2 = point.lat.toRadians(),
          LAMBDA2 = point.lon.toRadians(); // distance between points

      var DELTAPHI = PHI2 - PHI1;
      var DELTA_LAMBDA = LAMBDA2 - LAMBDA1;
      var a = Math.sin(DELTAPHI / 2) * Math.sin(DELTAPHI / 2) + Math.cos(PHI1) * Math.cos(PHI2) * Math.sin(DELTA_LAMBDA / 2) * Math.sin(DELTA_LAMBDA / 2);
      var DELTA = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var A = Math.sin((1 - fraction) * DELTA) / Math.sin(DELTA);
      var B = Math.sin(fraction * DELTA) / Math.sin(DELTA);
      var x = A * Math.cos(PHI1) * Math.cos(LAMBDA1) + B * Math.cos(PHI2) * Math.cos(LAMBDA2);
      var y = A * Math.cos(PHI1) * Math.sin(LAMBDA1) + B * Math.cos(PHI2) * Math.sin(LAMBDA2);
      var z = A * Math.sin(PHI1) + B * Math.sin(PHI2);
      var PHI3 = Math.atan2(z, Math.sqrt(x * x + y * y));
      var LAMBDA3 = Math.atan2(y, x);
      var lat = PHI3.toDegrees();
      var lon = LAMBDA3.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
    /**
     * Returns the destination point from ‘this’ point having travelled the given distance on the
     * given initial bearing (bearing normally varies around path followed).
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Initial bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Destination point.
     *
     * @example
     *   const p1 = new LatLon(51.47788, -0.00147);
     *   const p2 = p1.destinationPoint(7794, 300.7); // 51.5136°N, 000.0983°W
     */

  }, {
    key: "destinationPoint",
    value: function destinationPoint(distance, bearing) {
      var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6371e3;
      // sinPHI2 = sinPHI1⋅cosDELTA + cosPHI1⋅sinDELTA⋅cosTHETA
      // tanDELTA_LAMBDA = sinTHETA⋅sinDELTA⋅cosPHI1 / cosDELTA−sinPHI1⋅sinPHI2
      // see mathforum.org/library/drmath/view/52049.html for derivation
      var DELTA = distance / radius; // angular distance in radians

      var THETA = Number(bearing).toRadians();
      var PHI1 = this.lat.toRadians(),
          LAMBDA1 = this.lon.toRadians();
      var sinPHI2 = Math.sin(PHI1) * Math.cos(DELTA) + Math.cos(PHI1) * Math.sin(DELTA) * Math.cos(THETA);
      var PHI2 = Math.asin(sinPHI2);
      var y = Math.sin(THETA) * Math.sin(DELTA) * Math.cos(PHI1);
      var x = Math.cos(DELTA) - Math.sin(PHI1) * sinPHI2;
      var LAMBDA2 = LAMBDA1 + Math.atan2(y, x);
      var lat = PHI2.toDegrees();
      var lon = LAMBDA2.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
    /**
     * Returns the point of intersection of two paths defined by point and bearing.
     *
     * @param   {LatLon}      p1 - First point.
     * @param   {number}      brng1 - Initial bearing from first point.
     * @param   {LatLon}      p2 - Second point.
     * @param   {number}      brng2 - Initial bearing from second point.
     * @returns {LatLon|null} Destination point (null if no unique intersection defined).
     *
     * @example
     *   const p1 = new LatLon(51.8853, 0.2545), brng1 = 108.547;
     *   const p2 = new LatLon(49.0034, 2.5735), brng2 =  32.435;
     *   const pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9078°N, 004.5084°E
     */

  }, {
    key: "crossTrackDistanceTo",

    /**
     * Returns (signed) distance from ‘this’ point to great circle defined by start-point and
     * end-point.
     *
     * @param   {LatLon} pathStart - Start point of great circle path.
     * @param   {LatLon} pathEnd - End point of great circle path.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance to great circle (-ve if to left, +ve if to right of path).
     *
     * @example
     *   const pCurrent = new LatLon(53.2611, -0.7972);
     *   const p1 = new LatLon(53.3206, -1.7297);
     *   const p2 = new LatLon(53.1887, 0.1334);
     *   const d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
     */
    value: function crossTrackDistanceTo(pathStart, pathEnd) {
      var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6371e3;
      if (!(pathStart instanceof LatLonSpherical)) pathStart = LatLonSpherical.parse(pathStart); // allow literal forms

      if (!(pathEnd instanceof LatLonSpherical)) pathEnd = LatLonSpherical.parse(pathEnd); // allow literal forms

      var R = radius;
      var DELTA13 = pathStart.distanceTo(this, R) / R;
      var THETA13 = pathStart.initialBearingTo(this).toRadians();
      var THETA12 = pathStart.initialBearingTo(pathEnd).toRadians();
      var DELTAxt = Math.asin(Math.sin(DELTA13) * Math.sin(THETA13 - THETA12));
      return DELTAxt * R;
    }
    /**
     * Returns how far ‘this’ point is along a path from from start-point, heading towards end-point.
     * That is, if a perpendicular is drawn from ‘this’ point to the (great circle) path, the
     * along-track distance is the distance from the start point to where the perpendicular crosses
     * the path.
     *
     * @param   {LatLon} pathStart - Start point of great circle path.
     * @param   {LatLon} pathEnd - End point of great circle path.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance along great circle to point nearest ‘this’ point.
     *
     * @example
     *   const pCurrent = new LatLon(53.2611, -0.7972);
     *   const p1 = new LatLon(53.3206, -1.7297);
     *   const p2 = new LatLon(53.1887,  0.1334);
     *   const d = pCurrent.alongTrackDistanceTo(p1, p2);  // 62.331 km
     */

  }, {
    key: "alongTrackDistanceTo",
    value: function alongTrackDistanceTo(pathStart, pathEnd) {
      var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6371e3;
      if (!(pathStart instanceof LatLonSpherical)) pathStart = LatLonSpherical.parse(pathStart); // allow literal forms

      if (!(pathEnd instanceof LatLonSpherical)) pathEnd = LatLonSpherical.parse(pathEnd); // allow literal forms

      var R = radius;
      var DELTA13 = pathStart.distanceTo(this, R) / R;
      var THETA13 = pathStart.initialBearingTo(this).toRadians();
      var THETA12 = pathStart.initialBearingTo(pathEnd).toRadians();
      var DELTAxt = Math.asin(Math.sin(DELTA13) * Math.sin(THETA13 - THETA12));
      var DELTAat = Math.acos(Math.cos(DELTA13) / Math.abs(Math.cos(DELTAxt)));
      return DELTAat * Math.sign(Math.cos(THETA12 - THETA13)) * R;
    }
    /**
     * Returns maximum latitude reached when travelling on a great circle on given bearing from
     * ‘this’ point (‘Clairaut’s formula’). Negate the result for the minimum latitude (in the
     * southern hemisphere).
     *
     * The maximum latitude is independent of longitude; it will be the same for all points on a
     * given latitude.
     *
     * @param   {number} bearing - Initial bearing.
     * @returns {number} Maximum latitude reached.
     */

  }, {
    key: "maxLatitude",
    value: function maxLatitude(bearing) {
      var THETA = Number(bearing).toRadians();
      var PHI = this.lat.toRadians();
      var PHIMax = Math.acos(Math.abs(Math.sin(THETA) * Math.cos(PHI)));
      return PHIMax.toDegrees();
    }
    /**
     * Returns the pair of meridians at which a great circle defined by two points crosses the given
     * latitude. If the great circle doesn't reach the given latitude, null is returned.
     *
     * @param   {LatLon}      point1 - First point defining great circle.
     * @param   {LatLon}      point2 - Second point defining great circle.
     * @param   {number}      latitude - Latitude crossings are to be determined for.
     * @returns {Object|null} Object containing { lon1, lon2 } or null if given latitude not reached.
     */

  }, {
    key: "rhumbDistanceTo",

    /* Rhumb - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    /**
     * Returns the distance travelling from ‘this’ point to destination point along a rhumb line.
     *
     * @param   {LatLon} point - Latitude/longitude of destination point.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number} Distance in km between this point and destination point (same units as radius).
     *
     * @example
     *   const p1 = new LatLon(51.127, 1.338);
     *   const p2 = new LatLon(50.964, 1.853);
     *   const d = p1.distanceTo(p2); //  40.31 km
     */
    value: function rhumbDistanceTo(point) {
      var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6371e3;
      // see www.edwilliams.org/avform.htm#Rhumb
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms

      var R = radius;
      var PHI1 = this.lat.toRadians(),
          PHI2 = point.lat.toRadians();
      var DELTAPHI = PHI2 - PHI1;
      var DELTA_LAMBDA = Math.abs(point.lon - this.lon).toRadians(); // if dLon over 180° take shorter rhumb line across the anti-meridian:

      if (Math.abs(DELTA_LAMBDA) > PI) DELTA_LAMBDA = DELTA_LAMBDA > 0 ? -(2 * PI - DELTA_LAMBDA) : 2 * PI + DELTA_LAMBDA; // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
      // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it

      var DELTAPSI = Math.log(Math.tan(PHI2 / 2 + PI / 4) / Math.tan(PHI1 / 2 + PI / 4));
      var q = Math.abs(DELTAPSI) > 10e-12 ? DELTAPHI / DELTAPSI : Math.cos(PHI1); // distance is pythagoras on 'stretched' Mercator projection

      var DELTA = Math.sqrt(DELTAPHI * DELTAPHI + q * q * DELTA_LAMBDA * DELTA_LAMBDA); // angular distance in radians

      var d = DELTA * R;
      return d;
    }
    /**
     * Returns the bearing from ‘this’ point to destination point along a rhumb line.
     *
     * @param   {LatLon}    point - Latitude/longitude of destination point.
     * @returns {number}    Bearing in degrees from north.
     * @throws  {TypeError} Invalid coordinate.
     *
     * @example
     *   const p1 = new LatLon(51.127, 1.338);
     *   const p2 = new LatLon(50.964, 1.853);
     *   const d = p1.rhumbBearingTo(p2); // 116.7°
     */

  }, {
    key: "rhumbBearingTo",
    value: function rhumbBearingTo(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms

      var PHI1 = this.lat.toRadians(),
          PHI2 = point.lat.toRadians();
      var DELTA_LAMBDA = (point.lon - this.lon).toRadians(); // if dLon over 180° take shorter rhumb line across the anti-meridian:

      if (Math.abs(DELTA_LAMBDA) > PI) DELTA_LAMBDA = DELTA_LAMBDA > 0 ? -(2 * PI - DELTA_LAMBDA) : 2 * PI + DELTA_LAMBDA;
      var DELTAPSI = Math.log(Math.tan(PHI2 / 2 + PI / 4) / Math.tan(PHI1 / 2 + PI / 4));
      var THETA = Math.atan2(DELTA_LAMBDA, DELTAPSI);
      var bearing = THETA.toDegrees();
      return Dms.wrap360(bearing);
    }
    /**
     * Returns the destination point having travelled along a rhumb line from ‘this’ point the given
     * distance on the given bearing.
     *
     * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
     * @param   {number} bearing - Bearing in degrees from north.
     * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {LatLon} Destination point.
     *
     * @example
     *   const p1 = new LatLon(51.127, 1.338);
     *   const p2 = p1.rhumbDestinationPoint(40300, 116.7); // 50.9642°N, 001.8530°E
     */

  }, {
    key: "rhumbDestinationPoint",
    value: function rhumbDestinationPoint(distance, bearing) {
      var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6371e3;
      var PHI1 = this.lat.toRadians(),
          LAMBDA1 = this.lon.toRadians();
      var THETA = Number(bearing).toRadians();
      var DELTA = distance / radius; // angular distance in radians

      var DELTAPHI = DELTA * Math.cos(THETA);
      var PHI2 = PHI1 + DELTAPHI; // check for some daft bugger going past the pole, normalise latitude if so

      if (Math.abs(PHI2) > PI / 2) PHI2 = PHI2 > 0 ? PI - PHI2 : -PI - PHI2;
      var DELTAPSI = Math.log(Math.tan(PHI2 / 2 + PI / 4) / Math.tan(PHI1 / 2 + PI / 4));
      var q = Math.abs(DELTAPSI) > 10e-12 ? DELTAPHI / DELTAPSI : Math.cos(PHI1); // E-W course becomes ill-conditioned with 0/0

      var DELTA_LAMBDA = DELTA * Math.sin(THETA) / q;
      var LAMBDA2 = LAMBDA1 + DELTA_LAMBDA;
      var lat = PHI2.toDegrees();
      var lon = LAMBDA2.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
    /**
     * Returns the loxodromic midpoint (along a rhumb line) between ‘this’ point and second point.
     *
     * @param   {LatLon} point - Latitude/longitude of second point.
     * @returns {LatLon} Midpoint between this point and second point.
     *
     * @example
     *   const p1 = new LatLon(51.127, 1.338);
     *   const p2 = new LatLon(50.964, 1.853);
     *   const pMid = p1.rhumbMidpointTo(p2); // 51.0455°N, 001.5957°E
     */

  }, {
    key: "rhumbMidpointTo",
    value: function rhumbMidpointTo(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms
      // see mathforum.org/kb/message.jspa?messageID=148837

      var PHI1 = this.lat.toRadians();
      var LAMBDA1 = this.lon.toRadians();
      var PHI2 = point.lat.toRadians(),
          LAMBDA2 = point.lon.toRadians();
      if (Math.abs(LAMBDA2 - LAMBDA1) > PI) LAMBDA1 += 2 * PI; // crossing anti-meridian

      var PHI3 = (PHI1 + PHI2) / 2;
      var f1 = Math.tan(PI / 4 + PHI1 / 2);
      var f2 = Math.tan(PI / 4 + PHI2 / 2);
      var f3 = Math.tan(PI / 4 + PHI3 / 2);
      var LAMBDA3 = ((LAMBDA2 - LAMBDA1) * Math.log(f3) + LAMBDA1 * Math.log(f2) - LAMBDA2 * Math.log(f1)) / Math.log(f2 / f1);
      if (!isFinite(LAMBDA3)) LAMBDA3 = (LAMBDA1 + LAMBDA2) / 2; // parallel of latitude

      var lat = PHI3.toDegrees();
      var lon = LAMBDA3.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
    /* Area - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

    /**
     * Calculates the area of a spherical polygon where the sides of the polygon are great circle
     * arcs joining the vertices.
     *
     * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon.
     * @param   {number}   [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
     * @returns {number}   The area of the polygon in the same units as radius.
     *
     * @example
     *   const polygon = [new LatLon(0,0), new LatLon(1,0), new LatLon(0,1)];
     *   const area = LatLon.areaOf(polygon); // 6.18e9 m²
     */

  }, {
    key: "equals",

    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    /**
     * Checks if another point is equal to ‘this’ point.
     *
     * @param   {LatLon} point - Point to be compared against this point.
     * @returns {bool}   True if points have identical latitude and longitude values.
     *
     * @example
     *   const p1 = new LatLon(52.205, 0.119);
     *   const p2 = new LatLon(52.205, 0.119);
     *   const equal = p1.equals(p2); // true
     */
    value: function equals(point) {
      if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point); // allow literal forms

      if (this.lat != point.lat) return false;
      if (this.lon != point.lon) return false;
      return true;
    }
    /**
     * Converts ‘this’ point to a GeoJSON object.
     *
     * @returns {Object} this point as a GeoJSON ‘Point’ object.
     */

  }, {
    key: "toGeoJSON",
    value: function toGeoJSON() {
      return {
        type: 'Point',
        coordinates: [this.lon, this.lat]
      };
    }
    /**
     * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
     * degrees+minutes+seconds.
     *
     * @param   {string} [format=d] - Format point as 'd', 'dm', 'dms', or 'n' for signed numeric.
     * @param   {number} [dp=4|2|0] - Number of decimal places to use: default 4 for d, 2 for dm, 0 for dms.
     * @returns {string} Comma-separated formatted latitude/longitude.
     * @throws  {RangeError} Invalid format.
     *
     * @example
     *   const greenwich = new LatLon(51.47788, -0.00147);
     *   const d = greenwich.toString();                        // 51.4779°N, 000.0015°W
     *   const dms = greenwich.toString('dms', 2);              // 51°28′40.37″N, 000°00′05.29″W
     *   const [lat, lon] = greenwich.toString('n').split(','); // 51.4779, -0.0015
     */

  }, {
    key: "toString",
    value: function toString() {
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'd';
      var dp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      // note: explicitly set dp to undefined for passing through to toLat/toLon
      if (!['d', 'dm', 'dms', 'n'].includes(format)) throw new RangeError("Invalid format \u2018".concat(format, "\u2019"));

      if (format == 'n') {
        // signed numeric degrees
        if (dp == undefined) dp = 4;
        return "".concat(this.lat.toFixed(dp), ",").concat(this.lon.toFixed(dp));
      }

      var lat = Dms.toLat(this.lat, format, dp);
      var lon = Dms.toLon(this.lon, format, dp);
      return "".concat(lat, ", ").concat(lon);
    }
  }, {
    key: "lat",
    get: function get() {
      return this._lat;
    },
    set: function set(lat) {
      this._lat = isNaN(lat) ? Dms.wrap90(Dms.parse(lat)) : Dms.wrap90(lat);
      if (isNaN(this._lat)) throw new TypeError("Invalid lat \u2018".concat(lat, "\u2019"));
    }
  }, {
    key: "latitude",
    get: function get() {
      return this._lat;
    },
    set: function set(lat) {
      this._lat = isNaN(lat) ? Dms.wrap90(Dms.parse(lat)) : Dms.wrap90(lat);
      if (isNaN(this._lat)) throw new TypeError("Invalid latitude \u2018".concat(lat, "\u2019"));
    }
    /**
     * Longitude in degrees east from international reference meridian (including aliases lon, lng,
     * longitude): can be set as numeric or hexagesimal (deg-min-sec); returned as numeric.
     */

  }, {
    key: "lon",
    get: function get() {
      return this._lon;
    },
    set: function set(lon) {
      this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(lon);
      if (isNaN(this._lon)) throw new TypeError("Invalid lon \u2018".concat(lon, "\u2019"));
    }
  }, {
    key: "lng",
    get: function get() {
      return this._lon;
    },
    set: function set(lon) {
      this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(lon);
      if (isNaN(this._lon)) throw new TypeError("Invalid lng \u2018".concat(lon, "\u2019"));
    }
  }, {
    key: "longitude",
    get: function get() {
      return this._lon;
    },
    set: function set(lon) {
      this._lon = isNaN(lon) ? Dms.wrap180(Dms.parse(lon)) : Dms.wrap180(lon);
      if (isNaN(this._lon)) throw new TypeError("Invalid longitude \u2018".concat(lon, "\u2019"));
    }
    /** Conversion factors; 1000 * LatLon.metresToKm gives 1. */

  }], [{
    key: "parse",

    /**
     * Parses a latitude/longitude point from a variety of formats.
     *
     * Latitude & longitude (in degrees) can be supplied as two separate parameters, as a single
     * comma-separated lat/lon string, or as a single object with { lat, lon } or GeoJSON properties.
     *
     * The latitude/longitude values may be numeric or strings; they may be signed decimal or
     * deg-min-sec (hexagesimal) suffixed by compass direction (NSEW); a variety of separators are
     * accepted. Examples -3.62, '3 37 12W', '3°37′12″W'.
     *
     * Thousands/decimal separators must be comma/dot; use Dms.fromLocale to convert locale-specific
     * thousands/decimal separators.
     *
     * @param   {number|string|Object} lat|latlon - Latitude (in degrees) or comma-separated lat/lon or lat/lon object.
     * @param   {number|string}        [lon]      - Longitude (in degrees).
     * @returns {LatLon} Latitude/longitude point.
     * @throws  {TypeError} Invalid coordinate.
     *
     * @example
     *   const p1 = LatLon.parse(52.205, 0.119);                                    // numeric pair (≡ new LatLon)
     *   const p2 = LatLon.parse('52.205', '0.119');                                // numeric string pair (≡ new LatLon)
     *   const p3 = LatLon.parse('52.205, 0.119');                                  // single string numerics
     *   const p4 = LatLon.parse('52°12′18.0″N', '000°07′08.4″E');                  // DMS pair
     *   const p5 = LatLon.parse('52°12′18.0″N, 000°07′08.4″E');                    // single string DMS
     *   const p6 = LatLon.parse({ lat: 52.205, lon: 0.119 });                      // { lat, lon } object numeric
     *   const p7 = LatLon.parse({ lat: '52°12′18.0″N', lng: '000°07′08.4″E' });    // { lat, lng } object DMS
     *   const p8 = LatLon.parse({ type: 'Point', coordinates: [ 0.119, 52.205] }); // GeoJSON
     */
    value: function parse() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (args.length == 0) throw new TypeError('Invalid (empty) coordinate');
      if (args[0] === null || args[1] === null) throw new TypeError('Invalid (null) coordinate');
      var lat = undefined,
          lon = undefined;

      if (args.length == 2) {
        // regular (lat, lon) arguments
        lat = args[0];
        lon = args[1];
        lat = Dms.wrap90(Dms.parse(lat));
        lon = Dms.wrap180(Dms.parse(lon));
        if (isNaN(lat) || isNaN(lon)) throw new TypeError("Invalid coordinate \u2018".concat(args.toString(), "\u2019"));
      }

      if (args.length == 1 && typeof args[0] == 'string') {
        // single comma-separated lat,lon string
        var _args$0$split = args[0].split(',');

        var _args$0$split2 = _slicedToArray(_args$0$split, 2);

        lat = _args$0$split2[0];
        lon = _args$0$split2[1];
        lat = Dms.wrap90(Dms.parse(lat));
        lon = Dms.wrap180(Dms.parse(lon));
        if (isNaN(lat) || isNaN(lon)) throw new TypeError("Invalid coordinate \u2018".concat(args[0], "\u2019"));
      }

      if (args.length == 1 && _typeof(args[0]) == 'object') {
        // single { lat, lon } object
        var ll = args[0];

        if (ll.type == 'Point' && Array.isArray(ll.coordinates)) {
          // GeoJSON
          var _ll$coordinates = _slicedToArray(ll.coordinates, 2);

          lon = _ll$coordinates[0];
          lat = _ll$coordinates[1];
        } else {
          // regular { lat, lon } object
          if (ll.latitude != undefined) lat = ll.latitude;
          if (ll.lat != undefined) lat = ll.lat;
          if (ll.longitude != undefined) lon = ll.longitude;
          if (ll.lng != undefined) lon = ll.lng;
          if (ll.lon != undefined) lon = ll.lon;
          lat = Dms.wrap90(Dms.parse(lat));
          lon = Dms.wrap180(Dms.parse(lon));
        }

        if (isNaN(lat) || isNaN(lon)) throw new TypeError("Invalid coordinate \u2018".concat(JSON.stringify(args[0]), "\u2019"));
      }

      if (isNaN(lat) || isNaN(lon)) throw new TypeError("Invalid coordinate \u2018".concat(args.toString(), "\u2019"));
      return new LatLonSpherical(lat, lon);
    }
  }, {
    key: "intersection",
    value: function intersection(p1, brng1, p2, brng2) {
      if (!(p1 instanceof LatLonSpherical)) p1 = LatLonSpherical.parse(p1); // allow literal forms

      if (!(p2 instanceof LatLonSpherical)) p2 = LatLonSpherical.parse(p2); // allow literal forms
      // see www.edwilliams.org/avform.htm#Intersection

      var PHI1 = p1.lat.toRadians(),
          LAMBDA1 = p1.lon.toRadians();
      var PHI2 = p2.lat.toRadians(),
          LAMBDA2 = p2.lon.toRadians();
      var THETA13 = Number(brng1).toRadians(),
          THETA23 = Number(brng2).toRadians();
      var DELTAPHI = PHI2 - PHI1,
          DELTA_LAMBDA = LAMBDA2 - LAMBDA1; // angular distance p1-p2

      var DELTA12 = 2 * Math.asin(Math.sqrt(Math.sin(DELTAPHI / 2) * Math.sin(DELTAPHI / 2) + Math.cos(PHI1) * Math.cos(PHI2) * Math.sin(DELTA_LAMBDA / 2) * Math.sin(DELTA_LAMBDA / 2)));
      if (DELTA12 == 0) return null; // initial/final bearings between points

      var cosTHETAa = (Math.sin(PHI2) - Math.sin(PHI1) * Math.cos(DELTA12)) / (Math.sin(DELTA12) * Math.cos(PHI1));
      var cosTHETAb = (Math.sin(PHI1) - Math.sin(PHI2) * Math.cos(DELTA12)) / (Math.sin(DELTA12) * Math.cos(PHI2));
      var THETAa = Math.acos(Math.min(Math.max(cosTHETAa, -1), 1)); // protect against rounding errors

      var THETAb = Math.acos(Math.min(Math.max(cosTHETAb, -1), 1)); // protect against rounding errors

      var THETA12 = Math.sin(LAMBDA2 - LAMBDA1) > 0 ? THETAa : 2 * PI - THETAa;
      var THETA21 = Math.sin(LAMBDA2 - LAMBDA1) > 0 ? 2 * PI - THETAb : THETAb;
      var ALPHA1 = THETA13 - THETA12; // angle 2-1-3

      var ALPHA2 = THETA21 - THETA23; // angle 1-2-3

      if (Math.sin(ALPHA1) == 0 && Math.sin(ALPHA2) == 0) return null; // infinite intersections

      if (Math.sin(ALPHA1) * Math.sin(ALPHA2) < 0) return null; // ambiguous intersection

      var cosALPHA3 = -Math.cos(ALPHA1) * Math.cos(ALPHA2) + Math.sin(ALPHA1) * Math.sin(ALPHA2) * Math.cos(DELTA12);
      var DELTA13 = Math.atan2(Math.sin(DELTA12) * Math.sin(ALPHA1) * Math.sin(ALPHA2), Math.cos(ALPHA2) + Math.cos(ALPHA1) * cosALPHA3);
      var PHI3 = Math.asin(Math.sin(PHI1) * Math.cos(DELTA13) + Math.cos(PHI1) * Math.sin(DELTA13) * Math.cos(THETA13));
      var DELTA_LAMBDA13 = Math.atan2(Math.sin(THETA13) * Math.sin(DELTA13) * Math.cos(PHI1), Math.cos(DELTA13) - Math.sin(PHI1) * Math.sin(PHI3));
      var LAMBDA3 = LAMBDA1 + DELTA_LAMBDA13;
      var lat = PHI3.toDegrees();
      var lon = LAMBDA3.toDegrees();
      return new LatLonSpherical(lat, Dms.wrap180(lon));
    }
  }, {
    key: "crossingParallels",
    value: function crossingParallels(point1, point2, latitude) {
      var PHI = Number(latitude).toRadians();
      var PHI1 = point1.lat.toRadians();
      var LAMBDA1 = point1.lon.toRadians();
      var PHI2 = point2.lat.toRadians();
      var LAMBDA2 = point2.lon.toRadians();
      var DELTA_LAMBDA = LAMBDA2 - LAMBDA1;
      var x = Math.sin(PHI1) * Math.cos(PHI2) * Math.cos(PHI) * Math.sin(DELTA_LAMBDA);
      var y = Math.sin(PHI1) * Math.cos(PHI2) * Math.cos(PHI) * Math.cos(DELTA_LAMBDA) - Math.cos(PHI1) * Math.sin(PHI2) * Math.cos(PHI);
      var z = Math.cos(PHI1) * Math.cos(PHI2) * Math.sin(PHI) * Math.sin(DELTA_LAMBDA);
      if (z * z > x * x + y * y) return null; // great circle doesn't reach latitude

      var LAMBDAm = Math.atan2(-y, x); // longitude at max latitude

      var DELTA_LAMBDAi = Math.acos(z / Math.sqrt(x * x + y * y)); // DELTA_LAMBDA from LAMBDAm to intersection points

      var LAMBDAi1 = LAMBDA1 + LAMBDAm - DELTA_LAMBDAi;
      var LAMBDAi2 = LAMBDA1 + LAMBDAm + DELTA_LAMBDAi;
      var lon1 = LAMBDAi1.toDegrees();
      var lon2 = LAMBDAi2.toDegrees();
      return {
        lon1: Dms.wrap180(lon1),
        lon2: Dms.wrap180(lon2)
      };
    }
  }, {
    key: "areaOf",
    value: function areaOf(polygon) {
      var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6371e3;
      // uses method due to Karney: osgeo-org.1560.x6.nabble.com/Area-of-a-spherical-polygon-td3841625.html;
      // for each edge of the polygon, tan(E/2) = tan(DELTA_LAMBDA/2)·(tan(PHI1/2) + tan(PHI2/2)) / (1 + tan(PHI1/2)·tan(PHI2/2))
      // where E is the spherical excess of the trapezium obtained by extending the edge to the equator
      var R = radius; // close polygon so that last point equals first point

      var closed = polygon[0].equals(polygon[polygon.length - 1]);
      if (!closed) polygon.push(polygon[0]);
      var nVertices = polygon.length - 1;
      var S = 0; // spherical excess in steradians

      for (var v = 0; v < nVertices; v++) {
        var PHI1 = polygon[v].lat.toRadians();
        var PHI2 = polygon[v + 1].lat.toRadians();
        var DELTA_LAMBDA = (polygon[v + 1].lon - polygon[v].lon).toRadians();
        var E = 2 * Math.atan2(Math.tan(DELTA_LAMBDA / 2) * (Math.tan(PHI1 / 2) + Math.tan(PHI2 / 2)), 1 + Math.tan(PHI1 / 2) * Math.tan(PHI2 / 2));
        S += E;
      }

      if (isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2 * PI;
      var A = Math.abs(S * R * R); // area in units of R

      if (!closed) polygon.pop(); // restore polygon to pristine condition

      return A; // returns whether polygon encloses pole: sum of course deltas around pole is 0° rather than
      // normal ±360°: blog.element84.com/determining-if-a-spherical-polygon-contains-a-pole.html

      function isPoleEnclosedBy(p) {
        // TODO: any better test than this?
        var SIGMADELTA = 0;
        var prevBrng = p[0].initialBearingTo(p[1]);

        for (var _v = 0; _v < p.length - 1; _v++) {
          var _initBrng = p[_v].initialBearingTo(p[_v + 1]);

          var finalBrng = p[_v].finalBearingTo(p[_v + 1]);

          SIGMADELTA += (_initBrng - prevBrng + 540) % 360 - 180;
          SIGMADELTA += (finalBrng - _initBrng + 540) % 360 - 180;
          prevBrng = finalBrng;
        }

        var initBrng = p[0].initialBearingTo(p[1]);
        SIGMADELTA += (initBrng - prevBrng + 540) % 360 - 180; // TODO: fix (intermittant) edge crossing pole - eg (85,90), (85,0), (85,-90)

        var enclosed = Math.abs(SIGMADELTA) < 90; // 0°-ish

        return enclosed;
      }
    }
  }, {
    key: "metresToKm",
    get: function get() {
      return 1 / 1000;
    }
    /** Conversion factors; 1000 * LatLon.metresToMiles gives 0.621371192237334. */

  }, {
    key: "metresToMiles",
    get: function get() {
      return 1 / 1609.344;
    }
    /** Conversion factors; 1000 * LatLon.metresToMiles gives 0.5399568034557236. */

  }, {
    key: "metresToNauticalMiles",
    get: function get() {
      return 1 / 1852;
    }
  }]);

  return LatLonSpherical;
}();
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
//export { LatLonSpherical as default, Dms };
