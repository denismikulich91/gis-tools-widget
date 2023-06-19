define("DS/xCityAppsOpenness/Utility", ["UWA/Core"], function(e) {
    "use strict";
    var t = new Map([
        ["red", {
            color: "#ff0000"
        }],
        ["orange", {
            color: "#ffa500"
        }],
        ["yellow", {
            color: "#ffff00"
        }],
        ["green", {
            color: "#008000"
        }],
        ["blue", {
            color: "#0000ff"
        }],
        ["indigo", {
            color: "#4b0082"
        }],
        ["violet", {
            color: "#ee82ee"
        }]
    ]);
    return {
        degreeToRadian: function(e) {
            return e * Math.PI / 180
        },
        radianToDegree: function(e) {
            return 180 * e / Math.PI
        },
        worldToLocal: function(e) {
            var t = xCity.convertToVec3({
                x: e.lon,
                y: e.lat
            });
            return xCity.doProjection(t, !1, {
                input: "WGS84",
                output: xCity.projection
            })
        },
        localToWorld: function(e) {
            var t = xCity.convertToVec3({
                x: e.x,
                y: e.y
            });
            return xCity.doProjection(t, !1, {
                input: xCity.projection,
                output: "WGS84"
            })
        },
        getPointOfView: function() {
            var e = this.localToWorld(xCity.pointOfView.target);
            return {
                target: {
                    local: {
                        x: xCity.pointOfView.target.x,
                        y: xCity.pointOfView.target.y
                    },
                    world: {
                        lat: e.y,
                        lon: e.x
                    },
                    altitude: xCity.pointOfView.target.z,
                    distance: xCity.pointOfView.length
                },
                rotation: {
                    yaw: xCity.pointOfView.rotation.x,
                    pitch: xCity.pointOfView.rotation.y
                }
            }
        },
        lineLocalToWorld: function(e) {
            for (var t = [], i = 0; i < e.length; i++) {
                var n = xCity.doProjection(e[i], !1, {
                    input: xCity.projection,
                    output: "WGS84"
                });
                t.push([n.x, n.y])
            }
            return t
        },
        getAreaInView: function() {
            return {
                local: {
                    polygon: [xCity.areaInView]
                },
                world: {
                    polygon: [this.lineLocalToWorld(xCity.areaInView)]
                }
            }
        },
        useHighlight: function(e) {
            if (t.has(e)) {
                var i, n = xCity.getHighlightSet(e);
                return n || (i = t.get(e).color, xCity.addHighlightSet(e, {
                    color: i,
                    outlineColor: i,
                    haloColor: i
                }), n = xCity.getHighlightSet(e)), xCity.activateHighlightSet(e), {
                    id: e,
                    highlightSet: n
                }
            }
        }
    }
}), define("DS/xCityAppsOpenness/WidgetManager", ["DS/xCityAppsInfra/xCityWidgetData"], function(e) {
    "use strict";
    var t, i = [],
        n = [],
        o = [],
        r = [];

    function a() {
        e.setValue("pairedWidgets", JSON.stringify(i))
    }

    function s() {
        try {
            for (var e, t = window.top.UWA.Widgets.instances, i = 0; i < t.length; i++) {
                var n = t[i];
                if (UWA.is(n.layout, "object") && UWA.is(n.layout.wp, "object") && n.layout.wp.children.length) {
                    for (var a = 0; a < n.layout.wp.children.length; a++) {
                        if (n.layout.wp.children[a].id === widget.id) {
                            e = n;
                            break
                        }
                    }
                    if (e) break
                }
            }
            o = [], r = [];
            for (i = 0; i < e.layout.wp.children.length; i++) {
                (n = e.layout.wp.children[i]).id !== widget.id && (o.push({
                    id: n.id,
                    title: n.title
                }), r.push(n.id))
            }
        } catch (e) {
            console.warn("Not able to scan widgets on current tab", e)
        }
    }
    return function() {
        if ((r = e.getValue("pairedWidgets"), i = r = r ? JSON.parse(r) : []).length)
            for (var t = 0; t < i.length; t++) {
                var o = i[t].id;
                n.push(o)
            }
        var r
    }(), {
        setPairedWidgetCallback: function(e) {
            t = e
        },
        addPairedWidget: function(e, o, r) {
            return i.push({
                id: e,
                title: o
            }), n.push(e), a(), t && t(), !0
        },
        isPaired: function(e) {
            return n.includes(e)
        },
        getPairedWidgets: function(e) {
            return e ? n : i
        },
        removePairedWidget: function(e, o) {
            for (var r, s = {}, d = 0; d < n.length; d++) {
                if (n[d] === e) {
                    r = d, s.title = i[r].title, s.id = i[r].id;
                    break
                }
            }
            return !!UWA.is(r, "number") && (n.splice(r, 1), i.splice(r, 1), a(), o && t && t(), s)
        },
        getSameTabWidgets: function(e) {
            return e ? r : o
        },
        isOnSameTab: function(e) {
            return !!r.includes(e) || (s(), r.includes(e))
        },
        refreshTabWidgetList: function() {
            s()
        }
    }
}), define("DS/xCityAppsOpenness/PublicAPI", ["DS/xCityAppsInfra/xCityExaleadProxy", "DS/WAFData/WAFData", "DS/Visualization/ThreeJS_DS"], function(e, t, i) {
    var n = null,
        o = {
            0: "0:Please provide widget ID",
            1: "1:Please provide layer ID",
            2: "2:This layer ID already exists",
            3: "3:No geojson, json, collection or url to geojson input"
        },
        r = {
            poi: {
                color: "#ffffff",
                opacity: 1,
                scale: [1, 1, 1]
            },
            line: {
                color: "#ffffff",
                opacity: 1,
                dynamicUpdate: !1,
                lineWidth: 10,
                minWidth: 1,
                minDist: 200,
                maxDist: 1e5,
                renderMode: "dual"
            },
            polygon: {
                color: "#ffffff",
                dynamicUpdate: !1,
                extrusionHeight: 0,
                opacity: 1,
                geometricMode: "filled",
                lineWidth: 10,
                minWidth: 1,
                minDist: 200,
                maxDist: 1e3,
                renderMode: "dual"
            }
        },
        a = {
            GeoJSON: "GeoJSON",
            ObjXYZ: "ObjXYZ",
            ObjLonLat: "ObjLonLat",
            ArrXYZ: "ArrXYZ",
            ArrObjXYZ: "ArrObjXYZ",
            ArrObjLonLat: "ArrObjLonLat",
            ArrArrXYZ: "ArrArrXYZ"
        };
    shapeIdx = 0, shapeList = [];
    var s = [];

    function d() {}

    function l(e, t) {
        return !!e.widgetID || (t({
            status: !1,
            result: o[0]
        }), console.warn(o[0]), !1)
    }

    function c(e, t) {
        return e.layer && xCity.findItem({
            id: e.layer.id
        }) ? (t({
            status: !1,
            widgetID: e.widgetID,
            result: o[2]
        }), console.warn(o[2]), !1) : !!(e.geojson || e.collection || e.json || e.url) || (t({
            status: !1,
            widgetID: e.widgetID,
            result: o[3]
        }), console.warn(o[3]), !1)
    }

    function u(e) {
        var t = xCity.findItem({
                id: e.id
            }),
            i = xCity.findItem({
                id: e.parentID
            });
        if (!t) {
            var n = {
                id: e.id
            };
            return e.name && (n.name = e.name), xCity.addFolder(n, i)
        }
        return t
    }

    function p(e) {
        return "data:application/json;base64," + btoa(JSON.stringify(e))
    }

    function g(e) {
        return Array.isArray(e) ? function(e) {
            if (!Array.isArray(e[0]) && !isNaN(e[0]) && !isNaN(e[1])) return !0;
            return !1
        }(e) ? a.ArrXYZ : y(e[0]) ? a.ArrObjXYZ : f(e[0]) ? a.ArrObjLonLat : !!Array.isArray(e[0]) && a.ArrArrXYZ : y(e) ? a.ObjXYZ : f(e) ? a.ObjLonLat : !! function(e) {
            if ("object" == typeof e && e.type && "FeatureCollection" === e) return !0;
            return !1
        }(e) && a.GeoJSON
    }

    function y(e) {
        return !("object" != typeof e || !e.x || !e.y)
    }

    function f(e) {
        return !("object" != typeof e || !e.lon || !e.lat)
    }

    function m(e, t, i, n) {
        switch (g(e)) {
            case a.ObjXYZ:
                e = function(e) {
                    if (e.z || 0 === e.z) return [
                        [e.x, e.y, e.z]
                    ];
                    return [
                        [e.x, e.y]
                    ]
                }(e);
                break;
            case a.ObjLonLat:
                e = function(e) {
                    return [
                        [e.lon, e.lat]
                    ]
                }(e);
                break;
            case a.ArrXYZ:
                e = function(e) {
                    if (e[2] || 0 === e[2]) return [
                        [e[0], e[1], e[2]]
                    ];
                    return [
                        [e[0], e[1]]
                    ]
                }(e);
                break;
            case a.ArrObjXYZ:
                e = function(e, t) {
                    var i = [];
                    if ("POINT" === t)
                        for (var n = 0; n < e.length; n++) e[n].z || 0 === e[n].z ? i.push([e[n].x, e[n].y, e[n].z]) : i.push([e[n].x, e[n].y]);
                    else if ("LINESTRING" === t) {
                        i.push([]);
                        for (var n = 0; n < e.length; n++) e[n].z || 0 === e[n].z ? i[0].push([e[n].x, e[n].y, e[n].z]) : i[0].push([e[n].x, e[n].y])
                    } else if ("POLYGON" === t) {
                        i.push([
                            []
                        ]);
                        for (var n = 0; n < e.length; n++) e[n].z || 0 === e[n].z ? i[0][0].push([e[n].x, e[n].y, e[n].z]) : i[0][0].push([e[n].x, e[n].y])
                    }
                    return i
                }(e, n);
                break;
            case a.ArrObjLonLat:
                e = function(e, t) {
                    var i = [];
                    if ("POINT" === t)
                        for (var n = 0; n < e.length; n++) i.push([e[n].lon, e[n].lat]);
                    else if ("LINESTRING" === t) {
                        i.push([]);
                        for (var n = 0; n < e.length; n++) i[0].push([e[n].lon, e[n].lat])
                    } else if ("POLYGON" === t) {
                        i.push([
                            []
                        ]);
                        for (var n = 0; n < e.length; n++) i[0][0].push([e[n].lon, e[n].lat])
                    }
                    return i
                }(e, n);
                break;
            case a.ArrArrXYZ:
                e = function(e, t) {
                    var i = [];
                    if ("POINT" === t)
                        for (var n = 0; n < e.length; n++) e[n][2] || 0 === e[n][2] ? i.push([e[n][0], e[n][1], e[n][2]]) : i.push([e[n][0], e[n][1]]);
                    else if ("LINESTRING" === t) {
                        i.push([]);
                        for (var n = 0; n < e.length; n++) e[n][2] || 0 === e[n][2] ? i[0].push([e[n][0], e[n][1], e[n][2]]) : i[0].push([e[n][0], e[n][1]])
                    } else if ("POLYGON" === t) {
                        i.push([
                            []
                        ]);
                        for (var n = 0; n < e.length; n++) e[n][2] || 0 === e[n][2] ? i[0][0].push([e[n][0], e[n][1], e[n][2]]) : i[0][0].push([e[n][0], e[n][1]])
                    }
                    return i
                }(e, n)
        }
        var o = "Point",
            r = {
                type: "FeatureCollection",
                name: i,
                features: []
            };
        switch (n) {
            case "LINESTRING":
                o = "LineString";
                break;
            case "POLYGON":
                o = "Polygon";
                break;
            default:
                o = "Point"
        }
        for (var s = 0; s < e.length; s++) r.features.push({
            type: "Feature",
            properties: Array.isArray(t) ? t[s] : t,
            geometry: {
                type: o,
                coordinates: e[s]
            }
        });
        return r
    }

    function v(e) {
        for (var t = !1, i = {
                type: "FeatureCollection",
                name: "",
                features: []
            }, n = 0; n < e.length; n++) t || (i.name = e[n].layer, t = !0), i.features.push({
            type: "Feature",
            properties: e[n].properties,
            geometry: {
                type: e[n].type,
                coordinates: e[n].coordinates
            }
        });
        return i
    }

    function b(e) {
        return e.indexOf("POINT") > -1 ? e.match(/\((.*)\)/i)[1].split(" ").map(Number) : e.indexOf("LINESTRING") > -1 ? function(e) {
            for (var t = [], i = e.match(/\((.*)\)/i)[1].split(","), n = 0; n < i.length; n++) {
                var o = i[n].trim().split(" ").map(Number);
                t.push(o)
            }
            return t
        }(e) : e.indexOf("MULTIPOLYGON") > -1 ? function(e) {
            for (var t = [], i = e.match(/\((.*)\)/i)[1].match(/\(\((.*?)\)\)/g), n = 0; n < i.length; n++) {
                var o = h(i[n]);
                t.push(o)
            }
            return t
        }(e) : e.indexOf("POLYGON") > -1 ? h(e) : void 0
    }

    function h(e) {
        for (var t = [], i = e.match(/\((.*)\)/i)[1].match(/\(([^)]+)\)/g), n = 0; n < i.length; n++) {
            var o = i[n].trim();
            o = o.substring(1, o.length - 1).split(",");
            for (var r = [], a = 0; a < o.length; a++) {
                var s = o[a].trim().split(" ").map(Number);
                r.push(s)
            }
            t.push(r)
        }
        return t
    }

    function I(e, t, i) {
        var n = {};
        switch (i) {
            case "Point":
                n = function(e) {
                    return e ? {
                        color: e.color || "#ffffff",
                        opacity: e.opacity || 1,
                        scale: e.scale || [1, 1, 1]
                    } : r.point
                }(e);
                break;
            case "LineString":
                n = function(e) {
                    if (!e) return r.line;
                    var t = {
                        color: e.color || "#ffffff",
                        opacity: e.opacity || 1,
                        dynamicUpdate: e.dynamicUpdate || !1,
                        lineWidth: e.lineWidth || 10,
                        minWidth: e.minWidth || 1,
                        minDist: e.minDist || 200,
                        maxDist: e.maxDist || 1e5,
                        renderMode: e.renderMode || "dual"
                    };
                    return e.animation && (t.animation = {
                        speed: e.animation.speed || 150,
                        dashSize: e.animation.dashSize || 1e3,
                        opacity: e.animation.opacity || .5,
                        gapSize: e.animation.gapSize || 50,
                        loop: e.animation.loop || !0,
                        reverse: e.animation.reverse || !1
                    }), t
                }(e);
                break;
            case "Polygon":
                n = function(e) {
                    return e ? {
                        color: e.color || "#ffffff",
                        dynamicUpdate: e.dynamicUpdate || !1,
                        extrusionHeight: e.extrusionHeight || 0,
                        opacity: e.opacity || 1,
                        geometricMode: e.geometricMode || "filled",
                        lineWidth: e.lineWidth || 10,
                        minWidth: e.minWidth || 1,
                        minDist: e.minDist || 200,
                        maxDist: e.maxDist || 1e3,
                        renderMode: e.renderMode || "dual"
                    } : r.polygon
                }(e);
                break;
            case "Marker":
                n = function(e) {
                    var t = {
                        renderMode: e.renderMode || "dual",
                        style: e.style || "icon",
                        color: e.color || "#f4f4f4",
                        icon: {
                            iconPath: e.iconPath,
                            iconName: e.iconName
                        }
                    };
                    return e.iconPath ? delete t.icon.iconName : delete t.icon.iconPath, t
                }(e)
        }
        var o = {
            profiles: [{
                name: xCity.renderingProfile,
                Rendering: [{
                    Ids: [t],
                    Material: n
                }]
            }]
        };
        xCity.loadRenderingProfiles(o)
    }

    function C(e) {
        if (e) {
            var t = widget.body.getWindow().frameElement.contentDocument,
                i = t.head;
            if (!i.querySelector("#" + e.id)) {
                var n = t.createElement("link");
                n.rel = "stylesheet", n.href = e.url, n.id = e.id, i.appendChild(n)
            }
        }
    }

    function x(e, t, i) {
        switch (g(e)) {
            case a.ObjXYZ:
                e = function(e, t, i) {
                    if (t) {
                        var n = xCity.doProjection([e.x, e.y], !1, {
                            input: t.from || xCity.projection,
                            output: t.to || xCity.projection
                        });
                        e.x = n.x, e.y = n.y
                    }
                    i && (e.z = xCity.getGroundHeight({
                        x: e.x,
                        y: e.y
                    }));
                    return e
                }(e, t, i);
                break;
            case a.ObjLonLat:
                e = function(e, t, i) {
                    if (t) {
                        var n = xCity.doProjection([e.lon, e.lat], !1, {
                            input: t.from || xCity.projection,
                            output: t.to || xCity.projection
                        });
                        e.lon = n.x, e.lat = n.y
                    }
                    i && (e.height = xCity.getGroundHeight({
                        x: e.lon,
                        y: e.lat
                    }));
                    return e
                }(e, t, i);
                break;
            case a.ArrXYZ:
                e = function(e, t, i) {
                    if (t) {
                        var n = xCity.doProjection(e, !1, {
                            input: t.from || xCity.projection,
                            output: t.to || xCity.projection
                        });
                        e[0] = n.x, e[1] = n.y
                    }
                    if (i) {
                        var o = xCity.getGroundHeight({
                            x: e[0],
                            y: e[1]
                        });
                        e.push(o)
                    }
                    return e
                }(e, t, i);
                break;
            case a.ArrObjXYZ:
                e = function(e, t, i) {
                    for (var n = 0; n < e.length; n++) {
                        if (t) {
                            var o = xCity.doProjection([e[n].x, e[n].y], !1, {
                                input: t.from || xCity.projection,
                                output: t.to || xCity.projection
                            });
                            e[n].x = o.x, e[n].y = o.y
                        }
                        if (i) {
                            var r = xCity.getGroundHeight({
                                x: e[n].x,
                                y: e[n].y
                            });
                            e[n].z = r
                        }
                    }
                    return e
                }(e, t, i);
                break;
            case a.ArrObjLonLat:
                e = function(e, t, i) {
                    for (var n = 0; n < e.length; n++) {
                        if (t) {
                            var o = xCity.doProjection([e[n].lon, e[n].lat], !1, {
                                input: t.from || xCity.projection,
                                output: t.to || xCity.projection
                            });
                            e[n].lon = o.x, e[n].lat = o.y
                        }
                        if (i) {
                            var r = xCity.getGroundHeight({
                                x: e[n].lon,
                                y: e[n].lat
                            });
                            e[n].height = r
                        }
                    }
                    return e
                }(e, t, i);
                break;
            case a.ArrArrXYZ:
                e = function(e, t, i) {
                    for (var n = 0; n < e.length; n++) {
                        if (t) {
                            var o = xCity.doProjection(e[n], !1, {
                                input: t.from || xCity.projection,
                                output: t.to || xCity.projection
                            });
                            e[n][0] = o.x, e[n][1] = o.y
                        }
                        if (i) {
                            var r = xCity.getGroundHeight({
                                x: e[n][0],
                                y: e[n][1]
                            });
                            e[n].push(r)
                        }
                    }
                    return e
                }(e, t, i)
        }
        return e
    }

    function w(e, t, i) {
        for (var n = 0; n < e.length; n++) t && (e[n].coordinates = j(e[n].type, e[n].coordinates, t)), i && (e[n].coordinates = P(e[n].type, e[n].coordinates));
        return e
    }

    function D(e, t, i) {
        for (var n = e.features, o = 0; o < n.length; o++) {
            var r = n[o];
            t && (e.features[o].geometry.coordinates = j(r.geometry.type, r.geometry.coordinates, t)), i && (e.features[o].geometry.coordinates = P(r.geometry.type, r.geometry.coordinates))
        }
        return e
    }

    function j(e, t, i) {
        if ("POINT" == (e = e.toUpperCase())) {
            var n = xCity.doProjection(t, !1, {
                input: i.from || xCity.projection,
                output: i.to || xCity.projection
            });
            i.preserveElevation && t[2] ? (n.z = t[2], t = [n.x, n.y, n.z]) : t = [n.x, n.y]
        } else if ("LINESTRING" == e || "MULTIPOINT" == e)
            for (var o = 0; o < t.length; o++) {
                var r = t[o];
                n = xCity.doProjection(r, !1, {
                    input: i.from || xCity.projection,
                    output: i.to || xCity.projection
                });
                i.preserveElevation && t[o][2] ? (n.z = t[o][2], t[o] = [n.x, n.y, n.z]) : t[o] = [n.x, n.y]
            } else if ("POLYGON" == e || "MULTILINESTRING" == e)
                for (o = 0; o < t.length; o++)
                    for (var a = t[o], s = 0; s < a.length; s++) {
                        r = a[s];
                        n = xCity.doProjection(r, !1, {
                            input: i.from || xCity.projection,
                            output: i.to || xCity.projection
                        }), i.preserveElevation && t[o][s][2] ? (n.z = t[o][s][2], t[o][s] = [n.x, n.y, n.z]) : t[o][s] = [n.x, n.y]
                    }
            return t
    }

    function P(e, t) {
        if ("Point" == e)(n = xCity.getGroundHeight({
            x: t[0],
            y: t[1]
        })) || (n = 0), t.push(n);
        else if ("LineString" == e || "MultiPoint" == e)
            for (var i = 0; i < t.length; i++) {
                var n, o = t[i];
                (n = xCity.getGroundHeight({
                    x: o[0],
                    y: o[1]
                })) || (n = 0), t[i].push(n)
            } else if ("Polygon" == e || "MultiLineString" == e)
                for (i = 0; i < t.length; i++)
                    for (var r = t[i], a = 0; a < r.length; a++) {
                        o = r[a];
                        (n = xCity.getGroundHeight({
                            x: o[0],
                            y: o[1]
                        })) || (n = 0), t[i][a].push(n)
                    }
            return t
    }

    function S(e) {
        return e.indexOf("gdal_string_") > -1 ? e = e.replace("gdal_string_", "") : e.indexOf("gdal_integer_") > -1 ? e = e.replace("gdal_integer_", "") : e.indexOf("gdal_real_") > -1 ? e = e.replace("gdal_real_", "") : e.indexOf("field_string_") > -1 ? e = e.replace("field_string_", "") : e.indexOf("field_integer_") > -1 ? e = e.replace("field_integer_", "") : e.indexOf("field_real_") > -1 ? e = e.replace("field_real_", "") : e.indexOf("field_number_") > -1 ? e = e.replace("field_number_", "") : e.indexOf("field_date_") > -1 ? e = e.replace("field_date_", "") : e.indexOf("field_boolean_") > -1 ? e = e.replace("field_boolean_", "") : e.indexOf("field_double_") > -1 && (e = e.replace("field_double_", "")), e
    }

    function O(e) {
        var t = e.toUpperCase();
        return t.indexOf("MULTIPOINT") > -1 ? "MultiPoint" : t.indexOf("POINT") > -1 ? "Point" : t.indexOf("MULTILINESTRING") > -1 ? "MultiLineString" : t.indexOf("LINESTRING") > -1 ? "LineString" : t.indexOf("MULTIPOLYGON") > -1 ? "MultiPolygon" : t.indexOf("POLYGON") > -1 ? "Polygon" : t.indexOf("GEOMETRYCOLLECTION") > -1 ? "GeometryCollection" : "Invalid"
    }

    function T(e, t) {
        var i;
        switch (t) {
            case "exalead":
                i = e;
                break;
            case "json":
                i = function(e) {
                    if (e.nhits) {
                        for (var t = [], i = 0; i < e.hits.length; i++) {
                            for (var n = e.hits[i].metas, o = {
                                    properties: {}
                                }, r = 0; r < n.length; r++) {
                                var a = n[r];
                                if ("title" === a.name || "layername" === a.name) o.layer = a.value;
                                else {
                                    if ("url" === a.name) continue;
                                    if ("enovia_doc_id" === a.name) continue;
                                    if ("gdal_default_epsg_code" === a.name) continue;
                                    if ("gdal_invalid_geo" === a.name) continue;
                                    if ("gdal_geo_type" === a.name) o.type = a.value;
                                    else if ("geometrytype" === a.name) o.type = O(a.value);
                                    else if ("gdal_default_geo" === a.name || "geometry" === a.name) {
                                        var s = b(a.value);
                                        o.coordinates = s
                                    } else {
                                        var d = S(a.name);
                                        o.properties[d] = a.value
                                    }
                                }
                            }
                            t.push(o)
                        }
                        return t
                    }
                }(e);
                break;
            default:
                i = function(e) {
                    if (e.nhits) {
                        for (var t, i = {
                                type: "FeatureCollection",
                                name: "",
                                features: []
                            }, n = 0; n < e.hits.length; n++) {
                            var o = e.hits[n].metas;
                            i.features.push({
                                type: "Feature",
                                properties: {},
                                geometry: {
                                    type: "",
                                    coordinates: []
                                }
                            });
                            for (var r = 0; r < o.length; r++) {
                                var a = o[r];
                                if ("title" === a.name || "layername" === a.name) {
                                    if (t) continue;
                                    i.name = a.value, t = !0
                                } else {
                                    if ("url" === a.name) continue;
                                    if ("enovia_doc_id" === a.name) continue;
                                    if ("gdal_default_epsg_code" === a.name) continue;
                                    if ("gdal_invalid_geo" === a.name) continue;
                                    if ("gdal_geo_type" === a.name) i.features[n].geometry.type = a.value, a.value;
                                    else if ("geometrytype" === a.name) i.features[n].geometry.type = O(a.value);
                                    else if ("gdal_default_geo" === a.name || "geometry" === a.name) {
                                        var s = b(a.value);
                                        i.features[n].geometry.coordinates = s
                                    } else {
                                        var d = S(a.name);
                                        i.features[n].properties[d] = a.value
                                    }
                                }
                            }
                        }
                        return i
                    }
                }(e)
        }
        return i
    }
    return d.prototype = {
        init: function() {
            return xCity
        },
        isTestCase: function() {
            this.testcase = !0
        },
        addPOIV1: function(e, i, n) {
            if (c(e, n)) {
                var o, r = {};
                e.options || (e.options = {}), e.layer || (e.layer = {}), !e.geojson && e.json ? e.geojson = v(e.json) : !e.geojson && e.collection && (e.geojson = m(e.collection.coordinates, e.collection.properties, e.layer.name, e.collection.type)), e.url || !e.options.projection && !e.options.addTerrainHeight || (e.geojson = D(e.geojson, e.options.projection, e.options.addTerrainHeight));
                var a, s = "";
                switch (s = e.layer.id || e.url ? e.layer.id : (s = e.geojson.name.replace(" ", "_")).toLowerCase(), C(e.options.css), I(e.render, s, "Point"), e.folder && (o = u(e.folder)), e.layer.attributeMapping || (e.layer.attributeMapping = {}), e.render.gradient && "object" == typeof e.render.gradient || (e.render.gradient = {
                    start: {
                        value: 0,
                        color: [255, 0, 0, 255]
                    },
                    mid: {
                        value: 127.5,
                        color: [0, 255, 0, 255]
                    },
                    end: {
                        value: 255,
                        color: [0, 0, 255, 255]
                    }
                }), e.render.shape) {
                    case "disc":
                        e.render.vertice = 300;
                        break;
                    case "square":
                        e.render.shape = "disc", e.render.vertice = 4;
                        break;
                    case "triangle":
                        e.render.shape = "disc", e.render.vertice = 3;
                        break;
                    case "tube":
                        e.render.shape = "tube", e.render.vertice = 300;
                        break;
                    case "cube":
                        e.render.shape = "tube", e.render.vertice = 4;
                        break;
                    case "pyramid":
                        e.render.shape = "pyramid", e.render.vertice = 3;
                        break;
                    case "billboard":
                        e.render.shape = "billboard", e.render.vertice = 4;
                        break;
                    default:
                        e.render.shape = "sphere", e.render.vertice = 30
                }
                a = e.geojson && !e.layer.name ? e.geojson.name : e.layer.name;
                var d, l = {
                    className: "Feature",
                    id: s,
                    name: a,
                    visible: !1 !== e.layer.visible,
                    selectable: !1 !== e.layer.selectable,
                    Content: {
                        className: "RdbLink",
                        levelMax: e.render.levelMax || 0,
                        levelMin: e.render.levelMin || 0,
                        cache: 0,
                        invertY: !1,
                        priority: e.render.priority || 100,
                        type: "json",
                        url: "",
                        renderID: s || "",
                        Factory: {
                            className: "PointOfInterest3D",
                            geometryMode: e.render.geometryMode || "mesh",
                            shapeType: e.render.shape || "sphere",
                            renderType: e.render.type || "icon",
                            renderMode: e.render.mode || "dual",
                            renderAnchor: e.render.anchor || !1,
                            anchorLineWidth: e.render.anchorWidth || 2,
                            switchDistance: e.render.switchDistance || 0,
                            nbVertices: e.render.vertice || 17,
                            nameAttribute: e.layer.attributeMapping.NAME || "NAME",
                            stridAttribute: e.layer.attributeMapping.STRID || "STRID",
                            styleClassAttribute: e.layer.attributeMapping.STYLECLASS || "STYLECLASS",
                            altitudeAttribute: e.layer.attributeMapping.ALTITUDE || "ALTITUDE",
                            heightAttribute: e.layer.attributeMapping.HEIGHT || "HEIGHT",
                            opacityAttribute: e.layer.attributeMapping.OPACITY || "OPACITY",
                            colorAttribute: e.layer.attributeMapping.COLOR || "COLOR",
                            scaleAttribute: e.layer.attributeMapping.SCALE || "SCALE",
                            orientationAttribute: e.layer.attributeMapping.ORIENTATION || "ORIENTATION",
                            colorGradient: {
                                attribute: e.layer.attributeMapping.COLORG || "COLORG",
                                start: e.render.gradient.start || {
                                    value: 0,
                                    color: [255, 0, 0, 255]
                                },
                                mid: e.render.gradient.mid || {
                                    value: 127.5,
                                    color: [0, 255, 0, 255]
                                },
                                end: e.render.gradient.end || {
                                    value: 255,
                                    color: [0, 0, 255, 255]
                                }
                            }
                        }
                    }
                };
                if (e.render.anchor || delete l.Content.Factory.anchorLineWidth, e.render.color && e.render.gradient ? delete l.Content.Factory.colorGradient : e.render.color && !e.render.gradient ? delete l.Content.Factory.colorGradient : delete l.Content.renderID, e.options.proxy) {
                    var g = new FormData;
                    g.append("action", "put"), g.append("id", s), g.append("data", JSON.stringify(e.geojson)), t.proxifiedRequest(e.options.proxy, {
                        method: "POST",
                        type: "json",
                        data: g,
                        onComplete: function(t) {
                            l.Content.url = e.options.proxy + "?action=get&id=" + s + "&sid=" + t.sid, d = xCity.add3DContent({
                                feature: l,
                                parentFolder: o
                            }), o && (r.folderID = o.get("id")), r.layerID = d.get("id"), r.geojson = e.geojson, i({
                                widgetID: e.widgetID,
                                data: r
                            })
                        },
                        onFailure: function(t) {
                            console.log("ERR", t), n({
                                widgetID: e.widgetID,
                                data: "Add3DPOI: Unable to get respond from external service"
                            })
                        }
                    })
                } else l.Content.url = e.geojson ? p(e.geojson) : e.url, d = xCity.add3DContent({
                    feature: l,
                    parentFolder: o
                }), o && (r.folderID = o.get("id")), r.layerID = d.get("id"), e.geojson && (r.geojson = e.geojson), i({
                    widgetID: e.widgetID,
                    data: r
                })
            }
        },
        addLineV1: function(e, i, n) {
            if (c(e, n)) {
                var o, r = {};
                e.folder && (o = u(e.folder)), e.options || (e.options = {}), e.layer || (e.layer = {}), !e.geojson && e.json ? e.geojson = v(e.json) : !e.geojson && e.collection && (e.geojson = m(e.collection.coordinates, e.collection.properties, e.layer.name, e.collection.type)), e.url || !e.options.projection && !e.options.addTerrainHeight || (e.geojson = D(e.geojson, e.options.projection, e.options.addTerrainHeight));
                var a, s, d, l = "";
                if (l = e.layer.id ? e.layer.id : (l = e.geojson.name.replace(" ", "_")).toLowerCase(), s = e.geojson && !e.layer.name ? e.geojson.name : e.layer.name, I(e.render, l, "LineString"), e.options.noFactory) return a = {
                    className: "Feature",
                    id: l,
                    name: s,
                    visible: !1 !== e.layer.visible,
                    selectable: !1 !== e.layer.selectable,
                    Content: {
                        className: "Line",
                        geojson: e.geojson,
                        renderID: l || "",
                        Coordinate: {
                            className: "Coordinate",
                            position: e.layer.offset || [0, 0, 0],
                            projection: xCity.projection
                        }
                    }
                }, e.url && (delete a.Content.geojson, a.Content.url = e.url), d = xCity.add3DContent({
                    feature: a,
                    parentFolder: o
                }), o && (r.folderID = o.get("id")), r.layerID = d.get("id"), e.geojson && (r.geojson = e.geojson), void i({
                    widgetID: e.widgetID,
                    data: r
                });
                if (a = {
                        className: "Feature",
                        id: l,
                        name: s,
                        visible: !1 !== e.layer.visible,
                        selectable: !1 !== e.layer.selectable,
                        Content: {
                            className: "RdbLink",
                            levelMax: e.render.levelMax || 0,
                            levelMin: e.render.levelMin || 0,
                            cache: 0,
                            invertY: !1,
                            priority: e.render.priority || 100,
                            type: "json",
                            url: "",
                            renderID: l || "",
                            Factory: {
                                className: "Linestring",
                                stridAttribute: "STRID"
                            }
                        }
                    }, e.options.proxy) {
                    var g = new FormData;
                    g.append("action", "put"), g.append("id", l), g.append("data", JSON.stringify(e.geojson)), t.proxifiedRequest(e.options.proxy, {
                        method: "POST",
                        type: "json",
                        data: g,
                        onComplete: function(t) {
                            a.Content.url = e.options.proxy + "?action=get&id=" + l + "&sid=" + t.sid, d = xCity.add3DContent({
                                feature: a,
                                parentFolder: o
                            }), o && (r.folderID = o.get("id")), r.layerID = d.get("id"), r.geojson = e.geojson, i({
                                widgetID: e.widgetID,
                                data: r
                            })
                        },
                        onFailure: function(t) {
                            console.log("ERR", t), n({
                                widgetID: e.widgetID,
                                data: "AddLine: Unable to get respond from proxy service"
                            })
                        }
                    })
                } else a.Content.url = e.geojson ? p(e.geojson) : e.url, d = xCity.add3DContent({
                    feature: a,
                    parentFolder: o
                }), o && (r.folderID = o.get("id")), r.layerID = d.get("id"), e.geojson && (r.geojson = e.geojson), i({
                    widgetID: e.widgetID,
                    data: r
                })
            }
        },
        addPolygonV1: function(e, i, n) {
            console.log("function: 'addPolygon1'")
            if (c(e, n)) {
                var o, r = {};
                e.folder && (o = u(e.folder)), e.options || (e.options = {}), e.layer || (e.layer = {}), !e.geojson && e.json ? e.geojson = v(e.json) : !e.geojson && e.collection && (e.geojson = m(e.collection.coordinates, e.collection.properties, e.layer.name, e.collection.type)), e.url || !e.options.projection && !e.options.addTerrainHeight || (e.geojson = D(e.geojson, e.options.projection, e.options.addTerrainHeight));
                var a, s, d = "";
                if (d = e.layer.id ? e.layer.id : (d = e.geojson.name.replace(" ", "_")).toLowerCase(), e.geojson && !e.layer.name ? name = e.geojson.name : name = e.layer.name, I(e.render, e.layer.id, "Polygon"), e.options.noFactory) return a = {
                    className: "Feature",
                    id: d,
                    name: name,
                    visible: !1 !== e.layer.visible,
                    selectable: !1 !== e.layer.selectable,
                    Content: {
                        className: "Polygon",
                        geojson: e.geojson,
                        renderID: d || "",
                        Coordinate: {
                            className: "Coordinate",
                            position: e.layer.offset || [0, 0, 0],
                            projection: xCity.projection
                        }
                    }
                }, e.url && (delete a.Content.geojson, a.Content.url = e.url), s = xCity.add3DContent({
                    feature: a,
                    parentFolder: o
                }), o && (r.folderID = o.get("id")), r.layerID = s.get("id"), e.geojson && (r.geojson = e.geojson), void i({
                    widgetID: e.widgetID,
                    data: r
                });
                if (a = {
                        className: "Feature",
                        id: d,
                        name: name,
                        visible: !1 !== e.layer.visible,
                        selectable: !1 !== e.layer.selectable,
                        Content: {
                            className: "RdbLink",
                            levelMax: e.render.levelMax || 0,
                            levelMin: e.render.levelMin || 0,
                            cache: 0,
                            invertY: !1,
                            priority: e.render.priority || 100,
                            type: "json",
                            url: "",
                            renderID: d || "",
                            Factory: {
                                className: "Polygon",
                                stridAttribute: "STRID"
                            }
                        }
                    }, e.options.proxy) {
                    var l = new FormData;
                    l.append("action", "put"), l.append("id", d), l.append("data", JSON.stringify(e.geojson)), t.proxifiedRequest(e.options.proxy, {
                        method: "POST",
                        type: "json",
                        data: l,
                        onComplete: function(t) {
                            a.Content.url = e.options.proxy + "?action=get&id=" + d + "&sid=" + t.sid, s = xCity.add3DContent({
                                feature: a,
                                parentFolder: o
                            }), o && (r.folderID = o.get("id")), r.layerID = s.get("id"), r.geojson = e.geojson, i({
                                widgetID: e.widgetID,
                                data: r
                            })
                        },
                        onFailure: function(t) {
                            console.log("ERR", t), n({
                                widgetID: e.widgetID,
                                data: "AddPolygon: Unable to get respond from proxy service"
                            })
                        }
                    })
                } else a.Content.url = e.geojson ? p(e.geojson) : e.url, s = xCity.add3DContent({
                    feature: a,
                    parentFolder: o
                }), o && (r.folderID = o.get("id")), r.layerID = s.get("id"), e.geojson && (r.geojson = e.geojson), i({
                    widgetID: e.widgetID,
                    data: r
                })
            }
        },
        addAnnotation: function(e, t, i) {
            if (l(e, i)) {
                var n, o, r = {};
                e.folder && (n = u(e.folder)), e.layer || (e.layer = {}), (e.options.projection || e.options.addTerrainHeight) && (e.position = x(e.position, e.options.projection, e.options.addTerrainHeight)), o = xCity.add3DContent({
                    feature: {
                        className: "Feature",
                        id: e.layer.id || "",
                        name: e.layer.name || e.geojson.name,
                        description: e.layer.description || "",
                        visible: !1 !== e.layer.visible,
                        selectable: !1 !== e.layer.selectable,
                        Content: {
                            className: "Annotation",
                            position: e.position
                        }
                    },
                    parentFolder: n
                }), n && (r.folderID = n.get("id")), r.layerID = o.get("id"), t({
                    widgetID: e.widgetID,
                    data: r
                })
            }
        },
        addMarker: function(e, t, i) {
            if (l(e, i)) {
                var n, o, r = {};
                e.folder && (n = u(e.folder)), e.layer || (e.layer = {}), e.options || (e.options = {}), (e.options.projection || e.options.addTerrainHeight) && (e.position = x(e.position, e.options.projection, e.options.addTerrainHeight)), e.render && I(e.render, e.layer.id, "Marker"), o = xCity.add3DContent({
                    feature: {
                        className: "Feature",
                        name: e.layer.name,
                        id: e.layer.id,
                        visible: !1 !== e.layer.visible,
                        selectable: !1 !== e.layer.selectable,
                        description: e.layer.description || "",
                        Content: {
                            className: "Marker",
                            renderID: e.layer.id,
                            position: e.position
                        },
                        PointOfView: {
                            className: "PointOfView",
                            projection: xCity.projection,
                            position: e.position,
                            altitudeMode: "relative",
                            rotation: [0, 0, 0],
                            length: 500
                        }
                    },
                    parentFolder: n
                }), n && (r.folderID = n.get("id")), r.layerID = o.get("id"), t({
                    widgetID: e.widgetID,
                    data: r
                })
            }
        },
        loadRenderProfile: function(e, t, i) {
            var n = {
                profiles: [{
                    name: xCity.renderingProfile,
                    Rendering: e
                }]
            };
            xCity.loadRenderingProfiles(n, function(e) {
                e ? t(e) : i(e)
            })
        },
        toggleManipulator: function(e, t, i) {
            l(e, i) && (layer = xCity.findItem({
                id: e.id
            }), layer && xCity.enableRobot(e.toggle, layer))
        },
        datasetQuery: function(i, n, o) {
            l(i, o) && function(i, n) {
                i.options || (i.options = {});
                var o = {
                        template: "and",
                        content: [{
                            template: "uql",
                            content: ["city_feature_physicalid:" + (i.physicalID || i.documentID)]
                        }]
                    },
                    r = i.options.limit || 10,
                    a = e.ellQuery(o, r);
                i.options.page && (a += "&b=" + (i.options.page - 1)), t.authenticatedRequest(a, {
                    method: "GET",
                    type: "json",
                    onComplete: function(e) {
                        var t = {
                            widgetID: i.widgetID,
                            requestID: i.options.requestID || 0,
                            data: T(e, i.options.output)
                        };
                        n.resolve(t)
                    },
                    onFailure: function(e) {
                        n.reject({
                            widgetID: i.widgetID,
                            requestID: i.options.requestID || 0,
                            data: e
                        })
                    }
                })
            }(i, {
                resolve: n,
                reject: o
            })
        },
        doBufferQuery: function(i, n, o) {
            l(i, o) && function(i, n) {
                var o = {
                    intersects: "geodistance2d_intersects",
                    distance_contains: "geodistance2d_contains",
                    contains: "geocontains2d",
                    disjoint: "geodisjoint2d",
                    within: "geowithin2d",
                    touches: "geotouches2d",
                    crosses: "geocrosses2d",
                    overlaps: "geooverlaps2d",
                    equals: "geoequals2d"
                };
                if (i.type && o[i.type]) {
                    i.unit || (i.unit = "0"), i.geoType = function(e) {
                        var t = "";
                        switch (e.toUpperCase()) {
                            case "POINT":
                                t = "Point2D";
                                break;
                            case "MULTIPOINT":
                                t = "MultiPoint2D";
                                break;
                            case "LINESTRING":
                                t = "LineString2D";
                                break;
                            case "MULTILINESTRING":
                                t = "MultiLineString2D";
                                break;
                            case "POLYGON":
                                t = "Polygon2D";
                                break;
                            case "MULTIPOLYGON":
                                t = "MultiPolygon2D";
                                break;
                            case "POINTZ":
                                t = "Point3D";
                                break;
                            case "MULTIPOINTZ":
                                t = "MultiPoint3D";
                                break;
                            case "LINESTRINGZ":
                                t = "LineString3D";
                                break;
                            case "MULTILINESTRINGZ":
                                t = "MultiLineString3D";
                                break;
                            case "POLYGONZ":
                                t = "Polygon3D";
                                break;
                            case "MULTIPOLYGONZ":
                                t = "MultiPolygon3D";
                                break;
                            case "GEOMETRYCOLLECTION":
                                t = "GeometryCollection2D";
                                break;
                            case "GEOMETRYCOLLECTIONZ":
                                t = "GeometryCollection3D";
                                break;
                            default:
                                t = "Invalid"
                        }
                        return t
                    }(i.geoType), i.options || (i.options = {}), !i.geojson && i.json ? i.geojson = v(i.json) : !i.geojson && i.collection && (i.geojson = m(i.collection.coordinates, i.collection.properties, void 0, i.collection.type)), i.options && i.options.projection && i.geojson && (i.geojson = D(i.geojson, i.options.projection));
                    var r = "";
                    i.geojson && (r = "POINT" == i.geojson.features[0].geometry.type.toUpperCase() || "MULTIPOINT" == i.geojson.features[0].geometry.type.toUpperCase() ? function(e) {
                        var t = "";
                        if ("POINT" == e.features[0].geometry.type.toUpperCase()) {
                            t = e.features.length > 1 ? "MULTIPOINT(" : "POINT(";
                            for (var i = 0; i < e.features.length; i++) {
                                var n = e.features[i].geometry.coordinates;
                                t += 0 === i ? n[0] + " " + n[1] : "," + n[0] + " " + n[1]
                            }
                            t += ")"
                        } else if ("MULTIPOINT" == e.features[0].geometry.type.toUpperCase()) {
                            for (t = "MULTIPOINT(", i = 0; i < e.features.length; i++)
                                for (var o = e.features[i].geometry.coordinates, r = 0; r < o.length; r++) t += 0 === i && 0 === r ? o[r][0] + " " + o[r][1] : "," + o[r][0] + " " + o[r][1];
                            t += ")"
                        }
                        return t
                    }(i.geojson) : xCity.convertGeojsonToWKT(i.geojson));
                    var a = i.physicalID || i.documentID,
                        s = {
                            template: "and",
                            content: [{
                                template: o[i.type],
                                content: [void 0, r, i.unit.toString()],
                                name: "spatialdist",
                                meta: {
                                    distance: "distanceMin"
                                },
                                sort: {
                                    "distsort.expr": "distanceMin"
                                }
                            }, {
                                template: "uql",
                                content: ["city_feature_physicalid:" + a, "city_feature_geometrytype:" + i.geoType]
                            }]
                        },
                        d = e.ellQuery(s, i.options.limit || 10);
                    i.options.page && (d += "&b=" + (i.options.page - 1)), t.authenticatedRequest(d, {
                        method: "GET",
                        type: "json",
                        onComplete: function(e) {
                            var t = {
                                widgetID: i.widgetID,
                                requestID: i.options.requestID || 0,
                                data: T(e, i.options.output)
                            };
                            n.resolve(t)
                        },
                        onFailure: function(e) {
                            n.reject({
                                widgetID: i.widgetID,
                                data: e
                            })
                        }
                    })
                } else n.reject({
                    widgetID: i.widgetID,
                    data: "Invalid input"
                })
            }(i, {
                resolve: n,
                reject: o
            })
        },
        searchText: function(i, n, o) {
            l(i, o) && function(i, n) {
                i.options || (i.options = {});
                var o = i.physicalID || i.documentID,
                    r = {
                        template: "and",
                        content: [{
                            template: "uql",
                            content: [i.text + " AND city_feature_physicalid:" + o]
                        }]
                    },
                    a = i.options.limit || 10;
                url = e.ellQuery(r, a), i.options.page && (url += "&b=" + (i.options.page - 1)), t.authenticatedRequest(url, {
                    method: "GET",
                    type: "json",
                    onComplete: function(e) {
                        var t = {
                            widgetID: i.widgetID,
                            requestID: i.options.requestID || 0,
                            data: T(e, i.options.output)
                        };
                        n.resolve(t)
                    },
                    onFailure: function(e) {
                        n.reject({
                            widgetID: i.widgetID,
                            data: e
                        })
                    }
                })
            }(i, {
                resolve: n,
                reject: o
            })
        },
        doProjection: function(e, t, i) {
            l(e, i) && (e.geojson ? e.geojson = D(e.geojson, e.projection, e.addTerrainHeight) : e.collection ? e.collection.coordinates = x(e.collection.coordinates, e.projection, e.addTerrainHeight) : e.json && (e.json = w(e.json, e.projection, e.addTerrainHeight)), t({
                widgetID: e.widgetID,
                data: e.geojson || e.collection || e.json
            }))
        },
        getTerrainHeight: function(e, t, i) {
            l(e, i) && (e.geojson ? e.geojson = D(e.geojson, e.projection, !0) : e.collection ? e.collection.coordinates = x(e.collection.coordinates, e.projection, !0) : e.json && (e.json = w(e.json, e.projection, !0)), t({
                widgetID: e.widgetID,
                data: e.geojson || e.collection || e.json
            }))
        },
        updatePOIContent: function(e, i, n) {
            if (l(e, n)) {
                var o = JSON.stringify(e.geojson);
                if (e.options || (e.options = {}), e.options.proxy) {
                    var r = new FormData;
                    r.append("action", "put"), r.append("id", e.layerID), r.append("data", o), t.proxifiedRequest(e.options.proxy, {
                        method: "POST",
                        type: "json",
                        data: r,
                        onComplete: function(t) {
                            var n = xCity.findItem({
                                id: e.layerID
                            });
                            n.set("url", e.options.proxy + "?action=get&sid=" + t.sid + "&id=" + e.layerID), i({
                                widgetID: e.widgetID,
                                data: n.get("url")
                            })
                        },
                        onFailure: function(t) {
                            n({
                                widgetID: e.widgetID,
                                data: t
                            })
                        }
                    })
                } else {
                    var a = xCity.findItem({
                            id: e.layerID
                        }),
                        s = p(e.geojson);
                    a.set("url", s), i({
                        widgetID: e.widgetID,
                        data: a.get("url")
                    })
                }
            }
        },
        updatePOIPosition: function(e, t, i) {
            if (l(e, i))
                if (e.layerID) {
                    var n = xCity.findItem({
                        id: e.layerID
                    });
                    n || i({
                        widgetID: e.widgetID,
                        data: "No layer with such id found"
                    }), n.updatePosition(function(e) {
                        console.log("featureID", e);
                        return {
                            position: [0, 0, 0],
                            orientation: 0
                        }
                    })
                } else i({
                    widgetID: e.widgetID,
                    data: "No layer id"
                })
        },
        add3DPOI: function(e, i, n) {
            if (e.geojson || e.json || e.collection) this.addPOIV1(e, i, n);
            else if (e.widget_id)
                if (xCity.findItem({
                        id: e.id
                    })) n({
                    widget_id: e.widget_id,
                    status: !1,
                    reason: e.id + " already exists"
                });
                else {
                    if (e.options || (e.options = {}), e.options.externalCSS) {
                        var o = widget.body.getWindow().frameElement.contentDocument,
                            r = o.head;
                        if (!r.querySelector("#" + e.options.externalCSS.id)) {
                            var a = o.createElement("link");
                            a.rel = "stylesheet", a.href = e.options.externalCSS.url, a.id = e.options.externalCSS.id, r.appendChild(a)
                        }
                    }
                    xCity._urbanImpl.USR.hwInstancing = !e.options.disableHwInstancing;
                    var s = void 0,
                        d = void 0;
                    if (e.folder && e.folder.id && (s = xCity.findItem({
                            id: e.folder.id
                        }), d = xCity.findItem({
                            id: e.folder.parent_id
                        }), !s)) {
                        var l = {
                            id: e.folder.id
                        };
                        e.folder.name && (l.name = e.folder.name), s = xCity.addFolder(l, d)
                    }
                    for (var c = [], u = 0; u < e.positions.length; u++) {
                        var p, g, y = e.positions[u],
                            f = Array.isArray(e.name) ? e.name[u] : e.name + " " + u;
                        e.options.convertCoordinate && (y = xCity.doProjection([y.x, y.y], !1, {
                            input: e.options.convertCoordinate.from,
                            output: e.options.convertCoordinate.to
                        })), g = e.options.placeOnGround ? xCity.getGroundHeight([y.x, y.y, 0]) : e.positions[u].z || 0, p = e.options.useUserDataId ? e.userData[u].id : e.id + "_" + u;
                        var m = {
                                type: "Point",
                                coordinates: [y.x, y.y, g]
                            },
                            v = {
                                NAME: f,
                                ALTITUDE: g,
                                STRID: p,
                                STYLECLASS: e.options.styleClass,
                                COLORG: 10
                            },
                            b = {};
                        for (var h in b.geometry = m, b.type = "Feature", b.properties = v, e.userData[u]) b.properties[h] = e.userData[u][h];
                        c.push(b)
                    }
                    if (e.options.useRenderProfile) {
                        var I = {
                            profiles: [{
                                name: xCity.renderingProfile,
                                Rendering: [{
                                    Ids: [e.id],
                                    Material: {
                                        color: e.options.color || "rgb(0,255,0)",
                                        opacity: e.options.opacity || 1,
                                        alphaTest: 0
                                    }
                                }]
                            }]
                        };
                        xCity.loadRenderingProfiles(I)
                    }
                    var C = {
                            type: "FeatureCollection",
                            features: c
                        },
                        x = JSON.stringify(C),
                        w = new FormData;
                    if (w.append("action", "put"), w.append("id", e.id + "_url"), w.append("data", x), this.testcase) this.add3DContent.bind(this, e, s, x, i, n)(JSON.parse(e.response));
                    else t.proxifiedRequest(e.options.proxy.url, {
                        method: "POST",
                        type: "json",
                        data: w,
                        onComplete: this.add3DContent.bind(this, e, s, x, i, n),
                        onFailure: function(t) {
                            console.log("ERR", t), n({
                                widget_id: e.widget_id,
                                data: "Add3DPOI: Unable to get respond from external service"
                            })
                        }
                    })
                } else console.warn("Add3DPOI: Please provide widget id")
        },
        add3DContent: function(e, t, i, n, o, r) {
            console.log("function 'add3DContent'");
            if (e.options.shapeType && !e.options.nbVertices) switch (e.options.shapeType) {
                case "disc":
                    e.options.nbVertices = 300;
                    break;
                case "square":
                    e.options.shapeType = "disc", e.options.nbVertices = 4;
                    break;
                case "triangle":
                    e.options.shapeType = "disc", e.options.nbVertices = 3;
                    break;
                case "tube":
                    e.options.shapeType = "tube", e.options.nbVertices = 300;
                    break;
                case "cube":
                    e.options.shapeType = "tube", e.options.nbVertices = 4;
                    break;
                case "pyramid":
                    e.options.shapeType = "pyramid";
                    break;
                case "billboard":
                    e.options.shapeType = "billboard";
                    break;
                default:
                    e.options.shapeType = "sphere", e.options.nbVertices = 30
            }
            var a = "",
                s = 0;
            for (var d in e.options.proxy.queryString) {
                e.options.proxy.queryString[d];
                switch (a += s ? "&" : "?", d) {
                    case "action":
                        a += "action=get";
                        break;
                    case "id":
                        a += "id=" + e.id + "_url";
                        break;
                    case "sid":
                        a += "sid=" + r.sid
                }
                s++
            }
            var l = {
                className: "Feature",
                id: e.id,
                name: e.name || e.id + " Point",
                visible: !e.options.not_visible,
                selectable: !e.options.not_selectable,
                Content: {
                    className: "RdbLink",
                    id: e.id + "_Marker_Link",
                    levelMax: e.options.levelMax || 0,
                    levelMin: e.options.levelMin || 0,
                    cache: 0,
                    invertY: !1,
                    priority: 100,
                    type: "json",
                    lodBias: 0,
                    url: this.testcase ? "https://sgp-server2015x.uwglobe.com/widget/assets/json/sample-poi.geojson" : e.options.proxy.url + a,
                    Factory: {
                        className: "PointOfInterest3D",
                        geometryMode: e.options.geometryMode || "mesh",
                        shapeType: e.options.shapeType || "sphere",
                        renderType: e.options.renderType || "icon",
                        renderMode: e.options.renderMode || "dual",
                        opacityFactor: e.options.opacity || 1,
                        scale: e.options.scale || 10,
                        switchDistance: e.options.switchDistance || 0,
                        nbVertices: e.options.nbVertices || 17,
                        colorGradient: e.options.colorGradient || {
                            attribute: "COLORG",
                            start: {
                                value: 1,
                                color: [0, 255, 255, 255]
                            },
                            mid: {
                                value: 4,
                                color: [0, 150, 150, 255]
                            },
                            end: {
                                value: 18,
                                color: [0, 50, 50, 255]
                            }
                        }
                    }
                }
            };
            e.options.color && (l.Content.Factory.color = e.options.color), e.options.useRenderProfile && (l.Content.renderID = e.id), "billboard" == e.options.shapeType && "icon" == e.options.renderType && delete l.Content.Factory.colorGradient;
            var c = xCity.add3DContent({
                    feature: l,
                    parentFolder: t
                }),
                u = {
                    layer_id: c.get("id"),
                    sid: r.sid
                };
            t && (u.folder_id = t.get("id")), this.testcase ? n({
                widget_id: e.widget_id,
                data: u,
                poi: c
            }) : n({
                widget_id: e.widget_id,
                data: u
            })
        },
        addLine: function(e, t, i) {
            if (e.geojson || e.json || e.collection) this.addLineV1(e, t, i);
            else {
                if (!e.widget_id) return console.warn("AddLine: Please provide widget id"), void i({
                    widget_id: e.widget_id,
                    data: "AddLine: Please provide widget id"
                });
                if (!xCity.findItem({
                        id: e.id
                    })) {
                    if (!e.id || !e.positions) return console.warn("AddLine: Invalid input"), void i({
                        widget_id: e.widget_id,
                        data: "AddLine: Invalid input"
                    });
                    var n, o;
                    if (e.folder || (e.folder = {}), e.options || (e.options = {}), e.folder.id && (n = xCity.findItem({
                            id: e.folder.id
                        }), o = xCity.findItem({
                            id: e.folder.parent_id
                        }), !n)) {
                        var r = {
                            id: e.folder.id
                        };
                        e.folder.name && (r.name = e.folder.name), n = xCity.addFolder(r, o)
                    }
                    if (e.options.convertCoordinate || e.options.placeOnGround)
                        for (var a = 0; a < e.positions.length; a++) {
                            var s = e.positions[a];
                            if (e.options.convertCoordinate) {
                                var d = xCity.doProjection(s, !1, {
                                    input: e.options.convertCoordinate.from || xCity.projection,
                                    output: e.options.convertCoordinate.to || xCity.projection
                                });
                                e.positions[a] = [d.x, d.y]
                            }
                            if (e.options.placeOnGround) {
                                var l = xCity.getGroundHeight({
                                    x: e.positions[a][0],
                                    y: e.positions[a][1]
                                });
                                e.positions[a].push(l + 2)
                            }
                        }
                    var c = [{
                        geometry: {
                            type: "LineString",
                            coordinates: e.positions
                        },
                        type: "Feature",
                        properties: {
                            NAME: e.name,
                            STRID: e.id
                        }
                    }];
                    if (null != e.userData) {
                        var u = Object.keys(e.userData);
                        for (a = 0; a < u.length; a++) c[0].properties[u[a]] = e.userData[u[a]]
                    }
                    var p = {
                            type: "FeatureCollection",
                            features: c
                        },
                        g = xCity.add3DContent({
                            feature: {
                                className: "Feature",
                                id: e.id,
                                name: e.name || e.id + " Line",
                                visible: !e.options.not_visible,
                                selectable: !e.options.not_selectable,
                                userData: e.userData,
                                Content: {
                                    className: "Line",
                                    geojson: p,
                                    renderID: e.id || "",
                                    Coordinate: {
                                        className: "Coordinate",
                                        position: e.options.offset || [0, 0, 0],
                                        projection: xCity.projection
                                    }
                                }
                            },
                            parentFolder: n
                        }),
                        y = {
                            line: g.get("id")
                        };
                    n && (y.folder_id = n.get("id")), t({
                        widget_id: e.widget_id,
                        data: y
                    });
                    var f = {
                        profiles: [{
                            name: xCity.renderingProfile,
                            Rendering: [{
                                Ids: [e.id],
                                Material: {
                                    color: e.options.color,
                                    map: null,
                                    minWidth: e.options.minWidth || 2,
                                    minDist: e.options.minDist || 100,
                                    maxDist: e.options.maxDist || 1e5,
                                    lineWidth: e.options.lineWidth || 4,
                                    renderMode: e.options.renderMode || "dual"
                                }
                            }]
                        }]
                    };
                    return xCity.loadRenderingProfiles(f), {
                        data: y,
                        line: g
                    }
                }
                i({
                    widget_id: e.widget_id,
                    status: !1,
                    reason: e.id + " already exists"
                })
            }
        },
        addPolygon: function(e, t, i) {
            console.log("function 'addPolygon'");
            if (e.geojson || e.json || e.collection) this.addPolygonV1(e, t, i);
            else {
                if (!e.widget_id) return console.warn("AddPolygon: Please provide widget id"), void i({
                    widget_id: e.widget_id,
                    data: "AddPolygon: Please provide widget id"
                });
                if (!xCity.findItem({
                        id: e.id
                    })) {
                    if (!e.id || !e.positions) return console.warn("AddPolygon: Invalid input"), void i({
                        widget_id: e.widget_id,
                        data: "AddPolygon: Invalid input"
                    });
                    var n, o;
                    if (e.folder || (e.folder = {}), e.options || (e.options = {}), e.folder.id && (n = xCity.findItem({
                            id: e.folder.id
                        }), o = xCity.findItem({
                            id: e.folder.parent_id
                        }), !n)) {
                        var r = {
                            id: e.folder.id
                        };
                        e.folder.name && (r.name = e.folder.name), n = xCity.addFolder(r, o)
                    }
                    if (e.options.convertCoordinate || e.options.placeOnGround)
                        for (var a = 0; a < e.positions.length; a++)
                            for (var s = 0; s < e.positions[a].length; s++) {
                                var d = e.positions[a][s];
                                if (e.options.convertCoordinate) {
                                    var l = xCity.doProjection(d, !1, {
                                        input: e.options.convertCoordinate.from,
                                        output: e.options.convertCoordinate.to
                                    });
                                    e.positions[a][s] = [l.x, l.y]
                                }
                                if (e.options.placeOnGround) {
                                    var c = xCity.getGroundHeight(e.positions[a][s]);
                                    e.positions[a][s].push(c)
                                }
                            }
                    var u = [{
                        geometry: {
                            type: "Polygon",
                            coordinates: e.positions
                        },
                        type: "Feature",
                        properties: {
                            NAME: e.name,
                            STRID: e.id
                        }
                    }];
                    if (null != e.userData) {
                        var p = Object.keys(e.userData);
                        for (s = 0; s < p.length; s++) u[0].properties[p[s]] = e.userData[p[s]]
                    }
                    var g = {
                            type: "FeatureCollection",
                            features: u
                        },
                        y = {
                            profiles: [{
                                name: xCity.renderingProfile,
                                Rendering: [{
                                    Ids: [e.id],
                                    Material: {
                                        color: e.options.color || "red",
                                        extrusionHeight: e.options.extrusionHeight || 100,
                                        opacity: e.options.opacity || 1,
                                        geometricMode: e.options.geometricMode || "filled",
                                        renderMode: e.options.renderMode || "dual"
                                    }
                                }]
                            }]
                        };
                    e.options.extrusionHeight || delete y.profiles[0].Rendering[0].Material.extrusionHeight, xCity.loadRenderingProfiles(y);
                    var f = xCity.add3DContent({
                            feature: {
                                className: "Feature",
                                id: e.id,
                                name: e.name || e.id + " Polygon",
                                visible: !e.options.not_visible,
                                selectable: !e.options.not_selectable,
                                userData: e.userData,
                                Content: {
                                    className: "Polygon",
                                    geojson: g,
                                    renderID: e.id || "",
                                    Coordinate: {
                                        className: "Coordinate",
                                        position: e.options.offset || [0, 0, 0],
                                        projection: xCity.projection
                                    }
                                }
                            },
                            parentFolder: n
                        }),
                        m = {
                            polygon: f.get("id")
                        };
                    console.log("test_5, ", e);
                    return n && (m.folder_id = n.get("id")), t({
                        widget_id: e.widget_id,
                        data: m
                    }), {
                        data: m,
                        polygon: f
                    }
                }
                i({
                    widget_id: e.widget_id,
                    status: !1,
                    reason: e.id + " already exists"
                })
            }
        },
        add3DShape: function(e, t, n) {
            console.log("add3DShape");
            for (var o = new i.Core.Shape, r = 0; r < e.polygon.length; r++) {
                var a = e.polygon[r];
                0 === r ? o.moveTo(a.x, a.y) : o.lineTo(a.x, a.y)
            }
            var s = {
                    amount: e.options.extrude || 1e3,
                    bevelThickness: 2,
                    bevelSize: .5,
                    bevelSegments: 3,
                    bevelEnabled: !0,
                    curveSegments: 12,
                    steps: 1
                },
                d = new i.Core.ExtrudeGeometry(o, s),
                l = new i.Core.Mesh(d, new i.Core.MeshPhongMaterial({
                    color: e.options.color || 16711680,
                    transparent: !0,
                    opacity: e.options.opacity || 1,
                    specular: e.options.color || 16711680,
                    shininess: 100,
                    emissive: e.options.color || 16711680,
                    emissiveIntensity: 1,
                    lightMapIntensity: 1,
                    aoMapIntensity: 1,
                    shading: i.Core.SmoothShading
                })),
                c = this.SceneGraphFactory.createNodeFromTHREEMesh(l);
            c.setSSAO(!1), c.setShadow(!1, !1);
            var u = (new i.Core.Matrix4).makeTranslation(e.position.x, e.position.y, e.position.z);
            c.applyMatrix(u), xCity._urbanImpl.USR._rootProjScaledShifted.add(c), t({
                widget_id: e.widget_id,
                id: e.id,
                title: e.title,
                name: e.name
            }), shapeList.push({
                id: e.id,
                title: e.title,
                name: e.name,
                shape: c
            })
        },
        toggle3DShape: function(e, t, i) {
            if (console.log("toggle3DShape", e), e.widget_id) {
                for (var n = -1, o = 0; o < shapeList.length; o++) {
                    var r = shapeList[o];
                    if (e.id == r.id) {
                        n = o, console.log("Object", r.shape), r.shape.isVisible() ? r.shape.setVisibility(!1) : r.shape.setVisibility(!0);
                        break
                    }
                }
                n > -1 && t({
                    widget_id: e.widget_id,
                    id: e.id
                })
            } else console.warn("toggle3DShape: Please provide widget id")
        },
        remove3DShape: function(e, t, i) {
            if (console.log("remove3DShape", e), e.widget_id) {
                for (var n = -1, o = 0; o < shapeList.length; o++)
                    if (e.id == shapeList[o].id) {
                        xCity._urbanImpl.USR._rootProjScaledShifted.remove(shapeList[o].shape), n = o;
                        break
                    }
                n > -1 && (shapeList.splice(n, 1), t({
                    widget_id: e.widget_id,
                    id: e.id
                }))
            } else console.warn("remove3DShape: Please provide widget id")
        },
        loadDaeModel: function(e, i, n) {
            console.log("loadDaeModel"), t.proxifiedRequest(e, {
                method: "GET",
                type: "json",
                onComplete: this.processLoadDaeModel.bind(this),
                onFailure: n({
                    data: "loadDaeModel: Unable to get respond from external service"
                })
            })
        },
        processLoadDaeModel: function(e) {
            xCity._urbanImpl.getLayerRoot().loadJSONFile(JSON.stringify(e)), this.loadDaeRenderProfile()
        },
        loadDaeRenderProfile: function() {
            var e = {
                profiles: [{
                    name: xCity.renderingProfile,
                    Rendering: [{
                        Ids: ["red"],
                        Material: {
                            color: "#ff0000",
                            specular: "#ff0000",
                            opacity: .8,
                            map: null,
                            side: 2,
                            refractionRatio: 0
                        }
                    }]
                }]
            };
            xCity.loadRenderingProfiles(e)
        },
        update3DPOIContent: function(e, i, n) {
            if (e.geojson || e.json || e.collection) this.updatePOIContent(e, i, n);
            else if (e.widget_id) {
                e.options || (e.options = {});
                for (var o = [], r = 0; r < e.positions.length; r++) {
                    var a = e.positions[r],
                        s = Array.isArray(e.name) ? e.name[r] : e.name + " " + r,
                        d = {
                            geometry: {
                                type: "Point",
                                coordinates: [a.x, a.y]
                            },
                            type: "Feature",
                            properties: {
                                NAME: s,
                                ALTITUDE: a.z,
                                STRID: e.options.useUserDataId ? e.userData[r].id : e.id + "_" + r,
                                STYLECLASS: e.options.styleClass,
                                COLORG: 10
                            }
                        };
                    for (var l in e.userData[r]) d.properties[l] = e.userData[r][l];
                    o.push(d)
                }
                var c = {
                        type: "FeatureCollection",
                        features: o
                    },
                    u = JSON.stringify(c),
                    p = new FormData;
                p.append("action", "put"), p.append("id", e.id + "_url"), p.append("data", u), e.options.proxy.sid && p.append("sid", e.options.proxy.sid), t.proxifiedRequest(e.options.proxy.url, {
                    method: "POST",
                    type: "json",
                    data: p,
                    onComplete: function(t) {
                        var n = xCity.findItem({
                                id: e.id
                            }),
                            o = n.get("url"); - 1 == o.indexOf("&sid=") ? o += "&sid=" + t.sid : o = o.replace(/(sid=)[^\&]+/, "$1" + t.sid), -1 == o.indexOf("&t=") ? o += "&t=" + Date.now() : o = o.replace(/(t=)[^\&]+/, "$1" + Date.now()), n.set("url", o), i({
                            widget_id: e.widget_id,
                            data: n.get("url")
                        })
                    },
                    onFailure: n({
                        widget_id: e.widget_id,
                        data: "Update3DPOIContent: Unable to get respond from external service"
                    })
                })
            } else console.warn("update3DPOIContent: Please provide widget id")
        },
        update3DPOIsPosition: function(e, t, i) {
            if (e.geojson || e.json || e.collection) this.updatePOIPosition(e, t, i);
            else if (e.widget_id)
                if (e.layer_id) {
                    var n = xCity.findItem({
                        id: e.layer_id
                    });
                    n || i({
                        widget_id: e.widget_id,
                        data: "No layer with such id found"
                    }), e.options || (e.options = {}), 1 == e.options.updateAll ? n.updatePosition(function(t) {
                        var i = e.dataset;
                        return {
                            position: [i.position.x, i.position.y, i.position.z],
                            orientation: i.orientation
                        }
                    }) : e.options.prefix_to_match ? n.updatePosition(function(t) {
                        var i = t.replace(e.options.prefix_to_match, ""),
                            n = e.dataset[i],
                            o = {};
                        return n.position && (o.position = [n.position.x, n.position.y, n.position.z]), n.orientation ? o.orientation = n.orientation : o.orientation = 0, o
                    }) : n.updatePosition(function(t) {
                        var i = t.split("_"),
                            n = parseInt(i[i.length - 1], 10),
                            o = e.dataset[n],
                            r = {};
                        return null == o ? r : (o.position && (r.position = [o.position.x, o.position.y, o.position.z]), o.orientation ? r.orientation = o.orientation : r.orientation = 0, r)
                    })
                } else i({
                    widget_id: e.widget_id,
                    data: "No layer id"
                });
            else i({
                widget_id: e.widget_id,
                data: "No widget id"
            })
        },
        selectObject: function(e, t, i) {
            if (e.widget_id) {
                var n, o, r = xCity.findItem({
                    id: e.primitive_id
                });
                if (r || e.layer_id)
                    if (r || (r = xCity.findItem({
                            id: e.layer_id + "_" + e.primitive_id
                        })), r || ((n = xCity.findItem({
                            id: e.layer_id
                        })).get("name"), e.folder_id && ((o = xCity.findItem({
                            id: e.folder_id
                        })) || (o = xCity.addFolder({
                            id: e.folder_id
                        }))), r = n.createPrimitive(e.primitive_id, o))) {
                        if (e.exclusive)
                            for (var a = 0; a < xCity.selectedItems.length; a++) e.primitive_id != xCity.selectedItems[a].get("id") && xCity.selectedItems[a].set("selected", !1);
                        e.unselect ? r.set("selected", !1) : r.set("selected", !0);
                        var s = {
                            primitive_id: e.primitive_id,
                            feature_id: r.get("id"),
                            selected: r.get("selected")
                        };
                        o && (s.folder_id = e.folder_id), n && (s.layer_id = e.layer_id), t({
                            widget_id: e.widget_id,
                            data: s
                        })
                    } else i({
                        widget_id: e.widget_id,
                        data: "Unable to find primitive or primitive not loaded"
                    });
                else i({
                    widget_id: e.widget_id,
                    data: "Unable to find primitive and no layer_id specified"
                })
            } else i({
                widget_id: e.widget_id,
                data: "No widget id"
            })
        },
        toggleObject: function(e) {
            var t = xCity.findItem({
                id: e.object_id
            });
            t && (t.get("visible") ? t.set("visible", !1) : t.set("visible", !0));
            return t
        },
        getWorldClickNormal: function(e, t, n) {
            if (e.widget_id) {
                var o, r, a = xCity._urbanImpl.getView3D().getControl().zoomMouse,
                    s = xCity._urbanImpl.USR.webGLV6Viewer,
                    d = xCity._urbanImpl.USR.webGLV6Viewer.canvas.getBoundingClientRect(),
                    l = a.clone().sub(new i.Vector2(Math.floor(d.left), Math.floor(d.top)));
                return o = s.getMousePosition(l), r = xCity._urbanImpl.USR.webGLV6Viewer.pick(o, "mesh", !0), t({
                    widget_id: e.widget_id,
                    data: r.normal
                }), r.normal
            }
            n({
                widget_id: e.widget_id,
                data: "No widget id"
            })
        },
        getGroundHeight: function(e, t, i) {
            if (e.geojson || e.json || e.collection) this.getTerrainHeight(e, t, i);
            else {
                if (e.widget_id) {
                    var n;
                    if (e.options || (e.options = {}), Array.isArray(e.coordinates)) {
                        if (e.options.convertCoordinate)
                            for (var o = 0; o < e.coordinates.length; o++) {
                                var r = xCity.doProjection(e.coordinates[o], !1, {
                                    input: e.options.convertCoordinate.projection,
                                    output: xCity.projection
                                });
                                e.coordinates[o] = [r.x, r.y]
                            }
                        n = [];
                        for (o = 0; o < e.coordinates.length; o++) {
                            var a = {
                                x: e.coordinates[o][0],
                                y: e.coordinates[o][1]
                            };
                            n.push(xCity.getGroundHeight(a))
                        }
                    } else {
                        if (null === e.coordinates || "object" != typeof e.coordinates) return n = "Invalid input format", void i({
                            widget_id: e.widget_id,
                            data: n
                        });
                        e.options.convertCoordinate && (e.coordinates = xCity.doProjection([e.coordinates.x, e.coordinates.y], !1, {
                            input: e.options.convertCoordinate.projection,
                            output: xCity.projection
                        })), n = xCity.getGroundHeight(e.coordinates)
                    }
                    return t({
                        widget_id: e.widget_id,
                        data: n
                    }), n
                }
                i({
                    widget_id: e.widget_id,
                    data: "No widget id"
                })
            }
        },
        convertCoordinates: function(e, t, i) {
            if (e.geojson || e.json || e.collection) this.doProjection(e, t, i);
            else {
                if (e.widget_id) {
                    var n;
                    if (Array.isArray(e.coordinates)) {
                        if (n = [], e.coordinates.length)
                            if (e.coordinates[0].lat)
                                for (var o = 0; o < e.coordinates.length; o++) n.push(xCity.doProjection([e.coordinates[o].lon, e.coordinates[o].lat], !1, {
                                    input: e.project_from || xCity.projection,
                                    output: e.project_to || xCity.projection
                                }));
                            else
                                for (o = 0; o < e.coordinates.length; o++) console.log("project", xCity.doProjection), console.log("project", xCity.doProjection(e.coordinates[o], !1, {
                                    input: e.project_from || xCity.projection,
                                    output: e.project_to || xCity.projection
                                })), n.push(xCity.doProjection(e.coordinates[o], !1, {
                                    input: e.project_from || xCity.projection,
                                    output: e.project_to || xCity.projection
                                }))
                    } else {
                        if (null === e || "object" != typeof e) return n = "Invalid input format", void i({
                            widget_id: e.widget_id,
                            data: n
                        });
                        n = xCity.doProjection([e.coordinates.x, e.coordinates.y], !1, {
                            input: e.project_from || xCity.projection,
                            output: e.project_to || xCity.projection
                        })
                    }
                    return t({
                        widget_id: e.widget_id,
                        data: n
                    }), n
                }
                i({
                    widget_id: e.widget_id,
                    data: "No widget id"
                })
            }
        },
        getReverseGeoCoding: function(t, i, n) {
            t.widget_id ? e.getReverseGeoCoding(t.position, i, n) : n({
                widget_id: t.widget_id,
                data: "No widget id"
            })
        },
        populate3DPOISet: function(e, t, i) {
            c(e, i) && (e.json ? e.geojson = v(e.json) : e.collection && (e.geojson = m(e.collection.coordinates, e.collection.properties, e.layer.name, e.collection.type)), (e.options.projection || e.options.addTerrainHeight) && (e.geojson = D(e.geojson, e.options.projection, e.options.addTerrainHeight)), s[e.layer.id] ? s[e.layer.id].features = s[e.layer.id].features.concat(e.geojson.features) : s[e.layer.id] = e.geojson, t && t({
                widgetID: e.widgetID,
                data: {
                    layerID: e.layerId
                },
                status: !0
            }))
        },
        add3DPOISet: function(e, t, i) {
            var n, o = {};
            e.options || (e.options = {}), e.layer || (e.layer = {});
            var r = "";
            switch (r = e.layer.id || e.url ? e.layer.id : (r = e.geojson.name.replace(" ", "_")).toLowerCase(), C(e.options.css), I(e.render, r, "Point"), e.folder && (n = u(e.folder)), e.layer.attributeMapping || (e.layer.attributeMapping = {}), e.render.shape) {
                case "disc":
                    e.render.vertice = 300;
                    break;
                case "square":
                    e.render.shape = "disc", e.render.vertice = 4;
                    break;
                case "triangle":
                    e.render.shape = "disc", e.render.vertice = 3;
                    break;
                case "tube":
                    e.render.shape = "tube", e.render.vertice = 300;
                    break;
                case "cube":
                    e.render.shape = "tube", e.render.vertice = 4;
                    break;
                case "pyramid":
                    e.render.shape = "pyramid", e.render.vertice = 3;
                    break;
                case "billboard":
                    e.render.shape = "billboard", e.render.vertice = 4;
                    break;
                default:
                    e.render.shape = "sphere", e.render.vertice = 30
            }
            var a, d = {
                id: r,
                name: e.geojson && !e.layer.name ? e.geojson.name || "" : e.layer.name || "",
                visible: !1 !== e.layer.visible,
                selectable: !1 !== e.layer.selectable,
                Content: {
                    className: "PointOfInterest3DSet",
                    levelMax: e.render.levelMax || 0,
                    levelMin: e.render.levelMin || 0,
                    priority: e.render.priority || 100,
                    type: "json",
                    shapeType: e.render.shape || "sphere",
                    renderType: e.render.type || "icon",
                    renderMode: e.render.mode || "dual",
                    anchorLineWidth: e.render.anchorWidth || 2,
                    switchDistance: e.render.switchDistance || 0,
                    nbVertices: e.render.vertice || 17,
                    nameAttribute: e.layer.attributeMapping.NAME || "NAME",
                    stridAttribute: e.layer.attributeMapping.STRID || "STRID",
                    styleClassAttribute: e.layer.attributeMapping.STYLECLASS || "STYLECLASS",
                    altitudeAttribute: e.layer.attributeMapping.ALTITUDE || "ALTITUDE",
                    Clustering: {
                        enable: !1 !== e.render.clustering
                    }
                }
            };
            e.render.anchor || delete d.Content.anchorLineWidth, e.url ? d.Content.url = e.url : e.geojson || e.collection || e.json ? (this.populate3DPOISet(e), d.Content.geojson = JSON.stringify(s[e.layer.id])) : d.Content.geojson = JSON.stringify(s[e.layer.id]), a = xCity.add3DContent({
                feature: d,
                parentFolder: n
            }), n && (o.folderID = n.get("id")), o.layerID = a.get("id"), s[e.layer.id] = void 0, t({
                widgetID: e.widgetID,
                data: o,
                status: !0
            })
        }
    }, null === n && (n = new d), n
}), define("DS/xCityAppsOpenness/Settings", [], function() {
    "use strict";
    var e = {
            none: "none",
            pair: "pair",
            tab: "tab",
            dashboard: "dashboard"
        },
        t = [{
            label: "None",
            value: e.none
        }, {
            label: "From paired widget only",
            value: e.pair
        }, {
            label: "From widgets on the same tab",
            value: e.tab
        }, {
            label: "From all dashboard widgets",
            value: e.dashboard
        }],
        i = {
            internal: -2,
            generic: -1,
            basic: 0,
            location: 1,
            selection: 2,
            loadtemporary: 3,
            create: 4,
            full: 5
        },
        n = [{
            label: "Basic",
            value: i.basic
        }, {
            label: "Location",
            value: i.location
        }, {
            label: "Selection",
            value: i.selection
        }, {
            label: "Load temporary",
            value: i.loadtemporary
        }, {
            label: "Create",
            value: i.create
        }, {
            label: "Full",
            value: i.full
        }];
    return {
        getAPIPrefix: function() {
            return "xCity."
        },
        getPublishEventDefault: function() {
            return !0
        },
        getSubscribeLevels: function() {
            return e
        },
        getSubscribeEventOptions: function() {
            return t
        },
        getAccessLevels: function() {
            return i
        },
        getAccessLevelOptions: function() {
            return n
        }
    }
}), define("DS/xCityAppsOpenness/PublicAPIDataviz", [], function() {
    var e = {
            layer: void 0,
            previousRenderId: void 0,
            playbackAttributes: [],
            playbackRenderIds: [],
            playbackTimer: void 0,
            playbackIndex: 0,
            playbackInterval: 2e3
        },
        t = {
            layer: void 0,
            renderId: void 0,
            previousRenderId: void 0
        };

    function i(e) {
        return e.layer.id ? xCity.findItem({
            id: e.layer.id
        }) : xCity.findItem({
            name: e.layer.name
        })
    }

    function n(e, t, i, n) {
        var r = {};
        if (t.scaleFactor) {
            var a = n.get("scale"),
                s = i.scaleFactor.x || i.scaleFactor,
                d = i.scaleFactor.y || i.scaleFactor,
                l = i.scaleFactor.z || i.scaleFactor;
            r.scale = [], r.scale.push(o(s, 0, t.scaleFactor.x, a)), r.scale.push(o(d, 1, t.scaleFactor.y, a)), r.scale.push(o(l, 2, t.scaleFactor.z, a))
        }
        t.opacityFactor && (r.opacity = {
            Function: {
                Mul: [{
                    Literal: t.opacityFactor
                }, {
                    PropertyName: i.opacityFactor
                }]
            }
        });
        var c = {};
        if (t.color) {
            var u = function(e, t) {
                if (t.map(e => e.value).some(e => "string" == typeof e || e instanceof String)) {
                    for (var i = [], n = 0, o = t.length; n < o; n++) {
                        var r = {
                            ElementMaterial: {
                                ambient: t[n].color,
                                color: t[n].color,
                                diffuse: t[n].color
                            },
                            Filter: {
                                comparisonOps: {
                                    name: {
                                        localPart: "PropertyIsEqualTo"
                                    },
                                    value: {
                                        expression: [{
                                            PropertyName: e
                                        }, {
                                            Literal: t[n].value
                                        }]
                                    }
                                }
                            }
                        };
                        i.push(r)
                    }
                    return i
                }
                return {
                    Function: {
                        ColorGradient: [{
                            PropertyName: e
                        }, {
                            keyframes: t
                        }]
                    }
                }
            }(i.color, t.color);
            if (Array.isArray(u))
                for (var p = 0, g = u.length; p < g; p++) c[p + 1] = u[p];
            else r.color = u
        }
        return c[0] = {
            DatavizMaterial: r
        }, {
            Ids: [e],
            DatavizRendering: c
        }
    }

    function o(e, t, i, n) {
        return i ? {
            Function: {
                Mul: [{
                    Literal: i
                }, {
                    PropertyName: e
                }]
            }
        } : {
            Literal: n[t]
        }
    }

    function r(e) {
        return new Promise(function(t, i) {
            if (0 == e.length) return t();
            var n = xCity.getRenderingProfile("sessionProfile").toJSON();
            if (!n.Rendering) return t();
            xCity.deleteRenderingProfile("sessionProfile");
            for (var o = [], r = 0, a = n.Rendering.length; r < a; r++) {
                var s = n.Rendering[r];
                if (s.DatavizRendering)
                    for (var d = Array.isArray(s.Ids) ? s.Ids : [s.Ids], l = 0, c = d.length; l < c; l++) e.includes(d[l]) || o.push(n.Rendering[r]);
                else o.push(n.Rendering[r])
            }
            var u = {
                profiles: [{
                    name: "sessionProfile",
                    Rendering: o
                }]
            };
            xCity.loadRenderingProfiles(u, t)
        })
    }
    var a = {
        loadAnimation: function(t, o, r) {
            var s = function(e) {
                return e.layer ? e.layer.id || e.layer.name ? Array.isArray(e.layer.playbackAttributeList) ? e.rendering ? e.rendering.color || e.rendering.scaleFactor || e.rendering.opacityFactor ? i(e) ? void 0 : "Layer not found" : "No valid rendering properties specified" : "No rendering properties specified" : "No layer playback attributes specified" : "No valid layer id or name specified" : "No layer properties specified"
            }(t);
            if (s) return r({
                widgetID: t.widgetID,
                status: !1,
                result: s
            });
            a.clearAnimation().then(function() {
                setTimeout(function(t, i) {
                    t.layer.id ? e.layer = xCity.findItem({
                        id: t.layer.id
                    }) : (e.layer = xCity.findItem({
                        name: t.layer.name
                    }), t.layer.id = e.layer.get("id")), e.previousRenderId = e.layer.get("renderID");
                    for (var o = [], r = 0, a = t.layer.playbackAttributeList.length; r < a; r++) {
                        var s = t.layer.playbackAttributeList[r];
                        null == s.color && null == s.opacityFactor && null == s.scaleFactor && (s = {
                            color: t.layer.playbackAttributeList[r],
                            opacityFactor: t.layer.playbackAttributeList[r],
                            scaleFactor: t.layer.playbackAttributeList[r]
                        });
                        var d = "public-api-dataviz.animation." + t.layer.id + "." + s.color;
                        o.push(n(d, t.rendering, s, e.layer))
                    }
                    var l = {
                        profiles: [{
                            name: "sessionProfile",
                            Rendering: o
                        }]
                    };
                    e.playbackAttributes = t.layer.playbackAttributeList, e.playbackRenderIds = o.map(e => e.Ids[0]), xCity.loadRenderingProfiles(l, function() {
                        setTimeout(function() {
                            e.layer.set("renderID", e.playbackRenderIds[0])
                        }, 250), i({
                            widgetID: t.widgetID,
                            data: {
                                layer: t.layer
                            },
                            status: !0
                        })
                    })
                }.bind(this, t, o), 250)
            })
        },
        clearAnimation: function() {
            return e.playbackTimer && a.pauseAnimation(), new Promise(function(t, i) {
                r(e.playbackRenderIds).then(function() {
                    if (e.layer) {
                        var i = e.layer.get("scale");
                        e.layer.set("scale", i), e.layer.set("renderID", e.previousRenderId)
                    }
                    e.layer = void 0, e.previousRenderId = void 0, e.playbackAttributes = [], e.playbackRenderIds = [], e.playbackTimer = void 0, e.playbackIndex = 0, t()
                })
            })
        },
        playAnimation: function(t) {
            e.layer && (clearInterval(e.playbackTimer), e.playbackTimer = setInterval(function(t) {
                e.playbackIndex++, e.playbackIndex >= e.playbackRenderIds.length && (e.playbackIndex = 0), e.layer.set("renderID", e.playbackRenderIds[e.playbackIndex]), t({
                    data: {
                        attribute: e.playbackAttributes[e.playbackIndex]
                    }
                })
            }.bind(this, t), e.playbackInterval))
        },
        pauseAnimation: function() {
            clearInterval(e.playbackTimer), e.playbackTimer = void 0
        },
        setAnimationInterval: function(t, i, n) {
            var o = function(e) {
                return isNaN(e.interval) ? "Invalid interval value" : e.interval < 0 ? "Invalid interval value" : void 0
            }(t);
            if (o) return n({
                widgetID: t.widgetID,
                status: !1,
                result: o
            });
            e.playbackInterval = t.interval, e.playbackTimer && a.play(), i({
                widgetID: t.widgetID,
                status: !0
            })
        },
        goToAnimationFrame: function(t, i, n) {
            var o = function(t) {
                return isNaN(t.frame) ? "Invalid frame number" : e.layer ? t.frame >= e.playbackRenderIds.length || t.frame < 0 ? "Out of range" : void 0 : "Dataviz animation not loaded"
            }(t);
            if (o) return n({
                widgetID: t.widgetID,
                status: !1,
                result: o
            });
            a.pauseAnimation(), e.playbackIndex = t.frame, e.layer.set("renderID", e.playbackRenderIds[e.playbackIndex]), i({
                widgetID: t.widgetID,
                data: {
                    attribute: e.playbackAttributes[e.playbackIndex]
                },
                status: !0
            })
        },
        loadRendering: function(e, o, r) {
            var a = function(e) {
                return e.layer ? e.layer.id || e.layer.name ? e.rendering ? e.rendering.color || e.rendering.scaleFactor || e.rendering.opacityFactor ? i(e) ? void 0 : "Layer not found" : "No valid rendering properties specified" : "No rendering properties specified" : "No valid layer id or name specified" : "No layer properties specified"
            }(e);
            if (a) return r({
                widgetID: e.widgetID,
                status: !1,
                result: a
            });
            ! function(e, o) {
                t.layer = i(e), e.layer.id || (e.layer.id = t.layer.get("id")), t.previousRenderId = t.layer.get("renderID");
                var r = "public-api-dataviz.rendering." + e.layer.id + ".1",
                    a = {
                        profiles: [{
                            name: "sessionProfile",
                            Rendering: [n(r, e.rendering, e.layer.renderingAttributes, t.layer)]
                        }]
                    };
                xCity.loadRenderingProfiles(a, function() {
                    setTimeout(function() {
                        t.layer.set("renderID", r), o({
                            widgetID: e.widgetID,
                            data: {
                                layer: e.layer
                            },
                            status: !0
                        })
                    }, 250)
                })
            }(e, o)
        },
        clearRendering: function(e, t, n) {
            var o = function(e) {
                return e.layer ? e.layer.id || e.layer.name ? i(e) ? void 0 : "Layer not found" : "No valid layer id or name specified" : "No layer properties specified"
            }(e);
            if (o) return n({
                widgetID: e.widgetID,
                status: !1,
                result: o
            });
            ! function(e, t) {
                var n = i(e),
                    o = xCity.getAllRenderingIds({
                        id: n.get("id")
                    });
                datavizRenderingIds = o.filter(e => e.includes("public-api-dataviz.rendering.")), r(datavizRenderingIds).then(function() {
                    var e = n.get("scale");
                    n.set("scale", e), n.set("renderID", ""), t()
                })
            }(e, t)
        }
    };
    return a
}), define("DS/xCityAppsOpenness/Permission", ["UWA/Core", "DS/xCityAppsOpenness/Settings", "DS/xCityAppsOpenness/WidgetManager"], function(e, t, i) {
    "use strict";
    var n = t.getAccessLevels(),
        o = t.getSubscribeLevels(),
        r = {};

    function a() {
        return widget.getValue("subscribeEvent") === o.pair
    }

    function s() {
        return widget.getValue("subscribeEvent") === o.tab
    }

    function d() {
        return widget.getValue("subscribeEvent") === o.dashboard
    }

    function l(e) {
        return widget.id === e
    }

    function c(t) {
        return !!(e.is(t, "string") && t === widget.id || e.is(t, "array") && t.includes(widget.id))
    }

    function u() {
        return widget.getValue("publishEvent")
    }

    function p(t) {
        var i = {
            status: !1
        };
        return e.is(t, "string") || (i.message = "Topic is not defined. "), e.is(r[t], "number") ? (i.status = !0, i.level = r[t]) : i.message = "Unknown topic. ", i
    }

    function g(e) {
        return n.internal, parseInt(widget.getValue("accessLevel")) >= e
    }
    return {
        setTopicAccess: function(e) {
            for (var t in e)
                for (var i = e[t], n = 0; n < i.length; n++) {
                    var o = i[n];
                    r[o] = parseInt(t)
                }
        },
        isSubscribeLevelEqualsPaired: function() {
            return a()
        },
        isSubscribeLevelEqualsTab: function() {
            return s()
        },
        isSubscribeLevelEqualsDashboard: function() {
            return d()
        },
        isForMe: function(e) {
            return c(e)
        },
        isFromSelf: function(e) {
            return l(e)
        },
        getRespondPermission: function(t, o) {
            var r = {
                status: !1,
                silent: !0,
                message: ""
            };
            if (!u()) return r.message = "Widget is not allowed to publish response. ", r;
            if (! function(t) {
                    return !!e.is(t, "object")
                }(o)) return r.message += "Input is not in <Object> format. ", r;
            var y, f = p(t),
                m = f.level === n.generic,
                v = c(o.widgetId);
            if (!e.is(o.publisher, "string")) return r.message += '"publisher" key must contains requester widget ID. ', !m && v && delete r.silent, r;
            if (l(o.publisher)) return r.message += "Request is coming from self (same widget ID). ", r;
            if (widget.getValue("subscribeEvent") === y) return r.message += 'Subscribe Event is set to "None". All requests will not be responded. ', r;
            if (!f.status) return r.message += f.message, !m && v && delete r.silent, r;
            if (!g(f.level)) return r.message += 'Topic "' + t + '" is not allowed on current Access Level. Go to current target city widget and change the access level to higher setting on preference menu.', !m && v && delete r.silent, r;
            if (m) return r.status = !0, delete r.silent, r;
            if (v) {
                if (a() && i.isPaired(o.publisher)) return r.status = !0, delete r.silent, r;
                if (s() && i.isOnSameTab(o.publisher)) return r.status = !0, delete r.silent, r;
                if (d()) return r.status = !0, delete r.silent, r;
                r.message += "Subscribe Event level and requester widget ID are not matched or valid. "
            } else r.message += "This request is not targetted for this widget. ";
            return r
        },
        getBroadcastPermission: function(e) {
            var t = {
                status: !1,
                message: ""
            };
            if (!u()) return t.message = "Widget is not allowed to publish broadcast. ", t;
            var i = p(e);
            return i.status ? g(i.level) ? (t.status = !0, t) : (t.message += 'Topic "' + e + '" is not allowed on current Access Level', t) : (t.message += i.message, t)
        }
    }
}), define("DS/xCityAppsOpenness/Publisher", ["UWA/Core", "DS/PlatformAPI/PlatformAPI", "DS/xCityAppsOpenness/WidgetManager", "DS/xCityAppsOpenness/Permission"], function(e, t, i, n) {
    "use strict";
    var o, r;

    function a(t, o, r, a) {
        var s = {
            messageId: e.Utils.getUUID(),
            publisher: widget.id,
            subscribeType: widget.getValue("subscribeEvent"),
            accessLevel: widget.getValue("accessLevel"),
            messageType: t
        };
        return o && (s.topic = o), !1 === r.status ? (s.status = !1, delete r.status) : s.status = !0, r && (s.data = r), e.is(a, "object") && (a.messageId && (s.messageId = a.messageId), a.publisher && (e.is(a.publisher, "array") || e.is(a.publisher, "string")) && (s.widgetId = e.is(a.publisher, "array") ? a.publisher : [a.publisher])), s.widgetId || (n.isSubscribeLevelEqualsPaired() ? s.widgetId = i.getPairedWidgets(!0) : n.isSubscribeLevelEqualsTab() && (s.widgetId = i.getSameTabWidgets(!0))), s
    }
    return {
        setResolveRejectTopic: function(e, t) {
            o = e, r = t
        },
        broadcast: function(e, i, n, o) {
            var r = a("broadcast", n || e, i, o);
            return t.publish(e, r), {
                topic: e,
                broadcast: r
            }
        },
        respond: function(i, n, s) {
            var d, l, c = a("response", i, n, s);
            return e.is(s, "object") ? (d = s.resolve || o, l = s.catch || r) : (d = o, l = r), !0 === c.status ? t.publish(d, c) : t.publish(l, c), {
                topic: c.status ? d : l,
                response: c
            }
        }
    }
}), define("DS/xCityAppsOpenness/Basic", ["UWA/Core", "DS/xCityAppsOpenness/Utility"], function(e, t) {
    "use strict";
    var i = {
        renderMode: "blending",
        renderAnchor: "anchor",
        shapeType: "shape",
        geometricMode: "polygonType",
        stroke: "polygonStroke",
        dashPattern: "pattern",
        Clustering: "clustering"
    };

    function n(i, n) {
        var o, r, a = {
            id: n.get("id"),
            name: n.get("name"),
            description: n.get("description"),
            selectable: n.get("selectable"),
            selected: n.get("selected"),
            visible: n.get("visible")
        };
        if (a = e.merge(a, i), "Feature" === i.category ? (a.strid = n.get("strid"), n.get("position") && (a.position = (o = n.get("position"), r = t.localToWorld(o), {
                local: {
                    x: o.x,
                    y: o.y
                },
                world: {
                    lat: r.y,
                    lon: r.x
                },
                altitude: o.z
            }))) : i.type, "Layer" === i.category && ("POI" === i.type || "SimpleFeature" === i.type && "Point" === i.geometryType)) {
            var s = n.get("Clustering");
            e.is(s, "object") && e.is(s.enable, "boolean") && (a.clustering = s.enable)
        }
        return a
    }

    function o(t, i, n, o) {
        var r, a, s, d;
        switch (e.is(i, "object") && i.datasetType && (s = i.datasetType), n) {
            case "geometrySetFeature":
                a = "geometrySetFeature";
                break;
            case "Buildings":
                a = "GenericBuilding", d = "Point";
                break;
            case "FactoryModel":
                a = "3DXM" === t.get("type") ? "RawData" : "SpecificBuilding", d = "Point";
                break;
            case "FactoryCrossQuad":
            case "FactoryTree":
                a = "Tree", d = "Point";
                break;
            case "FactoryElement":
                a = "Furniture", d = "Point";
                break;
            case "FactoryPointOfInterest3D":
                a = function(e, t) {
                    var i = t.getUserData();
                    if (!i) return !1;
                    if (!e && !0 === i["poi-dataset"]) return !0;
                    if (e) {
                        var n = t.get("layer");
                        if (n.getUserData() && !0 === n.getUserData()["poi-dataset"]) return !0
                    }
                    return !1
                }(o, t) ? "POI" : s || "SimpleFeature", d = "Point";
                break;
            case "FactoryLine":
                a = s || "SimpleFeature", d = "Line";
                break;
            case "FactoryPolygon":
                a = s || "SimpleFeature", d = "Polygon";
                break;
            case "poi3DSetFeature":
                a = "PointOfInterest3DSet", d = "Point";
                break;
            case "lineSetFeature":
                a = n, d = "Line";
                break;
            case "polygonSetFeature":
                a = n, d = "Polygon";
                break;
            case "multiPointSetFeature":
                a = n, d = "MultiPoint";
                break;
            case "multiLineSetFeature":
                a = n, d = "MultiLine";
                break;
            case "multiPolygonSetFeature":
                a = n, d = "MultiPolygon";
                break;
            default:
                a = n
        }
        return r = {
            type: a,
            category: o ? "Feature" : "Layer"
        }, d && (r.geometryType = d), r
    }

    function r(t) {
        var i = t.get("className"),
            n = t.get("factory"),
            r = t.getUserData(),
            a = {};
        switch (i) {
            case "Terrain":
                e.is(r, "object") && r.datasetType ? a.type = r.datasetType : a.type = "geometricMode" === t.get("sourceMode") ? "RawData" : "ImageTerrain";
                break;
            case "RasterOverlay":
                e.is(r, "object") && r.datasetType ? a.type = r.datasetType : a.type = "Image";
                break;
            case "GeometrySet":
                a.type = i;
                break;
            case "RdbLink":
                a = o(t, r, n);
                break;
            case "LayerVectorPrimitive":
                a = o(t, r, n, !0);
                break;
            case "Annotation":
            case "SimplePointOfInterest3D":
                a.type = i, a.geometryType = "Point";
                break;
            case "Point":
                a.type = "Geometry", a.geometryType = "Point";
                break;
            case "Line":
                a.type = "Geometry", a.geometryType = "Line";
                break;
            case "Polygon":
                a.type = "Geometry", a.geometryType = "Polygon";
                break;
            default:
                a.type = i
        }
        return !1 === a.type ? {
            status: !1,
            message: "Not able to determine type of selected/deselected representation object"
        } : a
    }

    function a(e, t) {
        for (var n = {}, o = 0; o < t.length; o++) {
            var r, a = t[o],
                s = e.get(a);
            r = "dashPattern" == a ? l(e.get("lineWidth"), s) : "stroke" == a ? {
                enable: s.enable,
                color: s.color,
                opacity: s.opacity,
                lineWidth: s.lineWidth,
                pattern: l(s.lineWidth, s.dashPattern)
            } : s, i[a] ? n[i[a]] = r : n[a] = r
        }
        return "{}" != JSON.stringify(n) && n
    }

    function s(e, t, i) {
        var n;
        switch (t) {
            case "GenericBuilding":
            case "SpecificBuilding":
                n = a(e, ["renderID", "color", "opacity", "elevationMode", "elevationOffset"]);
                break;
            case "RawData":
                n = a(e, ["renderID", "color", "opacity"]);
                break;
            case "Tree":
                n = a(e, ["renderID", "color", "opacity", "elevationMode", "elevationOffset"]);
                break;
            case "Furniture":
            case "UrbanFurniture":
                n = a(e, ["renderID", "color", "opacity", "elevationMode", "elevationOffset"]);
                break;
            case "POI":
                n = a(e, ["renderID", "color", "opacity", "opacityFactor", "naming", "renderMode", "scale", "elevationMode", "elevationOffset"]);
                break;
            case "SimpleFeature":
                n = function(e, t) {
                    var i;
                    switch (t) {
                        case "Point":
                            i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "shapeType", "scale", "switchDistance", "elevationMode", "elevationOffset", "renderAnchor"]);
                            break;
                        case "Line":
                            i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "dashPattern", "lineWidth", "elevationMode", "elevationOffset"]);
                            break;
                        case "Polygon":
                            i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "geometricMode", "stroke", "lineWidth", "extrusionHeight", "elevationMode", "elevationOffset"]);
                            break;
                        default:
                            i = !1
                    }
                    return i
                }(e, i);
                break;
            default:
                n = !1
        }
        return n
    }

    function d(e, t) {
        return "Layer" == e.category ? s(t, e.type, e.geometryType) : "Feature" == e.category ? a(t, ["renderID", "color", "opacity"]) : "Image" == e.type || "ReliefAppearence" == e.type || "ImageProxy" == e.type || "ReliefAppearenceProxy" == e.type ? a(t, ["renderID", "opacity"]) : ("Geometry" == e.type || "SimplePointOfInterest3D" == e.type) && function(e, t) {
            var i;
            switch (t) {
                case "Point":
                    i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "shapeType", "switchDistance", "elevationMode", "elevationOffset", "renderAnchor", "vertices"]);
                    break;
                case "Line":
                    i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "lineWidth"]);
                    break;
                case "Polygon":
                    i = a(e, ["renderID", "color", "opacity", "opacityFactor", "renderMode", "geometricMode", "lineWidth", "extrusionHeight"]);
                    break;
                default:
                    i = !1
            }
            return i
        }(t, e.geometryType)
    }

    function l(t, i) {
        if (t) {
            if (null == i) return "solid";
            if (e.is(i, "array"))
                if (2 == i.length) {
                    if (i[0] == t && i[1] == t) return "dot";
                    if (i[0] != t) return "dash"
                } else if (4 == i.length) return "dash/dot"
        }
    }
    var c = ["uuid", "cache", "LifespanEnd", "LifespanStart", "SourceFileName", "StreamPriority"];

    function u(e, t) {
        if (("Layer" === e.category || "Folder" === e.type || "Viewshed" === e.type) && t.get("children") && t.get("children").length) {
            for (var i = [], n = t.get("children"), o = 0; o < n.length; o++) i.push(p(n[o], "child"));
            return i
        }
        return !1
    }

    function p(t, i) {
        try {
            var o = r(t);
            if (!1 === o.status) return o;
            var a, s, l = n(o, t),
                g = d(o, t),
                y = function(t, i) {
                    if ("Feature" === t.category || "Geometry" === t.type || "GeometrySet" === t.type || "SimplePointOfInterest3D" === t.type || "lineSetFeature" === t.type || "polygonSetFeature" === t.type) {
                        var n = i.get("geojson");
                        if (e.is(n, "object")) {
                            for (var o = 0; o < n.features.length; o++)
                                for (var r in delete n.features[o].cropped, n.features[o].properties) c.includes(r) && delete n.features[o].properties[r];
                            return n
                        }
                    }
                    return !1
                }(o, t),
                f = function(t, i) {
                    if (!e.is(i.getLayerInformation, "function")) return !1;
                    var n = i.getLayerInformation(),
                        o = {};
                    return e.is(n, "object") && (e.is(n.nbGeometry, "object") && (o.geometryCount = {
                        point: n.nbGeometry.point || 0,
                        line: n.nbGeometry.line || 0,
                        polygon: n.nbGeometry.polygon || 0,
                        multiPoint: n.nbGeometry.multiPoint || 0,
                        multiLine: n.nbGeometry.multiLine || 0,
                        multiPolygon: n.nbGeometry.multiPolygon || 0
                    }), e.is(n.nbFeature, "object") && (o.featureCount = {
                        total: n.nbFeature.input || 0,
                        inbound: n.nbFeature.inside || 0,
                        outbound: n.nbFeature.outside || 0
                    }), n.serviceId && (o.source = n.serviceId)), !e.is(o, "plain") && o
                }(0, t),
                m = {
                    representation: l
                };
            return f && (m.information = f), g && (m.rendering = g), y && (m.geojson = y), i ? "child" === i && (s = u(o, t)) : (a = function(e) {
                return e.get("layer") ? p(e.get("layer"), "parent") : !(!e.getParentFolder() || "_root" == e.getParentFolder().get("id")) && p(e.getParentFolder(), "parent")
            }(t), s = u(o, t)), a && (m.parent = a), s && (m.children = s), m
        } catch (e) {
            return {
                status: !1,
                message: "Not able to get complete information on selected/deselected representation object",
                error: e
            }
        }
    }

    function g(e, t, i, n) {
        var o;
        switch (i) {
            case "GenericBuilding":
            case "SpecificBuilding":
                o = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset"]);
                break;
            case "RawData":
                o = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color"]);
                break;
            case "Tree":
                o = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset"]);
                break;
            case "Furniture":
            case "UrbanFurniture":
                o = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset"]);
                break;
            case "POI":
                o = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset", "opacityFactor", "scale", "blending", "clustering", "naming"]);
                break;
            case "SimpleFeatureProxy":
            case "SimpleFeature":
                o = function(e, t, i) {
                    var n;
                    switch (i) {
                        case "Point":
                            n = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset", "opacityFactor", "scale", "blending", "clustering", "anchor", "shape", "switchDistance"]);
                            break;
                        case "Line":
                            n = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset", "opacityFactor", "blending", "pattern", "lineWidth"]);
                            break;
                        case "Polygon":
                            n = v(e, t, ["name", "selected", "visible", "renderID", "opacity", "color", "elevationMode", "elevationOffset", "opacityFactor", "blending", "polygonType", "polygonStroke", "extrusionHeight", "lineWidth"]);
                            break;
                        default:
                            n = !1
                    }
                    return n
                }(e, t, n);
                break;
            default:
                o = !1
        }
        return o
    }
    var y = {
            name: "string",
            selected: "boolean",
            visible: "boolean",
            opacity: "number",
            opacityFactor: "number",
            color: "string",
            elevationMode: ["geometry", "ground", "advanced"],
            elevationOffset: "number",
            scale: "array",
            blending: ["occluded", "overlay", "dual"],
            clustering: "boolean",
            naming: "boolean",
            anchor: "boolean",
            shape: ["billboard", "disc", "tube", "sphere", "pyramid"],
            switchDistance: "number",
            pattern: ["solid", "dash", "dot", "dash/dot"],
            lineWidth: "number",
            polygonType: ["filled", "line", "extruded"],
            polygonStroke: {
                enable: "boolean",
                color: "string",
                lineWidth: "number",
                opacity: "numer",
                pattern: ["solid", "dash", "dot", "dash/dot"]
            },
            extrusionHeight: "number",
            renderID: "string"
        },
        f = {
            blending: "renderMode",
            anchor: "renderAnchor",
            shape: "shapeType",
            polygonType: "geometricMode",
            pattern: function(e, t) {
                return e.set("dashPattern", m(t, e.get("lineWidth"))), !0
            },
            clustering: function(e, t) {
                var i = e.get("Clustering");
                return i.enable == t || (i.enable = t, e.set("Clustering", i), !0)
            },
            polygonStroke: function(e, t) {
                var i = e.get("stroke"),
                    n = {
                        enable: t.enable,
                        color: t.color,
                        ambient: t.color,
                        diffuse: t.color,
                        opacity: t.opacity,
                        lineWidth: t.lineWidth,
                        dashPattern: m(t.pattern, i.lineWidth)
                    };
                return e.set("stroke", n), !0
            }
        };

    function m(e, t) {
        var i;
        switch (e) {
            case "dot":
                i = [t, t];
                break;
            case "dash":
                i = [3 * t, 2 * t];
                break;
            case "dash/dot":
                i = [3 * t, t, t, t];
                break;
            default:
                i = null
        }
        return i
    }

    function v(t, i, n, o) {
        for (var r = 0; r < n.length; r++) {
            var a = n[r];
            null != t[a] && b(y[a], t[a]) && (e.is(f[a], "string") && i.get(f[a]) != t[a] ? i.set(f[a], t[a]) : e.is(f[a], "function") ? f[a](i, t[a]) : i.get(a) != t[a] && i.set(a, t[a]))
        }
    }

    function b(t, i) {
        if (e.is(t, "string")) return !!e.is(i, t);
        if (e.is(t, "array") && t.includes(i)) return !0;
        if (e.is(t, "object")) {
            var n = !0;
            for (var o in t) n = b(t[o], i[o]);
            return n
        }
        return !1
    }

    function h(t) {
        try {
            var i = function(t) {
                var i, n = {
                    status: !1
                };
                if (!e.is(t, "object")) return t.message = 'Invalid input. It must be <Object> with at least "representation" key.', t;
                if (!e.owns(t, "representation") || !e.is(t.representation, "object")) return n.message = 'Invalid "representation" value. "representation" is required. It must be an <Object>.', n;
                if (e.owns(t.representation, "id") && e.is(t.representation.id, "string")) i = xCity.findItem({
                    id: t.representation.id
                });
                else {
                    if (!e.owns(t.representation, "name") || !e.is(t.representation.name, "string")) return n.message = 'Invalid "representation" value. "representation" is required. It must be an <Object>.', t;
                    i = xCity.findItem({
                        name: t.representation.name
                    })
                }
                if (!i && e.owns(t.representation, "strid") && e.is(t.parent, "object") && e.is(t.parent.representation, "object") && e.owns(t.parent.representation, "id")) {
                    var o = xCity.findItem({
                        id: t.parent.representation.id
                    });
                    if (!o) return n.message = 'Invalid "representation" value. "representation" is required. It must be an <Object>.', n;
                    (i = o.findPrimitiveById(t.representation.strid)) || (i = o.createPrimitive(t.representation.strid, o))
                }
                return i ? (n.item = i, n.status = !0, n) : (n.message = "Item not found.", n)
            }(t.data);
            if (!i.status) return i;
            var n = r(i.item);
            if (!1 === n.status) return n;
            var o, a = t.data.representation;
            switch (e.is(t.data.rendering, "object") && (a = e.merge(t.data.representation, t.data.rendering)), n.type) {
                case "GridRelief":
                case "ImageTerrain":
                case "RawData":
                    o = v(a, i.item, ["name", "selected", "visible", "renderID"]);
                    break;
                case "ReliefAppearence":
                case "ReliefAppearanceProxy":
                case "Image":
                case "ImageProxy":
                    o = v(a, i.item, ["name", "selected", "visible", "renderID", "opacity"]);
                    break;
                case "Folder":
                case "Annotation":
                    o = v(a, i.item, ["name", "selected", "visible", "renderID"]);
                    break;
                case "SimplePointOfInterest3D":
                case "Geometry":
                    o = function(e, t, i) {
                        var n;
                        switch (i) {
                            case "Point":
                                n = v(e, t, ["name", "selected", "visible", "renderID", "color", "opacity", "opacityFactor", "blending", "shape", "switchDistance", "elevationMode", "elevationOffset", "anchor", "vertices"]);
                                break;
                            case "Line":
                                n = v(e, t, ["name", "selected", "visible", "renderID", "color", "opacity", "opacityFactor", "blending", "lineWidth"]);
                                break;
                            case "Polygon":
                                n = v(e, t, ["name", "selected", "visible", "renderID", "color", "opacity", "opacityFactor", "blending", "polygonType", "lineWidth", "extrusionHeight"]);
                                break;
                            default:
                                n = !1
                        }
                        return n
                    }(a, i.item, n.geometryType);
                    break;
                case "Bookmark":
                case "Feature":
                case "Viewshed":
                case "ViewshedCamera":
                    o = v(a, i.item, ["name", "selected", "visible", "renderID"]);
                    break;
                default:
                    o = !1
            }
            return "Layer" == n.category ? o = g(a, i.item, n.type, n.geometryType) : "Feature" == n.category && (o = v(a, i.item, ["selected", "visible", "renderID", "opacity", "color"])), !1 === o && console.warn("SET:", o), p(i.item)
        } catch (e) {
            return e
        }
    }
    return {
        getItemInfo: function(e) {
            return p(e)
        },
        getPattern: l,
        getPatternValue: m,
        onClick: function(e) {
            return console.info("xCity.onClick", e),
                function(e) {
                    try {
                        var i = t.localToWorld(e),
                            n = t.localToWorld(xCity.cameraPosition);
                        return {
                            projection: xCity.projection,
                            click: {
                                local: {
                                    x: e.x,
                                    y: e.y
                                },
                                world: {
                                    lat: i.y,
                                    lon: i.x
                                },
                                elevation: xCity.getGroundHeight(e),
                                altitude: e.z
                            },
                            camera: {
                                local: {
                                    x: xCity.cameraPosition.x,
                                    y: xCity.cameraPosition.y
                                },
                                world: {
                                    lat: n.y,
                                    lon: n.x
                                },
                                altitude: xCity.cameraPosition.z,
                                pointOfView: t.getPointOfView(),
                                fieldOfView: xCity.fieldOfView,
                                areaInView: t.getAreaInView()
                            }
                        }
                    } catch (e) {
                        return {
                            status: !1,
                            message: "Not able to get complete information on mouse click position",
                            error: e
                        }
                    }
                }(e)
        },
        onSelect: function(e) {
            return console.info("xCity.onSelect", e), p(e)
        },
        onDeselect: function(e) {
            return console.info("xCity.onDeselect", e), p(e)
        },
        set: function(e) {
            return console.info("xCity.set", e), h(e)
        }
    }
}), define("DS/xCityAppsOpenness/Location", ["UWA/Core", "DS/xCityAppsInfra/xCityExperienceServices", "DS/xCityAppsOpenness/Publisher", "DS/xCityAppsOpenness/Utility"], function(e, t, i, n) {
    "use strict";
    var o = !1,
        r = 50,
        a = !1,
        s = {
            distance: 100,
            duration: 3,
            yaw: 0,
            pitch: .7853981633974483,
            stringYaw: {
                north: 0,
                northeast: .7853981633974483,
                east: 1.5707963267948966,
                southeast: 2.356194490192345,
                south: 3.141592653589793,
                southwest: -2.356194490192345,
                west: -1.5707963267948966,
                northwest: -.7853981633974483
            },
            stringPitch: {
                top: 0,
                topside: .7853981633974483,
                level: 1.5707963267948966
            },
            lowRangeYaw: -360,
            highRangeYaw: 360,
            lowRangePitch: 0,
            highRangePitch: 90
        };

    function d(i) {
        var o, r = {
            status: !1
        };
        if (!e.is(i.data, "object")) return r.message = 'Invalid input. It must be <Object> with at least "target" key containing either "local: {x: <Number>, y: <Number>}", "world: {lat: <Number>, lon: <Number>}". Optional keys are "rotation"', r;
        if (!e.owns(i.data, "target") || !e.is(i.data.target, "object")) return e.owns(i.data, "target") && e.is(i.data.target, "string") && "default" === i.data.target ? function(e) {
            var i = t.getViewpoint();
            return i && i.target && i.rotationRad && i.length ? (e.status = !0, e.target = i.target, e.orientation = i.rotationRad, e.distance = i.length, e.duration = 3, e) : (e.status = !1, e)
        }(r) : (r.message = 'Invalid "target" value. "target" is required. It must be an <Object> with either "local: {x: <Number>, y: <Number>}", "world: {lat: <Number>, lon: <Number>}".', r);
        if (e.owns(i.data.target, "representation") && e.is(i.data.target.representation, "object")) {
            var a, d = i.data.target.representation;
            if (d.id ? a = xCity.findItem({
                    id: d.id
                }) : d.name && (a = xCity.findItem({
                    name: d.name
                })), !a) return r.message = 'Invalid "target" value. "representation" is not found.', r;
            r.target = a
        } else if (e.owns(i.data.target, "local") && e.is(i.data.target.local, "object")) {
            if (!e.is(i.data.target.local.x, "number") || !e.is(i.data.target.local.x, "number")) return r.message = 'Invalid "local" value. It must be <Object> with "{x: <Number>, y: <Number>}".', r;
            r.target = xCity.objectToVector3(i.data.target.local)
        } else {
            if (!e.owns(i.data.target, "world") || !e.is(i.data.target.world, "object")) return r.message = 'Invalid "target" value. "target" is required. It must be an <Object> with either "local: {x: <Number>, y: <Number>}", "world: {lat: <Number>, lon: <Number>}".', r;
            if (!e.is(i.data.target.world.lat, "number") || !e.is(i.data.target.world.lon, "number")) return r.message = 'Invalid "world" value. It must be <Object> with "{lat: <Number>, lon: <Number>}".', r;
            r.target = n.worldToLocal(i.data.target.world)
        }
        if (!e.owns(i.data.target, "representation")) {
            if (e.owns(i.data.target, "altitude") && !e.is(i.data.target.altitude, "number")) return r.message = 'Invalid "altitude" value. "altitude" is optional. If defined, it must be <Number>.', r;
            e.is(i.data.target.altitude, "number") && r.target.setZ(i.data.target.altitude)
        }
        if (e.owns(i.data, "rotation")) {
            if (!e.owns(i.data.rotation, "yaw") && !e.owns(i.data.rotation, "pitch")) return r.message = 'Invalid "rotation" value. "rotation" is optional. If defined, it must be <Object> with "yaw" and/or "pitch" keys defined. Default value: {"yaw": "north", "pitch": "top"}. "yaw": <"north|northeast|east|southeast|south|southwest|west|northwest"> or <Number> in degrees (0 to 360 clockwise or negative value for anticlockwise). "pitch": <"top|topside|level"> or <Number> in degrees (0 to 90).', r;
            if (r.orientation = [s.yaw, s.pitch, 0], null == i.data.rotation.yaw) r.orientation[0] = s.yaw;
            else if (e.is(i.data.rotation.yaw, "number") && (o = i.data.rotation.yaw, s.lowRangeYaw <= o && o <= s.highRangeYaw)) r.orientation[0] = n.degreeToRadian(i.data.rotation.yaw);
            else {
                if (!e.is(i.data.rotation.yaw, "string") || ! function(t) {
                        return !!e.is(s.stringYaw[t], "number")
                    }(i.data.rotation.yaw)) return r.message = 'Invalid "yaw" value. "yaw" is optional. Default value is "north". If defined, "yaw" must be <"north|northeast|east|southeast|south|southwest|west|northwest"> or <Number> in degrees (0 to 360 clockwise or negative value for anticlockwise).', r;
                r.orientation[0] = s.stringYaw[i.data.rotation.yaw]
            }
            if (null == i.data.rotation.pitch) r.orientation[1] = s.pitch;
            else if (e.is(i.data.rotation.pitch, "number") && function(e) {
                    return s.lowRangePitch <= e && e <= s.highRangePitch
                }(i.data.rotation.pitch)) r.orientation[1] = n.degreeToRadian(i.data.rotation.pitch);
            else {
                if (!e.is(i.data.rotation.pitch, "string") || ! function(t) {
                        return !!e.is(s.stringPitch[t], "number")
                    }(i.data.rotation.pitch)) return r.message = 'Invalid "pitch" value. "pitch" is optional. Default value is "top". If defined, "pitch" must be <"top|topside|level"> or <Number> in degrees (0 to 90).', r;
                r.orientation[1] = s.stringPitch[i.data.rotation.pitch]
            }
        } else r.orientation = [s.yaw, s.pitch, 0];
        if (e.owns(i.data, "distance")) {
            if (!(e.is(i.data.distance, "number") && i.data.distance > 0)) return r.message = 'Invalid "distance" value. "distance" is optional. Default is 10 in meters. If defined, it must be <Number> and not less than 0.', r;
            r.distance = i.data.distance
        } else r.distance = s.distance;
        if (e.owns(i.data, "duration")) {
            if (!(e.is(i.data.duration, "number") && i.data.duration >= 0)) return r.message = 'Invalid "duration" value. "duration" is optional. Default is 5 in seconds. If defined, it must be <Number> and not negative.', r;
            r.duration = 0 == i.data.duration ? .1 : i.data.duration
        } else r.duration = s.duration;
        return r.status = !0, r
    }
    return {
        move: function(e, t) {
            return this.moveCamera(e, t)
        },
        moveCamera: function(e, t) {
            return console.info("xCity.moveCamera", e), (e = d(input)).status ? (xCity.moveToTarget(e.target, e.duration, e.orientation, e.distance, function() {
                i.respond(t, {
                    status: "complete",
                    fieldOfView: xCity.fieldOfView,
                    pointOfView: n.getPointOfView(),
                    areaInView: n.getAreaInView()
                }, input)
            }), {
                status: "inprogress"
            }) : e
        },
        moveTo: function(e, t) {
            console.info("xCity.moveTo", e);
            var o = d(e);
            return o.status ? (xCity.moveToTarget(o.target, o.duration, o.orientation, o.distance, function() {
                i.respond(t, {
                    status: "complete",
                    fieldOfView: xCity.fieldOfView,
                    pointOfView: n.getPointOfView(),
                    areaInView: n.getAreaInView()
                }, e)
            }), {
                status: "inprogress"
            }) : o
        },
        syncCamera: function(t) {
            if (a) {
                var i = t.data.len;
                e.is(r, "number") && (i += -r);
                var n = t.data.position,
                    s = t.data.orientation;
                !0 === o && (s.y = 0), xCity.moveToTarget(n, .01, s, i)
            }
        },
        toggleSyncCamera: function(e) {
            a = e
        },
        changeSyncCamType: function(e) {
            o = e
        },
        changeSyncCamVal: function(e) {
            r = parseInt(e)
        }
    }
}), define("DS/xCityAppsOpenness/LoadTemporary", ["UWA/Core", "DS/xCityGlobeUtils/xCityGlobeServices", "DS/Windows/Dialog", "DS/Controls/Button", "DS/DataGridView/DataGridView", "DS/TreeModel/TreeDocument", "DS/TreeModel/TreeNodeModel", "DS/xCityAppsInfra/xCity3DContentCreation", "DS/xCityAppsInfra/xCityWidgetReferential", "DS/xCityAppsInfra/xCityDataImport", "DS/xCityAppsInfra/xCityWidgetEnvironment", "DS/xCityAppsOpenness/Publisher", "DS/xCityAppsOpenness/Basic"], function(e, t, i, n, o, r, a, s, d, l, c, u, p) {
    "use strict";

    function g(e) {
        var t = e.split(":");
        return !!t[t.length - 1] && t[t.length - 1]
    }

    function y(e, t, i, n) {
        n || (n = 0);
        var o = i.features[n].properties;
        e.data.dataset.uuid = o.uuid, v.addDataset(e, t)
    }

    function f(t, s, d, l) {
        e.is(l, "object") ? 0 === l.nhits ? u.respond(s, {
            status: !1,
            message: "Zero result. No dataset found."
        }, t) : 1 == l.nhits || l.nhits > 1 && "auto" == d.confirmation ? y(t, s, l) : l.nhits > 1 && ("ask" == d.confirmation ? function(t, s, d) {
            for (var l = {
                    model: new r
                }, c = 0; c < d.nhits; c++) {
                var u = d.features[c],
                    p = new a({
                        grid: {
                            uuid: u.properties.uuid,
                            name: u.properties.name,
                            type: u.properties.type,
                            accessright: u.properties.published,
                            creationdate: u.properties.creation_date
                        }
                    });
                l.model.addRoot(p)
            }
            l.grid = new o({
                treeDocument: l.model,
                rowSelection: "single",
                columnSelection: "none",
                cellSelection: "none",
                columns: [{
                    text: "Name",
                    dataIndex: "name"
                }, {
                    text: "Type",
                    dataIndex: "type"
                }]
            });
            var g = new e.Element("div", {
                html: "Select which dataset to be added into experience:",
                styles: {
                    width: "100%",
                    height: "100px"
                }
            });
            l.grid.inject(g), new i({
                title: "Select which dataset",
                content: g,
                immersiveFrame: xCity.getFrmWindow().getImmersiveFrame(),
                buttons: {
                    Cancel: new n({
                        onClick: function(e, t, i, n, o) {
                            console.log(e, t, i, n, o), o.dsModel.dialog.close(), o.dsModel.dialog.destroy(), n.grid.destroy(), n.model.destroy()
                        }.bind(this, s, t, d, l)
                    }),
                    Ok: new n({
                        onClick: function(e, t, i, n, o) {
                            console.log(e, t, i, n, o);
                            var r = n.model.getSelectedNodes();
                            if (r.length) {
                                for (var a, s = r[0].options.grid.uuid, d = 0; d < i.nhits; d++) {
                                    var l = i.features[d];
                                    if (l.properties.uuid == s) {
                                        a = d;
                                        break
                                    }
                                }
                                y(t, e, i, a), o.dsModel.dialog.close(), o.dsModel.dialog.destroy(), n.grid.destroy(), n.model.destroy()
                            } else;
                        }.bind(this, s, t, d, l)
                    })
                }
            })
        }(t, s, l) : "notify" == d.confirmation && u.respond(s, {
            status: !0,
            message: "Multiple result returned. Please choose."
        }, t)) : u.respond(s, {
            status: !1,
            message: "Not able to get search result."
        }, t)
    }

    function m(e) {
        return {
            uuid: e.uuid,
            name: e.name,
            type: e.type,
            enoviaPhysicalId: e.enoviaPhysicalId,
            startLevel: e.startLevel,
            endLevel: e.endLevel,
            creationDate: e.creationDate,
            published: e.published,
            referential: e.referentialUuid,
            createdBy: e.createdBy,
            lastModificationDate: e.lastModificationDate
        }
    }
    var v = {
        remove: function(t, i) {
            return console.info(i, t), e.is(t, "object") && e.is(t.data, "object") && e.is(t.data.representation, "object") ? (xCity.removeChild({
                id: t.data.representation.id
            }), {
                status: !0,
                message: "representation data removed"
            }) : {
                status: !1,
                message: "invalid input data"
            }
        },
        addDataset: function(i, n) {
            var o;
            if (console.info(n, i), o = e.is(i.data.option, "object") && e.is(i.data.option.confirmation, "string") ? i.data.option : {
                    confirmation: "auto"
                }, !(e.is(i, "object") && e.is(i.data, "object") && e.is(i.data.dataset, "object"))) return {
                status: !1,
                message: "invalid data object must contain dataset with either uuid (string) or name (string), e.g. data = {dataset: {uuid: <dataset_uuid>}} or data = {dataset: {name: <dataset_name>}}"
            };
            if (e.is(i.data.dataset.uuid, "string")) {
                var r = xCity.widgetData.datasetCollection.get(i.data.dataset.uuid),
                    a = xCity.getTemporaryFolder("xcity-user-added-content", "User Added Content");
                r ? s.createContentFromDataset(r.toJSON(), a, void 0, function(e) {
                    var t = p.getItemInfo(e);
                    t.dataset = m(r.toJSON()), u.respond(n, t, i)
                }, void 0, o) : t.readDataset(i.data.dataset.uuid).then(function(e) {
                    s.createContentFromDataset(e, a, void 0, function(t) {
                        var o = p.getItemInfo(t);
                        o.dataset = m(e), u.respond(n, o, i)
                    }, void 0, o)
                }).catch(function(e) {
                    u.respond(n, {
                        status: !1,
                        message: "Not able to retrieve information on input dataset.",
                        error: e
                    }, i)
                })
            } else {
                if (!e.is(i.data.dataset.name, "string")) return {
                    status: !1,
                    message: "invalid uuid (string) or name (string) value."
                };
                var l = {
                    datamodel: "dataset",
                    referentialUuid: d.get("uuid"),
                    filterList: [
                        [{
                            operator: "contains",
                            attribute: "name",
                            value: i.data.dataset.name
                        }]
                    ],
                    response: {
                        epsg: g(d.get("proj")),
                        offset: 0,
                        size: 100
                    }
                };
                t.search(l).then(function(e) {
                    return f(i, n, o, e)
                }).catch(function(e) {
                    u.respond(n, {
                        status: !1,
                        message: "Not able to perform REST API Search on input dataset.",
                        error: e
                    }, i)
                })
            }
            return {
                status: !0,
                message: "inprogress"
            }
        },
        addContent: function(e, t) {
            console.info(t, e), l.previewDocument(e.data.content.objectId, e.data.content.displayName, [0, 0], e.representation, e.data.content.serviceId).then(function(i) {
                if (i.items.length) {
                    for (var n = [], o = 0; o < i.items.length; o++) n.push(p.getItemInfo(i.items[o]));
                    1 == n.length ? u.respond(t, n[0], e) : n.length > 1 && u.respond(t, n, e)
                }
            }).catch(function(i) {
                u.respond(t, {
                    status: !1,
                    message: "Not able to retrieve content of input Document.",
                    error: i
                }, e)
            })
        },
        addData: function(t, i) {
            console.info("test_1", i, t);
            var n = t.data.representation.id || e.Utils.getUUID(),
                o = n;
            e.is(t.data.rendering, "object") && t.data.rendering.renderID && (o = t.data.rendering.renderID);
            var r = {
                className: "Feature",
                id: n,
                name: t.data.representation.name,
                visible: !1 !== t.data.representation.visible,
                selected: !0 === t.data.representation.selected,
                selectable: !0,
                Content: {
                    className: "GeometrySet",
                    stridAttribute: t.data.representation.stridAttribute || "STRID",
                    renderID: o
                }
            };
            console.log("test_2", r);
            if (!e.is(t.data.url, "string") && !e.is(t.data.geojson, "object")) return {
                status: !1,
                message: "data object must contain either url (string) or geojson (object)"
            };
            t.data.url ? r.Content.url = t.data.url : t.data.geojson && (r.Content.geojson = t.data.geojson);
            r.data.options = {color: "#880808"}
            var a = xCity.getTemporaryFolder("xcity-user-added-content-dmh5", "User Added Content DMH5");
            console.log("test_3 ", u, i, p, e, t)
            return xCity.add3DContent({
                feature: r,
                parentFolder: a,
                readyCB: function(e) {
                    u.respond(i, p.getItemInfo(e), t)
                }
            }), {
                status: !0,
                message: "inprogress"
            }
        }
    };
    return v
}), define("DS/xCityAppsOpenness/Generic", ["UWA/Core", "DS/Windows/Dialog", "DS/Controls/Button", "DS/xCityAppsOpenness/WidgetManager", "DS/xCityAppsOpenness/Publisher", "DS/xCityAppsInfra/xCityNotifications", "DS/xCityAppsInfra/xCityWidgetPreferences"], function(e, t, i, n, o, r, a) {
    "use strict";
    var s = "initialized";

    function d(t) {
        return !(!e.is(t.data, "object") || !t.data.title) && t.data.title
    }

    function l(a, s) {
        var l = new e.Element("div"),
            u = d(s) || s.publisher;
        return l.setText("Approve pairing request from " + u + " ?"), new t({
            title: "Widget Pair Request",
            content: l,
            immersiveFrame: xCity.getFrmWindow().getImmersiveFrame(),
            buttons: {
                Cancel: new i({
                    onClick: function(e) {
                        e.dsModel.dialog.close()
                    }.bind(this)
                }),
                Ok: new i({
                    onClick: function(e, t, i) {
                        i.dsModel.dialog.close();
                        var a, s = d(t) || t.publisher,
                            l = t.resolve || e;
                        n.addPairedWidget(t.publisher, s), (a = c(t)).status = "pairing-success", o.respond(l, a, t), r.display({
                            level: "success",
                            title: "Pairing Success",
                            subtitle: "Widget " + s + " has been paired."
                        })
                    }.bind(this, a, s)
                })
            }
        }), !0
    }

    function c(t, i) {
        var o = function(t) {
            return e.is(t.data, "object") && t.data.title ? {
                status: !0,
                title: t.data.title
            } : {
                status: !1,
                message: 'Invalid input. Data must be in object format. "title" key must have widget title value.'
            }
        }(t);
        return o.appType = a.appType, o.status && (o.title = widget.title, n.isPaired(t.publisher) ? o.status = "paired" : (o.status = "waiting-approval", o.message = "Awaiting pairing approval on city widget. Go to city widget and confirm the pairing.", l(i, t))), o
    }
    return {
        setStatus: function(e) {
            s = e
        },
        ping: function(t) {
            return console.info("xCity.ping", t),
                function(t) {
                    e.is(t, "object") && t.status && (s = t.status);
                    var i = {
                        appType: a.appType,
                        status: s
                    };
                    return a.isBetaMode && (i.betaMode = !0), widget.title && (i.title = widget.title), i
                }(t)
        },
        pair: function(e, t) {
            return console.info("xCity.pair", e), c(e, t)
        }
    }
}), define("DS/xCityAppsOpenness/Selection", ["UWA/Core", "DS/UrbanAPI/xCityLayer", "DS/xCityAppsInfra/xCityWidgetReferential", "DS/xCityAppsOpenness/Utility"], function(e, t, i, n) {
    "use strict";

    function o(e) {
        var t = [];
        for (var [i, n] of Object.entries(e)) {
            var o = {
                id: n.get("id"),
                name: n.get("name")
            };
            t.push(o)
        }
        return {
            representation: t
        }
    }
    return {
        selectFeatures: function(r) {
            return console.info("xCity.selectFeatures", r), new Promise(function(a, s) {
                var d, l = r.data,
                    c = r.data.filterList;
                if (!e.is(l, "object") || !e.is(l.representation)) return console.log("INVALID PARENT REP: ", l), s({
                    status: !1,
                    message: "Invalid parent representation data."
                });
                if (e.is(l.representation.id, "string")) d = xCity.findItem({
                    id: l.representation.id
                });
                else {
                    if (!e.is(l.representation.name, "string")) return console.log("INVALID REP INPUT: ", l), s({
                        status: !1,
                        message: 'Invalid "representation" value. "representation" is required. It must be an <Object>.'
                    });
                    d = xCity.findItem({
                        name: l.representation.name
                    })
                }
                if (!d) return console.log("REP NOT FOUND: ", l), s({
                    status: !1,
                    message: "Representation not found."
                });
                if (!(d instanceof t)) return console.log("REP IS NOT A LAYER: ", l), s({
                    status: !1,
                    message: "Representation is not a layer."
                });
                e.is(l.option, "object") && e.is(l.option.highlight, "string") && (n.useHighlight(l.option.highlight) || console.log("Unknown highlight color: ", l.option.highlight));
                var u = d.get("serviceId"),
                    p = d.get("objectId");
                if (!u && p) {
                    for (var g = 0; g < c.length; g++) c[g].push({
                        operator: "equals",
                        attribute: "datasetUuid",
                        value: d.get("objectId")
                    });
                    d.getLayerPrimitives(c, [], i.get("uuid"), "geoItemRepresentation").then(function(t) {
                        if (console.log("xCity.getLayerPrimitives", t), e.is(t, "object") && Object.keys(t).length) {
                            var i = o(t);
                            return a({
                                status: !0,
                                data: i
                            })
                        }
                        return console.warn("xCity.getPrimitives", " NO RESULT"), a({
                            status: !0,
                            message: "No primitives found."
                        })
                    }).catch(function(e) {
                        return console.warn("xCity.getPrimitives", e), s({
                            status: !1,
                            message: "Error in getting primitives.",
                            error: e
                        })
                    })
                } else if (e.is(c, "array") && c.length) {
                    var y;
                    for (g = 0; g < c.length; g++) {
                        var f = c[g];
                        if (e.is(f, "array") && f.length) {
                            for (var m, v = 0; v < f.length; v++) {
                                var b, h = f[v];
                                switch (h.operator) {
                                    case "equals":
                                        b = xCity.createFilter().propertyName(h.attribute).isEqualTo(h.value);
                                        break;
                                    case "greater":
                                        b = xCity.createFilter().propertyName(h.attribute).isGreaterThan(h.value);
                                        break;
                                    case "lesser":
                                        b = xCity.createFilter().propertyName(h.attribute).isLessThan(h.value);
                                        break;
                                    case "inrange":
                                        b = xCity.createFilter().propertyName(h.attribute).isBetween(h.lowerBound, h.upperBound);
                                        break;
                                    case "outrange":
                                        b = xCity.createFilter().propertyName(h.attribute).isLessThan(h.lowerBound).and(xCity.createFilter().propertyName(h.attribute).isGreaterThan(h.upperBound));
                                        break;
                                    default:
                                        return s({
                                            status: !1,
                                            message: "Non-supported operator."
                                        })
                                }
                                m ? m.and(b) : m = b
                            }
                            y ? y.or(m) : y = m
                        }
                    }
                    if (y) {
                        var I = d.findPrimitivesByCriteria(y);
                        if (e.is(I, "object") && Object.keys(I).length) {
                            console.log("RETURN ITEMS: ", I);
                            var C = o(I);
                            return a({
                                status: !0,
                                data: C
                            })
                        }
                        return console.log("No FEATURES FOUND: ", I), s({
                            status: !1,
                            message: "No features found."
                        })
                    }
                }
            })
        }
    }
}), define("DS/xCityAppsOpenness/xCityPublishSubscribeManager", ["UWA/Core", "DS/PlatformAPI/PlatformAPI", "DS/xCityAppsInfra/xCityWidgetPreferences", "DS/xCityAppsInfra/xCityNotifications", "DS/xCityAppsOpenness/Settings", "DS/xCityAppsOpenness/Permission", "DS/xCityAppsOpenness/WidgetManager", "DS/xCityAppsOpenness/Publisher", "DS/xCityAppsOpenness/Generic", "DS/xCityAppsOpenness/Basic", "DS/xCityAppsOpenness/Location", "DS/xCityAppsOpenness/LoadTemporary", "DS/xCityAppsOpenness/Selection"], function(e, t, i, n, o, r, a, s, d, l, c, u, p) {
    "use strict";
    var g = "initialized",
        y = o.getAPIPrefix(),
        f = o.getAccessLevels(),
        m = o.getSubscribeLevels(),
        v = {
            cameraSync: {
                id: "cameraSync",
                callback: c.syncCamera,
                manualRegister: !0
            },
            ping: {
                id: "ping",
                callback: d.ping
            },
            pair: {
                id: "pair",
                callback: d.pair
            },
            resolve: {
                id: "resolve",
                callback: j,
                manualRegister: !0
            },
            catch: {
                id: "catch",
                callback: P,
                manualRegister: !0
            },
            onClick: {
                id: "onClick",
                callback: l.onClick,
                manualRegister: !0
            },
            onSelect: {
                id: "onSelect",
                callback: l.onSelect,
                manualRegister: !0
            },
            onDeselect: {
                id: "onDeselect",
                callback: l.onDeselect,
                manualRegister: !0
            },
            set: {
                id: "set",
                callback: l.set
            },
            selectFeatures: {
                id: "selectFeatures",
                callback: p.selectFeatures
            },
            move: {
                id: "move",
                callback: c.move
            },
            moveTo: {
                id: "moveTo",
                callback: c.moveTo
            },
            addDataset: {
                id: "addDataset",
                callback: u.addDataset
            },
            addContent: {
                id: "addContent",
                callback: u.addContent
            },
            addData: {
                id: "addData",
                callback: u.addData
            },
            remove: {
                id: "remove",
                callback: u.remove
            }
        },
        b = {
            [f.internal]: [v.cameraSync.id], [f.generic]: [v.ping.id, v.pair.id, v.resolve.id, v.catch.id], [f.basic]: [v.onClick.id, v.onSelect.id, v.onDeselect.id, v.set.id, v.selectFeatures.id], [f.location]: [v.move.id, v.moveTo.id], [f.selection]: [], [f.loadtemporary]: [v.addDataset.id, v.addContent.id, v.addData.id, v.remove.id], [f.create]: []
        },
        h = widget.getValue("subscribeEvent"),
        I = !1,
        C = !1,
        x = !1;

    function w(e, t) {
        var i = r.getRespondPermission(e, t);
        "experience-loaded" != g && "referential-loaded" != g && e != v.ping.id && (i.status = !1, i.message = "Nothing is loaded."), i.status && (i = v[e].callback(t, y + e)), i instanceof Promise ? i.then(function(i) {
            i.silent || s.respond(y + e, i, t)
        }) : i.silent || s.respond(y + e, i, t)
    }

    function D(e, t) {
        var i = r.getBroadcastPermission(e);
        return i.status && (i = v[e].callback(t), s.broadcast(y + v.resolve.id, i, y + e)), i
    }

    function j(t) {
        if (console.log("ManageResolve"), e.is(t, "object") && t.topic) {
            if (r.isFromSelf(t.publisher) && !r.isForMe(t.widgetId)) return !1;
            if ("pair" === t.topic.replace("xCity.", "")) {
                var i = t.data.status;
                if ("pairing-success" !== i && "paired" !== i || a.isPaired(t.publisher)) {
                    if ("pairing-removed" === i) {
                        var o = a.removePairedWidget(t.publisher, !0);
                        o && n.display({
                            level: "success",
                            title: "Pairing Removal Success",
                            subtitle: "Widget " + o.title + " pairing has been removed."
                        })
                    }
                } else a.addPairedWidget(t.publisher, t.data.title), n.display({
                    level: "success",
                    title: "Pairing Success",
                    subtitle: "Widget " + t.data.title + " has been paired."
                })
            }
        }
    }

    function P(e) {
        console.log("ManageCatch")
    }
    r.setTopicAccess(b), s.setResolveRejectTopic(y + v.resolve.id, y + v.catch.id);
    var S = {
        initialize: function() {
            if (a.refreshTabWidgetList(), !C && xCity && (xCity.onWorldClick(D.bind(this, v.onClick.id), !1), xCity.onItemDeselect(D.bind(this, v.onDeselect.id)), xCity.onItemSelect(D.bind(this, v.onSelect.id)), C = !0), !I) {
                for (var e in v) {
                    var i = y + v[e].id;
                    t.unsubscribe(i), v[e].manualRegister || t.subscribe(i, w.bind(this, v[e].id))
                }
                t.subscribe(y + v.resolve.id, j), t.subscribe(y + v.catch.id, P), this.betaModeToggled(), I = !0
            }
        },
        betaModeToggled: function() {
            t.unsubscribe(y + v.cameraSync.id), i.isBetaMode ? (! function() {
                document.body.onmousedown = function(e) {
                    x = !0
                }.bind(this), document.body.onmousemove = function(e) {
                    x && s.broadcast(y + v.cameraSync.id, {
                        position: xCity.pointOfView.position.createJSON(),
                        orientation: {
                            x: xCity.pointOfView.rotationRad.x,
                            y: xCity.pointOfView.rotationRad.y
                        },
                        len: xCity.pointOfView.length
                    })
                }.bind(this), document.body.onmouseup = function(e) {
                    x = !1
                }.bind(this)
            }(), t.subscribe(y + v.cameraSync.id, w.bind(this, v.cameraSync.id))) : (document.body.onmousedown = null, document.body.onmousemove = null, document.body.onmouseup = null)
        },
        doPair: function() {
            return s.broadcast(y + v.pair.id, {
                title: widget.title
            }), !0
        },
        getPairedWidgets: function() {
            return a.getPairedWidgets()
        },
        removePairedWidget: function(e) {
            var t = a.removePairedWidget(e);
            return t && (s.broadcast(y + v.resolve.id, {
                status: "pairing-removed",
                message: 'Paired widget(s) has/have been removed. Refer to "widgetId" key for list of removed widget id.'
            }, y + v.pair.id, {
                publisher: e
            }), n.display({
                level: "success",
                title: "Pairing Removal Success",
                subtitle: "Widget " + t.title + " pairing has been removed."
            })), t
        },
        setPairedWidgetCallback: function(e) {
            a.setPairedWidgetCallback(e)
        },
        changeSyncCamType: function(e) {
            c.changeSyncCamType(e)
        },
        changeSyncCamVal: function(e) {
            c.changeSyncCamVal(e)
        },
        changeSyncCamActivation: function(e) {
            c.toggleSyncCamera(e)
        },
        refresh: function() {
            widget.getValue("subscribeEvent") === m.tab && widget.getValue("subscribeEvent") !== h && a.refreshTabWidgetList(), h = widget.getValue("subscribeEvent")
        },
        broadcastStatus: function(e) {
            "preference-edit" === e ? S.betaModeToggled() : (g = e, d.setStatus(e)), "experience-loaded" !== e && "referential-loaded" !== e || S.initialize(), D(v.ping.id, {
                status: e
            })
        }
    };
    return S
});