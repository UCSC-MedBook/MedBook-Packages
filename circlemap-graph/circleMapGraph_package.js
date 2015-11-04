var cola;
(function (cola) {
    var packingOptions = {
        PADDING: 10,
        GOLDEN_SECTION: (1 + Math.sqrt(5)) / 2,
        FLOAT_EPSILON: 0.0001,
        MAX_INERATIONS: 100
    };
    // assign x, y to nodes while using box packing algorithm for disconnected graphs
    function applyPacking(graphs, w, h, node_size, desired_ratio) {
        if (desired_ratio === void 0) { desired_ratio = 1; }
        var init_x = 0, init_y = 0, svg_width = w, svg_height = h, desired_ratio = typeof desired_ratio !== 'undefined' ? desired_ratio : 1, node_size = typeof node_size !== 'undefined' ? node_size : 0, real_width = 0, real_height = 0, min_width = 0, global_bottom = 0, line = [];
        if (graphs.length == 0)
            return;
        /// that would take care of single nodes problem
        // graphs.forEach(function (g) {
        //     if (g.array.length == 1) {
        //         g.array[0].x = 0;
        //         g.array[0].y = 0;
        //     }
        // });
        calculate_bb(graphs);
        apply(graphs, desired_ratio);
        put_nodes_to_right_positions(graphs);
        // get bounding boxes for all separate graphs
        function calculate_bb(graphs) {
            graphs.forEach(function (g) {
                calculate_single_bb(g);
            });
            function calculate_single_bb(graph) {
                var min_x = Number.MAX_VALUE, min_y = Number.MAX_VALUE, max_x = 0, max_y = 0;
                graph.array.forEach(function (v) {
                    var w = typeof v.width !== 'undefined' ? v.width : node_size;
                    var h = typeof v.height !== 'undefined' ? v.height : node_size;
                    w /= 2;
                    h /= 2;
                    max_x = Math.max(v.x + w, max_x);
                    min_x = Math.min(v.x - w, min_x);
                    max_y = Math.max(v.y + h, max_y);
                    min_y = Math.min(v.y - h, min_y);
                });
                graph.width = max_x - min_x;
                graph.height = max_y - min_y;
            }
        }
        function plot(data, left, right, opt_x, opt_y) {
            // plot the cost function
            var plot_svg = d3.select("body").append("svg").attr("width", function () {
                return 2 * (right - left);
            }).attr("height", 200);
            var x = d3.time.scale().range([0, 2 * (right - left)]);
            var xAxis = d3.svg.axis().scale(x).orient("bottom");
            plot_svg.append("g").attr("class", "x axis").attr("transform", "translate(0, 199)").call(xAxis);
            var lastX = 0;
            var lastY = 0;
            var value = 0;
            for (var r = left; r < right; r += 1) {
                value = step(data, r);
                // value = 1;
                plot_svg.append("line").attr("x1", 2 * (lastX - left)).attr("y1", 200 - 30 * lastY).attr("x2", 2 * r - 2 * left).attr("y2", 200 - 30 * value).style("stroke", "rgb(6,120,155)");
                lastX = r;
                lastY = value;
            }
            plot_svg.append("circle").attr("cx", 2 * opt_x - 2 * left).attr("cy", 200 - 30 * opt_y).attr("r", 5).style('fill', "rgba(0,0,0,0.5)");
        }
        // actual assigning of position to nodes
        function put_nodes_to_right_positions(graphs) {
            graphs.forEach(function (g) {
                // calculate current graph center:
                var center = { x: 0, y: 0 };
                g.array.forEach(function (node) {
                    center.x += node.x;
                    center.y += node.y;
                });
                center.x /= g.array.length;
                center.y /= g.array.length;
                // calculate current top left corner:
                var corner = { x: center.x - g.width / 2, y: center.y - g.height / 2 };
                var offset = { x: g.x - corner.x, y: g.y - corner.y };
                // put nodes:
                g.array.forEach(function (node) {
                    node.x = node.x + offset.x + svg_width / 2 - real_width / 2;
                    node.y = node.y + offset.y + svg_height / 2 - real_height / 2;
                });
            });
        }
        // starts box packing algorithm
        // desired ratio is 1 by default
        function apply(data, desired_ratio) {
            var curr_best_f = Number.POSITIVE_INFINITY;
            var curr_best = 0;
            data.sort(function (a, b) {
                return b.height - a.height;
            });
            min_width = data.reduce(function (a, b) {
                return a.width < b.width ? a.width : b.width;
            });
            var left = x1 = min_width;
            var right = x2 = get_entire_width(data);
            var iterationCounter = 0;
            var f_x1 = Number.MAX_VALUE;
            var f_x2 = Number.MAX_VALUE;
            var flag = -1; // determines which among f_x1 and f_x2 to recompute
            var dx = Number.MAX_VALUE;
            var df = Number.MAX_VALUE;
            while ((dx > min_width) || df > packingOptions.FLOAT_EPSILON) {
                if (flag != 1) {
                    var x1 = right - (right - left) / packingOptions.GOLDEN_SECTION;
                    var f_x1 = step(data, x1);
                }
                if (flag != 0) {
                    var x2 = left + (right - left) / packingOptions.GOLDEN_SECTION;
                    var f_x2 = step(data, x2);
                }
                dx = Math.abs(x1 - x2);
                df = Math.abs(f_x1 - f_x2);
                if (f_x1 < curr_best_f) {
                    curr_best_f = f_x1;
                    curr_best = x1;
                }
                if (f_x2 < curr_best_f) {
                    curr_best_f = f_x2;
                    curr_best = x2;
                }
                if (f_x1 > f_x2) {
                    left = x1;
                    x1 = x2;
                    f_x1 = f_x2;
                    flag = 1;
                }
                else {
                    right = x2;
                    x2 = x1;
                    f_x2 = f_x1;
                    flag = 0;
                }
                if (iterationCounter++ > 100) {
                    break;
                }
            }
            // plot(data, min_width, get_entire_width(data), curr_best, curr_best_f);
            step(data, curr_best);
        }
        // one iteration of the optimization method
        // (gives a proper, but not necessarily optimal packing)
        function step(data, max_width) {
            line = [];
            real_width = 0;
            real_height = 0;
            global_bottom = init_y;
            for (var i = 0; i < data.length; i++) {
                var o = data[i];
                put_rect(o, max_width);
            }
            return Math.abs(get_real_ratio() - desired_ratio);
        }
        // looking for a position to one box
        function put_rect(rect, max_width) {
            var parent = undefined;
            for (var i = 0; i < line.length; i++) {
                if ((line[i].space_left >= rect.height) && (line[i].x + line[i].width + rect.width + packingOptions.PADDING - max_width) <= packingOptions.FLOAT_EPSILON) {
                    parent = line[i];
                    break;
                }
            }
            line.push(rect);
            if (parent !== undefined) {
                rect.x = parent.x + parent.width + packingOptions.PADDING;
                rect.y = parent.bottom;
                rect.space_left = rect.height;
                rect.bottom = rect.y;
                parent.space_left -= rect.height + packingOptions.PADDING;
                parent.bottom += rect.height + packingOptions.PADDING;
            }
            else {
                rect.y = global_bottom;
                global_bottom += rect.height + packingOptions.PADDING;
                rect.x = init_x;
                rect.bottom = rect.y;
                rect.space_left = rect.height;
            }
            if (rect.y + rect.height - real_height > -packingOptions.FLOAT_EPSILON)
                real_height = rect.y + rect.height - init_y;
            if (rect.x + rect.width - real_width > -packingOptions.FLOAT_EPSILON)
                real_width = rect.x + rect.width - init_x;
        }
        ;
        function get_entire_width(data) {
            var width = 0;
            data.forEach(function (d) {
                return width += d.width + packingOptions.PADDING;
            });
            return width;
        }
        function get_real_ratio() {
            return (real_width / real_height);
        }
    }
    cola.applyPacking = applyPacking;
    // seraration of disconnected graphs
    // returns an array of {}
    function separateGraphs(nodes, links) {
        var marks = {};
        var ways = {};
        var graphs = [];
        var clusters = 0;
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            var n1 = link.source;
            var n2 = link.target;
            if (ways[n1.index])
                ways[n1.index].push(n2);
            else
                ways[n1.index] = [n2];
            if (ways[n2.index])
                ways[n2.index].push(n1);
            else
                ways[n2.index] = [n1];
        }
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (marks[node.index])
                continue;
            explore_node(node, true);
        }
        function explore_node(n, is_new) {
            if (marks[n.index] !== undefined)
                return;
            if (is_new) {
                clusters++;
                graphs.push({ array: [] });
            }
            marks[n.index] = clusters;
            graphs[clusters - 1].array.push(n);
            var adjacent = ways[n.index];
            if (!adjacent)
                return;
            for (var j = 0; j < adjacent.length; j++) {
                explore_node(adjacent[j], false);
            }
        }
        return graphs;
    }
    cola.separateGraphs = separateGraphs;
})(cola || (cola = {}));
///<reference path="handledisconnected.ts"/>
var cola;
(function (cola) {
    var adaptor = (function () {
        function adaptor(options) {
            this._canvasSize = [1, 1];
            this._linkDistance = 20;
            this._defaultNodeSize = 10;
            this._linkLengthCalculator = null;
            this._linkType = null;
            this._avoidOverlaps = false;
            this._handleDisconnected = true;
            this._running = false;
            this._nodes = [];
            this._groups = [];
            this._variables = [];
            this._rootGroup = null;
            this._links = [];
            this._constraints = [];
            this._distanceMatrix = null;
            this._descent = null;
            this._directedLinkConstraints = null;
            this._threshold = 0.01;
            this._visibilityGraph = null;
            this.linkAccessor = { getSourceIndex: adaptor.getSourceIndex, getTargetIndex: adaptor.getTargetIndex, setLength: adaptor.setLinkLength, getType: this.getLinkType };
            this.trigger = options.trigger; // a function that is notified of events like "tick"
            this.kick = options.kick; // a function that kicks off the iteration tick loop
            this.on = options.on; // a function for binding to events on the adapter
            this.drag = options.drag; // a function to allow for dragging of nodes
        }
        adaptor.prototype.tick = function () {
            if (this._alpha < this._threshold) {
                this._running = false;
                this.trigger({ type: "end", alpha: this._alpha = 0, stress: this._lastStress });
                return true;
            }
            var n = this._nodes.length, m = this._links.length, o;
            this._descent.locks.clear();
            for (var i = 0; i < n; ++i) {
                o = this._nodes[i];
                if (o.fixed) {
                    if (typeof o.px === 'undefined' || typeof o.py === 'undefined') {
                        o.px = o.x;
                        o.py = o.y;
                    }
                    var p = [o.px, o.py];
                    this._descent.locks.add(i, p);
                }
            }
            var s1 = this._descent.rungeKutta();
            //var s1 = descent.reduceStress();
            if (s1 === 0) {
                this._alpha = 0;
            }
            else if (typeof this._lastStress !== 'undefined') {
                this._alpha = s1; //Math.abs(Math.abs(this._lastStress / s1) - 1);
            }
            this._lastStress = s1;
            for (var i = 0; i < n; ++i) {
                o = this._nodes[i];
                if (o.fixed) {
                    o.x = o.px;
                    o.y = o.py;
                }
                else {
                    o.x = this._descent.x[0][i];
                    o.y = this._descent.x[1][i];
                }
            }
            this.trigger({ type: "tick", alpha: this._alpha, stress: this._lastStress });
        };
        /**
         * the list of nodes.
         * If nodes has not been set, but links has, then we instantiate a nodes list here, of the correct size,
         * before returning it.
         * @property nodes {Array}
         * @default empty list
         */
        adaptor.prototype.nodes = function (v) {
            if (v === void 0) { v = null; }
            if (!v) {
                if (this._nodes.length === 0 && this._links.length > 0) {
                    // if we have links but no nodes, create the nodes array now with empty objects for the links to point at.
                    var n = 0;
                    this._links.forEach(function (l) {
                        n = Math.max(n, l.source, l.target);
                    });
                    this._nodes = new Array(++n);
                    for (var i = 0; i < n; ++i) {
                        this._nodes[i] = {};
                    }
                }
                return this._nodes;
            }
            this._nodes = v;
            return this;
        };
        /**
         * a list of hierarchical groups defined over nodes
         * @property groups {Array}
         * @default empty list
         */
        adaptor.prototype.groups = function (x) {
            var _this = this;
            if (x === void 0) { x = null; }
            if (!x)
                return this._groups;
            this._groups = x;
            this._rootGroup = {};
            this._groups.forEach(function (g) {
                if (typeof g.padding === "undefined")
                    g.padding = 1;
                if (typeof g.leaves !== "undefined")
                    g.leaves.forEach(function (v, i) {
                        (g.leaves[i] = _this._nodes[v]).parent = g;
                    });
                if (typeof g.groups !== "undefined")
                    g.groups.forEach(function (gi, i) {
                        (g.groups[i] = _this._groups[gi]).parent = g;
                    });
            });
            this._rootGroup.leaves = this._nodes.filter(function (v) { return typeof v.parent === 'undefined'; });
            this._rootGroup.groups = this._groups.filter(function (g) { return typeof g.parent === 'undefined'; });
            return this;
        };
        adaptor.prototype.powerGraphGroups = function (f) {
            var g = cola.powergraph.getGroups(this._nodes, this._links, this.linkAccessor, this._rootGroup);
            this.groups(g.groups);
            f(g);
            return this;
        };
        /**
         * if true, the layout will not permit overlaps of the node bounding boxes (defined by the width and height properties on nodes)
         * @property avoidOverlaps
         * @type bool
         * @default false
         */
        adaptor.prototype.avoidOverlaps = function (v) {
            if (!arguments.length)
                return this._avoidOverlaps;
            this._avoidOverlaps = v;
            return this;
        };
        /**
         * if true, the layout will not permit overlaps of the node bounding boxes (defined by the width and height properties on nodes)
         * @property avoidOverlaps
         * @type bool
         * @default false
         */
        adaptor.prototype.handleDisconnected = function (v) {
            if (!arguments.length)
                return this._handleDisconnected;
            this._handleDisconnected = v;
            return this;
        };
        /**
         * causes constraints to be generated such that directed graphs are laid out either from left-to-right or top-to-bottom.
         * a separation constraint is generated in the selected axis for each edge that is not involved in a cycle (part of a strongly connected component)
         * @param axis {string} 'x' for left-to-right, 'y' for top-to-bottom
         * @param minSeparation {number|link=>number} either a number specifying a minimum spacing required across all links or a function to return the minimum spacing for each link
         */
        adaptor.prototype.flowLayout = function (axis, minSeparation) {
            if (!arguments.length)
                axis = 'y';
            this._directedLinkConstraints = {
                axis: axis,
                getMinSeparation: typeof minSeparation === 'number' ? function () {
                    return minSeparation;
                } : minSeparation
            };
            return this;
        };
        /**
         * links defined as source, target pairs over nodes
         * @property links {array}
         * @default empty list
         */
        adaptor.prototype.links = function (x) {
            if (!arguments.length)
                return this._links;
            this._links = x;
            return this;
        };
        /**
         * list of constraints of various types
         * @property constraints
         * @type {array}
         * @default empty list
         */
        adaptor.prototype.constraints = function (c) {
            if (!arguments.length)
                return this._constraints;
            this._constraints = c;
            return this;
        };
        /**
         * Matrix of ideal distances between all pairs of nodes.
         * If unspecified, the ideal distances for pairs of nodes will be based on the shortest path distance between them.
         * @property distanceMatrix
         * @type {Array of Array of Number}
         * @default null
         */
        adaptor.prototype.distanceMatrix = function (d) {
            if (!arguments.length)
                return this._distanceMatrix;
            this._distanceMatrix = d;
            return this;
        };
        /**
         * Size of the layout canvas dimensions [x,y]. Currently only used to determine the midpoint which is taken as the starting position
         * for nodes with no preassigned x and y.
         * @property size
         * @type {Array of Number}
         */
        adaptor.prototype.size = function (x) {
            if (x === void 0) { x = null; }
            if (!x)
                return this._canvasSize;
            this._canvasSize = x;
            return this;
        };
        /**
         * Default size (assume nodes are square so both width and height) to use in packing if node width/height are not specified.
         * @property defaultNodeSize
         * @type {Number}
         */
        adaptor.prototype.defaultNodeSize = function (x) {
            if (x === void 0) { x = null; }
            if (!x)
                return this._defaultNodeSize;
            this._defaultNodeSize = x;
            return this;
        };
        /**
         * links have an ideal distance, The automatic layout will compute layout that tries to keep links (AKA edges) as close as possible to this length.
         */
        adaptor.prototype.linkDistance = function (x) {
            if (x === void 0) { x = null; }
            if (!x) {
                return this._linkDistance;
            }
            this._linkDistance = typeof x === "function" ? x : +x;
            this._linkLengthCalculator = null;
            return this;
        };
        adaptor.prototype.linkType = function (f) {
            this._linkType = f;
            return this;
        };
        adaptor.prototype.convergenceThreshold = function (x) {
            if (x === void 0) { x = null; }
            if (!x)
                return this._threshold;
            this._threshold = typeof x === "function" ? x : +x;
            return this;
        };
        adaptor.prototype.alpha = function (x) {
            if (!arguments.length)
                return this._alpha;
            else {
                x = +x;
                if (this._alpha) {
                    if (x > 0)
                        this._alpha = x; // we might keep it hot
                    else
                        this._alpha = 0; // or, next tick will dispatch "end"
                }
                else if (x > 0) {
                    if (!this._running) {
                        this._running = true;
                        this.trigger({ type: "start", alpha: this._alpha = x });
                        this.kick(this.tick);
                    }
                }
                return this;
            }
        };
        adaptor.prototype.getLinkLength = function (link) {
            return typeof this._linkDistance === "function" ? +(this._linkDistance(link)) : this._linkDistance;
        };
        adaptor.setLinkLength = function (link, length) {
            link.length = length;
        };
        adaptor.prototype.getLinkType = function (link) {
            return typeof this._linkType === "function" ? this._linkType(link) : 0;
        };
        /**
         * compute an ideal length for each link based on the graph structure around that link.
         * you can use this (for example) to create extra space around hub-nodes in dense graphs.
         * In particular this calculation is based on the "symmetric difference" in the neighbour sets of the source and target:
         * i.e. if neighbours of source is a and neighbours of target are b then calculation is: sqrt(|a union b| - |a intersection b|)
         * Actual computation based on inspection of link structure occurs in start(), so links themselves
         * don't have to have been assigned before invoking this function.
         * @param {number} [idealLength] the base length for an edge when its source and start have no other common neighbours (e.g. 40)
         * @param {number} [w] a multiplier for the effect of the length adjustment (e.g. 0.7)
         */
        adaptor.prototype.symmetricDiffLinkLengths = function (idealLength, w) {
            var _this = this;
            this.linkDistance(function (l) { return idealLength * l.length; });
            this._linkLengthCalculator = function () { return cola.symmetricDiffLinkLengths(_this._links, _this.linkAccessor, w); };
            return this;
        };
        /**
         * compute an ideal length for each link based on the graph structure around that link.
         * you can use this (for example) to create extra space around hub-nodes in dense graphs.
         * In particular this calculation is based on the "symmetric difference" in the neighbour sets of the source and target:
         * i.e. if neighbours of source is a and neighbours of target are b then calculation is: |a intersection b|/|a union b|
         * Actual computation based on inspection of link structure occurs in start(), so links themselves
         * don't have to have been assigned before invoking this function.
         * @param {number} [idealLength] the base length for an edge when its source and start have no other common neighbours (e.g. 40)
         * @param {number} [w] a multiplier for the effect of the length adjustment (e.g. 0.7)
         */
        adaptor.prototype.jaccardLinkLengths = function (idealLength, w) {
            var _this = this;
            this.linkDistance(function (l) { return idealLength * l.length; });
            this._linkLengthCalculator = function () { return cola.jaccardLinkLengths(_this._links, _this.linkAccessor, w); };
            return this;
        };
        /**
         * start the layout process
         * @method start
         * @param {number} [initialUnconstrainedIterations=0] unconstrained initial layout iterations
         * @param {number} [initialUserConstraintIterations=0] initial layout iterations with user-specified constraints
         * @param {number} [initialAllConstraintsIterations=0] initial layout iterations with all constraints including non-overlap
         */
        adaptor.prototype.start = function () {
            var _this = this;
            var i, j, n = this.nodes().length, N = n + 2 * this._groups.length, m = this._links.length, w = this._canvasSize[0], h = this._canvasSize[1];
            if (this._linkLengthCalculator)
                this._linkLengthCalculator();
            var x = new Array(N), y = new Array(N);
            this._variables = new Array(N);
            var makeVariable = function (i, w) { return _this._variables[i] = new cola.vpsc.IndexedVariable(i, w); };
            var G = null;
            var ao = this._avoidOverlaps;
            this._nodes.forEach(function (v, i) {
                v.index = i;
                if (typeof v.x === 'undefined') {
                    v.x = w / 2, v.y = h / 2;
                }
                x[i] = v.x, y[i] = v.y;
            });
            var distances;
            if (this._distanceMatrix) {
                // use the user specified distanceMatrix
                distances = this._distanceMatrix;
            }
            else {
                // construct an n X n distance matrix based on shortest paths through graph (with respect to edge.length).
                distances = (new cola.shortestpaths.Calculator(N, this._links, adaptor.getSourceIndex, adaptor.getTargetIndex, function (l) { return _this.getLinkLength(l); })).DistanceMatrix();
                // G is a square matrix with G[i][j] = 1 iff there exists an edge between node i and node j
                // otherwise 2. (
                G = cola.Descent.createSquareMatrix(N, function () { return 2; });
                this._links.forEach(function (e) {
                    var u = adaptor.getSourceIndex(e), v = adaptor.getTargetIndex(e);
                    G[u][v] = G[v][u] = 1;
                });
            }
            var D = cola.Descent.createSquareMatrix(N, function (i, j) {
                return distances[i][j];
            });
            if (this._rootGroup && typeof this._rootGroup.groups !== 'undefined') {
                var i = n;
                this._groups.forEach(function (g) {
                    G[i][i + 1] = G[i + 1][i] = 1e-6;
                    D[i][i + 1] = D[i + 1][i] = 0.1;
                    x[i] = 0, y[i++] = 0;
                    x[i] = 0, y[i++] = 0;
                });
            }
            else
                this._rootGroup = { leaves: this._nodes, groups: [] };
            var curConstraints = this._constraints || [];
            if (this._directedLinkConstraints) {
                this.linkAccessor.getMinSeparation = this._directedLinkConstraints.getMinSeparation;
                curConstraints = curConstraints.concat(cola.generateDirectedEdgeConstraints(n, this._links, this._directedLinkConstraints.axis, (this.linkAccessor)));
            }
            var initialUnconstrainedIterations = arguments.length > 0 ? arguments[0] : 0;
            var initialUserConstraintIterations = arguments.length > 1 ? arguments[1] : 0;
            var initialAllConstraintsIterations = arguments.length > 2 ? arguments[2] : 0;
            this.avoidOverlaps(false);
            this._descent = new cola.Descent([x, y], D);
            this._descent.locks.clear();
            for (var i = 0; i < n; ++i) {
                var o = this._nodes[i];
                if (o.fixed) {
                    o.px = o.x;
                    o.py = o.y;
                    var p = [o.x, o.y];
                    this._descent.locks.add(i, p);
                }
            }
            this._descent.threshold = this._threshold;
            // apply initialIterations without user constraints or nonoverlap constraints
            this._descent.run(initialUnconstrainedIterations);
            // apply initialIterations with user constraints but no noverlap constraints
            if (curConstraints.length > 0)
                this._descent.project = new cola.vpsc.Projection(this._nodes, this._groups, this._rootGroup, curConstraints).projectFunctions();
            this._descent.run(initialUserConstraintIterations);
            // subsequent iterations will apply all constraints
            this.avoidOverlaps(ao);
            if (ao) {
                this._nodes.forEach(function (v, i) {
                    v.x = x[i], v.y = y[i];
                });
                this._descent.project = new cola.vpsc.Projection(this._nodes, this._groups, this._rootGroup, curConstraints, true).projectFunctions();
                this._nodes.forEach(function (v, i) {
                    x[i] = v.x, y[i] = v.y;
                });
            }
            // allow not immediately connected nodes to relax apart (p-stress)
            this._descent.G = G;
            this._descent.run(initialAllConstraintsIterations);
            this._links.forEach(function (l) {
                if (typeof l.source == "number")
                    l.source = _this._nodes[l.source];
                if (typeof l.target == "number")
                    l.target = _this._nodes[l.target];
            });
            this._nodes.forEach(function (v, i) {
                v.x = x[i], v.y = y[i];
            });
            // recalculate nodes position for disconnected graphs
            if (!this._distanceMatrix && this._handleDisconnected) {
                var graphs = cola.separateGraphs(this._nodes, this._links);
                cola.applyPacking(graphs, w, h, this._defaultNodeSize);
                this._nodes.forEach(function (v, i) {
                    _this._descent.x[0][i] = v.x, _this._descent.x[1][i] = v.y;
                });
            }
            return this.resume();
        };
        adaptor.prototype.resume = function () {
            return (this.alpha(0.1));
        };
        adaptor.prototype.stop = function () {
            return (this.alpha(0));
        };
        adaptor.prototype.prepareEdgeRouting = function (nodeMargin) {
            this._visibilityGraph = new cola.geom.TangentVisibilityGraph(this._nodes.map(function (v) {
                return v.bounds.inflate(-nodeMargin).vertices();
            }));
        };
        adaptor.prototype.routeEdge = function (d, draw) {
            var lineData = [];
            //if (d.source.id === 10 && d.target.id === 11) {
            //    debugger;
            //}
            var vg2 = new cola.geom.TangentVisibilityGraph(this._visibilityGraph.P, { V: this._visibilityGraph.V, E: this._visibilityGraph.E }), port1 = { x: d.source.x, y: d.source.y }, port2 = { x: d.target.x, y: d.target.y }, start = vg2.addPoint(port1, d.source.id), end = vg2.addPoint(port2, d.target.id);
            vg2.addEdgeIfVisible(port1, port2, d.source.id, d.target.id);
            if (typeof draw !== 'undefined') {
                draw(vg2);
            }
            var sourceInd = function (e) { return e.source.id; }, targetInd = function (e) { return e.target.id; }, length = function (e) { return e.length(); }, spCalc = new cola.shortestpaths.Calculator(vg2.V.length, vg2.E, sourceInd, targetInd, length), shortestPath = spCalc.PathFromNodeToNode(start.id, end.id);
            if (shortestPath.length === 1 || shortestPath.length === vg2.V.length) {
                cola.vpsc.makeEdgeBetween(d, d.source.innerBounds, d.target.innerBounds, 5);
                lineData = [{ x: d.sourceIntersection.x, y: d.sourceIntersection.y }, { x: d.arrowStart.x, y: d.arrowStart.y }];
            }
            else {
                var n = shortestPath.length - 2, p = vg2.V[shortestPath[n]].p, q = vg2.V[shortestPath[0]].p, lineData = [d.source.innerBounds.rayIntersection(p.x, p.y)];
                for (var i = n; i >= 0; --i)
                    lineData.push(vg2.V[shortestPath[i]].p);
                lineData.push(cola.vpsc.makeEdgeTo(q, d.target.innerBounds, 5));
            }
            //lineData.forEach((v, i) => {
            //    if (i > 0) {
            //        var u = lineData[i - 1];
            //        this._nodes.forEach(function (node) {
            //            if (node.id === getSourceIndex(d) || node.id === getTargetIndex(d)) return;
            //            var ints = node.innerBounds.lineIntersections(u.x, u.y, v.x, v.y);
            //            if (ints.length > 0) {
            //                debugger;
            //            }
            //        })
            //    }
            //})
            return lineData;
        };
        //The link source and target may be just a node index, or they may be references to nodes themselves.
        adaptor.getSourceIndex = function (e) {
            return typeof e.source === 'number' ? e.source : e.source.index;
        };
        //The link source and target may be just a node index, or they may be references to nodes themselves.
        adaptor.getTargetIndex = function (e) {
            return typeof e.target === 'number' ? e.target : e.target.index;
        };
        // Get a string ID for a given link.
        adaptor.linkId = function (e) {
            return adaptor.getSourceIndex(e) + "-" + adaptor.getTargetIndex(e);
        };
        return adaptor;
    })();
    cola.adaptor = adaptor;
    // The fixed property has three bits:
    // Bit 1 can be set externally (e.g., d.fixed = true) and show persist.
    // Bit 2 stores the dragging state, from mousedown to mouseup.
    // Bit 3 stores the hover state, from mouseover to mouseout.
    // Dragend is a special case: it also clears the hover state.
    function colaDragstart(d) {
        d.fixed |= 2; // set bit 2
        d.px = d.x, d.py = d.y; // set velocity to zero
    }
    cola.colaDragstart = colaDragstart;
    function colaDragend(d) {
        d.fixed &= ~6; // unset bits 2 and 3
        //d.fixed = 0;
    }
    cola.colaDragend = colaDragend;
    function colaMouseover(d) {
        d.fixed |= 4; // set bit 3
        d.px = d.x, d.py = d.y; // set velocity to zero
    }
    cola.colaMouseover = colaMouseover;
    function colaMouseout(d) {
        d.fixed &= ~4; // unset bit 3
    }
    cola.colaMouseout = colaMouseout;
})(cola || (cola = {}));
///<reference path="../extern/d3.d.ts"/>
///<reference path="adaptor.ts"/>
var cola;
(function (cola) {
    function d3adaptor() {
        var event = d3.dispatch("start", "tick", "end");
        var adaptor = new cola.adaptor({
            trigger: function (e) {
                event[e.type](e); // via d3 dispatcher, e.g. event.start(e);
            },
            on: function (type, listener) {
                event.on(type, listener);
                return adaptor;
            },
            kick: function (tick) {
                d3.timer(function () {
                    return adaptor.tick();
                });
            },
            // use `node.call(adaptor.drag)` to make nodes draggable
            drag: function () {
                var drag = d3.behavior.drag().origin(function (d) {
                    return d;
                }).on("dragstart.d3adaptor", cola.colaDragstart).on("drag.d3adaptor", function (d) {
                    d.px = d3.event.x, d.py = d3.event.y;
                    adaptor.resume(); // restart annealing
                }).on("dragend.d3adaptor", cola.colaDragend);
                if (!arguments.length)
                    return drag;
                this.call(drag);
            }
        });
        return adaptor;
    }
    cola.d3adaptor = d3adaptor;
    ;
})(cola || (cola = {}));
/**
 * @module cola
 */
var cola;
(function (cola) {
    /**
     * Descent respects a collection of locks over nodes that should not move
     * @class Locks
     */
    var Locks = (function () {
        function Locks() {
            this.locks = {};
        }
        /**
         * add a lock on the node at index id
         * @method add
         * @param id index of node to be locked
         * @param x required position for node
         */
        Locks.prototype.add = function (id, x) {
            if (isNaN(x[0]) || isNaN(x[1]))
                debugger;
            this.locks[id] = x;
        };
        /**
         * @method clear clear all locks
         */
        Locks.prototype.clear = function () {
            this.locks = {};
        };
        /**
         * @isEmpty
         * @returns false if no locks exist
         */
        Locks.prototype.isEmpty = function () {
            for (var l in this.locks)
                return false;
            return true;
        };
        /**
         * perform an operation on each lock
         * @apply
         */
        Locks.prototype.apply = function (f) {
            for (var l in this.locks) {
                f(l, this.locks[l]);
            }
        };
        return Locks;
    })();
    cola.Locks = Locks;
    /**
     * Uses a gradient descent approach to reduce a stress or p-stress goal function over a graph with specified ideal edge lengths or a square matrix of dissimilarities.
     *
     * @class Descent
     */
    var Descent = (function () {
        /**
         * @method constructor
         * @param x {number[][]} initial coordinates for nodes
         * @param D {number[][]} matrix of desired distances between pairs of nodes
         * @param G {number[][]} [default=null] if specified, G is a matrix of weights for goal terms between pairs of nodes.
         * If G[i][j] > 1 and the separation between nodes i and j is greater than their ideal distance, then there is no contribution for this pair to the goal
         * If G[i][j] <= 1 then it is used as a weighting on the contribution of the variance between ideal and actual separation between i and j to the goal function
         */
        function Descent(x, D, G) {
            if (G === void 0) { G = null; }
            this.D = D;
            this.G = G;
            this.threshold = 0.0001;
            this.random = new PseudoRandom();
            this.project = null;
            this.x = x;
            this.k = x.length; // dimensionality
            var n = this.n = x[0].length; // number of nodes
            this.H = new Array(this.k);
            this.g = new Array(this.k);
            this.Hd = new Array(this.k);
            this.a = new Array(this.k);
            this.b = new Array(this.k);
            this.c = new Array(this.k);
            this.d = new Array(this.k);
            this.e = new Array(this.k);
            this.ia = new Array(this.k);
            this.ib = new Array(this.k);
            this.xtmp = new Array(this.k);
            this.locks = new Locks();
            this.minD = Number.MAX_VALUE;
            var i = n, j;
            while (i--) {
                j = n;
                while (--j > i) {
                    var d = D[i][j];
                    if (d > 0 && d < this.minD) {
                        this.minD = d;
                    }
                }
            }
            if (this.minD === Number.MAX_VALUE)
                this.minD = 1;
            i = this.k;
            while (i--) {
                this.g[i] = new Array(n);
                this.H[i] = new Array(n);
                j = n;
                while (j--) {
                    this.H[i][j] = new Array(n);
                }
                this.Hd[i] = new Array(n);
                this.a[i] = new Array(n);
                this.b[i] = new Array(n);
                this.c[i] = new Array(n);
                this.d[i] = new Array(n);
                this.e[i] = new Array(n);
                this.ia[i] = new Array(n);
                this.ib[i] = new Array(n);
                this.xtmp[i] = new Array(n);
            }
        }
        Descent.createSquareMatrix = function (n, f) {
            var M = new Array(n);
            for (var i = 0; i < n; ++i) {
                M[i] = new Array(n);
                for (var j = 0; j < n; ++j) {
                    M[i][j] = f(i, j);
                }
            }
            return M;
        };
        Descent.prototype.offsetDir = function () {
            var _this = this;
            var u = new Array(this.k);
            var l = 0;
            for (var i = 0; i < this.k; ++i) {
                var x = u[i] = this.random.getNextBetween(0.01, 1) - 0.5;
                l += x * x;
            }
            l = Math.sqrt(l);
            return u.map(function (x) { return x *= _this.minD / l; });
        };
        // compute first and second derivative information storing results in this.g and this.H
        Descent.prototype.computeDerivatives = function (x) {
            var _this = this;
            var n = this.n;
            if (n < 1)
                return;
            var i;
            /* DEBUG
                        for (var u: number = 0; u < n; ++u)
                            for (i = 0; i < this.k; ++i)
                                if (isNaN(x[i][u])) debugger;
            DEBUG */
            var d = new Array(this.k);
            var d2 = new Array(this.k);
            var Huu = new Array(this.k);
            var maxH = 0;
            for (var u = 0; u < n; ++u) {
                for (i = 0; i < this.k; ++i)
                    Huu[i] = this.g[i][u] = 0;
                for (var v = 0; v < n; ++v) {
                    if (u === v)
                        continue;
                    // The following loop randomly displaces nodes that are at identical positions
                    var maxDisplaces = n; // avoid infinite loop in the case of numerical issues, such as huge values
                    while (maxDisplaces--) {
                        var sd2 = 0;
                        for (i = 0; i < this.k; ++i) {
                            var dx = d[i] = x[i][u] - x[i][v];
                            sd2 += d2[i] = dx * dx;
                        }
                        if (sd2 > 1e-9)
                            break;
                        var rd = this.offsetDir();
                        for (i = 0; i < this.k; ++i)
                            x[i][v] += rd[i];
                    }
                    var l = Math.sqrt(sd2);
                    var D = this.D[u][v];
                    var weight = this.G != null ? this.G[u][v] : 1;
                    if (weight > 1 && l > D || !isFinite(D)) {
                        for (i = 0; i < this.k; ++i)
                            this.H[i][u][v] = 0;
                        continue;
                    }
                    if (weight > 1) {
                        weight = 1;
                    }
                    var D2 = D * D;
                    var gs = weight * (l - D) / (D2 * l);
                    var hs = -weight / (D2 * l * l * l);
                    if (!isFinite(gs))
                        console.log(gs);
                    for (i = 0; i < this.k; ++i) {
                        this.g[i][u] += d[i] * gs;
                        Huu[i] -= this.H[i][u][v] = hs * (D * (d2[i] - sd2) + l * sd2);
                    }
                }
                for (i = 0; i < this.k; ++i)
                    maxH = Math.max(maxH, this.H[i][u][u] = Huu[i]);
            }
            if (!this.locks.isEmpty()) {
                this.locks.apply(function (u, p) {
                    for (i = 0; i < _this.k; ++i) {
                        _this.H[i][u][u] += maxH;
                        _this.g[i][u] -= maxH * (p[i] - x[i][u]);
                    }
                });
            }
            /* DEBUG
                        for (var u: number = 0; u < n; ++u)
                            for (i = 0; i < this.k; ++i) {
                                if (isNaN(this.g[i][u])) debugger;
                                for (var v: number = 0; v < n; ++v)
                                    if (isNaN(this.H[i][u][v])) debugger;
                            }
            DEBUG */
        };
        Descent.dotProd = function (a, b) {
            var x = 0, i = a.length;
            while (i--)
                x += a[i] * b[i];
            return x;
        };
        // result r = matrix m * vector v
        Descent.rightMultiply = function (m, v, r) {
            var i = m.length;
            while (i--)
                r[i] = Descent.dotProd(m[i], v);
        };
        // computes the optimal step size to take in direction d using the
        // derivative information in this.g and this.H
        // returns the scalar multiplier to apply to d to get the optimal step
        Descent.prototype.computeStepSize = function (d) {
            var numerator = 0, denominator = 0;
            for (var i = 0; i < 2; ++i) {
                numerator += Descent.dotProd(this.g[i], d[i]);
                Descent.rightMultiply(this.H[i], d[i], this.Hd[i]);
                denominator += Descent.dotProd(d[i], this.Hd[i]);
            }
            if (denominator === 0 || !isFinite(denominator))
                return 0;
            return numerator / denominator;
        };
        Descent.prototype.reduceStress = function () {
            this.computeDerivatives(this.x);
            var alpha = this.computeStepSize(this.g);
            for (var i = 0; i < this.k; ++i) {
                this.takeDescentStep(this.x[i], this.g[i], alpha);
            }
            return this.computeStress();
        };
        Descent.copy = function (a, b) {
            var m = a.length, n = b[0].length;
            for (var i = 0; i < m; ++i) {
                for (var j = 0; j < n; ++j) {
                    b[i][j] = a[i][j];
                }
            }
        };
        // takes a step of stepSize * d from x0, and then project against any constraints.
        // result is returned in r.
        // x0: starting positions
        // r: result positions will be returned here
        // d: unconstrained descent vector
        // stepSize: amount to step along d
        Descent.prototype.stepAndProject = function (x0, r, d, stepSize) {
            Descent.copy(x0, r);
            this.takeDescentStep(r[0], d[0], stepSize);
            if (this.project)
                this.project[0](x0[0], x0[1], r[0]);
            this.takeDescentStep(r[1], d[1], stepSize);
            if (this.project)
                this.project[1](r[0], x0[1], r[1]);
        };
        Descent.mApply = function (m, n, f) {
            var i = m;
            while (i-- > 0) {
                var j = n;
                while (j-- > 0)
                    f(i, j);
            }
        };
        Descent.prototype.matrixApply = function (f) {
            Descent.mApply(this.k, this.n, f);
        };
        Descent.prototype.computeNextPosition = function (x0, r) {
            var _this = this;
            this.computeDerivatives(x0);
            var alpha = this.computeStepSize(this.g);
            this.stepAndProject(x0, r, this.g, alpha);
            for (var u = 0; u < this.n; ++u)
                for (var i = 0; i < this.k; ++i)
                    if (isNaN(r[i][u]))
                        debugger;
            if (this.project) {
                this.matrixApply(function (i, j) { return _this.e[i][j] = x0[i][j] - r[i][j]; });
                var beta = this.computeStepSize(this.e);
                beta = Math.max(0.2, Math.min(beta, 1));
                this.stepAndProject(x0, r, this.e, beta);
            }
        };
        Descent.prototype.run = function (iterations) {
            var stress = Number.MAX_VALUE, converged = false;
            while (!converged && iterations-- > 0) {
                var s = this.rungeKutta();
                converged = Math.abs(stress / s - 1) < this.threshold;
                stress = s;
            }
            return stress;
        };
        Descent.prototype.rungeKutta = function () {
            var _this = this;
            this.computeNextPosition(this.x, this.a);
            Descent.mid(this.x, this.a, this.ia);
            this.computeNextPosition(this.ia, this.b);
            Descent.mid(this.x, this.b, this.ib);
            this.computeNextPosition(this.ib, this.c);
            this.computeNextPosition(this.c, this.d);
            var disp = 0;
            this.matrixApply(function (i, j) {
                var x = (_this.a[i][j] + 2.0 * _this.b[i][j] + 2.0 * _this.c[i][j] + _this.d[i][j]) / 6.0, d = _this.x[i][j] - x;
                disp += d * d;
                _this.x[i][j] = x;
            });
            return disp;
        };
        Descent.mid = function (a, b, m) {
            Descent.mApply(a.length, a[0].length, function (i, j) { return m[i][j] = a[i][j] + (b[i][j] - a[i][j]) / 2.0; });
        };
        Descent.prototype.takeDescentStep = function (x, d, stepSize) {
            for (var i = 0; i < this.n; ++i) {
                x[i] = x[i] - stepSize * d[i];
            }
        };
        Descent.prototype.computeStress = function () {
            var stress = 0;
            for (var u = 0, nMinus1 = this.n - 1; u < nMinus1; ++u) {
                for (var v = u + 1, n = this.n; v < n; ++v) {
                    var l = 0;
                    for (var i = 0; i < this.k; ++i) {
                        var dx = this.x[i][u] - this.x[i][v];
                        l += dx * dx;
                    }
                    l = Math.sqrt(l);
                    var d = this.D[u][v];
                    if (!isFinite(d))
                        continue;
                    var rl = d - l;
                    var d2 = d * d;
                    stress += rl * rl / d2;
                }
            }
            return stress;
        };
        Descent.zeroDistance = 1e-10;
        return Descent;
    })();
    cola.Descent = Descent;
    // Linear congruential pseudo random number generator
    var PseudoRandom = (function () {
        function PseudoRandom(seed) {
            if (seed === void 0) { seed = 1; }
            this.seed = seed;
            this.a = 214013;
            this.c = 2531011;
            this.m = 2147483648;
            this.range = 32767;
        }
        // random real between 0 and 1
        PseudoRandom.prototype.getNext = function () {
            this.seed = (this.seed * this.a + this.c) % this.m;
            return (this.seed >> 16) / this.range;
        };
        // random real between min and max
        PseudoRandom.prototype.getNextBetween = function (min, max) {
            return min + this.getNext() * (max - min);
        };
        return PseudoRandom;
    })();
    cola.PseudoRandom = PseudoRandom;
})(cola || (cola = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var cola;
(function (cola) {
    var geom;
    (function (geom) {
        var Point = (function () {
            function Point() {
            }
            return Point;
        })();
        geom.Point = Point;
        var LineSegment = (function () {
            function LineSegment(x1, y1, x2, y2) {
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;
            }
            return LineSegment;
        })();
        geom.LineSegment = LineSegment;
        var PolyPoint = (function (_super) {
            __extends(PolyPoint, _super);
            function PolyPoint() {
                _super.apply(this, arguments);
            }
            return PolyPoint;
        })(Point);
        geom.PolyPoint = PolyPoint;
        /** tests if a point is Left|On|Right of an infinite line.
         * @param points P0, P1, and P2
         * @return >0 for P2 left of the line through P0 and P1
         *            =0 for P2 on the line
         *            <0 for P2 right of the line
         */
        function isLeft(P0, P1, P2) {
            return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
        }
        geom.isLeft = isLeft;
        function above(p, vi, vj) {
            return isLeft(p, vi, vj) > 0;
        }
        function below(p, vi, vj) {
            return isLeft(p, vi, vj) < 0;
        }
        /**
         * returns the convex hull of a set of points using Andrew's monotone chain algorithm
         * see: http://geomalgorithms.com/a10-_hull-1.html#Monotone%20Chain
         * @param S array of points
         * @return the convex hull as an array of points
         */
        function ConvexHull(S) {
            var P = S.slice(0).sort(function (a, b) { return a.x !== b.x ? b.x - a.x : b.y - a.y; });
            var n = S.length, i;
            var minmin = 0;
            var xmin = P[0].x;
            for (i = 1; i < n; ++i) {
                if (P[i].x !== xmin)
                    break;
            }
            var minmax = i - 1;
            var H = [];
            H.push(P[minmin]); // push minmin point onto stack
            if (minmax === n - 1) {
                if (P[minmax].y !== P[minmin].y)
                    H.push(P[minmax]);
            }
            else {
                // Get the indices of points with max x-coord and min|max y-coord
                var maxmin, maxmax = n - 1;
                var xmax = P[n - 1].x;
                for (i = n - 2; i >= 0; i--)
                    if (P[i].x !== xmax)
                        break;
                maxmin = i + 1;
                // Compute the lower hull on the stack H
                i = minmax;
                while (++i <= maxmin) {
                    // the lower line joins P[minmin]  with P[maxmin]
                    if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin)
                        continue; // ignore P[i] above or on the lower line
                    while (H.length > 1) {
                        // test if  P[i] is left of the line at the stack top
                        if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                            break;
                        else
                            H.length -= 1; // pop top point off  stack
                    }
                    if (i != minmin)
                        H.push(P[i]);
                }
                // Next, compute the upper hull on the stack H above the bottom hull
                if (maxmax != maxmin)
                    H.push(P[maxmax]); // push maxmax point onto stack
                var bot = H.length; // the bottom point of the upper hull stack
                i = maxmin;
                while (--i >= minmax) {
                    // the upper line joins P[maxmax]  with P[minmax]
                    if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax)
                        continue; // ignore P[i] below or on the upper line
                    while (H.length > bot) {
                        // test if  P[i] is left of the line at the stack top
                        if (isLeft(H[H.length - 2], H[H.length - 1], P[i]) > 0)
                            break;
                        else
                            H.length -= 1; // pop top point off  stack
                    }
                    if (i != minmin)
                        H.push(P[i]); // push P[i] onto stack
                }
            }
            return H;
        }
        geom.ConvexHull = ConvexHull;
        // apply f to the points in P in clockwise order around the point p
        function clockwiseRadialSweep(p, P, f) {
            P.slice(0).sort(function (a, b) { return Math.atan2(a.y - p.y, a.x - p.x) - Math.atan2(b.y - p.y, b.x - p.x); }).forEach(f);
        }
        geom.clockwiseRadialSweep = clockwiseRadialSweep;
        function nextPolyPoint(p, ps) {
            if (p.polyIndex === ps.length - 1)
                return ps[0];
            return ps[p.polyIndex + 1];
        }
        function prevPolyPoint(p, ps) {
            if (p.polyIndex === 0)
                return ps[ps.length - 1];
            return ps[p.polyIndex - 1];
        }
        // tangent_PointPolyC(): fast binary search for tangents to a convex polygon
        //    Input:  P = a 2D point (exterior to the polygon)
        //            n = number of polygon vertices
        //            V = array of vertices for a 2D convex polygon with V[n] = V[0]
        //    Output: rtan = index of rightmost tangent point V[rtan]
        //            ltan = index of leftmost tangent point V[ltan]
        function tangent_PointPolyC(P, V) {
            return { rtan: Rtangent_PointPolyC(P, V), ltan: Ltangent_PointPolyC(P, V) };
        }
        // Rtangent_PointPolyC(): binary search for convex polygon right tangent
        //    Input:  P = a 2D point (exterior to the polygon)
        //            n = number of polygon vertices
        //            V = array of vertices for a 2D convex polygon with V[n] = V[0]
        //    Return: index "i" of rightmost tangent point V[i]
        function Rtangent_PointPolyC(P, V) {
            var n = V.length - 1;
            // use binary search for large convex polygons
            var a, b, c; // indices for edge chain endpoints
            var upA, dnC; // test for up direction of edges a and c
            // rightmost tangent = maximum for the isLeft() ordering
            // test if V[0] is a local maximum
            if (below(P, V[1], V[0]) && !above(P, V[n - 1], V[0]))
                return 0; // V[0] is the maximum tangent point
            for (a = 0, b = n;;) {
                if (b - a === 1)
                    if (above(P, V[a], V[b]))
                        return a;
                    else
                        return b;
                c = Math.floor((a + b) / 2); // midpoint of [a,b], and 0<c<n
                dnC = below(P, V[c + 1], V[c]);
                if (dnC && !above(P, V[c - 1], V[c]))
                    return c; // V[c] is the maximum tangent point
                // no max yet, so continue with the binary search
                // pick one of the two subchains [a,c] or [c,b]
                upA = above(P, V[a + 1], V[a]);
                if (upA) {
                    if (dnC)
                        b = c; // select [a,c]
                    else {
                        if (above(P, V[a], V[c]))
                            b = c; // select [a,c]
                        else
                            a = c; // select [c,b]
                    }
                }
                else {
                    if (!dnC)
                        a = c; // select [c,b]
                    else {
                        if (below(P, V[a], V[c]))
                            b = c; // select [a,c]
                        else
                            a = c; // select [c,b]
                    }
                }
            }
        }
        // Ltangent_PointPolyC(): binary search for convex polygon left tangent
        //    Input:  P = a 2D point (exterior to the polygon)
        //            n = number of polygon vertices
        //            V = array of vertices for a 2D convex polygon with V[n]=V[0]
        //    Return: index "i" of leftmost tangent point V[i]
        function Ltangent_PointPolyC(P, V) {
            var n = V.length - 1;
            // use binary search for large convex polygons
            var a, b, c; // indices for edge chain endpoints
            var dnA, dnC; // test for down direction of edges a and c
            // leftmost tangent = minimum for the isLeft() ordering
            // test if V[0] is a local minimum
            if (above(P, V[n - 1], V[0]) && !below(P, V[1], V[0]))
                return 0; // V[0] is the minimum tangent point
            for (a = 0, b = n;;) {
                if (b - a === 1)
                    if (below(P, V[a], V[b]))
                        return a;
                    else
                        return b;
                c = Math.floor((a + b) / 2); // midpoint of [a,b], and 0<c<n
                dnC = below(P, V[c + 1], V[c]);
                if (above(P, V[c - 1], V[c]) && !dnC)
                    return c; // V[c] is the minimum tangent point
                // no min yet, so continue with the binary search
                // pick one of the two subchains [a,c] or [c,b]
                dnA = below(P, V[a + 1], V[a]);
                if (dnA) {
                    if (!dnC)
                        b = c; // select [a,c]
                    else {
                        if (below(P, V[a], V[c]))
                            b = c; // select [a,c]
                        else
                            a = c; // select [c,b]
                    }
                }
                else {
                    if (dnC)
                        a = c; // select [c,b]
                    else {
                        if (above(P, V[a], V[c]))
                            b = c; // select [a,c]
                        else
                            a = c; // select [c,b]
                    }
                }
            }
        }
        // RLtangent_PolyPolyC(): get the RL tangent between two convex polygons
        //    Input:  m = number of vertices in polygon 1
        //            V = array of vertices for convex polygon 1 with V[m]=V[0]
        //            n = number of vertices in polygon 2
        //            W = array of vertices for convex polygon 2 with W[n]=W[0]
        //    Output: *t1 = index of tangent point V[t1] for polygon 1
        //            *t2 = index of tangent point W[t2] for polygon 2
        function tangent_PolyPolyC(V, W, t1, t2, cmp1, cmp2) {
            var ix1, ix2; // search indices for polygons 1 and 2
            // first get the initial vertex on each polygon
            ix1 = t1(W[0], V); // right tangent from W[0] to V
            ix2 = t2(V[ix1], W); // left tangent from V[ix1] to W
            // ping-pong linear search until it stabilizes
            var done = false; // flag when done
            while (!done) {
                done = true; // assume done until...
                while (true) {
                    if (ix1 === V.length - 1)
                        ix1 = 0;
                    if (cmp1(W[ix2], V[ix1], V[ix1 + 1]))
                        break;
                    ++ix1; // get Rtangent from W[ix2] to V
                }
                while (true) {
                    if (ix2 === 0)
                        ix2 = W.length - 1;
                    if (cmp2(V[ix1], W[ix2], W[ix2 - 1]))
                        break;
                    --ix2; // get Ltangent from V[ix1] to W
                    done = false; // not done if had to adjust this
                }
            }
            return { t1: ix1, t2: ix2 };
        }
        geom.tangent_PolyPolyC = tangent_PolyPolyC;
        function LRtangent_PolyPolyC(V, W) {
            var rl = RLtangent_PolyPolyC(W, V);
            return { t1: rl.t2, t2: rl.t1 };
        }
        geom.LRtangent_PolyPolyC = LRtangent_PolyPolyC;
        function RLtangent_PolyPolyC(V, W) {
            return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Ltangent_PointPolyC, above, below);
        }
        geom.RLtangent_PolyPolyC = RLtangent_PolyPolyC;
        function LLtangent_PolyPolyC(V, W) {
            return tangent_PolyPolyC(V, W, Ltangent_PointPolyC, Ltangent_PointPolyC, below, below);
        }
        geom.LLtangent_PolyPolyC = LLtangent_PolyPolyC;
        function RRtangent_PolyPolyC(V, W) {
            return tangent_PolyPolyC(V, W, Rtangent_PointPolyC, Rtangent_PointPolyC, above, above);
        }
        geom.RRtangent_PolyPolyC = RRtangent_PolyPolyC;
        var BiTangent = (function () {
            function BiTangent(t1, t2) {
                this.t1 = t1;
                this.t2 = t2;
            }
            return BiTangent;
        })();
        geom.BiTangent = BiTangent;
        var BiTangents = (function () {
            function BiTangents() {
            }
            return BiTangents;
        })();
        geom.BiTangents = BiTangents;
        var TVGPoint = (function (_super) {
            __extends(TVGPoint, _super);
            function TVGPoint() {
                _super.apply(this, arguments);
            }
            return TVGPoint;
        })(Point);
        geom.TVGPoint = TVGPoint;
        var VisibilityVertex = (function () {
            function VisibilityVertex(id, polyid, polyvertid, p) {
                this.id = id;
                this.polyid = polyid;
                this.polyvertid = polyvertid;
                this.p = p;
                p.vv = this;
            }
            return VisibilityVertex;
        })();
        geom.VisibilityVertex = VisibilityVertex;
        var VisibilityEdge = (function () {
            function VisibilityEdge(source, target) {
                this.source = source;
                this.target = target;
            }
            VisibilityEdge.prototype.length = function () {
                var dx = this.source.p.x - this.target.p.x;
                var dy = this.source.p.y - this.target.p.y;
                return Math.sqrt(dx * dx + dy * dy);
            };
            return VisibilityEdge;
        })();
        geom.VisibilityEdge = VisibilityEdge;
        var TangentVisibilityGraph = (function () {
            function TangentVisibilityGraph(P, g0) {
                this.P = P;
                this.V = [];
                this.E = [];
                if (!g0) {
                    var n = P.length;
                    for (var i = 0; i < n; i++) {
                        var p = P[i];
                        for (var j = 0; j < p.length; ++j) {
                            var pj = p[j], vv = new VisibilityVertex(this.V.length, i, j, pj);
                            this.V.push(vv);
                            if (j > 0)
                                this.E.push(new VisibilityEdge(p[j - 1].vv, vv));
                        }
                    }
                    for (var i = 0; i < n - 1; i++) {
                        var Pi = P[i];
                        for (var j = i + 1; j < n; j++) {
                            var Pj = P[j], t = geom.tangents(Pi, Pj);
                            for (var q in t) {
                                var c = t[q], source = Pi[c.t1], target = Pj[c.t2];
                                this.addEdgeIfVisible(source, target, i, j);
                            }
                        }
                    }
                }
                else {
                    this.V = g0.V.slice(0);
                    this.E = g0.E.slice(0);
                }
            }
            TangentVisibilityGraph.prototype.addEdgeIfVisible = function (u, v, i1, i2) {
                if (!this.intersectsPolys(new LineSegment(u.x, u.y, v.x, v.y), i1, i2)) {
                    this.E.push(new VisibilityEdge(u.vv, v.vv));
                }
            };
            TangentVisibilityGraph.prototype.addPoint = function (p, i1) {
                var n = this.P.length;
                this.V.push(new VisibilityVertex(this.V.length, n, 0, p));
                for (var i = 0; i < n; ++i) {
                    if (i === i1)
                        continue;
                    var poly = this.P[i], t = tangent_PointPolyC(p, poly);
                    this.addEdgeIfVisible(p, poly[t.ltan], i1, i);
                    this.addEdgeIfVisible(p, poly[t.rtan], i1, i);
                }
                return p.vv;
            };
            TangentVisibilityGraph.prototype.intersectsPolys = function (l, i1, i2) {
                for (var i = 0, n = this.P.length; i < n; ++i) {
                    if (i != i1 && i != i2 && intersects(l, this.P[i]).length > 0) {
                        return true;
                    }
                }
                return false;
            };
            return TangentVisibilityGraph;
        })();
        geom.TangentVisibilityGraph = TangentVisibilityGraph;
        function intersects(l, P) {
            var ints = [];
            for (var i = 1, n = P.length; i < n; ++i) {
                var intersect = cola.vpsc.Rectangle.lineIntersection(l.x1, l.y1, l.x2, l.y2, P[i - 1].x, P[i - 1].y, P[i].x, P[i].y);
                if (intersect)
                    ints.push(intersect);
            }
            return ints;
        }
        function tangents(V, W) {
            var m = V.length - 1, n = W.length - 1;
            var bt = new BiTangents();
            for (var i = 0; i < m; ++i) {
                for (var j = 0; j < n; ++j) {
                    var v1 = V[i == 0 ? m - 1 : i - 1];
                    var v2 = V[i];
                    var v3 = V[i + 1];
                    var w1 = W[j == 0 ? n - 1 : j - 1];
                    var w2 = W[j];
                    var w3 = W[j + 1];
                    var v1v2w2 = isLeft(v1, v2, w2);
                    var v2w1w2 = isLeft(v2, w1, w2);
                    var v2w2w3 = isLeft(v2, w2, w3);
                    var w1w2v2 = isLeft(w1, w2, v2);
                    var w2v1v2 = isLeft(w2, v1, v2);
                    var w2v2v3 = isLeft(w2, v2, v3);
                    if (v1v2w2 >= 0 && v2w1w2 >= 0 && v2w2w3 < 0 && w1w2v2 >= 0 && w2v1v2 >= 0 && w2v2v3 < 0) {
                        bt.ll = new BiTangent(i, j);
                    }
                    else if (v1v2w2 <= 0 && v2w1w2 <= 0 && v2w2w3 > 0 && w1w2v2 <= 0 && w2v1v2 <= 0 && w2v2v3 > 0) {
                        bt.rr = new BiTangent(i, j);
                    }
                    else if (v1v2w2 <= 0 && v2w1w2 > 0 && v2w2w3 <= 0 && w1w2v2 >= 0 && w2v1v2 < 0 && w2v2v3 >= 0) {
                        bt.rl = new BiTangent(i, j);
                    }
                    else if (v1v2w2 >= 0 && v2w1w2 < 0 && v2w2w3 >= 0 && w1w2v2 <= 0 && w2v1v2 > 0 && w2v2v3 <= 0) {
                        bt.lr = new BiTangent(i, j);
                    }
                }
            }
            return bt;
        }
        geom.tangents = tangents;
        function isPointInsidePoly(p, poly) {
            for (var i = 1, n = poly.length; i < n; ++i)
                if (below(poly[i - 1], poly[i], p))
                    return false;
            return true;
        }
        function isAnyPInQ(p, q) {
            return !p.every(function (v) { return !isPointInsidePoly(v, q); });
        }
        function polysOverlap(p, q) {
            if (isAnyPInQ(p, q))
                return true;
            if (isAnyPInQ(q, p))
                return true;
            for (var i = 1, n = p.length; i < n; ++i) {
                var v = p[i], u = p[i - 1];
                if (intersects(new LineSegment(u.x, u.y, v.x, v.y), q).length > 0)
                    return true;
            }
            return false;
        }
        geom.polysOverlap = polysOverlap;
    })(geom = cola.geom || (cola.geom = {}));
})(cola || (cola = {}));
var cola;
(function (cola) {
    var vpsc;
    (function (vpsc) {
        var PositionStats = (function () {
            function PositionStats(scale) {
                this.scale = scale;
                this.AB = 0;
                this.AD = 0;
                this.A2 = 0;
            }
            PositionStats.prototype.addVariable = function (v) {
                var ai = this.scale / v.scale;
                var bi = v.offset / v.scale;
                var wi = v.weight;
                this.AB += wi * ai * bi;
                this.AD += wi * ai * v.desiredPosition;
                this.A2 += wi * ai * ai;
            };
            PositionStats.prototype.getPosn = function () {
                return (this.AD - this.AB) / this.A2;
            };
            return PositionStats;
        })();
        vpsc.PositionStats = PositionStats;
        var Constraint = (function () {
            function Constraint(left, right, gap, equality) {
                if (equality === void 0) { equality = false; }
                this.left = left;
                this.right = right;
                this.gap = gap;
                this.equality = equality;
                this.active = false;
                this.unsatisfiable = false;
                this.left = left;
                this.right = right;
                this.gap = gap;
                this.equality = equality;
            }
            Constraint.prototype.slack = function () {
                return this.unsatisfiable ? Number.MAX_VALUE : this.right.scale * this.right.position() - this.gap - this.left.scale * this.left.position();
            };
            return Constraint;
        })();
        vpsc.Constraint = Constraint;
        var Variable = (function () {
            function Variable(desiredPosition, weight, scale) {
                if (weight === void 0) { weight = 1; }
                if (scale === void 0) { scale = 1; }
                this.desiredPosition = desiredPosition;
                this.weight = weight;
                this.scale = scale;
                this.offset = 0;
            }
            Variable.prototype.dfdv = function () {
                return 2.0 * this.weight * (this.position() - this.desiredPosition);
            };
            Variable.prototype.position = function () {
                return (this.block.ps.scale * this.block.posn + this.offset) / this.scale;
            };
            // visit neighbours by active constraints within the same block
            Variable.prototype.visitNeighbours = function (prev, f) {
                var ff = function (c, next) { return c.active && prev !== next && f(c, next); };
                this.cOut.forEach(function (c) { return ff(c, c.right); });
                this.cIn.forEach(function (c) { return ff(c, c.left); });
            };
            return Variable;
        })();
        vpsc.Variable = Variable;
        var Block = (function () {
            function Block(v) {
                this.vars = [];
                v.offset = 0;
                this.ps = new PositionStats(v.scale);
                this.addVariable(v);
            }
            Block.prototype.addVariable = function (v) {
                v.block = this;
                this.vars.push(v);
                this.ps.addVariable(v);
                this.posn = this.ps.getPosn();
            };
            // move the block where it needs to be to minimize cost
            Block.prototype.updateWeightedPosition = function () {
                this.ps.AB = this.ps.AD = this.ps.A2 = 0;
                for (var i = 0, n = this.vars.length; i < n; ++i)
                    this.ps.addVariable(this.vars[i]);
                this.posn = this.ps.getPosn();
            };
            Block.prototype.compute_lm = function (v, u, postAction) {
                var _this = this;
                var dfdv = v.dfdv();
                v.visitNeighbours(u, function (c, next) {
                    var _dfdv = _this.compute_lm(next, v, postAction);
                    if (next === c.right) {
                        dfdv += _dfdv * c.left.scale;
                        c.lm = _dfdv;
                    }
                    else {
                        dfdv += _dfdv * c.right.scale;
                        c.lm = -_dfdv;
                    }
                    postAction(c);
                });
                return dfdv / v.scale;
            };
            Block.prototype.populateSplitBlock = function (v, prev) {
                var _this = this;
                v.visitNeighbours(prev, function (c, next) {
                    next.offset = v.offset + (next === c.right ? c.gap : -c.gap);
                    _this.addVariable(next);
                    _this.populateSplitBlock(next, v);
                });
            };
            // traverse the active constraint tree applying visit to each active constraint
            Block.prototype.traverse = function (visit, acc, v, prev) {
                var _this = this;
                if (v === void 0) { v = this.vars[0]; }
                if (prev === void 0) { prev = null; }
                v.visitNeighbours(prev, function (c, next) {
                    acc.push(visit(c));
                    _this.traverse(visit, acc, next, v);
                });
            };
            // calculate lagrangian multipliers on constraints and
            // find the active constraint in this block with the smallest lagrangian.
            // if the lagrangian is negative, then the constraint is a split candidate.
            Block.prototype.findMinLM = function () {
                var m = null;
                this.compute_lm(this.vars[0], null, function (c) {
                    if (!c.equality && (m === null || c.lm < m.lm))
                        m = c;
                });
                return m;
            };
            Block.prototype.findMinLMBetween = function (lv, rv) {
                this.compute_lm(lv, null, function () {
                });
                var m = null;
                this.findPath(lv, null, rv, function (c, next) {
                    if (!c.equality && c.right === next && (m === null || c.lm < m.lm))
                        m = c;
                });
                return m;
            };
            Block.prototype.findPath = function (v, prev, to, visit) {
                var _this = this;
                var endFound = false;
                v.visitNeighbours(prev, function (c, next) {
                    if (!endFound && (next === to || _this.findPath(next, v, to, visit))) {
                        endFound = true;
                        visit(c, next);
                    }
                });
                return endFound;
            };
            // Search active constraint tree from u to see if there is a directed path to v.
            // Returns true if path is found.
            Block.prototype.isActiveDirectedPathBetween = function (u, v) {
                if (u === v)
                    return true;
                var i = u.cOut.length;
                while (i--) {
                    var c = u.cOut[i];
                    if (c.active && this.isActiveDirectedPathBetween(c.right, v))
                        return true;
                }
                return false;
            };
            // split the block into two by deactivating the specified constraint
            Block.split = function (c) {
                /* DEBUG
                            console.log("split on " + c);
                            console.assert(c.active, "attempt to split on inactive constraint");
                DEBUG */
                c.active = false;
                return [Block.createSplitBlock(c.left), Block.createSplitBlock(c.right)];
            };
            Block.createSplitBlock = function (startVar) {
                var b = new Block(startVar);
                b.populateSplitBlock(startVar, null);
                return b;
            };
            // find a split point somewhere between the specified variables
            Block.prototype.splitBetween = function (vl, vr) {
                /* DEBUG
                            console.assert(vl.block === this);
                            console.assert(vr.block === this);
                DEBUG */
                var c = this.findMinLMBetween(vl, vr);
                if (c !== null) {
                    var bs = Block.split(c);
                    return { constraint: c, lb: bs[0], rb: bs[1] };
                }
                // couldn't find a split point - for example the active path is all equality constraints
                return null;
            };
            Block.prototype.mergeAcross = function (b, c, dist) {
                c.active = true;
                for (var i = 0, n = b.vars.length; i < n; ++i) {
                    var v = b.vars[i];
                    v.offset += dist;
                    this.addVariable(v);
                }
                this.posn = this.ps.getPosn();
            };
            Block.prototype.cost = function () {
                var sum = 0, i = this.vars.length;
                while (i--) {
                    var v = this.vars[i], d = v.position() - v.desiredPosition;
                    sum += d * d * v.weight;
                }
                return sum;
            };
            return Block;
        })();
        vpsc.Block = Block;
        var Blocks = (function () {
            function Blocks(vs) {
                this.vs = vs;
                var n = vs.length;
                this.list = new Array(n);
                while (n--) {
                    var b = new Block(vs[n]);
                    this.list[n] = b;
                    b.blockInd = n;
                }
            }
            Blocks.prototype.cost = function () {
                var sum = 0, i = this.list.length;
                while (i--)
                    sum += this.list[i].cost();
                return sum;
            };
            Blocks.prototype.insert = function (b) {
                /* DEBUG
                            console.assert(!this.contains(b), "blocks error: tried to reinsert block " + b.blockInd)
                DEBUG */
                b.blockInd = this.list.length;
                this.list.push(b);
                /* DEBUG
                            console.log("insert block: " + b.blockInd);
                            this.contains(b);
                DEBUG */
            };
            Blocks.prototype.remove = function (b) {
                /* DEBUG
                            console.log("remove block: " + b.blockInd);
                            console.assert(this.contains(b));
                DEBUG */
                var last = this.list.length - 1;
                var swapBlock = this.list[last];
                this.list.length = last;
                if (b !== swapBlock) {
                    this.list[b.blockInd] = swapBlock;
                    swapBlock.blockInd = b.blockInd;
                }
            };
            // merge the blocks on either side of the specified constraint, by copying the smaller block into the larger
            // and deleting the smaller.
            Blocks.prototype.merge = function (c) {
                var l = c.left.block, r = c.right.block;
                /* DEBUG
                            console.assert(l!==r, "attempt to merge within the same block");
                DEBUG */
                var dist = c.right.offset - c.left.offset - c.gap;
                if (l.vars.length < r.vars.length) {
                    r.mergeAcross(l, c, dist);
                    this.remove(l);
                }
                else {
                    l.mergeAcross(r, c, -dist);
                    this.remove(r);
                }
                /* DEBUG
                            console.assert(Math.abs(c.slack()) < 1e-6, "Error: Constraint should be at equality after merge!");
                            console.log("merged on " + c);
                DEBUG */
            };
            Blocks.prototype.forEach = function (f) {
                this.list.forEach(f);
            };
            // useful, for example, after variable desired positions change.
            Blocks.prototype.updateBlockPositions = function () {
                this.list.forEach(function (b) { return b.updateWeightedPosition(); });
            };
            // split each block across its constraint with the minimum lagrangian
            Blocks.prototype.split = function (inactive) {
                var _this = this;
                this.updateBlockPositions();
                this.list.forEach(function (b) {
                    var v = b.findMinLM();
                    if (v !== null && v.lm < Solver.LAGRANGIAN_TOLERANCE) {
                        b = v.left.block;
                        Block.split(v).forEach(function (nb) { return _this.insert(nb); });
                        _this.remove(b);
                        inactive.push(v);
                    }
                });
            };
            return Blocks;
        })();
        vpsc.Blocks = Blocks;
        var Solver = (function () {
            function Solver(vs, cs) {
                this.vs = vs;
                this.cs = cs;
                this.vs = vs;
                vs.forEach(function (v) {
                    v.cIn = [], v.cOut = [];
                    /* DEBUG
                                    v.toString = () => "v" + vs.indexOf(v);
                    DEBUG */
                });
                this.cs = cs;
                cs.forEach(function (c) {
                    c.left.cOut.push(c);
                    c.right.cIn.push(c);
                    /* DEBUG
                                    c.toString = () => c.left + "+" + c.gap + "<=" + c.right + " slack=" + c.slack() + " active=" + c.active;
                    DEBUG */
                });
                this.inactive = cs.map(function (c) {
                    c.active = false;
                    return c;
                });
                this.bs = null;
            }
            Solver.prototype.cost = function () {
                return this.bs.cost();
            };
            // set starting positions without changing desired positions.
            // Note: it throws away any previous block structure.
            Solver.prototype.setStartingPositions = function (ps) {
                this.inactive = this.cs.map(function (c) {
                    c.active = false;
                    return c;
                });
                this.bs = new Blocks(this.vs);
                this.bs.forEach(function (b, i) { return b.posn = ps[i]; });
            };
            Solver.prototype.setDesiredPositions = function (ps) {
                this.vs.forEach(function (v, i) { return v.desiredPosition = ps[i]; });
            };
            /* DEBUG
                    private getId(v: Variable): number {
                        return this.vs.indexOf(v);
                    }

                    // sanity check of the index integrity of the inactive list
                    checkInactive(): void {
                        var inactiveCount = 0;
                        this.cs.forEach(c=> {
                            var i = this.inactive.indexOf(c);
                            console.assert(!c.active && i >= 0 || c.active && i < 0, "constraint should be in the inactive list if it is not active: " + c);
                            if (i >= 0) {
                                inactiveCount++;
                            } else {
                                console.assert(c.active, "inactive constraint not found in inactive list: " + c);
                            }
                        });
                        console.assert(inactiveCount === this.inactive.length, inactiveCount + " inactive constraints found, " + this.inactive.length + "in inactive list");
                    }
                    // after every call to satisfy the following should check should pass
                    checkSatisfied(): void {
                        this.cs.forEach(c=>console.assert(c.slack() >= vpsc.Solver.ZERO_UPPERBOUND, "Error: Unsatisfied constraint! "+c));
                    }
            DEBUG */
            Solver.prototype.mostViolated = function () {
                var minSlack = Number.MAX_VALUE, v = null, l = this.inactive, n = l.length, deletePoint = n;
                for (var i = 0; i < n; ++i) {
                    var c = l[i];
                    if (c.unsatisfiable)
                        continue;
                    var slack = c.slack();
                    if (c.equality || slack < minSlack) {
                        minSlack = slack;
                        v = c;
                        deletePoint = i;
                        if (c.equality)
                            break;
                    }
                }
                if (deletePoint !== n && (minSlack < Solver.ZERO_UPPERBOUND && !v.active || v.equality)) {
                    l[deletePoint] = l[n - 1];
                    l.length = n - 1;
                }
                return v;
            };
            // satisfy constraints by building block structure over violated constraints
            // and moving the blocks to their desired positions
            Solver.prototype.satisfy = function () {
                if (this.bs == null) {
                    this.bs = new Blocks(this.vs);
                }
                /* DEBUG
                            console.log("satisfy: " + this.bs);
                DEBUG */
                this.bs.split(this.inactive);
                var v = null;
                while ((v = this.mostViolated()) && (v.equality || v.slack() < Solver.ZERO_UPPERBOUND && !v.active)) {
                    var lb = v.left.block, rb = v.right.block;
                    /* DEBUG
                                    console.log("most violated is: " + v);
                                    this.bs.contains(lb);
                                    this.bs.contains(rb);
                    DEBUG */
                    if (lb !== rb) {
                        this.bs.merge(v);
                    }
                    else {
                        if (lb.isActiveDirectedPathBetween(v.right, v.left)) {
                            // cycle found!
                            v.unsatisfiable = true;
                            continue;
                        }
                        // constraint is within block, need to split first
                        var split = lb.splitBetween(v.left, v.right);
                        if (split !== null) {
                            this.bs.insert(split.lb);
                            this.bs.insert(split.rb);
                            this.bs.remove(lb);
                            this.inactive.push(split.constraint);
                        }
                        else {
                            /* DEBUG
                                                    console.log("unsatisfiable constraint found");
                            DEBUG */
                            v.unsatisfiable = true;
                            continue;
                        }
                        if (v.slack() >= 0) {
                            /* DEBUG
                                                    console.log("violated constraint indirectly satisfied: " + v);
                            DEBUG */
                            // v was satisfied by the above split!
                            this.inactive.push(v);
                        }
                        else {
                            /* DEBUG
                                                    console.log("merge after split:");
                            DEBUG */
                            this.bs.merge(v);
                        }
                    }
                }
                /* DEBUG
                            this.checkSatisfied();
                DEBUG */
            };
            // repeatedly build and split block structure until we converge to an optimal solution
            Solver.prototype.solve = function () {
                this.satisfy();
                var lastcost = Number.MAX_VALUE, cost = this.bs.cost();
                while (Math.abs(lastcost - cost) > 0.0001) {
                    this.satisfy();
                    lastcost = cost;
                    cost = this.bs.cost();
                }
                return cost;
            };
            Solver.LAGRANGIAN_TOLERANCE = -1e-4;
            Solver.ZERO_UPPERBOUND = -1e-10;
            return Solver;
        })();
        vpsc.Solver = Solver;
    })(vpsc = cola.vpsc || (cola.vpsc = {}));
})(cola || (cola = {}));
///<reference path="vpsc.ts"/>
///<reference path="rbtree.d.ts"/>
var cola;
(function (cola) {
    var vpsc;
    (function (vpsc) {
        function computeGroupBounds(g) {
            g.bounds = typeof g.leaves !== "undefined" ? g.leaves.reduce(function (r, c) { return c.bounds.union(r); }, Rectangle.empty()) : Rectangle.empty();
            if (typeof g.groups !== "undefined")
                g.bounds = g.groups.reduce(function (r, c) { return computeGroupBounds(c).union(r); }, g.bounds);
            g.bounds = g.bounds.inflate(g.padding);
            return g.bounds;
        }
        vpsc.computeGroupBounds = computeGroupBounds;
        var Rectangle = (function () {
            function Rectangle(x, X, y, Y) {
                this.x = x;
                this.X = X;
                this.y = y;
                this.Y = Y;
            }
            Rectangle.empty = function () {
                return new Rectangle(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
            };
            Rectangle.prototype.cx = function () {
                return (this.x + this.X) / 2;
            };
            Rectangle.prototype.cy = function () {
                return (this.y + this.Y) / 2;
            };
            Rectangle.prototype.overlapX = function (r) {
                var ux = this.cx(), vx = r.cx();
                if (ux <= vx && r.x < this.X)
                    return this.X - r.x;
                if (vx <= ux && this.x < r.X)
                    return r.X - this.x;
                return 0;
            };
            Rectangle.prototype.overlapY = function (r) {
                var uy = this.cy(), vy = r.cy();
                if (uy <= vy && r.y < this.Y)
                    return this.Y - r.y;
                if (vy <= uy && this.y < r.Y)
                    return r.Y - this.y;
                return 0;
            };
            Rectangle.prototype.setXCentre = function (cx) {
                var dx = cx - this.cx();
                this.x += dx;
                this.X += dx;
            };
            Rectangle.prototype.setYCentre = function (cy) {
                var dy = cy - this.cy();
                this.y += dy;
                this.Y += dy;
            };
            Rectangle.prototype.width = function () {
                return this.X - this.x;
            };
            Rectangle.prototype.height = function () {
                return this.Y - this.y;
            };
            Rectangle.prototype.union = function (r) {
                return new Rectangle(Math.min(this.x, r.x), Math.max(this.X, r.X), Math.min(this.y, r.y), Math.max(this.Y, r.Y));
            };
            /**
             * return any intersection points between the given line and the sides of this rectangle
             * @method lineIntersection
             * @param x1 number first x coord of line
             * @param y1 number first y coord of line
             * @param x2 number second x coord of line
             * @param y2 number second y coord of line
             * @return any intersection points found
             */
            Rectangle.prototype.lineIntersections = function (x1, y1, x2, y2) {
                var sides = [[this.x, this.y, this.X, this.y], [this.X, this.y, this.X, this.Y], [this.X, this.Y, this.x, this.Y], [this.x, this.Y, this.x, this.y]];
                var intersections = [];
                for (var i = 0; i < 4; ++i) {
                    var r = Rectangle.lineIntersection(x1, y1, x2, y2, sides[i][0], sides[i][1], sides[i][2], sides[i][3]);
                    if (r !== null)
                        intersections.push({ x: r.x, y: r.y });
                }
                return intersections;
            };
            /**
             * return any intersection points between a line extending from the centre of this rectangle to the given point,
             *  and the sides of this rectangle
             * @method lineIntersection
             * @param x2 number second x coord of line
             * @param y2 number second y coord of line
             * @return any intersection points found
             */
            Rectangle.prototype.rayIntersection = function (x2, y2) {
                var ints = this.lineIntersections(this.cx(), this.cy(), x2, y2);
                return ints.length > 0 ? ints[0] : null;
            };
            Rectangle.prototype.vertices = function () {
                return [
                    { x: this.x, y: this.y },
                    { x: this.X, y: this.y },
                    { x: this.X, y: this.Y },
                    { x: this.x, y: this.Y },
                    { x: this.x, y: this.y }
                ];
            };
            Rectangle.lineIntersection = function (x1, y1, x2, y2, x3, y3, x4, y4) {
                var dx12 = x2 - x1, dx34 = x4 - x3, dy12 = y2 - y1, dy34 = y4 - y3, denominator = dy34 * dx12 - dx34 * dy12;
                if (denominator == 0)
                    return null;
                var dx31 = x1 - x3, dy31 = y1 - y3, numa = dx34 * dy31 - dy34 * dx31, a = numa / denominator, numb = dx12 * dy31 - dy12 * dx31, b = numb / denominator;
                if (a >= 0 && a <= 1 && b >= 0 && b <= 1) {
                    return {
                        x: x1 + a * dx12,
                        y: y1 + a * dy12
                    };
                }
                return null;
            };
            Rectangle.prototype.inflate = function (pad) {
                return new Rectangle(this.x - pad, this.X + pad, this.y - pad, this.Y + pad);
            };
            return Rectangle;
        })();
        vpsc.Rectangle = Rectangle;
        function makeEdgeBetween(link, source, target, ah) {
            var si = source.rayIntersection(target.cx(), target.cy());
            if (!si)
                si = { x: source.cx(), y: source.cy() };
            var ti = target.rayIntersection(source.cx(), source.cy());
            if (!ti)
                ti = { x: target.cx(), y: target.cy() };
            var dx = ti.x - si.x, dy = ti.y - si.y, l = Math.sqrt(dx * dx + dy * dy), al = l - ah;
            link.sourceIntersection = si;
            link.targetIntersection = ti;
            link.arrowStart = { x: si.x + al * dx / l, y: si.y + al * dy / l };
        }
        vpsc.makeEdgeBetween = makeEdgeBetween;
        function makeEdgeTo(s, target, ah) {
            var ti = target.rayIntersection(s.x, s.y);
            if (!ti)
                ti = { x: target.cx(), y: target.cy() };
            var dx = ti.x - s.x, dy = ti.y - s.y, l = Math.sqrt(dx * dx + dy * dy);
            return { x: ti.x - ah * dx / l, y: ti.y - ah * dy / l };
        }
        vpsc.makeEdgeTo = makeEdgeTo;
        var Node = (function () {
            function Node(v, r, pos) {
                this.v = v;
                this.r = r;
                this.pos = pos;
                this.prev = makeRBTree();
                this.next = makeRBTree();
            }
            return Node;
        })();
        var Event = (function () {
            function Event(isOpen, v, pos) {
                this.isOpen = isOpen;
                this.v = v;
                this.pos = pos;
            }
            return Event;
        })();
        function compareEvents(a, b) {
            if (a.pos > b.pos) {
                return 1;
            }
            if (a.pos < b.pos) {
                return -1;
            }
            if (a.isOpen) {
                // open must come before close
                return -1;
            }
            return 0;
        }
        function makeRBTree() {
            return new RBTree(function (a, b) { return a.pos - b.pos; });
        }
        var xRect = {
            getCentre: function (r) { return r.cx(); },
            getOpen: function (r) { return r.y; },
            getClose: function (r) { return r.Y; },
            getSize: function (r) { return r.width(); },
            makeRect: function (open, close, center, size) { return new Rectangle(center - size / 2, center + size / 2, open, close); },
            findNeighbours: findXNeighbours
        };
        var yRect = {
            getCentre: function (r) { return r.cy(); },
            getOpen: function (r) { return r.x; },
            getClose: function (r) { return r.X; },
            getSize: function (r) { return r.height(); },
            makeRect: function (open, close, center, size) { return new Rectangle(open, close, center - size / 2, center + size / 2); },
            findNeighbours: findYNeighbours
        };
        function generateGroupConstraints(root, f, minSep, isContained) {
            if (isContained === void 0) { isContained = false; }
            var padding = root.padding, gn = typeof root.groups !== 'undefined' ? root.groups.length : 0, ln = typeof root.leaves !== 'undefined' ? root.leaves.length : 0, childConstraints = !gn ? [] : root.groups.reduce(function (ccs, g) { return ccs.concat(generateGroupConstraints(g, f, minSep, true)); }, []), n = (isContained ? 2 : 0) + ln + gn, vs = new Array(n), rs = new Array(n), i = 0, add = function (r, v) {
                rs[i] = r;
                vs[i++] = v;
            };
            if (isContained) {
                // if this group is contained by another, then we add two dummy vars and rectangles for the borders
                var b = root.bounds, c = f.getCentre(b), s = f.getSize(b) / 2, open = f.getOpen(b), close = f.getClose(b), min = c - s + padding / 2, max = c + s - padding / 2;
                root.minVar.desiredPosition = min;
                add(f.makeRect(open, close, min, padding), root.minVar);
                root.maxVar.desiredPosition = max;
                add(f.makeRect(open, close, max, padding), root.maxVar);
            }
            if (ln)
                root.leaves.forEach(function (l) { return add(l.bounds, l.variable); });
            if (gn)
                root.groups.forEach(function (g) {
                    var b = g.bounds;
                    add(f.makeRect(f.getOpen(b), f.getClose(b), f.getCentre(b), f.getSize(b)), g.minVar);
                });
            var cs = generateConstraints(rs, vs, f, minSep);
            if (gn) {
                vs.forEach(function (v) {
                    v.cOut = [], v.cIn = [];
                });
                cs.forEach(function (c) {
                    c.left.cOut.push(c), c.right.cIn.push(c);
                });
                root.groups.forEach(function (g) {
                    var gapAdjustment = (g.padding - f.getSize(g.bounds)) / 2;
                    g.minVar.cIn.forEach(function (c) { return c.gap += gapAdjustment; });
                    g.minVar.cOut.forEach(function (c) {
                        c.left = g.maxVar;
                        c.gap += gapAdjustment;
                    });
                });
            }
            return childConstraints.concat(cs);
        }
        function generateConstraints(rs, vars, rect, minSep) {
            var i, n = rs.length;
            var N = 2 * n;
            console.assert(vars.length >= n);
            var events = new Array(N);
            for (i = 0; i < n; ++i) {
                var r = rs[i];
                var v = new Node(vars[i], r, rect.getCentre(r));
                events[i] = new Event(true, v, rect.getOpen(r));
                events[i + n] = new Event(false, v, rect.getClose(r));
            }
            events.sort(compareEvents);
            var cs = new Array();
            var scanline = makeRBTree();
            for (i = 0; i < N; ++i) {
                var e = events[i];
                var v = e.v;
                if (e.isOpen) {
                    scanline.insert(v);
                    rect.findNeighbours(v, scanline);
                }
                else {
                    // close event
                    scanline.remove(v);
                    var makeConstraint = function (l, r) {
                        var sep = (rect.getSize(l.r) + rect.getSize(r.r)) / 2 + minSep;
                        cs.push(new vpsc.Constraint(l.v, r.v, sep));
                    };
                    var visitNeighbours = function (forward, reverse, mkcon) {
                        var u, it = v[forward].iterator();
                        while ((u = it[forward]()) !== null) {
                            mkcon(u, v);
                            u[reverse].remove(v);
                        }
                    };
                    visitNeighbours("prev", "next", function (u, v) { return makeConstraint(u, v); });
                    visitNeighbours("next", "prev", function (u, v) { return makeConstraint(v, u); });
                }
            }
            console.assert(scanline.size === 0);
            return cs;
        }
        function findXNeighbours(v, scanline) {
            var f = function (forward, reverse) {
                var it = scanline.findIter(v);
                var u;
                while ((u = it[forward]()) !== null) {
                    var uovervX = u.r.overlapX(v.r);
                    if (uovervX <= 0 || uovervX <= u.r.overlapY(v.r)) {
                        v[forward].insert(u);
                        u[reverse].insert(v);
                    }
                    if (uovervX <= 0) {
                        break;
                    }
                }
            };
            f("next", "prev");
            f("prev", "next");
        }
        function findYNeighbours(v, scanline) {
            var f = function (forward, reverse) {
                var u = scanline.findIter(v)[forward]();
                if (u !== null && u.r.overlapX(v.r) > 0) {
                    v[forward].insert(u);
                    u[reverse].insert(v);
                }
            };
            f("next", "prev");
            f("prev", "next");
        }
        function generateXConstraints(rs, vars) {
            return generateConstraints(rs, vars, xRect, 1e-6);
        }
        vpsc.generateXConstraints = generateXConstraints;
        function generateYConstraints(rs, vars) {
            return generateConstraints(rs, vars, yRect, 1e-6);
        }
        vpsc.generateYConstraints = generateYConstraints;
        function generateXGroupConstraints(root) {
            return generateGroupConstraints(root, xRect, 1e-6);
        }
        vpsc.generateXGroupConstraints = generateXGroupConstraints;
        function generateYGroupConstraints(root) {
            return generateGroupConstraints(root, yRect, 1e-6);
        }
        vpsc.generateYGroupConstraints = generateYGroupConstraints;
        function removeOverlaps(rs) {
            var vs = rs.map(function (r) { return new vpsc.Variable(r.cx()); });
            var cs = vpsc.generateXConstraints(rs, vs);
            var solver = new vpsc.Solver(vs, cs);
            solver.solve();
            vs.forEach(function (v, i) { return rs[i].setXCentre(v.position()); });
            vs = rs.map(function (r) {
                return new vpsc.Variable(r.cy());
            });
            cs = vpsc.generateYConstraints(rs, vs);
            solver = new vpsc.Solver(vs, cs);
            solver.solve();
            vs.forEach(function (v, i) { return rs[i].setYCentre(v.position()); });
        }
        vpsc.removeOverlaps = removeOverlaps;
        var IndexedVariable = (function (_super) {
            __extends(IndexedVariable, _super);
            function IndexedVariable(index, w) {
                _super.call(this, 0, w);
                this.index = index;
            }
            return IndexedVariable;
        })(vpsc.Variable);
        vpsc.IndexedVariable = IndexedVariable;
        var Projection = (function () {
            function Projection(nodes, groups, rootGroup, constraints, avoidOverlaps) {
                var _this = this;
                if (rootGroup === void 0) { rootGroup = null; }
                if (constraints === void 0) { constraints = null; }
                if (avoidOverlaps === void 0) { avoidOverlaps = false; }
                this.nodes = nodes;
                this.groups = groups;
                this.rootGroup = rootGroup;
                this.avoidOverlaps = avoidOverlaps;
                this.variables = nodes.map(function (v, i) {
                    return v.variable = new IndexedVariable(i, 1);
                });
                if (constraints)
                    this.createConstraints(constraints);
                if (avoidOverlaps && rootGroup && typeof rootGroup.groups !== 'undefined') {
                    nodes.forEach(function (v) {
                        if (!v.width || !v.height) {
                            //If undefined, default to nothing
                            v.bounds = new vpsc.Rectangle(v.x, v.x, v.y, v.y);
                            return;
                        }
                        var w2 = v.width / 2, h2 = v.height / 2;
                        v.bounds = new vpsc.Rectangle(v.x - w2, v.x + w2, v.y - h2, v.y + h2);
                    });
                    computeGroupBounds(rootGroup);
                    var i = nodes.length;
                    groups.forEach(function (g) {
                        _this.variables[i] = g.minVar = new IndexedVariable(i++, 0.01);
                        _this.variables[i] = g.maxVar = new IndexedVariable(i++, 0.01);
                    });
                }
            }
            Projection.prototype.createSeparation = function (c) {
                return new vpsc.Constraint(this.nodes[c.left].variable, this.nodes[c.right].variable, c.gap, typeof c.equality !== "undefined" ? c.equality : false);
            };
            Projection.prototype.makeFeasible = function (c) {
                var _this = this;
                if (!this.avoidOverlaps)
                    return;
                var axis = 'x', dim = 'width';
                if (c.axis === 'x')
                    axis = 'y', dim = 'height';
                var vs = c.offsets.map(function (o) { return _this.nodes[o.node]; }).sort(function (a, b) { return a[axis] - b[axis]; });
                var p = null;
                vs.forEach(function (v) {
                    if (p)
                        v[axis] = p[axis] + p[dim] + 1;
                    p = v;
                });
            };
            Projection.prototype.createAlignment = function (c) {
                var _this = this;
                var u = this.nodes[c.offsets[0].node].variable;
                this.makeFeasible(c);
                var cs = c.axis === 'x' ? this.xConstraints : this.yConstraints;
                c.offsets.slice(1).forEach(function (o) {
                    var v = _this.nodes[o.node].variable;
                    cs.push(new vpsc.Constraint(u, v, o.offset, true));
                });
            };
            Projection.prototype.createConstraints = function (constraints) {
                var _this = this;
                var isSep = function (c) { return typeof c.type === 'undefined' || c.type === 'separation'; };
                this.xConstraints = constraints.filter(function (c) { return c.axis === "x" && isSep(c); }).map(function (c) { return _this.createSeparation(c); });
                this.yConstraints = constraints.filter(function (c) { return c.axis === "y" && isSep(c); }).map(function (c) { return _this.createSeparation(c); });
                constraints.filter(function (c) { return c.type === 'alignment'; }).forEach(function (c) { return _this.createAlignment(c); });
            };
            Projection.prototype.setupVariablesAndBounds = function (x0, y0, desired, getDesired) {
                this.nodes.forEach(function (v, i) {
                    if (v.fixed) {
                        v.variable.weight = 1000;
                        desired[i] = getDesired(v);
                    }
                    else {
                        v.variable.weight = 1;
                    }
                    var w = (v.width || 0) / 2, h = (v.height || 0) / 2;
                    var ix = x0[i], iy = y0[i];
                    v.bounds = new Rectangle(ix - w, ix + w, iy - h, iy + h);
                });
            };
            Projection.prototype.xProject = function (x0, y0, x) {
                if (!this.rootGroup && !(this.avoidOverlaps || this.xConstraints))
                    return;
                this.project(x0, y0, x0, x, function (v) { return v.px; }, this.xConstraints, generateXGroupConstraints, function (v) { return v.bounds.setXCentre(x[v.variable.index] = v.variable.position()); }, function (g) {
                    var xmin = x[g.minVar.index] = g.minVar.position();
                    var xmax = x[g.maxVar.index] = g.maxVar.position();
                    var p2 = g.padding / 2;
                    g.bounds.x = xmin - p2;
                    g.bounds.X = xmax + p2;
                });
            };
            Projection.prototype.yProject = function (x0, y0, y) {
                if (!this.rootGroup && !this.yConstraints)
                    return;
                this.project(x0, y0, y0, y, function (v) { return v.py; }, this.yConstraints, generateYGroupConstraints, function (v) { return v.bounds.setYCentre(y[v.variable.index] = v.variable.position()); }, function (g) {
                    var ymin = y[g.minVar.index] = g.minVar.position();
                    var ymax = y[g.maxVar.index] = g.maxVar.position();
                    var p2 = g.padding / 2;
                    g.bounds.y = ymin - p2;
                    ;
                    g.bounds.Y = ymax + p2;
                });
            };
            Projection.prototype.projectFunctions = function () {
                var _this = this;
                return [
                    function (x0, y0, x) { return _this.xProject(x0, y0, x); },
                    function (x0, y0, y) { return _this.yProject(x0, y0, y); }
                ];
            };
            Projection.prototype.project = function (x0, y0, start, desired, getDesired, cs, generateConstraints, updateNodeBounds, updateGroupBounds) {
                this.setupVariablesAndBounds(x0, y0, desired, getDesired);
                if (this.rootGroup && this.avoidOverlaps) {
                    computeGroupBounds(this.rootGroup);
                    cs = cs.concat(generateConstraints(this.rootGroup));
                }
                this.solve(this.variables, cs, start, desired);
                this.nodes.forEach(updateNodeBounds);
                if (this.rootGroup && this.avoidOverlaps) {
                    this.groups.forEach(updateGroupBounds);
                }
            };
            Projection.prototype.solve = function (vs, cs, starting, desired) {
                var solver = new vpsc.Solver(vs, cs);
                solver.setStartingPositions(starting);
                solver.setDesiredPositions(desired);
                solver.solve();
            };
            return Projection;
        })();
        vpsc.Projection = Projection;
    })(vpsc = cola.vpsc || (cola.vpsc = {}));
})(cola || (cola = {}));
var PairingHeap = (function () {
    // from: https://gist.github.com/nervoussystem
    //{elem:object, subheaps:[array of heaps]}
    function PairingHeap(elem) {
        this.elem = elem;
        this.subheaps = [];
    }
    PairingHeap.prototype.toString = function (selector) {
        var str = "", needComma = false;
        for (var i = 0; i < this.subheaps.length; ++i) {
            var subheap = this.subheaps[i];
            if (!subheap.elem) {
                needComma = false;
                continue;
            }
            if (needComma) {
                str = str + ",";
            }
            str = str + subheap.toString(selector);
            needComma = true;
        }
        if (str !== "") {
            str = "(" + str + ")";
        }
        return (this.elem ? selector(this.elem) : "") + str;
    };
    PairingHeap.prototype.forEach = function (f) {
        if (!this.empty()) {
            f(this.elem, this);
            this.subheaps.forEach(function (s) { return s.forEach(f); });
        }
    };
    PairingHeap.prototype.count = function () {
        return this.empty() ? 0 : 1 + this.subheaps.reduce(function (n, h) {
            return n + h.count();
        }, 0);
    };
    PairingHeap.prototype.min = function () {
        return this.elem;
    };
    PairingHeap.prototype.empty = function () {
        return this.elem == null;
    };
    PairingHeap.prototype.contains = function (h) {
        if (this === h)
            return true;
        for (var i = 0; i < this.subheaps.length; i++) {
            if (this.subheaps[i].contains(h))
                return true;
        }
        return false;
    };
    PairingHeap.prototype.isHeap = function (lessThan) {
        var _this = this;
        return this.subheaps.every(function (h) { return lessThan(_this.elem, h.elem) && h.isHeap(lessThan); });
    };
    PairingHeap.prototype.insert = function (obj, lessThan) {
        return this.merge(new PairingHeap(obj), lessThan);
    };
    PairingHeap.prototype.merge = function (heap2, lessThan) {
        if (this.empty())
            return heap2;
        else if (heap2.empty())
            return this;
        else if (lessThan(this.elem, heap2.elem)) {
            this.subheaps.push(heap2);
            return this;
        }
        else {
            heap2.subheaps.push(this);
            return heap2;
        }
    };
    PairingHeap.prototype.removeMin = function (lessThan) {
        if (this.empty())
            return null;
        else
            return this.mergePairs(lessThan);
    };
    PairingHeap.prototype.mergePairs = function (lessThan) {
        if (this.subheaps.length == 0)
            return new PairingHeap(null);
        else if (this.subheaps.length == 1) {
            return this.subheaps[0];
        }
        else {
            var firstPair = this.subheaps.pop().merge(this.subheaps.pop(), lessThan);
            var remaining = this.mergePairs(lessThan);
            return firstPair.merge(remaining, lessThan);
        }
    };
    PairingHeap.prototype.decreaseKey = function (subheap, newValue, setHeapNode, lessThan) {
        var newHeap = subheap.removeMin(lessThan);
        //reassign subheap values to preserve tree
        subheap.elem = newHeap.elem;
        subheap.subheaps = newHeap.subheaps;
        if (setHeapNode !== null && newHeap.elem !== null) {
            setHeapNode(subheap.elem, subheap);
        }
        var pairingNode = new PairingHeap(newValue);
        if (setHeapNode !== null) {
            setHeapNode(newValue, pairingNode);
        }
        return this.merge(pairingNode, lessThan);
    };
    return PairingHeap;
})();
/**
 * @class PriorityQueue a min priority queue backed by a pairing heap
 */
var PriorityQueue = (function () {
    function PriorityQueue(lessThan) {
        this.lessThan = lessThan;
    }
    /**
     * @method top
     * @return the top element (the min element as defined by lessThan)
     */
    PriorityQueue.prototype.top = function () {
        if (this.empty()) {
            return null;
        }
        return this.root.elem;
    };
    /**
     * @method push
     * put things on the heap
     */
    PriorityQueue.prototype.push = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var pairingNode;
        for (var i = 0, arg; arg = args[i]; ++i) {
            pairingNode = new PairingHeap(arg);
            this.root = this.empty() ? pairingNode : this.root.merge(pairingNode, this.lessThan);
        }
        return pairingNode;
    };
    /**
     * @method empty
     * @return true if no more elements in queue
     */
    PriorityQueue.prototype.empty = function () {
        return !this.root || !this.root.elem;
    };
    /**
     * @method isHeap check heap condition (for testing)
     * @return true if queue is in valid state
     */
    PriorityQueue.prototype.isHeap = function () {
        return this.root.isHeap(this.lessThan);
    };
    /**
     * @method forEach apply f to each element of the queue
     * @param f function to apply
     */
    PriorityQueue.prototype.forEach = function (f) {
        this.root.forEach(f);
    };
    /**
     * @method pop remove and return the min element from the queue
     */
    PriorityQueue.prototype.pop = function () {
        if (this.empty()) {
            return null;
        }
        var obj = this.root.min();
        this.root = this.root.removeMin(this.lessThan);
        return obj;
    };
    /**
     * @method reduceKey reduce the key value of the specified heap node
     */
    PriorityQueue.prototype.reduceKey = function (heapNode, newKey, setHeapNode) {
        if (setHeapNode === void 0) { setHeapNode = null; }
        this.root = this.root.decreaseKey(heapNode, newKey, setHeapNode, this.lessThan);
    };
    PriorityQueue.prototype.toString = function (selector) {
        return this.root.toString(selector);
    };
    /**
     * @method count
     * @return number of elements in queue
     */
    PriorityQueue.prototype.count = function () {
        return this.root.count();
    };
    return PriorityQueue;
})();
///<reference path="pqueue.ts"/>
/**
 * @module shortestpaths
 */
var cola;
(function (cola) {
    var shortestpaths;
    (function (shortestpaths) {
        var Neighbour = (function () {
            function Neighbour(id, distance) {
                this.id = id;
                this.distance = distance;
            }
            return Neighbour;
        })();
        var Node = (function () {
            function Node(id) {
                this.id = id;
                this.neighbours = [];
            }
            return Node;
        })();
        var QueueEntry = (function () {
            function QueueEntry(node, prev, d) {
                this.node = node;
                this.prev = prev;
                this.d = d;
            }
            return QueueEntry;
        })();
        /**
         * calculates all-pairs shortest paths or shortest paths from a single node
         * @class Calculator
         * @constructor
         * @param n {number} number of nodes
         * @param es {Edge[]} array of edges
         */
        var Calculator = (function () {
            function Calculator(n, es, getSourceIndex, getTargetIndex, getLength) {
                this.n = n;
                this.es = es;
                this.neighbours = new Array(this.n);
                var i = this.n;
                while (i--)
                    this.neighbours[i] = new Node(i);
                i = this.es.length;
                while (i--) {
                    var e = this.es[i];
                    var u = getSourceIndex(e), v = getTargetIndex(e);
                    var d = getLength(e);
                    this.neighbours[u].neighbours.push(new Neighbour(v, d));
                    this.neighbours[v].neighbours.push(new Neighbour(u, d));
                }
            }
            /**
             * compute shortest paths for graph over n nodes with edges an array of source/target pairs
             * edges may optionally have a length attribute.  1 is the default.
             * Uses Johnson's algorithm.
             *
             * @method DistanceMatrix
             * @return the distance matrix
             */
            Calculator.prototype.DistanceMatrix = function () {
                var D = new Array(this.n);
                for (var i = 0; i < this.n; ++i) {
                    D[i] = this.dijkstraNeighbours(i);
                }
                return D;
            };
            /**
             * get shortest paths from a specified start node
             * @method DistancesFromNode
             * @param start node index
             * @return array of path lengths
             */
            Calculator.prototype.DistancesFromNode = function (start) {
                return this.dijkstraNeighbours(start);
            };
            Calculator.prototype.PathFromNodeToNode = function (start, end) {
                return this.dijkstraNeighbours(start, end);
            };
            // find shortest path from start to end, with the opportunity at
            // each edge traversal to compute a custom cost based on the
            // previous edge.  For example, to penalise bends.
            Calculator.prototype.PathFromNodeToNodeWithPrevCost = function (start, end, prevCost) {
                var q = new PriorityQueue(function (a, b) { return a.d <= b.d; }), u = this.neighbours[start], qu = new QueueEntry(u, null, 0), visitedFrom = {};
                q.push(qu);
                while (!q.empty()) {
                    qu = q.pop();
                    u = qu.node;
                    if (u.id === end) {
                        break;
                    }
                    var i = u.neighbours.length;
                    while (i--) {
                        var neighbour = u.neighbours[i], v = this.neighbours[neighbour.id];
                        // don't double back
                        if (qu.prev && v.id === qu.prev.node.id)
                            continue;
                        // don't retraverse an edge if it has already been explored
                        // from a lower cost route
                        var viduid = v.id + ',' + u.id;
                        if (viduid in visitedFrom && visitedFrom[viduid] <= qu.d)
                            continue;
                        var cc = qu.prev ? prevCost(qu.prev.node.id, u.id, v.id) : 0, t = qu.d + neighbour.distance + cc;
                        // store cost of this traversal
                        visitedFrom[viduid] = t;
                        q.push(new QueueEntry(v, qu, t));
                    }
                }
                var path = [];
                while (qu.prev) {
                    qu = qu.prev;
                    path.push(qu.node.id);
                }
                return path;
            };
            Calculator.prototype.dijkstraNeighbours = function (start, dest) {
                if (dest === void 0) { dest = -1; }
                var q = new PriorityQueue(function (a, b) { return a.d <= b.d; }), i = this.neighbours.length, d = new Array(i);
                while (i--) {
                    var node = this.neighbours[i];
                    node.d = i === start ? 0 : Number.POSITIVE_INFINITY;
                    node.q = q.push(node);
                }
                while (!q.empty()) {
                    // console.log(q.toString(function (u) { return u.id + "=" + (u.d === Number.POSITIVE_INFINITY ? "\u221E" : u.d.toFixed(2) )}));
                    var u = q.pop();
                    d[u.id] = u.d;
                    if (u.id === dest) {
                        var path = [];
                        var v = u;
                        while (typeof v.prev !== 'undefined') {
                            path.push(v.prev.id);
                            v = v.prev;
                        }
                        return path;
                    }
                    i = u.neighbours.length;
                    while (i--) {
                        var neighbour = u.neighbours[i];
                        var v = this.neighbours[neighbour.id];
                        var t = u.d + neighbour.distance;
                        if (u.d !== Number.MAX_VALUE && v.d > t) {
                            v.d = t;
                            v.prev = u;
                            q.reduceKey(v.q, v, function (e, q) { return e.q = q; });
                        }
                    }
                }
                return d;
            };
            return Calculator;
        })();
        shortestpaths.Calculator = Calculator;
    })(shortestpaths = cola.shortestpaths || (cola.shortestpaths = {}));
})(cola || (cola = {}));
/// <reference path="rectangle.ts"/>
/// <reference path="shortestpaths.ts"/>
/// <reference path="geom.ts"/>
/// <reference path="vpsc.ts"/>
var cola;
(function (cola) {
    var NodeWrapper = (function () {
        function NodeWrapper(id, rect, children) {
            this.id = id;
            this.rect = rect;
            this.children = children;
            this.leaf = typeof children === 'undefined' || children.length === 0;
        }
        return NodeWrapper;
    })();
    cola.NodeWrapper = NodeWrapper;
    var Vert = (function () {
        function Vert(id, x, y, node, line) {
            if (node === void 0) { node = null; }
            if (line === void 0) { line = null; }
            this.id = id;
            this.x = x;
            this.y = y;
            this.node = node;
            this.line = line;
        }
        return Vert;
    })();
    cola.Vert = Vert;
    var LongestCommonSubsequence = (function () {
        function LongestCommonSubsequence(s, t) {
            this.s = s;
            this.t = t;
            var mf = LongestCommonSubsequence.findMatch(s, t);
            var tr = t.slice(0).reverse();
            var mr = LongestCommonSubsequence.findMatch(s, tr);
            if (mf.length >= mr.length) {
                this.length = mf.length;
                this.si = mf.si;
                this.ti = mf.ti;
                this.reversed = false;
            }
            else {
                this.length = mr.length;
                this.si = mr.si;
                this.ti = t.length - mr.ti - mr.length;
                this.reversed = true;
            }
        }
        LongestCommonSubsequence.findMatch = function (s, t) {
            var m = s.length;
            var n = t.length;
            var match = { length: 0, si: -1, ti: -1 };
            var l = new Array(m);
            for (var i = 0; i < m; i++) {
                l[i] = new Array(n);
                for (var j = 0; j < n; j++)
                    if (s[i] === t[j]) {
                        var v = l[i][j] = (i === 0 || j === 0) ? 1 : l[i - 1][j - 1] + 1;
                        if (v > match.length) {
                            match.length = v;
                            match.si = i - v + 1;
                            match.ti = j - v + 1;
                        }
                        ;
                    }
                    else
                        l[i][j] = 0;
            }
            return match;
        };
        LongestCommonSubsequence.prototype.getSequence = function () {
            return this.length >= 0 ? this.s.slice(this.si, this.si + this.length) : [];
        };
        return LongestCommonSubsequence;
    })();
    cola.LongestCommonSubsequence = LongestCommonSubsequence;
    var GridRouter = (function () {
        function GridRouter(originalnodes, accessor, groupPadding) {
            var _this = this;
            if (groupPadding === void 0) { groupPadding = 12; }
            this.originalnodes = originalnodes;
            this.groupPadding = groupPadding;
            this.leaves = null;
            this.nodes = originalnodes.map(function (v, i) { return new NodeWrapper(i, accessor.getBounds(v), accessor.getChildren(v)); });
            this.leaves = this.nodes.filter(function (v) { return v.leaf; });
            this.groups = this.nodes.filter(function (g) { return !g.leaf; });
            this.cols = this.getGridDim('x');
            this.rows = this.getGridDim('y');
            // create parents for each node or group that is a member of another's children
            this.groups.forEach(function (v) { return v.children.forEach(function (c) { return _this.nodes[c].parent = v; }); });
            // root claims the remaining orphans
            this.root = { children: [] };
            this.nodes.forEach(function (v) {
                if (typeof v.parent === 'undefined') {
                    v.parent = _this.root;
                    _this.root.children.push(v.id);
                }
                // each node will have grid vertices associated with it,
                // some inside the node and some on the boundary
                // leaf nodes will have exactly one internal node at the center
                // and four boundary nodes
                // groups will have potentially many of each
                v.ports = [];
            });
            // nodes ordered by their position in the group hierarchy
            this.backToFront = this.nodes.slice(0);
            this.backToFront.sort(function (x, y) { return _this.getDepth(x) - _this.getDepth(y); });
            // compute boundary rectangles for each group
            // has to be done from front to back, i.e. inside groups to outside groups
            // such that each can be made large enough to enclose its interior
            var frontToBackGroups = this.backToFront.slice(0).reverse().filter(function (g) { return !g.leaf; });
            frontToBackGroups.forEach(function (v) {
                var r = cola.vpsc.Rectangle.empty();
                v.children.forEach(function (c) { return r = r.union(_this.nodes[c].rect); });
                v.rect = r.inflate(_this.groupPadding);
            });
            var colMids = this.midPoints(this.cols.map(function (r) { return r.x; }));
            var rowMids = this.midPoints(this.rows.map(function (r) { return r.y; }));
            // setup extents of lines
            var rowx = colMids[0], rowX = colMids[colMids.length - 1];
            var coly = rowMids[0], colY = rowMids[rowMids.length - 1];
            // horizontal lines
            var hlines = this.rows.map(function (r) { return { x1: rowx, x2: rowX, y1: r.y, y2: r.y }; }).concat(rowMids.map(function (m) { return { x1: rowx, x2: rowX, y1: m, y2: m }; }));
            // vertical lines
            var vlines = this.cols.map(function (c) { return { x1: c.x, x2: c.x, y1: coly, y2: colY }; }).concat(colMids.map(function (m) { return { x1: m, x2: m, y1: coly, y2: colY }; }));
            // the full set of lines
            var lines = hlines.concat(vlines);
            // we record the vertices associated with each line
            lines.forEach(function (l) { return l.verts = []; });
            // the routing graph
            this.verts = [];
            this.edges = [];
            // create vertices at the crossings of horizontal and vertical grid-lines
            hlines.forEach(function (h) { return vlines.forEach(function (v) {
                var p = new Vert(_this.verts.length, v.x1, h.y1);
                h.verts.push(p);
                v.verts.push(p);
                _this.verts.push(p);
                // assign vertices to the nodes immediately under them
                var i = _this.backToFront.length;
                while (i-- > 0) {
                    var node = _this.backToFront[i], r = node.rect;
                    var dx = Math.abs(p.x - r.cx()), dy = Math.abs(p.y - r.cy());
                    if (dx < r.width() / 2 && dy < r.height() / 2) {
                        p.node = node;
                        break;
                    }
                }
            }); });
            lines.forEach(function (l, li) {
                // create vertices at the intersections of nodes and lines
                _this.nodes.forEach(function (v, i) {
                    v.rect.lineIntersections(l.x1, l.y1, l.x2, l.y2).forEach(function (intersect, j) {
                        //console.log(li+','+i+','+j+':'+intersect.x + ',' + intersect.y);
                        var p = new Vert(_this.verts.length, intersect.x, intersect.y, v, l);
                        _this.verts.push(p);
                        l.verts.push(p);
                        v.ports.push(p);
                    });
                });
                // split lines into edges joining vertices
                var isHoriz = Math.abs(l.y1 - l.y2) < 0.1;
                var delta = function (a, b) { return isHoriz ? b.x - a.x : b.y - a.y; };
                l.verts.sort(delta);
                for (var i = 1; i < l.verts.length; i++) {
                    var u = l.verts[i - 1], v = l.verts[i];
                    if (u.node && u.node === v.node && u.node.leaf)
                        continue;
                    _this.edges.push({ source: u.id, target: v.id, length: Math.abs(delta(u, v)) });
                }
            });
        }
        GridRouter.prototype.avg = function (a) {
            return a.reduce(function (x, y) { return x + y; }) / a.length;
        };
        GridRouter.prototype.getGridDim = function (axis) {
            var columns = [];
            var ls = this.leaves.slice(0, this.leaves.length);
            while (ls.length > 0) {
                var r = ls[0].rect;
                var col = ls.filter(function (v) { return v.rect['overlap' + axis.toUpperCase()](r); });
                columns.push(col);
                col.forEach(function (v) { return ls.splice(ls.indexOf(v), 1); });
                col[axis] = this.avg(col.map(function (v) { return v.rect['c' + axis](); }));
            }
            columns.sort(function (x, y) { return x[axis] - y[axis]; });
            return columns;
        };
        // get the depth of the given node in the group hierarchy
        GridRouter.prototype.getDepth = function (v) {
            var depth = 0;
            while (v.parent !== this.root) {
                depth++;
                v = v.parent;
            }
            return depth;
        };
        // medial axes between node centres and also boundary lines for the grid
        GridRouter.prototype.midPoints = function (a) {
            var gap = a[1] - a[0];
            var mids = [a[0] - gap / 2];
            for (var i = 1; i < a.length; i++) {
                mids.push((a[i] + a[i - 1]) / 2);
            }
            mids.push(a[a.length - 1] + gap / 2);
            return mids;
        };
        // find path from v to root including both v and root
        GridRouter.prototype.findLineage = function (v) {
            var lineage = [v];
            do {
                v = v.parent;
                lineage.push(v);
            } while (v !== this.root);
            return lineage.reverse();
        };
        // find path connecting a and b through their lowest common ancestor
        GridRouter.prototype.findAncestorPathBetween = function (a, b) {
            var aa = this.findLineage(a), ba = this.findLineage(b), i = 0;
            while (aa[i] === ba[i])
                i++;
            // i-1 to include common ancestor only once (as first element)
            return { commonAncestor: aa[i - 1], lineages: aa.slice(i).concat(ba.slice(i)) };
        };
        // when finding a path between two nodes a and b, siblings of a and b on the
        // paths from a and b to their least common ancestor are obstacles
        GridRouter.prototype.siblingObstacles = function (a, b) {
            var _this = this;
            var path = this.findAncestorPathBetween(a, b);
            var lineageLookup = {};
            path.lineages.forEach(function (v) { return lineageLookup[v.id] = {}; });
            var obstacles = path.commonAncestor.children.filter(function (v) { return !(v in lineageLookup); });
            path.lineages.filter(function (v) { return v.parent !== path.commonAncestor; }).forEach(function (v) { return obstacles = obstacles.concat(v.parent.children.filter(function (c) { return c !== v.id; })); });
            return obstacles.map(function (v) { return _this.nodes[v]; });
        };
        // for the given routes, extract all the segments orthogonal to the axis x
        // and return all them grouped by x position
        GridRouter.getSegmentSets = function (routes, x, y) {
            // vsegments is a list of vertical segments sorted by x position
            var vsegments = [];
            for (var ei = 0; ei < routes.length; ei++) {
                var route = routes[ei];
                for (var si = 0; si < route.length; si++) {
                    var s = route[si];
                    s.edgeid = ei;
                    s.i = si;
                    var sdx = s[1][x] - s[0][x];
                    if (Math.abs(sdx) < 0.1) {
                        vsegments.push(s);
                    }
                }
            }
            vsegments.sort(function (a, b) { return a[0][x] - b[0][x]; });
            // vsegmentsets is a set of sets of segments grouped by x position
            var vsegmentsets = [];
            var segmentset = null;
            for (var i = 0; i < vsegments.length; i++) {
                var s = vsegments[i];
                if (!segmentset || Math.abs(s[0][x] - segmentset.pos) > 0.1) {
                    segmentset = { pos: s[0][x], segments: [] };
                    vsegmentsets.push(segmentset);
                }
                segmentset.segments.push(s);
            }
            return vsegmentsets;
        };
        // for all segments in this bundle create a vpsc problem such that
        // each segment's x position is a variable and separation constraints
        // are given by the partial order over the edges to which the segments belong
        // for each pair s1,s2 of segments in the open set:
        //   e1 = edge of s1, e2 = edge of s2
        //   if leftOf(e1,e2) create constraint s1.x + gap <= s2.x
        //   else if leftOf(e2,e1) create cons. s2.x + gap <= s1.x
        GridRouter.nudgeSegs = function (x, y, routes, segments, leftOf, gap) {
            var n = segments.length;
            if (n <= 1)
                return;
            var vs = segments.map(function (s) { return new cola.vpsc.Variable(s[0][x]); });
            var cs = [];
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    if (i === j)
                        continue;
                    var s1 = segments[i], s2 = segments[j], e1 = s1.edgeid, e2 = s2.edgeid, lind = -1, rind = -1;
                    // in page coordinates (not cartesian) the notion of 'leftof' is flipped in the horizontal axis from the vertical axis
                    // that is, when nudging vertical segments, if they increase in the y(conj) direction the segment belonging to the
                    // 'left' edge actually needs to be nudged to the right
                    // when nudging horizontal segments, if the segments increase in the x direction
                    // then the 'left' segment needs to go higher, i.e. to have y pos less than that of the right
                    if (x == 'x') {
                        if (leftOf(e1, e2)) {
                            //console.log('s1: ' + s1[0][x] + ',' + s1[0][y] + '-' + s1[1][x] + ',' + s1[1][y]);
                            if (s1[0][y] < s1[1][y]) {
                                lind = j, rind = i;
                            }
                            else {
                                lind = i, rind = j;
                            }
                        }
                    }
                    else {
                        if (leftOf(e1, e2)) {
                            if (s1[0][y] < s1[1][y]) {
                                lind = i, rind = j;
                            }
                            else {
                                lind = j, rind = i;
                            }
                        }
                    }
                    if (lind >= 0) {
                        //console.log(x+' constraint: ' + lind + '<' + rind);
                        cs.push(new cola.vpsc.Constraint(vs[lind], vs[rind], gap));
                    }
                }
            }
            var solver = new cola.vpsc.Solver(vs, cs);
            solver.solve();
            vs.forEach(function (v, i) {
                var s = segments[i];
                var pos = v.position();
                s[0][x] = s[1][x] = pos;
                var route = routes[s.edgeid];
                if (s.i > 0)
                    route[s.i - 1][1][x] = pos;
                if (s.i < route.length - 1)
                    route[s.i + 1][0][x] = pos;
            });
        };
        GridRouter.nudgeSegments = function (routes, x, y, leftOf, gap) {
            var vsegmentsets = GridRouter.getSegmentSets(routes, x, y);
            for (var i = 0; i < vsegmentsets.length; i++) {
                var ss = vsegmentsets[i];
                var events = [];
                for (var j = 0; j < ss.segments.length; j++) {
                    var s = ss.segments[j];
                    events.push({ type: 0, s: s, pos: Math.min(s[0][y], s[1][y]) });
                    events.push({ type: 1, s: s, pos: Math.max(s[0][y], s[1][y]) });
                }
                events.sort(function (a, b) { return a.pos - b.pos + a.type - b.type; });
                var open = [];
                var openCount = 0;
                events.forEach(function (e) {
                    if (e.type === 0) {
                        open.push(e.s);
                        openCount++;
                    }
                    else {
                        openCount--;
                    }
                    if (openCount == 0) {
                        GridRouter.nudgeSegs(x, y, routes, open, leftOf, gap);
                        open = [];
                    }
                });
            }
        };
        // obtain routes for the specified edges, nicely nudged apart
        // warning: edge paths may be reversed such that common paths are ordered consistently within bundles!
        GridRouter.prototype.routeEdges = function (edges, gap, source, target) {
            var _this = this;
            var routePaths = edges.map(function (e) { return _this.route(source(e), target(e)); });
            var order = cola.GridRouter.orderEdges(routePaths);
            var routes = routePaths.map(function (e) {
                return cola.GridRouter.makeSegments(e);
            });
            cola.GridRouter.nudgeSegments(routes, 'x', 'y', order, gap);
            cola.GridRouter.nudgeSegments(routes, 'y', 'x', order, gap);
            return routes;
        };
        GridRouter.angleBetween2Lines = function (line1, line2) {
            var angle1 = Math.atan2(line1[0].y - line1[1].y, line1[0].x - line1[1].x);
            var angle2 = Math.atan2(line2[0].y - line2[1].y, line2[0].x - line2[1].x);
            var diff = angle1 - angle2;
            if (diff > Math.PI || diff < -Math.PI) {
                diff = angle2 - angle1;
            }
            return diff;
        };
        // does the path a-b-c describe a left turn?
        GridRouter.isLeft = function (a, b, c) {
            return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) <= 0;
        };
        // for the given list of ordered pairs, returns a function that (efficiently) looks-up a specific pair to
        // see if it exists in the list
        GridRouter.getOrder = function (pairs) {
            var outgoing = {};
            for (var i = 0; i < pairs.length; i++) {
                var p = pairs[i];
                if (typeof outgoing[p.l] === 'undefined')
                    outgoing[p.l] = {};
                outgoing[p.l][p.r] = true;
            }
            return function (l, r) { return typeof outgoing[l] !== 'undefined' && outgoing[l][r]; };
        };
        // returns an ordering (a lookup function) that determines the correct order to nudge the
        // edge paths apart to minimize crossings
        GridRouter.orderEdges = function (edges) {
            var edgeOrder = [];
            for (var i = 0; i < edges.length - 1; i++) {
                for (var j = i + 1; j < edges.length; j++) {
                    var e = edges[i], f = edges[j], lcs = new cola.LongestCommonSubsequence(e, f);
                    var u, vi, vj;
                    if (lcs.length === 0)
                        continue; // no common subpath
                    if (lcs.reversed) {
                        // if we found a common subpath but one of the edges runs the wrong way,
                        // then reverse f.
                        f.reverse();
                        f.reversed = true;
                        lcs = new cola.LongestCommonSubsequence(e, f);
                    }
                    if (lcs.length === e.length || lcs.length === f.length) {
                        // the edges are completely co-linear so make an arbitrary ordering decision
                        edgeOrder.push({ l: i, r: j });
                        continue;
                    }
                    if (lcs.si + lcs.length >= e.length || lcs.ti + lcs.length >= f.length) {
                        // if the common subsequence of the
                        // two edges being considered goes all the way to the
                        // end of one (or both) of the lines then we have to
                        // base our ordering decision on the other end of the
                        // common subsequence
                        u = e[lcs.si + 1];
                        vj = e[lcs.si - 1];
                        vi = f[lcs.ti - 1];
                    }
                    else {
                        u = e[lcs.si + lcs.length - 2];
                        vi = e[lcs.si + lcs.length];
                        vj = f[lcs.ti + lcs.length];
                    }
                    if (GridRouter.isLeft(u, vi, vj)) {
                        edgeOrder.push({ l: j, r: i });
                    }
                    else {
                        edgeOrder.push({ l: i, r: j });
                    }
                }
            }
            //edgeOrder.forEach(function (e) { console.log('l:' + e.l + ',r:' + e.r) });
            return cola.GridRouter.getOrder(edgeOrder);
        };
        // for an orthogonal path described by a sequence of points, create a list of segments
        // if consecutive segments would make a straight line they are merged into a single segment
        // segments are over cloned points, not the original vertices
        GridRouter.makeSegments = function (path) {
            function copyPoint(p) {
                return { x: p.x, y: p.y };
            }
            var isStraight = function (a, b, c) { return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) < 0.001; };
            var segments = [];
            var a = copyPoint(path[0]);
            for (var i = 1; i < path.length; i++) {
                var b = copyPoint(path[i]), c = i < path.length - 1 ? path[i + 1] : null;
                if (!c || !isStraight(a, b, c)) {
                    segments.push([a, b]);
                    a = b;
                }
            }
            return segments;
        };
        // find a route between node s and node t
        // returns an array of indices to verts
        GridRouter.prototype.route = function (s, t) {
            var _this = this;
            var source = this.nodes[s], target = this.nodes[t];
            this.obstacles = this.siblingObstacles(source, target);
            var obstacleLookup = {};
            this.obstacles.forEach(function (o) { return obstacleLookup[o.id] = o; });
            this.passableEdges = this.edges.filter(function (e) {
                var u = _this.verts[e.source], v = _this.verts[e.target];
                return !(u.node && u.node.id in obstacleLookup || v.node && v.node.id in obstacleLookup);
            });
            for (var i = 1; i < source.ports.length; i++) {
                var u = source.ports[0].id;
                var v = source.ports[i].id;
                this.passableEdges.push({
                    source: u,
                    target: v,
                    length: 0
                });
            }
            for (var i = 1; i < target.ports.length; i++) {
                var u = target.ports[0].id;
                var v = target.ports[i].id;
                this.passableEdges.push({
                    source: u,
                    target: v,
                    length: 0
                });
            }
            var getSource = function (e) { return e.source; }, getTarget = function (e) { return e.target; }, getLength = function (e) { return e.length; };
            var shortestPathCalculator = new cola.shortestpaths.Calculator(this.verts.length, this.passableEdges, getSource, getTarget, getLength);
            var bendPenalty = function (u, v, w) {
                var a = _this.verts[u], b = _this.verts[v], c = _this.verts[w];
                var dx = Math.abs(c.x - a.x), dy = Math.abs(c.y - a.y);
                // don't count bends from internal node edges
                if (a.node === source && a.node === b.node || b.node === target && b.node === c.node)
                    return 0;
                return dx > 1 && dy > 1 ? 1000 : 0;
            };
            // get shortest path
            var shortestPath = shortestPathCalculator.PathFromNodeToNodeWithPrevCost(source.ports[0].id, target.ports[0].id, bendPenalty);
            // shortest path is reversed and does not include the target port
            var pathPoints = shortestPath.reverse().map(function (vi) { return _this.verts[vi]; });
            pathPoints.push(this.nodes[target.id].ports[0]);
            // filter out any extra end points that are inside the source or target (i.e. the dummy segments above)
            return pathPoints.filter(function (v, i) { return !(i < pathPoints.length - 1 && pathPoints[i + 1].node === source && v.node === source || i > 0 && v.node === target && pathPoints[i - 1].node === target); });
        };
        return GridRouter;
    })();
    cola.GridRouter = GridRouter;
})(cola || (cola = {}));
/**
 * @module cola
 */
var cola;
(function (cola) {
    // compute the size of the union of two sets a and b
    function unionCount(a, b) {
        var u = {};
        for (var i in a)
            u[i] = {};
        for (var i in b)
            u[i] = {};
        return Object.keys(u).length;
    }
    // compute the size of the intersection of two sets a and b
    function intersectionCount(a, b) {
        var n = 0;
        for (var i in a)
            if (typeof b[i] !== 'undefined')
                ++n;
        return n;
    }
    function getNeighbours(links, la) {
        var neighbours = {};
        var addNeighbours = function (u, v) {
            if (typeof neighbours[u] === 'undefined')
                neighbours[u] = {};
            neighbours[u][v] = {};
        };
        links.forEach(function (e) {
            var u = la.getSourceIndex(e), v = la.getTargetIndex(e);
            addNeighbours(u, v);
            addNeighbours(v, u);
        });
        return neighbours;
    }
    // modify the lengths of the specified links by the result of function f weighted by w
    function computeLinkLengths(links, w, f, la) {
        var neighbours = getNeighbours(links, la);
        links.forEach(function (l) {
            var a = neighbours[la.getSourceIndex(l)];
            var b = neighbours[la.getTargetIndex(l)];
            la.setLength(l, 1 + w * f(a, b));
        });
    }
    /** modify the specified link lengths based on the symmetric difference of their neighbours
     * @class symmetricDiffLinkLengths
     */
    function symmetricDiffLinkLengths(links, la, w) {
        if (w === void 0) { w = 1; }
        computeLinkLengths(links, w, function (a, b) { return Math.sqrt(unionCount(a, b) - intersectionCount(a, b)); }, la);
    }
    cola.symmetricDiffLinkLengths = symmetricDiffLinkLengths;
    /** modify the specified links lengths based on the jaccard difference between their neighbours
     * @class jaccardLinkLengths
     */
    function jaccardLinkLengths(links, la, w) {
        if (w === void 0) { w = 1; }
        computeLinkLengths(links, w, function (a, b) { return Math.min(Object.keys(a).length, Object.keys(b).length) < 1.1 ? 0 : intersectionCount(a, b) / unionCount(a, b); }, la);
    }
    cola.jaccardLinkLengths = jaccardLinkLengths;
    /** generate separation constraints for all edges unless both their source and sink are in the same strongly connected component
     * @class generateDirectedEdgeConstraints
     */
    function generateDirectedEdgeConstraints(n, links, axis, la) {
        var components = stronglyConnectedComponents(n, links, la);
        var nodes = {};
        components.filter(function (c) { return c.length > 1; }).forEach(function (c) { return c.forEach(function (v) { return nodes[v] = c; }); });
        var constraints = [];
        links.forEach(function (l) {
            var ui = la.getSourceIndex(l), vi = la.getTargetIndex(l), u = nodes[ui], v = nodes[vi];
            if (!u || !v || u.component !== v.component) {
                constraints.push({
                    axis: axis,
                    left: ui,
                    right: vi,
                    gap: la.getMinSeparation(l)
                });
            }
        });
        return constraints;
    }
    cola.generateDirectedEdgeConstraints = generateDirectedEdgeConstraints;
    /*
    Following function based on: https://github.com/mikolalysenko/strongly-connected-components

    The MIT License (MIT)

    Copyright (c) 2013 Mikola Lysenko

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
    */
    function stronglyConnectedComponents(numVertices, edges, la) {
        var adjList = new Array(numVertices);
        var index = new Array(numVertices);
        var lowValue = new Array(numVertices);
        var active = new Array(numVertices);
        for (var i = 0; i < numVertices; ++i) {
            adjList[i] = [];
            index[i] = -1;
            lowValue[i] = 0;
            active[i] = false;
        }
        for (var i = 0; i < edges.length; ++i) {
            adjList[la.getSourceIndex(edges[i])].push(la.getTargetIndex(edges[i]));
        }
        var count = 0;
        var S = [];
        var components = [];
        function strongConnect(v) {
            index[v] = count;
            lowValue[v] = count;
            active[v] = true;
            count += 1;
            S.push(v);
            var e = adjList[v];
            for (var i = 0; i < e.length; ++i) {
                var u = e[i];
                if (index[u] < 0) {
                    strongConnect(u);
                    lowValue[v] = Math.min(lowValue[v], lowValue[u]) | 0;
                }
                else if (active[u]) {
                    lowValue[v] = Math.min(lowValue[v], lowValue[u]);
                }
            }
            if (lowValue[v] === index[v]) {
                var component = [];
                for (var i = S.length - 1; i >= 0; --i) {
                    var w = S[i];
                    active[w] = false;
                    component.push(w);
                    if (w === v) {
                        S.length = i;
                        break;
                    }
                }
                components.push(component);
            }
        }
        for (var i = 0; i < numVertices; ++i) {
            if (index[i] < 0) {
                strongConnect(i);
            }
        }
        return components;
    }
})(cola || (cola = {}));
var cola;
(function (cola) {
    var powergraph;
    (function (powergraph) {
        var PowerEdge = (function () {
            function PowerEdge(source, target, type) {
                this.source = source;
                this.target = target;
                this.type = type;
            }
            return PowerEdge;
        })();
        powergraph.PowerEdge = PowerEdge;
        var Configuration = (function () {
            function Configuration(n, edges, linkAccessor, rootGroup) {
                var _this = this;
                this.linkAccessor = linkAccessor;
                this.modules = new Array(n);
                this.roots = [];
                if (rootGroup) {
                    this.initModulesFromGroup(rootGroup);
                }
                else {
                    this.roots.push(new ModuleSet());
                    for (var i = 0; i < n; ++i)
                        this.roots[0].add(this.modules[i] = new Module(i));
                }
                this.R = edges.length;
                edges.forEach(function (e) {
                    var s = _this.modules[linkAccessor.getSourceIndex(e)], t = _this.modules[linkAccessor.getTargetIndex(e)], type = linkAccessor.getType(e);
                    s.outgoing.add(type, t);
                    t.incoming.add(type, s);
                });
            }
            Configuration.prototype.initModulesFromGroup = function (group) {
                var moduleSet = new ModuleSet();
                this.roots.push(moduleSet);
                for (var i = 0; i < group.leaves.length; ++i) {
                    var node = group.leaves[i];
                    var module = new Module(node.id);
                    this.modules[node.id] = module;
                    moduleSet.add(module);
                }
                if (group.groups) {
                    for (var j = 0; j < group.groups.length; ++j) {
                        var child = group.groups[j];
                        // Use negative module id to avoid clashes between predefined and generated modules
                        moduleSet.add(new Module(-1 - j, new LinkSets(), new LinkSets(), this.initModulesFromGroup(child), true));
                    }
                }
                return moduleSet;
            };
            // merge modules a and b keeping track of their power edges and removing the from roots
            Configuration.prototype.merge = function (a, b, k) {
                if (k === void 0) { k = 0; }
                var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
                var children = new ModuleSet();
                children.add(a);
                children.add(b);
                var m = new Module(this.modules.length, outInt, inInt, children);
                this.modules.push(m);
                var update = function (s, i, o) {
                    s.forAll(function (ms, linktype) {
                        ms.forAll(function (n) {
                            var nls = n[i];
                            nls.add(linktype, m);
                            nls.remove(linktype, a);
                            nls.remove(linktype, b);
                            a[o].remove(linktype, n);
                            b[o].remove(linktype, n);
                        });
                    });
                };
                update(outInt, "incoming", "outgoing");
                update(inInt, "outgoing", "incoming");
                this.R -= inInt.count() + outInt.count();
                this.roots[k].remove(a);
                this.roots[k].remove(b);
                this.roots[k].add(m);
                return m;
            };
            Configuration.prototype.rootMerges = function (k) {
                if (k === void 0) { k = 0; }
                var rs = this.roots[k].modules();
                var n = rs.length;
                var merges = new Array(n * (n - 1));
                var ctr = 0;
                for (var i = 0, i_ = n - 1; i < i_; ++i) {
                    for (var j = i + 1; j < n; ++j) {
                        var a = rs[i], b = rs[j];
                        merges[ctr++] = { nEdges: this.nEdges(a, b), a: a, b: b };
                    }
                }
                return merges;
            };
            Configuration.prototype.greedyMerge = function () {
                for (var i = 0; i < this.roots.length; ++i) {
                    // Handle single nested module case
                    if (this.roots[i].modules().length < 2)
                        continue;
                    var ms = this.rootMerges(i).sort(function (a, b) { return a.nEdges - b.nEdges; });
                    var m = ms[0];
                    if (m.nEdges >= this.R)
                        continue;
                    this.merge(m.a, m.b, i);
                    return true;
                }
            };
            Configuration.prototype.nEdges = function (a, b) {
                var inInt = a.incoming.intersection(b.incoming), outInt = a.outgoing.intersection(b.outgoing);
                return this.R - inInt.count() - outInt.count();
            };
            Configuration.prototype.getGroupHierarchy = function (retargetedEdges) {
                var _this = this;
                var groups = [];
                var root = {};
                toGroups(this.roots[0], root, groups);
                var es = this.allEdges();
                es.forEach(function (e) {
                    var a = _this.modules[e.source];
                    var b = _this.modules[e.target];
                    retargetedEdges.push(new PowerEdge(typeof a.gid === "undefined" ? e.source : groups[a.gid], typeof b.gid === "undefined" ? e.target : groups[b.gid], e.type));
                });
                return groups;
            };
            Configuration.prototype.allEdges = function () {
                var es = [];
                Configuration.getEdges(this.roots[0], es);
                return es;
            };
            Configuration.getEdges = function (modules, es) {
                modules.forAll(function (m) {
                    m.getEdges(es);
                    Configuration.getEdges(m.children, es);
                });
            };
            return Configuration;
        })();
        powergraph.Configuration = Configuration;
        function toGroups(modules, group, groups) {
            modules.forAll(function (m) {
                if (m.isLeaf()) {
                    if (!group.leaves)
                        group.leaves = [];
                    group.leaves.push(m.id);
                }
                else {
                    var g = group;
                    m.gid = groups.length;
                    if (!m.isIsland() || m.predefined) {
                        g = { id: m.gid };
                        if (!group.groups)
                            group.groups = [];
                        group.groups.push(m.gid);
                        groups.push(g);
                    }
                    toGroups(m.children, g, groups);
                }
            });
        }
        var Module = (function () {
            function Module(id, outgoing, incoming, children, predefined) {
                if (outgoing === void 0) { outgoing = new LinkSets(); }
                if (incoming === void 0) { incoming = new LinkSets(); }
                if (children === void 0) { children = new ModuleSet(); }
                if (predefined === void 0) { predefined = false; }
                this.id = id;
                this.outgoing = outgoing;
                this.incoming = incoming;
                this.children = children;
                this.predefined = predefined;
            }
            Module.prototype.getEdges = function (es) {
                var _this = this;
                this.outgoing.forAll(function (ms, edgetype) {
                    ms.forAll(function (target) {
                        es.push(new PowerEdge(_this.id, target.id, edgetype));
                    });
                });
            };
            Module.prototype.isLeaf = function () {
                return this.children.count() === 0;
            };
            Module.prototype.isIsland = function () {
                return this.outgoing.count() === 0 && this.incoming.count() === 0;
            };
            return Module;
        })();
        powergraph.Module = Module;
        function intersection(m, n) {
            var i = {};
            for (var v in m)
                if (v in n)
                    i[v] = m[v];
            return i;
        }
        var ModuleSet = (function () {
            function ModuleSet() {
                this.table = {};
            }
            ModuleSet.prototype.count = function () {
                return Object.keys(this.table).length;
            };
            ModuleSet.prototype.intersection = function (other) {
                var result = new ModuleSet();
                result.table = intersection(this.table, other.table);
                return result;
            };
            ModuleSet.prototype.intersectionCount = function (other) {
                return this.intersection(other).count();
            };
            ModuleSet.prototype.contains = function (id) {
                return id in this.table;
            };
            ModuleSet.prototype.add = function (m) {
                this.table[m.id] = m;
            };
            ModuleSet.prototype.remove = function (m) {
                delete this.table[m.id];
            };
            ModuleSet.prototype.forAll = function (f) {
                for (var mid in this.table) {
                    f(this.table[mid]);
                }
            };
            ModuleSet.prototype.modules = function () {
                var vs = [];
                this.forAll(function (m) {
                    if (!m.predefined)
                        vs.push(m);
                });
                return vs;
            };
            return ModuleSet;
        })();
        powergraph.ModuleSet = ModuleSet;
        var LinkSets = (function () {
            function LinkSets() {
                this.sets = {};
                this.n = 0;
            }
            LinkSets.prototype.count = function () {
                return this.n;
            };
            LinkSets.prototype.contains = function (id) {
                var result = false;
                this.forAllModules(function (m) {
                    if (!result && m.id == id) {
                        result = true;
                    }
                });
                return result;
            };
            LinkSets.prototype.add = function (linktype, m) {
                var s = linktype in this.sets ? this.sets[linktype] : this.sets[linktype] = new ModuleSet();
                s.add(m);
                ++this.n;
            };
            LinkSets.prototype.remove = function (linktype, m) {
                var ms = this.sets[linktype];
                ms.remove(m);
                if (ms.count() === 0) {
                    delete this.sets[linktype];
                }
                --this.n;
            };
            LinkSets.prototype.forAll = function (f) {
                for (var linktype in this.sets) {
                    f(this.sets[linktype], linktype);
                }
            };
            LinkSets.prototype.forAllModules = function (f) {
                this.forAll(function (ms, lt) { return ms.forAll(f); });
            };
            LinkSets.prototype.intersection = function (other) {
                var result = new LinkSets();
                this.forAll(function (ms, lt) {
                    if (lt in other.sets) {
                        var i = ms.intersection(other.sets[lt]), n = i.count();
                        if (n > 0) {
                            result.sets[lt] = i;
                            result.n += n;
                        }
                    }
                });
                return result;
            };
            return LinkSets;
        })();
        powergraph.LinkSets = LinkSets;
        function intersectionCount(m, n) {
            return Object.keys(intersection(m, n)).length;
        }
        function getGroups(nodes, links, la, rootGroup) {
            var n = nodes.length, c = new powergraph.Configuration(n, links, la, rootGroup);
            while (c.greedyMerge())
                ;
            var powerEdges = [];
            var g = c.getGroupHierarchy(powerEdges);
            powerEdges.forEach(function (e) {
                var f = function (end) {
                    var g = e[end];
                    if (typeof g == "number")
                        e[end] = nodes[g];
                };
                f("source");
                f("target");
            });
            return { groups: g, powerEdges: powerEdges };
        }
        powergraph.getGroups = getGroups;
    })(powergraph = cola.powergraph || (cola.powergraph = {}));
})(cola || (cola = {}));

//Based on js_bintrees:
//
//https://github.com/vadimg/js_bintrees
//
//Copyright (C) 2011 by Vadim Graboys
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

RBTree = (function (window) {
var global = window;
var require = function(name) {
    var fn = require.m[name];
    if (fn.mod) {
        return fn.mod.exports;
    }

    var mod = fn.mod = { exports: {} };
    fn(mod, mod.exports);
    return mod.exports;
};

require.m = {};
require.m['./treebase'] = function(module, exports) {

function TreeBase() {}

// removes all nodes from the tree
TreeBase.prototype.clear = function() {
    this._root = null;
    this.size = 0;
};

// returns node data if found, null otherwise
TreeBase.prototype.find = function(data) {
    var res = this._root;

    while(res !== null) {
        var c = this._comparator(data, res.data);
        if(c === 0) {
            return res.data;
        }
        else {
            res = res.get_child(c > 0);
        }
    }

    return null;
};

// returns iterator to node if found, null otherwise
TreeBase.prototype.findIter = function(data) {
    var res = this._root;
    var iter = this.iterator();

    while(res !== null) {
        var c = this._comparator(data, res.data);
        if(c === 0) {
            iter._cursor = res;
            return iter;
        }
        else {
            iter._ancestors.push(res);
            res = res.get_child(c > 0);
        }
    }

    return null;
};

// Returns an interator to the tree node immediately before (or at) the element
TreeBase.prototype.lowerBound = function(data) {
    return this._bound(data, this._comparator);
};

// Returns an interator to the tree node immediately after (or at) the element
TreeBase.prototype.upperBound = function(data) {
    var cmp = this._comparator;

    function reverse_cmp(a, b) {
        return cmp(b, a);
    }

    return this._bound(data, reverse_cmp);
};

// returns null if tree is empty
TreeBase.prototype.min = function() {
    var res = this._root;
    if(res === null) {
        return null;
    }

    while(res.left !== null) {
        res = res.left;
    }

    return res.data;
};

// returns null if tree is empty
TreeBase.prototype.max = function() {
    var res = this._root;
    if(res === null) {
        return null;
    }

    while(res.right !== null) {
        res = res.right;
    }

    return res.data;
};

// returns a null iterator
// call next() or prev() to point to an element
TreeBase.prototype.iterator = function() {
    return new Iterator(this);
};

// calls cb on each node's data, in order
TreeBase.prototype.each = function(cb) {
    var it=this.iterator(), data;
    while((data = it.next()) !== null) {
        cb(data);
    }
};

// calls cb on each node's data, in reverse order
TreeBase.prototype.reach = function(cb) {
    var it=this.iterator(), data;
    while((data = it.prev()) !== null) {
        cb(data);
    }
};

// used for lowerBound and upperBound
TreeBase.prototype._bound = function(data, cmp) {
    var cur = this._root;
    var iter = this.iterator();

    while(cur !== null) {
        var c = this._comparator(data, cur.data);
        if(c === 0) {
            iter._cursor = cur;
            return iter;
        }
        iter._ancestors.push(cur);
        cur = cur.get_child(c > 0);
    }

    for(var i=iter._ancestors.length - 1; i >= 0; --i) {
        cur = iter._ancestors[i];
        if(cmp(data, cur.data) > 0) {
            iter._cursor = cur;
            iter._ancestors.length = i;
            return iter;
        }
    }

    iter._ancestors.length = 0;
    return iter;
};


function Iterator(tree) {
    this._tree = tree;
    this._ancestors = [];
    this._cursor = null;
}

Iterator.prototype.data = function() {
    return this._cursor !== null ? this._cursor.data : null;
};

// if null-iterator, returns first node
// otherwise, returns next node
Iterator.prototype.next = function() {
    if(this._cursor === null) {
        var root = this._tree._root;
        if(root !== null) {
            this._minNode(root);
        }
    }
    else {
        if(this._cursor.right === null) {
            // no greater node in subtree, go up to parent
            // if coming from a right child, continue up the stack
            var save;
            do {
                save = this._cursor;
                if(this._ancestors.length) {
                    this._cursor = this._ancestors.pop();
                }
                else {
                    this._cursor = null;
                    break;
                }
            } while(this._cursor.right === save);
        }
        else {
            // get the next node from the subtree
            this._ancestors.push(this._cursor);
            this._minNode(this._cursor.right);
        }
    }
    return this._cursor !== null ? this._cursor.data : null;
};

// if null-iterator, returns last node
// otherwise, returns previous node
Iterator.prototype.prev = function() {
    if(this._cursor === null) {
        var root = this._tree._root;
        if(root !== null) {
            this._maxNode(root);
        }
    }
    else {
        if(this._cursor.left === null) {
            var save;
            do {
                save = this._cursor;
                if(this._ancestors.length) {
                    this._cursor = this._ancestors.pop();
                }
                else {
                    this._cursor = null;
                    break;
                }
            } while(this._cursor.left === save);
        }
        else {
            this._ancestors.push(this._cursor);
            this._maxNode(this._cursor.left);
        }
    }
    return this._cursor !== null ? this._cursor.data : null;
};

Iterator.prototype._minNode = function(start) {
    while(start.left !== null) {
        this._ancestors.push(start);
        start = start.left;
    }
    this._cursor = start;
};

Iterator.prototype._maxNode = function(start) {
    while(start.right !== null) {
        this._ancestors.push(start);
        start = start.right;
    }
    this._cursor = start;
};

module.exports = TreeBase;

};
require.m['__main__'] = function(module, exports) {

var TreeBase = require('./treebase');

function Node(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.red = true;
}

Node.prototype.get_child = function(dir) {
    return dir ? this.right : this.left;
};

Node.prototype.set_child = function(dir, val) {
    if(dir) {
        this.right = val;
    }
    else {
        this.left = val;
    }
};

function RBTree(comparator) {
    this._root = null;
    this._comparator = comparator;
    this.size = 0;
}

RBTree.prototype = new TreeBase();

// returns true if inserted, false if duplicate
RBTree.prototype.insert = function(data) {
    var ret = false;

    if(this._root === null) {
        // empty tree
        this._root = new Node(data);
        ret = true;
        this.size++;
    }
    else {
        var head = new Node(undefined); // fake tree root

        var dir = 0;
        var last = 0;

        // setup
        var gp = null; // grandparent
        var ggp = head; // grand-grand-parent
        var p = null; // parent
        var node = this._root;
        ggp.right = this._root;

        // search down
        while(true) {
            if(node === null) {
                // insert new node at the bottom
                node = new Node(data);
                p.set_child(dir, node);
                ret = true;
                this.size++;
            }
            else if(is_red(node.left) && is_red(node.right)) {
                // color flip
                node.red = true;
                node.left.red = false;
                node.right.red = false;
            }

            // fix red violation
            if(is_red(node) && is_red(p)) {
                var dir2 = ggp.right === gp;

                if(node === p.get_child(last)) {
                    ggp.set_child(dir2, single_rotate(gp, !last));
                }
                else {
                    ggp.set_child(dir2, double_rotate(gp, !last));
                }
            }

            var cmp = this._comparator(node.data, data);

            // stop if found
            if(cmp === 0) {
                break;
            }

            last = dir;
            dir = cmp < 0;

            // update helpers
            if(gp !== null) {
                ggp = gp;
            }
            gp = p;
            p = node;
            node = node.get_child(dir);
        }

        // update root
        this._root = head.right;
    }

    // make root black
    this._root.red = false;

    return ret;
};

// returns true if removed, false if not found
RBTree.prototype.remove = function(data) {
    if(this._root === null) {
        return false;
    }

    var head = new Node(undefined); // fake tree root
    var node = head;
    node.right = this._root;
    var p = null; // parent
    var gp = null; // grand parent
    var found = null; // found item
    var dir = 1;

    while(node.get_child(dir) !== null) {
        var last = dir;

        // update helpers
        gp = p;
        p = node;
        node = node.get_child(dir);

        var cmp = this._comparator(data, node.data);

        dir = cmp > 0;

        // save found node
        if(cmp === 0) {
            found = node;
        }

        // push the red node down
        if(!is_red(node) && !is_red(node.get_child(dir))) {
            if(is_red(node.get_child(!dir))) {
                var sr = single_rotate(node, dir);
                p.set_child(last, sr);
                p = sr;
            }
            else if(!is_red(node.get_child(!dir))) {
                var sibling = p.get_child(!last);
                if(sibling !== null) {
                    if(!is_red(sibling.get_child(!last)) && !is_red(sibling.get_child(last))) {
                        // color flip
                        p.red = false;
                        sibling.red = true;
                        node.red = true;
                    }
                    else {
                        var dir2 = gp.right === p;

                        if(is_red(sibling.get_child(last))) {
                            gp.set_child(dir2, double_rotate(p, last));
                        }
                        else if(is_red(sibling.get_child(!last))) {
                            gp.set_child(dir2, single_rotate(p, last));
                        }

                        // ensure correct coloring
                        var gpc = gp.get_child(dir2);
                        gpc.red = true;
                        node.red = true;
                        gpc.left.red = false;
                        gpc.right.red = false;
                    }
                }
            }
        }
    }

    // replace and remove if found
    if(found !== null) {
        found.data = node.data;
        p.set_child(p.right === node, node.get_child(node.left === null));
        this.size--;
    }

    // update root and make it black
    this._root = head.right;
    if(this._root !== null) {
        this._root.red = false;
    }

    return found !== null;
};

function is_red(node) {
    return node !== null && node.red;
}

function single_rotate(root, dir) {
    var save = root.get_child(!dir);

    root.set_child(!dir, save.get_child(dir));
    save.set_child(dir, root);

    root.red = true;
    save.red = false;

    return save;
}

function double_rotate(root, dir) {
    root.set_child(!dir, single_rotate(root.get_child(!dir), !dir));
    return single_rotate(root, dir);
}

module.exports = RBTree;
};
return require('__main__');
})(null);
 // end of ../bower_components/webcola/WebCola/cola.js
 // end of ../bower_components/webcola/WebCola/cola.js
this.j$ = this.jStat = (function(Math, undefined) {

// For quick reference.
var concat = Array.prototype.concat;
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;

// Calculate correction for IEEE error
// TODO: This calculation can be improved.
function calcRdx(n, m) {
  var val = n > m ? n : m;
  return Math.pow(10,
                  17 - ~~(Math.log(((val > 0) ? val : -val)) * Math.LOG10E));
}


var isArray = Array.isArray || function isArray(arg) {
  return toString.call(arg) === '[object Array]';
};


function isFunction(arg) {
  return toString.call(arg) === '[object Function]';
}


function isNumber(arg) {
  return typeof arg === 'number' && arg === arg;
}


// Converts the jStat matrix to vector.
function toVector(arr) {
  return concat.apply([], arr);
}


// The one and only jStat constructor.
function jStat() {
  return new jStat._init(arguments);
}


// TODO: Remove after all references in src files have been removed.
jStat.fn = jStat.prototype;


// By separating the initializer from the constructor it's easier to handle
// always returning a new instance whether "new" was used or not.
jStat._init = function _init(args) {
  var i;

  // If first argument is an array, must be vector or matrix.
  if (isArray(args[0])) {
    // Check if matrix.
    if (isArray(args[0][0])) {
      // See if a mapping function was also passed.
      if (isFunction(args[1]))
        args[0] = jStat.map(args[0], args[1]);
      // Iterate over each is faster than this.push.apply(this, args[0].
      for (i = 0; i < args[0].length; i++)
        this[i] = args[0][i];
      this.length = args[0].length;

    // Otherwise must be a vector.
    } else {
      this[0] = isFunction(args[1]) ? jStat.map(args[0], args[1]) : args[0];
      this.length = 1;
    }

  // If first argument is number, assume creation of sequence.
  } else if (isNumber(args[0])) {
    this[0] = jStat.seq.apply(null, args);
    this.length = 1;

  // Handle case when jStat object is passed to jStat.
  } else if (args[0] instanceof jStat) {
    // Duplicate the object and pass it back.
    return jStat(args[0].toArray());

  // Unexpected argument value, return empty jStat object.
  // TODO: This is strange behavior. Shouldn't this throw or some such to let
  // the user know they had bad arguments?
  } else {
    this[0] = [];
    this.length = 1;
  }

  return this;
};
jStat._init.prototype = jStat.prototype;
jStat._init.constructor = jStat;


// Utility functions.
// TODO: for internal use only?
jStat.utils = {
  calcRdx: calcRdx,
  isArray: isArray,
  isFunction: isFunction,
  isNumber: isNumber,
  toVector: toVector
};


// Easily extend the jStat object.
// TODO: is this seriously necessary?
jStat.extend = function extend(obj) {
  var i, j;

  if (arguments.length === 1) {
    for (j in obj)
      jStat[j] = obj[j];
    return this;
  }

  for (i = 1; i < arguments.length; i++) {
    for (j in arguments[i])
      obj[j] = arguments[i][j];
  }

  return obj;
};


// Returns the number of rows in the matrix.
jStat.rows = function rows(arr) {
  return arr.length || 1;
};


// Returns the number of columns in the matrix.
jStat.cols = function cols(arr) {
  return arr[0].length || 1;
};


// Returns the dimensions of the object { rows: i, cols: j }
jStat.dimensions = function dimensions(arr) {
  return {
    rows: jStat.rows(arr),
    cols: jStat.cols(arr)
  };
};


// Returns a specified row as a vector
jStat.row = function row(arr, index) {
  return arr[index];
};


// Returns the specified column as a vector
jStat.col = function cols(arr, index) {
  var column = new Array(arr.length);
  for (var i = 0; i < arr.length; i++)
    column[i] = [arr[i][index]];
  return column;
};


// Returns the diagonal of the matrix
jStat.diag = function diag(arr) {
  var nrow = jStat.rows(arr);
  var res = new Array(nrow);
  for (var row = 0; row < nrow; row++)
    res[row] = [arr[row][row]];
  return res;
};


// Returns the anti-diagonal of the matrix
jStat.antidiag = function antidiag(arr) {
  var nrow = jStat.rows(arr) - 1;
  var res = new Array(nrow);
  for (var i = 0; nrow >= 0; nrow--, i++)
    res[i] = [arr[i][nrow]];
  return res;
};

// Transpose a matrix or array.
jStat.transpose = function transpose(arr) {
  var obj = [];
  var objArr, rows, cols, j, i;

  // Make sure arr is in matrix format.
  if (!isArray(arr[0]))
    arr = [arr];

  rows = arr.length;
  cols = arr[0].length;

  for (i = 0; i < cols; i++) {
    objArr = new Array(rows);
    for (j = 0; j < rows; j++)
      objArr[j] = arr[j][i];
    obj.push(objArr);
  }

  // If obj is vector, return only single array.
  return obj.length === 1 ? obj[0] : obj;
};


// Map a function to an array or array of arrays.
// "toAlter" is an internal variable.
jStat.map = function map(arr, func, toAlter) {
  var row, nrow, ncol, res, col;

  if (!isArray(arr[0]))
    arr = [arr];

  nrow = arr.length;
  ncol = arr[0].length;
  res = toAlter ? arr : new Array(nrow);

  for (row = 0; row < nrow; row++) {
    // if the row doesn't exist, create it
    if (!res[row])
      res[row] = new Array(ncol);
    for (col = 0; col < ncol; col++)
      res[row][col] = func(arr[row][col], row, col);
  }

  return res.length === 1 ? res[0] : res;
};


// Cumulatively combine the elements of an array or array of arrays using a function.
jStat.cumreduce = function cumreduce(arr, func, toAlter) {
  var row, nrow, ncol, res, col;

  if (!isArray(arr[0]))
    arr = [arr];

  nrow = arr.length;
  ncol = arr[0].length;
  res = toAlter ? arr : new Array(nrow);

  for (row = 0; row < nrow; row++) {
    // if the row doesn't exist, create it
    if (!res[row])
      res[row] = new Array(ncol);
    if (ncol > 0)
      res[row][0] = arr[row][0];
    for (col = 1; col < ncol; col++)
      res[row][col] = func(res[row][col-1], arr[row][col]);
  }
  return res.length === 1 ? res[0] : res;
};


// Destructively alter an array.
jStat.alter = function alter(arr, func) {
  return jStat.map(arr, func, true);
};


// Generate a rows x cols matrix according to the supplied function.
jStat.create = function  create(rows, cols, func) {
  var res = new Array(rows);
  var i, j;

  if (isFunction(cols)) {
    func = cols;
    cols = rows;
  }

  for (i = 0; i < rows; i++) {
    res[i] = new Array(cols);
    for (j = 0; j < cols; j++)
      res[i][j] = func(i, j);
  }

  return res;
};


function retZero() { return 0; }


// Generate a rows x cols matrix of zeros.
jStat.zeros = function zeros(rows, cols) {
  if (!isNumber(cols))
    cols = rows;
  return jStat.create(rows, cols, retZero);
};


function retOne() { return 1; }


// Generate a rows x cols matrix of ones.
jStat.ones = function ones(rows, cols) {
  if (!isNumber(cols))
    cols = rows;
  return jStat.create(rows, cols, retOne);
};


// Generate a rows x cols matrix of uniformly random numbers.
jStat.rand = function rand(rows, cols) {
  if (!isNumber(cols))
    cols = rows;
  return jStat.create(rows, cols, Math.random);
};


function retIdent(i, j) { return i === j ? 1 : 0; }


// Generate an identity matrix of size row x cols.
jStat.identity = function identity(rows, cols) {
  if (!isNumber(cols))
    cols = rows;
  return jStat.create(rows, cols, retIdent);
};


// Tests whether a matrix is symmetric
jStat.symmetric = function symmetric(arr) {
  var issymmetric = true;
  var size = arr.length;
  var row, col;

  if (arr.length !== arr[0].length)
    return false;

  for (row = 0; row < size; row++) {
    for (col = 0; col < size; col++)
      if (arr[col][row] !== arr[row][col])
        return false;
  }

  return true;
};


// Set all values to zero.
jStat.clear = function clear(arr) {
  return jStat.alter(arr, retZero);
};


// Generate sequence.
jStat.seq = function seq(min, max, length, func) {
  if (!isFunction(func))
    func = false;

  var arr = [];
  var hival = calcRdx(min, max);
  var step = (max * hival - min * hival) / ((length - 1) * hival);
  var current = min;
  var cnt;

  // Current is assigned using a technique to compensate for IEEE error.
  // TODO: Needs better implementation.
  for (cnt = 0;
       current <= max;
       cnt++, current = (min * hival + step * hival * cnt) / hival) {
    arr.push((func ? func(current, cnt) : current));
  }

  return arr;
};


// TODO: Go over this entire implementation. Seems a tragic waste of resources
// doing all this work. Instead, and while ugly, use new Function() to generate
// a custom function for each static method.

// Quick reference.
var jProto = jStat.prototype;

// Default length.
jProto.length = 0;

// For internal use only.
// TODO: Check if they're actually used, and if they are then rename them
// to _*
jProto.push = Array.prototype.push;
jProto.sort = Array.prototype.sort;
jProto.splice = Array.prototype.splice;
jProto.slice = Array.prototype.slice;


// Return a clean array.
jProto.toArray = function toArray() {
  return this.length > 1 ? slice.call(this) : slice.call(this)[0];
};


// Map a function to a matrix or vector.
jProto.map = function map(func, toAlter) {
  return jStat(jStat.map(this, func, toAlter));
};


// Cumulatively combine the elements of a matrix or vector using a function.
jProto.cumreduce = function cumreduce(func, toAlter) {
  return jStat(jStat.cumreduce(this, func, toAlter));
};


// Destructively alter an array.
jProto.alter = function alter(func) {
  jStat.alter(this, func);
  return this;
};


// Extend prototype with methods that have no argument.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jProto[passfunc] = function(func) {
      var self = this,
      results;
      // Check for callback.
      if (func) {
        setTimeout(function() {
          func.call(self, jProto[passfunc].call(self));
        });
        return this;
      }
      results = jStat[passfunc](this);
      return isArray(results) ? jStat(results) : results;
    };
  })(funcs[i]);
})('transpose clear symmetric rows cols dimensions diag antidiag'.split(' '));


// Extend prototype with methods that have one argument.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jProto[passfunc] = function(index, func) {
      var self = this;
      // check for callback
      if (func) {
        setTimeout(function() {
          func.call(self, jProto[passfunc].call(self, index));
        });
        return this;
      }
      return jStat(jStat[passfunc](this, index));
    };
  })(funcs[i]);
})('row col'.split(' '));


// Extend prototype with simple shortcut methods.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jProto[passfunc] = new Function(
        'return jStat(jStat.' + passfunc + '.apply(null, arguments));');
  })(funcs[i]);
})('create zeros ones rand identity'.split(' '));


// Exposing jStat.
return jStat;

}(Math));
(function(jStat, Math) {

var isFunction = jStat.utils.isFunction;

// Ascending functions for sort
function ascNum(a, b) { return a - b; }

function clip(arg, min, max) {
  return Math.max(min, Math.min(arg, max));
}


// sum of an array
jStat.sum = function sum(arr) {
  var sum = 0;
  var i = arr.length;
  var tmp;
  while (--i >= 0)
    sum += arr[i];
  return sum;
};


// sum squared
jStat.sumsqrd = function sumsqrd(arr) {
  var sum = 0;
  var i = arr.length;
  while (--i >= 0)
    sum += arr[i] * arr[i];
  return sum;
};


// sum of squared errors of prediction (SSE)
jStat.sumsqerr = function sumsqerr(arr) {
  var mean = jStat.mean(arr);
  var sum = 0;
  var i = arr.length;
  var tmp;
  while (--i >= 0) {
    tmp = arr[i] - mean;
    sum += tmp * tmp;
  }
  return sum;
};


// product of an array
jStat.product = function product(arr) {
  var prod = 1;
  var i = arr.length;
  while (--i >= 0)
    prod *= arr[i];
  return prod;
};


// minimum value of an array
jStat.min = function min(arr) {
  var low = arr[0];
  var i = 0;
  while (++i < arr.length)
    if (arr[i] < low)
      low = arr[i];
  return low;
};


// maximum value of an array
jStat.max = function max(arr) {
  var high = arr[0];
  var i = 0;
  while (++i < arr.length)
    if (arr[i] > high)
      high = arr[i];
  return high;
};


// mean value of an array
jStat.mean = function mean(arr) {
  return jStat.sum(arr) / arr.length;
};


// mean squared error (MSE)
jStat.meansqerr = function meansqerr(arr) {
  return jStat.sumsqerr(arr) / arr.length;
};


// geometric mean of an array
jStat.geomean = function geomean(arr) {
  return Math.pow(jStat.product(arr), 1 / arr.length);
};


// median of an array
jStat.median = function median(arr) {
  var arrlen = arr.length;
  var _arr = arr.slice().sort(ascNum);
  // check if array is even or odd, then return the appropriate
  return !(arrlen & 1)
    ? (_arr[(arrlen / 2) - 1 ] + _arr[(arrlen / 2)]) / 2
    : _arr[(arrlen / 2) | 0 ];
};


// cumulative sum of an array
jStat.cumsum = function cumsum(arr) {
  return jStat.cumreduce(arr, function (a, b) { return a + b; });
};


// cumulative product of an array
jStat.cumprod = function cumprod(arr) {
  return jStat.cumreduce(arr, function (a, b) { return a * b; });
};


// successive differences of a sequence
jStat.diff = function diff(arr) {
  var diffs = [];
  var arrLen = arr.length;
  var i;
  for (i = 1; i < arrLen; i++)
    diffs.push(arr[i] - arr[i - 1]);
  return diffs;
};


// mode of an array
// if there are multiple modes of an array, return all of them
// is this the appropriate way of handling it?
jStat.mode = function mode(arr) {
  var arrLen = arr.length;
  var _arr = arr.slice().sort(ascNum);
  var count = 1;
  var maxCount = 0;
  var numMaxCount = 0;
  var mode_arr = [];
  var i;

  for (i = 0; i < arrLen; i++) {
    if (_arr[i] === _arr[i + 1]) {
      count++;
    } else {
      if (count > maxCount) {
        mode_arr = [_arr[i]];
        maxCount = count;
        numMaxCount = 0;
      }
      // are there multiple max counts
      else if (count === maxCount) {
        mode_arr.push(_arr[i]);
        numMaxCount++;
      }
      // resetting count for new value in array
      count = 1;
    }
  }

  return numMaxCount === 0 ? mode_arr[0] : mode_arr;
};


// range of an array
jStat.range = function range(arr) {
  return jStat.max(arr) - jStat.min(arr);
};

// variance of an array
// flag = true indicates sample instead of population
jStat.variance = function variance(arr, flag) {
  return jStat.sumsqerr(arr) / (arr.length - (flag ? 1 : 0));
};


// standard deviation of an array
// flag = true indicates sample instead of population
jStat.stdev = function stdev(arr, flag) {
  return Math.sqrt(jStat.variance(arr, flag));
};


// mean deviation (mean absolute deviation) of an array
jStat.meandev = function meandev(arr) {
  var devSum = 0;
  var mean = jStat.mean(arr);
  var i;
  for (i = arr.length - 1; i >= 0; i--)
    devSum += Math.abs(arr[i] - mean);
  return devSum / arr.length;
};


// median deviation (median absolute deviation) of an array
jStat.meddev = function meddev(arr) {
  var devSum = 0;
  var median = jStat.median(arr);
  var i;
  for (i = arr.length - 1; i >= 0; i--)
    devSum += Math.abs(arr[i] - median);
  return devSum / arr.length;
};


// coefficient of variation
jStat.coeffvar = function coeffvar(arr) {
  return jStat.stdev(arr) / jStat.mean(arr);
};


// quartiles of an array
jStat.quartiles = function quartiles(arr) {
  var arrlen = arr.length;
  var _arr = arr.slice().sort(ascNum);
  return [
    _arr[ Math.round((arrlen) / 4) - 1 ],
    _arr[ Math.round((arrlen) / 2) - 1 ],
    _arr[ Math.round((arrlen) * 3 / 4) - 1 ]
  ];
};


// Arbitary quantiles of an array. Direct port of the scipy.stats
// implementation by Pierre GF Gerard-Marchant.
jStat.quantiles = function quantiles(arr, quantilesArray, alphap, betap) {
  var sortedArray = arr.slice().sort(ascNum);
  var quantileVals = [quantilesArray.length];
  var n = arr.length;
  var i, p, m, aleph, k, gamma;

  if (typeof alphap === 'undefined')
    alphap = 3 / 8;
  if (typeof betap === 'undefined')
    betap = 3 / 8;

  for (i = 0; i < quantilesArray.length; i++) {
    p = quantilesArray[i];
    m = alphap + p * (1 - alphap - betap);
    aleph = n * p + m;
    k = Math.floor(clip(aleph, 1, n - 1));
    gamma = clip(aleph - k, 0, 1);
    quantileVals[i] = (1 - gamma) * sortedArray[k - 1] + gamma * sortedArray[k];
  }

  return quantileVals;
};


// The percentile rank of score in a given array. Returns the percentage
// of all values in the input array that are less than (kind='strict') or
// less or equal than (kind='weak') score. Default is weak.
jStat.percentileOfScore = function percentileOfScore(arr, score, kind) {
  var counter = 0;
  var len = arr.length;
  var strict = false;
  var value, i;

  if (kind === 'strict')
    strict = true;

  for (i = 0; i < len; i++) {
    value = arr[i];
    if ((strict && value < score) ||
        (!strict && value <= score)) {
      counter++;
    }
  }

  return counter / len;
};


// Histogram (bin count) data
jStat.histogram = function histogram(arr, bins) {
  var first = jStat.min(arr);
  var binCnt = bins || 4;
  var binWidth = (jStat.max(arr) - first) / binCnt;
  var len = arr.length;
  var bins = [];
  var i;

  for (i = 0; i < binCnt; i++)
    bins[i] = 0;
  for (i = 0; i < len; i++)
    bins[Math.min(Math.floor(((arr[i] - first) / binWidth)), binCnt - 1)] += 1;

  return bins;
};


// covariance of two arrays
jStat.covariance = function covariance(arr1, arr2) {
  var u = jStat.mean(arr1);
  var v = jStat.mean(arr2);
  var arr1Len = arr1.length;
  var sq_dev = new Array(arr1Len);
  var i;

  for (i = 0; i < arr1Len; i++)
    sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);

  return jStat.sum(sq_dev) / (arr1Len - 1);
};


// (pearson's) population correlation coefficient, rho
jStat.corrcoeff = function corrcoeff(arr1, arr2) {
  return jStat.covariance(arr1, arr2) /
      jStat.stdev(arr1, 1) /
      jStat.stdev(arr2, 1);
};

// statistical standardized moments (general form of skew/kurt)
jStat.stanMoment = function stanMoment(arr, n) {
  var mu = jStat.mean(arr);
  var sigma = jStat.stdev(arr);
  var len = arr.length;
  var skewSum = 0;

  for (i = 0; i < len; i++)
    skewSum += Math.pow((arr[i] - mu) / sigma, n);

  return skewSum / arr.length;
};

// (pearson's) moment coefficient of skewness
jStat.skewness = function skewness(arr) {
  return jStat.stanMoment(arr, 3);
};

// (pearson's) (excess) kurtosis
jStat.kurtosis = function kurtosis(arr) {
  return jStat.stanMoment(arr, 4) - 3;
};


var jProto = jStat.prototype;


// Extend jProto with method for calculating cumulative sums and products.
// This differs from the similar extension below as cumsum and cumprod should
// not be run again in the case fullbool === true.
// If a matrix is passed, automatically assume operation should be done on the
// columns.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    // If a matrix is passed, automatically assume operation should be done on
    // the columns.
    jProto[passfunc] = function(fullbool, func) {
      var arr = [];
      var i = 0;
      var tmpthis = this;
      // Assignment reassignation depending on how parameters were passed in.
      if (isFunction(fullbool)) {
        func = fullbool;
        fullbool = false;
      }
      // Check if a callback was passed with the function.
      if (func) {
        setTimeout(function() {
          func.call(tmpthis, jProto[passfunc].call(tmpthis, fullbool));
        });
        return this;
      }
      // Check if matrix and run calculations.
      if (this.length > 1) {
        tmpthis = fullbool === true ? this : this.transpose();
        for (; i < tmpthis.length; i++)
          arr[i] = jStat[passfunc](tmpthis[i]);
        return arr;
      }
      // Pass fullbool if only vector, not a matrix. for variance and stdev.
      return jStat[passfunc](this[0], fullbool);
    };
  })(funcs[i]);
})(('cumsum cumprod').split(' '));


// Extend jProto with methods which don't require arguments and work on columns.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    // If a matrix is passed, automatically assume operation should be done on
    // the columns.
    jProto[passfunc] = function(fullbool, func) {
      var arr = [];
      var i = 0;
      var tmpthis = this;
      // Assignment reassignation depending on how parameters were passed in.
      if (isFunction(fullbool)) {
        func = fullbool;
        fullbool = false;
      }
      // Check if a callback was passed with the function.
      if (func) {
        setTimeout(function() {
          func.call(tmpthis, jProto[passfunc].call(tmpthis, fullbool));
        });
        return this;
      }
      // Check if matrix and run calculations.
      if (this.length > 1) {
        tmpthis = fullbool === true ? this : this.transpose();
        for (; i < tmpthis.length; i++)
          arr[i] = jStat[passfunc](tmpthis[i]);
        return fullbool === true
            ? jStat[passfunc](jStat.utils.toVector(arr))
            : arr;
      }
      // Pass fullbool if only vector, not a matrix. for variance and stdev.
      return jStat[passfunc](this[0], fullbool);
    };
  })(funcs[i]);
})(('sum sumsqrd sumsqerr product min max mean meansqerr geomean median diff ' +
    'mode range variance stdev meandev meddev coeffvar quartiles histogram ' +
    'skewness kurtosis').split(' '));


// Extend jProto with functions that take arguments. Operations on matrices are
// done on columns.
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jProto[passfunc] = function() {
      var arr = [];
      var i = 0;
      var tmpthis = this;
      var args = Array.prototype.slice.call(arguments);

      // If the last argument is a function, we assume it's a callback; we
      // strip the callback out and call the function again.
      if (isFunction(args[args.length - 1])) {
        var callbackFunction = args[args.length - 1];
        var argsToPass = args.slice(0, args.length - 1);

        setTimeout(function() {
          callbackFunction.call(tmpthis,
                                jProto[passfunc].apply(tmpthis, argsToPass));
        });
        return this;

      // Otherwise we curry the function args and call normally.
      } else {
        var callbackFunction = undefined;
        var curriedFunction = function curriedFunction(vector) {
          return jStat[passfunc].apply(tmpthis, [vector].concat(args));
        }
      }

      // If this is a matrix, run column-by-column.
      if (this.length > 1) {
        tmpthis = tmpthis.transpose();
        for (; i < tmpthis.length; i++)
          arr[i] = curriedFunction(tmpthis[i]);
        return arr;
      }

      // Otherwise run on the vector.
      return curriedFunction(this[0]);
    };
  })(funcs[i]);
})('quantiles percentileOfScore'.split(' '));

}(this.jStat, Math));
// Special functions //
(function(jStat, Math) {

// Log-gamma function
jStat.gammaln = function gammaln(x) {
  var j = 0;
  var cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  var ser = 1.000000000190015;
  var xx, y, tmp;
  tmp = (y = xx = x) + 5.5;
  tmp -= (xx + 0.5) * Math.log(tmp);
  for (; j < 6; j++)
    ser += cof[j] / ++y;
  return Math.log(2.5066282746310005 * ser / xx) - tmp;
};


// gamma of x
jStat.gammafn = function gammafn(x) {
  var p = [-1.716185138865495, 24.76565080557592, -379.80425647094563,
           629.3311553128184, 866.9662027904133, -31451.272968848367,
           -36144.413418691176, 66456.14382024054
  ];
  var q = [-30.8402300119739, 315.35062697960416, -1015.1563674902192,
           -3107.771671572311, 22538.118420980151, 4755.8462775278811,
           -134659.9598649693, -115132.2596755535];
  var fact = false;
  var n = 0;
  var xden = 0;
  var xnum = 0;
  var y = x;
  var i, z, yi, res, sum, ysq;
  if (y <= 0) {
    res = y % 1 + 3.6e-16;
    if (res) {
      fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * res);
      y = 1 - y;
    } else {
      return Infinity;
    }
  }
  yi = y;
  if (y < 1) {
    z = y++;
  } else {
    z = (y -= n = (y | 0) - 1) - 1;
  }
  for (i = 0; i < 8; ++i) {
    xnum = (xnum + p[i]) * z;
    xden = xden * z + q[i];
  }
  res = xnum / xden + 1;
  if (yi < y) {
    res /= yi;
  } else if (yi > y) {
    for (i = 0; i < n; ++i) {
      res *= y;
      y++;
    }
  }
  if (fact) {
    res = fact / res;
  }
  return res;
};


// lower incomplete gamma function, which is usually typeset with a
// lower-case greek gamma as the function symbol
jStat.gammap = function gammap(a, x) {
  return jStat.lowRegGamma(a, x) * jStat.gammafn(a);
};


// The lower regularized incomplete gamma function, usually written P(a,x)
jStat.lowRegGamma = function lowRegGamma(a, x) {
  var aln = jStat.gammaln(a);
  var ap = a;
  var sum = 1 / a;
  var del = sum;
  var b = x + 1 - a;
  var c = 1 / 1.0e-30;
  var d = 1 / b;
  var h = d;
  var i = 1;
  // calculate maximum number of itterations required for a
  var ITMAX = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
  var an, endval;

  if (x < 0 || a <= 0) {
    return NaN;
  } else if (x < a + 1) {
    for (; i <= ITMAX; i++) {
      sum += del *= x / ++ap;
    }
    return (sum * Math.exp(-x + a * Math.log(x) - (aln)));
  }

  for (; i <= ITMAX; i++) {
    an = -i * (i - a);
    b += 2;
    d = an * d + b;
    c = b + an / c;
    d = 1 / d;
    h *= d * c;
  }

  return (1 - h * Math.exp(-x + a * Math.log(x) - (aln)));
};

// natural log factorial of n
jStat.factorialln = function factorialln(n) {
  return n < 0 ? NaN : jStat.gammaln(n + 1);
};

// factorial of n
jStat.factorial = function factorial(n) {
  return n < 0 ? NaN : jStat.gammafn(n + 1);
};

// combinations of n, m
jStat.combination = function combination(n, m) {
  // make sure n or m don't exceed the upper limit of usable values
  return (n > 170 || m > 170)
      ? Math.exp(jStat.combinationln(n, m))
      : (jStat.factorial(n) / jStat.factorial(m)) / jStat.factorial(n - m);
};


jStat.combinationln = function combinationln(n, m){
  return jStat.factorialln(n) - jStat.factorialln(m) - jStat.factorialln(n - m);
};


// permutations of n, m
jStat.permutation = function permutation(n, m) {
  return jStat.factorial(n) / jStat.factorial(n - m);
};


// beta function
jStat.betafn = function betafn(x, y) {
  // ensure arguments are positive
  if (x <= 0 || y <= 0)
    return undefined;
  // make sure x + y doesn't exceed the upper limit of usable values
  return (x + y > 170)
      ? Math.exp(jStat.betaln(x, y))
      : jStat.gammafn(x) * jStat.gammafn(y) / jStat.gammafn(x + y);
};


// natural logarithm of beta function
jStat.betaln = function betaln(x, y) {
  return jStat.gammaln(x) + jStat.gammaln(y) - jStat.gammaln(x + y);
};


// Evaluates the continued fraction for incomplete beta function by modified
// Lentz's method.
jStat.betacf = function betacf(x, a, b) {
  var fpmin = 1e-30;
  var m = 1;
  var qab = a + b;
  var qap = a + 1;
  var qam = a - 1;
  var c = 1;
  var d = 1 - qab * x / qap;
  var m2, aa, del, h;

  // These q's will be used in factors that occur in the coefficients
  if (Math.abs(d) < fpmin)
    d = fpmin;
  d = 1 / d;
  h = d;

  for (; m <= 100; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    // One step (the even one) of the recurrence
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    // Next step of the recurrence (the odd one)
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < 3e-7)
      break;
  }

  return h;
};


// Returns the inverse of the lower regularized inomplete gamma function
jStat.gammapinv = function gammapinv(p, a) {
  var j = 0;
  var a1 = a - 1;
  var EPS = 1e-8;
  var gln = jStat.gammaln(a);
  var x, err, t, u, pp, lna1, afac;

  if (p >= 1)
    return Math.max(100, a + 100 * Math.sqrt(a));
  if (p <= 0)
    return 0;
  if (a > 1) {
    lna1 = Math.log(a1);
    afac = Math.exp(a1 * (lna1 - 1) - gln);
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t * (0.99229 + t * 0.04481)) - t;
    if (p < 0.5)
      x = -x;
    x = Math.max(1e-3,
                 a * Math.pow(1 - 1 / (9 * a) - x / (3 * Math.sqrt(a)), 3));
  } else {
    t = 1 - a * (0.253 + a * 0.12);
    if (p < t)
      x = Math.pow(p / t, 1 / a);
    else
      x = 1 - Math.log(1 - (p - t) / (1 - t));
  }

  for(; j < 12; j++) {
    if (x <= 0)
      return 0;
    err = jStat.lowRegGamma(a, x) - p;
    if (a > 1)
      t = afac * Math.exp(-(x - a1) + a1 * (Math.log(x) - lna1));
    else
      t = Math.exp(-x + a1 * Math.log(x) - gln);
    u = err / t;
    x -= (t = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - 1))));
    if (x <= 0)
      x = 0.5 * (x + t);
    if (Math.abs(t) < EPS * x)
      break;
  }

  return x;
};


// Returns the error function erf(x)
jStat.erf = function erf(x) {
  var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
             -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
             4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
             1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
             6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
             -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
             -6.886027e-12, 8.94487e-13, 3.13092e-13,
             -1.12708e-13, 3.81e-16, 7.106e-15,
             -1.523e-15, -9.4e-17, 1.21e-16,
             -2.8e-17];
  var j = cof.length - 1;
  var isneg = false;
  var d = 0;
  var dd = 0;
  var t, ty, tmp, res;

  if (x < 0) {
    x = -x;
    isneg = true;
  }

  t = 2 / (2 + x);
  ty = 4 * t - 2;

  for(; j > 0; j--) {
    tmp = d;
    d = ty * d - dd + cof[j];
    dd = tmp;
  }

  res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
  return isneg ? res - 1 : 1 - res;
};


// Returns the complmentary error function erfc(x)
jStat.erfc = function erfc(x) {
  return 1 - jStat.erf(x);
};


// Returns the inverse of the complementary error function
jStat.erfcinv = function erfcinv(p) {
  var j = 0;
  var x, err, t, pp;
  if (p >= 2)
    return -100;
  if (p <= 0)
    return 100;
  pp = (p < 1) ? p : 2 - p;
  t = Math.sqrt(-2 * Math.log(pp / 2));
  x = -0.70711 * ((2.30753 + t * 0.27061) /
                  (1 + t * (0.99229 + t * 0.04481)) - t);
  for (; j < 2; j++) {
    err = jStat.erfc(x) - pp;
    x += err / (1.12837916709551257 * Math.exp(-x * x) - x * err);
  }
  return (p < 1) ? x : -x;
};


// Returns the inverse of the incomplete beta function
jStat.ibetainv = function ibetainv(p, a, b) {
  var EPS = 1e-8;
  var a1 = a - 1;
  var b1 = b - 1;
  var j = 0;
  var lna, lnb, pp, t, u, err, x, al, h, w, afac;
  if (p <= 0)
    return 0;
  if (p >= 1)
    return 1;
  if (a >= 1 && b >= 1) {
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t* (0.99229 + t * 0.04481)) - t;
    if (p < 0.5)
      x = -x;
    al = (x * x - 3) / 6;
    h = 2 / (1 / (2 * a - 1)  + 1 / (2 * b - 1));
    w = (x * Math.sqrt(al + h) / h) - (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
        (al + 5 / 6 - 2 / (3 * h));
    x = a / (a + b * Math.exp(2 * w));
  } else {
    lna = Math.log(a / (a + b));
    lnb = Math.log(b / (a + b));
    t = Math.exp(a * lna) / a;
    u = Math.exp(b * lnb) / b;
    w = t + u;
    if (p < t / w)
      x = Math.pow(a * w * p, 1 / a);
    else
      x = 1 - Math.pow(b * w * (1 - p), 1 / b);
  }
  afac = -jStat.gammaln(a) - jStat.gammaln(b) + jStat.gammaln(a + b);
  for(; j < 10; j++) {
    if (x === 0 || x === 1)
      return x;
    err = jStat.ibeta(x, a, b) - p;
    t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
    u = err / t;
    x -= (t = u / (1 - 0.5 * Math.min(1, u * (a1 / x - b1 / (1 - x)))));
    if (x <= 0)
      x = 0.5 * (x + t);
    if (x >= 1)
      x = 0.5 * (x + t + 1);
    if (Math.abs(t) < EPS * x && j > 0)
      break;
  }
  return x;
};


// Returns the incomplete beta function I_x(a,b)
jStat.ibeta = function ibeta(x, a, b) {
  // Factors in front of the continued fraction.
  var bt = (x === 0 || x === 1) ?  0 :
    Math.exp(jStat.gammaln(a + b) - jStat.gammaln(a) -
             jStat.gammaln(b) + a * Math.log(x) + b *
             Math.log(1 - x));
  if (x < 0 || x > 1)
    return false;
  if (x < (a + 1) / (a + b + 2))
    // Use continued fraction directly.
    return bt * jStat.betacf(x, a, b) / a;
  // else use continued fraction after making the symmetry transformation.
  return 1 - bt * jStat.betacf(1 - x, b, a) / b;
};


// Returns a normal deviate (mu=0, sigma=1).
// If n and m are specified it returns a object of normal deviates.
jStat.randn = function randn(n, m) {
  var u, v, x, y, q, mat;
  if (!m)
    m = n;
  if (n)
    return jStat.create(n, m, function() { return jStat.randn(); });
  do {
    u = Math.random();
    v = 1.7156 * (Math.random() - 0.5);
    x = u - 0.449871;
    y = Math.abs(v) + 0.386595;
    q = x * x + y * (0.19600 * y - 0.25472 * x);
  } while (q > 0.27597 && (q > 0.27846 || v * v > -4 * Math.log(u) * u * u));
  return v / u;
};


// Returns a gamma deviate by the method of Marsaglia and Tsang.
jStat.randg = function randg(shape, n, m) {
  var oalph = shape;
  var a1, a2, u, v, x, mat;
  if (!m)
    m = n;
  if (!shape)
    shape = 1;
  if (n) {
    mat = jStat.zeros(n,m);
    mat.alter(function() { return jStat.randg(shape); });
    return mat;
  }
  if (shape < 1)
    shape += 1;
  a1 = shape - 1 / 3;
  a2 = 1 / Math.sqrt(9 * a1);
  do {
    do {
      x = jStat.randn();
      v = 1 + a2 * x;
    } while(v <= 0);
    v = v * v * v;
    u = Math.random();
  } while(u > 1 - 0.331 * Math.pow(x, 4) &&
          Math.log(u) > 0.5 * x*x + a1 * (1 - v + Math.log(v)));
  // alpha > 1
  if (shape == oalph)
    return a1 * v;
  // alpha < 1
  do {
    u = Math.random();
  } while(u === 0);
  return Math.pow(u, 1 / oalph) * a1 * v;
};


// making use of static methods on the instance
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jStat.fn[passfunc] = function() {
      return jStat(
          jStat.map(this, function(value) { return jStat[passfunc](value); }));
    }
  })(funcs[i]);
})('gammaln gammafn factorial factorialln'.split(' '));


(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jStat.fn[passfunc] = function() {
      return jStat(jStat[passfunc].apply(null, arguments));
    };
  })(funcs[i]);
})('randn'.split(' '));

}(this.jStat, Math));
(function(jStat, Math) {

// generate all distribution instance methods
(function(list) {
  for (var i = 0; i < list.length; i++) (function(func) {
    // distribution instance method
    jStat[func] = function(a, b, c) {
      if (!(this instanceof arguments.callee))
        return new arguments.callee(a, b, c);
      this._a = a;
      this._b = b;
      this._c = c;
      return this;
    };
    // distribution method to be used on a jStat instance
    jStat.fn[func] = function(a, b, c) {
      var newthis = jStat[func](a, b, c);
      newthis.data = this;
      return newthis;
    };
    // sample instance method
    jStat[func].prototype.sample = function(arr) {
      var a = this._a;
      var b = this._b;
      var c = this._c;
      if (arr)
        return jStat.alter(arr, function() {
          return jStat[func].sample(a, b, c);
        });
      else
        return jStat[func].sample(a, b, c);
    };
    // generate the pdf, cdf and inv instance methods
    (function(vals) {
      for (var i = 0; i < vals.length; i++) (function(fnfunc) {
        jStat[func].prototype[fnfunc] = function(x) {
          var a = this._a;
          var b = this._b;
          var c = this._c;
          if (!x && x !== 0)
            x = this.data;
          if (typeof x !== 'number') {
            return jStat.fn.map.call(x, function(x) {
              return jStat[func][fnfunc](x, a, b, c);
            });
          }
          return jStat[func][fnfunc](x, a, b, c);
        };
      })(vals[i]);
    })('pdf cdf inv'.split(' '));
    // generate the mean, median, mode and variance instance methods
    (function(vals) {
      for (var i = 0; i < vals.length; i++) (function(fnfunc) {
        jStat[func].prototype[fnfunc] = function() {
          return jStat[func][fnfunc](this._a, this._b, this._c);
        };
      })(vals[i]);
    })('mean median mode variance'.split(' '));
  })(list[i]);
})((
  'beta centralF cauchy chisquare exponential gamma invgamma kumaraswamy ' +
  'lognormal normal pareto studentt weibull uniform  binomial negbin hypgeom ' +
  'poisson triangular'
).split(' '));



// extend beta function with static methods
jStat.extend(jStat.beta, {
  pdf: function pdf(x, alpha, beta) {
    // PDF is zero outside the support
    if (x > 1 || x < 0)
      return 0;
    // PDF is one for the uniform case
    if (alpha == 1 && beta == 1)
      return 1;

    if (alpha < 512 || beta < 512) {
      return (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) /
          jStat.betafn(alpha, beta);
    } else {
      return Math.exp((alpha - 1) * Math.log(x) +
                      (beta - 1) * Math.log(1 - x) -
                      jStat.betaln(alpha, beta));
    }
  },

  cdf: function cdf(x, alpha, beta) {
    return (x > 1 || x < 0) ? (x > 1) * 1 : jStat.ibeta(x, alpha, beta);
  },

  inv: function inv(x, alpha, beta) {
    return jStat.ibetainv(x, alpha, beta);
  },

  mean: function mean(alpha, beta) {
    return alpha / (alpha + beta);
  },

  median: function median(alpha, beta) {
    throw new Error('median not yet implemented');
  },

  mode: function mode(alpha, beta) {
    return (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  },

  // return a random sample
  sample: function sample(alpha, beta) {
    var u = jStat.randg(alpha);
    return u / (u + jStat.randg(beta));
  },

  variance: function variance(alpha, beta) {
    return (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  }
});

// extend F function with static methods
jStat.extend(jStat.centralF, {
  // This implementation of the pdf function avoids float overflow
  // See the way that R calculates this value:
  // https://svn.r-project.org/R/trunk/src/nmath/df.c
  pdf: function pdf(x, df1, df2) {
    var p, q, f;

    if (x < 0)
      return undefined;

    if (df1 <= 2) {
      if (df1 === 1 && df2 === 1) {
        return Infinity;
      }
      if (df1 === 2 && df2 === 1) {
        return 1;
      }
      return Math.sqrt((Math.pow(df1 * x, df1) * Math.pow(df2, df2)) /
                       (Math.pow(df1 * x + df2, df1 + df2))) /
                       (x * jStat.betafn(df1/2, df2/2));
    }

    p = (df1 * x) / (df2 + x * df1);
    q = df2 / (df2 + x * df1);
    f = df1 * q / 2.0;
    return f * jStat.binomial.pdf((df1 - 2) / 2, (df1 + df2 - 2) / 2, p);
  },

  cdf: function cdf(x, df1, df2) {
    return jStat.ibeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
  },

  inv: function inv(x, df1, df2) {
    return df2 / (df1 * (1 / jStat.ibetainv(x, df1 / 2, df2 / 2) - 1));
  },

  mean: function mean(df1, df2) {
    return (df2 > 2) ? df2 / (df2 - 2) : undefined;
  },

  mode: function mode(df1, df2) {
    return (df1 > 2) ? (df2 * (df1 - 2)) / (df1 * (df2 + 2)) : undefined;
  },

  // return a random sample
  sample: function sample(df1, df2) {
    var x1 = jStat.randg(df1 / 2) * 2;
    var x2 = jStat.randg(df2 / 2) * 2;
    return (x1 / df1) / (x2 / df2);
  },

  variance: function variance(df1, df2) {
    if (df2 <= 4)
      return undefined;
    return 2 * df2 * df2 * (df1 + df2 - 2) /
        (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4));
  }
});


// extend cauchy function with static methods
jStat.extend(jStat.cauchy, {
  pdf: function pdf(x, local, scale) {
    return (scale / (Math.pow(x - local, 2) + Math.pow(scale, 2))) / Math.PI;
  },

  cdf: function cdf(x, local, scale) {
    return Math.atan((x - local) / scale) / Math.PI + 0.5;
  },

  inv: function(p, local, scale) {
    return local + scale * Math.tan(Math.PI * (p - 0.5));
  },

  median: function median(local, scale) {
    return local;
  },

  mode: function mode(local, scale) {
    return local;
  },

  sample: function sample(local, scale) {
    return jStat.randn() *
        Math.sqrt(1 / (2 * jStat.randg(0.5))) * scale + local;
  }
});



// extend chisquare function with static methods
jStat.extend(jStat.chisquare, {
  pdf: function pdf(x, dof) {
    return x === 0 ? 0 :
        Math.exp((dof / 2 - 1) * Math.log(x) - x / 2 - (dof / 2) *
                 Math.log(2) - jStat.gammaln(dof / 2));
  },

  cdf: function cdf(x, dof) {
    return jStat.lowRegGamma(dof / 2, x / 2);
  },

  inv: function(p, dof) {
    return 2 * jStat.gammapinv(p, 0.5 * dof);
  },

  mean : function(dof) {
    return dof;
  },

  // TODO: this is an approximation (is there a better way?)
  median: function median(dof) {
    return dof * Math.pow(1 - (2 / (9 * dof)), 3);
  },

  mode: function mode(dof) {
    return (dof - 2 > 0) ? dof - 2 : 0;
  },

  sample: function sample(dof) {
    return jStat.randg(dof / 2) * 2;
  },

  variance: function variance(dof) {
    return 2 * dof;
  }
});



// extend exponential function with static methods
jStat.extend(jStat.exponential, {
  pdf: function pdf(x, rate) {
    return x < 0 ? 0 : rate * Math.exp(-rate * x);
  },

  cdf: function cdf(x, rate) {
    return x < 0 ? 0 : 1 - Math.exp(-rate * x);
  },

  inv: function(p, rate) {
    return -Math.log(1 - p) / rate;
  },

  mean : function(rate) {
    return 1 / rate;
  },

  median: function (rate) {
    return (1 / rate) * Math.log(2);
  },

  mode: function mode(rate) {
    return 0;
  },

  sample: function sample(rate) {
    return -1 / rate * Math.log(Math.random());
  },

  variance : function(rate) {
    return Math.pow(rate, -2);
  }
});



// extend gamma function with static methods
jStat.extend(jStat.gamma, {
  pdf: function pdf(x, shape, scale) {
    return Math.exp((shape - 1) * Math.log(x) - x / scale -
                    jStat.gammaln(shape) - shape * Math.log(scale));
  },

  cdf: function cdf(x, shape, scale) {
    return jStat.lowRegGamma(shape, x / scale);
  },

  inv: function(p, shape, scale) {
    return jStat.gammapinv(p, shape) * scale;
  },

  mean : function(shape, scale) {
    return shape * scale;
  },

  mode: function mode(shape, scale) {
    if(shape > 1) return (shape - 1) * scale;
    return undefined;
  },

  sample: function sample(shape, scale) {
    return jStat.randg(shape) * scale;
  },

  variance: function variance(shape, scale) {
    return shape * scale * scale;
  }
});

// extend inverse gamma function with static methods
jStat.extend(jStat.invgamma, {
  pdf: function pdf(x, shape, scale) {
    return Math.exp(-(shape + 1) * Math.log(x) - scale / x -
                    jStat.gammaln(shape) + shape * Math.log(scale));
  },

  cdf: function cdf(x, shape, scale) {
    return 1 - jStat.lowRegGamma(shape, scale / x);
  },

  inv: function(p, shape, scale) {
    return scale / jStat.gammapinv(1 - p, shape);
  },

  mean : function(shape, scale) {
    return (shape > 1) ? scale / (shape - 1) : undefined;
  },

  mode: function mode(shape, scale) {
    return scale / (shape + 1);
  },

  sample: function sample(shape, scale) {
    return scale / jStat.randg(shape);
  },

  variance: function variance(shape, scale) {
    if (shape <= 2)
      return undefined;
    return scale * scale / ((shape - 1) * (shape - 1) * (shape - 2));
  }
});


// extend kumaraswamy function with static methods
jStat.extend(jStat.kumaraswamy, {
  pdf: function pdf(x, alpha, beta) {
    return Math.exp(Math.log(alpha) + Math.log(beta) + (alpha - 1) *
                    Math.log(x) + (beta - 1) *
                    Math.log(1 - Math.pow(x, alpha)));
  },

  cdf: function cdf(x, alpha, beta) {
    return (1 - Math.pow(1 - Math.pow(x, alpha), beta));
  },

  mean : function(alpha, beta) {
    return (beta * jStat.gammafn(1 + 1 / alpha) *
            jStat.gammafn(beta)) / (jStat.gammafn(1 + 1 / alpha + beta));
  },

  median: function median(alpha, beta) {
    return Math.pow(1 - Math.pow(2, -1 / beta), 1 / alpha);
  },

  mode: function mode(alpha, beta) {
    if (!(alpha >= 1 && beta >= 1 && (alpha !== 1 && beta !== 1)))
      return undefined;
    return Math.pow((alpha - 1) / (alpha * beta - 1), 1 / alpha);
  },

  variance: function variance(alpha, beta) {
    throw new Error('variance not yet implemented');
    // TODO: complete this
  }
});



// extend lognormal function with static methods
jStat.extend(jStat.lognormal, {
  pdf: function pdf(x, mu, sigma) {
    return Math.exp(-Math.log(x) - 0.5 * Math.log(2 * Math.PI) -
                    Math.log(sigma) - Math.pow(Math.log(x) - mu, 2) /
                    (2 * sigma * sigma));
  },

  cdf: function cdf(x, mu, sigma) {
    return 0.5 +
        (0.5 * jStat.erf((Math.log(x) - mu) / Math.sqrt(2 * sigma * sigma)));
  },

  inv: function(p, mu, sigma) {
    return Math.exp(-1.41421356237309505 * sigma * jStat.erfcinv(2 * p) + mu);
  },

  mean: function mean(mu, sigma) {
    return Math.exp(mu + sigma * sigma / 2);
  },

  median: function median(mu, sigma) {
    return Math.exp(mu);
  },

  mode: function mode(mu, sigma) {
    return Math.exp(mu - sigma * sigma);
  },

  sample: function sample(mu, sigma) {
    return Math.exp(jStat.randn() * sigma + mu);
  },

  variance: function variance(mu, sigma) {
    return (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
  }
});



// extend normal function with static methods
jStat.extend(jStat.normal, {
  pdf: function pdf(x, mean, std) {
    return Math.exp(-0.5 * Math.log(2 * Math.PI) -
                    Math.log(std) - Math.pow(x - mean, 2) / (2 * std * std));
  },

  cdf: function cdf(x, mean, std) {
    return 0.5 * (1 + jStat.erf((x - mean) / Math.sqrt(2 * std * std)));
  },

  inv: function(p, mean, std) {
    return -1.41421356237309505 * std * jStat.erfcinv(2 * p) + mean;
  },

  mean : function(mean, std) {
    return mean;
  },

  median: function median(mean, std) {
    return mean;
  },

  mode: function (mean, std) {
    return mean;
  },

  sample: function sample(mean, std) {
    return jStat.randn() * std + mean;
  },

  variance : function(mean, std) {
    return std * std;
  }
});



// extend pareto function with static methods
jStat.extend(jStat.pareto, {
  pdf: function pdf(x, scale, shape) {
    if (x < scale)
      return undefined;
    return (shape * Math.pow(scale, shape)) / Math.pow(x, shape + 1);
  },

  cdf: function cdf(x, scale, shape) {
    return 1 - Math.pow(scale / x, shape);
  },

  mean: function mean(scale, shape) {
    if (shape <= 1)
      return undefined;
    return (shape * Math.pow(scale, shape)) / (shape - 1);
  },

  median: function median(scale, shape) {
    return scale * (shape * Math.SQRT2);
  },

  mode: function mode(scale, shape) {
    return scale;
  },

  variance : function(scale, shape) {
    if (shape <= 2)
      return undefined;
    return (scale*scale * shape) / (Math.pow(shape - 1, 2) * (shape - 2));
  }
});



// extend studentt function with static methods
jStat.extend(jStat.studentt, {
  pdf: function pdf(x, dof) {
    return (jStat.gammafn((dof + 1) / 2) / (Math.sqrt(dof * Math.PI) *
        jStat.gammafn(dof / 2))) *
        Math.pow(1 + ((x * x) / dof), -((dof + 1) / 2));
  },

  cdf: function cdf(x, dof) {
    var dof2 = dof / 2;
    return jStat.ibeta((x + Math.sqrt(x * x + dof)) /
                       (2 * Math.sqrt(x * x + dof)), dof2, dof2);
  },

  inv: function(p, dof) {
    var x = jStat.ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
    x = Math.sqrt(dof * (1 - x) / x);
    return (p > 0.5) ? x : -x;
  },

  mean: function mean(dof) {
    return (dof > 1) ? 0 : undefined;
  },

  median: function median(dof) {
    return 0;
  },

  mode: function mode(dof) {
    return 0;
  },

  sample: function sample(dof) {
    return jStat.randn() * Math.sqrt(dof / (2 * jStat.randg(dof / 2)));
  },

  variance: function variance(dof) {
    return (dof  > 2) ? dof / (dof - 2) : (dof > 1) ? Infinity : undefined;
  }
});



// extend weibull function with static methods
jStat.extend(jStat.weibull, {
  pdf: function pdf(x, scale, shape) {
    if (x < 0)
      return 0;
    return (shape / scale) * Math.pow((x / scale), (shape - 1)) *
        Math.exp(-(Math.pow((x / scale), shape)));
  },

  cdf: function cdf(x, scale, shape) {
    return x < 0 ? 0 : 1 - Math.exp(-Math.pow((x / scale), shape));
  },

  inv: function(p, scale, shape) {
    return scale * Math.pow(-Math.log(1 - p), 1 / shape);
  },

  mean : function(scale, shape) {
    return scale * jStat.gammafn(1 + 1 / shape);
  },

  median: function median(scale, shape) {
    return scale * Math.pow(Math.log(2), 1 / shape);
  },

  mode: function mode(scale, shape) {
    if (shape <= 1)
      return undefined;
    return scale * Math.pow((shape - 1) / shape, 1 / shape);
  },

  sample: function sample(scale, shape) {
    return scale * Math.pow(-Math.log(Math.random()), 1 / shape);
  },

  variance: function variance(scale, shape) {
    return scale * scale * jStat.gammafn(1 + 2 / shape) -
        Math.pow(this.mean(scale, shape), 2);
  }
});



// extend uniform function with static methods
jStat.extend(jStat.uniform, {
  pdf: function pdf(x, a, b) {
    return (x < a || x > b) ? 0 : 1 / (b - a);
  },

  cdf: function cdf(x, a, b) {
    if (x < a)
      return 0;
    else if (x < b)
      return (x - a) / (b - a);
    return 1;
  },

  inv: function(p, a, b) {
    return a + (p * (b - a));
  },

  mean: function mean(a, b) {
    return 0.5 * (a + b);
  },

  median: function median(a, b) {
    return jStat.mean(a, b);
  },

  mode: function mode(a, b) {
    throw new Error('mode is not yet implemented');
  },

  sample: function sample(a, b) {
    return (a / 2 + b / 2) + (b / 2 - a / 2) * (2 * Math.random() - 1);
  },

  variance: function variance(a, b) {
    return Math.pow(b - a, 2) / 12;
  }
});



// extend uniform function with static methods
jStat.extend(jStat.binomial, {
  pdf: function pdf(k, n, p) {
    return (p === 0 || p === 1) ?
      ((n * p) === k ? 1 : 0) :
      jStat.combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  },

  cdf: function cdf(x, n, p) {
    var binomarr = [],
    k = 0;
    if (x < 0) {
      return 0;
    }
    if (x < n) {
      for (; k <= x; k++) {
        binomarr[ k ] = jStat.binomial.pdf(k, n, p);
      }
      return jStat.sum(binomarr);
    }
    return 1;
  }
});



// extend uniform function with static methods
jStat.extend(jStat.negbin, {
  pdf: function pdf(k, r, p) {
    return k !== k | 0
      ? false
      : k < 0
        ? 0
        : jStat.combination(k + r - 1, r - 1) * Math.pow(1 - p, k) * Math.pow(p, r);
  },

  cdf: function cdf(x, r, p) {
    var sum = 0,
    k = 0;
    if (x < 0) return 0;
    for (; k <= x; k++) {
      sum += jStat.negbin.pdf(k, r, p);
    }
    return sum;
  }
});



// extend uniform function with static methods
jStat.extend(jStat.hypgeom, {
  pdf: function pdf(k, N, m, n) {
    // Hypergeometric PDF.

    // A simplification of the CDF algorithm below.

    // k = number of successes drawn
    // N = population size
    // m = number of successes in population
    // n = number of items drawn from population

    if(k !== k | 0) {
      return false;
    } else if(k < 0 || k < m - (N - n)) {
      // It's impossible to have this few successes drawn.
      return 0;
    } else if(k > n || k > m) {
      // It's impossible to have this many successes drawn.
      return 0;
    } else if (m * 2 > N) {
      // More than half the population is successes.

      if(n * 2 > N) {
        // More than half the population is sampled.

        return jStat.hypgeom.pdf(N - m - n + k, N, N - m, N - n)
      } else {
        // Half or less of the population is sampled.

        return jStat.hypgeom.pdf(n - k, N, N - m, n);
      }

    } else if(n * 2 > N) {
      // Half or less is successes.

      return jStat.hypgeom.pdf(m - k, N, m, N - n);

    } else if(m < n) {
      // We want to have the number of things sampled to be less than the
      // successes available. So swap the definitions of successful and sampled.
      return jStat.hypgeom.pdf(k, N, n, m);
    } else {
      // If we get here, half or less of the population was sampled, half or
      // less of it was successes, and we had fewer sampled things than
      // successes. Now we can do this complicated iterative algorithm in an
      // efficient way.

      // The basic premise of the algorithm is that we partially normalize our
      // intermediate product to keep it in a numerically good region, and then
      // finish the normalization at the end.

      // This variable holds the scaled probability of the current number of
      // successes.
      var scaledPDF = 1;

      // This keeps track of how much we have normalized.
      var samplesDone = 0;

      for(var i = 0; i < k; i++) {
        // For every possible number of successes up to that observed...

        while(scaledPDF > 1 && samplesDone < n) {
          // Intermediate result is growing too big. Apply some of the
          // normalization to shrink everything.

          scaledPDF *= 1 - (m / (N - samplesDone));

          // Say we've normalized by this sample already.
          samplesDone++;
        }

        // Work out the partially-normalized hypergeometric PDF for the next
        // number of successes
        scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));
      }

      for(; samplesDone < n; samplesDone++) {
        // Apply all the rest of the normalization
        scaledPDF *= 1 - (m / (N - samplesDone));
      }

      // Bound answer sanely before returning.
      return Math.min(1, Math.max(0, scaledPDF));
    }
  },

  cdf: function cdf(x, N, m, n) {
    // Hypergeometric CDF.

    // This algorithm is due to Prof. Thomas S. Ferguson, <tom@math.ucla.edu>,
    // and comes from his hypergeometric test calculator at
    // <http://www.math.ucla.edu/~tom/distributions/Hypergeometric.html>.

    // x = number of successes drawn
    // N = population size
    // m = number of successes in population
    // n = number of items drawn from population

    if(x < 0 || x < m - (N - n)) {
      // It's impossible to have this few successes drawn or fewer.
      return 0;
    } else if(x >= n || x >= m) {
      // We will always have this many successes or fewer.
      return 1;
    } else if (m * 2 > N) {
      // More than half the population is successes.

      if(n * 2 > N) {
        // More than half the population is sampled.

        return jStat.hypgeom.cdf(N - m - n + x, N, N - m, N - n)
      } else {
        // Half or less of the population is sampled.

        return 1 - jStat.hypgeom.cdf(n - x - 1, N, N - m, n);
      }

    } else if(n * 2 > N) {
      // Half or less is successes.

      return 1 - jStat.hypgeom.cdf(m - x - 1, N, m, N - n);

    } else if(m < n) {
      // We want to have the number of things sampled to be less than the
      // successes available. So swap the definitions of successful and sampled.
      return jStat.hypgeom.cdf(x, N, n, m);
    } else {
      // If we get here, half or less of the population was sampled, half or
      // less of it was successes, and we had fewer sampled things than
      // successes. Now we can do this complicated iterative algorithm in an
      // efficient way.

      // The basic premise of the algorithm is that we partially normalize our
      // intermediate sum to keep it in a numerically good region, and then
      // finish the normalization at the end.

      // Holds the intermediate, scaled total CDF.
      var scaledCDF = 1;

      // This variable holds the scaled probability of the current number of
      // successes.
      var scaledPDF = 1;

      // This keeps track of how much we have normalized.
      var samplesDone = 0;

      for(var i = 0; i < x; i++) {
        // For every possible number of successes up to that observed...

        while(scaledCDF > 1 && samplesDone < n) {
          // Intermediate result is growing too big. Apply some of the
          // normalization to shrink everything.

          var factor = 1 - (m / (N - samplesDone));

          scaledPDF *= factor;
          scaledCDF *= factor;

          // Say we've normalized by this sample already.
          samplesDone++;
        }

        // Work out the partially-normalized hypergeometric PDF for the next
        // number of successes
        scaledPDF *= (n - i) * (m - i) / ((i + 1) * (N - m - n + i + 1));

        // Add to the CDF answer.
        scaledCDF += scaledPDF;
      }

      for(; samplesDone < n; samplesDone++) {
        // Apply all the rest of the normalization
        scaledCDF *= 1 - (m / (N - samplesDone));
      }

      // Bound answer sanely before returning.
      return Math.min(1, Math.max(0, scaledCDF));
    }
  }
});



// extend uniform function with static methods
jStat.extend(jStat.poisson, {
  pdf: function pdf(k, l) {
    return Math.pow(l, k) * Math.exp(-l) / jStat.factorial(k);
  },

  cdf: function cdf(x, l) {
    var sumarr = [],
    k = 0;
    if (x < 0) return 0;
    for (; k <= x; k++) {
      sumarr.push(jStat.poisson.pdf(k, l));
    }
    return jStat.sum(sumarr);
  },

  mean : function(l) {
    return l;
  },

  variance : function(l) {
    return l;
  },

  sample: function sample(l) {
    var p = 1, k = 0, L = Math.exp(-l);
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }
});

// extend triangular function with static methods
jStat.extend(jStat.triangular, {
  pdf: function pdf(x, a, b, c) {
    if (b <= a || c < a || c > b) {
      return undefined;
    } else {
      if (x < a || x > b) {
        return 0;
      } else {
        if (x <= c) {
          if ( c === a)
            return 1;
          else
            return (2 * (x - a)) / ((b - a) * (c - a));
        } else {
          if (c === b)
            return 1;
          else
            return (2 * (b - x)) / ((b - a) * (b - c));
        }
      }
    }
  },

  cdf: function cdf(x, a, b, c) {
    if (b <= a || c < a || c > b)
      return undefined;
    if (x < a) {
      return 0;
    } else {
      if (x <= c)
        return Math.pow(x - a, 2) / ((b - a) * (c - a));
      return 1 - Math.pow(b - x, 2) / ((b - a) * (b - c));
    }
    // never reach this
    return 1;
  },

  mean: function mean(a, b, c) {
    return (a + b + c) / 3;
  },

  median: function median(a, b, c) {
    if (c <= (a + b) / 2) {
      return b - Math.sqrt((b - a) * (b - c)) / Math.sqrt(2);
    } else if (c > (a + b) / 2) {
      return a + Math.sqrt((b - a) * (c - a)) / Math.sqrt(2);
    }
  },

  mode: function mode(a, b, c) {
    return c;
  },

  sample: function sample(a, b, c) {
    var u = Math.random();
    if (u < ((c - a) / (b - a)))
      return a + Math.sqrt(u * (b - a) * (c - a))
    return b - Math.sqrt((1 - u) * (b - a) * (b - c));
  },

  variance: function variance(a, b, c) {
    return (a * a + b * b + c * c - a * b - a * c - b * c) / 18;
  }
});

}(this.jStat, Math));
/* Provides functions for the solution of linear system of equations, integration, extrapolation,
 * interpolation, eigenvalue problems, differential equations and PCA analysis. */

(function(jStat, Math) {

var push = Array.prototype.push;
var isArray = jStat.utils.isArray;

jStat.extend({

  // add a vector/matrix to a vector/matrix or scalar
  add: function add(arr, arg) {
    // check if arg is a vector or scalar
    if (isArray(arg)) {
      if (!isArray(arg[0])) arg = [ arg ];
      return jStat.map(arr, function(value, row, col) {
        return value + arg[row][col];
      });
    }
    return jStat.map(arr, function(value) { return value + arg; });
  },

  // subtract a vector or scalar from the vector
  subtract: function subtract(arr, arg) {
    // check if arg is a vector or scalar
    if (isArray(arg)) {
      if (!isArray(arg[0])) arg = [ arg ];
      return jStat.map(arr, function(value, row, col) {
        return value - arg[row][col] || 0;
      });
    }
    return jStat.map(arr, function(value) { return value - arg; });
  },

  // matrix division
  divide: function divide(arr, arg) {
    if (isArray(arg)) {
      if (!isArray(arg[0])) arg = [ arg ];
      return jStat.multiply(arr, jStat.inv(arg));
    }
    return jStat.map(arr, function(value) { return value / arg; });
  },

  // matrix multiplication
  multiply: function multiply(arr, arg) {
    var row, col, nrescols, sum,
    nrow = arr.length,
    ncol = arr[0].length,
    res = jStat.zeros(nrow, nrescols = (isArray(arg)) ? arg[0].length : ncol),
    rescols = 0;
    if (isArray(arg)) {
      for (; rescols < nrescols; rescols++) {
        for (row = 0; row < nrow; row++) {
          sum = 0;
          for (col = 0; col < ncol; col++)
          sum += arr[row][col] * arg[col][rescols];
          res[row][rescols] = sum;
        }
      }
      return (nrow === 1 && rescols === 1) ? res[0][0] : res;
    }
    return jStat.map(arr, function(value) { return value * arg; });
  },

  // Returns the dot product of two matricies
  dot: function dot(arr, arg) {
    if (!isArray(arr[0])) arr = [ arr ];
    if (!isArray(arg[0])) arg = [ arg ];
    // convert column to row vector
    var left = (arr[0].length === 1 && arr.length !== 1) ? jStat.transpose(arr) : arr,
    right = (arg[0].length === 1 && arg.length !== 1) ? jStat.transpose(arg) : arg,
    res = [],
    row = 0,
    nrow = left.length,
    ncol = left[0].length,
    sum, col;
    for (; row < nrow; row++) {
      res[row] = [];
      sum = 0;
      for (col = 0; col < ncol; col++)
      sum += left[row][col] * right[row][col];
      res[row] = sum;
    }
    return (res.length === 1) ? res[0] : res;
  },

  // raise every element by a scalar
  pow: function pow(arr, arg) {
    return jStat.map(arr, function(value) { return Math.pow(value, arg); });
  },

  // exponentiate every element
  exp: function exp(arr) {
    return jStat.map(arr, function(value) { return Math.exp(value); });
  },

  // generate the natural log of every element
  log: function exp(arr) {
    return jStat.map(arr, function(value) { return Math.log(value); });
  },

  // generate the absolute values of the vector
  abs: function abs(arr) {
    return jStat.map(arr, function(value) { return Math.abs(value); });
  },

  // computes the p-norm of the vector
  // In the case that a matrix is passed, uses the first row as the vector
  norm: function norm(arr, p) {
    var nnorm = 0,
    i = 0;
    // check the p-value of the norm, and set for most common case
    if (isNaN(p)) p = 2;
    // check if multi-dimensional array, and make vector correction
    if (isArray(arr[0])) arr = arr[0];
    // vector norm
    for (; i < arr.length; i++) {
      nnorm += Math.pow(Math.abs(arr[i]), p);
    }
    return Math.pow(nnorm, 1 / p);
  },

  // computes the angle between two vectors in rads
  // In case a matrix is passed, this uses the first row as the vector
  angle: function angle(arr, arg) {
    return Math.acos(jStat.dot(arr, arg) / (jStat.norm(arr) * jStat.norm(arg)));
  },

  // augment one matrix by another
  // Note: this function returns a matrix, not a jStat object
  aug: function aug(a, b) {
    var newarr = a.slice(),
    i = 0;
    for (; i < newarr.length; i++) {
      push.apply(newarr[i], b[i]);
    }
    return newarr;
  },

  // The inv() function calculates the inverse of a matrix
  // Create the inverse by augmenting the matrix by the identity matrix of the
  // appropriate size, and then use G-J elimination on the augmented matrix.
  inv: function inv(a) {
    var rows = a.length;
    var cols = a[0].length;
    var b = jStat.identity(rows, cols);
    var c = jStat.gauss_jordan(a, b);
    var result = [];
    var i = 0;
    var j;

    //We need to copy the inverse portion to a new matrix to rid G-J artifacts
    for (; i < rows; i++) {
      result[i] = [];
      for (j = cols; j < c[0].length; j++)
        result[i][j - cols] = c[i][j];
    }
    return result;
  },

  // calculate the determinant of a matrix
  det: function det(a) {
    var alen = a.length,
    alend = alen * 2,
    vals = new Array(alend),
    rowshift = alen - 1,
    colshift = alend - 1,
    mrow = rowshift - alen + 1,
    mcol = colshift,
    i = 0,
    result = 0,
    j;
    // check for special 2x2 case
    if (alen === 2) {
      return a[0][0] * a[1][1] - a[0][1] * a[1][0];
    }
    for (; i < alend; i++) {
      vals[i] = 1;
    }
    for (i = 0; i < alen; i++) {
      for (j = 0; j < alen; j++) {
        vals[(mrow < 0) ? mrow + alen : mrow ] *= a[i][j];
        vals[(mcol < alen) ? mcol + alen : mcol ] *= a[i][j];
        mrow++;
        mcol--;
      }
      mrow = --rowshift - alen + 1;
      mcol = --colshift;
    }
    for (i = 0; i < alen; i++) {
      result += vals[i];
    }
    for (; i < alend; i++) {
      result -= vals[i];
    }
    return result;
  },

  gauss_elimination: function gauss_elimination(a, b) {
    var i = 0,
    j = 0,
    n = a.length,
    m = a[0].length,
    factor = 1,
    sum = 0,
    x = [],
    maug, pivot, temp, k;
    a = jStat.aug(a, b);
    maug = a[0].length;
    for(i = 0; i < n; i++) {
      pivot = a[i][i];
      j = i;
      for (k = i + 1; k < m; k++) {
        if (pivot < Math.abs(a[k][i])) {
          pivot = a[k][i];
          j = k;
        }
      }
      if (j != i) {
        for(k = 0; k < maug; k++) {
          temp = a[i][k];
          a[i][k] = a[j][k];
          a[j][k] = temp;
        }
      }
      for (j = i + 1; j < n; j++) {
        factor = a[j][i] / a[i][i];
        for(k = i; k < maug; k++) {
          a[j][k] = a[j][k] - factor * a[i][k];
        }
      }
    }
    for (i = n - 1; i >= 0; i--) {
      sum = 0;
      for (j = i + 1; j<= n - 1; j++) {
        sum = sum + x[j] * a[i][j];
      }
      x[i] =(a[i][maug - 1] - sum) / a[i][i];
    }
    return x;
  },

  gauss_jordan: function gauss_jordan(a, b) {
    var m = jStat.aug(a, b),
    h = m.length,
    w = m[0].length;
    // find max pivot
    for (var y = 0; y < h; y++) {
      var maxrow = y;
      for (var y2 = y+1; y2 < h; y2++) {
        if (Math.abs(m[y2][y]) > Math.abs(m[maxrow][y]))
          maxrow = y2;
      }
      var tmp = m[y];
      m[y] = m[maxrow];
      m[maxrow] = tmp
      for (var y2 = y+1; y2 < h; y2++) {
        c = m[y2][y] / m[y][y];
        for (var x = y; x < w; x++) {
          m[y2][x] -= m[y][x] * c;
        }
      }
    }
    // backsubstitute
    for (var y = h-1; y >= 0; y--) {
      c = m[y][y];
      for (var y2 = 0; y2 < y; y2++) {
        for (var x = w-1; x > y-1; x--) {
          m[y2][x] -= m[y][x] * m[y2][y] / c;
        }
      }
      m[y][y] /= c;
      for (var x = h; x < w; x++) {
        m[y][x] /= c;
      }
    }
    return m;
  },

  lu: function lu(a, b) {
    throw new Error('lu not yet implemented');
  },

  cholesky: function cholesky(a, b) {
    throw new Error('cholesky not yet implemented');
  },

  gauss_jacobi: function gauss_jacobi(a, b, x, r) {
    var i = 0;
    var j = 0;
    var n = a.length;
    var l = [];
    var u = [];
    var d = [];
    var xv, c, h, xk;
    for (; i < n; i++) {
      l[i] = [];
      u[i] = [];
      d[i] = [];
      for (j = 0; j < n; j++) {
        if (i > j) {
          l[i][j] = a[i][j];
          u[i][j] = d[i][j] = 0;
        } else if (i < j) {
          u[i][j] = a[i][j];
          l[i][j] = d[i][j] = 0;
        } else {
          d[i][j] = a[i][j];
          l[i][j] = u[i][j] = 0;
        }
      }
    }
    h = jStat.multiply(jStat.multiply(jStat.inv(d), jStat.add(l, u)), -1);
    c = jStat.multiply(jStat.inv(d), b);
    xv = x;
    xk = jStat.add(jStat.multiply(h, x), c);
    i = 2;
    while (Math.abs(jStat.norm(jStat.subtract(xk,xv))) > r) {
      xv = xk;
      xk = jStat.add(jStat.multiply(h, xv), c);
      i++;
    }
    return xk;
  },

  gauss_seidel: function gauss_seidel(a, b, x, r) {
    var i = 0;
    var n = a.length;
    var l = [];
    var u = [];
    var d = [];
    var j, xv, c, h, xk;
    for (; i < n; i++) {
      l[i] = [];
      u[i] = [];
      d[i] = [];
      for (j = 0; j < n; j++) {
        if (i > j) {
          l[i][j] = a[i][j];
          u[i][j] = d[i][j] = 0;
        } else if (i < j) {
          u[i][j] = a[i][j];
          l[i][j] = d[i][j] = 0;
        } else {
          d[i][j] = a[i][j];
          l[i][j] = u[i][j] = 0;
        }
      }
    }
    h = jStat.multiply(jStat.multiply(jStat.inv(jStat.add(d, l)), u), -1);
    c = jStat.multiply(jStat.inv(jStat.add(d, l)), b);
    xv = x;
    xk = jStat.add(jStat.multiply(h, x), c);
    i = 2;
    while (Math.abs(jStat.norm(jStat.subtract(xk, xv))) > r) {
      xv = xk;
      xk = jStat.add(jStat.multiply(h, xv), c);
      i = i + 1;
    }
    return xk;
  },

  SOR: function SOR(a, b, x, r, w) {
    var i = 0;
    var n = a.length;
    var l = [];
    var u = [];
    var d = [];
    var j, xv, c, h, xk;
    for (; i < n; i++) {
      l[i] = [];
      u[i] = [];
      d[i] = [];
      for (j = 0; j < n; j++) {
        if (i > j) {
          l[i][j] = a[i][j];
          u[i][j] = d[i][j] = 0;
        } else if (i < j) {
          u[i][j] = a[i][j];
          l[i][j] = d[i][j] = 0;
        } else {
          d[i][j] = a[i][j];
          l[i][j] = u[i][j] = 0;
        }
      }
    }
    h = jStat.multiply(jStat.inv(jStat.add(d, jStat.multiply(l, w))),
                       jStat.subtract(jStat.multiply(d, 1 - w),
                                      jStat.multiply(u, w)));
    c = jStat.multiply(jStat.multiply(jStat.inv(jStat.add(d,
        jStat.multiply(l, w))), b), w);
    xv = x;
    xk = jStat.add(jStat.multiply(h, x), c);
    i = 2;
    while (Math.abs(jStat.norm(jStat.subtract(xk, xv))) > r) {
      xv = xk;
      xk = jStat.add(jStat.multiply(h, xv), c);
      i++;
    }
    return xk;
  },

  householder: function householder(a) {
    var m = a.length;
    var n = a[0].length;
    var i = 0;
    var w = [];
    var p = [];
    var alpha, r, k, j, factor;
    for (; i < m - 1; i++) {
      alpha = 0;
      for (j = i + 1; j < n; j++)
      alpha += (a[j][i] * a[j][i]);
      factor = (a[i + 1][i] > 0) ? -1 : 1;
      alpha = factor * Math.sqrt(alpha);
      r = Math.sqrt((((alpha * alpha) - a[i + 1][i] * alpha) / 2));
      w = jStat.zeros(m, 1);
      w[i + 1][0] = (a[i + 1][i] - alpha) / (2 * r);
      for (k = i + 2; k < m; k++) w[k][0] = a[k][i] / (2 * r);
      p = jStat.subtract(jStat.identity(m, n),
          jStat.multiply(jStat.multiply(w, jStat.transpose(w)), 2));
      a = jStat.multiply(p, jStat.multiply(a, p));
    }
    return a;
  },

  // TODO: not working properly.
  QR: function QR(a, b) {
    var m = a.length;
    var n = a[0].length;
    var i = 0;
    var w = [];
    var p = [];
    var x = [];
    var j, alpha, r, k, factor, sum;
    for (; i < m - 1; i++) {
      alpha = 0;
      for (j = i + 1; j < n; j++)
        alpha += (a[j][i] * a[j][i]);
      factor = (a[i + 1][i] > 0) ? -1 : 1;
      alpha = factor * Math.sqrt(alpha);
      r = Math.sqrt((((alpha * alpha) - a[i + 1][i] * alpha) / 2));
      w = jStat.zeros(m, 1);
      w[i + 1][0] = (a[i + 1][i] - alpha) / (2 * r);
      for (k = i + 2; k < m; k++)
        w[k][0] = a[k][i] / (2 * r);
      p = jStat.subtract(jStat.identity(m, n),
          jStat.multiply(jStat.multiply(w, jStat.transpose(w)), 2));
      a = jStat.multiply(p, a);
      b = jStat.multiply(p, b);
    }
    for (i = m - 1; i >= 0; i--) {
      sum = 0;
      for (j = i + 1; j <= n - 1; j++)
      sum = x[j] * a[i][j];
      x[i] = b[i][0] / a[i][i];
    }
    return x;
  },

  jacobi: function jacobi(a) {
    var condition = 1;
    var count = 0;
    var n = a.length;
    var e = jStat.identity(n, n);
    var ev = [];
    var b, i, j, p, q, maxim, theta, s;
    // condition === 1 only if tolerance is not reached
    while (condition === 1) {
      count++;
      maxim = a[0][1];
      p = 0;
      q = 1;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (i != j) {
            if (maxim < Math.abs(a[i][j])) {
              maxim = Math.abs(a[i][j]);
              p = i;
              q = j;
            }
          }
        }
      }
      if (a[p][p] === a[q][q])
        theta = (a[p][q] > 0) ? Math.PI / 4 : -Math.PI / 4;
      else
        theta = Math.atan(2 * a[p][q] / (a[p][p] - a[q][q])) / 2;
      s = jStat.identity(n, n);
      s[p][p] = Math.cos(theta);
      s[p][q] = -Math.sin(theta);
      s[q][p] = Math.sin(theta);
      s[q][q] = Math.cos(theta);
      // eigen vector matrix
      e = jStat.multiply(e, s);
      b = jStat.multiply(jStat.multiply(jStat.inv(s), a), s);
      a = b;
      condition = 0;
      for (i = 1; i < n; i++) {
        for (j = 1; j < n; j++) {
          if (i != j && Math.abs(a[i][j]) > 0.001) {
            condition = 1;
          }
        }
      }
    }
    for (i = 0; i < n; i++) ev.push(a[i][i]);
    //returns both the eigenvalue and eigenmatrix
    return [e, ev];
  },

  rungekutta: function rungekutta(f, h, p, t_j, u_j, order) {
    var k1, k2, u_j1, k3, k4;
    if (order === 2) {
      while (t_j <= p) {
        k1 = h * f(t_j, u_j);
        k2 = h * f(t_j + h, u_j + k1);
        u_j1 = u_j + (k1 + k2) / 2;
        u_j = u_j1;
        t_j = t_j + h;
      }
    }
    if (order === 4) {
      while (t_j <= p) {
        k1 = h * f(t_j, u_j);
        k2 = h * f(t_j + h / 2, u_j + k1 / 2);
        k3 = h * f(t_j + h / 2, u_j + k2 / 2);
        k4 = h * f(t_j +h, u_j + k3);
        u_j1 = u_j + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        u_j = u_j1;
        t_j = t_j + h;
      }
    }
    return u_j;
  },

  romberg: function romberg(f, a, b, order) {
    var i = 0;
    var h = (b - a) / 2;
    var x = [];
    var h1 = [];
    var g = [];
    var m, a1, j, k, I, d;
    while (i < order / 2) {
      I = f(a);
      for (j = a, k = 0; j <= b; j = j + h, k++) x[k] = j;
      m = x.length;
      for (j = 1; j < m - 1; j++) {
        I += (((j % 2) !== 0) ? 4 : 2) * f(x[j]);
      }
      I = (h / 3) * (I + f(b));
      g[i] = I;
      h /= 2;
      i++;
    }
    a1 = g.length;
    m = 1;
    while (a1 !== 1) {
      for (j = 0; j < a1 - 1; j++)
      h1[j] = ((Math.pow(4, m)) * g[j + 1] - g[j]) / (Math.pow(4, m) - 1);
      a1 = h1.length;
      g = h1;
      h1 = [];
      m++;
    }
    return g;
  },

  richardson: function richardson(X, f, x, h) {
    function pos(X, x) {
      var i = 0;
      var n = X.length;
      var p;
      for (; i < n; i++)
        if (X[i] === x) p = i;
      return p;
    }
    var n = X.length,
    h_min = Math.abs(x - X[pos(X, x) + 1]),
    i = 0,
    g = [],
    h1 = [],
    y1, y2, m, a, j;
    while (h >= h_min) {
      y1 = pos(X, x + h);
      y2 = pos(X, x);
      g[i] = (f[y1] - 2 * f[y2] + f[2 * y2 - y1]) / (h * h);
      h /= 2;
      i++;
    }
    a = g.length;
    m = 1;
    while (a != 1) {
      for (j = 0; j < a - 1; j++)
      h1[j] = ((Math.pow(4, m)) * g[j + 1] - g[j]) / (Math.pow(4, m) - 1);
      a = h1.length;
      g = h1;
      h1 = [];
      m++;
    }
    return g;
  },

  simpson: function simpson(f, a, b, n) {
    var h = (b - a) / n;
    var I = f(a);
    var x = [];
    var j = a;
    var k = 0;
    var i = 1;
    var m;
    for (; j <= b; j = j + h, k++)
      x[k] = j;
    m = x.length;
    for (; i < m - 1; i++) {
      I += ((i % 2 !== 0) ? 4 : 2) * f(x[i]);
    }
    return (h / 3) * (I + f(b));
  },

  hermite: function hermite(X, F, dF, value) {
    var n = X.length;
    var p = 0;
    var i = 0;
    var l = [];
    var dl = [];
    var A = [];
    var B = [];
    var j;
    for (; i < n; i++) {
      l[i] = 1;
      for (j = 0; j < n; j++) {
        if (i != j) l[i] *= (value - X[j]) / (X[i] - X[j]);
      }
      dl[i] = 0;
      for (j = 0; j < n; j++) {
        if (i != j) dl[i] += 1 / (X [i] - X[j]);
      }
      A[i] = (1 - 2 * (value - X[i]) * dl[i]) * (l[i] * l[i]);
      B[i] = (value - X[i]) * (l[i] * l[i]);
      p += (A[i] * F[i] + B[i] * dF[i]);
    }
    return p;
  },

  lagrange: function lagrange(X, F, value) {
    var p = 0;
    var i = 0;
    var j, l;
    var n = X.length;
    for (; i < n; i++) {
      l = F[i];
      for (j = 0; j < n; j++) {
        // calculating the lagrange polynomial L_i
        if (i != j) l *= (value - X[j]) / (X[i] - X[j]);
      }
      // adding the lagrange polynomials found above
      p += l;
    }
    return p;
  },

  cubic_spline: function cubic_spline(X, F, value) {
    var n = X.length;
    var i = 0, j;
    var A = [];
    var B = [];
    var alpha = [];
    var c = [];
    var h = [];
    var b = [];
    var d = [];
    for (; i < n - 1; i++)
      h[i] = X[i + 1] - X[i];
    alpha[0] = 0;
    for (i = 1; i < n - 1; i++) {
      alpha[i] = (3 / h[i]) * (F[i + 1] - F[i]) -
          (3 / h[i-1]) * (F[i] - F[i-1]);
    }
    for (i = 1; i < n - 1; i++) {
      A[i] = [];
      B[i] = [];
      A[i][i-1] = h[i-1];
      A[i][i] = 2 * (h[i - 1] + h[i]);
      A[i][i+1] = h[i];
      B[i][0] = alpha[i];
    }
    c = jStat.multiply(jStat.inv(A), B);
    for (j = 0; j < n - 1; j++) {
      b[j] = (F[j + 1] - F[j]) / h[j] - h[j] * (c[j + 1][0] + 2 * c[j][0]) / 3;
      d[j] = (c[j + 1][0] - c[j][0]) / (3 * h[j]);
    }
    for (j = 0; j < n; j++) {
      if (X[j] > value) break;
    }
    j -= 1;
    return F[j] + (value - X[j]) * b[j] + jStat.sq(value-X[j]) *
        c[j] + (value - X[j]) * jStat.sq(value - X[j]) * d[j];
  },

  gauss_quadrature: function gauss_quadrature() {
    throw new Error('gauss_quadrature not yet implemented');
  },

  PCA: function PCA(X) {
    var m = X.length;
    var n = X[0].length;
    var flag = false;
    var i = 0;
    var j, temp1;
    var u = [];
    var D = [];
    var result = [];
    var temp2 = [];
    var Y = [];
    var Bt = [];
    var B = [];
    var C = [];
    var V = [];
    var Vt = [];
    for (i = 0; i < m; i++) {
      u[i] = jStat.sum(X[i]) / n;
    }
    for (i = 0; i < n; i++) {
      B[i] = [];
      for(j = 0; j < m; j++) {
        B[i][j] = X[j][i] - u[j];
      }
    }
    B = jStat.transpose(B);
    for (i = 0; i < m; i++) {
      C[i] = [];
      for (j = 0; j < m; j++) {
        C[i][j] = (jStat.dot([B[i]], [B[j]])) / (n - 1);
      }
    }
    result = jStat.jacobi(C);
    V = result[0];
    D = result[1];
    Vt = jStat.transpose(V);
    for (i = 0; i < D.length; i++) {
      for (j = i; j < D.length; j++) {
        if(D[i] < D[j])  {
          temp1 = D[i];
          D[i] = D[j];
          D[j] = temp1;
          temp2 = Vt[i];
          Vt[i] = Vt[j];
          Vt[j] = temp2;
        }
      }
    }
    Bt = jStat.transpose(B);
    for (i = 0; i < m; i++) {
      Y[i] = [];
      for (j = 0; j < Bt.length; j++) {
        Y[i][j] = jStat.dot([Vt[i]], [Bt[j]]);
      }
    }
    return [X, D, Vt, Y];
  }
});

// extend jStat.fn with methods that require one argument
(function(funcs) {
  for (var i = 0; i < funcs.length; i++) (function(passfunc) {
    jStat.fn[passfunc] = function(arg, func) {
      var tmpthis = this;
      // check for callback
      if (func) {
        setTimeout(function() {
          func.call(tmpthis, jStat.fn[passfunc].call(tmpthis, arg));
        }, 15);
        return this;
      }
      if (typeof jStat[passfunc](this, arg) === 'number')
        return jStat[passfunc](this, arg);
      else
        return jStat(jStat[passfunc](this, arg));
    };
  }(funcs[i]));
}('add divide multiply subtract dot pow exp log abs norm angle'.split(' ')));

}(this.jStat, Math));
(function(jStat, Math) {

var slice = [].slice;
var isNumber = jStat.utils.isNumber;

// flag==true denotes use of sample standard deviation
// Z Statistics
jStat.extend({
  // 2 different parameter lists:
  // (value, mean, sd)
  // (value, array, flag)
  zscore: function zscore() {
    var args = slice.call(arguments);
    if (isNumber(args[1])) {
      return (args[0] - args[1]) / args[2];
    }
    return (args[0] - jStat.mean(args[1])) / jStat.stdev(args[1], args[2]);
  },

  // 3 different paramter lists:
  // (value, mean, sd, sides)
  // (zscore, sides)
  // (value, array, sides, flag)
  ztest: function ztest() {
    var args = slice.call(arguments);
    if (args.length === 4) {
      if(isNumber(args[1])) {
        var z = jStat.zscore(args[0],args[1],args[2])
        return (args[3] === 1) ?
          (jStat.normal.cdf(-Math.abs(z),0,1)) :
          (jStat.normal.cdf(-Math.abs(z),0,1)* 2);
      }
      var z = args[0]
      return (args[2] === 1) ?
        (jStat.normal.cdf(-Math.abs(z),0,1)) :
        (jStat.normal.cdf(-Math.abs(z),0,1)*2);
    }
    var z = jStat.zscore(args[0],args[1],args[3])
    return (args[1] === 1) ?
      (jStat.normal.cdf(-Math.abs(z), 0, 1)) :
      (jStat.normal.cdf(-Math.abs(z), 0, 1)*2);
  }
});

jStat.extend(jStat.fn, {
  zscore: function zscore(value, flag) {
    return (value - this.mean()) / this.stdev(flag);
  },

  ztest: function ztest(value, sides, flag) {
    var zscore = Math.abs(this.zscore(value, flag));
    return (sides === 1) ?
      (jStat.normal.cdf(-zscore, 0, 1)) :
      (jStat.normal.cdf(-zscore, 0, 1) * 2);
  }
});

// T Statistics
jStat.extend({
  // 2 parameter lists
  // (value, mean, sd, n)
  // (value, array)
  tscore: function tscore() {
    var args = slice.call(arguments);
    return (args.length === 4) ?
      ((args[0] - args[1]) / (args[2] / Math.sqrt(args[3]))) :
      ((args[0] - jStat.mean(args[1])) /
       (jStat.stdev(args[1], true) / Math.sqrt(args[1].length)));
  },

  // 3 different paramter lists:
  // (value, mean, sd, n, sides)
  // (tscore, n, sides)
  // (value, array, sides)
  ttest: function ttest() {
    var args = slice.call(arguments);
    var tscore;
    if (args.length === 5) {
      tscore = Math.abs(jStat.tscore(args[0], args[1], args[2], args[3]));
      return (args[4] === 1) ?
        (jStat.studentt.cdf(-tscore, args[3]-1)) :
        (jStat.studentt.cdf(-tscore, args[3]-1)*2);
    }
    if (isNumber(args[1])) {
      tscore = Math.abs(args[0])
      return (args[2] == 1) ?
        (jStat.studentt.cdf(-tscore, args[1]-1)) :
        (jStat.studentt.cdf(-tscore, args[1]-1) * 2);
    }
    tscore = Math.abs(jStat.tscore(args[0], args[1]))
    return (args[2] == 1) ?
      (jStat.studentt.cdf(-tscore, args[1].length-1)) :
      (jStat.studentt.cdf(-tscore, args[1].length-1) * 2);
  }
});

jStat.extend(jStat.fn, {
  tscore: function tscore(value) {
    return (value - this.mean()) / (this.stdev(true) / Math.sqrt(this.cols()));
  },

  ttest: function ttest(value, sides) {
    return (sides === 1) ?
      (1 - jStat.studentt.cdf(Math.abs(this.tscore(value)), this.cols()-1)) :
      (jStat.studentt.cdf(-Math.abs(this.tscore(value)), this.cols()-1)*2);
  }
});

// F Statistics
jStat.extend({
  // Paramter list is as follows:
  // (array1, array2, array3, ...)
  // or it is an array of arrays
  // array of arrays conversion
  anovafscore: function anovafscore() {
    var args = slice.call(arguments),
    expVar, sample, sampMean, sampSampMean, tmpargs, unexpVar, i, j;
    if (args.length === 1) {
      tmpargs = new Array(args[0].length);
      for (i = 0; i < args[0].length; i++) {
        tmpargs[i] = args[0][i];
      }
      args = tmpargs;
    }
    // 2 sample case
    if (args.length === 2) {
      return jStat.variance(args[0]) / jStat.variance(args[1]);
    }
    // Builds sample array
    sample = new Array();
    for (i = 0; i < args.length; i++) {
      sample = sample.concat(args[i]);
    }
    sampMean = jStat.mean(sample);
    // Computes the explained variance
    expVar = 0;
    for (i = 0; i < args.length; i++) {
      expVar = expVar + args[i].length * Math.pow(jStat.mean(args[i]) - sampMean, 2);
    }
    expVar /= (args.length - 1);
    // Computes unexplained variance
    unexpVar = 0;
    for (i = 0; i < args.length; i++) {
      sampSampMean = jStat.mean(args[i]);
      for (j = 0; j < args[i].length; j++) {
        unexpVar += Math.pow(args[i][j] - sampSampMean, 2);
      }
    }
    unexpVar /= (sample.length - args.length);
    return expVar / unexpVar;
  },

  // 2 different paramter setups
  // (array1, array2, array3, ...)
  // (anovafscore, df1, df2)
  anovaftest: function anovaftest() {
    var args = slice.call(arguments),
    df1, df2, n, i;
    if (isNumber(args[0])) {
      return 1 - jStat.centralF.cdf(args[0], args[1], args[2]);
    }
    anovafscore = jStat.anovafscore(args);
    df1 = args.length - 1;
    n = 0;
    for (i = 0; i < args.length; i++) {
      n = n + args[i].length;
    }
    df2 = n - df1 - 1;
    return 1 - jStat.centralF.cdf(anovafscore, df1, df2);
  },

  ftest: function ftest(fscore, df1, df2) {
    return 1 - jStat.centralF.cdf(fscore, df1, df2);
  }
});

jStat.extend(jStat.fn, {
  anovafscore: function anovafscore() {
    return jStat.anovafscore(this.toArray());
  },

  anovaftes: function anovaftes() {
    var n = 0;
    var i;
    for (i = 0; i < this.length; i++) {
      n = n + this[i].length;
    }
    return jStat.ftest(this.anovafscore(), this.length - 1, n - this.length);
  }
});

// Error Bounds
jStat.extend({
  // 2 different parameter setups
  // (value, alpha, sd, n)
  // (value, alpha, array)
  normalci: function normalci() {
    var args = slice.call(arguments),
    ans = new Array(2),
    change;
    if (args.length === 4) {
      change = Math.abs(jStat.normal.inv(args[1] / 2, 0, 1) *
                        args[2] / Math.sqrt(args[3]));
    } else {
      change = Math.abs(jStat.normal.inv(args[1] / 2, 0, 1) *
                        jStat.stdev(args[2]) / Math.sqrt(args[2].length));
    }
    ans[0] = args[0] - change;
    ans[1] = args[0] + change;
    return ans;
  },

  // 2 different parameter setups
  // (value, alpha, sd, n)
  // (value, alpha, array)
  tci: function tci() {
    var args = slice.call(arguments),
    ans = new Array(2),
    change;
    if (args.length === 4) {
      change = Math.abs(jStat.studentt.inv(args[1] / 2, args[3] - 1) *
                        args[2] / Math.sqrt(args[3]));
    } else {
      change = Math.abs(jStat.studentt.inv(args[1] / 2, args[2].length - 1) *
                        jStat.stdev(args[2], true) / Math.sqrt(args[2].length));
    }
    ans[0] = args[0] - change;
    ans[1] = args[0] + change;
    return ans;
  },

  significant: function significant(pvalue, alpha) {
    return pvalue < alpha;
  }
});

jStat.extend(jStat.fn, {
  normalci: function normalci(value, alpha) {
    return jStat.normalci(value, alpha, this.toArray());
  },

  tci: function tci(value, alpha) {
    return jStat.tci(value, alpha, this.toArray());
  }
});

}(this.jStat, Math));
 // end of ../bower_components/jstat/dist/jstat.js
 // end of ../bower_components/jstat/dist/jstat.js
/**
 * chrisw@soe.ucsc.edu
 * April 10, 2014
 * Finally decided to keep static utility methods in a separate js file.
 *
 * Full functionality requires:
 * 1) jStat
 * 2) d3js
 * 3) jQuery
 */

/**
 * Functions and vars to be added to this global object.
 */
var utils = utils || {};

(function(u) {"use strict";
    // console.log('self-executing anonymous function');

    u.htmlNamespaceUri = 'http://www.w3.org/1999/xhtml';

    u.svgNamespaceUri = 'http://www.w3.org/2000/svg';

    // use with "xlink:href" for images in svg as in <http://www.w3.org/Graphics/SVG/WG/wiki/Href>
    u.xlinkUri = "http://www.w3.org/1999/xlink";

    /**
     * convert radian to degree
     */
    u.toDegrees = function(angle) {
        return angle * (180 / Math.PI);
    };

    /**
     * convert degree to radian
     */
    u.toRadians = function(angle) {
        return angle * (Math.PI / 180);
    };

    /**
     * Check if an object has the specified property.
     */
    u.hasOwnProperty = function(obj, prop) {
        var proto = obj.__proto__ || obj.constructor.prototype;
        return ( prop in obj) && (!( prop in proto) || proto[prop] !== obj[prop]);
    };

    /**
     * Fisher-Yates (aka Knuth) Shuffle
     * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    u.shuffleArray = function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    };

    /**
     * Check if an array contains specified object.
     */
    u.isObjInArray = function(array, obj) {
        var result = false;
        var index = array.indexOf(obj);
        if (index >= 0) {
            result = true;
        }
        return result;
    };

    /**
     * remove from array by value (instead of index)
     */
    u.removeA = function(arr) {
        var what, a = arguments, L = a.length, ax;
        while (L > 1 && arr.length) {
            what = a[--L];
            while (( ax = arr.indexOf(what)) !== -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    };

    /**
     * Get an object's attribute keys in an array.
     * @param {Object} obj
     */
    u.getKeys = function(obj) {
        var keys = [];
        for (var key in obj) {
            keys.push(key);
        }
        return keys;
    };

    /**
     * Get the object's attribute values in an array
     */
    u.getValues = function(obj) {
        var vals = [];
        var keys = u.getKeys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            var val = obj[keys[i]];
            vals.push(val);
        }
        return vals;
    };

    /**
     * Only unique and first instance of duplicated elements is returned. Ordering is preserved.
     */
    u.eliminateDuplicates = function(array) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (u.isObjInArray(result, element)) {
                continue;
            } else {
                result.push(element);
            }
        }
        return result;
    };

    /**
     * Keep items that appear multiple times.  Original order of items is lost.
     */
    u.keepReplicates = function(arr, threshold, keepUniques) {
        var counts = {};
        // tally counts
        for (var i = 0; i < arr.length; i++) {
            var value = arr[i];
            if ( value in counts) {
            } else {
                counts[value] = 0;
            }
            counts[value]++;
        }
        // apply threshold
        threshold = (threshold == null) ? 2 : threshold;
        var outList = [];
        for (var value in counts) {
            if ((keepUniques != null) && (keepUniques)) {
                if (counts[value] < threshold) {
                    outList.push(value);
                }
            } else {
                if (counts[value] >= threshold) {
                    outList.push(value);
                }
            }
        }
        return outList;
    };

    u.beginsWith = function(str, prefix) {
        return str.indexOf(prefix) === 0;
    };

    u.endsWith = function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    u.lengthOfLongestString = function(arrayOfStrings) {
        var lengths = new Array();
        for (var i in arrayOfStrings) {
            lengths.push(arrayOfStrings[i].length);
        }
        var maxLength = Math.max.apply(null, lengths);
        return maxLength;
    };

    u.isNumerical = function(val) {
        var result = true;
        if (val == null || val === "") {
            return false;
        }

        // As per IEEE-754 spec, a nan checked for equality against itself will be unequal (in other words, nan != nan)
        // ref: http://kineme.net/Discussion/DevelopingCompositions/CheckifnumberNaNjavascriptpatch
        if (isNaN(val)) {
            return false;
        }
        return result;
    };

    /**
     * get the selected values of a list box control.
     */
    u.getListBoxSelectedValues = function(listboxElement) {
        var selectedValues = new Array();
        for (var i = 0; i < listboxElement.length; i++) {
            var option = listboxElement[i];
            if (option.selected) {
                selectedValues.push(option.value);
            }
        }
        return selectedValues;
    };

    /**
     * linear interpolation
     * @param {Object} percent
     * @param {Object} minVal
     * @param {Object} maxVal
     */
    u.linearInterpolation = function(percent, minVal, maxVal) {
        return ((maxVal - minVal) * percent) + minVal;
    };

    /**
     * Set the numericValue to be in the range [min, max].
     */
    u.rangeLimit = function(numericValue, min, max) {
        var result;
        if ( typeof min === 'undefined') {
            min = -1;
        }
        if ( typeof max === 'undefined') {
            max = 1;
        }
        if (numericValue < min) {
            result = min;
        } else if (numericValue > max) {
            result = max;
        } else {
            result = numericValue;
        }
        return result;
    };

    // TODO object conversion

    /**
     * Clone an object.
     * Requires jQuery
     * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
     */
    u.cloneObject = function(objToBeCloned, deepCopy) {
        // var newObject = eval(objToBeCloned.toSource());
        var newObject;
        if (deepCopy) {
            newObject = jQuery.extend(true, {}, objToBeCloned);
        } else {
            newObject = jQuery.extend({}, objToBeCloned);
        }
        return newObject;
    };

    /**
     * Get an obj without its jQuery wrapping.
     */
    u.extractFromJq = function(jqObj) {
        var jsObj = jqObj.get(0);
        return jsObj;
    };

    /**
     * Wrap an object with jQuery.
     */
    u.convertToJq = function(jsObj) {
        var jqObj = $(jsObj);
        return jsObj;
    };

    /**
     * Get the DOM element from a d3.select()'ed object.
     */
    u.extractFromD3 = function(d3Selection) {
        var domElement = d3Selection.node();
        return domElement;
    };

    /**
     * Convert a DOM element to a d3.selected()'ed object.
     */
    u.convertToD3 = function(domElement) {
        var d3Selection = d3.select(domElement);
        return d3Selection;
    };

    // TODO flexible sort
    /**
     *Sort array of objects by some specified field. Primer specifies a pre-processing to perform on compared value.
     * (from https://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects)
     */
    u.sort_by = function(field, reverse, primer) {
        // function to get value to compare
        var key = primer ? function(elementObj) {
            return primer(elementObj[field]);
        } : function(elementObj) {
            return elementObj[field];
        };

        reverse = [-1, 1][+!!reverse];

        // return comparator function
        return function(a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    };

    // TODO comparator functions

    /**
     *Compare as numbers
     */
    u.compareAsNumeric = function(a, b) {
        var valA = a;
        var valB = b;

        // convert to numbers
        var scoreA = parseFloat(valA);
        var scoreB = parseFloat(valB);

        if (utils.isNumerical(scoreA) && (utils.isNumerical(scoreB))) {
            if (scoreA < scoreB) {
                return -1;
            }
            if (scoreA > scoreB) {
                return 1;
            } else {
                return 0;
            }
        } else {
            // handle non-numericals
            if (scoreA != scoreA && scoreB != scoreB) {
                // both non-numerical, may be nulls
                return 0;
            } else if (scoreA != scoreA) {
                return -1;
            } else if (scoreB != scoreB) {
                return 1;
            }
        }
        // default scoring
        return 0;
    };

    /**
     * Compare as string
     */
    u.compareAsString = function(a, b) {
        var valA = new String(a);
        var valB = new String(b);

        if ((valA == 'null') && (valB != 'null')) {
            return 1;
        } else if ((valA != 'null') && (valB == 'null')) {
            return -1;
        }

        return valA.localeCompare(valB);
    };

    /**
     * Compare as date
     */
    u.compareAsDate = function(a, b) {
        var valA = a;
        var valB = b;

        if (valA == null) {
            valA = '1000';
        } else if (valA == '') {
            valA = '1001';
        }

        if (valB == null) {
            valB = '1000';
        } else if (valB == '') {
            valB = '1001';
        }

        var dateA = new Date(valA);
        var dateB = new Date(valB);

        return (dateA - dateB);
    };

    // TODO color mappers

    /**
     * convert an rgb component to hex value
     * @param {Object} c
     */
    u.rgbComponentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };
    /**
     * convert rgb color code to hex
     * @param {Object} r
     * @param {Object} g
     * @param {Object} b
     */
    u.rgbToHex = function(r, g, b) {
        return "#" + this.rgbComponentToHex(r) + this.rgbComponentToHex(g) + this.rgbComponentToHex(b);
    };

    /**
     * centered RGBa color mapper.  Defaults to significant Z-score range.
     */
    u.centeredRgbaColorMapper = function(log, centerVal, minNegVal, maxPosVal) {
        var mapper = null;

        var centerV = (centerVal == null) ? 0 : centerVal;
        var minNegV = (minNegVal == null) ? -1.96 : minNegVal;
        var maxPosV = (maxPosVal == null) ? 1.96 : maxPosVal;

        mapper = function(val) {
            var a = 1;
            var r = 169;
            var g = 169;
            var b = 169;

            var exponent = 1 / 2;

            var v = parseFloat(val);

            if ((v == null) || (v != v)) {
                // null or NaN values
            } else if (v > centerV) {
                r = 255;
                g = 0;
                b = 0;
                if (v > maxPosV) {
                    a = 1;
                } else {
                    a = (v - centerV) / (maxPosV - centerV);
                    a = Math.abs(a);
                    if (log) {
                        a = Math.pow(a, exponent);
                    }
                }
            } else if (v < centerV) {
                r = 0;
                g = 0;
                b = 255;
                if (v < minNegV) {
                    a = 1;
                } else {
                    a = (v - centerV) / (minNegV - centerV);
                    a = Math.abs(a);
                    if (log) {
                        a = Math.pow(a, exponent);
                    }
                }
            } else {
                r = 255;
                g = 255;
                b = 255;
                a = 1;
            }
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        };

        return mapper;
    };

    /**
     * requires D3js
     */
    u.setupQuantileColorMapper = function(allDataValues, palette) {
        // color scale
        var colors = palette;
        if (colors == null) {
            // colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"];
            colors = ["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)", "rgb(34,94,168)", "rgb(37,52,148)", "rgb(8,29,88)"];
        }
        var buckets = colors.length;
        var colorScale = d3.scale.quantile().domain([0, buckets - 1, d3.max(allDataValues, function(d) {
            return parseFloat(d);
        })]).range(colors);

        return colorScale;
    };

    // TODO XML

    /**
     * Get an XML DOM from an XML file.  Information about DOM at <a href="https://developer.mozilla.org/en-US/docs/Web/API/document">https://developer.mozilla.org/en-US/docs/Web/API/document</a>.
     */
    u.getXmlDom_url = function(url) {
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET", url, false);
        xmlhttp.send();
        xmlDoc = xmlhttp.responseXML;
        return xmlDoc;
    };

    /**
     * Get an XML DOM from a text string.  Information about DOM at <a href="https://developer.mozilla.org/en-US/docs/Web/API/document">https://developer.mozilla.org/en-US/docs/Web/API/document</a>.
     */
    u.getXmlDom_string = function(txt) {
        if (window.DOMParser) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(txt, "text/xml");
        } else {// Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(txt);
        }
        return xmlDoc;
    };

    // TODO date & time

    /**
     * MySQL style date
     */
    u.getDateTime = function() {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length == 1) {
            var month = '0' + month;
        }
        if (day.toString().length == 1) {
            var day = '0' + day;
        }
        if (hour.toString().length == 1) {
            var hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            var minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            var second = '0' + second;
        }
        var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
        return dateTime;
    };

    /**
     * Date in written style.
     */
    u.todaysDate = function() {
        var months = new Array();
        months[1] = "January";
        months[2] = "February";
        months[3] = "March";
        months[4] = "April";
        months[5] = "May";
        months[6] = "June";
        months[7] = "July";
        months[8] = "August";
        months[9] = "September";
        months[10] = "October";
        months[11] = "November";
        months[12] = "December";
        var todaysdate = new Date();
        var date = todaysdate.getDate();
        var day = todaysdate.getDay() + 1;
        var month = todaysdate.getMonth() + 1;
        var yy = todaysdate.getYear();
        var year = (yy < 1000) ? yy + 1900 : yy;
        var year2 = year - (2000 * 1);
        year2 = (year2 < 10) ? "0" + year2 : year2;
        return (months[month] + " " + date + ", " + year);
    };

    // TODO DOM

    u.pushElemToBack = function(elem) {
        var parentNode = elem.parentNode;
        parentNode.insertBefore(elem, parentNode.firstChild);
        return elem;
    };

    /**
     * Bring elem to front of DOM by placing it last in the parent elem.
     */
    u.pullElemToFront = function(elem) {
        elem.parentNode.appendChild(elem);
        return elem;
    };

    /**
     * Remove an element by ID.
     */
    u.removeElemById = function(id) {
        var elem = document.getElementById(id);
        elem.parentNode.removeChild(elem);
    };

    /**
     * Remove all child elements from parentElem.
     */
    u.removeChildElems = function(parentElem) {
        while (parentElem.firstChild) {
            parentElem.removeChild(parentElem.firstChild);
        }
        return parentElem;
    };

    /**
     * Create an unattached div element
     */
    u.createDivElement = function(divId, divClass) {
        var divTag = document.createElement("div");
        if (divId != null) {
            divTag.id = divId;
        }
        if (divClass != null) {
            divTag.className = divClass;
        }
        return divTag;
    };

    /**
     * set the attributes for the specified element
     */
    u.setElemAttributes = function(element, attributes, namespace) {
        var ns = ( typeof namespace === 'undefined') ? null : namespace;
        if (attributes != null) {
            for (var attribute in attributes) {

                // console.log({
                // 'ns' : ns,
                // 'attribute' : attribute,
                // 'value' : attributes[attribute]
                // });

                element.setAttributeNS(ns, attribute, attributes[attribute]);
            }
        }
        return element;
    };

    /**
     * Assumes the parents are divs.
     */
    u.swapContainingDivs = function(nodeA, nodeB) {
        var parentA = nodeA.parentNode;
        var parentB = nodeB.parentNode;

        document.getElementById(parentA.id).appendChild(nodeB);
        document.getElementById(parentB.id).appendChild(nodeA);
    };

    // TODO URL and query strings

    /**
     * Simple asynchronous GET.  callbackFunc takes the responseText as parameter.
     */
    u.simpleAsyncGet = function(url, callbackFunc) {
        var request = new XMLHttpRequest();

        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            request = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            request = new ActiveXObject("Microsoft.XMLHTTP");
        }

        request.onreadystatechange = function() {
            var DONE = this.DONE || 4;
            if (this.readyState === DONE) {
                if (this.status == 200) {
                    callbackFunc(this.responseText);
                } else if (this.status == 400) {
                    console.log('There was an error 400');
                } else {
                    console.log('status was not 200', this.status);
                }
            }
        };
        request.open('GET', url, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        // Tells server that this call is made for ajax purposes.
        // Most libraries like jQuery/Prototype/Dojo do this
        request.send(null);
        // No data needs to be sent along with the request.
    };

    /*
     * Synchronous GET
     */
    u.getResponse = function(url) {
        var status = null;
        var xhr = null;
        xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.onload = function() {
            status = xhr.status;
            if (status != 200) {
                console.log("xhr status: " + status + " for " + url);
            }
        };
        xhr.send(null);
        var response = null;
        if (status == 200) {
            response = xhr.responseText;
        }
        return response;
    };

    /**
     * querySettings is an object to be stringified into the query string.
     * @param {Object} querySettings
     */
    u.loadNewSettings = function(querySettings) {
        var url = window.location.pathname + "?query=" + JSON.stringify(querySettings);
        window.open(url, "_self");
    };

    /**
     * Get an object with UrlQueryString data.
     */
    u.getQueryObj = function() {
        var result = {};
        var keyValuePairs = location.search.slice(1).split('&');

        keyValuePairs.forEach(function(keyValuePair) {
            keyValuePair = keyValuePair.split('=');
            result[keyValuePair[0]] = decodeURIComponent(keyValuePair[1]) || '';
        });

        return result;
    };

    /**
     * Get the value of a parameter from the query string.  If parameter has not value or does not exist, return <code>null</code>.
     * From <a href='http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values'>here</a>.
     * @param {Object} name
     */
    u.getQueryStringParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    // TODO JSON

    /**
     * Turn serializedJson string into a JSON object.
     */
    u.parseJson = function(serializedJson) {
        var deserializedJson = JSON.parse(serializedJson);
        return deserializedJson;
    };

    /**
     *  serialize an object with option for pretty format
     */
    u.serializeJson = function(object, pretty) {
        if (pretty) {
            return JSON.stringify(object, null, '\t');
        } else {
            return JSON.stringify(object);
        }
    };

    /**
     * Get a pretty JSON.
     */
    u.prettyJson = function(object) {
        return this.serializeJson(object, true);
    };

    // TODO SVG paths

    /**
     * Returns SVG path data for a rectangle with rounded bottom corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     * @param {Object} radius
     */
    u.bottomRoundedRectSvgPath = function(x, y, width, height, radius) {
        var pathString = '';
        pathString += "M" + x + "," + y;
        pathString += "h" + (width);
        pathString += "v" + (height - radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (radius);
        pathString += "h" + (-1 * (width - 2 * radius));
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (-1 * radius);
        pathString += "v" + (-1 * (height - radius));
        pathString += 'z';
        return pathString;
    };

    /**
     * Returns SVG path data for a rectangle with all rounded corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     * @param {Object} radius
     */
    u.allRoundedRectSvgPath = function(x, y, width, height, radius) {
        var pathString = '';
        pathString += "M" + (x) + "," + (y + radius);
        pathString += "a" + (radius) + "," + (radius) + " 0 0 1 " + (radius) + "," + (-1 * radius);
        pathString += "h" + (width - 2 * radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (radius) + "," + (radius);
        pathString += "v" + (height - 2 * radius);
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (radius);
        pathString += "h" + (-1 * (width - 2 * radius));
        pathString += "a" + radius + "," + radius + " 0 0 1 " + (-1 * radius) + "," + (-1 * radius);
        pathString += "v" + (-1 * (height - 2 * radius));
        pathString += 'z';
        return pathString;
    };

    /**
     * Returns SVG path data for a rectangle with angled corners.
     * The top-left corner is (x,y).
     * @param {Object} x
     * @param {Object} y
     * @param {Object} width
     * @param {Object} height
     */
    u.allAngledRectSvgPath = function(x, y, width, height) {
        // calculated from longer side
        var pad = (width > height) ? width / 8 : height / 8;
        var pathString = '';
        pathString += "M" + (x + pad) + "," + (y);
        pathString += "h" + (width - 2 * pad);
        pathString += 'l' + pad + ',' + pad;
        pathString += "v" + (height - 2 * pad);
        pathString += 'l' + (-1 * pad) + ',' + (pad);
        pathString += "h" + (-1 * (width - 2 * pad));
        pathString += 'l' + (-1 * pad) + ',' + (-1 * pad);
        pathString += "v" + (-1 * (height - 2 * pad));
        pathString += 'z';
        return pathString;
    };

    // TODO SVG elements

    u.createSvgRingElement = function(cx, cy, r, attributes) {
        // https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
        // (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x : centerX + (radius * Math.cos(angleInRadians)),
                y : centerY + (radius * Math.sin(angleInRadians))
            };
        }

        function describeArc(x, y, radius, startAngle, endAngle) {
            var start = polarToCartesian(x, y, radius, endAngle);
            var end = polarToCartesian(x, y, radius, startAngle);
            var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
            var d = ["M", start.x, start.y, "A", radius, radius, 0, arcSweep, 0, end.x, end.y].join(" ");
            return d;
        }

        // TODO somehow the circle becomes invisible if using 0 to 360 degrees
        var arcPath = describeArc(cx, cy, r, 0, 359.9);

        var e = document.createElementNS(this.svgNamespaceUri, "path");
        e.setAttributeNS(null, "d", arcPath);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgCircleElement = function(cx, cy, r, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "circle");
        e.setAttributeNS(null, "cx", cx);
        e.setAttributeNS(null, "cy", cy);
        e.setAttributeNS(null, 'r', r);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgRectElement = function(x, y, rx, ry, width, height, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "rect");
        e.setAttributeNS(null, "x", x);
        e.setAttributeNS(null, "y", y);
        e.setAttributeNS(null, "rx", rx);
        e.setAttributeNS(null, "ry", ry);
        e.setAttributeNS(null, "width", width);
        e.setAttributeNS(null, "height", height);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    /**
     * Polygon is defined by a list of points as in: http://www.w3.org/TR/SVG/shapes.html#PolygonElement
     * Thus, attributes must have string with space-separated list of points keyed 'points'.
     */
    u.createSVGPolygonElement = function(attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "polygon");
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    u.createSvgImageElement = function(imageUrl, x, y, width, height, attributes) {
        var e = document.createElementNS(this.svgNamespaceUri, "image");
        e.setAttributeNS(this.xlinkUri, "href", imageUrl);
        e.setAttributeNS(null, "x", x);
        e.setAttributeNS(null, "y", y);
        e.setAttributeNS(null, "width", width);
        e.setAttributeNS(null, "height", height);
        if (attributes != null) {
            for (var attribute in attributes) {
                e.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return e;
    };

    // TODO cookies

    /**
     * Cookie methods taken from:
     * <ul>
     * <li>http://jquery-howto.blogspot.com/2010/09/jquery-cookies-getsetdelete-plugin.html
     * </li>
     * <li>http://www.quirksmode.org/js/cookies.html
     * </li>
     * </ul>
     * @param {Object} name
     * @param {Object} value
     * @param {Object} days
     */
    u.setCookie = function(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else
            var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    u.getCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    u.deleteCookie = function(name) {
        this.setCookie(name, "", -1);
    };

    // TODO mutual information for 2 vectors of numbers

    /**
     * normalize a vector. assumes positive numerical values with minimum value 0.
     * @param {Object} vector
     */
    u.getNormalizedVector = function(vector) {
        var normalized = [];
        var min = jStat.min(vector);
        var max = jStat.max(vector);

        if ((min < 0) || (max == 0)) {
            console.log('min:' + min + '\tmax:' + max);
            if (min < 0) {
                return null;
            } else if (max == 0) {
                return vector;
            }
        }

        for (var i = 0; i < vector.length; i++) {
            var newVal = vector[i] / max;
            normalized.push(newVal);
        }

        return normalized;
    };

    /**
     * Marginal entropy for finite sample (H(X)).
     */
    u.computeMarginalEntropy = function(vector, d3histFunc) {
        var sum = 0;
        var counts = [];

        var d3histObj = d3histFunc(vector);

        // counts
        for (var i = 0; i < d3histObj.length; i++) {
            var bin = d3histObj[i];
            var binCount = bin.length;
            counts.push({
                'bin' : i,
                'count' : binCount
            });
        }

        // probability
        for (var i = 0; i < counts.length; i++) {
            var data = counts[i];
            data.probability = data.count / vector.length;
            data.prod = (data.probability == 0 ) ? 0 : (data.probability * Math.log2(data.probability));

            sum = sum + data.prod;
        }

        sum = -1 * sum;
        return sum;
    };

    /**
     * Joint entropy of 2 events (H(X,Y)).
     */
    u.computeJointEntropy = function(vector1, vector2, d3histFunc) {
        if (vector1.length != vector2.length) {
            return null;
        }
        /**
         * Get the bin index of a value in the d3histObj.
         */
        var getBinIndex = function(d3histObj, val) {
            var binIndex = null;
            for (var i = 0; i < d3histObj.length; i++) {
                var bin = d3histObj[i];
                if ((val >= bin.x) && (val < (bin.x + bin.dx))) {
                    binIndex = i;
                    continue;
                }
            }
            if (binIndex == null) {
                var bin = d3histObj[d3histObj.length - 1];
                if (val - bin.x - bin.dx < bin.dx) {
                    binIndex = d3histObj.length - 1;
                }
            }
            return binIndex;
        };

        var hist1 = d3histFunc(vector1);
        var hist2 = d3histFunc(vector2);

        // init frequency table
        var freqTable = {};
        for (var i = 0; i < hist1.length; i++) {
            for (var j = 0; j < hist2.length; j++) {
                var key = i + '_' + j;
                freqTable[key] = 0;
            }
        }

        // fill in frequency table
        // iterate over sample index
        for (var i = 0; i < vector1.length; i++) {
            var xi = vector1[i];
            var binXi = getBinIndex(hist1, xi);

            var yi = vector2[i];
            var binYi = getBinIndex(hist2, yi);

            var key = binXi + '_' + binYi;
            freqTable[key]++;
        }

        // compute sum over table
        var sum = 0;
        var keys = u.getKeys(freqTable);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var probability = freqTable[key] / vector1.length;
            var product = (probability == 0 ) ? 0 : (probability * Math.log2(probability));
            sum = sum + product;
        }

        sum = -1 * sum;
        return sum;
    };

    /**
     * Compute mutual information from empirical entropy.  I(X;Y) = H(X) + H(Y) - H(X,Y)
     * @param {Object} vector1  Vector of numerical values.
     * @param {Object} vector2
     * @param {Object} numBins  Optional parameter to specify number of bins for binning step. Defaults to vector length.
     */
    u.mutualInformation = function(vector1, vector2, numBins) {
        var mi = null;
        var numBins = ( typeof numBins === 'undefined') ? vector1.length : numBins;

        var d3Hist = d3.layout.histogram().bins(numBins).frequency(false);

        var Hx = u.computeMarginalEntropy(vector1, d3Hist);
        var Hy = u.computeMarginalEntropy(vector2, d3Hist);
        var Hxy = u.computeJointEntropy(vector1, vector2, d3Hist);

        // console.log('Hx', Hx);
        // console.log('Hy', Hy);
        // console.log('Hxy', Hxy);

        mi = Hx + Hy - Hxy;
        return mi;
    };

})(utils);

// console.log('utils', utils);
 // end of utils.js
 // end of utils.js
/**
 * chrisw@soe.ucsc.edu
 * 12AUG14
 * OD_eventData.js defines an event object that is to be used with Observation Deck.
 */

var eventData = eventData || {};
(function(ed) {"use strict";
    ed.OD_eventAlbum = function() {
        // ordinal score assignments to be saved in this object
        this.ordinalScoring = {
            "mutation impact" : {
                "MIN" : -1,
                "MODIFIER" : -0.3,
                "MODERATE" : 1,
                "HIGH" : 2
            }
        };

        this.album = {};

        /**
         * map a datatype to its ID suffix
         */
        this.datatypeSuffixMapping = {};

        /**
         * keys:
         * event is the event that this pivot is scored on, could be something like expression, mutation, contrast, etc.
         * scores is a dictionary keying eventIds to a score
         *
         */
        this.pivot = {};

        this.getSuffixedEventId = function(name, datatype) {
            var suffix = ( datatype in this.datatypeSuffixMapping) ? this.datatypeSuffixMapping[datatype] : "";
            return name + suffix;
        };

        this.addEvent = function(metadataObj, data) {
            var newEvent = new ed.OD_event(metadataObj);
            this.album[metadataObj['id']] = newEvent;

            if (("datatype" in metadataObj) && ("geneSuffix" in metadataObj)) {
                this.datatypeSuffixMapping[metadataObj["datatype"]] = metadataObj["geneSuffix"];
            }

            // add data
            var isNumeric = ((metadataObj['allowedValues'] == 'numeric') || metadataObj['allowedValues'] == 'expression');
            newEvent.data.setData(data, isNumeric);

            // return this;
            return newEvent;
        };

        this.deleteEvent = function(eventId) {
            delete this.album[eventId];
        };

        /**
         * Get all of the eventIds in the album.
         */
        this.getAllEventIds = function() {
            var result = [];
            var groupedEvents = this.getEventIdsByType();
            for (var group in groupedEvents) {
                var events = groupedEvents[group];
                result = result.concat(events);
            }
            return result;
        };

        /**
         * Get the eventIds grouped by datatype.
         */
        this.getEventIdsByType = function() {
            var groupedEventIds = {};
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var datatype = this.getEvent(eventId).metadata.datatype;
                if (!utils.hasOwnProperty(groupedEventIds, datatype)) {
                    groupedEventIds[datatype] = [];
                }
                groupedEventIds[datatype].push(eventId);
            }
            return groupedEventIds;
        };

        /**
         * Get all of the event data for specified samples.
         */
        this.getEventData = function(sampleIds) {
            var result = {};
            // iter over eventIds
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var eventData = this.getEvent(eventId).data;
                // grab data for sample IDs
                var data = eventData.getData(sampleIds);
                result[eventId] = data;
            }
            return result;
        };

        /**
         * Get all of the event data in a list of objects.  Each object has keys: eventId, id, val.
         */
        this.getAllDataAsList = function() {
            var allDataList = [];
            var allDataObj = this.getEventData();
            var eventNameList = utils.getKeys(allDataObj);
            for (var i = 0; i < eventNameList.length; i++) {
                var eventName = eventNameList[i];
                var eventData = allDataObj[eventName].slice();
                for (var j = 0; j < eventData.length; j++) {
                    eventData[j]['eventId'] = eventName;
                }
                allDataList = allDataList.concat(eventData);
            }
            return allDataList;
        };

        /**
         * Get all of the sample IDs in album.
         */
        this.getAllSampleIds = function() {
            var sampleIds = [];
            var eventIdList = utils.getKeys(this.album);
            for (var i = 0; i < eventIdList.length; i++) {
                var eventId = eventIdList[i];
                var eventSampleIds = this.getEvent(eventId).data.getAllSampleIds();
                sampleIds = sampleIds.concat(eventSampleIds);
            }
            return utils.eliminateDuplicates(sampleIds);
        };

        /**
         * Select samples that meet the criteria.
         */
        this.selectSamples = function(selectionCriteria) {
            var ids = this.getAllSampleIds();
            if (selectionCriteria.length == 0) {
                return ids;
            }
            for (var i in selectionCriteria) {
                var eventId = selectionCriteria[i]["eventId"];
                var value = selectionCriteria[i]["value"];

                // select IDs from event data
                ids = this.getEvent(eventId).data.selectIds(value, ids);
            }
            return ids;
        };
        /**
         * Get the specified event from the album.
         */
        this.getEvent = function(eventId) {
            var e = this.album[eventId];
            if ( typeof e === "undefined") {
                console.log("getEvent got undefined eventObj for: " + eventId);
            }
            return e;
        };

        /**
         * recursive function to get all children IDs.
         */
        this.getAllChildren = function(idList, inputChildrenList) {
            var childList = ( typeof inputChildrenList === "undefined") ? [] : inputChildrenList;

            // collect children
            var currentChildren = [];
            for (var i = 0; i < idList.length; i++) {
                var id = idList[i];
                var currentMetadata = this.getEvent(id).metadata;
                currentChildren = currentChildren.concat(getKeys(currentMetadata.children));
            }

            // recurse on children
            if (currentChildren.length == 0) {
                return childList;
            } else {
                var newChildList = childList.concat(currentChildren);
                return this.getAllChildren(currentChildren, newChildList);
            }
        };

        /**
         * pivotScores is a dictionary keying eventIds to some score.
         *
         */
        this.setPivotScores_dict = function(pivotEvent, pivotScoresDict) {
            // TODO currently loaded in as an array of {gene,weight} objects
            if (pivotScoresDict == null) {
                this.pivot = {};
            } else {
                this.pivot = {
                    'event' : pivotEvent,
                    'scores' : pivotScoresDict
                };

            }
            return this;
        };

        /**
         * pivotScores is array of {eventId1,eventId2,score}.
         *
         */
        this.setPivotScores_array = function(pivotEvent, pivotScores) {
            if (pivotScores == null) {
                this.pivot = {};
            } else {
                pivotScores = pivotScores.sort(utils.sort_by('score'));
                this.pivot = {
                    'event' : pivotEvent,
                    'scores' : pivotScores
                };
            }
            return this;
        };

        /**
         * Get a sorted list of events by pivot score.  Returns a list of objects with keys: "key" and "val".
         */
        this.getPivotSortedEvents = function(pEventId) {
            if (( typeof this.pivot.scores === 'undefined') || (this.pivot.scores == null)) {
                console.log('getPivotSortedEvents found no pivot scores');
                return [];
            }
            var sortedEvents = [];
            var recordedEvents = {};
            for (var i = 0, length = this.pivot.scores.length; i < length; i++) {
                var scoreObj = this.pivot.scores[i];
                var eventId1 = scoreObj['eventId1'];
                var eventId2 = scoreObj['eventId2'];
                var score = scoreObj['score'];

                var key;
                var val = score;
                pEventId = pEventId.replace(/_mRNA$/, "");
                if (eventId1 === pEventId) {
                    key = eventId2;
                } else if (eventId2 === pEventId) {
                    key = eventId1;
                } else {
                    // filter by pEventId
                    continue;
                }

                if (utils.hasOwnProperty(recordedEvents, key)) {
                    // duplicate event
                    continue;
                }

                sortedEvents.push({
                    "key" : key,
                    "val" : parseFloat(val)
                });

                recordedEvents[key] = 1;
            }
            sortedEvents = sortedEvents.sort(utils.sort_by('val'));
            return sortedEvents;
        };

        /**
         * Get pivot sorted events organized by datatype.
         */
        this.getGroupedPivotSorts = function(pEventId) {
            console.log('getGroupedPivotSorts');
            var result = {};

            // Extract the gene symbols. They are without suffix.
            pEventId = pEventId.replace(/_mRNA$/, "");
            var pivotSortedEventObjs = this.getPivotSortedEvents(pEventId);
            // console.log("pivotSortedEventObjs", utils.prettyJson(pivotSortedEventObjs));
            var pivotSortedEvents = [];
            for (var j = 0; j < pivotSortedEventObjs.length; j++) {
                var pivotSortedEventObj = pivotSortedEventObjs[j];
                pivotSortedEvents.push(pivotSortedEventObj['key']);
            }

            // iterate through datatypes
            var groupedEvents = this.getEventIdsByType();
            var pivotedDatatypes = utils.getKeys(groupedEvents);
            pivotedDatatypes = utils.removeA(pivotedDatatypes, "clinical data");

            for (var datatype in groupedEvents) {
                var orderedEvents = [];

                // suffixed ids here
                var unorderedEvents = groupedEvents[datatype];
                if (pivotSortedEvents.length == 0) {
                    console.log('pivotSortedEvents.length == 0 for ' + datatype);
                    result[datatype] = unorderedEvents;
                    continue;
                }

                // add scored events in the datatype
                for (var i = 0; i < pivotSortedEvents.length; i++) {
                    var eventId = this.getSuffixedEventId(pivotSortedEvents[i], datatype);
                    if (utils.isObjInArray(unorderedEvents, eventId)) {
                        orderedEvents.push(eventId);
                    }
                }

                // add the unscored events from the datatype group
                // if (! utils.isObjInArray(pivotedDatatypes, datatype)) {
                orderedEvents = orderedEvents.concat(unorderedEvents);
                orderedEvents = utils.eliminateDuplicates(orderedEvents);
                // }

                result[datatype] = orderedEvents;
            }
            return result;
        };

        /**
         * Get all pivot scores for each pivot in a datatype.
         */
        this.getAllPivotScores = function(datatype, scoringAlgorithm) {
            var allPivotScores = {};

            var groupedEvents = this.getEventIdsByType();
            if (! utils.hasOwnProperty(groupedEvents, datatype)) {
                return allPivotScores;
            }

            var events = groupedEvents[datatype];
            for (var i = 0; i < events.length; i++) {
                var pivotEvent = events[i];
                var scores = this.pivotSort(pivotEvent, scoringAlgorithm);
                allPivotScores[pivotEvent] = scores;
            }

            return allPivotScores;
        };

        /**
         * multi-sorting of events
         */
        this.multisortEvents = function(rowSortSteps, colSortSteps) {
            console.log('multisortEvents');
            console.log('rowSortSteps', rowSortSteps);
            console.log('colSortSteps', colSortSteps);
            // default ordering
            var groupedEvents = this.getEventIdsByType();
            console.log("groupedEvents", groupedEvents);
            var eventList = [];
            for (var datatype in groupedEvents) {
                if (datatype === 'datatype label') {
                    continue;
                }
                var datatypeEventList = groupedEvents[datatype];
                datatypeEventList.unshift(datatype + "(+)");
                datatypeEventList.push(datatype + "(-)");
                eventList = eventList.concat(datatypeEventList);
            }

            // bubble up colSort events
            var bubbledUpEvents = [];
            if (colSortSteps != null) {
                // bring sorting rows up to top
                var steps = colSortSteps.getSteps();
                for (var b = 0; b < steps.length; b++) {
                    var step = steps[b];
                    var eventId = step['name'];
                    bubbledUpEvents.push(eventId);
                }
                bubbledUpEvents.reverse();
            }
            var rowNames = bubbledUpEvents.slice(0);

            // fill in rest of the list
            rowNames = rowNames.concat(eventList);
            rowNames = utils.eliminateDuplicates(rowNames);

            if (rowSortSteps != null) {
                var steps = rowSortSteps.getSteps().reverse();
                for (var b = 0; b < steps.length; b++) {
                    var step = steps[b];
                    var eventId = step['name'];
                    var reverse = step['reverse'];
                    var eventObj = this.getEvent(eventId);
                    var datatype = eventObj.metadata.datatype;
                    var scoredDatatype = eventObj.metadata.scoredDatatype;

                    // var datatypeSuffix = this.datatypeSuffixMapping[scoredDatatype];

                    if (scoredDatatype == null) {
                        console.log("no scored datatype to sort");
                        continue;
                    }

                    var orderedGeneList = eventObj.metadata.sortSignatureVector();
                    if (reverse) {
                        orderedGeneList.reverse();
                    }

                    var eventGroupEventIds;
                    if (utils.hasOwnProperty(groupedEvents, scoredDatatype)) {
                        eventGroupEventIds = groupedEvents[scoredDatatype].slice(0);
                    } else {
                        console.log(scoredDatatype + " group has no events");
                        continue;
                    }

                    var processedExpressionEventList = [];
                    var scoredEventSigWeightOverlap = [];
                    for (var c = 0; c < orderedGeneList.length; c++) {
                        var orderedGene = orderedGeneList[c];
                        // var orderedGene_eventId = orderedGene + datatypeSuffix;
                        var orderedGene_eventId = this.getSuffixedEventId(orderedGene, scoredDatatype);
                        var index = eventGroupEventIds.indexOf(orderedGene_eventId);
                        if (index >= 0) {
                            // events that are in signature weight vector AND datatype group
                            scoredEventSigWeightOverlap.push(orderedGene_eventId);
                        }
                        if ((index >= 0) && (!utils.isObjInArray(bubbledUpEvents, orderedGene_eventId))) {
                            // only add scored events that have records in the event album
                            processedExpressionEventList.push(orderedGene_eventId);
                            delete eventGroupEventIds[index];
                        }

                        if (utils.isObjInArray(bubbledUpEvents, orderedGene_eventId)) {
                            // skip bubbled up scored events
                            delete eventGroupEventIds[index];
                        }
                    }
                    console.log("scoredEventSigWeightOverlap", (scoredEventSigWeightOverlap.length), scoredEventSigWeightOverlap);

                    // add events that did not appear in signature
                    for (var d in eventGroupEventIds) {
                        processedExpressionEventList.push(eventGroupEventIds[d]);
                    }

                    // assemble all datatypes together
                    var eventList = bubbledUpEvents.slice(0);
                    for (var datatype in groupedEvents) {
                        if (datatype === scoredDatatype) {
                            eventList = eventList.concat(processedExpressionEventList);
                        } else {
                            var datatypeEventList = groupedEvents[datatype];
                            for (var i in datatypeEventList) {
                                var eventId = datatypeEventList[i];
                                if (utils.isObjInArray(eventList, eventId)) {
                                    // skip
                                } else {
                                    eventList.push(eventId);
                                }
                            }
                        }
                    }

                    rowNames = eventList;
                    console.log('rowNames.length', rowNames.length, rowNames);

                    // only do this for the first step
                    break;
                }
            }

            return rowNames;
        };

        /**
         * If sortingSteps is null, then just return the sampleIds without sorting.
         */
        this.multisortSamples = function(sortingSteps) {
            var sampleIds = this.getAllSampleIds();
            if (sortingSteps == null) {
                console.log("multisortSamples got null steps");
                return sampleIds;
            }
            console.log("multisortSamples using steps:", sortingSteps.getSteps());
            var steps = sortingSteps.getSteps().slice();
            steps.reverse();

            var album = this;

            sampleIds.sort(function(a, b) {
                // begin sort function
                var comparisonResult = 0;
                // iterate over sorting steps in order
                for (var i = 0; i < steps.length; i++) {
                    // get this step's values
                    var eventId = steps[i]['name'];
                    if ( typeof eventId === "undefined") {
                        continue;
                    }
                    var reverse = steps[i]['reverse'];
                    var eventObj = album.getEvent(eventId);
                    if ((eventObj == undefined) || (eventObj == null)) {
                        for (var key in album.datatypeSuffixMapping) {
                            var newId = eventId + album.datatypeSuffixMapping[key];
                            eventObj = album.getEvent(newId);
                            if ((eventObj != undefined) && (eventObj != null)) {
                                // console.log("use " + newId + " for " + eventId);
                                eventId = newId;
                                break;
                            }
                        }
                        if ((eventObj == undefined) || (eventObj == null)) {
                            console.log('no event found for sorting: ' + eventId);
                            continue;
                        }
                    }
                    var allowedValues = eventObj.metadata['allowedValues'];

                    var vals = eventObj.data.getData([a, b]);
                    var valA = vals[0]['val'];
                    var valB = vals[1]['val'];

                    // select correct comparator
                    var comparator = null;
                    if (allowedValues == 'numeric') {
                        comparator = utils.compareAsNumeric;
                    } else if (allowedValues == 'categoric') {
                        comparator = utils.compareAsString;
                    } else if (allowedValues == 'expression') {
                        comparator = utils.compareAsNumeric;
                    } else if (allowedValues == 'date') {
                        comparator = utils.compareAsDate;
                    } else {
                        comparator = utils.compareAsString;
                    }

                    // compare this step's values
                    comparisonResult = comparator(valA, valB);

                    // numeric events sort large to small by default
                    if (comparator == utils.compareAsNumeric) {
                        comparisonResult = comparisonResult * -1;
                    }

                    if (reverse) {
                        comparisonResult = comparisonResult * -1;
                    }

                    // return final comparison or try next eventId
                    if (comparisonResult == 0) {
                        continue;
                    } else {
                        break;
                    }

                }
                return comparisonResult;
                // end sort function
            });

            return sampleIds;
        };

        /**
         * rescale by z-score over each eventId
         */
        this.zScoreExpressionRescaling = function() {
            console.log('zScoreExpressionRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];

                // get mean and sd
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var z = (val - stats[eventId]['mean']) / (stats[eventId]['sd']);
                        data['val'] = z;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         *  Rescale expression data.

         */
        this.betweenMeansExpressionRescaling = function(clinicalEventId, category1, category2) {
            console.log('betweenMeansExpressionRescaling', clinicalEventId, category1, category2);
            // get group sample IDs
            var group1SampleIds = this.getEvent(clinicalEventId).data.selectIds(category1);

            var group2SampleIds = null;
            if (category2 == null) {
                group2SampleIds = this.getEvent(clinicalEventId).data.selectIds(category2);
                group2SampleIds = group2SampleIds.concat(group1SampleIds);
                group2SampleIds = utils.eliminateDuplicates(group2SampleIds);
            } else {
                group2SampleIds = this.getEvent(clinicalEventId).data.selectIds(category2);
            }

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression of groups over each gene
            var meanVals = {};
            var result = {
                'meanVals' : meanVals
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];
                meanVals[eventId] = {};
                meanVals[eventId]['group1'] = this.getEvent(eventId).data.getStats(group1SampleIds)['mean'];
                meanVals[eventId]['group2'] = this.getEvent(eventId).data.getStats(group2SampleIds)['mean'];

                // finally iter over all samples to adjust score
                var adjustment = (meanVals[eventId]['group2'] - meanVals[eventId]['group1']) / 2;
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        data['val'] = val - adjustment;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * Rescale all expression data by subtracting mean of specified group on a per-event basis.  Returns new min/max values.
         */
        this.yuliaExpressionRescaling = function(clinicalEventId, category) {
            console.log('yuliaExpressionRescaling', clinicalEventId, category);
            // get sampleId list of neg group
            var negSampleIds = this.getEvent(clinicalEventId).data.selectIds(category);

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression of neg group over each gene
            var meanVals = {};
            var result = {
                'meanVals' : meanVals
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];
                meanVals[eventId] = this.getEvent(eventId).data.getStats(negSampleIds)['mean'];

                // second iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var j = 0; j < allEventData.length; j++) {
                    var data = allEventData[j];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        data['val'] = val - meanVals[eventId];
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if some samples have differential expression
         */
        this.eventwiseMedianRescaling_old = function() {
            console.log('eventwiseMedianRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            for (var i = 0; i < expressionEventIds.length; i++) {
                var eventId = expressionEventIds[i];

                // get stats
                var eventObj = this.getEvent(eventId);
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();
                for (var k = 0; k < allEventData.length; k++) {
                    var data = allEventData[k];
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var newVal = (val - stats[eventId]['median']);
                        data['val'] = newVal;
                        allAdjustedVals.push(data['val']);
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        this.eventwiseMedianRescaling_events = function(eventIds) {
            // compute average val each gene
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            _.each(eventIds, function(eventId) {
                // get stats
                var eventObj = this.getEvent(eventId);
                var eventStats = this.getEvent(eventId).data.getStats();
                stats[eventId] = {};
                stats[eventId] = eventStats;

                // finally iter over all samples to adjust score
                var allEventData = this.getEvent(eventId).data.getData();

                _.each(allEventData, function(data) {
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        data['val'] = data['val_orig'];
                    }
                    var val = data['val'];
                    data['val_orig'] = val;
                    if (utils.isNumerical(val)) {
                        var newVal = (val - stats[eventId]['median']);
                        data['val'] = newVal;
                        allAdjustedVals.push(data['val']);
                    }
                });
            }, this);

            // find min/max of entire matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if some samples have differential expression
         */
        this.eventwiseMedianRescaling = function(datatypesToRescale) {
            console.log('eventwiseMedianRescaling');
            // get expression events
            var allEventIds = this.getEventIdsByType();
            var datatypesToRescale = datatypesToRescale || _.keys(allEventIds);
            var result = {};
            _.each(datatypesToRescale, function(eventType) {
                console.log("eventType", eventType);
                var eventIds = allEventIds[eventType];
                if (this.getEvent(eventIds[0]).metadata.allowedValues === "numeric") {
                    var datatypeResult = this.eventwiseMedianRescaling_events(eventIds);
                    result[eventType] = datatypeResult;
                }
            }, this);
            return result["expression data"];
        };

        /**
         * for checking general expression level of gene
         */
        this.samplewiseMedianRescaling = function() {
            // TODO
            console.log('samplewiseMedianRescaling');

            // get expression events
            var allEventIds = this.getEventIdsByType();
            if (!utils.hasOwnProperty(allEventIds, 'expression data')) {
                console.log('no expression');
                return null;
            }
            var expressionEventIds = allEventIds['expression data'];

            // compute average expression each sample
            var stats = {};
            var result = {
                'stats' : stats
            };

            var allAdjustedVals = [];

            var samples = this.getAllSampleIds();
            for (var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                stats[sample] = {};
                // console.log(sample);
                var sampleEventData = this.getEventData([sample]);
                // console.log(prettyJson(sampleEventData));
                // compute median over expression events
                var sampleVals = [];
                for (var j = 0; j < expressionEventIds.length; j++) {
                    var eventId = expressionEventIds[j];
                    if (utils.hasOwnProperty(sampleEventData, eventId)) {
                        var eventData = sampleEventData[eventId][0];
                        if (eventData['id'] === sample) {
                            if (utils.hasOwnProperty(eventData, 'val_orig')) {
                                eventData['val'] = eventData['val_orig'];
                            }
                            var val = eventData['val'];
                            eventData['val_orig'] = val;
                            if (utils.isNumerical(val)) {
                                sampleVals.push(val);
                                // console.log(sample + "->" + eventId + "->" + val);
                            }
                        }
                    } else {
                        console.log(eventId + ' was not found for ' + sample);
                        continue;
                    }
                }
                // console.log('sampleVals.length for ' + sample + ': ' + sampleVals.length);
                var sampleMed = jStat.median(sampleVals);
                // console.log('expression median for ' + sample + ': ' + sampleMed);
                stats[sample]['samplewise median'] = sampleMed;

                if (isNaN(sampleMed)) {
                    console.log('sample median for ' + sample + ' is NaN.');
                    continue;
                }

                // rescale values over expression events
                for (var j = 0; j < expressionEventIds.length; j++) {
                    var eventId = expressionEventIds[j];
                    if (utils.hasOwnProperty(sampleEventData, eventId)) {
                        var eventData = sampleEventData[eventId][0];
                        if (eventData['id'] === sample) {
                            if (utils.hasOwnProperty(eventData, 'val_orig')) {
                                eventData['val'] = eventData['val_orig'];
                            }
                            var val = eventData['val'];
                            eventData['val_orig'] = val;
                            if (utils.isNumerical(val)) {
                                var newVal = val - stats[sample]['samplewise median'];
                                eventData['val'] = newVal;
                                allAdjustedVals.push(val);
                            }
                        }
                    } else {
                        console.log(eventId + ' was not found for ' + sample);
                        continue;
                    }
                }
            }

            // find min/max of entire expression matrix
            result['maxVal'] = jStat.max(allAdjustedVals);
            result['minVal'] = jStat.min(allAdjustedVals);

            return result;
        };

        /**
         * for checking if a differential expression is in an expressed gene or not
         */
        this.bivariateNormalization = function() {
            // TODO

        };

        /**
         * remove events that have no sample data
         */
        this.removeEmptyEvents = function(maxPercentNull) {
            var threshold = maxPercentNull || 0.99;
            var allEventIdsByCategory = this.getEventIdsByType();
            var emptyEvents = [];
            var categories = utils.getKeys(allEventIdsByCategory);
            for (var i = 0, length = categories.length; i < length; i++) {
                var category = categories[i];
                if (category === "datatype label") {
                    continue;
                }
                for (var j = 0; j < allEventIdsByCategory[category].length; j++) {
                    var eventId = allEventIdsByCategory[category][j];
                    var eventObj = this.getEvent(eventId);
                    var percentNull = eventObj.data.getPercentNullData();
                    if (percentNull >= threshold) {
                        emptyEvents.push(eventId);
                    }
                }
            }
            for (var i = 0, length = emptyEvents.length; i < length; i++) {
                var eventId = emptyEvents[i];
                console.log("empty event:", eventId);
                this.deleteEvent(eventId);
            }
            return null;
        };

        /**
         * Fill in missing samples data with the specified value.
         */
        this.fillInMissingSamples = function(value) {
            // get all sample IDs
            var allAlbumSampleIds = this.getAllSampleIds();

            // get all sample IDs for event
            var allEventIdsByCategory = this.getEventIdsByType();
            for (var i = 0, length = utils.getKeys(allEventIdsByCategory).length; i < length; i++) {
                var category = utils.getKeys(allEventIdsByCategory)[i];
                for (var j = 0; j < allEventIdsByCategory[category].length; j++) {
                    var eventId = allEventIdsByCategory[category][j];
                    var eventData = this.getEvent(eventId).data;
                    var allEventSampleIds = eventData.getAllSampleIds();
                    if (allAlbumSampleIds.length - allEventSampleIds.length == 0) {
                        continue;
                    };

                    // find missing data
                    var missingSampleIds = utils.keepReplicates(allAlbumSampleIds.concat(allEventSampleIds), 2, true);
                    var missingData = {};
                    for (var k = 0; k < missingSampleIds.length; k++) {
                        var id = missingSampleIds[k];
                        missingData[id] = value;
                    }
                    // add data
                    this.getEvent(eventId).data.setData(missingData);
                }
            }
            return this;
        };

        /**
         * NOTE!!! ALL missing sample data will be filled in!
         */
        this.fillInDatatypeLabelEvents = function(value) {
            var allEventIdsByCategory = this.getEventIdsByType();
            var datatypes = utils.getKeys(allEventIdsByCategory);

            var datatypeLabelDatatype = "datatype label";

            for (var i = 0, length = datatypes.length; i < length; i++) {
                var datatype = datatypes[i];

                if (datatype === datatypeLabelDatatype) {
                    continue;
                }

                var pos_suffix = "(+)";
                var neg_suffix = "(-)";

                var eventObj = this.addEvent({
                    'id' : datatype + pos_suffix,
                    'name' : datatype + pos_suffix,
                    'displayName' : datatype + pos_suffix,
                    'description' : null,
                    'datatype' : datatypeLabelDatatype,
                    'allowedValues' : null
                }, {});

                var eventObj_anti = this.addEvent({
                    'id' : datatype + neg_suffix,
                    'name' : datatype + neg_suffix,
                    'displayName' : datatype + neg_suffix,
                    'description' : null,
                    'datatype' : datatypeLabelDatatype,
                    'allowedValues' : null
                }, {});
            }

            this.fillInMissingSamples(value);
        };

        this.getDatatypeNullSamples = function(datatype) {
            var samplesToHide = [];
            try {
                // get eventobjs in datatype
                var eventIdsByType = this.getEventIdsByType();
                var eventTypes = utils.getKeys(eventIdsByType);
                if (utils.isObjInArray(eventTypes, datatype)) {
                    // find samples that are null in all events of the datatype
                    samplesToHide = this.getAllSampleIds();
                    var eventIds = eventIdsByType[datatype];
                    for (var i = 0, length = eventIds.length; i < length; i++) {
                        var eventId = eventIds[i];
                        var eventObj = this.getEvent(eventId);
                        var nullSamples = eventObj.data.getNullSamples();
                        samplesToHide = samplesToHide.concat(nullSamples);
                        samplesToHide = utils.keepReplicates(samplesToHide);
                    }
                }
            } catch (error) {
                console.log('ERROR while getting samples to hide in datatype:', datatype, 'error.message ->', error.message);
            } finally {
                console.log('samplesToHide', samplesToHide);
                return samplesToHide;
            }
        };
    };

    ed.OD_event = function(metadataObj) {
        this.metadata = new ed.OD_eventMetadata(metadataObj);
        this.data = new ed.OD_eventDataCollection();
    };

    ed.OD_eventMetadata = function(obj) {
        this.id = obj['id'];
        this.name = obj['name'];
        this.displayName = obj['displayName'];
        this.description = obj['description'];
        this.datatype = obj['datatype'];
        this.allowedValues = obj['allowedValues'];
        this.minAllowedVal = obj['minAllowedVal'];
        this.maxAllowedVal = obj['maxAllowedVal'];
        this.weightedGeneVector = [];

        this.setScoreRange = function(minAllowed, maxAllowed) {
            this.minAllowedVal = minAllowed;
            this.maxAllowedVal = maxAllowed;
        };

        /**
         * weightVector is an array of objects with keys: 'gene', 'weight'.
         * scoredDatatype is the datatype to which the weights apply.
         */
        this.setWeightVector = function(weightVector, scoredDatatype) {
            this.weightedGeneVector = weightVector;
            this.scoredDatatype = scoredDatatype;
            return this;
        };

        /**
         * For an event that is a signature of weighted genes, sort genes by weight... heaviest at top
         */
        this.sortSignatureVector = function(reverse) {

            /**
             * comparator for weighted gene vector
             */
            var compareWeightedGenes = function(a, b) {
                var weightA = a['weight'];
                var weightB = b['weight'];
                return utils.compareAsNumeric(weightA, weightB);
            };

            var sig = this.weightedGeneVector.slice(0);
            sig.sort(compareWeightedGenes);

            // output sorted list of geness
            var geneList = [];
            for (var i = 0; i < sig.length; i++) {
                geneList.push(sig[i]['gene']);
            }

            if (reverse) {
            } else {
                geneList.reverse();
            }

            return geneList;
        };
    };

    ed.OD_eventDataCollection = function() {
        /**
         * list of sampleData objects with keys: 'id', 'val'.
         */
        this.dataCollection = [];

        function sampleData(id, val) {
            this.id = id;
            this.val = val;
        };

        /**
         * Get the percent of samples that have null data.
         */
        this.getPercentNullData = function() {
            var counts = this.getValueCounts();
            var percentNull = 0;
            if (null in counts) {
                var allSampleIds = this.getAllSampleIds();
                var totalCount = allSampleIds.length;
                var nullCounts = counts[null];
                percentNull = nullCounts / totalCount;
            }
            return percentNull;
        };

        /**
         * get the sample count for each value.  Useful for something like histogram.  Restrict to sample list, if given.
         */
        this.getValueCounts = function(sampleList) {
            var valCounts = {};
            // get sample data
            var dataList = this.getData(sampleList);

            // get the sample count for each value
            for (var i = 0; i < dataList.length; i++) {
                var dataObj = dataList[i];
                var val = dataObj['val'];
                if (!utils.hasOwnProperty(valCounts, val)) {
                    valCounts[val] = 0;
                }
                valCounts[val] = valCounts[val] + 1;
            }
            return valCounts;
        };

        /**
         * Get all data values.
         */
        this.getValues = function(dedup) {
            var valueCounts = this.getValueCounts();
            var vals = utils.getKeys(valueCounts);

            if ((dedup != null) && (dedup == true)) {
                vals = utils.eliminateDuplicates(vals);
            }
            return vals;
        };

        /**
         * dataObj is a dictionary of event values keyed on sampleId
         */
        this.setData = function(dataObj, isNumeric) {
            // this.dataCollection = [];
            for (var sampleId in dataObj) {
                var val = dataObj[sampleId];
                if ((val == "NaN") || (val == "null") || (val == "") || (val == "N/A")) {
                    // skip non-values
                    continue;
                }
                if ((isNumeric != null) && (isNumeric == true)) {
                    val = parseFloat(val);
                }
                this.dataCollection.push(new sampleData(sampleId, val));
            }
            return this;
        };

        /**
         * Order of samples is maintained... allows multi-sort.
         * If a specified ID is not found, then null is used for the value.
         * Restrict to sampleIdList, if given.
         */
        this.getData = function(sampleIdList) {
            // a mapping of sampleId to index
            var allSampleIds = this.getAllSampleIds(true);

            if (sampleIdList == null) {
                sampleIdList = utils.getKeys(allSampleIds);
            }
            var returnData = [];

            for (var i = 0; i < sampleIdList.length; i++) {
                var sampleId = sampleIdList[i];
                // check if sampleId is in allSampleIds
                if ( sampleId in allSampleIds) {
                    var index = allSampleIds[sampleId];
                    var data = this.dataCollection[index];
                    returnData.push(data);
                } else {
                    returnData.push(new sampleData(sampleId, null));
                }
            }
            return returnData;
        };

        /**
         * Get all sampleIds as array.  If indices == true, then return mapping of id to index.
         */
        this.getAllSampleIds = function(indices) {
            var ids = {};
            for (var i = 0; i < this.dataCollection.length; i++) {
                var data = this.dataCollection[i];
                var id = data['id'];
                ids[id] = i;
            }
            if (indices) {
                return ids;
            }
            return utils.getKeys(ids);
        };

        /**
         *Get the sampleIds with null data values
         */
        this.getNullSamples = function(inputIds) {
            var resultIds = [];
            var sampleData = this.getData(inputIds);
            for (var i = 0; i < sampleData.length; i++) {
                var data = sampleData[i];
                if (data['val'] == null) {
                    resultIds.push(data['id']);
                }
            }
            return resultIds;
        };

        /**
         * compare sample scores and return sorted list of sample IDs. If sortType == numeric, then numeric sort.  Else, sort as strings.
         */
        this.sortSamples = function(sampleIdList, sortType) {
            // sortingData has to be an array
            var sortingData = this.getData(sampleIdList);

            // sort objects
            var comparator = compareSamplesAsStrings;
            if (sortType == null) {
                sortType = 'categoric';
            } else {
                sortType = sortType.toLowerCase();
            }

            if (((sortType == 'numeric') || (sortType == 'expression'))) {
                comparator = compareSamplesAsNumeric;
            } else if (sortType == 'date') {
                comparator = compareSamplesAsDate;
            }
            sortingData.sort(comparator);

            // return row names in sorted order
            var sortedNames = new Array();
            for (var k = 0; k < sortingData.length; k++) {
                sortedNames.push(sortingData[k]['id']);
            }

            return sortedNames;
        };

        /**
         * Select Ids with data that match a value. Restrict to startingIds, if given.
         */
        this.selectIds = function(selectVal, startingIds) {
            var selectedIds = [];

            var allData = (startingIds == null) ? this.getData() : this.getData(startingIds);
            for (var i = 0; i < allData.length; i++) {
                var data = allData[i];
                if (data['val'] == selectVal) {
                    selectedIds.push(data['id']);
                }
            }

            return selectedIds;
        };

        /** *get mean,sd,median,meddev,meandev.  Uses jStat library
         */
        this.getStats = function(sampleIdList, precision) {
            if ( typeof precision === 'undefined') {
                precision = 3;
            }
            var results = {
                'min' : 0,
                'max' : 0,
                'mean' : 0,
                'median' : 0,
                'sd' : 0,
                'meddev' : 0,
                'meandev' : 0,
                'percentNullData' : 0
            };

            results.percentNullData = this.getPercentNullData();
            results.percentNullData = results.percentNullData.toPrecision(precision);
            if (results.percentNullData == 1) {
                return results;
            }

            // a mapping of sampleId to index
            var allSampleIds = this.getAllSampleIds(true);

            if (sampleIdList == null) {
                sampleIdList = utils.getKeys(allSampleIds);
            }

            var vector = [];
            for (var i = 0; i < sampleIdList.length; i++) {
                var sampleId = sampleIdList[i];
                // check if sampleId is in allSampleIds
                if ( sampleId in allSampleIds) {
                    var index = allSampleIds[sampleId];
                    var data = this.dataCollection[index];
                    var val = null;
                    // be sure to use original values
                    if (utils.hasOwnProperty(data, 'val_orig')) {
                        val = data['val_orig'];
                    } else {
                        val = data['val'];
                    }
                    if (utils.isNumerical(val)) {
                        vector.push(val);
                    }
                }
            }

            if (vector.length == 0) {
                return results;
            }

            results['mean'] = jStat.mean(vector).toPrecision(precision);
            results['sd'] = jStat.stdev(vector).toPrecision(precision);
            results['median'] = jStat.median(vector).toPrecision(precision);
            results['meddev'] = jStat.meddev(vector).toPrecision(precision);
            results['meandev'] = jStat.meandev(vector).toPrecision(precision);
            results['min'] = jStat.min(vector).toPrecision(precision);
            results['max'] = jStat.max(vector).toPrecision(precision);

            return results;
        };
    };

    /**
     * Keep track of sorting.
     */
    ed.sortingSteps = function(arrayOfSteps) {
        this.steps = new Array();
        if (arrayOfSteps != null) {
            this.steps = arrayOfSteps;
        }

        this.getSteps = function() {
            return this.steps;
        };

        this.getIndex = function(name) {
            var result = -1;
            for (var i = 0; i < this.steps.length; i++) {
                if (this.steps[i]["name"] == name) {
                    return i;
                }
            }
            return result;
        };

        /**
         * noReverse = true to just bring a step to the front
         */
        this.addStep = function(name, noReverse) {
            var index = this.getIndex(name);
            if (index >= 0) {
                var c = this.steps.splice(index, 1)[0];
                if (!noReverse) {
                    c["reverse"] = !c["reverse"];
                }
                this.steps.push(c);
            } else {
                this.steps.push({
                    "name" : name,
                    "reverse" : false
                });
            }
        };

        this.removeStep = function(name) {
            var index = this.getIndex(name);
            if (index >= 0) {
                this.steps.splice(index, 1);
            }
        };

        this.clearSteps = function() {
            this.steps.splice(0, this.steps.length);
        };
    };

    /**
     * Object to help with selecting sample IDs based on selection criteria.
     */
    ed.sampleSelectionCriteria = function() {
        this.criteria = new Array();

        this.getCriteria = function() {
            return this.criteria;
        };

        this.addCriteria = function(eventId, value) {
            var criteria = {
                "eventId" : eventId,
                "value" : value
            };
            for (var i in this.criteria) {
                if (JSON.stringify(this.criteria[i]) == JSON.stringify(criteria)) {
                    return;
                }
            }
            this.criteria.push(criteria);
        };

        this.removeCriteria = function(eventId, value) {
            for (var i = 0; i < this.criteria.length; i++) {
                if ((this.criteria[i]["eventId"] == eventId) && (this.criteria[i]["value"] == value)) {
                    this.criteria.splice(i, 1);
                    break;
                }
            }
        };

        this.clearCriteria = function() {
            this.criteria.splice(0, this.criteria.length);
        };
    };

})(eventData);
 // end of eventData.js
 // end of eventData.js
/**
 * graphData.js
 * ChrisW
 *
 * objects to use for drawing network graphs in D3.js.
 */

var graphData = {};
(function(gd) {"use strict";

    /**
     * Data to specify a node.
     */
    gd.nodeData = function(data) {
        this.name = data['name'];
        if ('group' in data) {
            this.group = data['group'];
        } else {
            this.group = 'unspecified entity';
        }

        /**
         * Check if this nodeData is equal to the specified nodeData.
         */
        this.checkEquality = function(otherNodeData) {
            if (this.name == otherNodeData.name && this.group == otherNodeData.group) {
                return true;
            } else {
                return false;
            }
        };
    };

    /**
     * Data to specify a link.
     */
    gd.linkData = function(data) {
        this.source = parseInt(data['sourceIdx']);
        this.target = parseInt(data['targetIdx']);
        if ('value' in data) {
            this.value = parseFloat(data['value']);
        } else {
            this.value = 3;
        }
        if ('relation' in data) {
            this.relation = data['relation'];
        }
    };

    /**
     * A graph is a set of vertices and edges.
     */
    gd.graphData = function() {
        this.nodes = new Array();
        this.links = new Array();

        /**
         * Get a list of link relations in this graph.
         */
        this.getRelations = function() {
            var linkTypes = _.pluck(this.links, "relation");
            return _.uniq(linkTypes);
        };

        /**
         * Get all the node names in the graph.
         */
        this.getAllNodeNames = function() {
            var nodeNames = new Array();
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                var nodeData = this.nodes[i];
                var nodeName = nodeData['name'];
                nodeNames.push(nodeName);
            }
            return nodeNames;
        };

        /**
         * Add a node to the graph.
         */
        this.addNode = function(nodeData) {
            // check if it is nodeData object
            if (nodeData.constructor.toString !== gd.nodeData.constructor.toString) {
                console.log('not nodeData: ' + JSON.stringify(nodeData));
                return null;
            }

            // check if node already exists
            var exists = false;
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                var node = this.nodes[i];
                if (node.checkEquality(nodeData)) {
                    console.log('nodeData exists');
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                // add node
                this.nodes.push(nodeData);
                return nodeData;
            } else {
                return null;
            }
        };
        /**
         * Does not check if both source and target nodes exist.
         */
        this.addLink = function(linkData) {
            // TODO first, check if link exists
            if (linkData.constructor.toString !== gd.linkData.constructor.toString) {
                console.log('not adding link: ' + JSON.stringify(linkData));
                return null;
            }
            this.links.push(linkData);
        };

        /**
         * Get IDs for nodes that have the specified name.
         */
        this.getNodeIdsByName = function(name) {
            var idList = new Array();
            var nameUc = name.toUpperCase(name);
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                var node = this.nodes[i];
                if (node['name'].toUpperCase() === nameUc) {
                    idList.push(i);
                }
            }
            return idList;
        };
        /**
         * Delete a node by the name.
         */
        this.deleteNodeByName = function(name) {
            // TODO deleting node should force re-indexing of link source/targets
            // nothing to delete
            if (this.nodes.length < 1) {
                console.log('no nodes to delete');
                return;
            }

            // find index of node
            var idx = -1;
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                if (this.nodes[i]['name'] == name) {
                    idx = i;
                    break;
                }
            }
            if (idx == -1) {
                console.log('No node was found for ' + name);
                return;
            }

            // find links
            var linksToDelete = new Array();
            for (var i = 0, length = this.links.length; i < length; i++) {
                var link = this.links[i];
                var source = link['source'];
                var target = link['target'];

                if (source == idx || target == idx) {
                    linksToDelete.push(link);
                    continue;
                } else if ((source['index'] == idx) || (target['index'] == idx)) {
                    linksToDelete.push(link);
                    continue;
                }
            }

            // delete stuff
            for (var i = 0, length = linksToDelete.length; i < length; i++) {
                var link = linksToDelete[i];
                utils.removeA(this.links, link);
            }
            var node = this.nodes[idx];
            utils.removeA(this.nodes, node);
        };
        /**
         * Delete a link by its array index.
         */
        this.deleteLinkByIndex = function(linkIdx) {
            this.links.splice(linkIdx, 1);
        };
        /**
         * read graph links from TAB text
         */
        this.readTab = function(text) {
            // clear old graph
            this.nodes = new Array();
            this.links = new Array();

            var lines = text.split('\n');

            // nodes
            var nodeNameArray = new Array();
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length >= 2) {
                    var sourceName = fields[0];
                    var targetName = fields[1];
                    nodeNameArray.push(sourceName);
                    nodeNameArray.push(targetName);
                }
            }
            nodeNameArray = d3.set(nodeNameArray).values();
            for (var i = 0, length = nodeNameArray.length; i < length; i++) {
                var nodeName = nodeNameArray[i];
                this.addNode(new nodeData({
                    name : nodeName
                }));
            }

            // links
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length >= 2) {
                    var sourceName = fields[0];
                    var targetName = fields[1];
                    var relation = '';
                    if (fields.length >= 3) {
                        relation = fields[2];
                    } else {
                        relation = 'unspecified';
                    }

                    var sourceIdxList = this.getNodeIdsByName(sourceName);
                    var targetIdxList = this.getNodeIdsByName(targetName);

                    this.addLink(new linkData({
                        sourceIdx : sourceIdxList[0],
                        targetIdx : targetIdxList[0],
                        'relation' : relation
                    }));
                }
            }
        };
        /**
         * read graph SIF text
         */
        this.readSif = function(text) {
            // clear old graph
            this.nodes = new Array();
            this.links = new Array();

            var lines = text.split('\n');

            // nodes
            var nodeNameArray = new Array();
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length >= 3) {
                    var sourceName = fields[0];
                    var targetName = fields[2];
                    nodeNameArray.push(sourceName);
                    nodeNameArray.push(targetName);
                }
            }
            nodeNameArray = d3.set(nodeNameArray).values();
            for (var i = 0, length = nodeNameArray.length; i < length; i++) {
                var nodeName = nodeNameArray[i];
                this.addNode(new gd.nodeData({
                    name : nodeName
                }));
            }

            // links
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length >= 3) {
                    var sourceName = fields[0];
                    var relation = fields[1];
                    var targetName = fields[2];

                    var sourceIdxList = this.getNodeIdsByName(sourceName);
                    var targetIdxList = this.getNodeIdsByName(targetName);

                    this.addLink(new gd.linkData({
                        sourceIdx : sourceIdxList[0],
                        targetIdx : targetIdxList[0],
                        'relation' : relation
                    }));
                }
            }
        };

        this.readMedbookGraphData = function(medbookGraphDataObj) {
            // clear old graph
            this.nodes = new Array();
            this.links = new Array();

            // nodes
            var medbookElements = medbookGraphDataObj["network"]["elements"];
            for (var i = 0, length = medbookElements.length; i < length; i++) {
                var medbookElement = medbookElements[i];
                var type = medbookElement["type"];
                var name = medbookElement["name"];
                this.addNode(new gd.nodeData({
                    "name" : name,
                    "group" : type
                }));
            }

            // edges
            var medbookInteractions = medbookGraphDataObj["network"]["interactions"];
            console.log("medbookInteractions.length", medbookInteractions.length);
            for (var i = 0, lengthi = medbookInteractions.length; i < lengthi; i++) {
                var medbookInteraction = medbookInteractions[i];
                var sourceName = medbookInteraction["source"];
                var targetName = medbookInteraction["target"];
                var relation = medbookInteraction["type"];

                var sourceIdx = -1;
                var targetIdx = -1;
                for (var j = 0, lengthj = this.nodes.length; j < lengthj; j++) {
                    var nodeName = this.nodes[j]['name'];
                    if (nodeName == sourceName) {
                        sourceIdx = j;
                    }
                    if (nodeName == targetName) {
                        targetIdx = j;
                    }
                    if (targetIdx != -1 && sourceIdx != -1) {
                        // got Idx for both... go save the edge
                        break;
                    }
                }

                // save edge
                if (targetIdx != -1 && sourceIdx != -1) {
                    this.addLink(new gd.linkData({
                        'sourceIdx' : parseInt(sourceIdx),
                        'targetIdx' : parseInt(targetIdx),
                        'relation' : relation
                    }));
                }
            };
            return null;
        };

        /**
         * read graph from PID text
         */
        this.readPid = function(text) {
            // clear old graph
            this.nodes = new Array();
            this.links = new Array();

            var lines = text.split('\n');
            // nodes
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length == 2) {
                    this.addNode(new nodeData({
                        name : fields[1],
                        group : fields[0]
                    }));
                }
            }
            // edges
            for (var i = 0, length = lines.length; i < length; i++) {
                var fields = lines[i].split('\t');
                if (fields.length >= 3) {
                    // relation
                    var sourceName = fields[0];
                    var targetName = fields[1];
                    var relation = fields[2];

                    var sourceIdx = -1;
                    var targetIdx = -1;
                    for (var j = 0, length = this.nodes.length; j < length; j++) {
                        var nodeName = this.nodes[j]['name'];
                        if (nodeName == sourceName) {
                            sourceIdx = j;
                        }
                        if (nodeName == targetName) {
                            targetIdx = j;
                        }
                        if (targetIdx != -1 && sourceIdx != -1) {
                            break;
                        }
                    }

                    if (targetIdx != -1 && sourceIdx != -1) {
                        this.addLink(new linkData({
                            'sourceIdx' : parseInt(sourceIdx),
                            'targetIdx' : parseInt(targetIdx),
                            'relation' : relation
                        }));
                    }
                }
            }
        };

        /**
         * Get the graph as a PID string.  Bug: Nodes that have same name, different group/type will give possibly unexpected results in the relations section.
         */
        this.toPid = function() {
            var pidString = '';

            // nodes
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                var node = this.nodes[i];
                var nodeString = node['group'] + '\t' + node['name'] + '\n';
                pidString = pidString + nodeString;
            }

            // relations
            for (var i = 0, length = this.links.length; i < length; i++) {
                var link = this.links[i];
                var relation = link['value'];
                if ('relation' in link) {
                    relation = link['relation'];
                }
                var linkString = link['source']['name'] + '\t' + link['target']['name'] + '\t' + relation + '\n';
                pidString = pidString + linkString;
            }

            return pidString;
        };

        /**
         * Get the graph as a Javascript object for loading into cytoscapeJS as an elements object.
         *
         */
        this.toCytoscapeElements = function() {
            var elements = {
                'nodes' : [],
                'edges' : []
            };

            // nodes
            for (var i = 0, length = this.nodes.length; i < length; i++) {
                var node = this.nodes[i];

                elements['nodes'].push({
                    'data' : {
                        'id' : node['name'],
                        'type' : node['group']
                    }
                });
            }

            // relations
            for (var i = 0, length = this.links.length; i < length; i++) {
                var link = this.links[i];

                // relation may be stored as value or relation
                var relation = link['value'];
                if ('relation' in link) {
                    relation = link['relation'];
                }

                elements['edges'].push({
                    'data' : {
                        'source' : this.nodes[link['source']]['name'],
                        'target' : this.nodes[link['target']]['name'],
                        'relation' : relation
                    }
                });
            }

            return elements;
        };

        /**
         * Get this node's neighbors.
         */
        this.getNeighbors = function(nodeName, degree) {
            var degree = degree || 1;
            var neighborObjs = [];
            var nodeIdxs = this.getNodeIdsByName(nodeName);

            for (; degree > 0; degree--) {
                var newNodeIdxs = [];
                for (var i = 0, length = this.links.length; i < length; i++) {
                    var linkData = this.links[i];
                    var sourceNodeIdx = linkData.source.index;
                    var targetNodeIdx = linkData.target.index;
                    if ((!utils.isObjInArray(nodeIdxs, targetNodeIdx)) && utils.isObjInArray(nodeIdxs, sourceNodeIdx)) {
                        newNodeIdxs.push(targetNodeIdx);
                        neighborObjs.push(this.nodes[targetNodeIdx]);
                    } else if ((!utils.isObjInArray(nodeIdxs, sourceNodeIdx)) && utils.isObjInArray(nodeIdxs, targetNodeIdx)) {
                        newNodeIdxs.push(sourceNodeIdx);
                        neighborObjs.push(this.nodes[sourceNodeIdx]);
                    }
                }
                nodeIdxs = nodeIdxs.concat(newNodeIdxs);
            }
            return utils.eliminateDuplicates(neighborObjs);
        };
    };

})(graphData);
 // end of graphData.js
 // end of graphData.js
/**
 * chrisw@soe.ucsc.edu
 * 27AUG14
 * medbook_data_load.js is meant to load cBio/medbook data into data objects.
 */

// cBio-Medbook api:
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getClinicalData&case_set_id=prad_wcdt_all
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getMutationData&case_set_id=prad_wcdt_all&genetic_profile_id=prad_wcdt_mutations&gene_list=AKT1+AKT2+RB1+PTEN
// https://medbook.ucsc.edu/cbioportal/webservice.do?cmd=getCaseLists&cancer_study_id=prad_wcdt

// var clinicalDataFileUrl = 'observation_deck/data/cbioMedbook/data_clinical.txt';
// var caseListsFileUrl = 'observation_deck/data/cbioMedbook/getCaseLists.txt';
// var mutationDataFileUrl = 'observation_deck/data/cbioMedbook/mutation.txt';
// var expressionDataFileUrl = 'observation_deck/data/cbioMedbook/expressionData.tab';

var medbookDataLoader = medbookDataLoader || {};

(function(mdl) {"use strict";
    mdl.transposeClinicalData = function(input, recordKey) {
        var transposed = {};
        for (var i = 0; i < input.length; i++) {
            var obj = input[i];
            var case_id = obj[recordKey];
            // delete (obj[recordKey]);
            for (var key in obj) {
                if ( key in transposed) {
                } else {
                    transposed[key] = {};
                }
                transposed[key][case_id] = obj[key];
            }
        }
        return transposed;
    };

    /**
     * The clinical data file looks like this:

     #Sample f1    f2   f3     f4
     #Sample f1    f2   f3     f4
     STRING  STRING  DATE    STRING  STRING
     SAMPLE_ID       f1    f2   f3     f4
     1 UCSF    6/15/2012       Bone    Resistant
     2 UCSF    12/15/2012      Liver   Naive
     3 UCSF    2/26/2013       Liver   Naive
     4 UCSF    2/21/2013       Liver   Naive

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getClinicalData = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var lines = response.split('\n');

        var dataLines = [];
        var commentLines = [];
        var types = [];
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (utils.beginsWith(line, '#')) {
                commentLines.push(line);
            } else if (utils.beginsWith(line, 'STRING')) {
                types = line.split('\t');
            } else {
                dataLines.push(line);
            }
        }

        var parsedResponse = d3.tsv.parse(dataLines.join('\n'));
        var transposed = this.transposeClinicalData(parsedResponse, 'SAMPLE_ID');
        delete transposed['SAMPLE_ID'];

        var eventIdList = utils.getKeys(transposed);
        for (var i = 0; i < eventIdList.length; i++) {
            var eventId = eventIdList[i];
            var clinicalData = transposed[eventId];
            var type = types[i + 1];

            var allowedValues = 'categoric';
            if (type.toLowerCase() == 'number') {
                allowedValues = 'numeric';
            } else if (type.toLowerCase() == 'date') {
                allowedValues = 'date';
            }

            // OD_eventAlbum.addEvent({
            // 'id' : eventId,
            // 'name' : null,
            // 'displayName' : null,
            // 'description' : null,
            // 'datatype' : 'clinical data',
            // 'allowedValues' : allowedValues
            // }, clinicalData);

            mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', 'clinical data', allowedValues, clinicalData);

        }

        return parsedResponse;
    };

    /**
     * The mutation data file is a maf file and looks like this:

     Hugo_Symbol     Entrez_Gene_Id  Center  NCBI_Build
     PEG10   23089   ucsc.edu        GRCh37-lite
     CNKSR3  154043  ucsc.edu        GRCh37-lite
     ANK2    287     ucsc.edu        GRCh37-lite
     ST8SIA4 7903    ucsc.edu        GRCh37-lite
     RUNX1T1 862     ucsc.edu        GRCh37-lite
     GABRB3  2562    ucsc.edu        GRCh37-lite

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getMutationData = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        var dataByGene = {};

        for (var i = 0; i < parsedResponse.length; i++) {
            var parsedData = parsedResponse[i];
            var gene = parsedData['Hugo_Symbol'];
            var classification = parsedData['Variant_Classification'];
            var variantType = parsedData['Variant_Type'];
            var sampleId = parsedData['Tumor_Sample_Barcode'];

            // maf file uses - instead of _
            sampleId = sampleId.replace(/_/g, '-');

            // some samples have trailing [A-Z]
            sampleId = sampleId.replace(/[A-Z]$/, '');

            if (!utils.hasOwnProperty(dataByGene, gene)) {
                dataByGene[gene] = {};
                dataByGene[gene]['metadata'] = {
                    'id' : gene + '_mut',
                    'name' : null,
                    'displayName' : null,
                    'description' : null,
                    'datatype' : 'mutation data',
                    'allowedValues' : 'categoric'
                };
                dataByGene[gene]['data'] = {};
            }

            dataByGene[gene]['data'][sampleId] = true;
        }

        // add mutation events
        var mutatedGenes = utils.getKeys(dataByGene);
        for (var j = 0; j < mutatedGenes.length; j++) {
            var mutatedGene = mutatedGenes[j];
            var mutationData = dataByGene[mutatedGene];
            OD_eventAlbum.addEvent(mutationData['metadata'], mutationData['data']);
        }

        return dataByGene;
    };

    /**
     * The expression data looks like this:

     a b c
     ACOT9   7.89702013149366        4.56919333525263        7.30772632354453
     ADM     9.8457751118653 1       3.92199798893442
     AGR2    14.0603428300693        1       9.25656041315632
     ANG     3.47130453638819        4.56919333525263        6.94655542449336
     ANK2    6.22356349157533        10.7658085407174        12.4021643510831

     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getExpressionData = function(url, OD_eventAlbum) {
        mdl.getGeneBySampleData(url, OD_eventAlbum, '_mRNA', 'expression data', 'numeric');
    };

    mdl.getViperData = function(url, OD_eventAlbum) {
        mdl.getGeneBySampleData(url, OD_eventAlbum, '_viper', 'viper data', 'numeric');
    };

    /**
     * where the event is a gene
     */
    mdl.getGeneBySampleData = function(url, OD_eventAlbum, geneSuffix, datatype, allowedValues) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        for (var eventType in parsedResponse) {
            var data = parsedResponse[eventType];
            var geneId = data[''];
            delete data[''];

            mdl.loadEventBySampleData(OD_eventAlbum, geneId, geneSuffix, datatype, allowedValues, data);
        }
    };

    // TODO loadEventBySampleData
    mdl.loadEventBySampleData = function(OD_eventAlbum, feature, suffix, datatype, allowedValues, data) {
        var eventObj = OD_eventAlbum.addEvent({
            'geneSuffix' : suffix,
            'id' : feature + suffix,
            'name' : datatype + ' for ' + feature,
            'displayName' : feature,
            'description' : null,
            'datatype' : datatype,
            'allowedValues' : allowedValues
        }, data);
        return eventObj;
    };

    /**
     *Add clinical data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoClinicalData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            var sampleId = null;
            // col name for this field has been inconsistent, so try to detect it here
            if (utils.hasOwnProperty(doc, 'sample')) {
                sampleId = doc['sample'];
            } else if (hasOwnProperty(doc, 'Sample')) {
                sampleId = doc['Sample'];
            } else if (hasOwnProperty(doc, 'Patient ID')) {
                sampleId = doc['Patient ID'];
            } else if (hasOwnProperty(doc, 'Patient ID ')) {
                sampleId = doc['Patient ID '];
            } else {
                // no gene identifier found
                console.log('no sample ID found in clinical doc: ' + prettyJson(doc));
                continue;
            }

            sampleId = sampleId.trim();

            // don't use this field
            if ((sampleId === 'Patient ID') || (sampleId === 'Patient ID ')) {
                continue;
            }

            // iter over event names (file columns)
            var keys = utils.getKeys(doc);
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if (utils.isObjInArray(['_id', 'sample', 'Sample'], key)) {
                    // skip these file columns
                    continue;
                }
                var eventObj = OD_eventAlbum.getEvent(key);

                // add event if DNE
                if (eventObj == null) {
                    eventObj = mdl.loadEventBySampleData(OD_eventAlbum, key, '', 'clinical data', 'categoric', []);
                }
                var value = doc[key];
                var data = {};
                data[sampleId] = value;
                eventObj.data.setData(data);
            }
        }
        return eventObj;
    };

    /**
     * Load a matrix of signature data from a string.
     */
    mdl.genericMatrixData = function(matrixString, dataName, OD_eventAlbum, allowedValues) {
        var parsedMatrix = d3.tsv.parse(matrixString);
        // var allowedValues = "numeric";
        var sanitizedDataName = dataName.replace(/ /, "_");

        var returnFeatures = [];

        _.each(parsedMatrix, function(row) {
            var colNames = _.keys(row);
            var featureKey = colNames.shift();
            var feature = row[featureKey];
            delete row[featureKey];

            if (dataName === "clinical data") {
                mdl.loadEventBySampleData(OD_eventAlbum, feature, "", "clinical data", "categoric", row);
                returnFeatures.push(feature);
            } else {
                mdl.loadEventBySampleData(OD_eventAlbum, feature, "_" + sanitizedDataName, dataName, allowedValues, row);
                returnFeatures = [dataName];
            }
            // mdl.loadEventBySampleData(OD_eventAlbum, feature, "_viper", "viper data", allowedValues, row);
        });
        return returnFeatures;
    };

    /**
     *
     */
    mdl.mongoViperSignaturesData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = signature)
        for (var i = 0, length = collection.length; i < length; i++) {
            var doc = collection[i];
            var type = doc["type"];
            var algorithm = doc["algorithm"];
            var label = doc["label"];
            var gene_label = doc["gene_label"];

            var sample_values;
            var docKeys = _.keys(doc);
            if (_.contains(docKeys, "sample_values")) {
                sample_values = doc["sample_values"];
            } else if (_.contains(docKeys, "samples")) {
                sample_values = doc["samples"];
            } else {
                console.log("no sample data found", type, algorithm, gene_label);
                continue;
            }

            var sampleData = {};
            for (var j = 0, lengthj = sample_values.length; j < lengthj; j++) {
                var sampleValue = sample_values[j];
                // var patient_label = sampleValue["patient_label"];
                var sample_label = sampleValue["sample_label"];
                var value = sampleValue["value"];

                sampleData[sample_label] = value;
            }

            // TODO version number ??
            var datatype = type + "_" + algorithm;
            var suffix = "_" + datatype;
            var eventId = gene_label + suffix;
            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene_label, "_viper", 'viper data', 'numeric', sampleData);
            } else {
                eventObj.data.setData(sampleData);
            }
        }
    };

    /**
     *Add expression data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoExpressionData = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            // get gene
            var gene = null;
            if (utils.hasOwnProperty(doc, 'gene')) {
                gene = doc['gene'];
            } else if (utils.hasOwnProperty(doc, 'id')) {
                gene = doc['id'];
            } else {
                // no gene identifier found
                console.log('no gene identifier found in expression doc: ' + utils.prettyJson(doc));
                continue;
            }

            gene = gene.trim();
            var suffix = '_mRNA';
            var eventId = gene + suffix;

            // iter over samples
            var samples = utils.getKeys(doc);
            var sampleObjs = doc['samples'];
            // build up sampleData obj
            var sampleData = {};
            for (var sampleId in sampleObjs) {
                var scoreObj = sampleObjs[sampleId];
                var score = scoreObj["rsem_quan_log2"];
                sampleData[sampleId] = score;
            }

            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'expression data', 'numeric', sampleData);
            } else {
                eventObj.data.setData(sampleData);
            }
        }
    };

    /**
     * data about mutation type
     */
    mdl.mongoMutationData = function(collection, OD_eventAlbum) {
        // iter over doc ... each doc is a mutation call
        var allowed_values = "mutation type";

        var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];

        var mutByGene = {};
        // for (var i = 0, length = collection.length; i < length; i++) {
        _.each(collection, function(element) {
            var doc = element;

            var variantCallData = {};

            var sample = doc["sample_label"];
            var gene = doc["gene_label"];
            var type = variantCallData["mutType"] = doc["mutation_type"];
            // var impact = variantCallData["impact"] = doc["effect_impact"];

            if (! utils.hasOwnProperty(mutByGene, gene)) {
                mutByGene[gene] = {};
            }

            if (! utils.hasOwnProperty(mutByGene[gene], sample)) {
                mutByGene[gene][sample] = [];
            }

            var findResult = _.findWhere(mutByGene[gene][sample], type);
            if (_.isUndefined(findResult)) {
                mutByGene[gene][sample].push(type);
            }
        });
        console.log("mutByGene", mutByGene);

        // add to event album
        var genes = utils.getKeys(mutByGene);
        var suffix = "_mutation";
        for (var i = 0, length = genes.length; i < length; i++) {
            var gene = genes[i];
            var sampleData = mutByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation call', allowed_values, sampleData);
        }

        return null;
    };

    /**
     * Data about mutation impact
     */
    mdl.mongoMutationData_impact = function(collection, OD_eventAlbum) {
        // iter over doc ... each doc is a mutation call
        var allowed_values = "mutation impact";

        var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];
        var mutByGene = {};
        for (var i = 0, length = collection.length; i < length; i++) {
            var doc = collection[i];

            var sample = doc["sample_label"];
            var gene = doc["gene_label"];
            var type = doc["mutation_type"];
            var impact = doc["effect_impact"];

            if (! utils.hasOwnProperty(mutByGene, gene)) {
                mutByGene[gene] = {};
            }

            // TODO score by greatest impact
            if (! utils.hasOwnProperty(mutByGene[gene], sample)) {
                mutByGene[gene][sample] = impact;
            } else {
                var recordedImpact = mutByGene[gene][sample];
                if (impactScoresMap[impact] > impactScoresMap[recordedImpact]) {
                    mutByGene[gene][sample] = impact;
                } else {
                    continue;
                }
            }
        }

        // add to event album
        var genes = utils.getKeys(mutByGene);
        var suffix = "_mutation";
        for (var i = 0, length = genes.length; i < length; i++) {
            var gene = genes[i];
            var sampleData = mutByGene[gene];
            mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'mutation call', allowed_values, sampleData);
        }

        return null;
    };

    /**
     *Add expression data from mongo collection.
     * @param {Object} collection
     * @param {Object} OD_eventAlbum
     */
    mdl.mongoExpressionData_old = function(collection, OD_eventAlbum) {
        // iter over doc (each doc = sample)
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            var gene = null;
            if (utils.hasOwnProperty(doc, 'gene')) {
                gene = doc['gene'];
            } else if (utils.hasOwnProperty(doc, 'id')) {
                gene = doc['id'];
            } else {
                // no gene identifier found
                console.log('no gene identifier found in expression doc: ' + utils.prettyJson(doc));
                continue;
            }

            gene = gene.trim();
            var suffix = '_mRNA';
            var eventId = gene + suffix;

            // iter over samples
            var samples = utils.getKeys(doc);
            for (var j = 0; j < samples.length; j++) {
                var sample = samples[j];
                if (utils.isObjInArray(['_id', 'gene', 'id'], sample)) {
                    // skip these 'samples'
                    continue;
                }
                var eventObj = OD_eventAlbum.getEvent(eventId);

                // add event if DNE
                if (eventObj == null) {
                    eventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, suffix, 'expression data', 'numeric', []);
                }
                var value = doc[sample];
                var data = {};
                data[sample] = parseFloat(value);
                eventObj.data.setData(data);
            }
        }
        return eventObj;
    };

    /**
     *Get a signature via url.  This one does not load sample data.
     * @param {Object} url
     * @param {Object} OD_eventAlbum
     */
    mdl.getSignature = function(url, OD_eventAlbum) {
        var response = utils.getResponse(url);
        var parsedResponse = d3.tsv.parse(response);

        var eventId = url.split('/').pop();

        var eventObj = OD_eventAlbum.getEvent(eventId);

        // add event if DNE
        if (eventObj == null) {
            OD_eventAlbum.addEvent({
                'id' : eventId,
                'name' : null,
                'displayName' : null,
                'description' : null,
                'datatype' : 'expression signature',
                'allowedValues' : 'numeric',
                'weightedGeneVector' : parsedResponse
            }, []);
            eventObj = OD_eventAlbum.getEvent(eventId);
        }
        return eventObj;
    };

    /**
     * Load sample signature scores.
     * @param {Object} obj  mongo collection... an array of {'id':sampleId, 'name':eventId, 'val':sampleScore}
     * @param {Object} OD_eventAlbum
     */
    mdl.loadSignatureObj = function(obj, OD_eventAlbum) {
        var sigScoresMongoDocs = obj;

        // group data by eventID
        var groupedData = {};
        for (var i = 0; i < sigScoresMongoDocs.length; i++) {
            var mongoDoc = sigScoresMongoDocs[i];
            var id = mongoDoc['id'];
            var name = mongoDoc['name'];
            var val = mongoDoc['val'];

            if (! utils.hasOwnProperty(groupedData, name)) {
                groupedData[name] = {};
            }
            groupedData[name][id] = val;
        }

        // set eventData
        var eventIds = utils.getKeys(groupedData);
        for (var i = 0; i < eventIds.length; i++) {
            var eventId = eventIds[i];
            var eventData = groupedData[eventId];

            var datatype;
            var fields = eventId.split('_v');
            fields.pop();
            var rootName = fields.join('_v');
            if (utils.endsWith(rootName, '_kinase_viper')) {
                datatype = 'kinase target activity';
            } else if (utils.endsWith(rootName, '_tf_viper') || utils.beginsWith(rootName, 'tf_viper_')) {
                datatype = 'tf target activity';
            } else {
                datatype = 'expression signature';
            }

            var eventObj = OD_eventAlbum.getEvent(eventId);

            // add event if DNE
            if (eventObj == null) {
                eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', datatype, 'numeric', {});
                eventObj.metadata.setWeightVector([], "expression data");
            }

            eventObj.data.setData(eventData);
        }

    };

    // TODO qqq
    mdl.loadSignatureWeightsObj = function(obj, OD_eventAlbum) {
        // fields: name and version and signature... signature is an obj keyed by gene {'weight':weight,'pval':pval}
        var eventId = obj['name'] + '_v' + obj['version'];

        var datatype;
        if (utils.endsWith(obj['name'], '_kinase_viper')) {
            datatype = 'kinase target activity';
        } else if (utils.endsWith(obj['name'], '_tf_viper') || utils.beginsWith(obj['name'], 'tf_viper_')) {
            datatype = 'tf target activity';
        } else {
            datatype = "expression signature";
        }

        var eventObj = OD_eventAlbum.getEvent(eventId);

        // weightedGeneVector to be converted to Array of {'gene':gene,'weight':weight}
        var weightedGeneVector = [];
        var signatures = obj['signature'];
        var genes = utils.getKeys(signatures);
        for (var i = 0; i < genes.length; i++) {
            var gene = genes[i];
            var data = signatures[gene];
            weightedGeneVector.push({
                'gene' : gene,
                'weight' : data['weight']
            });
        }

        if (eventObj == null) {
            // create eventObj
            eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, '', datatype, 'numeric', []);
        }
        eventObj.metadata.setWeightVector(weightedGeneVector, 'expression data');
        var size = eventObj.metadata.weightedGeneVector.length;

        return eventObj;
    };

    /**
     * This loader loads signature weights data as sample data.  Events are genes, samples are signatures, data are weights (hopfully, normalized).
     * @param {Object} obj
     * @param {Object} OD_eventAlbum
     */
    mdl.loadBmegSignatureWeightsAsSamples = function(obj, OD_eventAlbum) {
        // build up objects that can be loaded into event album

        // get query genes
        var queryObj = obj['query'];
        var queryGeneList = utils.getKeys(queryObj['weights']);

        // get feature obj
        var featuresObj = obj['features'];
        var featureObjList = [];
        var featureGenes = [];
        for (var feature in featuresObj) {
            var weightiness = featuresObj[feature];
            featureObjList.push({
                "gene" : feature,
                "weight" : weightiness
            });
            featureGenes.push(feature);
        }
        featureGenes = utils.eliminateDuplicates(featureGenes);

        // get signature gene weight data
        var signaturesDict = obj['signatures'];
        var geneWiseObj = {};
        var queryScores = {};

        for (var signatureName in signaturesDict) {
            var signatureObj = signaturesDict[signatureName];
            var score = signatureObj['score'];
            queryScores[signatureName] = score;

            var weights = signatureObj['weights'];
            // var geneList = utils.getKeys(weights);

            var geneList = queryGeneList.slice(0);
            geneList = geneList.concat(utils.getKeys(weights));
            geneList = utils.eliminateDuplicates(geneList);

            for (var j = 0, geneListLength = geneList.length; j < geneListLength; j++) {
                var gene = geneList[j];

                // only keep certain genes
                if ((! utils.isObjInArray(queryGeneList, gene)) && (! utils.isObjInArray(featureGenes, gene))) {
                    continue;
                }
                var weight = weights[gene];
                if ( typeof weight === "undefined") {
                    continue;
                }
                if (! utils.hasOwnProperty(geneWiseObj, gene)) {
                    geneWiseObj[gene] = {};
                }
                geneWiseObj[gene][signatureName] = weight;
            }
        }

        console.log('num genes:' + utils.getKeys(geneWiseObj).length);

        // query score event
        var eventObj = mdl.loadEventBySampleData(OD_eventAlbum, 'query_score', '', 'signature query score', 'numeric', queryScores);
        eventObj.metadata.setWeightVector(featureObjList, "signature weight");

        // load data into event album
        var geneList = utils.getKeys(geneWiseObj);
        for (var i = 0; i < geneList.length; i++) {
            var gene = geneList[i];
            var eventId = gene + "_weight";
            var sigEventObj = OD_eventAlbum.getEvent(eventId);

            if (sigEventObj == null) {
                // create eventObj

                sigEventObj = mdl.loadEventBySampleData(OD_eventAlbum, gene, '_weight', 'signature weight', 'numeric', geneWiseObj[gene]);
                sigEventObj.metadata.setScoreRange(-1, 1);
            } else {
                console.log('loadBmegSignatureWeightsAsSamples:', 'existing event for: ' + eventId);
            }
        }
    };

    /**
     * pivot scores assign a score to events for the purpose of sorting by (anti)correlation.
     * Pivot scores to be loaded into the album as a special object.
     * In medbook-workbench, this is the correlator subscription.
     * @param {Object} obj
     * @param {Object} OD_eventAlbum
     */
    mdl.loadPivotScores = function(collection, OD_eventAlbum) {
        // get a dictionary of {key,val}
        var pivotScores = [];
        for (var i = 0; i < collection.length; i++) {
            var doc = collection[i];

            // get correlated event info and score
            var eventId1 = doc['name_1'];
            var version1 = doc['version_1'];
            var datatype1 = doc['datatype_1'];

            var getEventId = function(name, datatype, version) {
                var newName;
                if (datatype === 'signature') {
                    newName = name + '_v' + version;
                    // } else if (utils.endsWith(name, "_tf_viper")) {
                    // datatype = 'signature';
                    // newName = name.replace('_tf_viper', '');
                    // newName = "tf_viper_" + newName + "_v" + "4";
                } else if (datatype === 'expression') {
                    // no suffix here, just the gene symbol
                    // newName = name + "_mRNA";
                    newName = name;
                } else {
                    newName = name;
                }
                if ( typeof newName === "undefined") {
                    console.log("undefined name for", name, datatype, version);
                }
                return newName;
            };

            eventId1 = getEventId(eventId1, datatype1, version1);

            var eventId2 = doc['name_2'];
            var version2 = doc['version_2'];
            var datatype2 = doc['datatype_2'];

            eventId2 = getEventId(eventId2, datatype2, version2);

            var score = doc['score'];

            // set pivotScoreData
            pivotScores.push({
                'eventId1' : eventId1,
                'eventId2' : eventId2,
                'score' : score
            });

        }
        OD_eventAlbum.setPivotScores_array(null, pivotScores);
    };

})(medbookDataLoader);
 // end of medbook_data_load.js
 // end of medbook_data_load.js
/**
 * circleMapGenerator.js
 * ChrisW
 *
 * Draw CircleMaps in SVG elements.
 * Requires:
 * 1) utils.js
 * 2) jStat.js
 * 3) OD_eventData.js
 * 4) D3.js
 */

var circleMapGenerator = {};
(function(cmg) {"use strict";

    cmg.examplecmgParams = {
        // "sampleGroupSummarySwitch" : false,
        // "ignoreMissingSamples" : false,
        // "features" : ["PEG10_mRNA", "PFKFB4_mRNA", "PPARG_mRNA", "PRR5_mRNA", "REEP6_mRNA", "RUNX1T1_mRNA", "SELL_mRNA", "SERTAD1_mRNA", "SLC30A4_mRNA", "SPINK1_mRNA", "ST8SIA4_mRNA", "TEAD2_mRNA", "TMPRSS2_mRNA"],
        "features" : ['ABTB2_mRNA', 'APOBEC3F_mRNA', 'APP_mRNA', 'AR_mRNA', 'DZIP1_mRNA', 'EPAS1_mRNA', 'ERG_mRNA', 'ESR2_mRNA', 'FGD1_mRNA', 'FKBP9_mRNA', 'IL6_mRNA', 'MYOM2_mRNA', 'NCOA1_mRNA', 'P2RY10_mRNA', 'PPP2R5C_mRNA', 'PTGER3_mRNA', 'SLC16A1_mRNA', 'ST5_mRNA', 'TBC1D16_mRNA', 'TBX21_mRNA', 'TGFB1_mRNA', 'TGFB2_mRNA', 'UGDH_mRNA', 'USP20_mRNA', 'VEGFA_mRNA', 'ZFPM2_mRNA'],
        "ringsList" : ["core_subtype", "expression data", 'viper data'],
        "orderFeature" : ['core_subtype', "AR_mRNA"],
        "sortingRing" : "expression data"
        // "ringMergeSwitch" : false
    };

    // constructor should take parameters: OD_eventData, cmgParams
    // cmgParams includes ringsList and possibly centerScores
    // centerScores is an object of feature:score where score is taken to be a 0-centered normalized score.
    cmg.circleMapGenerator = function(eventAlbum, cmgParams) {
        this.eventAlbum = eventAlbum.fillInMissingSamples();
        this.cmgParams = cmgParams;

        // rescale expression data
        var exprRescalingData = this.eventAlbum.eventwiseMedianRescaling();

        var expressionColorMapper = utils.centeredRgbaColorMapper(false);
        if (exprRescalingData != null) {
            var minExpVal = exprRescalingData['minVal'];
            var maxExpVal = exprRescalingData['maxVal'];
            var expressionColorMapper = utils.centeredRgbaColorMapper(false, 0, minExpVal, maxExpVal);
        }

        this.eventStats = {};
        this.colorMappers = {};
        var eventIdsByGroup = this.eventAlbum.getEventIdsByType();
        for (var group in eventIdsByGroup) {
            var eventIds = eventIdsByGroup[group];
            for (var i = 0; i < eventIds.length; i++) {
                var eventId = eventIds[i];
                var eventObj = this.eventAlbum.getEvent(eventId);
                if (eventObj.metadata.datatype === 'expression data') {
                    // shared expression color mapper
                    this.colorMappers[eventId] = expressionColorMapper;
                } else if (!utils.isObjInArray(['numeric'], eventObj.metadata.allowedValues)) {
                    // define a discrete color mapper
                    this.colorMappers[eventId] = d3.scale.category10();
                } else {
                    this.eventStats[eventId] = eventObj.data.getStats();
                }
            }
        }

        /**
         * Get the query features... these should match up with eventIDs in the eventAlbum
         */
        this.getQueryFeatures = function() {
            if ("features" in this.cmgParams) {
                return this.cmgParams["features"];
            } else {
                return new Array();
            }
        };

        /**
         * get the names of data sets from the eventAlbum, grouped by datatype
         */
        this.getDatasetNames = function() {
            return this.eventAlbum.getEventIdsByType();
        };

        /**
         * log the object attributes to console
         */
        this.logData = function() {
            console.log(this);
        };

        /**
         * get all sampleIDs from the eventAlbum
         */
        this.getSampleNames = function() {
            return this.eventAlbum.getAllSampleIds();
        };

        /**
         * get the data for a ring.  The return object are sample values keyed on sampleId.
         * @param {Object} eventId
         */
        this.getRingData = function(eventId) {
            var id = eventId;
            var eventObj = this.eventAlbum.getEvent(id);

            // event not found
            if (eventObj == null) {
                return null;
            } else {
                var result = {};
                var eventData = eventObj.data.getData();
                for (var i = 0; i < eventData.length; i++) {
                    var sampleData = eventData[i];
                    result[sampleData['id']] = sampleData['val'];
                }
                return result;
            }
        };

        /**
         * sort samples
         */
        this.sortSamples = function() {
            // get sorted samples
            var ss = new eventData.sortingSteps();
            if (utils.hasOwnProperty(this.cmgParams, "orderFeature")) {
                var features = [].concat(this.cmgParams["orderFeature"]);
                features.reverse();
                for (var i = 0; i < features.length; i++) {
                    ss.addStep(features[i]);
                }
            } else {
                ss.addStep(this.getQueryFeatures()[0]);
            }
            // console.log('ring sorting steps', ss);
            this.sortedSamples = this.eventAlbum.multisortSamples(ss);
        };

        this.sortSamples();

        function getHexColor(score, cohortMin, cohortMax) {
            if (_.isUndefined(score) || ! utils.isNumerical(score)) {
                return "grey";
            }

            cohortMin = (_.isNumber(cohortMin)) ? cohortMin : -1;
            cohortMax = (_.isNumber(cohortMax)) ? cohortMax : 1;

            var posColor = "red";
            var negColor = "blue";
            var zeroColor = "white";

            var colorMapper = d3.scale.linear();
            colorMapper.domain([cohortMin, 0, cohortMax]).range([negColor, zeroColor, posColor]);
            var returnColor = colorMapper(score);

            return returnColor;
        }

        /**
         * create an svg arc via d3.js
         * @param {Object} innerRadius
         * @param {Object} outerRadius
         * @param {Object} startDegrees
         * @param {Object} endDegrees
         */
        function createD3Arc(innerRadius, outerRadius, startDegrees, endDegrees) {
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(startDegrees * (Math.PI / 180)).endAngle(endDegrees * (Math.PI / 180));
            return arc;
        }

        var testCallback = function(pathElem) {
            var ringGroupElem = pathElem.parentNode;
            var circleMapGroupElem = ringGroupElem.parentNode;
            var ringName = ringGroupElem.getAttribute("ringName");
            var feature = circleMapGroupElem.getAttribute("feature");
            console.log("clicked pathElem: " + ringName + " for " + feature);
        };

        /**
         * Generate an svg:group DOM element to be appended to an svg element.
         */
        this.generateCircleMapSvgGElem = function(feature, radius, interactive) {
            var interactive = interactive || false;
            var ringsList = this.cmgParams['ringsList'];

            var fullRadius = ( typeof radius === 'undefined') ? 100 : radius;

            // var expressionEventIds = this.eventAlbum.getEventIdsByType()['expression data'];
            var numDatasets = ringsList.length;

            // +1 for the center
            var ringThickness = fullRadius / (numDatasets + 1);
            var innerRadius = ringThickness;

            var degreeIncrements = 360 / this.sortedSamples.length;

            // arc paths will be added to this SVG group
            var circleMapGroup = document.createElementNS(utils.svgNamespaceUri, 'g');
            utils.setElemAttributes(circleMapGroup, {
                'class' : 'circleMapG',
                "feature" : feature
            });

            // white palete
            circleMapGroup.appendChild(utils.createSvgCircleElement(0, 0, fullRadius, {
                "fill" : "white"
            }));

            // node centers
            var fill;
            if (_.isUndefined(this.cmgParams["centerScores"]) || (_.keys(this.cmgParams["centerScores"]).length == 0 )) {
                // no node center
            } else {
                var centerScore = this.cmgParams["centerScores"][feature];
                if (_.isUndefined(centerScore)) {
                    // check if node center data exists
                    fill = "grey";
                } else {
                    // color center
                    fill = getHexColor(centerScore);
                }
                var centerCircleElem = utils.createSvgCircleElement(0, 0, ringThickness, {
                    "fill" : fill
                });
                // additional interactive features
                if (interactive) {
                    // tooltip for node center
                    if (_.isUndefined(centerScore)) {
                        centerScore = "N/A";
                    } else {
                        // use centerScore
                    }
                    var titleText = "node center score for " + feature + ": " + centerScore;
                    var titleElem = document.createElementNS(utils.svgNamespaceUri, "title");
                    titleElem.innerHTML = titleText;
                    centerCircleElem.appendChild(titleElem);
                }

                circleMapGroup.appendChild(centerCircleElem);
            }

            // iterate over rings
            for (var i = 0; i < ringsList.length; i++) {
                var ringName = ringsList[i];
                var dataName = null;

                // find data name suffix at runtime
                if ( ringName in this.eventAlbum.datatypeSuffixMapping && (this.eventAlbum.datatypeSuffixMapping[ringName] !== "")) {
                    dataName = feature + this.eventAlbum.datatypeSuffixMapping[ringName];
                } else {
                    dataName = ringName;
                }

                var ringGroupElem = document.createElementNS(utils.svgNamespaceUri, 'g');
                utils.setElemAttributes(ringGroupElem, {
                    'class' : 'circleMapRingG',
                    'ringName' : ringName,
                    'dataName' : dataName
                });
                circleMapGroup.appendChild(ringGroupElem);

                var ringData = this.getRingData(dataName);

                if (ringData == null) {
                    // draw a grey ring for no data.
                    var arc = createD3Arc(innerRadius, innerRadius + ringThickness, 0, 360);
                    var pathElem = document.createElementNS(utils.svgNamespaceUri, 'path');
                    utils.setElemAttributes(pathElem, {
                        'd' : arc(),
                        'fill' : 'grey'
                    });
                    ringGroupElem.appendChild(pathElem);

                    // tooltip for arc
                    var titleText = "no " + ringName + " scores";
                    var titleElem = document.createElementNS(utils.svgNamespaceUri, "title");
                    titleElem.innerHTML = titleText;
                    pathElem.appendChild(titleElem);

                } else {
                    var allowedValues = this.eventAlbum.getEvent(dataName).metadata.allowedValues;
                    var eventStats = this.eventStats[dataName];

                    var startDegrees = 0;
                    var colorMapper = this.colorMappers[ringName];
                    if (ringName === "expression data") {
                        var eventId = dataName;
                        colorMapper = this.colorMappers[eventId];
                    };
                    this.sortedSamples.forEach(function(val, idx, arr) {
                        var sampleName = val;
                        var hexColor;

                        var score = null;
                        if ( sampleName in ringData) {
                            var score = ringData[sampleName];
                            if ((eventStats != null) && (ringName !== "expression data")) {
                                // assign color for numerical data
                                hexColor = getHexColor(score, eventStats['min'], eventStats['max']);
                            } else {
                                // assign color categorical data
                                hexColor = colorMapper(score);
                            }
                        }

                        var arc = createD3Arc(innerRadius, innerRadius + ringThickness, startDegrees, startDegrees + degreeIncrements);
                        var pathElem = document.createElementNS(utils.svgNamespaceUri, 'path');

                        // TODO aaa
                        utils.setElemAttributes(pathElem, {
                            'd' : arc(),
                            'fill' : hexColor,
                            'sampleName' : sampleName,
                            'score' : score
                        });

                        // additional interactive features
                        if (interactive) {
                            // tooltip for arc
                            score = (utils.isNumerical(score)) ? score.toFixed(3) : score;
                            var titleText = "sample " + sampleName + "'s " + ringName + " score for " + feature + " is " + score + ".";
                            var titleElem = document.createElementNS(utils.svgNamespaceUri, "title");
                            titleElem.innerHTML = titleText;
                            pathElem.appendChild(titleElem);

                            pathElem.onclick = function() {
                                testCallback(this);
                            };
                        }

                        ringGroupElem.appendChild(pathElem);

                        // clockwise from 12 o clock
                        startDegrees = startDegrees + degreeIncrements;
                    });
                }

                innerRadius = innerRadius + ringThickness;
            }

            // add a label
            // circleMapGroup.append("svg:text").attr("text-anchor", "middle").attr('dy', ".35em").text(feature);

            return circleMapGroup;
        };

        /**
         * Generate an svg:group DOM element to be appended to an svg element.
         */
        this.generateCircleMapSvgGElem_legend = function(radius, interactive) {
            var feature = "legend";
            var interactive = interactive || false;
            var ringsList = this.cmgParams['ringsList'];

            var fullRadius = ( typeof radius === 'undefined') ? 100 : radius;

            // var expressionEventIds = this.eventAlbum.getEventIdsByType()['expression data'];
            var numDatasets = ringsList.length;

            // +1 for the center
            var ringThickness = fullRadius / (numDatasets + 1);
            var innerRadius = ringThickness;

            var usedAngles = [];

            // arc paths will be added to this SVG group
            var circleMapGroup = document.createElementNS(utils.svgNamespaceUri, 'g');
            utils.setElemAttributes(circleMapGroup, {
                'class' : 'circleMapG',
                "feature" : feature
            });

            // white palete
            circleMapGroup.appendChild(utils.createSvgCircleElement(0, 0, fullRadius, {
                "fill" : "white"
            }));

            // node centers
            var fill;
            if (_.isUndefined(this.cmgParams["centerScores"]) || (_.keys(this.cmgParams["centerScores"]).length == 0 )) {
                // no node center
            } else {
                var centerScore = this.cmgParams["centerScores"][feature];
                if (_.isUndefined(centerScore)) {
                    // check if node center data exists
                    fill = "grey";
                } else {
                    // color center
                    fill = getHexColor(centerScore);
                }
                var centerCircleElem = utils.createSvgCircleElement(0, 0, ringThickness, {
                    "fill" : fill
                });
                // additional interactive features
                if (interactive) {
                    // tooltip for node center
                    if (_.isUndefined(centerScore)) {
                        centerScore = "N/A";
                    } else {
                        // use centerScore
                    }
                    var titleText = "node center score for " + feature + ": " + centerScore;
                    var titleElem = document.createElementNS(utils.svgNamespaceUri, "title");
                    titleElem.innerHTML = titleText;
                    centerCircleElem.appendChild(titleElem);
                }

                circleMapGroup.appendChild(centerCircleElem);
            }

            /**
             * convert radial position to x,y position.
             */
            var radialPos2xyPos = function(radius, angle) {
                var pos = {};

                var radians = utils.toRadians(angle);
                var oppo = radius * Math.sin(radians);
                var adj = radius * Math.cos(radians);

                pos["x"] = oppo;
                pos["y"] = adj;

                return pos;
            };

            // TODO addLegendScoreArcs
            var addLegendScoreArcs = function(scores, ringGroupElem, colorMapper, innerRadius, ringThickness, ringName, isContinuousScore, ringNamePosition, additionalPathElemAttribs) {
                var startDegrees = 0;
                var degreeIncrements = (360 / scores.length);
                var pathElemAttribs = (_.isUndefined(additionalPathElemAttribs)) ? {} : additionalPathElemAttribs;

                var labelledScoreIndices = [];
                labelledScoreIndices.push(0);
                labelledScoreIndices.push(scores.length - 1);
                labelledScoreIndices.push(scores.length - 2);
                labelledScoreIndices.push(Math.floor((scores.length - 1) / 2));

                _.each(scores, function(score) {
                    var scoresIndex = _.indexOf(scores, score);

                    // arc
                    var color = colorMapper(score);
                    var arc = createD3Arc(innerRadius, innerRadius + ringThickness, startDegrees, startDegrees + degreeIncrements);
                    var pathElem = document.createElementNS(utils.svgNamespaceUri, 'path');

                    pathElemAttribs["d"] = arc();
                    pathElemAttribs["fill"] = color;

                    utils.setElemAttributes(pathElem, pathElemAttribs);
                    ringGroupElem.appendChild(pathElem);

                    var labelGroupElem = document.createElementNS(utils.svgNamespaceUri, 'g');
                    ringGroupElem.appendChild(labelGroupElem);

                    // label swatch
                    if ((isContinuousScore == false) || (_.contains(labelledScoreIndices, scoresIndex))) {
                        var angle = Math.floor(startDegrees + (degreeIncrements / 2));
                        while (_.contains(usedAngles, angle)) {
                            angle = Math.floor(angle + 3);
                            if (angle >= startDegrees + degreeIncrements) {
                                angle = Math.floor(startDegrees + 3);
                            }
                        }
                        usedAngles.push(angle);

                        var xyPos1 = radialPos2xyPos(innerRadius + (ringThickness * (2 / 3)), angle);

                        var xyPos = radialPos2xyPos(innerRadius + (80), angle);
                        // var testElem = utils.createSvgRectElement(xyPos["x"] - 4.5, -xyPos["y"] - 4.5, 0, 0, 9, 9, {
                        // "fill" : color
                        // // "stroke" : "black"
                        // });
                        // labelGroupElem.appendChild(testElem);

                        // label line
                        var lineElem = document.createElementNS(utils.svgNamespaceUri, 'line');
                        var lineAttribs = {
                            "stroke" : "darkgray",
                            "x1" : xyPos1["x"],
                            "y1" : -xyPos1["y"],
                            "x2" : xyPos["x"],
                            "y2" : -xyPos["y"]
                        };
                        utils.setElemAttributes(lineElem, lineAttribs);
                        labelGroupElem.appendChild(lineElem);

                        // label text
                        var legendLabelElem = document.createElementNS(utils.svgNamespaceUri, 'text');
                        var labelAttribs = {
                            "fill" : "black",
                            "font-size" : "8",
                            "dx" : xyPos["x"],
                            "dy" : -xyPos["y"]
                        };
                        if (xyPos["x"] < 0) {
                            labelAttribs["text-anchor"] = "end";
                        }
                        utils.setElemAttributes(legendLabelElem, labelAttribs);
                        legendLabelElem.innerHTML = score;
                        labelGroupElem.appendChild(legendLabelElem);
                    }

                    // additional interactive features
                    // tooltip for arc
                    // score = (utils.isNumerical(score)) ? score.toFixed(3) : score;
                    var titleText = score + " value for " + ringName + " data";
                    var titleElem = document.createElementNS(utils.svgNamespaceUri, "title");
                    titleElem.innerHTML = titleText;
                    pathElem.appendChild(titleElem);

                    // clockwise from 12 o clock
                    startDegrees = startDegrees + degreeIncrements;
                });

                // add ringName label
                var angle = 360 * ringNamePosition;
                while (_.contains(usedAngles, angle)) {
                    angle = Math.floor(angle + 3);
                }
                usedAngles.push(angle);
                var xyPos1 = radialPos2xyPos(innerRadius + (ringThickness * 0.5), angle);
                var xyPos2 = radialPos2xyPos(innerRadius + 100, angle);

                var lineElem = document.createElementNS(utils.svgNamespaceUri, 'line');
                var lineAttribs = {
                    "stroke" : "darkgray",
                    "stroke-width" : 2,
                    "x1" : xyPos1["x"],
                    "y1" : -xyPos1["y"],
                    "x2" : xyPos2["x"],
                    "y2" : -xyPos2["y"]
                };
                utils.setElemAttributes(lineElem, lineAttribs);
                ringGroupElem.appendChild(lineElem);

                var legendLabelElem = document.createElementNS(utils.svgNamespaceUri, 'text');
                var labelAttribs = {
                    "fill" : "black",
                    "font-size" : "10",
                    "dx" : xyPos2["x"],
                    "dy" : -xyPos2["y"]
                };
                if (xyPos2["x"] < 0) {
                    labelAttribs["text-anchor"] = "end";
                }
                utils.setElemAttributes(legendLabelElem, labelAttribs);
                legendLabelElem.innerHTML = ringName + " ring";
                ringGroupElem.appendChild(legendLabelElem);
            };

            // iterate over rings
            for (var i = 0, lengthi = ringsList.length; i < lengthi; i++) {
                var ringName = ringsList[i];
                var dataName = null;

                var ringNamePosition = (i + 1) / (lengthi + 2);

                // find data name suffix at runtime
                if ( ringName in this.eventAlbum.datatypeSuffixMapping && (this.eventAlbum.datatypeSuffixMapping[ringName] !== "")) {
                    dataName = feature + this.eventAlbum.datatypeSuffixMapping[ringName];
                } else {
                    dataName = ringName;
                }

                var ringGroupElem = document.createElementNS(utils.svgNamespaceUri, 'g');
                utils.setElemAttributes(ringGroupElem, {
                    'class' : ringName,
                    'ringName' : ringName,
                    'dataName' : dataName
                });
                circleMapGroup.appendChild(ringGroupElem);

                var ringData = this.getRingData(dataName);

                // determine numeric, categoric, mutation, etc.
                var eventObj = this.eventAlbum.getEvent(dataName);
                if (_.isUndefined(eventObj)) {
                    // console.log("no eventObj for", dataName);
                    // var sampleNum = this.sortedSamples.length;
                    var sampleNum = 20;

                    var simulatedScores = [-1, 0, 1];
                    for (var k = 1, lengthk = sampleNum / 2; k < lengthk; k++) {
                        var simulatedScore = k * (1 / lengthk);
                        simulatedScore = simulatedScore.toPrecision(2);
                        simulatedScores.push(simulatedScore);
                        simulatedScores.push(-1 * simulatedScore);
                    }
                    simulatedScores = simulatedScores.sort(function(a, b) {
                        return (a - b);
                    });
                    simulatedScores.push("no data");

                    var isContinuousScore = true;

                    addLegendScoreArcs(simulatedScores, ringGroupElem, getHexColor, innerRadius, ringThickness, ringName, isContinuousScore, ringNamePosition);
                } else {
                    // console.log("got an eventObj for", dataName);
                    var scores = eventObj.data.getValues(true);
                    var colorMapper = this.colorMappers[dataName];

                    var isContinuousScore = false;

                    addLegendScoreArcs(scores, ringGroupElem, colorMapper, innerRadius, ringThickness, ringName, isContinuousScore, ringNamePosition);
                }

                innerRadius = innerRadius + ringThickness;
            }

            // reorder placement of circleMapRingG elems
            var revRingsList = ringsList.slice();
            revRingsList.reverse();
            _.each(revRingsList, function(ringName) {
                var elem = circleMapGroup.getElementsByClassName(ringName)[0];
                utils.pullElemToFront(elem);
            });

            return circleMapGroup;
        };

        /**
         * Wrapper for building SVGs
         */
        this.generateCircleMapSvgGElemWrapper = function(feature, radius, interactive) {
            var svgGElem;
            if (feature === "legend") {
                svgGElem = this.generateCircleMapSvgGElem_legend(radius, interactive);
            } else {
                svgGElem = this.generateCircleMapSvgGElem(feature, radius, interactive);
            }
            return svgGElem;
        };

        /**
         *Get a data URI for the circleMap svg.
         */
        this.getCircleMapDataUri = function(feature) {
            var radius = 100;

            var svgGElem = this.generateCircleMapSvgGElemWrapper(feature, radius);

            var svgTagOpen = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (-1 * radius) + ' ' + (-1 * radius) + ' ' + (2 * radius) + ' ' + (2 * radius) + '">';
            var stringifiedSvg = svgTagOpen + svgGElem.outerHTML + '</svg>';

            var dataURI = 'data:image/svg+xml;utf8,' + encodeURIComponent(stringifiedSvg);

            return dataURI;
        };

        /**
         * This is the only outward-facing method in this object.
         * draws a CircleMap via d3.js.
         * handles multiple rings.
         * @param {Object} feature
         * @param {Object} d3SvgTagElement
         * @param {Object} radius
         * @param {Object} interactive  boolean to include additional interactive features
         */
        this.drawCircleMap = function(feature, d3SvgTagElement, radius, interactive) {
            var interactive = interactive || true;
            var radius = radius || 100;
            var svgGElem = this.generateCircleMapSvgGElemWrapper(feature, radius, interactive);

            var svgElem = document.createElementNS(utils.svgNamespaceUri, 'svg');
            // svgElem.setAttributeNS('null', 'xmlns', 'http://www.w3.org/2000/svg');
            utils.setElemAttributes(svgElem, {
                // 'xmlns' : utils.svgNamespaceUri,
                // 'viewBox' : (-1 * fullRadius) + ' ' + (-1 * fullRadius) + ' ' + (2 * fullRadius) + ' ' + (2 * fullRadius),
                'id' : 'circleMapSvg' + feature,
                'class' : 'circleMapSvg',
                'name' : feature
            });
            svgElem.appendChild(svgGElem);

            utils.extractFromD3(d3SvgTagElement).appendChild(svgElem);

            return svgElem;
        };
    };

})(circleMapGenerator);
 // end of circleMapGenerator.js
 // end of circleMapGenerator.js
/**
 * circleMapGraph.js
 * chrisw
 *
 * Draw CircleMap network graph
 * requires:
 * 1) jquery
 * 2) jquery-contexmenu <https://medialize.github.io/jQuery-contextMenu/>
 * 3) d3.js
 * 4) jstat
 * 5) utils.js
 * 6) OD_eventData
 * 7) graphData
 * 8) medbook_data_load
 * 9) circleMapGenerator
 * 10) WebCola layout package <https://github.com/tgdwyer/WebCola>
 * 11) underscore
 */

// http://bl.ocks.org/mbostock/929623 shows a nice way to build a graph with intuitive controls.
// bl.ocks.org/rkirsling/5001347

// expose utils to meteor
u = ( typeof u === "undefined") ? utils : u;
// expose circleMapGraph to meteor
circleMapGraph = ( typeof circleMapGraph === "undefined") ? {} : circleMapGraph;
// var circleMapGraph = circleMapGraph || {};
(function(cmGraph) {"use strict";

    var htmlUri = utils.htmlUri;
    var svgNamespaceUri = utils.svgNamespaceUri;
    var xlinkUri = utils.xlinkUri;

    var sbgn_config = {
        'macromoleculeTypes' : ['macromolecule', 'protein', 'gene', 'mrna', 'mirna', 'shrna', 'dna', 'transcription factor'],
        'nucleicAcidFeatureTypes' : ['nucleic acid feature', 'promoter'],
        'unspecifiedEntityTypes' : ['unspecified entity', 'family', 'abstract'],
        'simpleChemicalTypes' : ['simple chemical', 'small molecule'],
        'perturbingAgentTypes' : ['perturbing agent'],
        'complexTypes' : ['complex'],
        'selectableEntityTypes' : ['unspecified entity', 'protein', 'gene', 'mRNA', 'miRNA', 'nucleic acid feature', 'small molecule', 'perturbing agent', 'complex'],
        'edgeTypeOptions' : ['stop adding edges', 'positive regulation', 'negative regulation', 'activate transcription', 'inhibit transcription', 'component of', 'member of'],
        'edgeTypeSymbols' : ['stop adding edges', '-a>', '-a|', '-t>', '-t|', 'component>', 'member>']
    };

    var d3_config = {
        // vars for d3.layout.force
        'linkDistance' : 120,
        'linkStrength' : 0.2,
        'friction' : 0.8,
        'charge' : -500,
        'gravity' : 0.03,
        'nodeRadius' : 20
    };

    cmGraph.largeScale = 'scale(2)';
    cmGraph.smallScale = 'scale(0.3)';

    cmGraph.containerDivElem = null;
    cmGraph.graphDataObj = null;
    cmGraph.circleMapGeneratorObj = null;
    cmGraph.circleMapMode = false;

    cmGraph.svgElem = null;
    cmGraph.colorMapper = null;
    cmGraph.force = null;

    cmGraph.setNewCircleMapGeneratorSettings = function(newSettings) {
        for (var key in newSettings) {
            cmGraph.circleMapGeneratorObj.cmgParams[key] = newSettings[key];
        }
        cmGraph.circleMapGeneratorObj.sortSamples();
    };

    cmGraph.build = function(config) {
        // graph data
        var graphDataObj = new graphData.graphData();
        if (config.hasOwnProperty("medbookGraphData")) {
            var medbookGraphData = config["medbookGraphData"];
            graphDataObj.readMedbookGraphData(medbookGraphData);
        } else if (config.hasOwnProperty("sifGraphData")) {
            var sifGraphData = config["sifGraphData"];
            graphDataObj.readSif(sifGraphData);
        }

        // event data
        var eventAlbum;
        if (utils.hasOwnProperty(config, "eventAlbum")) {
            eventAlbum = config["eventAlbum"];
        } else {
            eventAlbum = new eventData.OD_eventAlbum();
        }

        // ring ordering
        var ringsList;
        if (utils.hasOwnProperty(config, "ringsList")) {
            ringsList = config["ringsList"];
        } else {
            ringsList = [];
        }

        // node center scores is a dict of nodeName:score
        var centerScores;
        if (utils.hasOwnProperty(config, "centerScores")) {
            centerScores = config["centerScores"];
            console.log("centerScores", centerScores);
        } else {
            centerScores = {};
        }

        // expression data
        if (utils.hasOwnProperty(config, "medbookExprData")) {
            medbookDataLoader.mongoExpressionData(config["medbookExprData"], eventAlbum);
            ringsList.push("expression data");
        }

        // medbookViperSignaturesData
        if (utils.hasOwnProperty(config, "medbookViperSignaturesData")) {
            var medbookViperSignaturesData = config["medbookViperSignaturesData"];
            // console.log("medbookViperSignaturesData", medbookViperSignaturesData);
            medbookDataLoader.mongoViperSignaturesData(medbookViperSignaturesData, eventAlbum);
            ringsList.push("viper data");
        }

        // new circle map generator
        var cmg = new circleMapGenerator.circleMapGenerator(eventAlbum, {
            // "ringsList" : ["core_subtype", "expression data", 'viper data'],
            // "orderFeature" : ["expression data"]
            "ringsList" : ringsList,
            "centerScores" : centerScores
        });

        var circleDataLoaded;
        if (ringsList.length < 1) {
            circleDataLoaded = false;
        } else {
            circleDataLoaded = config["circleDataLoaded"];
        }

        cmGraph.buildCircleMapGraph(config["containerDiv"], graphDataObj, cmg, circleDataLoaded);
    };

    /**
     * One method call to build the graph
     */
    cmGraph.buildCircleMapGraph = function(containerDivElem, graphDataObj, circleMapGeneratorObj, circleMapMode) {
        // set object properties
        cmGraph.containerDivElem = containerDivElem;
        cmGraph.graphDataObj = graphDataObj;
        cmGraph.circleMapGeneratorObj = circleMapGeneratorObj;
        cmGraph.circleMapMode = circleMapMode;

        cmGraph.setup();

        // render graph
        var svg = cmGraph.svgElem;
        var force = cmGraph.force;
        var graph = cmGraph.graphDataObj;
        var cmg = cmGraph.circleMapGeneratorObj;
        var circleDataLoaded = cmGraph.circleMapMode;
        cmGraph.renderGraph(svg, force, graph, cmg, circleDataLoaded);
    };

    /**
     * Initialization steps
     */
    cmGraph.setup = function() {
        // context menu
        // uses medialize's jQuery-contextMenu
        $.contextMenu({
            selector : ".circleMapRingG",
            trigger : 'right',
            // trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
                console.log('elem', elem);
            },
            build : function($trigger, contextmenuEvent) {
                console.log("context menu for circleMapRingG");
                var circleMapRingGelem = utils.extractFromJq($trigger);
                var circleMapGelem = circleMapRingGelem.parentNode;
                var node = circleMapGelem.getAttribute("feature");
                var datasetName = circleMapRingGelem.getAttribute("ringName");
                var items = {
                    'title' : {
                        name : function() {
                            return "ring: " + datasetName + " for " + node;
                        },
                        icon : null,
                        disabled : true
                        // ,
                        // callback : function(key, opt) {
                        // }
                    },
                    "sep1" : "---------",
                    "sort_samples" : {
                        name : function() {
                            return "sort samples by this ring";
                        },
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            // clear circlemaps
                            cmGraph.clearCircleMaps();

                            // Sorting is performed via eventAlbum.multisortSamples().
                            // It uses sortingStep objects to specify the events on which to base the sort.

                            // Using something like "SUZ12" and "expression data" sort by SUZ12_mRNA event.

                            // set sorting ring
                            var orderFeature = cmGraph.circleMapGeneratorObj.eventAlbum.getSuffixedEventId(node, datasetName);

                            // if no suffix added, then use datatype as orderFeature (e.g. a categorical clinical feature)
                            orderFeature = (orderFeature === node) ? datasetName : orderFeature;
                            cmGraph.setNewCircleMapGeneratorSettings({
                                "orderFeature" : orderFeature,
                                "sortingRing" : [datasetName]
                            });

                            // attach new circlemaps
                            cmGraph.attachCircleMaps();
                        }
                    }
                };
                return {
                    'items' : items
                };
            }
        });

        $.contextMenu({
            selector : ".node",
            trigger : 'right',
            // trigger : 'left',
            callback : function(key, options) {
                // default callback
                var elem = this[0];
                console.log('elem', elem);
            },
            build : function($trigger, contextmenuEvent) {
                console.log("context menu for node");
                var circleMapSvgElem = utils.extractFromJq($trigger).getElementsByTagName("svg")[0];
                var nodeName = circleMapSvgElem.getAttribute("name");
                var nodeType = circleMapSvgElem.getAttribute("nodeType");
                var items = {
                    'title' : {
                        name : function() {
                            return nodeType + ": " + nodeName;
                        },
                        icon : null,
                        disabled : function(key, opt) {
                            var disabled = (nodeType === "protein") ? false : true;
                            return disabled;
                        },
                        callback : function(key, opt) {
                            // TODO link-out to PatientCare geneReport
                            console.log("nodeName", nodeName);
                            window.open("/PatientCare/geneReport/" + nodeName, "_parent");
                        }
                    },
                    "sep1" : "---------",
                    "toggle_size" : {
                        name : function() {
                            return "toggle node size";
                        },
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            if (cmGraph.circleMapMode) {
                                // var circleMapSvgElem = document.getElementById('circleMapSvg' + d['name']);
                                var circleMapGElement = circleMapSvgElem.getElementsByClassName("circleMapG")[0];
                                var d3circleMapGElement = d3.select(circleMapGElement);
                                var zoomed = d3circleMapGElement.attr("zoomed");
                                var newScale;
                                if (_.isNull(zoomed) || zoomed === "false") {
                                    newScale = cmGraph.largeScale;
                                    d3circleMapGElement.attr("zoomed", "true");
                                } else {
                                    newScale = cmGraph.smallScale;
                                    d3circleMapGElement.attr("zoomed", "false");
                                }
                                d3circleMapGElement.transition().duration(300).attr('transform', newScale);
                            }
                        }
                    },
                    "pin_fold" : {
                        name : "pinning",
                        items : {
                            'toggle_pin' : {
                                name : function() {
                                    return "toggle pin this node";
                                },
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    d3.select(utils.extractFromJq($trigger)).each(function(d, i) {
                                        d.fixed = !d.fixed;
                                    });
                                }
                            },
                            'pin_all' : {
                                name : "pin all nodes",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    d3.selectAll(".node").each(function(d, i) {
                                        d.fixed = true;
                                    });
                                    cmGraph.force.stop();
                                }
                            },
                            'free_all' : {
                                name : "unpin all nodes",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    d3.selectAll(".node").each(function(d, i) {
                                        d.fixed = false;
                                    });
                                    cmGraph.force.start();
                                }
                            },
                            "neighbors_test" : {
                                name : "unpin neighbors",
                                icon : null,
                                disabled : false,
                                callback : function(key, opt) {
                                    var nodeDataObjs = cmGraph.graphDataObj.getNeighbors(nodeName, 1);
                                    for (var i = 0, length = nodeDataObjs.length; i < length; i++) {
                                        nodeDataObjs[i].fixed = false;
                                    }
                                }
                            }
                        }
                    },

                    'toggle_opacity' : {
                        name : "toggle opacity",
                        icon : null,
                        disabled : false,
                        callback : function(key, opt) {
                            var circleMapGElement = circleMapSvgElem.getElementsByClassName("circleMapG")[0];
                            var d3circleMapGElement = d3.select(circleMapGElement);

                            var isTransparent = d3circleMapGElement.attr("isTransparent");
                            var newOpacity;
                            if (_.isNull(isTransparent) || isTransparent === "false") {
                                if (_.isNull(isTransparent)) {
                                    d3circleMapGElement.attr("opacity", 1);
                                }
                                newOpacity = 0.3;
                                d3circleMapGElement.attr("isTransparent", "true");
                            } else {
                                newOpacity = 1;
                                d3circleMapGElement.attr("isTransparent", "false");
                            }
                            d3circleMapGElement.transition().duration(500).attr("opacity", newOpacity);
                        }
                    }
                };
                return {
                    'items' : items
                };
            }
        });

        // clear container div element
        utils.removeChildElems(cmGraph.containerDivElem);

        // outer SVG element
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        cmGraph.svgElem = d3.select(cmGraph.containerDivElem).append("svg").attr({
            // TODO need to get better dimensions
            'width' : windowWidth,
            'height' : windowHeight,
            'id' : 'circleMaps'
        });

        // styling the outer svg element
        cmGraph.svgElem.style({
            "font-family" : "Verdana",
            "background-color" : "#FFF",
            "-webkit-user-select" : "none",
            "-moz-user-select" : "none",
            "-ms-user-select" : "none",
            "-o-user-select" : "none",
            "user-select" : "none"
        });

        // http://www.w3.org/TR/SVG/painting.html#MarkerElement
        var defsElem = cmGraph.svgElem.append('defs');
        cmGraph.addMarkerDefs(defsElem);

        cmGraph.svgElem.append('g').attr({
            id : 'linkLayer'
        });
        cmGraph.svgElem.append('g').attr({
            id : 'nodeLayer'
        });

        // for d3 color mapping.
        cmGraph.colorMapper = d3.scale.category10();
        // preset color mapping for paradigm relations
        var paradigmRelations = ["-t|", "-t>", "-a|", "-a>", "component>", "member>"];
        _.each(paradigmRelations, function(relation) {
            cmGraph.colorMapper(relation);
        });

        // for d3 layout and rendering
        // cmGraph.force = d3.layout.force().size([windowWidth, windowHeight]).linkDistance(d3_config['linkDistance']).linkStrength(d3_config['linkStrength']).friction(d3_config['friction']).gravity(d3_config['gravity']);

        // using cola layout package with d3 adapter
        // var d3cola = cola.d3adaptor().linkDistance(30).size([width, height]);
        cmGraph.force = cola.d3adaptor().linkDistance(d3_config['linkDistance']).size([windowWidth, windowHeight]);

        // add legend node
        cmGraph.graphDataObj.addNode({
            "name" : "legend",
            "group" : "legend",
            // to set starting position, set fixed to true and provide (x,y)
            "fixed" : true,
            "x" : 50,
            "y" : 50
        });

        var legendG = document.createElementNS(utils.svgNamespaceUri, 'g');
        utils.setElemAttributes(legendG, {
            "id" : "legendG"
        });

        cmGraph.svgElem.append(function() {
            return legendG;
        });

        var d3LegendG = d3.select(legendG);

        var legendBackground = d3LegendG.append("rect").attr({
            "id" : "legendBackground"
            // ,
            // "width" : 20,
            // "height" : 20
        }).style({
            "stroke-width" : 0.5,
            "stroke" : "black",
            "fill" : "white"
        });

        var relations = cmGraph.graphDataObj.getRelations();
        _.each(relations, function(relation, index) {
            var y = 10 + 25 * index;
            var x = 0;
            var length = 75;
            var lineElem = d3LegendG.append("line").attr({
                "x1" : x,
                "y1" : y,
                "x2" : x + length,
                "y2" : y
            });
            var decorations = cmGraph.getLinkDecorations(relation, 3);
            lineElem.style(decorations);

            var textElem = d3LegendG.append("text").attr({
                "x" : x + length,
                "y" : y,
                "dx" : "1em",
                "dy" : "0.3em",
                "text-anchor" : "start"
            }).style({
                "stroke" : "darkslategrey",
                "fill" : "darkslategrey",
                "overflow" : "visible"
            }).text(function() {
                var displayNames = {
                    "-t|" : "inhibit transcription",
                    "-t>" : "activate transcription",
                    "-a|" : "inhibit activity",
                    "-a>" : "activate activity",
                    "component>" : "component",
                    "member>" : "member"
                };
                var displayName = displayNames[relation];
                if (_.isUndefined(displayName)) {
                    return relation;
                } else {
                    return displayName;
                }
            });
        });

        // set dimensions
        // element must be attached to the document to get brect
        var brect = legendG.getBoundingClientRect();
        legendBackground.attr({
            "width" : brect.width,
            "height" : brect.height
        });

        // dragging
        var drag = d3.behavior.drag();
        d3LegendG.call(drag);

        drag.origin(function() {
            // d3.event.sourceEvent.preventDefault();
            // d3.event.sourceEvent.stopPropagation();
            var d3Mouse = d3.mouse(cmGraph.svgElem.node());
            var origin = {
                "x" : d3Mouse[0],
                "y" : d3Mouse[1]
            };
            return origin;
        });

        drag.on("drag", function() {
            d3.event.sourceEvent.preventDefault();
            d3.event.sourceEvent.stopPropagation();
            var d3Mouse = d3.mouse(cmGraph.svgElem.node());
            var x = d3Mouse[0];
            var y = d3Mouse[1];
            d3LegendG.attr({
                "transform" : "translate(" + x + "," + y + ")"
            });
        });
    };

    // addMarkerDefs
    // SVG 2 may allow setting fill="context-stroke" to match parent element
    // https://svgwg.org/svg2-draft/painting.html#VertexMarkerProperties
    cmGraph.addMarkerDefs = function(d3svgDefsElem) {
        var offset = 34;

        var marker = d3svgDefsElem.append("marker").attr({
            id : "Triangle",
            viewBox : "0 0 10 10",
            refX : 10 + offset,
            refY : "5",
            // markerUnits : "strokeWidth",
            markerUnits : "userSpaceOnUse",
            markerWidth : "9",
            markerHeight : "9",
            orient : "auto"
        });
        marker.append("path").attr({
            d : "M 0 0 L 10 5 L 0 10 z"
        });

        marker = d3svgDefsElem.append("marker").attr({
            id : "Bar",
            viewBox : "0 0 10 10",
            refX : 3 + offset,
            refY : "5",
            // markerUnits : "strokeWidth",
            markerUnits : "userSpaceOnUse",
            markerWidth : "9",
            markerHeight : "9",
            orient : "auto"
        });
        marker.append("path").attr({
            d : "M 0 0 L 0 10 L 3 10 L 3 0 z"
        });

        marker = d3svgDefsElem.append("marker").attr({
            id : "Circle",
            viewBox : "0 0 10 10",
            refX : 10 + offset,
            refY : "5",
            // markerUnits : "strokeWidth",
            markerUnits : "userSpaceOnUse",
            markerWidth : "9",
            markerHeight : "9",
            orient : "auto"
        });
        marker.append("circle").attr({
            cx : 5,
            cy : 5,
            r : 5
        });
    };

    /**
     *Draw circleMap SVGs and attach to the node layer.
     */
    cmGraph.drawCircleMaps = function(nodeNames, d3SvgNodeLayer, radius, additionalInteraction) {
        for (var i in nodeNames) {
            var feature = nodeNames[i];
            var circleMapElement = cmGraph.circleMapGeneratorObj.drawCircleMap(feature, d3SvgNodeLayer, radius, additionalInteraction);
        }
    };

    /**
     * Remove all circleMap SVG group elements.
     */
    cmGraph.clearCircleMaps = function() {
        d3.select('#nodeLayer').selectAll('.circleMapG').remove();
    };

    cmGraph.attachCircleMaps = function() {
        var svgNodeLayer = d3.select('#nodeLayer');
        var radius = 100;
        var interactive = true;
        var circleMapSvgSelection = svgNodeLayer.selectAll(".node").selectAll(".circleMapSvg");
        circleMapSvgSelection.each(function(d, i) {
            var feature = d.name;
            var svgGElem = cmGraph.circleMapGeneratorObj.generateCircleMapSvgGElemWrapper(feature, radius, interactive);
            svgGElem.setAttributeNS(null, 'transform', cmGraph.smallScale);
            this.appendChild(svgGElem);
        });
    };

    /**
     * Get style properties for use as link decorations.
     * @param {Object} relationType
     */
    cmGraph.getLinkDecorations = function(relationType, value) {
        var styles = {};
        // marker-end
        if (utils.beginsWith(relationType, "-") && utils.endsWith(relationType, ">")) {
            styles["marker-end"] = "url(#Triangle)";
        } else if (utils.beginsWith(relationType, "-") && utils.endsWith(relationType, "|")) {
            styles["marker-end"] = "url(#Bar)";
        } else if (utils.beginsWith(relationType, "component") && utils.endsWith(relationType, ">")) {
            styles["marker-end"] = "url(#Circle)";
        }
        // stroke-dasharray
        if (utils.beginsWith(relationType, "-a")) {
            styles["stroke-dasharray"] = "6,3";
        }

        styles["stroke"] = cmGraph.colorMapper(relationType);
        styles["stroke-width"] = (value);
        styles["stroke-opacity"] = 0.6;

        return styles;
    };

    // requires svg, force, graph, cmg, circleDataLoaded, and various constants
    cmGraph.renderGraph = function(svg, force, graph, cmg, circleDataLoaded) {

        // clear the current graph
        var removedLinks = svg.selectAll(".link").remove();
        var removedNodes = svg.selectAll(".node").remove();

        if (graph.nodes.length < 1) {
            return;
        }

        // reset circleMapSvg class elements by creating circleMap elements for each query feature.
        var svgNodeLayer = svg.select('#nodeLayer');
        var nodeNames = graph.getAllNodeNames();
        if (circleDataLoaded) {
            cmGraph.drawCircleMaps(nodeNames, svgNodeLayer, 100, true);
        }

        // links
        var svgLinkLayer = svg.select('#linkLayer');
        var linkSelection = svgLinkLayer.selectAll(".link").data(graph.links).enter().append("line").attr('id', function(d, i) {
            return 'link' + i;
        }).attr({
            'class' : "link"
        }).style("stroke", function(d) {
            return cmGraph.colorMapper(d.relation);
        }).style("stroke-opacity", ".6");

        // initial setting of decoration styles
        linkSelection.style('marker-end', function(d, i) {
            var type = d.relation;
            if (type === "component>") {
                return "url(#Circle)";
            } else if (utils.beginsWith(type, "-") && utils.endsWith(type, ">")) {
                return "url(#Triangle)";
            } else if (utils.beginsWith(type, "-") && utils.endsWith(type, "|")) {
                return "url(#Bar)";
            } else {
                return null;
            }
        });

        linkSelection.style("stroke-width", function(d) {
            return d.value;
        });

        // http://www.w3.org/TR/SVG/painting.html#StrokeProperties
        linkSelection.style("stroke-dasharray", function(d, i) {
            var type = d.relation;
            if (utils.beginsWith(type, "-a")) {
                return "6,3";
            } else {
                return null;
            }
        });

        // mouse events for links - thicken on mouseover
        linkSelection.on('mouseover', function(d, i) {
            // mouseover event for link
            var linkElement = document.getElementById('link' + i);
            var decorations = cmGraph.getLinkDecorations(d.relation, d.value * 3);
            var styleString = "";

            for (var key in decorations) {
                var val = decorations[key];
                styleString = styleString + ";" + key + ":" + val;
            }

            linkElement.setAttributeNS(null, 'style', styleString);
        }).on('mouseout', function(d, i) {
            // mouseout event for link
            var linkElement = document.getElementById('link' + i);
            var decorations = cmGraph.getLinkDecorations(d.relation, d.value);
            var styleString = "";

            for (var key in decorations) {
                var val = decorations[key];
                styleString = styleString + ";" + key + ":" + val;
            }

            linkElement.setAttributeNS(null, 'style', styleString);
        });

        // nodes
        var nodeSelection = svgNodeLayer.selectAll(".node").data(graph.nodes).enter().append("g").attr('class', function(d, i) {
            return "node " + d.name + ' ' + d.group;
        });

        if (circleDataLoaded) {
            // mouse events for circleMap nodes
            nodeSelection.each(function(d) {
                // add attribute to the node data
                var circleMapSvgElement = document.getElementById('circleMapSvg' + d['name']);
                circleMapSvgElement.setAttributeNS(null, "nodeType", d.group);
                var circleMapGElement = circleMapSvgElement.getElementsByClassName("circleMapG");
                circleMapGElement[0].setAttributeNS(null, 'transform', cmGraph.smallScale);
            }).on('mouseover', function(d, i) {
                // mouseover event for node

                // pull node to front
                var circleMapSvgElement = document.getElementById('circleMapSvg' + d['name']);
                var nodeGelem = circleMapSvgElement.parentNode;
                utils.pullElemToFront(nodeGelem);
            });
        } else {
            // mouse events for sbgn nodes
            nodeSelection.on('mouseover', function(d, i) {
                // mouseover event for node
                var nodeElement = document.getElementsByClassName("node " + d.name + ' ' + d.group);
                var nodeSbgnElement = nodeElement[0].getElementsByClassName('sbgn');
                nodeSbgnElement[0].setAttributeNS(null, 'style', 'stroke-width:4;fill:' + cmGraph.colorMapper(d.group));
            }).on('mouseout', function(d, i) {
                // mouseout event for node
                var nodeElement = document.getElementsByClassName("node " + d.name + ' ' + d.group);
                var nodeSbgnElement = nodeElement[0].getElementsByClassName('sbgn');
                nodeSbgnElement[0].setAttributeNS(null, 'style', 'stroke-width:1;fill:' + cmGraph.colorMapper(d.group));
            });
        }
        nodeSelection.call(force.drag);

        // node visualization
        var opacityVal = 0.6;
        nodeSelection.append(function(d) {
            var nodeName = d['name'];
            if (d.group === undefined) {
                console.log("d", d);
            }
            var type = d.group.toString().toLowerCase();
            if ((circleDataLoaded ) && (nodeNames.indexOf(nodeName) >= 0)) {
                // circleMap
                var stagedElement = document.getElementById('circleMapSvg' + nodeName);
                return stagedElement;
            } else if (sbgn_config['nucleicAcidFeatureTypes'].indexOf(type) != -1) {
                var newElement = document.createElementNS(svgNamespaceUri, 'path');
                newElement.setAttributeNS(null, 'class', 'sbgn');
                var path = utils.bottomRoundedRectSvgPath(-20, -15, 40, 30, 10);
                newElement.setAttributeNS(null, 'd', path);
                newElement.setAttributeNS(null, 'opacity', opacityVal);
                newElement.setAttributeNS(null, 'stroke', 'black');
                return newElement;
            } else if (sbgn_config['macromoleculeTypes'].indexOf(type) != -1) {
                var newElement = document.createElementNS(svgNamespaceUri, 'path');
                newElement.setAttributeNS(null, 'class', 'sbgn');
                var path = utils.allRoundedRectSvgPath(-20, -15, 40, 30, 10);
                newElement.setAttributeNS(null, 'd', path);
                newElement.setAttributeNS(null, 'opacity', opacityVal);
                newElement.setAttributeNS(null, 'stroke', 'black');
                return newElement;
            } else if (sbgn_config['simpleChemicalTypes'].indexOf(type) != -1) {
                // circle
                var newElement = document.createElementNS(svgNamespaceUri, 'circle');
                newElement.setAttributeNS(null, 'class', 'sbgn');
                newElement.setAttributeNS(null, 'r', nodeRadius);
                newElement.setAttributeNS(null, 'opacity', opacityVal);
                newElement.setAttributeNS(null, 'stroke', 'black');
                return newElement;
            } else if (sbgn_config['complexTypes'].indexOf(type) != -1) {
                var newElement = document.createElementNS(svgNamespaceUri, 'path');
                newElement.setAttributeNS(null, 'class', 'sbgn');
                var path = utils.allAngledRectSvgPath(-50, -30, 100, 60);
                newElement.setAttributeNS(null, 'd', path);
                newElement.setAttributeNS(null, 'opacity', opacityVal);
                newElement.setAttributeNS(null, 'stroke', 'black');
                return newElement;
            } else {
                // unspecified entity
                var newElement = document.createElementNS(svgNamespaceUri, 'ellipse');
                newElement.setAttributeNS(null, 'class', 'sbgn');
                newElement.setAttributeNS(null, 'cx', 0);
                newElement.setAttributeNS(null, 'cy', 0);
                newElement.setAttributeNS(null, 'rx', 1.5 * d3_config['nodeRadius']);
                newElement.setAttributeNS(null, 'ry', 0.75 * d3_config['nodeRadius']);
                newElement.setAttributeNS(null, 'opacity', opacityVal);
                newElement.setAttributeNS(null, 'stroke', 'black');
                return newElement;
            }
        }).style("fill", function(d) {
            return cmGraph.colorMapper(d.group);
        }).style("overflow", "visible");

        // node labels
        // var textdy = "2.7em";
        var textdy = "3em";
        nodeSelection.append("svg:text").attr("text-anchor", "middle").attr('dy', textdy).text(function(d) {
            return d.name;
        }).style({
            "stroke" : "darkslategrey",
            "fill" : "darkslategrey"
        });

        // edge tooltips
        linkSelection.append("title").text(function(d) {
            var sourceNode = cmGraph.graphDataObj.nodes[d.source];
            var targetNode = cmGraph.graphDataObj.nodes[d.target];
            var label = sourceNode.name + " " + d.relation + " " + targetNode.name;
            return label;
        });

        // tick handler repositions graph elements
        force.on("tick", function() {
            var maxAlpha = 0.03;

            // position limits
            var offset = 20;

            var minX = 0 + offset;
            var minY = 0 + offset;

            var maxX = parseFloat(cmGraph.svgElem.attr("width")) - offset;
            var maxY = parseFloat(cmGraph.svgElem.attr("height")) - offset;

            nodeSelection.attr("transform", function(d) {
                d.x = utils.rangeLimit(d.x, minX, maxX);
                d.y = utils.rangeLimit(d.y, minY, maxY);
                return 'translate(' + d.x + ',' + d.y + ')';
            });

            linkSelection.attr("x1", function(d) {
                return d.source.x;
            }).attr("y1", function(d) {
                return d.source.y;
            }).attr("x2", function(d) {
                return d.target.x;
            }).attr("y2", function(d) {
                return d.target.y;
            });

            // don't run the layout indefinitely
            // if (force.alpha() < maxAlpha) {
            // console.log("stop layout with alpha=" + force.alpha());
            //
            // d3.selectAll(".node").each(function(d, i) {
            // d.fixed = true;
            // });
            //
            // force.stop();
            // }
        });

        // set the nodes and links
        force.nodes(graph.nodes).links(graph.links);

        // start the layout
        force.start();
    };

})(circleMapGraph);
 // end of circleMapGraph.js
 // end of circleMapGraph.js
