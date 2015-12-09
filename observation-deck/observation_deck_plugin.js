/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("bloodhound", [ "jquery" ], function(a0) {
            return root["Bloodhound"] = factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root["Bloodhound"] = factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.11.1";
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return $.parseJSON(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + $.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || $.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                sufficient: 5,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            !o.datumTokenizer && $.error("datumTokenizer is required");
            !o.queryTokenizer && $.error("queryTokenizer is required");
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("prefetch requires url to be set");
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("remote requires url to be set");
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = idenityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function idenityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = $.Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = $.Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    async && async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("typeahead.js", [ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var WWW = function() {
        "use strict";
        var defaultClassNames = {
            wrapper: "twitter-typeahead",
            input: "tt-input",
            hint: "tt-hint",
            menu: "tt-menu",
            dataset: "tt-dataset",
            suggestion: "tt-suggestion",
            selectable: "tt-selectable",
            empty: "tt-empty",
            open: "tt-open",
            cursor: "tt-cursor",
            highlight: "tt-highlight"
        };
        return build;
        function build(o) {
            var www, classes;
            classes = _.mixin({}, defaultClassNames, o);
            www = {
                css: buildCss(),
                classes: classes,
                html: buildHtml(classes),
                selectors: buildSelectors(classes)
            };
            return {
                css: www.css,
                html: www.html,
                classes: www.classes,
                selectors: www.selectors,
                mixin: function(o) {
                    _.mixin(o, www);
                }
            };
        }
        function buildHtml(c) {
            return {
                wrapper: '<span class="' + c.wrapper + '"></span>',
                menu: '<div class="' + c.menu + '"></div>'
            };
        }
        function buildSelectors(classes) {
            var selectors = {};
            _.each(classes, function(v, k) {
                selectors[k] = "." + v;
            });
            return selectors;
        }
        function buildCss() {
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                menu: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            return css;
        }
    }();
    var EventBus = function() {
        "use strict";
        var namespace, deprecationMap;
        namespace = "typeahead:";
        deprecationMap = {
            render: "rendered",
            cursorchange: "cursorchanged",
            select: "selected",
            autocomplete: "autocompleted"
        };
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            _trigger: function(type, args) {
                var $e;
                $e = $.Event(namespace + type);
                (args = args || []).unshift($e);
                this.$el.trigger.apply(this.$el, args);
                return $e;
            },
            before: function(type) {
                var args, $e;
                args = [].slice.call(arguments, 1);
                $e = this._trigger("before" + type, args);
                return $e.isDefaultPrevented();
            },
            trigger: function(type) {
                var deprecatedType;
                this._trigger(type, [].slice.call(arguments, 1));
                if (deprecatedType = deprecationMap[type]) {
                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
                }
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        "use strict";
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        "use strict";
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o, www) {
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            www.mixin(this);
            this.$hint = $(o.hint);
            this.$input = $(o.input);
            this.query = this.$input.val();
            this.queryWhenFocused = this.hasFocus() ? this.query : null;
            this.$overflowHelper = buildOverflowHelper(this.$input);
            this._checkLanguageDirection();
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
        }
        Input.normalizeQuery = function(str) {
            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.$hint.attr("dir", dir);
                    this.trigger("langDirChanged", dir);
                }
            },
            _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            bind: function() {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                return this;
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getLangDir: function getLangDir() {
                return this.dir;
            },
            getQuery: function getQuery() {
                return this.query || "";
            },
            setQuery: function setQuery(val, silent) {
                this.setInputValue(val);
                this._setQuery(val, silent);
            },
            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
                return this.query !== this.queryWhenFocused;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value) {
                this.$input.val(value);
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            hasFocus: function hasFocus() {
                return this.$input.is(":focus");
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$overflowHelper.remove();
                this.$hint = this.$input = this.$overflowHelper = $("<div>");
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        "use strict";
        var keys, nameGenerator;
        keys = {
            val: "tt-selectable-display",
            obj: "tt-selectable-object"
        };
        nameGenerator = _.getIdGenerator();
        function Dataset(o, www) {
            o = o || {};
            o.templates = o.templates || {};
            o.templates.notFound = o.templates.notFound || o.templates.empty;
            if (!o.source) {
                $.error("missing source");
            }
            if (!o.node) {
                $.error("missing node");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            www.mixin(this);
            this.highlight = !!o.highlight;
            this.name = o.name || nameGenerator();
            this.limit = o.limit || 5;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
            this._resetLastSuggestion();
            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
        }
        Dataset.extractData = function extractData(el) {
            var $el = $(el);
            if ($el.data(keys.obj)) {
                return {
                    val: $el.data(keys.val) || "",
                    obj: $el.data(keys.obj) || null
                };
            }
            return null;
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _overwrite: function overwrite(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (this.async && this.templates.pending) {
                    this._renderPending(query);
                } else if (!this.async && this.templates.notFound) {
                    this._renderNotFound(query);
                } else {
                    this._empty();
                }
                this.trigger("rendered", this.name, suggestions, false);
            },
            _append: function append(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length && this.$lastSuggestion.length) {
                    this._appendSuggestions(query, suggestions);
                } else if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
                    this._renderNotFound(query);
                }
                this.trigger("rendered", this.name, suggestions, true);
            },
            _renderSuggestions: function renderSuggestions(query, suggestions) {
                var $fragment;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                this.$lastSuggestion = $fragment.children().last();
                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
            },
            _appendSuggestions: function appendSuggestions(query, suggestions) {
                var $fragment, $lastSuggestion;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                $lastSuggestion = $fragment.children().last();
                this.$lastSuggestion.after($fragment);
                this.$lastSuggestion = $lastSuggestion;
            },
            _renderPending: function renderPending(query) {
                var template = this.templates.pending;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _renderNotFound: function renderNotFound(query) {
                var template = this.templates.notFound;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _empty: function empty() {
                this.$el.empty();
                this._resetLastSuggestion();
            },
            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
                var that = this, fragment;
                fragment = document.createDocumentFragment();
                _.each(suggestions, function getSuggestionNode(suggestion) {
                    var $el, context;
                    context = that._injectQuery(query, suggestion);
                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
                    fragment.appendChild($el[0]);
                });
                this.highlight && highlight({
                    className: this.classes.highlight,
                    node: fragment,
                    pattern: query
                });
                return $(fragment);
            },
            _getFooter: function getFooter(query, suggestions) {
                return this.templates.footer ? this.templates.footer({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _getHeader: function getHeader(query, suggestions) {
                return this.templates.header ? this.templates.header({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _resetLastSuggestion: function resetLastSuggestion() {
                this.$lastSuggestion = $();
            },
            _injectQuery: function injectQuery(query, obj) {
                return _.isObject(obj) ? _.mixin({
                    _query: query
                }, obj) : obj;
            },
            update: function update(query) {
                var that = this, canceled = false, syncCalled = false, rendered = 0;
                this.cancel();
                this.cancel = function cancel() {
                    canceled = true;
                    that.cancel = $.noop;
                    that.async && that.trigger("asyncCanceled", query);
                };
                this.source(query, sync, async);
                !syncCalled && sync([]);
                function sync(suggestions) {
                    if (syncCalled) {
                        return;
                    }
                    syncCalled = true;
                    suggestions = (suggestions || []).slice(0, that.limit);
                    rendered = suggestions.length;
                    that._overwrite(query, suggestions);
                    if (rendered < that.limit && that.async) {
                        that.trigger("asyncRequested", query);
                    }
                }
                function async(suggestions) {
                    suggestions = suggestions || [];
                    if (!canceled && rendered < that.limit) {
                        that.cancel = $.noop;
                        rendered += suggestions.length;
                        that._append(query, suggestions.slice(0, that.limit - rendered));
                        that.async && that.trigger("asyncReceived", query);
                    }
                }
            },
            cancel: $.noop,
            clear: function clear() {
                this._empty();
                this.cancel();
                this.trigger("cleared");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = $("<div>");
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || _.stringify;
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                notFound: templates.notFound && _.templatify(templates.notFound),
                pending: templates.pending && _.templatify(templates.pending),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return $("<div>").text(displayFn(context));
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Menu = function() {
        "use strict";
        function Menu(o, www) {
            var that = this;
            o = o || {};
            if (!o.node) {
                $.error("node is required");
            }
            www.mixin(this);
            this.$node = $(o.node);
            this.query = null;
            this.datasets = _.map(o.datasets, initializeDataset);
            function initializeDataset(oDataset) {
                var node = that.$node.find(oDataset.node).first();
                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
                return new Dataset(oDataset, www);
            }
        }
        _.mixin(Menu.prototype, EventEmitter, {
            _onSelectableClick: function onSelectableClick($e) {
                this.trigger("selectableClicked", $($e.currentTarget));
            },
            _onRendered: function onRendered(type, dataset, suggestions, async) {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetRendered", dataset, suggestions, async);
            },
            _onCleared: function onCleared() {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetCleared");
            },
            _propagate: function propagate() {
                this.trigger.apply(this, arguments);
            },
            _allDatasetsEmpty: function allDatasetsEmpty() {
                return _.every(this.datasets, isDatasetEmpty);
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _getSelectables: function getSelectables() {
                return this.$node.find(this.selectors.selectable);
            },
            _removeCursor: function _removeCursor() {
                var $selectable = this.getActiveSelectable();
                $selectable && $selectable.removeClass(this.classes.cursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, nodeScrollTop, nodeHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                nodeScrollTop = this.$node.scrollTop();
                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$node.scrollTop(nodeScrollTop + elTop);
                } else if (nodeHeight < elBottom) {
                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
                }
            },
            bind: function() {
                var that = this, onSelectableClick;
                onSelectableClick = _.bind(this._onSelectableClick, this);
                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
                _.each(this.datasets, function(dataset) {
                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
                });
                return this;
            },
            isOpen: function isOpen() {
                return this.$node.hasClass(this.classes.open);
            },
            open: function open() {
                this.$node.addClass(this.classes.open);
            },
            close: function close() {
                this.$node.removeClass(this.classes.open);
                this._removeCursor();
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.attr("dir", dir);
            },
            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
                var $selectables, $oldCursor, oldIndex, newIndex;
                $oldCursor = this.getActiveSelectable();
                $selectables = this._getSelectables();
                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
                newIndex = oldIndex + delta;
                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
                return newIndex === -1 ? null : $selectables.eq(newIndex);
            },
            setCursor: function setCursor($selectable) {
                this._removeCursor();
                if ($selectable = $selectable && $selectable.first()) {
                    $selectable.addClass(this.classes.cursor);
                    this._ensureVisible($selectable);
                }
            },
            getSelectableData: function getSelectableData($el) {
                return $el && $el.length ? Dataset.extractData($el) : null;
            },
            getActiveSelectable: function getActiveSelectable() {
                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
                return $selectable.length ? $selectable : null;
            },
            getTopSelectable: function getTopSelectable() {
                var $selectable = this._getSelectables().first();
                return $selectable.length ? $selectable : null;
            },
            update: function update(query) {
                var isValidUpdate = query !== this.query;
                if (isValidUpdate) {
                    this.query = query;
                    _.each(this.datasets, updateDataset);
                }
                return isValidUpdate;
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.query = null;
                this.$node.addClass(this.classes.empty);
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            destroy: function destroy() {
                this.$node.off(".tt");
                this.$node = $("<div>");
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Menu;
    }();
    var DefaultMenu = function() {
        "use strict";
        var s = Menu.prototype;
        function DefaultMenu() {
            Menu.apply(this, [].slice.call(arguments, 0));
        }
        _.mixin(DefaultMenu.prototype, Menu.prototype, {
            open: function open() {
                !this._allDatasetsEmpty() && this._show();
                return s.open.apply(this, [].slice.call(arguments, 0));
            },
            close: function close() {
                this._hide();
                return s.close.apply(this, [].slice.call(arguments, 0));
            },
            _onRendered: function onRendered() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onRendered.apply(this, [].slice.call(arguments, 0));
            },
            _onCleared: function onCleared() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onCleared.apply(this, [].slice.call(arguments, 0));
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
            },
            _hide: function hide() {
                this.$node.hide();
            },
            _show: function show() {
                this.$node.css("display", "block");
            }
        });
        return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";
        function Typeahead(o, www) {
            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            if (!o.menu) {
                $.error("missing menu");
            }
            if (!o.eventBus) {
                $.error("missing event bus");
            }
            www.mixin(this);
            this.eventBus = o.eventBus;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.input = o.input;
            this.menu = o.menu;
            this.enabled = true;
            this.active = false;
            this.input.hasFocus() && this.activate();
            this.dir = this.input.getLangDir();
            this._hacks();
            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
            onFocused = c(this, "activate", "open", "_onFocused");
            onBlurred = c(this, "deactivate", "_onBlurred");
            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
            onEscKeyed = c(this, "isActive", "_onEscKeyed");
            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
            _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
            },
            _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
            },
            _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
            },
            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
            },
            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
            },
            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
            },
            _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
            },
            _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                    this.eventBus.trigger("change", this.input.getQuery());
                }
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                } else if ($selectable = this.menu.getTopSelectable()) {
                    this.autocomplete($selectable) && $e.preventDefault();
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.close();
            },
            _onUpKeyed: function onUpKeyed() {
                this.moveCursor(-1);
            },
            _onDownKeyed: function onDownKeyed() {
                this.moveCursor(+1);
            },
            _onLeftKeyed: function onLeftKeyed() {
                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onRightKeyed: function onRightKeyed() {
                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
            },
            _onLangDirChanged: function onLangDirChanged(e, dir) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.menu.setLanguageDirection(dir);
                }
            },
            _openIfActive: function openIfActive() {
                this.isActive() && this.open();
            },
            _minLengthMet: function minLengthMet(query) {
                query = _.isString(query) ? query : this.input.getQuery() || "";
                return query.length >= this.minLength;
            },
            _updateHint: function updateHint() {
                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
                $selectable = this.menu.getTopSelectable();
                data = this.menu.getSelectableData($selectable);
                val = this.input.getInputValue();
                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(data.val);
                    match && this.input.setHint(val + match[1]);
                } else {
                    this.input.clearHint();
                }
            },
            isEnabled: function isEnabled() {
                return this.enabled;
            },
            enable: function enable() {
                this.enabled = true;
            },
            disable: function disable() {
                this.enabled = false;
            },
            isActive: function isActive() {
                return this.active;
            },
            activate: function activate() {
                if (this.isActive()) {
                    return true;
                } else if (!this.isEnabled() || this.eventBus.before("active")) {
                    return false;
                } else {
                    this.active = true;
                    this.eventBus.trigger("active");
                    return true;
                }
            },
            deactivate: function deactivate() {
                if (!this.isActive()) {
                    return true;
                } else if (this.eventBus.before("idle")) {
                    return false;
                } else {
                    this.active = false;
                    this.close();
                    this.eventBus.trigger("idle");
                    return true;
                }
            },
            isOpen: function isOpen() {
                return this.menu.isOpen();
            },
            open: function open() {
                if (!this.isOpen() && !this.eventBus.before("open")) {
                    this.menu.open();
                    this._updateHint();
                    this.eventBus.trigger("open");
                }
                return this.isOpen();
            },
            close: function close() {
                if (this.isOpen() && !this.eventBus.before("close")) {
                    this.menu.close();
                    this.input.clearHint();
                    this.input.resetInputValue();
                    this.eventBus.trigger("close");
                }
                return !this.isOpen();
            },
            setVal: function setVal(val) {
                this.input.setQuery(_.toStr(val));
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            select: function select($selectable) {
                var data = this.menu.getSelectableData($selectable);
                if (data && !this.eventBus.before("select", data.obj)) {
                    this.input.setQuery(data.val, true);
                    this.eventBus.trigger("select", data.obj);
                    this.close();
                    return true;
                }
                return false;
            },
            autocomplete: function autocomplete($selectable) {
                var query, data, isValid;
                query = this.input.getQuery();
                data = this.menu.getSelectableData($selectable);
                isValid = data && query !== data.val;
                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
                    this.input.setQuery(data.val);
                    this.eventBus.trigger("autocomplete", data.obj);
                    return true;
                }
                return false;
            },
            moveCursor: function moveCursor(delta) {
                var query, $candidate, data, payload, cancelMove;
                query = this.input.getQuery();
                $candidate = this.menu.selectableRelativeToCursor(delta);
                data = this.menu.getSelectableData($candidate);
                payload = data ? data.obj : null;
                cancelMove = this._minLengthMet() && this.menu.update(query);
                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
                    this.menu.setCursor($candidate);
                    if (data) {
                        this.input.setInputValue(data.val);
                    } else {
                        this.input.resetInputValue();
                        this._updateHint();
                    }
                    this.eventBus.trigger("cursorchange", payload);
                    return true;
                }
                return false;
            },
            destroy: function destroy() {
                this.input.destroy();
                this.menu.destroy();
            }
        });
        return Typeahead;
        function c(ctx) {
            var methods = [].slice.call(arguments, 1);
            return function() {
                var args = [].slice.call(arguments);
                _.each(methods, function(method) {
                    return ctx[method].apply(ctx, args);
                });
            };
        }
    }();
    (function() {
        "use strict";
        var old, keys, methods;
        old = $.fn.typeahead;
        keys = {
            www: "tt-www",
            attrs: "tt-attrs",
            typeahead: "tt-typeahead"
        };
        methods = {
            initialize: function initialize(o, datasets) {
                var www;
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                www = WWW(o.classNames);
                return this.each(attach);
                function attach() {
                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    $input = $(this);
                    $wrapper = $(www.html.wrapper);
                    $hint = $elOrNull(o.hint);
                    $menu = $elOrNull(o.menu);
                    defaultHint = o.hint !== false && !$hint;
                    defaultMenu = o.menu !== false && !$menu;
                    defaultHint && ($hint = buildHintFromInput($input, www));
                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
                    $hint && $hint.val("");
                    $input = prepInput($input, www);
                    if (defaultHint || defaultMenu) {
                        $wrapper.css(www.css.wrapper);
                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
                    }
                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
                    eventBus = new EventBus({
                        el: $input
                    });
                    input = new Input({
                        hint: $hint,
                        input: $input
                    }, www);
                    menu = new MenuConstructor({
                        node: $menu,
                        datasets: datasets
                    }, www);
                    typeahead = new Typeahead({
                        input: input,
                        menu: menu,
                        eventBus: eventBus,
                        minLength: o.minLength
                    }, www);
                    $input.data(keys.www, www);
                    $input.data(keys.typeahead, typeahead);
                }
            },
            isEnabled: function isEnabled() {
                var enabled;
                ttEach(this.first(), function(t) {
                    enabled = t.isEnabled();
                });
                return enabled;
            },
            enable: function enable() {
                ttEach(this, function(t) {
                    t.enable();
                });
                return this;
            },
            disable: function disable() {
                ttEach(this, function(t) {
                    t.disable();
                });
                return this;
            },
            isActive: function isActive() {
                var active;
                ttEach(this.first(), function(t) {
                    active = t.isActive();
                });
                return active;
            },
            activate: function activate() {
                ttEach(this, function(t) {
                    t.activate();
                });
                return this;
            },
            deactivate: function deactivate() {
                ttEach(this, function(t) {
                    t.deactivate();
                });
                return this;
            },
            isOpen: function isOpen() {
                var open;
                ttEach(this.first(), function(t) {
                    open = t.isOpen();
                });
                return open;
            },
            open: function open() {
                ttEach(this, function(t) {
                    t.open();
                });
                return this;
            },
            close: function close() {
                ttEach(this, function(t) {
                    t.close();
                });
                return this;
            },
            select: function select(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.select($el);
                });
                return success;
            },
            autocomplete: function autocomplete(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.autocomplete($el);
                });
                return success;
            },
            moveCursor: function moveCursoe(delta) {
                var success = false;
                ttEach(this.first(), function(t) {
                    success = t.moveCursor(delta);
                });
                return success;
            },
            val: function val(newVal) {
                var query;
                if (!arguments.length) {
                    ttEach(this.first(), function(t) {
                        query = t.getVal();
                    });
                    return query;
                } else {
                    ttEach(this, function(t) {
                        t.setVal(newVal);
                    });
                    return this;
                }
            },
            destroy: function destroy() {
                ttEach(this, function(typeahead, $input) {
                    revert($input);
                    typeahead.destroy();
                });
                return this;
            }
        };
        $.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
        function ttEach($els, fn) {
            $els.each(function() {
                var $input = $(this), typeahead;
                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
            });
        }
        function buildHintFromInput($input, www) {
            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
        }
        function prepInput($input, www) {
            $input.data(keys.attrs, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass(www.classes.input).attr({
                autocomplete: "off",
                spellcheck: false
            });
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input;
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function revert($input) {
            var www, $wrapper;
            www = $input.data(keys.www);
            $wrapper = $input.parent().filter(www.selectors.wrapper);
            _.each($input.data(keys.attrs), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
            if ($wrapper.length) {
                $input.detach().insertAfter($wrapper);
                $wrapper.remove();
            }
        }
        function $elOrNull(obj) {
            var isValid, $el;
            isValid = _.isJQuery(obj) || _.isElement(obj);
            $el = isValid ? $(obj).first() : [];
            return $el.length ? $el : null;
        }
    })();
});/*!
 * jQuery contextMenu - Plugin for simple contextMenu handling
 *
 * Version: git-master
 *
 * Authors: Rodney Rehm, Addy Osmani (patches for FF)
 * Web: http://medialize.github.com/jQuery-contextMenu/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function($, undefined){
    
    // TODO: -
        // ARIA stuff: menuitem, menuitemcheckbox und menuitemradio
        // create <menu> structure if $.support[htmlCommand || htmlMenuitem] and !opt.disableNative

// determine html5 compatibility
$.support.htmlMenuitem = ('HTMLMenuItemElement' in window);
$.support.htmlCommand = ('HTMLCommandElement' in window);
$.support.eventSelectstart = ("onselectstart" in document.documentElement);
/* // should the need arise, test for css user-select
$.support.cssUserSelect = (function(){
    var t = false,
        e = document.createElement('div');
    
    $.each('Moz|Webkit|Khtml|O|ms|Icab|'.split('|'), function(i, prefix) {
        var propCC = prefix + (prefix ? 'U' : 'u') + 'serSelect',
            prop = (prefix ? ('-' + prefix.toLowerCase() + '-') : '') + 'user-select';
            
        e.style.cssText = prop + ': text;';
        if (e.style[propCC] == 'text') {
            t = true;
            return false;
        }
        
        return true;
    });
    
    return t;
})();
*/

if (!$.ui || !$.ui.widget) {
    // duck punch $.cleanData like jQueryUI does to get that remove event
    // https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js#L16-24
    var _cleanData = $.cleanData;
    $.cleanData = function( elems ) {
        for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
            try {
                $( elem ).triggerHandler( "remove" );
                // http://bugs.jquery.com/ticket/8235
            } catch( e ) {}
        }
        _cleanData( elems );
    };
}

var // currently active contextMenu trigger
    $currentTrigger = null,
    // is contextMenu initialized with at least one menu?
    initialized = false,
    // window handle
    $win = $(window),
    // number of registered menus
    counter = 0,
    // mapping selector to namespace
    namespaces = {},
    // mapping namespace to options
    menus = {},
    // custom command type handlers
    types = {},
    // default values
    defaults = {
        // selector of contextMenu trigger
        selector: null,
        // where to append the menu to
        appendTo: null,
        // method to trigger context menu ["right", "left", "hover"]
        trigger: "right",
        // hide menu when mouse leaves trigger / menu elements
        autoHide: false,
        // ms to wait before showing a hover-triggered context menu
        delay: 200,
        // flag denoting if a second trigger should simply move (true) or rebuild (false) an open menu
        // as long as the trigger happened on one of the trigger-element's child nodes
        reposition: true,
        // determine position to show menu at
        determinePosition: function($menu) {
            // position to the lower middle of the trigger element
            if ($.ui && $.ui.position) {
                // .position() is provided as a jQuery UI utility
                // (...and it won't work on hidden elements)
                $menu.css('display', 'block').position({
                    my: "center top",
                    at: "center bottom",
                    of: this,
                    offset: "0 5",
                    collision: "fit"
                }).css('display', 'none');
            } else {
                // determine contextMenu position
                var offset = this.offset();
                offset.top += this.outerHeight();
                offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
                $menu.css(offset);
            }
        },
        // position menu
        position: function(opt, x, y) {
            var $this = this,
                offset;
            // determine contextMenu position
            if (!x && !y) {
                opt.determinePosition.call(this, opt.$menu);
                return;
            } else if (x === "maintain" && y === "maintain") {
                // x and y must not be changed (after re-show on command click)
                offset = opt.$menu.position();
            } else {
                // x and y are given (by mouse event)
                offset = {top: y, left: x};
            }
            
            // correct offset if viewport demands it
            var bottom = $win.scrollTop() + $win.height(),
                right = $win.scrollLeft() + $win.width(),
                height = opt.$menu.height(),
                width = opt.$menu.width();
            
            if (offset.top + height > bottom) {
                offset.top -= height;
            }

            if (offset.top<0) {
                offset.top = 0;
            }
            
            if (offset.left + width > right) {
                offset.left -= width;
            }
            
            opt.$menu.css(offset);
        },
        // position the sub-menu
        positionSubmenu: function($menu) {
            if ($.ui && $.ui.position) {
                // .position() is provided as a jQuery UI utility
                // (...and it won't work on hidden elements)
                $menu.css('display', 'block').position({
                    my: "left top",
                    at: "right top",
                    of: this,
                    collision: "flipfit fit"
                }).css('display', '');
            } else {
                // determine contextMenu position
                var offset = {
                    top: 0,
                    left: this.outerWidth()
                };
                $menu.css(offset);
            }
        },
        // offset to add to zIndex
        zIndex: 1,
        // show hide animation settings
        animation: {
            duration: 50,
            show: 'slideDown',
            hide: 'slideUp'
        },
        // events
        events: {
            show: $.noop,
            hide: $.noop
        },
        // default callback
        callback: null,
        // list of contextMenu items
        items: {}
    },
    // mouse position for hover activation
    hoveract = {
        timer: null,
        pageX: null,
        pageY: null
    },
    // determine zIndex
    zindex = function($t) {
        var zin = 0,
            $tt = $t;

        while (true) {
            zin = Math.max(zin, parseInt($tt.css('z-index'), 10) || 0);
            $tt = $tt.parent();
            if (!$tt || !$tt.length || "html body".indexOf($tt.prop('nodeName').toLowerCase()) > -1 ) {
                break;
            }
        }
        
        return zin;
    },
    // event handlers
    handle = {
        // abort anything
        abortevent: function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
        },
        
        // contextmenu show dispatcher
        contextmenu: function(e) {
            var $this = $(this);
            
            // disable actual context-menu if we are using the right mouse button as the trigger
            if (e.data.trigger == 'right') {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            
            // abort native-triggered events unless we're triggering on right click
            if (e.data.trigger != 'right' && e.originalEvent) {
                return;
            }
            
            // abort event if menu is visible for this trigger
            if ($this.hasClass('context-menu-active')) {
                return;
            }
            
            if (!$this.hasClass('context-menu-disabled')) {
                // theoretically need to fire a show event at <menu>
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#context-menus
                // var evt = jQuery.Event("show", { data: data, pageX: e.pageX, pageY: e.pageY, relatedTarget: this });
                // e.data.$menu.trigger(evt);
                
                $currentTrigger = $this;
                if (e.data.build) {
                    var built = e.data.build($currentTrigger, e);
                    // abort if build() returned false
                    if (built === false) {
                        return;
                    }
                    
                    // dynamically build menu on invocation
                    e.data = $.extend(true, {}, defaults, e.data, built || {});

                    // abort if there are no items to display
                    if (!e.data.items || $.isEmptyObject(e.data.items)) {
                        // Note: jQuery captures and ignores errors from event handlers
                        if (window.console) {
                            (console.error || console.log).call(console, "No items specified to show in contextMenu");
                        }
                        
                        throw new Error('No Items specified');
                    }
                    
                    // backreference for custom command type creation
                    e.data.$trigger = $currentTrigger;
                    
                    op.create(e.data);
                }
                // show menu
                op.show.call($this, e.data, e.pageX, e.pageY);
            }
        },
        // contextMenu left-click trigger
        click: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $(this).trigger($.Event("contextmenu", { data: e.data, pageX: e.pageX, pageY: e.pageY }));
        },
        // contextMenu right-click trigger
        mousedown: function(e) {
            // register mouse down
            var $this = $(this);
            
            // hide any previous menus
            if ($currentTrigger && $currentTrigger.length && !$currentTrigger.is($this)) {
                $currentTrigger.data('contextMenu').$menu.trigger('contextmenu:hide');
            }
            
            // activate on right click
            if (e.button == 2) {
                $currentTrigger = $this.data('contextMenuActive', true);
            }
        },
        // contextMenu right-click trigger
        mouseup: function(e) {
            // show menu
            var $this = $(this);
            if ($this.data('contextMenuActive') && $currentTrigger && $currentTrigger.length && $currentTrigger.is($this) && !$this.hasClass('context-menu-disabled')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $currentTrigger = $this;
                $this.trigger($.Event("contextmenu", { data: e.data, pageX: e.pageX, pageY: e.pageY }));
            }
            
            $this.removeData('contextMenuActive');
        },
        // contextMenu hover trigger
        mouseenter: function(e) {
            var $this = $(this),
                $related = $(e.relatedTarget),
                $document = $(document);
            
            // abort if we're coming from a menu
            if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                return;
            }
            
            // abort if a menu is shown
            if ($currentTrigger && $currentTrigger.length) {
                return;
            }
            
            hoveract.pageX = e.pageX;
            hoveract.pageY = e.pageY;
            hoveract.data = e.data;
            $document.on('mousemove.contextMenuShow', handle.mousemove);
            hoveract.timer = setTimeout(function() {
                hoveract.timer = null;
                $document.off('mousemove.contextMenuShow');
                $currentTrigger = $this;
                $this.trigger($.Event("contextmenu", { data: hoveract.data, pageX: hoveract.pageX, pageY: hoveract.pageY }));
            }, e.data.delay );
        },
        // contextMenu hover trigger
        mousemove: function(e) {
            hoveract.pageX = e.pageX;
            hoveract.pageY = e.pageY;
        },
        // contextMenu hover trigger
        mouseleave: function(e) {
            // abort if we're leaving for a menu
            var $related = $(e.relatedTarget);
            if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                return;
            }
            
            try {
                clearTimeout(hoveract.timer);
            } catch(e) {}
            
            hoveract.timer = null;
        },
        
        // click on layer to hide contextMenu
        layerClick: function(e) {
            var $this = $(this),
                root = $this.data('contextMenuRoot'),
                button = e.button,
                x = e.pageX,
                y = e.pageY,
                target, 
                offset;
                
            e.preventDefault();
            e.stopImmediatePropagation();
            
            setTimeout(function() {
                var $window;
                var triggerAction = ((root.trigger == 'left' && button === 0) || (root.trigger == 'right' && button === 2));
                
                // find the element that would've been clicked, wasn't the layer in the way
                if (document.elementFromPoint) {
                    root.$layer.hide();
                    target = document.elementFromPoint(x - $win.scrollLeft(), y - $win.scrollTop());
                    root.$layer.show();
                }
                
                if (root.reposition && triggerAction) {
                    if (document.elementFromPoint) {
                        if (root.$trigger.is(target) || root.$trigger.has(target).length) {
                            root.position.call(root.$trigger, root, x, y);
                            return;
                        }
                    } else {
                        offset = root.$trigger.offset();
                        $window = $(window);
                        // while this looks kinda awful, it's the best way to avoid
                        // unnecessarily calculating any positions
                        offset.top += $window.scrollTop();
                        if (offset.top <= e.pageY) {
                            offset.left += $window.scrollLeft();
                            if (offset.left <= e.pageX) {
                                offset.bottom = offset.top + root.$trigger.outerHeight();
                                if (offset.bottom >= e.pageY) {
                                    offset.right = offset.left + root.$trigger.outerWidth();
                                    if (offset.right >= e.pageX) {
                                        // reposition
                                        root.position.call(root.$trigger, root, x, y);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (target && triggerAction) {
                    root.$trigger.one('contextmenu:hidden', function() {
                        $(target).contextMenu({x: x, y: y});
                    });
                }

                root.$menu.trigger('contextmenu:hide');
            }, 50);
        },
        // key handled :hover
        keyStop: function(e, opt) {
            if (!opt.isInput) {
                e.preventDefault();
            }
            
            e.stopPropagation();
        },
        key: function(e) {

            var opt = {};

            // Only get the data from $currentTrigger if it exists
            if ($currentTrigger) {
                opt = $currentTrigger.data('contextMenu') || {};
            }

            switch (e.keyCode) {
                case 9:
                case 38: // up
                    handle.keyStop(e, opt);
                    // if keyCode is [38 (up)] or [9 (tab) with shift]
                    if (opt.isInput) {
                        if (e.keyCode == 9 && e.shiftKey) {
                            e.preventDefault();
                            opt.$selected && opt.$selected.find('input, textarea, select').blur();
                            opt.$menu.trigger('prevcommand');
                            return;
                        } else if (e.keyCode == 38 && opt.$selected.find('input, textarea, select').prop('type') == 'checkbox') {
                            // checkboxes don't capture this key
                            e.preventDefault();
                            return;
                        }
                    } else if (e.keyCode != 9 || e.shiftKey) {
                        opt.$menu.trigger('prevcommand');
                        return;
                    }
                    // omitting break;
                    
                // case 9: // tab - reached through omitted break;
                case 40: // down
                    handle.keyStop(e, opt);
                    if (opt.isInput) {
                        if (e.keyCode == 9) {
                            e.preventDefault();
                            opt.$selected && opt.$selected.find('input, textarea, select').blur();
                            opt.$menu.trigger('nextcommand');
                            return;
                        } else if (e.keyCode == 40 && opt.$selected.find('input, textarea, select').prop('type') == 'checkbox') {
                            // checkboxes don't capture this key
                            e.preventDefault();
                            return;
                        }
                    } else {
                        opt.$menu.trigger('nextcommand');
                        return;
                    }
                    break;
                
                case 37: // left
                    handle.keyStop(e, opt);
                    if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                        break;
                    }
                
                    if (!opt.$selected.parent().hasClass('context-menu-root')) {
                        var $parent = opt.$selected.parent().parent();
                        opt.$selected.trigger('contextmenu:blur');
                        opt.$selected = $parent;
                        return;
                    }
                    break;
                    
                case 39: // right
                    handle.keyStop(e, opt);
                    if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                        break;
                    }
                    
                    var itemdata = opt.$selected.data('contextMenu') || {};
                    if (itemdata.$menu && opt.$selected.hasClass('context-menu-submenu')) {
                        opt.$selected = null;
                        itemdata.$selected = null;
                        itemdata.$menu.trigger('nextcommand');
                        return;
                    }
                    break;
                
                case 35: // end
                case 36: // home
                    if (opt.$selected && opt.$selected.find('input, textarea, select').length) {
                        return;
                    } else {
                        (opt.$selected && opt.$selected.parent() || opt.$menu)
                            .children(':not(.disabled, .not-selectable)')[e.keyCode == 36 ? 'first' : 'last']()
                            .trigger('contextmenu:focus');
                        e.preventDefault();
                        return;
                    }
                    break;
                    
                case 13: // enter
                    handle.keyStop(e, opt);
                    if (opt.isInput) {
                        if (opt.$selected && !opt.$selected.is('textarea, select')) {
                            e.preventDefault();
                            return;
                        }
                        break;
                    }
                    opt.$selected && opt.$selected.trigger('mouseup');
                    return;
                    
                case 32: // space
                case 33: // page up
                case 34: // page down
                    // prevent browser from scrolling down while menu is visible
                    handle.keyStop(e, opt);
                    return;
                    
                case 27: // esc
                    handle.keyStop(e, opt);
                    opt.$menu.trigger('contextmenu:hide');
                    return;
                    
                default: // 0-9, a-z
                    var k = (String.fromCharCode(e.keyCode)).toUpperCase();
                    if (opt.accesskeys && opt.accesskeys[k]) {
                        // according to the specs accesskeys must be invoked immediately
                        opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu
                            ? 'contextmenu:focus'
                            : 'mouseup'
                        );
                        return;
                    }
                    break;
            }
            // pass event to selected item, 
            // stop propagation to avoid endless recursion
            e.stopPropagation();
            opt.$selected && opt.$selected.trigger(e);
        },

        // select previous possible command in menu
        prevItem: function(e) {
            e.stopPropagation();
            var opt = $(this).data('contextMenu') || {};

            // obtain currently selected menu
            if (opt.$selected) {
                var $s = opt.$selected;
                opt = opt.$selected.parent().data('contextMenu') || {};
                opt.$selected = $s;
            }
            
            var $children = opt.$menu.children(),
                $prev = !opt.$selected || !opt.$selected.prev().length ? $children.last() : opt.$selected.prev(),
                $round = $prev;
            
            // skip disabled
            while ($prev.hasClass('disabled') || $prev.hasClass('not-selectable')) {
                if ($prev.prev().length) {
                    $prev = $prev.prev();
                } else {
                    $prev = $children.last();
                }
                if ($prev.is($round)) {
                    // break endless loop
                    return;
                }
            }
            
            // leave current
            if (opt.$selected) {
                handle.itemMouseleave.call(opt.$selected.get(0), e);
            }
            
            // activate next
            handle.itemMouseenter.call($prev.get(0), e);
            
            // focus input
            var $input = $prev.find('input, textarea, select');
            if ($input.length) {
                $input.focus();
            }
        },
        // select next possible command in menu
        nextItem: function(e) {
            e.stopPropagation();
            var opt = $(this).data('contextMenu') || {};

            // obtain currently selected menu
            if (opt.$selected) {
                var $s = opt.$selected;
                opt = opt.$selected.parent().data('contextMenu') || {};
                opt.$selected = $s;
            }

            var $children = opt.$menu.children(),
                $next = !opt.$selected || !opt.$selected.next().length ? $children.first() : opt.$selected.next(),
                $round = $next;

            // skip disabled
            while ($next.hasClass('disabled') || $next.hasClass('not-selectable')) {
                if ($next.next().length) {
                    $next = $next.next();
                } else {
                    $next = $children.first();
                }
                if ($next.is($round)) {
                    // break endless loop
                    return;
                }
            }
            
            // leave current
            if (opt.$selected) {
                handle.itemMouseleave.call(opt.$selected.get(0), e);
            }
            
            // activate next
            handle.itemMouseenter.call($next.get(0), e);
            
            // focus input
            var $input = $next.find('input, textarea, select');
            if ($input.length) {
                $input.focus();
            }
        },
        
        // flag that we're inside an input so the key handler can act accordingly
        focusInput: function(e) {
            var $this = $(this).closest('.context-menu-item'),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            root.$selected = opt.$selected = $this;
            root.isInput = opt.isInput = true;
        },
        // flag that we're inside an input so the key handler can act accordingly
        blurInput: function(e) {
            var $this = $(this).closest('.context-menu-item'),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            root.isInput = opt.isInput = false;
        },
        
        // :hover on menu
        menuMouseenter: function(e) {
            var root = $(this).data().contextMenuRoot;
            root.hovering = true;
        },
        // :hover on menu
        menuMouseleave: function(e) {
            var root = $(this).data().contextMenuRoot;
            if (root.$layer && root.$layer.is(e.relatedTarget)) {
                root.hovering = false;
            }
        },
        
        // :hover done manually so key handling is possible
        itemMouseenter: function(e) {
            var $this = $(this),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;
            
            root.hovering = true;

            // abort if we're re-entering
            if (e && root.$layer && root.$layer.is(e.relatedTarget)) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            // make sure only one item is selected
            (opt.$menu ? opt : root).$menu
                .children('.hover').trigger('contextmenu:blur');

            if ($this.hasClass('disabled') || $this.hasClass('not-selectable')) {
                opt.$selected = null;
                return;
            }
            
            $this.trigger('contextmenu:focus');
        },
        // :hover done manually so key handling is possible
        itemMouseleave: function(e) {
            var $this = $(this),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            if (root !== opt && root.$layer && root.$layer.is(e.relatedTarget)) {
                root.$selected && root.$selected.trigger('contextmenu:blur');
                e.preventDefault();
                e.stopImmediatePropagation();
                root.$selected = opt.$selected = opt.$node;
                return;
            }
            
            $this.trigger('contextmenu:blur');
        },
        // contextMenu item click
        itemClick: function(e) {
            var $this = $(this),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot,
                key = data.contextMenuKey,
                callback;

            // abort if the key is unknown or disabled or is a menu
            if (!opt.items[key] || $this.is('.disabled, .context-menu-submenu, .context-menu-separator, .not-selectable')) {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            if ($.isFunction(root.callbacks[key]) && Object.prototype.hasOwnProperty.call(root.callbacks, key)) {
                // item-specific callback
                callback = root.callbacks[key];
            } else if ($.isFunction(root.callback)) {
                // default callback
                callback = root.callback;                
            } else {
                // no callback, no action
                return;
            }

            // hide menu if callback doesn't stop that
            if (callback.call(root.$trigger, key, root) !== false) {
                root.$menu.trigger('contextmenu:hide');
            } else if (root.$menu.parent().length) {
                op.update.call(root.$trigger, root);
            }
        },
        // ignore click events on input elements
        inputClick: function(e) {
            e.stopImmediatePropagation();
        },
        
        // hide <menu>
        hideMenu: function(e, data) {
            var root = $(this).data('contextMenuRoot');
            op.hide.call(root.$trigger, root, data && data.force);
        },
        // focus <command>
        focusItem: function(e) {
            e.stopPropagation();
            var $this = $(this),
                data = $this.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            $this.addClass('hover')
                .siblings('.hover').trigger('contextmenu:blur');
            
            // remember selected
            opt.$selected = root.$selected = $this;
            
            // position sub-menu - do after show so dumb $.ui.position can keep up
            if (opt.$node) {
                root.positionSubmenu.call(opt.$node, opt.$menu);
            }
        },
        // blur <command>
        blurItem: function(e) {
            e.stopPropagation();
            var $this = $(this),
                data = $this.data(),
                opt = data.contextMenu;
            
            $this.removeClass('hover');
            opt.$selected = null;
        }
    },
    // operations
    op = {
        show: function(opt, x, y) {
            var $trigger = $(this),
                css = {};

            // hide any open menus
            $('#context-menu-layer').trigger('mousedown');

            // backreference for callbacks
            opt.$trigger = $trigger;

            // show event
            if (opt.events.show.call($trigger, opt) === false) {
                $currentTrigger = null;
                return;
            }

            // create or update context menu
            op.update.call($trigger, opt);
            
            // position menu
            opt.position.call($trigger, opt, x, y);

            // make sure we're in front
            if (opt.zIndex) {
                css.zIndex = zindex($trigger) + opt.zIndex;
            }
            
            // add layer
            op.layer.call(opt.$menu, opt, css.zIndex);
            
            // adjust sub-menu zIndexes
            opt.$menu.find('ul').css('zIndex', css.zIndex + 1);
            
            // position and show context menu
            opt.$menu.css( css )[opt.animation.show](opt.animation.duration, function() {
                $trigger.trigger('contextmenu:visible');
            });
            // make options available and set state
            $trigger
                .data('contextMenu', opt)
                .addClass("context-menu-active");
            
            // register key handler
            $(document).off('keydown.contextMenu').on('keydown.contextMenu', handle.key);
            // register autoHide handler
            if (opt.autoHide) {
                // mouse position handler
                $(document).on('mousemove.contextMenuAutoHide', function(e) {
                    // need to capture the offset on mousemove,
                    // since the page might've been scrolled since activation
                    var pos = $trigger.offset();
                    pos.right = pos.left + $trigger.outerWidth();
                    pos.bottom = pos.top + $trigger.outerHeight();
                    
                    if (opt.$layer && !opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
                        // if mouse in menu...
                        opt.$menu.trigger('contextmenu:hide');
                    }
                });
            }
        },
        hide: function(opt, force) {
            var $trigger = $(this);
            if (!opt) {
                opt = $trigger.data('contextMenu') || {};
            }
            
            // hide event
            if (!force && opt.events && opt.events.hide.call($trigger, opt) === false) {
                return;
            }
            
            // remove options and revert state
            $trigger
                .removeData('contextMenu')
                .removeClass("context-menu-active");
            
            if (opt.$layer) {
                // keep layer for a bit so the contextmenu event can be aborted properly by opera
                setTimeout((function($layer) {
                    return function(){
                        $layer.remove();
                    };
                })(opt.$layer), 10);
                
                try {
                    delete opt.$layer;
                } catch(e) {
                    opt.$layer = null;
                }
            }
            
            // remove handle
            $currentTrigger = null;
            // remove selected
            opt.$menu.find('.hover').trigger('contextmenu:blur');
            opt.$selected = null;
            // unregister key and mouse handlers
            //$(document).off('.contextMenuAutoHide keydown.contextMenu'); // http://bugs.jquery.com/ticket/10705
            $(document).off('.contextMenuAutoHide').off('keydown.contextMenu');
            // hide menu
            opt.$menu && opt.$menu[opt.animation.hide](opt.animation.duration, function (){
                // tear down dynamically built menu after animation is completed.
                if (opt.build) {
                    opt.$menu.remove();
                    $.each(opt, function(key, value) {
                        switch (key) {
                            case 'ns':
                            case 'selector':
                            case 'build':
                            case 'trigger':
                                return true;

                            default:
                                opt[key] = undefined;
                                try {
                                    delete opt[key];
                                } catch (e) {}
                                return true;
                        }
                    });
                }
                
                setTimeout(function() {
                    $trigger.trigger('contextmenu:hidden');
                }, 10);
            });
        },
        create: function(opt, root) {
            if (root === undefined) {
                root = opt;
            }
            // create contextMenu
            opt.$menu = $('<ul class="context-menu-list"></ul>').addClass(opt.className || "").data({
                'contextMenu': opt,
                'contextMenuRoot': root
            });
            
            $.each(['callbacks', 'commands', 'inputs'], function(i,k){
                opt[k] = {};
                if (!root[k]) {
                    root[k] = {};
                }
            });
            
            root.accesskeys || (root.accesskeys = {});
            
            // create contextMenu items
            $.each(opt.items, function(key, item){
                var $t = $('<li class="context-menu-item"></li>').addClass(item.className || ""),
                    $label = null,
                    $input = null;
                
                // iOS needs to see a click-event bound to an element to actually
                // have the TouchEvents infrastructure trigger the click event
                $t.on('click', $.noop);
                
                item.$node = $t.data({
                    'contextMenu': opt,
                    'contextMenuRoot': root,
                    'contextMenuKey': key
                });
                
                // register accesskey
                // NOTE: the accesskey attribute should be applicable to any element, but Safari5 and Chrome13 still can't do that
                if (item.accesskey) {
                    var aks = splitAccesskey(item.accesskey);
                    for (var i=0, ak; ak = aks[i]; i++) {
                        if (!root.accesskeys[ak]) {
                            root.accesskeys[ak] = item;
                            item._name = item.name.replace(new RegExp('(' + ak + ')', 'i'), '<span class="context-menu-accesskey">$1</span>');
                            break;
                        }
                    }
                }
                
                if (typeof item == "string") {
                    $t.addClass('context-menu-separator not-selectable');
                } else if (item.type && types[item.type]) {
                    // run custom type handler
                    types[item.type].call($t, item, opt, root);
                    // register commands
                    $.each([opt, root], function(i,k){
                        k.commands[key] = item;
                        if ($.isFunction(item.callback)) {
                            k.callbacks[key] = item.callback;
                        }
                    });
                } else {
                    // add label for input
                    if (item.type == 'html') {
                        $t.addClass('context-menu-html not-selectable');
                    } else if (item.type) {
                        $label = $('<label></label>').appendTo($t);
                        $('<span></span>').text(item._name || item.name).appendTo($label);
                        $t.addClass('context-menu-input');
                        opt.hasTypes = true;
                        $.each([opt, root], function(i,k){
                            k.commands[key] = item;
                            k.inputs[key] = item;
                        });
                    } else if (item.items) {
                        item.type = 'sub';
                    }
                
                    switch (item.type) {
                        case 'text':
                            $input = $('<input type="text" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .appendTo($label);
                            break;
                    
                        case 'textarea':
                            $input = $('<textarea name=""></textarea>')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .appendTo($label);

                            if (item.height) {
                                $input.height(item.height);
                            }
                            break;

                        case 'checkbox':
                            $input = $('<input type="checkbox" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .prop("checked", !!item.selected)
                                .prependTo($label);
                            break;

                        case 'radio':
                            $input = $('<input type="radio" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + item.radio)
                                .val(item.value || "")
                                .prop("checked", !!item.selected)
                                .prependTo($label);
                            break;
                    
                        case 'select':
                            $input = $('<select name="">')
                                .attr('name', 'context-menu-input-' + key)
                                .appendTo($label);
                            if (item.options) {
                                $.each(item.options, function(value, text) {
                                    $('<option></option>').val(value).text(text).appendTo($input);
                                });
                                $input.val(item.selected);
                            }
                            break;
                        
                        case 'sub':
                            $('<span></span>').text(item._name || item.name).appendTo($t);
                            item.appendTo = item.$node;
                            op.create(item, root);
                            $t.data('contextMenu', item).addClass('context-menu-submenu');
                            item.callback = null;
                            break;
                        
                        case 'html':
                            $(item.html).appendTo($t);
                            break;
                        
                        default:
                            $.each([opt, root], function(i,k){
                                k.commands[key] = item;
                                if ($.isFunction(item.callback)) {
                                    k.callbacks[key] = item.callback;
                                }
                            });
                            $('<span></span>').text(item._name || item.name || "").appendTo($t);
                            break;
                    }
                    
                    // disable key listener in <input>
                    if (item.type && item.type != 'sub' && item.type != 'html') {
                        $input
                            .on('focus', handle.focusInput)
                            .on('blur', handle.blurInput);
                        
                        if (item.events) {
                            $input.on(item.events, opt);
                        }
                    }
                
                    // add icons
                    if (item.icon) {
                        $t.addClass("icon icon-" + item.icon);
                    }
                }
                
                // cache contained elements
                item.$input = $input;
                item.$label = $label;

                // attach item to menu
                $t.appendTo(opt.$menu);
                
                // Disable text selection
                if (!opt.hasTypes && $.support.eventSelectstart) {
                    // browsers support user-select: none, 
                    // IE has a special event for text-selection
                    // browsers supporting neither will not be preventing text-selection
                    $t.on('selectstart.disableTextSelect', handle.abortevent);
                }
            });
            // attach contextMenu to <body> (to bypass any possible overflow:hidden issues on parents of the trigger element)
            if (!opt.$node) {
                opt.$menu.css('display', 'none').addClass('context-menu-root');
            }
            opt.$menu.appendTo(opt.appendTo || document.body);
        },
        resize: function($menu, nested) {
            // determine widths of submenus, as CSS won't grow them automatically
            // position:absolute within position:absolute; min-width:100; max-width:200; results in width: 100;
            // kinda sucks hard...

            // determine width of absolutely positioned element
            $menu.css({position: 'absolute', display: 'block'});
            // don't apply yet, because that would break nested elements' widths
            // add a pixel to circumvent word-break issue in IE9 - #80
            $menu.data('width', Math.ceil($menu.width()) + 1);
            // reset styles so they allow nested elements to grow/shrink naturally
            $menu.css({
                position: 'static',
                minWidth: '0px',
                maxWidth: '100000px'
            });
            // identify width of nested menus
            $menu.find('> li > ul').each(function() {
                op.resize($(this), true);
            });
            // reset and apply changes in the end because nested
            // elements' widths wouldn't be calculatable otherwise
            if (!nested) {
                $menu.find('ul').addBack().css({
                    position: '', 
                    display: '',
                    minWidth: '',
                    maxWidth: ''
                }).width(function() {
                    return $(this).data('width');
                });
            }
        },
        update: function(opt, root) {
            var $trigger = this;
            if (root === undefined) {
                root = opt;
                op.resize(opt.$menu);
            }
            // re-check disabled for each item
            opt.$menu.children().each(function(){
                var $item = $(this),
                    key = $item.data('contextMenuKey'),
                    item = opt.items[key],
                    disabled = ($.isFunction(item.disabled) && item.disabled.call($trigger, key, root)) || item.disabled === true;

                // dis- / enable item
                $item[disabled ? 'addClass' : 'removeClass']('disabled');
                
                if (item.type) {
                    // dis- / enable input elements
                    $item.find('input, select, textarea').prop('disabled', disabled);
                    
                    // update input states
                    switch (item.type) {
                        case 'text':
                        case 'textarea':
                            item.$input.val(item.value || "");
                            break;
                            
                        case 'checkbox':
                        case 'radio':
                            item.$input.val(item.value || "").prop('checked', !!item.selected);
                            break;
                            
                        case 'select':
                            item.$input.val(item.selected || "");
                            break;
                    }
                }
                
                if (item.$menu) {
                    // update sub-menu
                    op.update.call($trigger, item, root);
                }
            });
        },
        layer: function(opt, zIndex) {
            // add transparent layer for click area
            // filter and background for Internet Explorer, Issue #23
            var $layer = opt.$layer = $('<div id="context-menu-layer" style="position:fixed; z-index:' + zIndex + '; top:0; left:0; opacity: 0; filter: alpha(opacity=0); background-color: #000;"></div>')
                .css({height: $win.height(), width: $win.width(), display: 'block'})
                .data('contextMenuRoot', opt)
                .insertBefore(this)
                .on('contextmenu', handle.abortevent)
                .on('mousedown', handle.layerClick);
            
            // IE6 doesn't know position:fixed;
            if (document.body.style.maxWidth === undefined) {//IE6 doesn't support maxWidth
                $layer.css({
                    'position' : 'absolute',
                    'height' : $(document).height()
                });
            }
            
            return $layer;
        }
    };

// split accesskey according to http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#assigned-access-key
function splitAccesskey(val) {
    var t = val.split(/\s+/),
        keys = [];
        
    for (var i=0, k; k = t[i]; i++) {
        k = k.charAt(0).toUpperCase(); // first character only
        // theoretically non-accessible characters should be ignored, but different systems, different keyboard layouts, ... screw it.
        // a map to look up already used access keys would be nice
        keys.push(k);
    }
    
    return keys;
}

// handle contextMenu triggers
$.fn.contextMenu = function(operation) {
    if (operation === undefined) {
        this.first().trigger('contextmenu');
    } else if (operation.x && operation.y) {
        this.first().trigger($.Event("contextmenu", {pageX: operation.x, pageY: operation.y}));
    } else if (operation === "hide") {
        var $menu = this.first().data('contextMenu') ? this.first().data('contextMenu').$menu : null;
        $menu && $menu.trigger('contextmenu:hide');
    } else if (operation === "destroy") {
        $.contextMenu("destroy", {context: this});
    } else if ($.isPlainObject(operation)) {
        operation.context = this;
        $.contextMenu("create", operation);
    } else if (operation) {
        this.removeClass('context-menu-disabled');
    } else if (!operation) {
        this.addClass('context-menu-disabled');
    }
    
    return this;
};

// manage contextMenu instances
$.contextMenu = function(operation, options) {
    if (typeof operation != 'string') {
        options = operation;
        operation = 'create';
    }
    
    if (typeof options == 'string') {
        options = {selector: options};
    } else if (options === undefined) {
        options = {};
    }
    
    // merge with default options
    var o = $.extend(true, {}, defaults, options || {});
    var $document = $(document);
    var $context = $document;
    var _hasContext = false;
    
    if (!o.context || !o.context.length) {
        o.context = document;
    } else {
        // you never know what they throw at you...
        $context = $(o.context).first();
        o.context = $context.get(0);
        _hasContext = o.context !== document;
    }
    
    switch (operation) {
        case 'create':
            // no selector no joy
            if (!o.selector) {
                throw new Error('No selector specified');
            }
            // make sure internal classes are not bound to
            if (o.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
                throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
            }
            if (!o.build && (!o.items || $.isEmptyObject(o.items))) {
                throw new Error('No Items specified');
            }
            counter ++;
            o.ns = '.contextMenu' + counter;
            if (!_hasContext) {
                namespaces[o.selector] = o.ns;
            }
            menus[o.ns] = o;
            
            // default to right click
            if (!o.trigger) {
                o.trigger = 'right';
            }
            
            if (!initialized) {
                // make sure item click is registered first
                $document
                    .on({
                        'contextmenu:hide.contextMenu': handle.hideMenu,
                        'prevcommand.contextMenu': handle.prevItem,
                        'nextcommand.contextMenu': handle.nextItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.menuMouseenter,
                        'mouseleave.contextMenu': handle.menuMouseleave
                    }, '.context-menu-list')
                    .on('mouseup.contextMenu', '.context-menu-input', handle.inputClick)
                    .on({
                        'mouseup.contextMenu': handle.itemClick,
                        'contextmenu:focus.contextMenu': handle.focusItem,
                        'contextmenu:blur.contextMenu': handle.blurItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.itemMouseenter,
                        'mouseleave.contextMenu': handle.itemMouseleave
                    }, '.context-menu-item');

                initialized = true;
            }
            
            // engage native contextmenu event
            $context
                .on('contextmenu' + o.ns, o.selector, o, handle.contextmenu);
            
            if (_hasContext) {
                // add remove hook, just in case
                $context.on('remove' + o.ns, function() {
                    $(this).contextMenu("destroy");
                });
            }
            
            switch (o.trigger) {
                case 'hover':
                        $context
                            .on('mouseenter' + o.ns, o.selector, o, handle.mouseenter)
                            .on('mouseleave' + o.ns, o.selector, o, handle.mouseleave);                    
                    break;
                    
                case 'left':
                        $context.on('click' + o.ns, o.selector, o, handle.click);
                    break;
                /*
                default:
                    // http://www.quirksmode.org/dom/events/contextmenu.html
                    $document
                        .on('mousedown' + o.ns, o.selector, o, handle.mousedown)
                        .on('mouseup' + o.ns, o.selector, o, handle.mouseup);
                    break;
                */
            }
            
            // create menu
            if (!o.build) {
                op.create(o);
            }
            break;
        
        case 'destroy':
            var $visibleMenu;
            if (_hasContext) {
                // get proper options 
                var context = o.context;
                $.each(menus, function(ns, o) {
                    if (o.context !== context) {
                        return true;
                    }
                    
                    $visibleMenu = $('.context-menu-list').filter(':visible');
                    if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
                        $visibleMenu.trigger('contextmenu:hide', {force: true});
                    }

                    try {
                        if (menus[o.ns].$menu) {
                            menus[o.ns].$menu.remove();
                        }

                        delete menus[o.ns];
                    } catch(e) {
                        menus[o.ns] = null;
                    }

                    $(o.context).off(o.ns);
                    
                    return true;
                });
            } else if (!o.selector) {
                $document.off('.contextMenu .contextMenuAutoHide');
                $.each(menus, function(ns, o) {
                    $(o.context).off(o.ns);
                });
                
                namespaces = {};
                menus = {};
                counter = 0;
                initialized = false;
                
                $('#context-menu-layer, .context-menu-list').remove();
            } else if (namespaces[o.selector]) {
                $visibleMenu = $('.context-menu-list').filter(':visible');
                if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(o.selector)) {
                    $visibleMenu.trigger('contextmenu:hide', {force: true});
                }
                
                try {
                    if (menus[namespaces[o.selector]].$menu) {
                        menus[namespaces[o.selector]].$menu.remove();
                    }
                    
                    delete menus[namespaces[o.selector]];
                } catch(e) {
                    menus[namespaces[o.selector]] = null;
                }
                
                $document.off(namespaces[o.selector]);
            }
            break;
        
        case 'html5':
            // if <command> or <menuitem> are not handled by the browser,
            // or options was a bool true,
            // initialize $.contextMenu for them
            if ((!$.support.htmlCommand && !$.support.htmlMenuitem) || (typeof options == "boolean" && options)) {
                $('menu[type="context"]').each(function() {
                    if (this.id) {
                        $.contextMenu({
                            selector: '[contextmenu=' + this.id +']',
                            items: $.contextMenu.fromMenu(this)
                        });
                    }
                }).css('display', 'none');
            }
            break;
        
        default:
            throw new Error('Unknown operation "' + operation + '"');
    }
    
    return this;
};

// import values into <input> commands
$.contextMenu.setInputValues = function(opt, data) {
    if (data === undefined) {
        data = {};
    }
    
    $.each(opt.inputs, function(key, item) {
        switch (item.type) {
            case 'text':
            case 'textarea':
                item.value = data[key] || "";
                break;

            case 'checkbox':
                item.selected = data[key] ? true : false;
                break;
                
            case 'radio':
                item.selected = (data[item.radio] || "") == item.value ? true : false;
                break;
            
            case 'select':
                item.selected = data[key] || "";
                break;
        }
    });
};

// export values from <input> commands
$.contextMenu.getInputValues = function(opt, data) {
    if (data === undefined) {
        data = {};
    }
    
    $.each(opt.inputs, function(key, item) {
        switch (item.type) {
            case 'text':
            case 'textarea':
            case 'select':
                data[key] = item.$input.val();
                break;

            case 'checkbox':
                data[key] = item.$input.prop('checked');
                break;
                
            case 'radio':
                if (item.$input.prop('checked')) {
                    data[item.radio] = item.value;
                }
                break;
        }
    });
    
    return data;
};

// find <label for="xyz">
function inputLabel(node) {
    return (node.id && $('label[for="'+ node.id +'"]').val()) || node.name;
}

// convert <menu> to items object
function menuChildren(items, $children, counter) {
    if (!counter) {
        counter = 0;
    }
    
    $children.each(function() {
        var $node = $(this),
            node = this,
            nodeName = this.nodeName.toLowerCase(),
            label,
            item;
        
        // extract <label><input>
        if (nodeName == 'label' && $node.find('input, textarea, select').length) {
            label = $node.text();
            $node = $node.children().first();
            node = $node.get(0);
            nodeName = node.nodeName.toLowerCase();
        }
        
        /*
         * <menu> accepts flow-content as children. that means <embed>, <canvas> and such are valid menu items.
         * Not being the sadistic kind, $.contextMenu only accepts:
         * <command>, <menuitem>, <hr>, <span>, <p> <input [text, radio, checkbox]>, <textarea>, <select> and of course <menu>.
         * Everything else will be imported as an html node, which is not interfaced with contextMenu.
         */
        
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#concept-command
        switch (nodeName) {
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#the-menu-element
            case 'menu':
                item = {name: $node.attr('label'), items: {}};
                counter = menuChildren(item.items, $node.children(), counter);
                break;
            
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-a-element-to-define-a-command
            case 'a':
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-button-element-to-define-a-command
            case 'button':
                item = {
                    name: $node.text(),
                    disabled: !!$node.attr('disabled'),
                    callback: (function(){ return function(){ $node.click(); }; })()
                };
                break;
            
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-command-element-to-define-a-command

            case 'menuitem':
            case 'command':
                switch ($node.attr('type')) {
                    case undefined:
                    case 'command':
                    case 'menuitem':
                        item = {
                            name: $node.attr('label'),
                            disabled: !!$node.attr('disabled'),
                            callback: (function(){ return function(){ $node.click(); }; })()
                        };
                        break;
                        
                    case 'checkbox':
                        item = {
                            type: 'checkbox',
                            disabled: !!$node.attr('disabled'),
                            name: $node.attr('label'),
                            selected: !!$node.attr('checked')
                        };
                        break;
                        
                    case 'radio':
                        item = {
                            type: 'radio',
                            disabled: !!$node.attr('disabled'),
                            name: $node.attr('label'),
                            radio: $node.attr('radiogroup'),
                            value: $node.attr('id'),
                            selected: !!$node.attr('checked')
                        };
                        break;
                        
                    default:
                        item = undefined;
                }
                break;
 
            case 'hr':
                item = '-------';
                break;
                
            case 'input':
                switch ($node.attr('type')) {
                    case 'text':
                        item = {
                            type: 'text',
                            name: label || inputLabel(node),
                            disabled: !!$node.attr('disabled'),
                            value: $node.val()
                        };
                        break;
                        
                    case 'checkbox':
                        item = {
                            type: 'checkbox',
                            name: label || inputLabel(node),
                            disabled: !!$node.attr('disabled'),
                            selected: !!$node.attr('checked')
                        };
                        break;
                        
                    case 'radio':
                        item = {
                            type: 'radio',
                            name: label || inputLabel(node),
                            disabled: !!$node.attr('disabled'),
                            radio: !!$node.attr('name'),
                            value: $node.val(),
                            selected: !!$node.attr('checked')
                        };
                        break;
                    
                    default:
                        item = undefined;
                        break;
                }
                break;
                
            case 'select':
                item = {
                    type: 'select',
                    name: label || inputLabel(node),
                    disabled: !!$node.attr('disabled'),
                    selected: $node.val(),
                    options: {}
                };
                $node.children().each(function(){
                    item.options[this.value] = $(this).text();
                });
                break;
                
            case 'textarea':
                item = {
                    type: 'textarea',
                    name: label || inputLabel(node),
                    disabled: !!$node.attr('disabled'),
                    value: $node.val()
                };
                break;
            
            case 'label':
                break;
            
            default:
                item = {type: 'html', html: $node.clone(true)};
                break;
        }
        
        if (item) {
            counter++;
            items['key' + counter] = item;
        }
    });
    
    return counter;
}

// convert html5 menu
$.contextMenu.fromMenu = function(element) {
    var $this = $(element),
        items = {};
        
    menuChildren(items, $this.children());
    
    return items;
};

// make defaults accessible
$.contextMenu.defaults = defaults;
$.contextMenu.types = types;
// export internal functions - undocumented, for hacking only!
$.contextMenu.handle = handle;
$.contextMenu.op = op;
$.contextMenu.menus = menus;

})(jQuery);
!function(){function n(n,t){return t>n?-1:n>t?1:n>=t?0:0/0}function t(n){return null===n?0/0:+n}function e(n){return!isNaN(n)}function r(n){return{left:function(t,e,r,u){for(arguments.length<3&&(r=0),arguments.length<4&&(u=t.length);u>r;){var i=r+u>>>1;n(t[i],e)<0?r=i+1:u=i}return r},right:function(t,e,r,u){for(arguments.length<3&&(r=0),arguments.length<4&&(u=t.length);u>r;){var i=r+u>>>1;n(t[i],e)>0?u=i:r=i+1}return r}}}function u(n){return n.length}function i(n){for(var t=1;n*t%1;)t*=10;return t}function o(n,t){for(var e in t)Object.defineProperty(n.prototype,e,{value:t[e],enumerable:!1})}function a(){this._=Object.create(null)}function c(n){return(n+="")===la||n[0]===sa?sa+n:n}function l(n){return(n+="")[0]===sa?n.slice(1):n}function s(n){return c(n)in this._}function f(n){return(n=c(n))in this._&&delete this._[n]}function h(){var n=[];for(var t in this._)n.push(l(t));return n}function g(){var n=0;for(var t in this._)++n;return n}function p(){for(var n in this._)return!1;return!0}function v(){this._=Object.create(null)}function d(n,t,e){return function(){var r=e.apply(t,arguments);return r===t?n:r}}function m(n,t){if(t in n)return t;t=t.charAt(0).toUpperCase()+t.slice(1);for(var e=0,r=fa.length;r>e;++e){var u=fa[e]+t;if(u in n)return u}}function y(){}function x(){}function M(n){function t(){for(var t,r=e,u=-1,i=r.length;++u<i;)(t=r[u].on)&&t.apply(this,arguments);return n}var e=[],r=new a;return t.on=function(t,u){var i,o=r.get(t);return arguments.length<2?o&&o.on:(o&&(o.on=null,e=e.slice(0,i=e.indexOf(o)).concat(e.slice(i+1)),r.remove(t)),u&&e.push(r.set(t,{on:u})),n)},t}function _(){Bo.event.preventDefault()}function b(){for(var n,t=Bo.event;n=t.sourceEvent;)t=n;return t}function w(n){for(var t=new x,e=0,r=arguments.length;++e<r;)t[arguments[e]]=M(t);return t.of=function(e,r){return function(u){try{var i=u.sourceEvent=Bo.event;u.target=n,Bo.event=u,t[u.type].apply(e,r)}finally{Bo.event=i}}},t}function S(n){return ga(n,ya),n}function k(n){return"function"==typeof n?n:function(){return pa(n,this)}}function E(n){return"function"==typeof n?n:function(){return va(n,this)}}function A(n,t){function e(){this.removeAttribute(n)}function r(){this.removeAttributeNS(n.space,n.local)}function u(){this.setAttribute(n,t)}function i(){this.setAttributeNS(n.space,n.local,t)}function o(){var e=t.apply(this,arguments);null==e?this.removeAttribute(n):this.setAttribute(n,e)}function a(){var e=t.apply(this,arguments);null==e?this.removeAttributeNS(n.space,n.local):this.setAttributeNS(n.space,n.local,e)}return n=Bo.ns.qualify(n),null==t?n.local?r:e:"function"==typeof t?n.local?a:o:n.local?i:u}function C(n){return n.trim().replace(/\s+/g," ")}function N(n){return new RegExp("(?:^|\\s+)"+Bo.requote(n)+"(?:\\s+|$)","g")}function z(n){return(n+"").trim().split(/^|\s+/)}function L(n,t){function e(){for(var e=-1;++e<u;)n[e](this,t)}function r(){for(var e=-1,r=t.apply(this,arguments);++e<u;)n[e](this,r)}n=z(n).map(T);var u=n.length;return"function"==typeof t?r:e}function T(n){var t=N(n);return function(e,r){if(u=e.classList)return r?u.add(n):u.remove(n);var u=e.getAttribute("class")||"";r?(t.lastIndex=0,t.test(u)||e.setAttribute("class",C(u+" "+n))):e.setAttribute("class",C(u.replace(t," ")))}}function q(n,t,e){function r(){this.style.removeProperty(n)}function u(){this.style.setProperty(n,t,e)}function i(){var r=t.apply(this,arguments);null==r?this.style.removeProperty(n):this.style.setProperty(n,r,e)}return null==t?r:"function"==typeof t?i:u}function R(n,t){function e(){delete this[n]}function r(){this[n]=t}function u(){var e=t.apply(this,arguments);null==e?delete this[n]:this[n]=e}return null==t?e:"function"==typeof t?u:r}function D(n){return"function"==typeof n?n:(n=Bo.ns.qualify(n)).local?function(){return this.ownerDocument.createElementNS(n.space,n.local)}:function(){return this.ownerDocument.createElementNS(this.namespaceURI,n)}}function P(n){return{__data__:n}}function U(n){return function(){return ma(this,n)}}function j(t){return arguments.length||(t=n),function(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}}function F(n,t){for(var e=0,r=n.length;r>e;e++)for(var u,i=n[e],o=0,a=i.length;a>o;o++)(u=i[o])&&t(u,o,e);return n}function H(n){return ga(n,Ma),n}function O(n){var t,e;return function(r,u,i){var o,a=n[i].update,c=a.length;for(i!=e&&(e=i,t=0),u>=t&&(t=u+1);!(o=a[t])&&++t<c;);return o}}function Y(){var n=this.__transition__;n&&++n.active}function I(n,t,e){function r(){var t=this[o];t&&(this.removeEventListener(n,t,t.$),delete this[o])}function u(){var u=c(t,Jo(arguments));r.call(this),this.addEventListener(n,this[o]=u,u.$=e),u._=t}function i(){var t,e=new RegExp("^__on([^.]+)"+Bo.requote(n)+"$");for(var r in this)if(t=r.match(e)){var u=this[r];this.removeEventListener(t[1],u,u.$),delete this[r]}}var o="__on"+n,a=n.indexOf("."),c=Z;a>0&&(n=n.slice(0,a));var l=ba.get(n);return l&&(n=l,c=V),a?t?u:r:t?y:i}function Z(n,t){return function(e){var r=Bo.event;Bo.event=e,t[0]=this.__data__;try{n.apply(this,t)}finally{Bo.event=r}}}function V(n,t){var e=Z(n,t);return function(n){var t=this,r=n.relatedTarget;r&&(r===t||8&r.compareDocumentPosition(t))||e.call(t,n)}}function X(){var n=".dragsuppress-"+ ++Sa,t="click"+n,e=Bo.select(Qo).on("touchmove"+n,_).on("dragstart"+n,_).on("selectstart"+n,_);if(wa){var r=Ko.style,u=r[wa];r[wa]="none"}return function(i){function o(){e.on(t,null)}e.on(n,null),wa&&(r[wa]=u),i&&(e.on(t,function(){_(),o()},!0),setTimeout(o,0))}}function $(n,t){t.changedTouches&&(t=t.changedTouches[0]);var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();if(0>ka&&(Qo.scrollX||Qo.scrollY)){e=Bo.select("body").append("svg").style({position:"absolute",top:0,left:0,margin:0,padding:0,border:"none"},"important");var u=e[0][0].getScreenCTM();ka=!(u.f||u.e),e.remove()}return ka?(r.x=t.pageX,r.y=t.pageY):(r.x=t.clientX,r.y=t.clientY),r=r.matrixTransform(n.getScreenCTM().inverse()),[r.x,r.y]}var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}function B(){return Bo.event.changedTouches[0].identifier}function W(){return Bo.event.target}function J(){return Qo}function G(n){return n>0?1:0>n?-1:0}function K(n,t,e){return(t[0]-n[0])*(e[1]-n[1])-(t[1]-n[1])*(e[0]-n[0])}function Q(n){return n>1?0:-1>n?Ea:Math.acos(n)}function nt(n){return n>1?Ca:-1>n?-Ca:Math.asin(n)}function tt(n){return((n=Math.exp(n))-1/n)/2}function et(n){return((n=Math.exp(n))+1/n)/2}function rt(n){return((n=Math.exp(2*n))-1)/(n+1)}function ut(n){return(n=Math.sin(n/2))*n}function it(){}function ot(n,t,e){return this instanceof ot?(this.h=+n,this.s=+t,void(this.l=+e)):arguments.length<2?n instanceof ot?new ot(n.h,n.s,n.l):Mt(""+n,_t,ot):new ot(n,t,e)}function at(n,t,e){function r(n){return n>360?n-=360:0>n&&(n+=360),60>n?i+(o-i)*n/60:180>n?o:240>n?i+(o-i)*(240-n)/60:i}function u(n){return Math.round(255*r(n))}var i,o;return n=isNaN(n)?0:(n%=360)<0?n+360:n,t=isNaN(t)?0:0>t?0:t>1?1:t,e=0>e?0:e>1?1:e,o=.5>=e?e*(1+t):e+t-e*t,i=2*e-o,new dt(u(n+120),u(n),u(n-120))}function ct(n,t,e){return this instanceof ct?(this.h=+n,this.c=+t,void(this.l=+e)):arguments.length<2?n instanceof ct?new ct(n.h,n.c,n.l):n instanceof st?ht(n.l,n.a,n.b):ht((n=bt((n=Bo.rgb(n)).r,n.g,n.b)).l,n.a,n.b):new ct(n,t,e)}function lt(n,t,e){return isNaN(n)&&(n=0),isNaN(t)&&(t=0),new st(e,Math.cos(n*=La)*t,Math.sin(n)*t)}function st(n,t,e){return this instanceof st?(this.l=+n,this.a=+t,void(this.b=+e)):arguments.length<2?n instanceof st?new st(n.l,n.a,n.b):n instanceof ct?lt(n.h,n.c,n.l):bt((n=dt(n)).r,n.g,n.b):new st(n,t,e)}function ft(n,t,e){var r=(n+16)/116,u=r+t/500,i=r-e/200;return u=gt(u)*Ya,r=gt(r)*Ia,i=gt(i)*Za,new dt(vt(3.2404542*u-1.5371385*r-.4985314*i),vt(-.969266*u+1.8760108*r+.041556*i),vt(.0556434*u-.2040259*r+1.0572252*i))}function ht(n,t,e){return n>0?new ct(Math.atan2(e,t)*Ta,Math.sqrt(t*t+e*e),n):new ct(0/0,0/0,n)}function gt(n){return n>.206893034?n*n*n:(n-4/29)/7.787037}function pt(n){return n>.008856?Math.pow(n,1/3):7.787037*n+4/29}function vt(n){return Math.round(255*(.00304>=n?12.92*n:1.055*Math.pow(n,1/2.4)-.055))}function dt(n,t,e){return this instanceof dt?(this.r=~~n,this.g=~~t,void(this.b=~~e)):arguments.length<2?n instanceof dt?new dt(n.r,n.g,n.b):Mt(""+n,dt,at):new dt(n,t,e)}function mt(n){return new dt(n>>16,255&n>>8,255&n)}function yt(n){return mt(n)+""}function xt(n){return 16>n?"0"+Math.max(0,n).toString(16):Math.min(255,n).toString(16)}function Mt(n,t,e){var r,u,i,o=0,a=0,c=0;if(r=/([a-z]+)\((.*)\)/i.exec(n))switch(u=r[2].split(","),r[1]){case"hsl":return e(parseFloat(u[0]),parseFloat(u[1])/100,parseFloat(u[2])/100);case"rgb":return t(St(u[0]),St(u[1]),St(u[2]))}return(i=$a.get(n))?t(i.r,i.g,i.b):(null==n||"#"!==n.charAt(0)||isNaN(i=parseInt(n.slice(1),16))||(4===n.length?(o=(3840&i)>>4,o=o>>4|o,a=240&i,a=a>>4|a,c=15&i,c=c<<4|c):7===n.length&&(o=(16711680&i)>>16,a=(65280&i)>>8,c=255&i)),t(o,a,c))}function _t(n,t,e){var r,u,i=Math.min(n/=255,t/=255,e/=255),o=Math.max(n,t,e),a=o-i,c=(o+i)/2;return a?(u=.5>c?a/(o+i):a/(2-o-i),r=n==o?(t-e)/a+(e>t?6:0):t==o?(e-n)/a+2:(n-t)/a+4,r*=60):(r=0/0,u=c>0&&1>c?0:r),new ot(r,u,c)}function bt(n,t,e){n=wt(n),t=wt(t),e=wt(e);var r=pt((.4124564*n+.3575761*t+.1804375*e)/Ya),u=pt((.2126729*n+.7151522*t+.072175*e)/Ia),i=pt((.0193339*n+.119192*t+.9503041*e)/Za);return st(116*u-16,500*(r-u),200*(u-i))}function wt(n){return(n/=255)<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function St(n){var t=parseFloat(n);return"%"===n.charAt(n.length-1)?Math.round(2.55*t):t}function kt(n){return"function"==typeof n?n:function(){return n}}function Et(n){return n}function At(n){return function(t,e,r){return 2===arguments.length&&"function"==typeof e&&(r=e,e=null),Ct(t,e,n,r)}}function Ct(n,t,e,r){function u(){var n,t=c.status;if(!t&&zt(c)||t>=200&&300>t||304===t){try{n=e.call(i,c)}catch(r){return o.error.call(i,r),void 0}o.load.call(i,n)}else o.error.call(i,c)}var i={},o=Bo.dispatch("beforesend","progress","load","error"),a={},c=new XMLHttpRequest,l=null;return!Qo.XDomainRequest||"withCredentials"in c||!/^(http(s)?:)?\/\//.test(n)||(c=new XDomainRequest),"onload"in c?c.onload=c.onerror=u:c.onreadystatechange=function(){c.readyState>3&&u()},c.onprogress=function(n){var t=Bo.event;Bo.event=n;try{o.progress.call(i,c)}finally{Bo.event=t}},i.header=function(n,t){return n=(n+"").toLowerCase(),arguments.length<2?a[n]:(null==t?delete a[n]:a[n]=t+"",i)},i.mimeType=function(n){return arguments.length?(t=null==n?null:n+"",i):t},i.responseType=function(n){return arguments.length?(l=n,i):l},i.response=function(n){return e=n,i},["get","post"].forEach(function(n){i[n]=function(){return i.send.apply(i,[n].concat(Jo(arguments)))}}),i.send=function(e,r,u){if(2===arguments.length&&"function"==typeof r&&(u=r,r=null),c.open(e,n,!0),null==t||"accept"in a||(a.accept=t+",*/*"),c.setRequestHeader)for(var s in a)c.setRequestHeader(s,a[s]);return null!=t&&c.overrideMimeType&&c.overrideMimeType(t),null!=l&&(c.responseType=l),null!=u&&i.on("error",u).on("load",function(n){u(null,n)}),o.beforesend.call(i,c),c.send(null==r?null:r),i},i.abort=function(){return c.abort(),i},Bo.rebind(i,o,"on"),null==r?i:i.get(Nt(r))}function Nt(n){return 1===n.length?function(t,e){n(null==t?e:null)}:n}function zt(n){var t=n.responseType;return t&&"text"!==t?n.response:n.responseText}function Lt(){var n=Tt(),t=qt()-n;t>24?(isFinite(t)&&(clearTimeout(Ga),Ga=setTimeout(Lt,t)),Ja=0):(Ja=1,Qa(Lt))}function Tt(){var n=Date.now();for(Ka=Ba;Ka;)n>=Ka.t&&(Ka.f=Ka.c(n-Ka.t)),Ka=Ka.n;return n}function qt(){for(var n,t=Ba,e=1/0;t;)t.f?t=n?n.n=t.n:Ba=t.n:(t.t<e&&(e=t.t),t=(n=t).n);return Wa=n,e}function Rt(n,t){return t-(n?Math.ceil(Math.log(n)/Math.LN10):1)}function Dt(n,t){var e=Math.pow(10,3*ca(8-t));return{scale:t>8?function(n){return n/e}:function(n){return n*e},symbol:n}}function Pt(n){var t=n.decimal,e=n.thousands,r=n.grouping,u=n.currency,i=r&&e?function(n,t){for(var u=n.length,i=[],o=0,a=r[0],c=0;u>0&&a>0&&(c+a+1>t&&(a=Math.max(1,t-c)),i.push(n.substring(u-=a,u+a)),!((c+=a+1)>t));)a=r[o=(o+1)%r.length];return i.reverse().join(e)}:Et;return function(n){var e=tc.exec(n),r=e[1]||" ",o=e[2]||">",a=e[3]||"-",c=e[4]||"",l=e[5],s=+e[6],f=e[7],h=e[8],g=e[9],p=1,v="",d="",m=!1,y=!0;switch(h&&(h=+h.substring(1)),(l||"0"===r&&"="===o)&&(l=r="0",o="="),g){case"n":f=!0,g="g";break;case"%":p=100,d="%",g="f";break;case"p":p=100,d="%",g="r";break;case"b":case"o":case"x":case"X":"#"===c&&(v="0"+g.toLowerCase());case"c":y=!1;case"d":m=!0,h=0;break;case"s":p=-1,g="r"}"$"===c&&(v=u[0],d=u[1]),"r"!=g||h||(g="g"),null!=h&&("g"==g?h=Math.max(1,Math.min(21,h)):("e"==g||"f"==g)&&(h=Math.max(0,Math.min(20,h)))),g=ec.get(g)||Ut;var x=l&&f;return function(n){var e=d;if(m&&n%1)return"";var u=0>n||0===n&&0>1/n?(n=-n,"-"):"-"===a?"":a;if(0>p){var c=Bo.formatPrefix(n,h);n=c.scale(n),e=c.symbol+d}else n*=p;n=g(n,h);var M,_,b=n.lastIndexOf(".");if(0>b){var w=y?n.lastIndexOf("e"):-1;0>w?(M=n,_=""):(M=n.substring(0,w),_=n.substring(w))}else M=n.substring(0,b),_=t+n.substring(b+1);!l&&f&&(M=i(M,1/0));var S=v.length+M.length+_.length+(x?0:u.length),k=s>S?new Array(S=s-S+1).join(r):"";return x&&(M=i(k+M,k.length?s-_.length:1/0)),u+=v,n=M+_,("<"===o?u+n+k:">"===o?k+u+n:"^"===o?k.substring(0,S>>=1)+u+n+k.substring(S):u+(x?n:k+n))+e}}}function Ut(n){return n+""}function jt(){this._=new Date(arguments.length>1?Date.UTC.apply(this,arguments):arguments[0])}function Ft(n,t,e){function r(t){var e=n(t),r=i(e,1);return r-t>t-e?e:r}function u(e){return t(e=n(new uc(e-1)),1),e}function i(n,e){return t(n=new uc(+n),e),n}function o(n,r,i){var o=u(n),a=[];if(i>1)for(;r>o;)e(o)%i||a.push(new Date(+o)),t(o,1);else for(;r>o;)a.push(new Date(+o)),t(o,1);return a}function a(n,t,e){try{uc=jt;var r=new jt;return r._=n,o(r,t,e)}finally{uc=Date}}n.floor=n,n.round=r,n.ceil=u,n.offset=i,n.range=o;var c=n.utc=Ht(n);return c.floor=c,c.round=Ht(r),c.ceil=Ht(u),c.offset=Ht(i),c.range=a,n}function Ht(n){return function(t,e){try{uc=jt;var r=new jt;return r._=t,n(r,e)._}finally{uc=Date}}}function Ot(n){function t(n){function t(t){for(var e,u,i,o=[],a=-1,c=0;++a<r;)37===n.charCodeAt(a)&&(o.push(n.slice(c,a)),null!=(u=oc[e=n.charAt(++a)])&&(e=n.charAt(++a)),(i=C[e])&&(e=i(t,null==u?"e"===e?" ":"0":u)),o.push(e),c=a+1);return o.push(n.slice(c,a)),o.join("")}var r=n.length;return t.parse=function(t){var r={y:1900,m:0,d:1,H:0,M:0,S:0,L:0,Z:null},u=e(r,n,t,0);if(u!=t.length)return null;"p"in r&&(r.H=r.H%12+12*r.p);var i=null!=r.Z&&uc!==jt,o=new(i?jt:uc);return"j"in r?o.setFullYear(r.y,0,r.j):"w"in r&&("W"in r||"U"in r)?(o.setFullYear(r.y,0,1),o.setFullYear(r.y,0,"W"in r?(r.w+6)%7+7*r.W-(o.getDay()+5)%7:r.w+7*r.U-(o.getDay()+6)%7)):o.setFullYear(r.y,r.m,r.d),o.setHours(r.H+(0|r.Z/100),r.M+r.Z%100,r.S,r.L),i?o._:o},t.toString=function(){return n},t}function e(n,t,e,r){for(var u,i,o,a=0,c=t.length,l=e.length;c>a;){if(r>=l)return-1;if(u=t.charCodeAt(a++),37===u){if(o=t.charAt(a++),i=N[o in oc?t.charAt(a++):o],!i||(r=i(n,e,r))<0)return-1}else if(u!=e.charCodeAt(r++))return-1}return r}function r(n,t,e){b.lastIndex=0;var r=b.exec(t.slice(e));return r?(n.w=w.get(r[0].toLowerCase()),e+r[0].length):-1}function u(n,t,e){M.lastIndex=0;var r=M.exec(t.slice(e));return r?(n.w=_.get(r[0].toLowerCase()),e+r[0].length):-1}function i(n,t,e){E.lastIndex=0;var r=E.exec(t.slice(e));return r?(n.m=A.get(r[0].toLowerCase()),e+r[0].length):-1}function o(n,t,e){S.lastIndex=0;var r=S.exec(t.slice(e));return r?(n.m=k.get(r[0].toLowerCase()),e+r[0].length):-1}function a(n,t,r){return e(n,C.c.toString(),t,r)}function c(n,t,r){return e(n,C.x.toString(),t,r)}function l(n,t,r){return e(n,C.X.toString(),t,r)}function s(n,t,e){var r=x.get(t.slice(e,e+=2).toLowerCase());return null==r?-1:(n.p=r,e)}var f=n.dateTime,h=n.date,g=n.time,p=n.periods,v=n.days,d=n.shortDays,m=n.months,y=n.shortMonths;t.utc=function(n){function e(n){try{uc=jt;var t=new uc;return t._=n,r(t)}finally{uc=Date}}var r=t(n);return e.parse=function(n){try{uc=jt;var t=r.parse(n);return t&&t._}finally{uc=Date}},e.toString=r.toString,e},t.multi=t.utc.multi=ae;var x=Bo.map(),M=It(v),_=Zt(v),b=It(d),w=Zt(d),S=It(m),k=Zt(m),E=It(y),A=Zt(y);p.forEach(function(n,t){x.set(n.toLowerCase(),t)});var C={a:function(n){return d[n.getDay()]},A:function(n){return v[n.getDay()]},b:function(n){return y[n.getMonth()]},B:function(n){return m[n.getMonth()]},c:t(f),d:function(n,t){return Yt(n.getDate(),t,2)},e:function(n,t){return Yt(n.getDate(),t,2)},H:function(n,t){return Yt(n.getHours(),t,2)},I:function(n,t){return Yt(n.getHours()%12||12,t,2)},j:function(n,t){return Yt(1+rc.dayOfYear(n),t,3)},L:function(n,t){return Yt(n.getMilliseconds(),t,3)},m:function(n,t){return Yt(n.getMonth()+1,t,2)},M:function(n,t){return Yt(n.getMinutes(),t,2)},p:function(n){return p[+(n.getHours()>=12)]},S:function(n,t){return Yt(n.getSeconds(),t,2)},U:function(n,t){return Yt(rc.sundayOfYear(n),t,2)},w:function(n){return n.getDay()},W:function(n,t){return Yt(rc.mondayOfYear(n),t,2)},x:t(h),X:t(g),y:function(n,t){return Yt(n.getFullYear()%100,t,2)},Y:function(n,t){return Yt(n.getFullYear()%1e4,t,4)},Z:ie,"%":function(){return"%"}},N={a:r,A:u,b:i,B:o,c:a,d:Qt,e:Qt,H:te,I:te,j:ne,L:ue,m:Kt,M:ee,p:s,S:re,U:Xt,w:Vt,W:$t,x:c,X:l,y:Wt,Y:Bt,Z:Jt,"%":oe};return t}function Yt(n,t,e){var r=0>n?"-":"",u=(r?-n:n)+"",i=u.length;return r+(e>i?new Array(e-i+1).join(t)+u:u)}function It(n){return new RegExp("^(?:"+n.map(Bo.requote).join("|")+")","i")}function Zt(n){for(var t=new a,e=-1,r=n.length;++e<r;)t.set(n[e].toLowerCase(),e);return t}function Vt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+1));return r?(n.w=+r[0],e+r[0].length):-1}function Xt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e));return r?(n.U=+r[0],e+r[0].length):-1}function $t(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e));return r?(n.W=+r[0],e+r[0].length):-1}function Bt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+4));return r?(n.y=+r[0],e+r[0].length):-1}function Wt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.y=Gt(+r[0]),e+r[0].length):-1}function Jt(n,t,e){return/^[+-]\d{4}$/.test(t=t.slice(e,e+5))?(n.Z=-t,e+5):-1}function Gt(n){return n+(n>68?1900:2e3)}function Kt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.m=r[0]-1,e+r[0].length):-1}function Qt(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.d=+r[0],e+r[0].length):-1}function ne(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+3));return r?(n.j=+r[0],e+r[0].length):-1}function te(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.H=+r[0],e+r[0].length):-1}function ee(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.M=+r[0],e+r[0].length):-1}function re(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+2));return r?(n.S=+r[0],e+r[0].length):-1}function ue(n,t,e){ac.lastIndex=0;var r=ac.exec(t.slice(e,e+3));return r?(n.L=+r[0],e+r[0].length):-1}function ie(n){var t=n.getTimezoneOffset(),e=t>0?"-":"+",r=0|ca(t)/60,u=ca(t)%60;return e+Yt(r,"0",2)+Yt(u,"0",2)}function oe(n,t,e){cc.lastIndex=0;var r=cc.exec(t.slice(e,e+1));return r?e+r[0].length:-1}function ae(n){for(var t=n.length,e=-1;++e<t;)n[e][0]=this(n[e][0]);return function(t){for(var e=0,r=n[e];!r[1](t);)r=n[++e];return r[0](t)}}function ce(){}function le(n,t,e){var r=e.s=n+t,u=r-n,i=r-u;e.t=n-i+(t-u)}function se(n,t){n&&hc.hasOwnProperty(n.type)&&hc[n.type](n,t)}function fe(n,t,e){var r,u=-1,i=n.length-e;for(t.lineStart();++u<i;)r=n[u],t.point(r[0],r[1],r[2]);t.lineEnd()}function he(n,t){var e=-1,r=n.length;for(t.polygonStart();++e<r;)fe(n[e],t,1);t.polygonEnd()}function ge(){function n(n,t){n*=La,t=t*La/2+Ea/4;var e=n-r,o=e>=0?1:-1,a=o*e,c=Math.cos(t),l=Math.sin(t),s=i*l,f=u*c+s*Math.cos(a),h=s*o*Math.sin(a);pc.add(Math.atan2(h,f)),r=n,u=c,i=l}var t,e,r,u,i;vc.point=function(o,a){vc.point=n,r=(t=o)*La,u=Math.cos(a=(e=a)*La/2+Ea/4),i=Math.sin(a)},vc.lineEnd=function(){n(t,e)}}function pe(n){var t=n[0],e=n[1],r=Math.cos(e);return[r*Math.cos(t),r*Math.sin(t),Math.sin(e)]}function ve(n,t){return n[0]*t[0]+n[1]*t[1]+n[2]*t[2]}function de(n,t){return[n[1]*t[2]-n[2]*t[1],n[2]*t[0]-n[0]*t[2],n[0]*t[1]-n[1]*t[0]]}function me(n,t){n[0]+=t[0],n[1]+=t[1],n[2]+=t[2]}function ye(n,t){return[n[0]*t,n[1]*t,n[2]*t]}function xe(n){var t=Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]);n[0]/=t,n[1]/=t,n[2]/=t}function Me(n){return[Math.atan2(n[1],n[0]),nt(n[2])]}function _e(n,t){return ca(n[0]-t[0])<Na&&ca(n[1]-t[1])<Na}function be(n,t){n*=La;var e=Math.cos(t*=La);we(e*Math.cos(n),e*Math.sin(n),Math.sin(t))}function we(n,t,e){++dc,yc+=(n-yc)/dc,xc+=(t-xc)/dc,Mc+=(e-Mc)/dc}function Se(){function n(n,u){n*=La;var i=Math.cos(u*=La),o=i*Math.cos(n),a=i*Math.sin(n),c=Math.sin(u),l=Math.atan2(Math.sqrt((l=e*c-r*a)*l+(l=r*o-t*c)*l+(l=t*a-e*o)*l),t*o+e*a+r*c);mc+=l,_c+=l*(t+(t=o)),bc+=l*(e+(e=a)),wc+=l*(r+(r=c)),we(t,e,r)}var t,e,r;Ac.point=function(u,i){u*=La;var o=Math.cos(i*=La);t=o*Math.cos(u),e=o*Math.sin(u),r=Math.sin(i),Ac.point=n,we(t,e,r)}}function ke(){Ac.point=be}function Ee(){function n(n,t){n*=La;var e=Math.cos(t*=La),o=e*Math.cos(n),a=e*Math.sin(n),c=Math.sin(t),l=u*c-i*a,s=i*o-r*c,f=r*a-u*o,h=Math.sqrt(l*l+s*s+f*f),g=r*o+u*a+i*c,p=h&&-Q(g)/h,v=Math.atan2(h,g);Sc+=p*l,kc+=p*s,Ec+=p*f,mc+=v,_c+=v*(r+(r=o)),bc+=v*(u+(u=a)),wc+=v*(i+(i=c)),we(r,u,i)}var t,e,r,u,i;Ac.point=function(o,a){t=o,e=a,Ac.point=n,o*=La;var c=Math.cos(a*=La);r=c*Math.cos(o),u=c*Math.sin(o),i=Math.sin(a),we(r,u,i)},Ac.lineEnd=function(){n(t,e),Ac.lineEnd=ke,Ac.point=be}}function Ae(){return!0}function Ce(n,t,e,r,u){var i=[],o=[];if(n.forEach(function(n){if(!((t=n.length-1)<=0)){var t,e=n[0],r=n[t];if(_e(e,r)){u.lineStart();for(var a=0;t>a;++a)u.point((e=n[a])[0],e[1]);return u.lineEnd(),void 0}var c=new ze(e,n,null,!0),l=new ze(e,null,c,!1);c.o=l,i.push(c),o.push(l),c=new ze(r,n,null,!1),l=new ze(r,null,c,!0),c.o=l,i.push(c),o.push(l)}}),o.sort(t),Ne(i),Ne(o),i.length){for(var a=0,c=e,l=o.length;l>a;++a)o[a].e=c=!c;for(var s,f,h=i[0];;){for(var g=h,p=!0;g.v;)if((g=g.n)===h)return;s=g.z,u.lineStart();do{if(g.v=g.o.v=!0,g.e){if(p)for(var a=0,l=s.length;l>a;++a)u.point((f=s[a])[0],f[1]);else r(g.x,g.n.x,1,u);g=g.n}else{if(p){s=g.p.z;for(var a=s.length-1;a>=0;--a)u.point((f=s[a])[0],f[1])}else r(g.x,g.p.x,-1,u);g=g.p}g=g.o,s=g.z,p=!p}while(!g.v);u.lineEnd()}}}function Ne(n){if(t=n.length){for(var t,e,r=0,u=n[0];++r<t;)u.n=e=n[r],e.p=u,u=e;u.n=e=n[0],e.p=u}}function ze(n,t,e,r){this.x=n,this.z=t,this.o=e,this.e=r,this.v=!1,this.n=this.p=null}function Le(n,t,e,r){return function(u,i){function o(t,e){var r=u(t,e);n(t=r[0],e=r[1])&&i.point(t,e)}function a(n,t){var e=u(n,t);d.point(e[0],e[1])}function c(){y.point=a,d.lineStart()}function l(){y.point=o,d.lineEnd()}function s(n,t){v.push([n,t]);var e=u(n,t);M.point(e[0],e[1])}function f(){M.lineStart(),v=[]}function h(){s(v[0][0],v[0][1]),M.lineEnd();var n,t=M.clean(),e=x.buffer(),r=e.length;if(v.pop(),p.push(v),v=null,r)if(1&t){n=e[0];var u,r=n.length-1,o=-1;if(r>0){for(_||(i.polygonStart(),_=!0),i.lineStart();++o<r;)i.point((u=n[o])[0],u[1]);i.lineEnd()}}else r>1&&2&t&&e.push(e.pop().concat(e.shift())),g.push(e.filter(Te))}var g,p,v,d=t(i),m=u.invert(r[0],r[1]),y={point:o,lineStart:c,lineEnd:l,polygonStart:function(){y.point=s,y.lineStart=f,y.lineEnd=h,g=[],p=[]},polygonEnd:function(){y.point=o,y.lineStart=c,y.lineEnd=l,g=Bo.merge(g);var n=je(m,p);g.length?(_||(i.polygonStart(),_=!0),Ce(g,Re,n,e,i)):n&&(_||(i.polygonStart(),_=!0),i.lineStart(),e(null,null,1,i),i.lineEnd()),_&&(i.polygonEnd(),_=!1),g=p=null},sphere:function(){i.polygonStart(),i.lineStart(),e(null,null,1,i),i.lineEnd(),i.polygonEnd()}},x=qe(),M=t(x),_=!1;return y}}function Te(n){return n.length>1}function qe(){var n,t=[];return{lineStart:function(){t.push(n=[])},point:function(t,e){n.push([t,e])},lineEnd:y,buffer:function(){var e=t;return t=[],n=null,e},rejoin:function(){t.length>1&&t.push(t.pop().concat(t.shift()))}}}function Re(n,t){return((n=n.x)[0]<0?n[1]-Ca-Na:Ca-n[1])-((t=t.x)[0]<0?t[1]-Ca-Na:Ca-t[1])}function De(n){var t,e=0/0,r=0/0,u=0/0;return{lineStart:function(){n.lineStart(),t=1},point:function(i,o){var a=i>0?Ea:-Ea,c=ca(i-e);ca(c-Ea)<Na?(n.point(e,r=(r+o)/2>0?Ca:-Ca),n.point(u,r),n.lineEnd(),n.lineStart(),n.point(a,r),n.point(i,r),t=0):u!==a&&c>=Ea&&(ca(e-u)<Na&&(e-=u*Na),ca(i-a)<Na&&(i-=a*Na),r=Pe(e,r,i,o),n.point(u,r),n.lineEnd(),n.lineStart(),n.point(a,r),t=0),n.point(e=i,r=o),u=a},lineEnd:function(){n.lineEnd(),e=r=0/0},clean:function(){return 2-t}}}function Pe(n,t,e,r){var u,i,o=Math.sin(n-e);return ca(o)>Na?Math.atan((Math.sin(t)*(i=Math.cos(r))*Math.sin(e)-Math.sin(r)*(u=Math.cos(t))*Math.sin(n))/(u*i*o)):(t+r)/2}function Ue(n,t,e,r){var u;if(null==n)u=e*Ca,r.point(-Ea,u),r.point(0,u),r.point(Ea,u),r.point(Ea,0),r.point(Ea,-u),r.point(0,-u),r.point(-Ea,-u),r.point(-Ea,0),r.point(-Ea,u);else if(ca(n[0]-t[0])>Na){var i=n[0]<t[0]?Ea:-Ea;u=e*i/2,r.point(-i,u),r.point(0,u),r.point(i,u)}else r.point(t[0],t[1])}function je(n,t){var e=n[0],r=n[1],u=[Math.sin(e),-Math.cos(e),0],i=0,o=0;pc.reset();for(var a=0,c=t.length;c>a;++a){var l=t[a],s=l.length;if(s)for(var f=l[0],h=f[0],g=f[1]/2+Ea/4,p=Math.sin(g),v=Math.cos(g),d=1;;){d===s&&(d=0),n=l[d];var m=n[0],y=n[1]/2+Ea/4,x=Math.sin(y),M=Math.cos(y),_=m-h,b=_>=0?1:-1,w=b*_,S=w>Ea,k=p*x;if(pc.add(Math.atan2(k*b*Math.sin(w),v*M+k*Math.cos(w))),i+=S?_+b*Aa:_,S^h>=e^m>=e){var E=de(pe(f),pe(n));xe(E);var A=de(u,E);xe(A);var C=(S^_>=0?-1:1)*nt(A[2]);(r>C||r===C&&(E[0]||E[1]))&&(o+=S^_>=0?1:-1)}if(!d++)break;h=m,p=x,v=M,f=n}}return(-Na>i||Na>i&&0>pc)^1&o}function Fe(n){function t(n,t){return Math.cos(n)*Math.cos(t)>i}function e(n){var e,i,c,l,s;return{lineStart:function(){l=c=!1,s=1},point:function(f,h){var g,p=[f,h],v=t(f,h),d=o?v?0:u(f,h):v?u(f+(0>f?Ea:-Ea),h):0;if(!e&&(l=c=v)&&n.lineStart(),v!==c&&(g=r(e,p),(_e(e,g)||_e(p,g))&&(p[0]+=Na,p[1]+=Na,v=t(p[0],p[1]))),v!==c)s=0,v?(n.lineStart(),g=r(p,e),n.point(g[0],g[1])):(g=r(e,p),n.point(g[0],g[1]),n.lineEnd()),e=g;else if(a&&e&&o^v){var m;d&i||!(m=r(p,e,!0))||(s=0,o?(n.lineStart(),n.point(m[0][0],m[0][1]),n.point(m[1][0],m[1][1]),n.lineEnd()):(n.point(m[1][0],m[1][1]),n.lineEnd(),n.lineStart(),n.point(m[0][0],m[0][1])))}!v||e&&_e(e,p)||n.point(p[0],p[1]),e=p,c=v,i=d},lineEnd:function(){c&&n.lineEnd(),e=null},clean:function(){return s|(l&&c)<<1}}}function r(n,t,e){var r=pe(n),u=pe(t),o=[1,0,0],a=de(r,u),c=ve(a,a),l=a[0],s=c-l*l;if(!s)return!e&&n;var f=i*c/s,h=-i*l/s,g=de(o,a),p=ye(o,f),v=ye(a,h);me(p,v);var d=g,m=ve(p,d),y=ve(d,d),x=m*m-y*(ve(p,p)-1);if(!(0>x)){var M=Math.sqrt(x),_=ye(d,(-m-M)/y);if(me(_,p),_=Me(_),!e)return _;var b,w=n[0],S=t[0],k=n[1],E=t[1];w>S&&(b=w,w=S,S=b);var A=S-w,C=ca(A-Ea)<Na,N=C||Na>A;if(!C&&k>E&&(b=k,k=E,E=b),N?C?k+E>0^_[1]<(ca(_[0]-w)<Na?k:E):k<=_[1]&&_[1]<=E:A>Ea^(w<=_[0]&&_[0]<=S)){var z=ye(d,(-m+M)/y);return me(z,p),[_,Me(z)]}}}function u(t,e){var r=o?n:Ea-n,u=0;return-r>t?u|=1:t>r&&(u|=2),-r>e?u|=4:e>r&&(u|=8),u}var i=Math.cos(n),o=i>0,a=ca(i)>Na,c=gr(n,6*La);return Le(t,e,c,o?[0,-n]:[-Ea,n-Ea])}function He(n,t,e,r){return function(u){var i,o=u.a,a=u.b,c=o.x,l=o.y,s=a.x,f=a.y,h=0,g=1,p=s-c,v=f-l;if(i=n-c,p||!(i>0)){if(i/=p,0>p){if(h>i)return;g>i&&(g=i)}else if(p>0){if(i>g)return;i>h&&(h=i)}if(i=e-c,p||!(0>i)){if(i/=p,0>p){if(i>g)return;i>h&&(h=i)}else if(p>0){if(h>i)return;g>i&&(g=i)}if(i=t-l,v||!(i>0)){if(i/=v,0>v){if(h>i)return;g>i&&(g=i)}else if(v>0){if(i>g)return;i>h&&(h=i)}if(i=r-l,v||!(0>i)){if(i/=v,0>v){if(i>g)return;i>h&&(h=i)}else if(v>0){if(h>i)return;g>i&&(g=i)}return h>0&&(u.a={x:c+h*p,y:l+h*v}),1>g&&(u.b={x:c+g*p,y:l+g*v}),u}}}}}}function Oe(n,t,e,r){function u(r,u){return ca(r[0]-n)<Na?u>0?0:3:ca(r[0]-e)<Na?u>0?2:1:ca(r[1]-t)<Na?u>0?1:0:u>0?3:2}function i(n,t){return o(n.x,t.x)}function o(n,t){var e=u(n,1),r=u(t,1);return e!==r?e-r:0===e?t[1]-n[1]:1===e?n[0]-t[0]:2===e?n[1]-t[1]:t[0]-n[0]}return function(a){function c(n){for(var t=0,e=d.length,r=n[1],u=0;e>u;++u)for(var i,o=1,a=d[u],c=a.length,l=a[0];c>o;++o)i=a[o],l[1]<=r?i[1]>r&&K(l,i,n)>0&&++t:i[1]<=r&&K(l,i,n)<0&&--t,l=i;return 0!==t}function l(i,a,c,l){var s=0,f=0;if(null==i||(s=u(i,c))!==(f=u(a,c))||o(i,a)<0^c>0){do l.point(0===s||3===s?n:e,s>1?r:t);while((s=(s+c+4)%4)!==f)}else l.point(a[0],a[1])}function s(u,i){return u>=n&&e>=u&&i>=t&&r>=i}function f(n,t){s(n,t)&&a.point(n,t)}function h(){N.point=p,d&&d.push(m=[]),S=!0,w=!1,_=b=0/0}function g(){v&&(p(y,x),M&&w&&A.rejoin(),v.push(A.buffer())),N.point=f,w&&a.lineEnd()}function p(n,t){n=Math.max(-Nc,Math.min(Nc,n)),t=Math.max(-Nc,Math.min(Nc,t));var e=s(n,t);if(d&&m.push([n,t]),S)y=n,x=t,M=e,S=!1,e&&(a.lineStart(),a.point(n,t));else if(e&&w)a.point(n,t);else{var r={a:{x:_,y:b},b:{x:n,y:t}};C(r)?(w||(a.lineStart(),a.point(r.a.x,r.a.y)),a.point(r.b.x,r.b.y),e||a.lineEnd(),k=!1):e&&(a.lineStart(),a.point(n,t),k=!1)}_=n,b=t,w=e}var v,d,m,y,x,M,_,b,w,S,k,E=a,A=qe(),C=He(n,t,e,r),N={point:f,lineStart:h,lineEnd:g,polygonStart:function(){a=A,v=[],d=[],k=!0},polygonEnd:function(){a=E,v=Bo.merge(v);var t=c([n,r]),e=k&&t,u=v.length;(e||u)&&(a.polygonStart(),e&&(a.lineStart(),l(null,null,1,a),a.lineEnd()),u&&Ce(v,i,t,l,a),a.polygonEnd()),v=d=m=null}};return N}}function Ye(n,t){function e(e,r){return e=n(e,r),t(e[0],e[1])}return n.invert&&t.invert&&(e.invert=function(e,r){return e=t.invert(e,r),e&&n.invert(e[0],e[1])}),e}function Ie(n){var t=0,e=Ea/3,r=ir(n),u=r(t,e);return u.parallels=function(n){return arguments.length?r(t=n[0]*Ea/180,e=n[1]*Ea/180):[180*(t/Ea),180*(e/Ea)]},u}function Ze(n,t){function e(n,t){var e=Math.sqrt(i-2*u*Math.sin(t))/u;return[e*Math.sin(n*=u),o-e*Math.cos(n)]}var r=Math.sin(n),u=(r+Math.sin(t))/2,i=1+r*(2*u-r),o=Math.sqrt(i)/u;return e.invert=function(n,t){var e=o-t;return[Math.atan2(n,e)/u,nt((i-(n*n+e*e)*u*u)/(2*u))]},e}function Ve(){function n(n,t){Lc+=u*n-r*t,r=n,u=t}var t,e,r,u;Pc.point=function(i,o){Pc.point=n,t=r=i,e=u=o},Pc.lineEnd=function(){n(t,e)}}function Xe(n,t){Tc>n&&(Tc=n),n>Rc&&(Rc=n),qc>t&&(qc=t),t>Dc&&(Dc=t)}function $e(){function n(n,t){o.push("M",n,",",t,i)}function t(n,t){o.push("M",n,",",t),a.point=e}function e(n,t){o.push("L",n,",",t)}function r(){a.point=n}function u(){o.push("Z")}var i=Be(4.5),o=[],a={point:n,lineStart:function(){a.point=t},lineEnd:r,polygonStart:function(){a.lineEnd=u},polygonEnd:function(){a.lineEnd=r,a.point=n},pointRadius:function(n){return i=Be(n),a},result:function(){if(o.length){var n=o.join("");return o=[],n}}};return a}function Be(n){return"m0,"+n+"a"+n+","+n+" 0 1,1 0,"+-2*n+"a"+n+","+n+" 0 1,1 0,"+2*n+"z"}function We(n,t){yc+=n,xc+=t,++Mc}function Je(){function n(n,r){var u=n-t,i=r-e,o=Math.sqrt(u*u+i*i);_c+=o*(t+n)/2,bc+=o*(e+r)/2,wc+=o,We(t=n,e=r)}var t,e;jc.point=function(r,u){jc.point=n,We(t=r,e=u)}}function Ge(){jc.point=We}function Ke(){function n(n,t){var e=n-r,i=t-u,o=Math.sqrt(e*e+i*i);_c+=o*(r+n)/2,bc+=o*(u+t)/2,wc+=o,o=u*n-r*t,Sc+=o*(r+n),kc+=o*(u+t),Ec+=3*o,We(r=n,u=t)}var t,e,r,u;jc.point=function(i,o){jc.point=n,We(t=r=i,e=u=o)},jc.lineEnd=function(){n(t,e)}}function Qe(n){function t(t,e){n.moveTo(t,e),n.arc(t,e,o,0,Aa)}function e(t,e){n.moveTo(t,e),a.point=r}function r(t,e){n.lineTo(t,e)}function u(){a.point=t}function i(){n.closePath()}var o=4.5,a={point:t,lineStart:function(){a.point=e},lineEnd:u,polygonStart:function(){a.lineEnd=i},polygonEnd:function(){a.lineEnd=u,a.point=t},pointRadius:function(n){return o=n,a},result:y};return a}function nr(n){function t(n){return(a?r:e)(n)}function e(t){return rr(t,function(e,r){e=n(e,r),t.point(e[0],e[1])})}function r(t){function e(e,r){e=n(e,r),t.point(e[0],e[1])}function r(){x=0/0,S.point=i,t.lineStart()}function i(e,r){var i=pe([e,r]),o=n(e,r);u(x,M,y,_,b,w,x=o[0],M=o[1],y=e,_=i[0],b=i[1],w=i[2],a,t),t.point(x,M)}function o(){S.point=e,t.lineEnd()}function c(){r(),S.point=l,S.lineEnd=s}function l(n,t){i(f=n,h=t),g=x,p=M,v=_,d=b,m=w,S.point=i}function s(){u(x,M,y,_,b,w,g,p,f,v,d,m,a,t),S.lineEnd=o,o()}var f,h,g,p,v,d,m,y,x,M,_,b,w,S={point:e,lineStart:r,lineEnd:o,polygonStart:function(){t.polygonStart(),S.lineStart=c},polygonEnd:function(){t.polygonEnd(),S.lineStart=r}};return S}function u(t,e,r,a,c,l,s,f,h,g,p,v,d,m){var y=s-t,x=f-e,M=y*y+x*x;if(M>4*i&&d--){var _=a+g,b=c+p,w=l+v,S=Math.sqrt(_*_+b*b+w*w),k=Math.asin(w/=S),E=ca(ca(w)-1)<Na||ca(r-h)<Na?(r+h)/2:Math.atan2(b,_),A=n(E,k),C=A[0],N=A[1],z=C-t,L=N-e,T=x*z-y*L;
(T*T/M>i||ca((y*z+x*L)/M-.5)>.3||o>a*g+c*p+l*v)&&(u(t,e,r,a,c,l,C,N,E,_/=S,b/=S,w,d,m),m.point(C,N),u(C,N,E,_,b,w,s,f,h,g,p,v,d,m))}}var i=.5,o=Math.cos(30*La),a=16;return t.precision=function(n){return arguments.length?(a=(i=n*n)>0&&16,t):Math.sqrt(i)},t}function tr(n){var t=nr(function(t,e){return n([t*Ta,e*Ta])});return function(n){return or(t(n))}}function er(n){this.stream=n}function rr(n,t){return{point:t,sphere:function(){n.sphere()},lineStart:function(){n.lineStart()},lineEnd:function(){n.lineEnd()},polygonStart:function(){n.polygonStart()},polygonEnd:function(){n.polygonEnd()}}}function ur(n){return ir(function(){return n})()}function ir(n){function t(n){return n=a(n[0]*La,n[1]*La),[n[0]*h+c,l-n[1]*h]}function e(n){return n=a.invert((n[0]-c)/h,(l-n[1])/h),n&&[n[0]*Ta,n[1]*Ta]}function r(){a=Ye(o=lr(m,y,x),i);var n=i(v,d);return c=g-n[0]*h,l=p+n[1]*h,u()}function u(){return s&&(s.valid=!1,s=null),t}var i,o,a,c,l,s,f=nr(function(n,t){return n=i(n,t),[n[0]*h+c,l-n[1]*h]}),h=150,g=480,p=250,v=0,d=0,m=0,y=0,x=0,M=Cc,_=Et,b=null,w=null;return t.stream=function(n){return s&&(s.valid=!1),s=or(M(o,f(_(n)))),s.valid=!0,s},t.clipAngle=function(n){return arguments.length?(M=null==n?(b=n,Cc):Fe((b=+n)*La),u()):b},t.clipExtent=function(n){return arguments.length?(w=n,_=n?Oe(n[0][0],n[0][1],n[1][0],n[1][1]):Et,u()):w},t.scale=function(n){return arguments.length?(h=+n,r()):h},t.translate=function(n){return arguments.length?(g=+n[0],p=+n[1],r()):[g,p]},t.center=function(n){return arguments.length?(v=n[0]%360*La,d=n[1]%360*La,r()):[v*Ta,d*Ta]},t.rotate=function(n){return arguments.length?(m=n[0]%360*La,y=n[1]%360*La,x=n.length>2?n[2]%360*La:0,r()):[m*Ta,y*Ta,x*Ta]},Bo.rebind(t,f,"precision"),function(){return i=n.apply(this,arguments),t.invert=i.invert&&e,r()}}function or(n){return rr(n,function(t,e){n.point(t*La,e*La)})}function ar(n,t){return[n,t]}function cr(n,t){return[n>Ea?n-Aa:-Ea>n?n+Aa:n,t]}function lr(n,t,e){return n?t||e?Ye(fr(n),hr(t,e)):fr(n):t||e?hr(t,e):cr}function sr(n){return function(t,e){return t+=n,[t>Ea?t-Aa:-Ea>t?t+Aa:t,e]}}function fr(n){var t=sr(n);return t.invert=sr(-n),t}function hr(n,t){function e(n,t){var e=Math.cos(t),a=Math.cos(n)*e,c=Math.sin(n)*e,l=Math.sin(t),s=l*r+a*u;return[Math.atan2(c*i-s*o,a*r-l*u),nt(s*i+c*o)]}var r=Math.cos(n),u=Math.sin(n),i=Math.cos(t),o=Math.sin(t);return e.invert=function(n,t){var e=Math.cos(t),a=Math.cos(n)*e,c=Math.sin(n)*e,l=Math.sin(t),s=l*i-c*o;return[Math.atan2(c*i+l*o,a*r+s*u),nt(s*r-a*u)]},e}function gr(n,t){var e=Math.cos(n),r=Math.sin(n);return function(u,i,o,a){var c=o*t;null!=u?(u=pr(e,u),i=pr(e,i),(o>0?i>u:u>i)&&(u+=o*Aa)):(u=n+o*Aa,i=n-.5*c);for(var l,s=u;o>0?s>i:i>s;s-=c)a.point((l=Me([e,-r*Math.cos(s),-r*Math.sin(s)]))[0],l[1])}}function pr(n,t){var e=pe(t);e[0]-=n,xe(e);var r=Q(-e[1]);return((-e[2]<0?-r:r)+2*Math.PI-Na)%(2*Math.PI)}function vr(n,t,e){var r=Bo.range(n,t-Na,e).concat(t);return function(n){return r.map(function(t){return[n,t]})}}function dr(n,t,e){var r=Bo.range(n,t-Na,e).concat(t);return function(n){return r.map(function(t){return[t,n]})}}function mr(n){return n.source}function yr(n){return n.target}function xr(n,t,e,r){var u=Math.cos(t),i=Math.sin(t),o=Math.cos(r),a=Math.sin(r),c=u*Math.cos(n),l=u*Math.sin(n),s=o*Math.cos(e),f=o*Math.sin(e),h=2*Math.asin(Math.sqrt(ut(r-t)+u*o*ut(e-n))),g=1/Math.sin(h),p=h?function(n){var t=Math.sin(n*=h)*g,e=Math.sin(h-n)*g,r=e*c+t*s,u=e*l+t*f,o=e*i+t*a;return[Math.atan2(u,r)*Ta,Math.atan2(o,Math.sqrt(r*r+u*u))*Ta]}:function(){return[n*Ta,t*Ta]};return p.distance=h,p}function Mr(){function n(n,u){var i=Math.sin(u*=La),o=Math.cos(u),a=ca((n*=La)-t),c=Math.cos(a);Fc+=Math.atan2(Math.sqrt((a=o*Math.sin(a))*a+(a=r*i-e*o*c)*a),e*i+r*o*c),t=n,e=i,r=o}var t,e,r;Hc.point=function(u,i){t=u*La,e=Math.sin(i*=La),r=Math.cos(i),Hc.point=n},Hc.lineEnd=function(){Hc.point=Hc.lineEnd=y}}function _r(n,t){function e(t,e){var r=Math.cos(t),u=Math.cos(e),i=n(r*u);return[i*u*Math.sin(t),i*Math.sin(e)]}return e.invert=function(n,e){var r=Math.sqrt(n*n+e*e),u=t(r),i=Math.sin(u),o=Math.cos(u);return[Math.atan2(n*i,r*o),Math.asin(r&&e*i/r)]},e}function br(n,t){function e(n,t){o>0?-Ca+Na>t&&(t=-Ca+Na):t>Ca-Na&&(t=Ca-Na);var e=o/Math.pow(u(t),i);return[e*Math.sin(i*n),o-e*Math.cos(i*n)]}var r=Math.cos(n),u=function(n){return Math.tan(Ea/4+n/2)},i=n===t?Math.sin(n):Math.log(r/Math.cos(t))/Math.log(u(t)/u(n)),o=r*Math.pow(u(n),i)/i;return i?(e.invert=function(n,t){var e=o-t,r=G(i)*Math.sqrt(n*n+e*e);return[Math.atan2(n,e)/i,2*Math.atan(Math.pow(o/r,1/i))-Ca]},e):Sr}function wr(n,t){function e(n,t){var e=i-t;return[e*Math.sin(u*n),i-e*Math.cos(u*n)]}var r=Math.cos(n),u=n===t?Math.sin(n):(r-Math.cos(t))/(t-n),i=r/u+n;return ca(u)<Na?ar:(e.invert=function(n,t){var e=i-t;return[Math.atan2(n,e)/u,i-G(u)*Math.sqrt(n*n+e*e)]},e)}function Sr(n,t){return[n,Math.log(Math.tan(Ea/4+t/2))]}function kr(n){var t,e=ur(n),r=e.scale,u=e.translate,i=e.clipExtent;return e.scale=function(){var n=r.apply(e,arguments);return n===e?t?e.clipExtent(null):e:n},e.translate=function(){var n=u.apply(e,arguments);return n===e?t?e.clipExtent(null):e:n},e.clipExtent=function(n){var o=i.apply(e,arguments);if(o===e){if(t=null==n){var a=Ea*r(),c=u();i([[c[0]-a,c[1]-a],[c[0]+a,c[1]+a]])}}else t&&(o=null);return o},e.clipExtent(null)}function Er(n,t){return[Math.log(Math.tan(Ea/4+t/2)),-n]}function Ar(n){return n[0]}function Cr(n){return n[1]}function Nr(n){for(var t=n.length,e=[0,1],r=2,u=2;t>u;u++){for(;r>1&&K(n[e[r-2]],n[e[r-1]],n[u])<=0;)--r;e[r++]=u}return e.slice(0,r)}function zr(n,t){return n[0]-t[0]||n[1]-t[1]}function Lr(n,t,e){return(e[0]-t[0])*(n[1]-t[1])<(e[1]-t[1])*(n[0]-t[0])}function Tr(n,t,e,r){var u=n[0],i=e[0],o=t[0]-u,a=r[0]-i,c=n[1],l=e[1],s=t[1]-c,f=r[1]-l,h=(a*(c-l)-f*(u-i))/(f*o-a*s);return[u+h*o,c+h*s]}function qr(n){var t=n[0],e=n[n.length-1];return!(t[0]-e[0]||t[1]-e[1])}function Rr(){tu(this),this.edge=this.site=this.circle=null}function Dr(n){var t=Kc.pop()||new Rr;return t.site=n,t}function Pr(n){Xr(n),Wc.remove(n),Kc.push(n),tu(n)}function Ur(n){var t=n.circle,e=t.x,r=t.cy,u={x:e,y:r},i=n.P,o=n.N,a=[n];Pr(n);for(var c=i;c.circle&&ca(e-c.circle.x)<Na&&ca(r-c.circle.cy)<Na;)i=c.P,a.unshift(c),Pr(c),c=i;a.unshift(c),Xr(c);for(var l=o;l.circle&&ca(e-l.circle.x)<Na&&ca(r-l.circle.cy)<Na;)o=l.N,a.push(l),Pr(l),l=o;a.push(l),Xr(l);var s,f=a.length;for(s=1;f>s;++s)l=a[s],c=a[s-1],Kr(l.edge,c.site,l.site,u);c=a[0],l=a[f-1],l.edge=Jr(c.site,l.site,null,u),Vr(c),Vr(l)}function jr(n){for(var t,e,r,u,i=n.x,o=n.y,a=Wc._;a;)if(r=Fr(a,o)-i,r>Na)a=a.L;else{if(u=i-Hr(a,o),!(u>Na)){r>-Na?(t=a.P,e=a):u>-Na?(t=a,e=a.N):t=e=a;break}if(!a.R){t=a;break}a=a.R}var c=Dr(n);if(Wc.insert(t,c),t||e){if(t===e)return Xr(t),e=Dr(t.site),Wc.insert(c,e),c.edge=e.edge=Jr(t.site,c.site),Vr(t),Vr(e),void 0;if(!e)return c.edge=Jr(t.site,c.site),void 0;Xr(t),Xr(e);var l=t.site,s=l.x,f=l.y,h=n.x-s,g=n.y-f,p=e.site,v=p.x-s,d=p.y-f,m=2*(h*d-g*v),y=h*h+g*g,x=v*v+d*d,M={x:(d*y-g*x)/m+s,y:(h*x-v*y)/m+f};Kr(e.edge,l,p,M),c.edge=Jr(l,n,null,M),e.edge=Jr(n,p,null,M),Vr(t),Vr(e)}}function Fr(n,t){var e=n.site,r=e.x,u=e.y,i=u-t;if(!i)return r;var o=n.P;if(!o)return-1/0;e=o.site;var a=e.x,c=e.y,l=c-t;if(!l)return a;var s=a-r,f=1/i-1/l,h=s/l;return f?(-h+Math.sqrt(h*h-2*f*(s*s/(-2*l)-c+l/2+u-i/2)))/f+r:(r+a)/2}function Hr(n,t){var e=n.N;if(e)return Fr(e,t);var r=n.site;return r.y===t?r.x:1/0}function Or(n){this.site=n,this.edges=[]}function Yr(n){for(var t,e,r,u,i,o,a,c,l,s,f=n[0][0],h=n[1][0],g=n[0][1],p=n[1][1],v=Bc,d=v.length;d--;)if(i=v[d],i&&i.prepare())for(a=i.edges,c=a.length,o=0;c>o;)s=a[o].end(),r=s.x,u=s.y,l=a[++o%c].start(),t=l.x,e=l.y,(ca(r-t)>Na||ca(u-e)>Na)&&(a.splice(o,0,new Qr(Gr(i.site,s,ca(r-f)<Na&&p-u>Na?{x:f,y:ca(t-f)<Na?e:p}:ca(u-p)<Na&&h-r>Na?{x:ca(e-p)<Na?t:h,y:p}:ca(r-h)<Na&&u-g>Na?{x:h,y:ca(t-h)<Na?e:g}:ca(u-g)<Na&&r-f>Na?{x:ca(e-g)<Na?t:f,y:g}:null),i.site,null)),++c)}function Ir(n,t){return t.angle-n.angle}function Zr(){tu(this),this.x=this.y=this.arc=this.site=this.cy=null}function Vr(n){var t=n.P,e=n.N;if(t&&e){var r=t.site,u=n.site,i=e.site;if(r!==i){var o=u.x,a=u.y,c=r.x-o,l=r.y-a,s=i.x-o,f=i.y-a,h=2*(c*f-l*s);if(!(h>=-za)){var g=c*c+l*l,p=s*s+f*f,v=(f*g-l*p)/h,d=(c*p-s*g)/h,f=d+a,m=Qc.pop()||new Zr;m.arc=n,m.site=u,m.x=v+o,m.y=f+Math.sqrt(v*v+d*d),m.cy=f,n.circle=m;for(var y=null,x=Gc._;x;)if(m.y<x.y||m.y===x.y&&m.x<=x.x){if(!x.L){y=x.P;break}x=x.L}else{if(!x.R){y=x;break}x=x.R}Gc.insert(y,m),y||(Jc=m)}}}}function Xr(n){var t=n.circle;t&&(t.P||(Jc=t.N),Gc.remove(t),Qc.push(t),tu(t),n.circle=null)}function $r(n){for(var t,e=$c,r=He(n[0][0],n[0][1],n[1][0],n[1][1]),u=e.length;u--;)t=e[u],(!Br(t,n)||!r(t)||ca(t.a.x-t.b.x)<Na&&ca(t.a.y-t.b.y)<Na)&&(t.a=t.b=null,e.splice(u,1))}function Br(n,t){var e=n.b;if(e)return!0;var r,u,i=n.a,o=t[0][0],a=t[1][0],c=t[0][1],l=t[1][1],s=n.l,f=n.r,h=s.x,g=s.y,p=f.x,v=f.y,d=(h+p)/2,m=(g+v)/2;if(v===g){if(o>d||d>=a)return;if(h>p){if(i){if(i.y>=l)return}else i={x:d,y:c};e={x:d,y:l}}else{if(i){if(i.y<c)return}else i={x:d,y:l};e={x:d,y:c}}}else if(r=(h-p)/(v-g),u=m-r*d,-1>r||r>1)if(h>p){if(i){if(i.y>=l)return}else i={x:(c-u)/r,y:c};e={x:(l-u)/r,y:l}}else{if(i){if(i.y<c)return}else i={x:(l-u)/r,y:l};e={x:(c-u)/r,y:c}}else if(v>g){if(i){if(i.x>=a)return}else i={x:o,y:r*o+u};e={x:a,y:r*a+u}}else{if(i){if(i.x<o)return}else i={x:a,y:r*a+u};e={x:o,y:r*o+u}}return n.a=i,n.b=e,!0}function Wr(n,t){this.l=n,this.r=t,this.a=this.b=null}function Jr(n,t,e,r){var u=new Wr(n,t);return $c.push(u),e&&Kr(u,n,t,e),r&&Kr(u,t,n,r),Bc[n.i].edges.push(new Qr(u,n,t)),Bc[t.i].edges.push(new Qr(u,t,n)),u}function Gr(n,t,e){var r=new Wr(n,null);return r.a=t,r.b=e,$c.push(r),r}function Kr(n,t,e,r){n.a||n.b?n.l===e?n.b=r:n.a=r:(n.a=r,n.l=t,n.r=e)}function Qr(n,t,e){var r=n.a,u=n.b;this.edge=n,this.site=t,this.angle=e?Math.atan2(e.y-t.y,e.x-t.x):n.l===t?Math.atan2(u.x-r.x,r.y-u.y):Math.atan2(r.x-u.x,u.y-r.y)}function nu(){this._=null}function tu(n){n.U=n.C=n.L=n.R=n.P=n.N=null}function eu(n,t){var e=t,r=t.R,u=e.U;u?u.L===e?u.L=r:u.R=r:n._=r,r.U=u,e.U=r,e.R=r.L,e.R&&(e.R.U=e),r.L=e}function ru(n,t){var e=t,r=t.L,u=e.U;u?u.L===e?u.L=r:u.R=r:n._=r,r.U=u,e.U=r,e.L=r.R,e.L&&(e.L.U=e),r.R=e}function uu(n){for(;n.L;)n=n.L;return n}function iu(n,t){var e,r,u,i=n.sort(ou).pop();for($c=[],Bc=new Array(n.length),Wc=new nu,Gc=new nu;;)if(u=Jc,i&&(!u||i.y<u.y||i.y===u.y&&i.x<u.x))(i.x!==e||i.y!==r)&&(Bc[i.i]=new Or(i),jr(i),e=i.x,r=i.y),i=n.pop();else{if(!u)break;Ur(u.arc)}t&&($r(t),Yr(t));var o={cells:Bc,edges:$c};return Wc=Gc=$c=Bc=null,o}function ou(n,t){return t.y-n.y||t.x-n.x}function au(n,t,e){return(n.x-e.x)*(t.y-n.y)-(n.x-t.x)*(e.y-n.y)}function cu(n){return n.x}function lu(n){return n.y}function su(){return{leaf:!0,nodes:[],point:null,x:null,y:null}}function fu(n,t,e,r,u,i){if(!n(t,e,r,u,i)){var o=.5*(e+u),a=.5*(r+i),c=t.nodes;c[0]&&fu(n,c[0],e,r,o,a),c[1]&&fu(n,c[1],o,r,u,a),c[2]&&fu(n,c[2],e,a,o,i),c[3]&&fu(n,c[3],o,a,u,i)}}function hu(n,t){n=Bo.rgb(n),t=Bo.rgb(t);var e=n.r,r=n.g,u=n.b,i=t.r-e,o=t.g-r,a=t.b-u;return function(n){return"#"+xt(Math.round(e+i*n))+xt(Math.round(r+o*n))+xt(Math.round(u+a*n))}}function gu(n,t){var e,r={},u={};for(e in n)e in t?r[e]=du(n[e],t[e]):u[e]=n[e];for(e in t)e in n||(u[e]=t[e]);return function(n){for(e in r)u[e]=r[e](n);return u}}function pu(n,t){return n=+n,t=+t,function(e){return n*(1-e)+t*e}}function vu(n,t){var e,r,u,i=tl.lastIndex=el.lastIndex=0,o=-1,a=[],c=[];for(n+="",t+="";(e=tl.exec(n))&&(r=el.exec(t));)(u=r.index)>i&&(u=t.slice(i,u),a[o]?a[o]+=u:a[++o]=u),(e=e[0])===(r=r[0])?a[o]?a[o]+=r:a[++o]=r:(a[++o]=null,c.push({i:o,x:pu(e,r)})),i=el.lastIndex;return i<t.length&&(u=t.slice(i),a[o]?a[o]+=u:a[++o]=u),a.length<2?c[0]?(t=c[0].x,function(n){return t(n)+""}):function(){return t}:(t=c.length,function(n){for(var e,r=0;t>r;++r)a[(e=c[r]).i]=e.x(n);return a.join("")})}function du(n,t){for(var e,r=Bo.interpolators.length;--r>=0&&!(e=Bo.interpolators[r](n,t)););return e}function mu(n,t){var e,r=[],u=[],i=n.length,o=t.length,a=Math.min(n.length,t.length);for(e=0;a>e;++e)r.push(du(n[e],t[e]));for(;i>e;++e)u[e]=n[e];for(;o>e;++e)u[e]=t[e];return function(n){for(e=0;a>e;++e)u[e]=r[e](n);return u}}function yu(n){return function(t){return 0>=t?0:t>=1?1:n(t)}}function xu(n){return function(t){return 1-n(1-t)}}function Mu(n){return function(t){return.5*(.5>t?n(2*t):2-n(2-2*t))}}function _u(n){return n*n}function bu(n){return n*n*n}function wu(n){if(0>=n)return 0;if(n>=1)return 1;var t=n*n,e=t*n;return 4*(.5>n?e:3*(n-t)+e-.75)}function Su(n){return function(t){return Math.pow(t,n)}}function ku(n){return 1-Math.cos(n*Ca)}function Eu(n){return Math.pow(2,10*(n-1))}function Au(n){return 1-Math.sqrt(1-n*n)}function Cu(n,t){var e;return arguments.length<2&&(t=.45),arguments.length?e=t/Aa*Math.asin(1/n):(n=1,e=t/4),function(r){return 1+n*Math.pow(2,-10*r)*Math.sin((r-e)*Aa/t)}}function Nu(n){return n||(n=1.70158),function(t){return t*t*((n+1)*t-n)}}function zu(n){return 1/2.75>n?7.5625*n*n:2/2.75>n?7.5625*(n-=1.5/2.75)*n+.75:2.5/2.75>n?7.5625*(n-=2.25/2.75)*n+.9375:7.5625*(n-=2.625/2.75)*n+.984375}function Lu(n,t){n=Bo.hcl(n),t=Bo.hcl(t);var e=n.h,r=n.c,u=n.l,i=t.h-e,o=t.c-r,a=t.l-u;return isNaN(o)&&(o=0,r=isNaN(r)?t.c:r),isNaN(i)?(i=0,e=isNaN(e)?t.h:e):i>180?i-=360:-180>i&&(i+=360),function(n){return lt(e+i*n,r+o*n,u+a*n)+""}}function Tu(n,t){n=Bo.hsl(n),t=Bo.hsl(t);var e=n.h,r=n.s,u=n.l,i=t.h-e,o=t.s-r,a=t.l-u;return isNaN(o)&&(o=0,r=isNaN(r)?t.s:r),isNaN(i)?(i=0,e=isNaN(e)?t.h:e):i>180?i-=360:-180>i&&(i+=360),function(n){return at(e+i*n,r+o*n,u+a*n)+""}}function qu(n,t){n=Bo.lab(n),t=Bo.lab(t);var e=n.l,r=n.a,u=n.b,i=t.l-e,o=t.a-r,a=t.b-u;return function(n){return ft(e+i*n,r+o*n,u+a*n)+""}}function Ru(n,t){return t-=n,function(e){return Math.round(n+t*e)}}function Du(n){var t=[n.a,n.b],e=[n.c,n.d],r=Uu(t),u=Pu(t,e),i=Uu(ju(e,t,-u))||0;t[0]*e[1]<e[0]*t[1]&&(t[0]*=-1,t[1]*=-1,r*=-1,u*=-1),this.rotate=(r?Math.atan2(t[1],t[0]):Math.atan2(-e[0],e[1]))*Ta,this.translate=[n.e,n.f],this.scale=[r,i],this.skew=i?Math.atan2(u,i)*Ta:0}function Pu(n,t){return n[0]*t[0]+n[1]*t[1]}function Uu(n){var t=Math.sqrt(Pu(n,n));return t&&(n[0]/=t,n[1]/=t),t}function ju(n,t,e){return n[0]+=e*t[0],n[1]+=e*t[1],n}function Fu(n,t){var e,r=[],u=[],i=Bo.transform(n),o=Bo.transform(t),a=i.translate,c=o.translate,l=i.rotate,s=o.rotate,f=i.skew,h=o.skew,g=i.scale,p=o.scale;return a[0]!=c[0]||a[1]!=c[1]?(r.push("translate(",null,",",null,")"),u.push({i:1,x:pu(a[0],c[0])},{i:3,x:pu(a[1],c[1])})):c[0]||c[1]?r.push("translate("+c+")"):r.push(""),l!=s?(l-s>180?s+=360:s-l>180&&(l+=360),u.push({i:r.push(r.pop()+"rotate(",null,")")-2,x:pu(l,s)})):s&&r.push(r.pop()+"rotate("+s+")"),f!=h?u.push({i:r.push(r.pop()+"skewX(",null,")")-2,x:pu(f,h)}):h&&r.push(r.pop()+"skewX("+h+")"),g[0]!=p[0]||g[1]!=p[1]?(e=r.push(r.pop()+"scale(",null,",",null,")"),u.push({i:e-4,x:pu(g[0],p[0])},{i:e-2,x:pu(g[1],p[1])})):(1!=p[0]||1!=p[1])&&r.push(r.pop()+"scale("+p+")"),e=u.length,function(n){for(var t,i=-1;++i<e;)r[(t=u[i]).i]=t.x(n);return r.join("")}}function Hu(n,t){return t=(t-=n=+n)||1/t,function(e){return(e-n)/t}}function Ou(n,t){return t=(t-=n=+n)||1/t,function(e){return Math.max(0,Math.min(1,(e-n)/t))}}function Yu(n){for(var t=n.source,e=n.target,r=Zu(t,e),u=[t];t!==r;)t=t.parent,u.push(t);for(var i=u.length;e!==r;)u.splice(i,0,e),e=e.parent;return u}function Iu(n){for(var t=[],e=n.parent;null!=e;)t.push(n),n=e,e=e.parent;return t.push(n),t}function Zu(n,t){if(n===t)return n;for(var e=Iu(n),r=Iu(t),u=e.pop(),i=r.pop(),o=null;u===i;)o=u,u=e.pop(),i=r.pop();return o}function Vu(n){n.fixed|=2}function Xu(n){n.fixed&=-7}function $u(n){n.fixed|=4,n.px=n.x,n.py=n.y}function Bu(n){n.fixed&=-5}function Wu(n,t,e){var r=0,u=0;if(n.charge=0,!n.leaf)for(var i,o=n.nodes,a=o.length,c=-1;++c<a;)i=o[c],null!=i&&(Wu(i,t,e),n.charge+=i.charge,r+=i.charge*i.cx,u+=i.charge*i.cy);if(n.point){n.leaf||(n.point.x+=Math.random()-.5,n.point.y+=Math.random()-.5);var l=t*e[n.point.index];n.charge+=n.pointCharge=l,r+=l*n.point.x,u+=l*n.point.y}n.cx=r/n.charge,n.cy=u/n.charge}function Ju(n,t){return Bo.rebind(n,t,"sort","children","value"),n.nodes=n,n.links=ei,n}function Gu(n,t){for(var e=[n];null!=(n=e.pop());)if(t(n),(u=n.children)&&(r=u.length))for(var r,u;--r>=0;)e.push(u[r])}function Ku(n,t){for(var e=[n],r=[];null!=(n=e.pop());)if(r.push(n),(i=n.children)&&(u=i.length))for(var u,i,o=-1;++o<u;)e.push(i[o]);for(;null!=(n=r.pop());)t(n)}function Qu(n){return n.children}function ni(n){return n.value}function ti(n,t){return t.value-n.value}function ei(n){return Bo.merge(n.map(function(n){return(n.children||[]).map(function(t){return{source:n,target:t}})}))}function ri(n){return n.x}function ui(n){return n.y}function ii(n,t,e){n.y0=t,n.y=e}function oi(n){return Bo.range(n.length)}function ai(n){for(var t=-1,e=n[0].length,r=[];++t<e;)r[t]=0;return r}function ci(n){for(var t,e=1,r=0,u=n[0][1],i=n.length;i>e;++e)(t=n[e][1])>u&&(r=e,u=t);return r}function li(n){return n.reduce(si,0)}function si(n,t){return n+t[1]}function fi(n,t){return hi(n,Math.ceil(Math.log(t.length)/Math.LN2+1))}function hi(n,t){for(var e=-1,r=+n[0],u=(n[1]-r)/t,i=[];++e<=t;)i[e]=u*e+r;return i}function gi(n){return[Bo.min(n),Bo.max(n)]}function pi(n,t){return n.value-t.value}function vi(n,t){var e=n._pack_next;n._pack_next=t,t._pack_prev=n,t._pack_next=e,e._pack_prev=t}function di(n,t){n._pack_next=t,t._pack_prev=n}function mi(n,t){var e=t.x-n.x,r=t.y-n.y,u=n.r+t.r;return.999*u*u>e*e+r*r}function yi(n){function t(n){s=Math.min(n.x-n.r,s),f=Math.max(n.x+n.r,f),h=Math.min(n.y-n.r,h),g=Math.max(n.y+n.r,g)}if((e=n.children)&&(l=e.length)){var e,r,u,i,o,a,c,l,s=1/0,f=-1/0,h=1/0,g=-1/0;if(e.forEach(xi),r=e[0],r.x=-r.r,r.y=0,t(r),l>1&&(u=e[1],u.x=u.r,u.y=0,t(u),l>2))for(i=e[2],bi(r,u,i),t(i),vi(r,i),r._pack_prev=i,vi(i,u),u=r._pack_next,o=3;l>o;o++){bi(r,u,i=e[o]);var p=0,v=1,d=1;for(a=u._pack_next;a!==u;a=a._pack_next,v++)if(mi(a,i)){p=1;break}if(1==p)for(c=r._pack_prev;c!==a._pack_prev&&!mi(c,i);c=c._pack_prev,d++);p?(d>v||v==d&&u.r<r.r?di(r,u=a):di(r=c,u),o--):(vi(r,i),u=i,t(i))}var m=(s+f)/2,y=(h+g)/2,x=0;for(o=0;l>o;o++)i=e[o],i.x-=m,i.y-=y,x=Math.max(x,i.r+Math.sqrt(i.x*i.x+i.y*i.y));n.r=x,e.forEach(Mi)}}function xi(n){n._pack_next=n._pack_prev=n}function Mi(n){delete n._pack_next,delete n._pack_prev}function _i(n,t,e,r){var u=n.children;if(n.x=t+=r*n.x,n.y=e+=r*n.y,n.r*=r,u)for(var i=-1,o=u.length;++i<o;)_i(u[i],t,e,r)}function bi(n,t,e){var r=n.r+e.r,u=t.x-n.x,i=t.y-n.y;if(r&&(u||i)){var o=t.r+e.r,a=u*u+i*i;o*=o,r*=r;var c=.5+(r-o)/(2*a),l=Math.sqrt(Math.max(0,2*o*(r+a)-(r-=a)*r-o*o))/(2*a);e.x=n.x+c*u+l*i,e.y=n.y+c*i-l*u}else e.x=n.x+r,e.y=n.y}function wi(n,t){return n.parent==t.parent?1:2}function Si(n){var t=n.children;return t.length?t[0]:n.t}function ki(n){var t,e=n.children;return(t=e.length)?e[t-1]:n.t}function Ei(n,t,e){var r=e/(t.i-n.i);t.c-=r,t.s+=e,n.c+=r,t.z+=e,t.m+=e}function Ai(n){for(var t,e=0,r=0,u=n.children,i=u.length;--i>=0;)t=u[i],t.z+=e,t.m+=e,e+=t.s+(r+=t.c)}function Ci(n,t,e){return n.a.parent===t.parent?n.a:e}function Ni(n){return 1+Bo.max(n,function(n){return n.y})}function zi(n){return n.reduce(function(n,t){return n+t.x},0)/n.length}function Li(n){var t=n.children;return t&&t.length?Li(t[0]):n}function Ti(n){var t,e=n.children;return e&&(t=e.length)?Ti(e[t-1]):n}function qi(n){return{x:n.x,y:n.y,dx:n.dx,dy:n.dy}}function Ri(n,t){var e=n.x+t[3],r=n.y+t[0],u=n.dx-t[1]-t[3],i=n.dy-t[0]-t[2];return 0>u&&(e+=u/2,u=0),0>i&&(r+=i/2,i=0),{x:e,y:r,dx:u,dy:i}}function Di(n){var t=n[0],e=n[n.length-1];return e>t?[t,e]:[e,t]}function Pi(n){return n.rangeExtent?n.rangeExtent():Di(n.range())}function Ui(n,t,e,r){var u=e(n[0],n[1]),i=r(t[0],t[1]);return function(n){return i(u(n))}}function ji(n,t){var e,r=0,u=n.length-1,i=n[r],o=n[u];return i>o&&(e=r,r=u,u=e,e=i,i=o,o=e),n[r]=t.floor(i),n[u]=t.ceil(o),n}function Fi(n){return n?{floor:function(t){return Math.floor(t/n)*n},ceil:function(t){return Math.ceil(t/n)*n}}:gl}function Hi(n,t,e,r){var u=[],i=[],o=0,a=Math.min(n.length,t.length)-1;for(n[a]<n[0]&&(n=n.slice().reverse(),t=t.slice().reverse());++o<=a;)u.push(e(n[o-1],n[o])),i.push(r(t[o-1],t[o]));return function(t){var e=Bo.bisect(n,t,1,a)-1;return i[e](u[e](t))}}function Oi(n,t,e,r){function u(){var u=Math.min(n.length,t.length)>2?Hi:Ui,c=r?Ou:Hu;return o=u(n,t,c,e),a=u(t,n,c,du),i}function i(n){return o(n)}var o,a;return i.invert=function(n){return a(n)},i.domain=function(t){return arguments.length?(n=t.map(Number),u()):n},i.range=function(n){return arguments.length?(t=n,u()):t},i.rangeRound=function(n){return i.range(n).interpolate(Ru)},i.clamp=function(n){return arguments.length?(r=n,u()):r},i.interpolate=function(n){return arguments.length?(e=n,u()):e},i.ticks=function(t){return Vi(n,t)},i.tickFormat=function(t,e){return Xi(n,t,e)},i.nice=function(t){return Ii(n,t),u()},i.copy=function(){return Oi(n,t,e,r)},u()}function Yi(n,t){return Bo.rebind(n,t,"range","rangeRound","interpolate","clamp")}function Ii(n,t){return ji(n,Fi(Zi(n,t)[2]))}function Zi(n,t){null==t&&(t=10);var e=Di(n),r=e[1]-e[0],u=Math.pow(10,Math.floor(Math.log(r/t)/Math.LN10)),i=t/r*u;return.15>=i?u*=10:.35>=i?u*=5:.75>=i&&(u*=2),e[0]=Math.ceil(e[0]/u)*u,e[1]=Math.floor(e[1]/u)*u+.5*u,e[2]=u,e}function Vi(n,t){return Bo.range.apply(Bo,Zi(n,t))}function Xi(n,t,e){var r=Zi(n,t);if(e){var u=tc.exec(e);if(u.shift(),"s"===u[8]){var i=Bo.formatPrefix(Math.max(ca(r[0]),ca(r[1])));return u[7]||(u[7]="."+$i(i.scale(r[2]))),u[8]="f",e=Bo.format(u.join("")),function(n){return e(i.scale(n))+i.symbol}}u[7]||(u[7]="."+Bi(u[8],r)),e=u.join("")}else e=",."+$i(r[2])+"f";return Bo.format(e)}function $i(n){return-Math.floor(Math.log(n)/Math.LN10+.01)}function Bi(n,t){var e=$i(t[2]);return n in pl?Math.abs(e-$i(Math.max(ca(t[0]),ca(t[1]))))+ +("e"!==n):e-2*("%"===n)}function Wi(n,t,e,r){function u(n){return(e?Math.log(0>n?0:n):-Math.log(n>0?0:-n))/Math.log(t)}function i(n){return e?Math.pow(t,n):-Math.pow(t,-n)}function o(t){return n(u(t))}return o.invert=function(t){return i(n.invert(t))},o.domain=function(t){return arguments.length?(e=t[0]>=0,n.domain((r=t.map(Number)).map(u)),o):r},o.base=function(e){return arguments.length?(t=+e,n.domain(r.map(u)),o):t},o.nice=function(){var t=ji(r.map(u),e?Math:dl);return n.domain(t),r=t.map(i),o},o.ticks=function(){var n=Di(r),o=[],a=n[0],c=n[1],l=Math.floor(u(a)),s=Math.ceil(u(c)),f=t%1?2:t;if(isFinite(s-l)){if(e){for(;s>l;l++)for(var h=1;f>h;h++)o.push(i(l)*h);o.push(i(l))}else for(o.push(i(l));l++<s;)for(var h=f-1;h>0;h--)o.push(i(l)*h);for(l=0;o[l]<a;l++);for(s=o.length;o[s-1]>c;s--);o=o.slice(l,s)}return o},o.tickFormat=function(n,t){if(!arguments.length)return vl;arguments.length<2?t=vl:"function"!=typeof t&&(t=Bo.format(t));var r,a=Math.max(.1,n/o.ticks().length),c=e?(r=1e-12,Math.ceil):(r=-1e-12,Math.floor);return function(n){return n/i(c(u(n)+r))<=a?t(n):""}},o.copy=function(){return Wi(n.copy(),t,e,r)},Yi(o,n)}function Ji(n,t,e){function r(t){return n(u(t))}var u=Gi(t),i=Gi(1/t);return r.invert=function(t){return i(n.invert(t))},r.domain=function(t){return arguments.length?(n.domain((e=t.map(Number)).map(u)),r):e},r.ticks=function(n){return Vi(e,n)},r.tickFormat=function(n,t){return Xi(e,n,t)},r.nice=function(n){return r.domain(Ii(e,n))},r.exponent=function(o){return arguments.length?(u=Gi(t=o),i=Gi(1/t),n.domain(e.map(u)),r):t},r.copy=function(){return Ji(n.copy(),t,e)},Yi(r,n)}function Gi(n){return function(t){return 0>t?-Math.pow(-t,n):Math.pow(t,n)}}function Ki(n,t){function e(e){return i[((u.get(e)||("range"===t.t?u.set(e,n.push(e)):0/0))-1)%i.length]}function r(t,e){return Bo.range(n.length).map(function(n){return t+e*n})}var u,i,o;return e.domain=function(r){if(!arguments.length)return n;n=[],u=new a;for(var i,o=-1,c=r.length;++o<c;)u.has(i=r[o])||u.set(i,n.push(i));return e[t.t].apply(e,t.a)},e.range=function(n){return arguments.length?(i=n,o=0,t={t:"range",a:arguments},e):i},e.rangePoints=function(u,a){arguments.length<2&&(a=0);var c=u[0],l=u[1],s=(l-c)/(Math.max(1,n.length-1)+a);return i=r(n.length<2?(c+l)/2:c+s*a/2,s),o=0,t={t:"rangePoints",a:arguments},e},e.rangeBands=function(u,a,c){arguments.length<2&&(a=0),arguments.length<3&&(c=a);var l=u[1]<u[0],s=u[l-0],f=u[1-l],h=(f-s)/(n.length-a+2*c);return i=r(s+h*c,h),l&&i.reverse(),o=h*(1-a),t={t:"rangeBands",a:arguments},e},e.rangeRoundBands=function(u,a,c){arguments.length<2&&(a=0),arguments.length<3&&(c=a);var l=u[1]<u[0],s=u[l-0],f=u[1-l],h=Math.floor((f-s)/(n.length-a+2*c)),g=f-s-(n.length-a)*h;return i=r(s+Math.round(g/2),h),l&&i.reverse(),o=Math.round(h*(1-a)),t={t:"rangeRoundBands",a:arguments},e},e.rangeBand=function(){return o},e.rangeExtent=function(){return Di(t.a[0])},e.copy=function(){return Ki(n,t)},e.domain(n)}function Qi(r,u){function i(){var n=0,t=u.length;for(a=[];++n<t;)a[n-1]=Bo.quantile(r,n/t);return o}function o(n){return isNaN(n=+n)?void 0:u[Bo.bisect(a,n)]}var a;return o.domain=function(u){return arguments.length?(r=u.map(t).filter(e).sort(n),i()):r},o.range=function(n){return arguments.length?(u=n,i()):u},o.quantiles=function(){return a},o.invertExtent=function(n){return n=u.indexOf(n),0>n?[0/0,0/0]:[n>0?a[n-1]:r[0],n<a.length?a[n]:r[r.length-1]]},o.copy=function(){return Qi(r,u)},i()}function no(n,t,e){function r(t){return e[Math.max(0,Math.min(o,Math.floor(i*(t-n))))]}function u(){return i=e.length/(t-n),o=e.length-1,r}var i,o;return r.domain=function(e){return arguments.length?(n=+e[0],t=+e[e.length-1],u()):[n,t]},r.range=function(n){return arguments.length?(e=n,u()):e},r.invertExtent=function(t){return t=e.indexOf(t),t=0>t?0/0:t/i+n,[t,t+1/i]},r.copy=function(){return no(n,t,e)},u()}function to(n,t){function e(e){return e>=e?t[Bo.bisect(n,e)]:void 0}return e.domain=function(t){return arguments.length?(n=t,e):n},e.range=function(n){return arguments.length?(t=n,e):t},e.invertExtent=function(e){return e=t.indexOf(e),[n[e-1],n[e]]},e.copy=function(){return to(n,t)},e}function eo(n){function t(n){return+n}return t.invert=t,t.domain=t.range=function(e){return arguments.length?(n=e.map(t),t):n},t.ticks=function(t){return Vi(n,t)},t.tickFormat=function(t,e){return Xi(n,t,e)},t.copy=function(){return eo(n)},t}function ro(n){return n.innerRadius}function uo(n){return n.outerRadius}function io(n){return n.startAngle}function oo(n){return n.endAngle}function ao(n){function t(t){function o(){l.push("M",i(n(s),a))}for(var c,l=[],s=[],f=-1,h=t.length,g=kt(e),p=kt(r);++f<h;)u.call(this,c=t[f],f)?s.push([+g.call(this,c,f),+p.call(this,c,f)]):s.length&&(o(),s=[]);return s.length&&o(),l.length?l.join(""):null}var e=Ar,r=Cr,u=Ae,i=co,o=i.key,a=.7;return t.x=function(n){return arguments.length?(e=n,t):e},t.y=function(n){return arguments.length?(r=n,t):r},t.defined=function(n){return arguments.length?(u=n,t):u},t.interpolate=function(n){return arguments.length?(o="function"==typeof n?i=n:(i=wl.get(n)||co).key,t):o},t.tension=function(n){return arguments.length?(a=n,t):a},t}function co(n){return n.join("L")}function lo(n){return co(n)+"Z"}function so(n){for(var t=0,e=n.length,r=n[0],u=[r[0],",",r[1]];++t<e;)u.push("H",(r[0]+(r=n[t])[0])/2,"V",r[1]);return e>1&&u.push("H",r[0]),u.join("")}function fo(n){for(var t=0,e=n.length,r=n[0],u=[r[0],",",r[1]];++t<e;)u.push("V",(r=n[t])[1],"H",r[0]);return u.join("")}function ho(n){for(var t=0,e=n.length,r=n[0],u=[r[0],",",r[1]];++t<e;)u.push("H",(r=n[t])[0],"V",r[1]);return u.join("")}function go(n,t){return n.length<4?co(n):n[1]+mo(n.slice(1,n.length-1),yo(n,t))}function po(n,t){return n.length<3?co(n):n[0]+mo((n.push(n[0]),n),yo([n[n.length-2]].concat(n,[n[1]]),t))}function vo(n,t){return n.length<3?co(n):n[0]+mo(n,yo(n,t))}function mo(n,t){if(t.length<1||n.length!=t.length&&n.length!=t.length+2)return co(n);var e=n.length!=t.length,r="",u=n[0],i=n[1],o=t[0],a=o,c=1;if(e&&(r+="Q"+(i[0]-2*o[0]/3)+","+(i[1]-2*o[1]/3)+","+i[0]+","+i[1],u=n[1],c=2),t.length>1){a=t[1],i=n[c],c++,r+="C"+(u[0]+o[0])+","+(u[1]+o[1])+","+(i[0]-a[0])+","+(i[1]-a[1])+","+i[0]+","+i[1];for(var l=2;l<t.length;l++,c++)i=n[c],a=t[l],r+="S"+(i[0]-a[0])+","+(i[1]-a[1])+","+i[0]+","+i[1]}if(e){var s=n[c];r+="Q"+(i[0]+2*a[0]/3)+","+(i[1]+2*a[1]/3)+","+s[0]+","+s[1]}return r}function yo(n,t){for(var e,r=[],u=(1-t)/2,i=n[0],o=n[1],a=1,c=n.length;++a<c;)e=i,i=o,o=n[a],r.push([u*(o[0]-e[0]),u*(o[1]-e[1])]);return r}function xo(n){if(n.length<3)return co(n);var t=1,e=n.length,r=n[0],u=r[0],i=r[1],o=[u,u,u,(r=n[1])[0]],a=[i,i,i,r[1]],c=[u,",",i,"L",wo(El,o),",",wo(El,a)];for(n.push(n[e-1]);++t<=e;)r=n[t],o.shift(),o.push(r[0]),a.shift(),a.push(r[1]),So(c,o,a);return n.pop(),c.push("L",r),c.join("")}function Mo(n){if(n.length<4)return co(n);for(var t,e=[],r=-1,u=n.length,i=[0],o=[0];++r<3;)t=n[r],i.push(t[0]),o.push(t[1]);for(e.push(wo(El,i)+","+wo(El,o)),--r;++r<u;)t=n[r],i.shift(),i.push(t[0]),o.shift(),o.push(t[1]),So(e,i,o);return e.join("")}function _o(n){for(var t,e,r=-1,u=n.length,i=u+4,o=[],a=[];++r<4;)e=n[r%u],o.push(e[0]),a.push(e[1]);for(t=[wo(El,o),",",wo(El,a)],--r;++r<i;)e=n[r%u],o.shift(),o.push(e[0]),a.shift(),a.push(e[1]),So(t,o,a);return t.join("")}function bo(n,t){var e=n.length-1;if(e)for(var r,u,i=n[0][0],o=n[0][1],a=n[e][0]-i,c=n[e][1]-o,l=-1;++l<=e;)r=n[l],u=l/e,r[0]=t*r[0]+(1-t)*(i+u*a),r[1]=t*r[1]+(1-t)*(o+u*c);return xo(n)}function wo(n,t){return n[0]*t[0]+n[1]*t[1]+n[2]*t[2]+n[3]*t[3]}function So(n,t,e){n.push("C",wo(Sl,t),",",wo(Sl,e),",",wo(kl,t),",",wo(kl,e),",",wo(El,t),",",wo(El,e))}function ko(n,t){return(t[1]-n[1])/(t[0]-n[0])}function Eo(n){for(var t=0,e=n.length-1,r=[],u=n[0],i=n[1],o=r[0]=ko(u,i);++t<e;)r[t]=(o+(o=ko(u=i,i=n[t+1])))/2;return r[t]=o,r}function Ao(n){for(var t,e,r,u,i=[],o=Eo(n),a=-1,c=n.length-1;++a<c;)t=ko(n[a],n[a+1]),ca(t)<Na?o[a]=o[a+1]=0:(e=o[a]/t,r=o[a+1]/t,u=e*e+r*r,u>9&&(u=3*t/Math.sqrt(u),o[a]=u*e,o[a+1]=u*r));for(a=-1;++a<=c;)u=(n[Math.min(c,a+1)][0]-n[Math.max(0,a-1)][0])/(6*(1+o[a]*o[a])),i.push([u||0,o[a]*u||0]);return i}function Co(n){return n.length<3?co(n):n[0]+mo(n,Ao(n))}function No(n){for(var t,e,r,u=-1,i=n.length;++u<i;)t=n[u],e=t[0],r=t[1]+_l,t[0]=e*Math.cos(r),t[1]=e*Math.sin(r);return n}function zo(n){function t(t){function c(){v.push("M",a(n(m),f),s,l(n(d.reverse()),f),"Z")}for(var h,g,p,v=[],d=[],m=[],y=-1,x=t.length,M=kt(e),_=kt(u),b=e===r?function(){return g}:kt(r),w=u===i?function(){return p}:kt(i);++y<x;)o.call(this,h=t[y],y)?(d.push([g=+M.call(this,h,y),p=+_.call(this,h,y)]),m.push([+b.call(this,h,y),+w.call(this,h,y)])):d.length&&(c(),d=[],m=[]);return d.length&&c(),v.length?v.join(""):null}var e=Ar,r=Ar,u=0,i=Cr,o=Ae,a=co,c=a.key,l=a,s="L",f=.7;return t.x=function(n){return arguments.length?(e=r=n,t):r},t.x0=function(n){return arguments.length?(e=n,t):e},t.x1=function(n){return arguments.length?(r=n,t):r},t.y=function(n){return arguments.length?(u=i=n,t):i},t.y0=function(n){return arguments.length?(u=n,t):u},t.y1=function(n){return arguments.length?(i=n,t):i},t.defined=function(n){return arguments.length?(o=n,t):o},t.interpolate=function(n){return arguments.length?(c="function"==typeof n?a=n:(a=wl.get(n)||co).key,l=a.reverse||a,s=a.closed?"M":"L",t):c},t.tension=function(n){return arguments.length?(f=n,t):f},t}function Lo(n){return n.radius}function To(n){return[n.x,n.y]}function qo(n){return function(){var t=n.apply(this,arguments),e=t[0],r=t[1]+_l;return[e*Math.cos(r),e*Math.sin(r)]}}function Ro(){return 64}function Do(){return"circle"}function Po(n){var t=Math.sqrt(n/Ea);return"M0,"+t+"A"+t+","+t+" 0 1,1 0,"+-t+"A"+t+","+t+" 0 1,1 0,"+t+"Z"}function Uo(n,t){return ga(n,Tl),n.id=t,n}function jo(n,t,e,r){var u=n.id;return F(n,"function"==typeof e?function(n,i,o){n.__transition__[u].tween.set(t,r(e.call(n,n.__data__,i,o)))}:(e=r(e),function(n){n.__transition__[u].tween.set(t,e)}))}function Fo(n){return null==n&&(n=""),function(){this.textContent=n}}function Ho(n,t,e,r){var u=n.__transition__||(n.__transition__={active:0,count:0}),i=u[e];if(!i){var o=r.time;i=u[e]={tween:new a,time:o,ease:r.ease,delay:r.delay,duration:r.duration},++u.count,Bo.timer(function(r){function a(r){return u.active>e?l():(u.active=e,i.event&&i.event.start.call(n,s,t),i.tween.forEach(function(e,r){(r=r.call(n,s,t))&&v.push(r)
}),Bo.timer(function(){return p.c=c(r||1)?Ae:c,1},0,o),void 0)}function c(r){if(u.active!==e)return l();for(var o=r/g,a=f(o),c=v.length;c>0;)v[--c].call(n,a);return o>=1?(i.event&&i.event.end.call(n,s,t),l()):void 0}function l(){return--u.count?delete u[e]:delete n.__transition__,1}var s=n.__data__,f=i.ease,h=i.delay,g=i.duration,p=Ka,v=[];return p.t=h+o,r>=h?a(r-h):(p.c=a,void 0)},0,o)}}function Oo(n,t,e){n.attr("transform",function(n){var r=t(n);return"translate("+(isFinite(r)?r:e(n))+",0)"})}function Yo(n,t,e){n.attr("transform",function(n){var r=t(n);return"translate(0,"+(isFinite(r)?r:e(n))+")"})}function Io(n){return n.toISOString()}function Zo(n,t,e){function r(t){return n(t)}function u(n,e){var r=n[1]-n[0],u=r/e,i=Bo.bisect(Ol,u);return i==Ol.length?[t.year,Zi(n.map(function(n){return n/31536e6}),e)[2]]:i?t[u/Ol[i-1]<Ol[i]/u?i-1:i]:[Zl,Zi(n,e)[2]]}return r.invert=function(t){return Vo(n.invert(t))},r.domain=function(t){return arguments.length?(n.domain(t),r):n.domain().map(Vo)},r.nice=function(n,t){function e(e){return!isNaN(e)&&!n.range(e,Vo(+e+1),t).length}var i=r.domain(),o=Di(i),a=null==n?u(o,10):"number"==typeof n&&u(o,n);return a&&(n=a[0],t=a[1]),r.domain(ji(i,t>1?{floor:function(t){for(;e(t=n.floor(t));)t=Vo(t-1);return t},ceil:function(t){for(;e(t=n.ceil(t));)t=Vo(+t+1);return t}}:n))},r.ticks=function(n,t){var e=Di(r.domain()),i=null==n?u(e,10):"number"==typeof n?u(e,n):!n.range&&[{range:n},t];return i&&(n=i[0],t=i[1]),n.range(e[0],Vo(+e[1]+1),1>t?1:t)},r.tickFormat=function(){return e},r.copy=function(){return Zo(n.copy(),t,e)},Yi(r,n)}function Vo(n){return new Date(n)}function Xo(n){return JSON.parse(n.responseText)}function $o(n){var t=Go.createRange();return t.selectNode(Go.body),t.createContextualFragment(n.responseText)}var Bo={version:"3.4.13"};Date.now||(Date.now=function(){return+new Date});var Wo=[].slice,Jo=function(n){return Wo.call(n)},Go=document,Ko=Go.documentElement,Qo=window;try{Jo(Ko.childNodes)[0].nodeType}catch(na){Jo=function(n){for(var t=n.length,e=new Array(t);t--;)e[t]=n[t];return e}}try{Go.createElement("div").style.setProperty("opacity",0,"")}catch(ta){var ea=Qo.Element.prototype,ra=ea.setAttribute,ua=ea.setAttributeNS,ia=Qo.CSSStyleDeclaration.prototype,oa=ia.setProperty;ea.setAttribute=function(n,t){ra.call(this,n,t+"")},ea.setAttributeNS=function(n,t,e){ua.call(this,n,t,e+"")},ia.setProperty=function(n,t,e){oa.call(this,n,t+"",e)}}Bo.ascending=n,Bo.descending=function(n,t){return n>t?-1:t>n?1:t>=n?0:0/0},Bo.min=function(n,t){var e,r,u=-1,i=n.length;if(1===arguments.length){for(;++u<i&&!(null!=(e=n[u])&&e>=e);)e=void 0;for(;++u<i;)null!=(r=n[u])&&e>r&&(e=r)}else{for(;++u<i&&!(null!=(e=t.call(n,n[u],u))&&e>=e);)e=void 0;for(;++u<i;)null!=(r=t.call(n,n[u],u))&&e>r&&(e=r)}return e},Bo.max=function(n,t){var e,r,u=-1,i=n.length;if(1===arguments.length){for(;++u<i&&!(null!=(e=n[u])&&e>=e);)e=void 0;for(;++u<i;)null!=(r=n[u])&&r>e&&(e=r)}else{for(;++u<i&&!(null!=(e=t.call(n,n[u],u))&&e>=e);)e=void 0;for(;++u<i;)null!=(r=t.call(n,n[u],u))&&r>e&&(e=r)}return e},Bo.extent=function(n,t){var e,r,u,i=-1,o=n.length;if(1===arguments.length){for(;++i<o&&!(null!=(e=u=n[i])&&e>=e);)e=u=void 0;for(;++i<o;)null!=(r=n[i])&&(e>r&&(e=r),r>u&&(u=r))}else{for(;++i<o&&!(null!=(e=u=t.call(n,n[i],i))&&e>=e);)e=void 0;for(;++i<o;)null!=(r=t.call(n,n[i],i))&&(e>r&&(e=r),r>u&&(u=r))}return[e,u]},Bo.sum=function(n,t){var r,u=0,i=n.length,o=-1;if(1===arguments.length)for(;++o<i;)e(r=+n[o])&&(u+=r);else for(;++o<i;)e(r=+t.call(n,n[o],o))&&(u+=r);return u},Bo.mean=function(n,r){var u,i=0,o=n.length,a=-1,c=o;if(1===arguments.length)for(;++a<o;)e(u=t(n[a]))?i+=u:--c;else for(;++a<o;)e(u=t(r.call(n,n[a],a)))?i+=u:--c;return c?i/c:void 0},Bo.quantile=function(n,t){var e=(n.length-1)*t+1,r=Math.floor(e),u=+n[r-1],i=e-r;return i?u+i*(n[r]-u):u},Bo.median=function(r,u){var i,o=[],a=r.length,c=-1;if(1===arguments.length)for(;++c<a;)e(i=t(r[c]))&&o.push(i);else for(;++c<a;)e(i=t(u.call(r,r[c],c)))&&o.push(i);return o.length?Bo.quantile(o.sort(n),.5):void 0};var aa=r(n);Bo.bisectLeft=aa.left,Bo.bisect=Bo.bisectRight=aa.right,Bo.bisector=function(t){return r(1===t.length?function(e,r){return n(t(e),r)}:t)},Bo.shuffle=function(n){for(var t,e,r=n.length;r;)e=0|Math.random()*r--,t=n[r],n[r]=n[e],n[e]=t;return n},Bo.permute=function(n,t){for(var e=t.length,r=new Array(e);e--;)r[e]=n[t[e]];return r},Bo.pairs=function(n){for(var t,e=0,r=n.length-1,u=n[0],i=new Array(0>r?0:r);r>e;)i[e]=[t=u,u=n[++e]];return i},Bo.zip=function(){if(!(r=arguments.length))return[];for(var n=-1,t=Bo.min(arguments,u),e=new Array(t);++n<t;)for(var r,i=-1,o=e[n]=new Array(r);++i<r;)o[i]=arguments[i][n];return e},Bo.transpose=function(n){return Bo.zip.apply(Bo,n)},Bo.keys=function(n){var t=[];for(var e in n)t.push(e);return t},Bo.values=function(n){var t=[];for(var e in n)t.push(n[e]);return t},Bo.entries=function(n){var t=[];for(var e in n)t.push({key:e,value:n[e]});return t},Bo.merge=function(n){for(var t,e,r,u=n.length,i=-1,o=0;++i<u;)o+=n[i].length;for(e=new Array(o);--u>=0;)for(r=n[u],t=r.length;--t>=0;)e[--o]=r[t];return e};var ca=Math.abs;Bo.range=function(n,t,e){if(arguments.length<3&&(e=1,arguments.length<2&&(t=n,n=0)),1/0===(t-n)/e)throw new Error("infinite range");var r,u=[],o=i(ca(e)),a=-1;if(n*=o,t*=o,e*=o,0>e)for(;(r=n+e*++a)>t;)u.push(r/o);else for(;(r=n+e*++a)<t;)u.push(r/o);return u},Bo.map=function(n){var t=new a;if(n instanceof a)n.forEach(function(n,e){t.set(n,e)});else for(var e in n)t.set(e,n[e]);return t};var la="__proto__",sa="\x00";o(a,{has:s,get:function(n){return this._[c(n)]},set:function(n,t){return this._[c(n)]=t},remove:f,keys:h,values:function(){var n=[];for(var t in this._)n.push(this._[t]);return n},entries:function(){var n=[];for(var t in this._)n.push({key:l(t),value:this._[t]});return n},size:g,empty:p,forEach:function(n){for(var t in this._)n.call(this,l(t),this._[t])}}),Bo.nest=function(){function n(t,o,c){if(c>=i.length)return r?r.call(u,o):e?o.sort(e):o;for(var l,s,f,h,g=-1,p=o.length,v=i[c++],d=new a;++g<p;)(h=d.get(l=v(s=o[g])))?h.push(s):d.set(l,[s]);return t?(s=t(),f=function(e,r){s.set(e,n(t,r,c))}):(s={},f=function(e,r){s[e]=n(t,r,c)}),d.forEach(f),s}function t(n,e){if(e>=i.length)return n;var r=[],u=o[e++];return n.forEach(function(n,u){r.push({key:n,values:t(u,e)})}),u?r.sort(function(n,t){return u(n.key,t.key)}):r}var e,r,u={},i=[],o=[];return u.map=function(t,e){return n(e,t,0)},u.entries=function(e){return t(n(Bo.map,e,0),0)},u.key=function(n){return i.push(n),u},u.sortKeys=function(n){return o[i.length-1]=n,u},u.sortValues=function(n){return e=n,u},u.rollup=function(n){return r=n,u},u},Bo.set=function(n){var t=new v;if(n)for(var e=0,r=n.length;r>e;++e)t.add(n[e]);return t},o(v,{has:s,add:function(n){return this._[c(n+="")]=!0,n},remove:f,values:h,size:g,empty:p,forEach:function(n){for(var t in this._)n.call(this,l(t))}}),Bo.behavior={},Bo.rebind=function(n,t){for(var e,r=1,u=arguments.length;++r<u;)n[e=arguments[r]]=d(n,t,t[e]);return n};var fa=["webkit","ms","moz","Moz","o","O"];Bo.dispatch=function(){for(var n=new x,t=-1,e=arguments.length;++t<e;)n[arguments[t]]=M(n);return n},x.prototype.on=function(n,t){var e=n.indexOf("."),r="";if(e>=0&&(r=n.slice(e+1),n=n.slice(0,e)),n)return arguments.length<2?this[n].on(r):this[n].on(r,t);if(2===arguments.length){if(null==t)for(n in this)this.hasOwnProperty(n)&&this[n].on(r,null);return this}},Bo.event=null,Bo.requote=function(n){return n.replace(ha,"\\$&")};var ha=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g,ga={}.__proto__?function(n,t){n.__proto__=t}:function(n,t){for(var e in t)n[e]=t[e]},pa=function(n,t){return t.querySelector(n)},va=function(n,t){return t.querySelectorAll(n)},da=Ko.matches||Ko[m(Ko,"matchesSelector")],ma=function(n,t){return da.call(n,t)};"function"==typeof Sizzle&&(pa=function(n,t){return Sizzle(n,t)[0]||null},va=Sizzle,ma=Sizzle.matchesSelector),Bo.selection=function(){return _a};var ya=Bo.selection.prototype=[];ya.select=function(n){var t,e,r,u,i=[];n=k(n);for(var o=-1,a=this.length;++o<a;){i.push(t=[]),t.parentNode=(r=this[o]).parentNode;for(var c=-1,l=r.length;++c<l;)(u=r[c])?(t.push(e=n.call(u,u.__data__,c,o)),e&&"__data__"in u&&(e.__data__=u.__data__)):t.push(null)}return S(i)},ya.selectAll=function(n){var t,e,r=[];n=E(n);for(var u=-1,i=this.length;++u<i;)for(var o=this[u],a=-1,c=o.length;++a<c;)(e=o[a])&&(r.push(t=Jo(n.call(e,e.__data__,a,u))),t.parentNode=e);return S(r)};var xa={svg:"http://www.w3.org/2000/svg",xhtml:"http://www.w3.org/1999/xhtml",xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};Bo.ns={prefix:xa,qualify:function(n){var t=n.indexOf(":"),e=n;return t>=0&&(e=n.slice(0,t),n=n.slice(t+1)),xa.hasOwnProperty(e)?{space:xa[e],local:n}:n}},ya.attr=function(n,t){if(arguments.length<2){if("string"==typeof n){var e=this.node();return n=Bo.ns.qualify(n),n.local?e.getAttributeNS(n.space,n.local):e.getAttribute(n)}for(t in n)this.each(A(t,n[t]));return this}return this.each(A(n,t))},ya.classed=function(n,t){if(arguments.length<2){if("string"==typeof n){var e=this.node(),r=(n=z(n)).length,u=-1;if(t=e.classList){for(;++u<r;)if(!t.contains(n[u]))return!1}else for(t=e.getAttribute("class");++u<r;)if(!N(n[u]).test(t))return!1;return!0}for(t in n)this.each(L(t,n[t]));return this}return this.each(L(n,t))},ya.style=function(n,t,e){var r=arguments.length;if(3>r){if("string"!=typeof n){2>r&&(t="");for(e in n)this.each(q(e,n[e],t));return this}if(2>r)return Qo.getComputedStyle(this.node(),null).getPropertyValue(n);e=""}return this.each(q(n,t,e))},ya.property=function(n,t){if(arguments.length<2){if("string"==typeof n)return this.node()[n];for(t in n)this.each(R(t,n[t]));return this}return this.each(R(n,t))},ya.text=function(n){return arguments.length?this.each("function"==typeof n?function(){var t=n.apply(this,arguments);this.textContent=null==t?"":t}:null==n?function(){this.textContent=""}:function(){this.textContent=n}):this.node().textContent},ya.html=function(n){return arguments.length?this.each("function"==typeof n?function(){var t=n.apply(this,arguments);this.innerHTML=null==t?"":t}:null==n?function(){this.innerHTML=""}:function(){this.innerHTML=n}):this.node().innerHTML},ya.append=function(n){return n=D(n),this.select(function(){return this.appendChild(n.apply(this,arguments))})},ya.insert=function(n,t){return n=D(n),t=k(t),this.select(function(){return this.insertBefore(n.apply(this,arguments),t.apply(this,arguments)||null)})},ya.remove=function(){return this.each(function(){var n=this.parentNode;n&&n.removeChild(this)})},ya.data=function(n,t){function e(n,e){var r,u,i,o=n.length,f=e.length,h=Math.min(o,f),g=new Array(f),p=new Array(f),v=new Array(o);if(t){var d,m=new a,y=new Array(o);for(r=-1;++r<o;)m.has(d=t.call(u=n[r],u.__data__,r))?v[r]=u:m.set(d,u),y[r]=d;for(r=-1;++r<f;)(u=m.get(d=t.call(e,i=e[r],r)))?u!==!0&&(g[r]=u,u.__data__=i):p[r]=P(i),m.set(d,!0);for(r=-1;++r<o;)m.get(y[r])!==!0&&(v[r]=n[r])}else{for(r=-1;++r<h;)u=n[r],i=e[r],u?(u.__data__=i,g[r]=u):p[r]=P(i);for(;f>r;++r)p[r]=P(e[r]);for(;o>r;++r)v[r]=n[r]}p.update=g,p.parentNode=g.parentNode=v.parentNode=n.parentNode,c.push(p),l.push(g),s.push(v)}var r,u,i=-1,o=this.length;if(!arguments.length){for(n=new Array(o=(r=this[0]).length);++i<o;)(u=r[i])&&(n[i]=u.__data__);return n}var c=H([]),l=S([]),s=S([]);if("function"==typeof n)for(;++i<o;)e(r=this[i],n.call(r,r.parentNode.__data__,i));else for(;++i<o;)e(r=this[i],n);return l.enter=function(){return c},l.exit=function(){return s},l},ya.datum=function(n){return arguments.length?this.property("__data__",n):this.property("__data__")},ya.filter=function(n){var t,e,r,u=[];"function"!=typeof n&&(n=U(n));for(var i=0,o=this.length;o>i;i++){u.push(t=[]),t.parentNode=(e=this[i]).parentNode;for(var a=0,c=e.length;c>a;a++)(r=e[a])&&n.call(r,r.__data__,a,i)&&t.push(r)}return S(u)},ya.order=function(){for(var n=-1,t=this.length;++n<t;)for(var e,r=this[n],u=r.length-1,i=r[u];--u>=0;)(e=r[u])&&(i&&i!==e.nextSibling&&i.parentNode.insertBefore(e,i),i=e);return this},ya.sort=function(n){n=j.apply(this,arguments);for(var t=-1,e=this.length;++t<e;)this[t].sort(n);return this.order()},ya.each=function(n){return F(this,function(t,e,r){n.call(t,t.__data__,e,r)})},ya.call=function(n){var t=Jo(arguments);return n.apply(t[0]=this,t),this},ya.empty=function(){return!this.node()},ya.node=function(){for(var n=0,t=this.length;t>n;n++)for(var e=this[n],r=0,u=e.length;u>r;r++){var i=e[r];if(i)return i}return null},ya.size=function(){var n=0;return F(this,function(){++n}),n};var Ma=[];Bo.selection.enter=H,Bo.selection.enter.prototype=Ma,Ma.append=ya.append,Ma.empty=ya.empty,Ma.node=ya.node,Ma.call=ya.call,Ma.size=ya.size,Ma.select=function(n){for(var t,e,r,u,i,o=[],a=-1,c=this.length;++a<c;){r=(u=this[a]).update,o.push(t=[]),t.parentNode=u.parentNode;for(var l=-1,s=u.length;++l<s;)(i=u[l])?(t.push(r[l]=e=n.call(u.parentNode,i.__data__,l,a)),e.__data__=i.__data__):t.push(null)}return S(o)},Ma.insert=function(n,t){return arguments.length<2&&(t=O(this)),ya.insert.call(this,n,t)},ya.transition=function(){for(var n,t,e=Cl||++ql,r=[],u=Nl||{time:Date.now(),ease:wu,delay:0,duration:250},i=-1,o=this.length;++i<o;){r.push(n=[]);for(var a=this[i],c=-1,l=a.length;++c<l;)(t=a[c])&&Ho(t,c,e,u),n.push(t)}return Uo(r,e)},ya.interrupt=function(){return this.each(Y)},Bo.select=function(n){var t=["string"==typeof n?pa(n,Go):n];return t.parentNode=Ko,S([t])},Bo.selectAll=function(n){var t=Jo("string"==typeof n?va(n,Go):n);return t.parentNode=Ko,S([t])};var _a=Bo.select(Ko);ya.on=function(n,t,e){var r=arguments.length;if(3>r){if("string"!=typeof n){2>r&&(t=!1);for(e in n)this.each(I(e,n[e],t));return this}if(2>r)return(r=this.node()["__on"+n])&&r._;e=!1}return this.each(I(n,t,e))};var ba=Bo.map({mouseenter:"mouseover",mouseleave:"mouseout"});ba.forEach(function(n){"on"+n in Go&&ba.remove(n)});var wa="onselectstart"in Go?null:m(Ko.style,"userSelect"),Sa=0;Bo.mouse=function(n){return $(n,b())};var ka=/WebKit/.test(Qo.navigator.userAgent)?-1:0;Bo.touch=function(n,t,e){if(arguments.length<3&&(e=t,t=b().changedTouches),t)for(var r,u=0,i=t.length;i>u;++u)if((r=t[u]).identifier===e)return $(n,r)},Bo.behavior.drag=function(){function n(){this.on("mousedown.drag",u).on("touchstart.drag",i)}function t(n,t,u,i,o){return function(){function a(){var n,e,r=t(h,v);r&&(n=r[0]-x[0],e=r[1]-x[1],p|=n|e,x=r,g({type:"drag",x:r[0]+l[0],y:r[1]+l[1],dx:n,dy:e}))}function c(){t(h,v)&&(m.on(i+d,null).on(o+d,null),y(p&&Bo.event.target===f),g({type:"dragend"}))}var l,s=this,f=Bo.event.target,h=s.parentNode,g=e.of(s,arguments),p=0,v=n(),d=".drag"+(null==v?"":"-"+v),m=Bo.select(u()).on(i+d,a).on(o+d,c),y=X(),x=t(h,v);r?(l=r.apply(s,arguments),l=[l.x-x[0],l.y-x[1]]):l=[0,0],g({type:"dragstart"})}}var e=w(n,"drag","dragstart","dragend"),r=null,u=t(y,Bo.mouse,J,"mousemove","mouseup"),i=t(B,Bo.touch,W,"touchmove","touchend");return n.origin=function(t){return arguments.length?(r=t,n):r},Bo.rebind(n,e,"on")},Bo.touches=function(n,t){return arguments.length<2&&(t=b().touches),t?Jo(t).map(function(t){var e=$(n,t);return e.identifier=t.identifier,e}):[]};var Ea=Math.PI,Aa=2*Ea,Ca=Ea/2,Na=1e-6,za=Na*Na,La=Ea/180,Ta=180/Ea,qa=Math.SQRT2,Ra=2,Da=4;Bo.interpolateZoom=function(n,t){function e(n){var t=n*y;if(m){var e=et(v),o=i/(Ra*h)*(e*rt(qa*t+v)-tt(v));return[r+o*l,u+o*s,i*e/et(qa*t+v)]}return[r+n*l,u+n*s,i*Math.exp(qa*t)]}var r=n[0],u=n[1],i=n[2],o=t[0],a=t[1],c=t[2],l=o-r,s=a-u,f=l*l+s*s,h=Math.sqrt(f),g=(c*c-i*i+Da*f)/(2*i*Ra*h),p=(c*c-i*i-Da*f)/(2*c*Ra*h),v=Math.log(Math.sqrt(g*g+1)-g),d=Math.log(Math.sqrt(p*p+1)-p),m=d-v,y=(m||Math.log(c/i))/qa;return e.duration=1e3*y,e},Bo.behavior.zoom=function(){function n(n){n.on(A,l).on(ja+".zoom",f).on("dblclick.zoom",h).on(z,s)}function t(n){return[(n[0]-S.x)/S.k,(n[1]-S.y)/S.k]}function e(n){return[n[0]*S.k+S.x,n[1]*S.k+S.y]}function r(n){S.k=Math.max(E[0],Math.min(E[1],n))}function u(n,t){t=e(t),S.x+=n[0]-t[0],S.y+=n[1]-t[1]}function i(){x&&x.domain(y.range().map(function(n){return(n-S.x)/S.k}).map(y.invert)),b&&b.domain(M.range().map(function(n){return(n-S.y)/S.k}).map(M.invert))}function o(n){n({type:"zoomstart"})}function a(n){i(),n({type:"zoom",scale:S.k,translate:[S.x,S.y]})}function c(n){n({type:"zoomend"})}function l(){function n(){s=1,u(Bo.mouse(r),h),a(l)}function e(){f.on(C,null).on(N,null),g(s&&Bo.event.target===i),c(l)}var r=this,i=Bo.event.target,l=L.of(r,arguments),s=0,f=Bo.select(Qo).on(C,n).on(N,e),h=t(Bo.mouse(r)),g=X();Y.call(r),o(l)}function s(){function n(){var n=Bo.touches(g);return h=S.k,n.forEach(function(n){n.identifier in v&&(v[n.identifier]=t(n))}),n}function e(){var t=Bo.event.target;Bo.select(t).on(x,i).on(M,f),b.push(t);for(var e=Bo.event.changedTouches,o=0,c=e.length;c>o;++o)v[e[o].identifier]=null;var l=n(),s=Date.now();if(1===l.length){if(500>s-m){var h=l[0],g=v[h.identifier];r(2*S.k),u(h,g),_(),a(p)}m=s}else if(l.length>1){var h=l[0],y=l[1],w=h[0]-y[0],k=h[1]-y[1];d=w*w+k*k}}function i(){for(var n,t,e,i,o=Bo.touches(g),c=0,l=o.length;l>c;++c,i=null)if(e=o[c],i=v[e.identifier]){if(t)break;n=e,t=i}if(i){var s=(s=e[0]-n[0])*s+(s=e[1]-n[1])*s,f=d&&Math.sqrt(s/d);n=[(n[0]+e[0])/2,(n[1]+e[1])/2],t=[(t[0]+i[0])/2,(t[1]+i[1])/2],r(f*h)}m=null,u(n,t),a(p)}function f(){if(Bo.event.touches.length){for(var t=Bo.event.changedTouches,e=0,r=t.length;r>e;++e)delete v[t[e].identifier];for(var u in v)return void n()}Bo.selectAll(b).on(y,null),w.on(A,l).on(z,s),k(),c(p)}var h,g=this,p=L.of(g,arguments),v={},d=0,y=".zoom-"+Bo.event.changedTouches[0].identifier,x="touchmove"+y,M="touchend"+y,b=[],w=Bo.select(g),k=X();Y.call(g),e(),o(p),w.on(A,null).on(z,e)}function f(){var n=L.of(this,arguments);d?clearTimeout(d):(g=t(p=v||Bo.mouse(this)),Y.call(this),o(n)),d=setTimeout(function(){d=null,c(n)},50),_(),r(Math.pow(2,.002*Pa())*S.k),u(p,g),a(n)}function h(){var n=L.of(this,arguments),e=Bo.mouse(this),i=t(e),l=Math.log(S.k)/Math.LN2;o(n),r(Math.pow(2,Bo.event.shiftKey?Math.ceil(l)-1:Math.floor(l)+1)),u(e,i),a(n),c(n)}var g,p,v,d,m,y,x,M,b,S={x:0,y:0,k:1},k=[960,500],E=Ua,A="mousedown.zoom",C="mousemove.zoom",N="mouseup.zoom",z="touchstart.zoom",L=w(n,"zoomstart","zoom","zoomend");return n.event=function(n){n.each(function(){var n=L.of(this,arguments),t=S;Cl?Bo.select(this).transition().each("start.zoom",function(){S=this.__chart__||{x:0,y:0,k:1},o(n)}).tween("zoom:zoom",function(){var e=k[0],r=k[1],u=e/2,i=r/2,o=Bo.interpolateZoom([(u-S.x)/S.k,(i-S.y)/S.k,e/S.k],[(u-t.x)/t.k,(i-t.y)/t.k,e/t.k]);return function(t){var r=o(t),c=e/r[2];this.__chart__=S={x:u-r[0]*c,y:i-r[1]*c,k:c},a(n)}}).each("end.zoom",function(){c(n)}):(this.__chart__=S,o(n),a(n),c(n))})},n.translate=function(t){return arguments.length?(S={x:+t[0],y:+t[1],k:S.k},i(),n):[S.x,S.y]},n.scale=function(t){return arguments.length?(S={x:S.x,y:S.y,k:+t},i(),n):S.k},n.scaleExtent=function(t){return arguments.length?(E=null==t?Ua:[+t[0],+t[1]],n):E},n.center=function(t){return arguments.length?(v=t&&[+t[0],+t[1]],n):v},n.size=function(t){return arguments.length?(k=t&&[+t[0],+t[1]],n):k},n.x=function(t){return arguments.length?(x=t,y=t.copy(),S={x:0,y:0,k:1},n):x},n.y=function(t){return arguments.length?(b=t,M=t.copy(),S={x:0,y:0,k:1},n):b},Bo.rebind(n,L,"on")};var Pa,Ua=[0,1/0],ja="onwheel"in Go?(Pa=function(){return-Bo.event.deltaY*(Bo.event.deltaMode?120:1)},"wheel"):"onmousewheel"in Go?(Pa=function(){return Bo.event.wheelDelta},"mousewheel"):(Pa=function(){return-Bo.event.detail},"MozMousePixelScroll");Bo.color=it,it.prototype.toString=function(){return this.rgb()+""},Bo.hsl=ot;var Fa=ot.prototype=new it;Fa.brighter=function(n){return n=Math.pow(.7,arguments.length?n:1),new ot(this.h,this.s,this.l/n)},Fa.darker=function(n){return n=Math.pow(.7,arguments.length?n:1),new ot(this.h,this.s,n*this.l)},Fa.rgb=function(){return at(this.h,this.s,this.l)},Bo.hcl=ct;var Ha=ct.prototype=new it;Ha.brighter=function(n){return new ct(this.h,this.c,Math.min(100,this.l+Oa*(arguments.length?n:1)))},Ha.darker=function(n){return new ct(this.h,this.c,Math.max(0,this.l-Oa*(arguments.length?n:1)))},Ha.rgb=function(){return lt(this.h,this.c,this.l).rgb()},Bo.lab=st;var Oa=18,Ya=.95047,Ia=1,Za=1.08883,Va=st.prototype=new it;Va.brighter=function(n){return new st(Math.min(100,this.l+Oa*(arguments.length?n:1)),this.a,this.b)},Va.darker=function(n){return new st(Math.max(0,this.l-Oa*(arguments.length?n:1)),this.a,this.b)},Va.rgb=function(){return ft(this.l,this.a,this.b)},Bo.rgb=dt;var Xa=dt.prototype=new it;Xa.brighter=function(n){n=Math.pow(.7,arguments.length?n:1);var t=this.r,e=this.g,r=this.b,u=30;return t||e||r?(t&&u>t&&(t=u),e&&u>e&&(e=u),r&&u>r&&(r=u),new dt(Math.min(255,t/n),Math.min(255,e/n),Math.min(255,r/n))):new dt(u,u,u)},Xa.darker=function(n){return n=Math.pow(.7,arguments.length?n:1),new dt(n*this.r,n*this.g,n*this.b)},Xa.hsl=function(){return _t(this.r,this.g,this.b)},Xa.toString=function(){return"#"+xt(this.r)+xt(this.g)+xt(this.b)};var $a=Bo.map({aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074});$a.forEach(function(n,t){$a.set(n,mt(t))}),Bo.functor=kt,Bo.xhr=At(Et),Bo.dsv=function(n,t){function e(n,e,i){arguments.length<3&&(i=e,e=null);var o=Ct(n,t,null==e?r:u(e),i);return o.row=function(n){return arguments.length?o.response(null==(e=n)?r:u(n)):e},o}function r(n){return e.parse(n.responseText)}function u(n){return function(t){return e.parse(t.responseText,n)}}function i(t){return t.map(o).join(n)}function o(n){return a.test(n)?'"'+n.replace(/\"/g,'""')+'"':n}var a=new RegExp('["'+n+"\n]"),c=n.charCodeAt(0);return e.parse=function(n,t){var r;return e.parseRows(n,function(n,e){if(r)return r(n,e-1);var u=new Function("d","return {"+n.map(function(n,t){return JSON.stringify(n)+": d["+t+"]"}).join(",")+"}");r=t?function(n,e){return t(u(n),e)}:u})},e.parseRows=function(n,t){function e(){if(s>=l)return o;if(u)return u=!1,i;var t=s;if(34===n.charCodeAt(t)){for(var e=t;e++<l;)if(34===n.charCodeAt(e)){if(34!==n.charCodeAt(e+1))break;++e}s=e+2;var r=n.charCodeAt(e+1);return 13===r?(u=!0,10===n.charCodeAt(e+2)&&++s):10===r&&(u=!0),n.slice(t+1,e).replace(/""/g,'"')}for(;l>s;){var r=n.charCodeAt(s++),a=1;if(10===r)u=!0;else if(13===r)u=!0,10===n.charCodeAt(s)&&(++s,++a);else if(r!==c)continue;return n.slice(t,s-a)}return n.slice(t)}for(var r,u,i={},o={},a=[],l=n.length,s=0,f=0;(r=e())!==o;){for(var h=[];r!==i&&r!==o;)h.push(r),r=e();t&&null==(h=t(h,f++))||a.push(h)}return a},e.format=function(t){if(Array.isArray(t[0]))return e.formatRows(t);var r=new v,u=[];return t.forEach(function(n){for(var t in n)r.has(t)||u.push(r.add(t))}),[u.map(o).join(n)].concat(t.map(function(t){return u.map(function(n){return o(t[n])}).join(n)})).join("\n")},e.formatRows=function(n){return n.map(i).join("\n")},e},Bo.csv=Bo.dsv(",","text/csv"),Bo.tsv=Bo.dsv("	","text/tab-separated-values");var Ba,Wa,Ja,Ga,Ka,Qa=Qo[m(Qo,"requestAnimationFrame")]||function(n){setTimeout(n,17)};Bo.timer=function(n,t,e){var r=arguments.length;2>r&&(t=0),3>r&&(e=Date.now());var u=e+t,i={c:n,t:u,f:!1,n:null};Wa?Wa.n=i:Ba=i,Wa=i,Ja||(Ga=clearTimeout(Ga),Ja=1,Qa(Lt))},Bo.timer.flush=function(){Tt(),qt()},Bo.round=function(n,t){return t?Math.round(n*(t=Math.pow(10,t)))/t:Math.round(n)};var nc=["y","z","a","f","p","n","\xb5","m","","k","M","G","T","P","E","Z","Y"].map(Dt);Bo.formatPrefix=function(n,t){var e=0;return n&&(0>n&&(n*=-1),t&&(n=Bo.round(n,Rt(n,t))),e=1+Math.floor(1e-12+Math.log(n)/Math.LN10),e=Math.max(-24,Math.min(24,3*Math.floor((e-1)/3)))),nc[8+e/3]};var tc=/(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i,ec=Bo.map({b:function(n){return n.toString(2)},c:function(n){return String.fromCharCode(n)},o:function(n){return n.toString(8)},x:function(n){return n.toString(16)},X:function(n){return n.toString(16).toUpperCase()},g:function(n,t){return n.toPrecision(t)},e:function(n,t){return n.toExponential(t)},f:function(n,t){return n.toFixed(t)},r:function(n,t){return(n=Bo.round(n,Rt(n,t))).toFixed(Math.max(0,Math.min(20,Rt(n*(1+1e-15),t))))}}),rc=Bo.time={},uc=Date;jt.prototype={getDate:function(){return this._.getUTCDate()},getDay:function(){return this._.getUTCDay()},getFullYear:function(){return this._.getUTCFullYear()},getHours:function(){return this._.getUTCHours()},getMilliseconds:function(){return this._.getUTCMilliseconds()},getMinutes:function(){return this._.getUTCMinutes()},getMonth:function(){return this._.getUTCMonth()},getSeconds:function(){return this._.getUTCSeconds()},getTime:function(){return this._.getTime()},getTimezoneOffset:function(){return 0},valueOf:function(){return this._.valueOf()},setDate:function(){ic.setUTCDate.apply(this._,arguments)},setDay:function(){ic.setUTCDay.apply(this._,arguments)},setFullYear:function(){ic.setUTCFullYear.apply(this._,arguments)},setHours:function(){ic.setUTCHours.apply(this._,arguments)},setMilliseconds:function(){ic.setUTCMilliseconds.apply(this._,arguments)},setMinutes:function(){ic.setUTCMinutes.apply(this._,arguments)},setMonth:function(){ic.setUTCMonth.apply(this._,arguments)},setSeconds:function(){ic.setUTCSeconds.apply(this._,arguments)},setTime:function(){ic.setTime.apply(this._,arguments)}};var ic=Date.prototype;rc.year=Ft(function(n){return n=rc.day(n),n.setMonth(0,1),n},function(n,t){n.setFullYear(n.getFullYear()+t)},function(n){return n.getFullYear()}),rc.years=rc.year.range,rc.years.utc=rc.year.utc.range,rc.day=Ft(function(n){var t=new uc(2e3,0);return t.setFullYear(n.getFullYear(),n.getMonth(),n.getDate()),t},function(n,t){n.setDate(n.getDate()+t)},function(n){return n.getDate()-1}),rc.days=rc.day.range,rc.days.utc=rc.day.utc.range,rc.dayOfYear=function(n){var t=rc.year(n);return Math.floor((n-t-6e4*(n.getTimezoneOffset()-t.getTimezoneOffset()))/864e5)},["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].forEach(function(n,t){t=7-t;var e=rc[n]=Ft(function(n){return(n=rc.day(n)).setDate(n.getDate()-(n.getDay()+t)%7),n},function(n,t){n.setDate(n.getDate()+7*Math.floor(t))},function(n){var e=rc.year(n).getDay();return Math.floor((rc.dayOfYear(n)+(e+t)%7)/7)-(e!==t)});rc[n+"s"]=e.range,rc[n+"s"].utc=e.utc.range,rc[n+"OfYear"]=function(n){var e=rc.year(n).getDay();return Math.floor((rc.dayOfYear(n)+(e+t)%7)/7)}}),rc.week=rc.sunday,rc.weeks=rc.sunday.range,rc.weeks.utc=rc.sunday.utc.range,rc.weekOfYear=rc.sundayOfYear;var oc={"-":"",_:" ",0:"0"},ac=/^\s*\d+/,cc=/^%/;Bo.locale=function(n){return{numberFormat:Pt(n),timeFormat:Ot(n)}};var lc=Bo.locale({decimal:".",thousands:",",grouping:[3],currency:["$",""],dateTime:"%a %b %e %X %Y",date:"%m/%d/%Y",time:"%H:%M:%S",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});Bo.format=lc.numberFormat,Bo.geo={},ce.prototype={s:0,t:0,add:function(n){le(n,this.t,sc),le(sc.s,this.s,this),this.s?this.t+=sc.t:this.s=sc.t},reset:function(){this.s=this.t=0},valueOf:function(){return this.s}};var sc=new ce;Bo.geo.stream=function(n,t){n&&fc.hasOwnProperty(n.type)?fc[n.type](n,t):se(n,t)};var fc={Feature:function(n,t){se(n.geometry,t)},FeatureCollection:function(n,t){for(var e=n.features,r=-1,u=e.length;++r<u;)se(e[r].geometry,t)}},hc={Sphere:function(n,t){t.sphere()},Point:function(n,t){n=n.coordinates,t.point(n[0],n[1],n[2])},MultiPoint:function(n,t){for(var e=n.coordinates,r=-1,u=e.length;++r<u;)n=e[r],t.point(n[0],n[1],n[2])},LineString:function(n,t){fe(n.coordinates,t,0)},MultiLineString:function(n,t){for(var e=n.coordinates,r=-1,u=e.length;++r<u;)fe(e[r],t,0)},Polygon:function(n,t){he(n.coordinates,t)},MultiPolygon:function(n,t){for(var e=n.coordinates,r=-1,u=e.length;++r<u;)he(e[r],t)},GeometryCollection:function(n,t){for(var e=n.geometries,r=-1,u=e.length;++r<u;)se(e[r],t)}};Bo.geo.area=function(n){return gc=0,Bo.geo.stream(n,vc),gc};var gc,pc=new ce,vc={sphere:function(){gc+=4*Ea},point:y,lineStart:y,lineEnd:y,polygonStart:function(){pc.reset(),vc.lineStart=ge},polygonEnd:function(){var n=2*pc;gc+=0>n?4*Ea+n:n,vc.lineStart=vc.lineEnd=vc.point=y}};Bo.geo.bounds=function(){function n(n,t){x.push(M=[s=n,h=n]),f>t&&(f=t),t>g&&(g=t)}function t(t,e){var r=pe([t*La,e*La]);if(m){var u=de(m,r),i=[u[1],-u[0],0],o=de(i,u);xe(o),o=Me(o);var c=t-p,l=c>0?1:-1,v=o[0]*Ta*l,d=ca(c)>180;if(d^(v>l*p&&l*t>v)){var y=o[1]*Ta;y>g&&(g=y)}else if(v=(v+360)%360-180,d^(v>l*p&&l*t>v)){var y=-o[1]*Ta;f>y&&(f=y)}else f>e&&(f=e),e>g&&(g=e);d?p>t?a(s,t)>a(s,h)&&(h=t):a(t,h)>a(s,h)&&(s=t):h>=s?(s>t&&(s=t),t>h&&(h=t)):t>p?a(s,t)>a(s,h)&&(h=t):a(t,h)>a(s,h)&&(s=t)}else n(t,e);m=r,p=t}function e(){_.point=t}function r(){M[0]=s,M[1]=h,_.point=n,m=null}function u(n,e){if(m){var r=n-p;y+=ca(r)>180?r+(r>0?360:-360):r}else v=n,d=e;vc.point(n,e),t(n,e)}function i(){vc.lineStart()}function o(){u(v,d),vc.lineEnd(),ca(y)>Na&&(s=-(h=180)),M[0]=s,M[1]=h,m=null}function a(n,t){return(t-=n)<0?t+360:t}function c(n,t){return n[0]-t[0]}function l(n,t){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}var s,f,h,g,p,v,d,m,y,x,M,_={point:n,lineStart:e,lineEnd:r,polygonStart:function(){_.point=u,_.lineStart=i,_.lineEnd=o,y=0,vc.polygonStart()},polygonEnd:function(){vc.polygonEnd(),_.point=n,_.lineStart=e,_.lineEnd=r,0>pc?(s=-(h=180),f=-(g=90)):y>Na?g=90:-Na>y&&(f=-90),M[0]=s,M[1]=h}};return function(n){g=h=-(s=f=1/0),x=[],Bo.geo.stream(n,_);
var t=x.length;if(t){x.sort(c);for(var e,r=1,u=x[0],i=[u];t>r;++r)e=x[r],l(e[0],u)||l(e[1],u)?(a(u[0],e[1])>a(u[0],u[1])&&(u[1]=e[1]),a(e[0],u[1])>a(u[0],u[1])&&(u[0]=e[0])):i.push(u=e);for(var o,e,p=-1/0,t=i.length-1,r=0,u=i[t];t>=r;u=e,++r)e=i[r],(o=a(u[1],e[0]))>p&&(p=o,s=e[0],h=u[1])}return x=M=null,1/0===s||1/0===f?[[0/0,0/0],[0/0,0/0]]:[[s,f],[h,g]]}}(),Bo.geo.centroid=function(n){dc=mc=yc=xc=Mc=_c=bc=wc=Sc=kc=Ec=0,Bo.geo.stream(n,Ac);var t=Sc,e=kc,r=Ec,u=t*t+e*e+r*r;return za>u&&(t=_c,e=bc,r=wc,Na>mc&&(t=yc,e=xc,r=Mc),u=t*t+e*e+r*r,za>u)?[0/0,0/0]:[Math.atan2(e,t)*Ta,nt(r/Math.sqrt(u))*Ta]};var dc,mc,yc,xc,Mc,_c,bc,wc,Sc,kc,Ec,Ac={sphere:y,point:be,lineStart:Se,lineEnd:ke,polygonStart:function(){Ac.lineStart=Ee},polygonEnd:function(){Ac.lineStart=Se}},Cc=Le(Ae,De,Ue,[-Ea,-Ea/2]),Nc=1e9;Bo.geo.clipExtent=function(){var n,t,e,r,u,i,o={stream:function(n){return u&&(u.valid=!1),u=i(n),u.valid=!0,u},extent:function(a){return arguments.length?(i=Oe(n=+a[0][0],t=+a[0][1],e=+a[1][0],r=+a[1][1]),u&&(u.valid=!1,u=null),o):[[n,t],[e,r]]}};return o.extent([[0,0],[960,500]])},(Bo.geo.conicEqualArea=function(){return Ie(Ze)}).raw=Ze,Bo.geo.albers=function(){return Bo.geo.conicEqualArea().rotate([96,0]).center([-.6,38.7]).parallels([29.5,45.5]).scale(1070)},Bo.geo.albersUsa=function(){function n(n){var i=n[0],o=n[1];return t=null,e(i,o),t||(r(i,o),t)||u(i,o),t}var t,e,r,u,i=Bo.geo.albers(),o=Bo.geo.conicEqualArea().rotate([154,0]).center([-2,58.5]).parallels([55,65]),a=Bo.geo.conicEqualArea().rotate([157,0]).center([-3,19.9]).parallels([8,18]),c={point:function(n,e){t=[n,e]}};return n.invert=function(n){var t=i.scale(),e=i.translate(),r=(n[0]-e[0])/t,u=(n[1]-e[1])/t;return(u>=.12&&.234>u&&r>=-.425&&-.214>r?o:u>=.166&&.234>u&&r>=-.214&&-.115>r?a:i).invert(n)},n.stream=function(n){var t=i.stream(n),e=o.stream(n),r=a.stream(n);return{point:function(n,u){t.point(n,u),e.point(n,u),r.point(n,u)},sphere:function(){t.sphere(),e.sphere(),r.sphere()},lineStart:function(){t.lineStart(),e.lineStart(),r.lineStart()},lineEnd:function(){t.lineEnd(),e.lineEnd(),r.lineEnd()},polygonStart:function(){t.polygonStart(),e.polygonStart(),r.polygonStart()},polygonEnd:function(){t.polygonEnd(),e.polygonEnd(),r.polygonEnd()}}},n.precision=function(t){return arguments.length?(i.precision(t),o.precision(t),a.precision(t),n):i.precision()},n.scale=function(t){return arguments.length?(i.scale(t),o.scale(.35*t),a.scale(t),n.translate(i.translate())):i.scale()},n.translate=function(t){if(!arguments.length)return i.translate();var l=i.scale(),s=+t[0],f=+t[1];return e=i.translate(t).clipExtent([[s-.455*l,f-.238*l],[s+.455*l,f+.238*l]]).stream(c).point,r=o.translate([s-.307*l,f+.201*l]).clipExtent([[s-.425*l+Na,f+.12*l+Na],[s-.214*l-Na,f+.234*l-Na]]).stream(c).point,u=a.translate([s-.205*l,f+.212*l]).clipExtent([[s-.214*l+Na,f+.166*l+Na],[s-.115*l-Na,f+.234*l-Na]]).stream(c).point,n},n.scale(1070)};var zc,Lc,Tc,qc,Rc,Dc,Pc={point:y,lineStart:y,lineEnd:y,polygonStart:function(){Lc=0,Pc.lineStart=Ve},polygonEnd:function(){Pc.lineStart=Pc.lineEnd=Pc.point=y,zc+=ca(Lc/2)}},Uc={point:Xe,lineStart:y,lineEnd:y,polygonStart:y,polygonEnd:y},jc={point:We,lineStart:Je,lineEnd:Ge,polygonStart:function(){jc.lineStart=Ke},polygonEnd:function(){jc.point=We,jc.lineStart=Je,jc.lineEnd=Ge}};Bo.geo.path=function(){function n(n){return n&&("function"==typeof a&&i.pointRadius(+a.apply(this,arguments)),o&&o.valid||(o=u(i)),Bo.geo.stream(n,o)),i.result()}function t(){return o=null,n}var e,r,u,i,o,a=4.5;return n.area=function(n){return zc=0,Bo.geo.stream(n,u(Pc)),zc},n.centroid=function(n){return yc=xc=Mc=_c=bc=wc=Sc=kc=Ec=0,Bo.geo.stream(n,u(jc)),Ec?[Sc/Ec,kc/Ec]:wc?[_c/wc,bc/wc]:Mc?[yc/Mc,xc/Mc]:[0/0,0/0]},n.bounds=function(n){return Rc=Dc=-(Tc=qc=1/0),Bo.geo.stream(n,u(Uc)),[[Tc,qc],[Rc,Dc]]},n.projection=function(n){return arguments.length?(u=(e=n)?n.stream||tr(n):Et,t()):e},n.context=function(n){return arguments.length?(i=null==(r=n)?new $e:new Qe(n),"function"!=typeof a&&i.pointRadius(a),t()):r},n.pointRadius=function(t){return arguments.length?(a="function"==typeof t?t:(i.pointRadius(+t),+t),n):a},n.projection(Bo.geo.albersUsa()).context(null)},Bo.geo.transform=function(n){return{stream:function(t){var e=new er(t);for(var r in n)e[r]=n[r];return e}}},er.prototype={point:function(n,t){this.stream.point(n,t)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}},Bo.geo.projection=ur,Bo.geo.projectionMutator=ir,(Bo.geo.equirectangular=function(){return ur(ar)}).raw=ar.invert=ar,Bo.geo.rotation=function(n){function t(t){return t=n(t[0]*La,t[1]*La),t[0]*=Ta,t[1]*=Ta,t}return n=lr(n[0]%360*La,n[1]*La,n.length>2?n[2]*La:0),t.invert=function(t){return t=n.invert(t[0]*La,t[1]*La),t[0]*=Ta,t[1]*=Ta,t},t},cr.invert=ar,Bo.geo.circle=function(){function n(){var n="function"==typeof r?r.apply(this,arguments):r,t=lr(-n[0]*La,-n[1]*La,0).invert,u=[];return e(null,null,1,{point:function(n,e){u.push(n=t(n,e)),n[0]*=Ta,n[1]*=Ta}}),{type:"Polygon",coordinates:[u]}}var t,e,r=[0,0],u=6;return n.origin=function(t){return arguments.length?(r=t,n):r},n.angle=function(r){return arguments.length?(e=gr((t=+r)*La,u*La),n):t},n.precision=function(r){return arguments.length?(e=gr(t*La,(u=+r)*La),n):u},n.angle(90)},Bo.geo.distance=function(n,t){var e,r=(t[0]-n[0])*La,u=n[1]*La,i=t[1]*La,o=Math.sin(r),a=Math.cos(r),c=Math.sin(u),l=Math.cos(u),s=Math.sin(i),f=Math.cos(i);return Math.atan2(Math.sqrt((e=f*o)*e+(e=l*s-c*f*a)*e),c*s+l*f*a)},Bo.geo.graticule=function(){function n(){return{type:"MultiLineString",coordinates:t()}}function t(){return Bo.range(Math.ceil(i/d)*d,u,d).map(h).concat(Bo.range(Math.ceil(l/m)*m,c,m).map(g)).concat(Bo.range(Math.ceil(r/p)*p,e,p).filter(function(n){return ca(n%d)>Na}).map(s)).concat(Bo.range(Math.ceil(a/v)*v,o,v).filter(function(n){return ca(n%m)>Na}).map(f))}var e,r,u,i,o,a,c,l,s,f,h,g,p=10,v=p,d=90,m=360,y=2.5;return n.lines=function(){return t().map(function(n){return{type:"LineString",coordinates:n}})},n.outline=function(){return{type:"Polygon",coordinates:[h(i).concat(g(c).slice(1),h(u).reverse().slice(1),g(l).reverse().slice(1))]}},n.extent=function(t){return arguments.length?n.majorExtent(t).minorExtent(t):n.minorExtent()},n.majorExtent=function(t){return arguments.length?(i=+t[0][0],u=+t[1][0],l=+t[0][1],c=+t[1][1],i>u&&(t=i,i=u,u=t),l>c&&(t=l,l=c,c=t),n.precision(y)):[[i,l],[u,c]]},n.minorExtent=function(t){return arguments.length?(r=+t[0][0],e=+t[1][0],a=+t[0][1],o=+t[1][1],r>e&&(t=r,r=e,e=t),a>o&&(t=a,a=o,o=t),n.precision(y)):[[r,a],[e,o]]},n.step=function(t){return arguments.length?n.majorStep(t).minorStep(t):n.minorStep()},n.majorStep=function(t){return arguments.length?(d=+t[0],m=+t[1],n):[d,m]},n.minorStep=function(t){return arguments.length?(p=+t[0],v=+t[1],n):[p,v]},n.precision=function(t){return arguments.length?(y=+t,s=vr(a,o,90),f=dr(r,e,y),h=vr(l,c,90),g=dr(i,u,y),n):y},n.majorExtent([[-180,-90+Na],[180,90-Na]]).minorExtent([[-180,-80-Na],[180,80+Na]])},Bo.geo.greatArc=function(){function n(){return{type:"LineString",coordinates:[t||r.apply(this,arguments),e||u.apply(this,arguments)]}}var t,e,r=mr,u=yr;return n.distance=function(){return Bo.geo.distance(t||r.apply(this,arguments),e||u.apply(this,arguments))},n.source=function(e){return arguments.length?(r=e,t="function"==typeof e?null:e,n):r},n.target=function(t){return arguments.length?(u=t,e="function"==typeof t?null:t,n):u},n.precision=function(){return arguments.length?n:0},n},Bo.geo.interpolate=function(n,t){return xr(n[0]*La,n[1]*La,t[0]*La,t[1]*La)},Bo.geo.length=function(n){return Fc=0,Bo.geo.stream(n,Hc),Fc};var Fc,Hc={sphere:y,point:y,lineStart:Mr,lineEnd:y,polygonStart:y,polygonEnd:y},Oc=_r(function(n){return Math.sqrt(2/(1+n))},function(n){return 2*Math.asin(n/2)});(Bo.geo.azimuthalEqualArea=function(){return ur(Oc)}).raw=Oc;var Yc=_r(function(n){var t=Math.acos(n);return t&&t/Math.sin(t)},Et);(Bo.geo.azimuthalEquidistant=function(){return ur(Yc)}).raw=Yc,(Bo.geo.conicConformal=function(){return Ie(br)}).raw=br,(Bo.geo.conicEquidistant=function(){return Ie(wr)}).raw=wr;var Ic=_r(function(n){return 1/n},Math.atan);(Bo.geo.gnomonic=function(){return ur(Ic)}).raw=Ic,Sr.invert=function(n,t){return[n,2*Math.atan(Math.exp(t))-Ca]},(Bo.geo.mercator=function(){return kr(Sr)}).raw=Sr;var Zc=_r(function(){return 1},Math.asin);(Bo.geo.orthographic=function(){return ur(Zc)}).raw=Zc;var Vc=_r(function(n){return 1/(1+n)},function(n){return 2*Math.atan(n)});(Bo.geo.stereographic=function(){return ur(Vc)}).raw=Vc,Er.invert=function(n,t){return[-t,2*Math.atan(Math.exp(n))-Ca]},(Bo.geo.transverseMercator=function(){var n=kr(Er),t=n.center,e=n.rotate;return n.center=function(n){return n?t([-n[1],n[0]]):(n=t(),[n[1],-n[0]])},n.rotate=function(n){return n?e([n[0],n[1],n.length>2?n[2]+90:90]):(n=e(),[n[0],n[1],n[2]-90])},e([0,0,90])}).raw=Er,Bo.geom={},Bo.geom.hull=function(n){function t(n){if(n.length<3)return[];var t,u=kt(e),i=kt(r),o=n.length,a=[],c=[];for(t=0;o>t;t++)a.push([+u.call(this,n[t],t),+i.call(this,n[t],t),t]);for(a.sort(zr),t=0;o>t;t++)c.push([a[t][0],-a[t][1]]);var l=Nr(a),s=Nr(c),f=s[0]===l[0],h=s[s.length-1]===l[l.length-1],g=[];for(t=l.length-1;t>=0;--t)g.push(n[a[l[t]][2]]);for(t=+f;t<s.length-h;++t)g.push(n[a[s[t]][2]]);return g}var e=Ar,r=Cr;return arguments.length?t(n):(t.x=function(n){return arguments.length?(e=n,t):e},t.y=function(n){return arguments.length?(r=n,t):r},t)},Bo.geom.polygon=function(n){return ga(n,Xc),n};var Xc=Bo.geom.polygon.prototype=[];Xc.area=function(){for(var n,t=-1,e=this.length,r=this[e-1],u=0;++t<e;)n=r,r=this[t],u+=n[1]*r[0]-n[0]*r[1];return.5*u},Xc.centroid=function(n){var t,e,r=-1,u=this.length,i=0,o=0,a=this[u-1];for(arguments.length||(n=-1/(6*this.area()));++r<u;)t=a,a=this[r],e=t[0]*a[1]-a[0]*t[1],i+=(t[0]+a[0])*e,o+=(t[1]+a[1])*e;return[i*n,o*n]},Xc.clip=function(n){for(var t,e,r,u,i,o,a=qr(n),c=-1,l=this.length-qr(this),s=this[l-1];++c<l;){for(t=n.slice(),n.length=0,u=this[c],i=t[(r=t.length-a)-1],e=-1;++e<r;)o=t[e],Lr(o,s,u)?(Lr(i,s,u)||n.push(Tr(i,o,s,u)),n.push(o)):Lr(i,s,u)&&n.push(Tr(i,o,s,u)),i=o;a&&n.push(n[0]),s=u}return n};var $c,Bc,Wc,Jc,Gc,Kc=[],Qc=[];Or.prototype.prepare=function(){for(var n,t=this.edges,e=t.length;e--;)n=t[e].edge,n.b&&n.a||t.splice(e,1);return t.sort(Ir),t.length},Qr.prototype={start:function(){return this.edge.l===this.site?this.edge.a:this.edge.b},end:function(){return this.edge.l===this.site?this.edge.b:this.edge.a}},nu.prototype={insert:function(n,t){var e,r,u;if(n){if(t.P=n,t.N=n.N,n.N&&(n.N.P=t),n.N=t,n.R){for(n=n.R;n.L;)n=n.L;n.L=t}else n.R=t;e=n}else this._?(n=uu(this._),t.P=null,t.N=n,n.P=n.L=t,e=n):(t.P=t.N=null,this._=t,e=null);for(t.L=t.R=null,t.U=e,t.C=!0,n=t;e&&e.C;)r=e.U,e===r.L?(u=r.R,u&&u.C?(e.C=u.C=!1,r.C=!0,n=r):(n===e.R&&(eu(this,e),n=e,e=n.U),e.C=!1,r.C=!0,ru(this,r))):(u=r.L,u&&u.C?(e.C=u.C=!1,r.C=!0,n=r):(n===e.L&&(ru(this,e),n=e,e=n.U),e.C=!1,r.C=!0,eu(this,r))),e=n.U;this._.C=!1},remove:function(n){n.N&&(n.N.P=n.P),n.P&&(n.P.N=n.N),n.N=n.P=null;var t,e,r,u=n.U,i=n.L,o=n.R;if(e=i?o?uu(o):i:o,u?u.L===n?u.L=e:u.R=e:this._=e,i&&o?(r=e.C,e.C=n.C,e.L=i,i.U=e,e!==o?(u=e.U,e.U=n.U,n=e.R,u.L=n,e.R=o,o.U=e):(e.U=u,u=e,n=e.R)):(r=n.C,n=e),n&&(n.U=u),!r){if(n&&n.C)return n.C=!1,void 0;do{if(n===this._)break;if(n===u.L){if(t=u.R,t.C&&(t.C=!1,u.C=!0,eu(this,u),t=u.R),t.L&&t.L.C||t.R&&t.R.C){t.R&&t.R.C||(t.L.C=!1,t.C=!0,ru(this,t),t=u.R),t.C=u.C,u.C=t.R.C=!1,eu(this,u),n=this._;break}}else if(t=u.L,t.C&&(t.C=!1,u.C=!0,ru(this,u),t=u.L),t.L&&t.L.C||t.R&&t.R.C){t.L&&t.L.C||(t.R.C=!1,t.C=!0,eu(this,t),t=u.L),t.C=u.C,u.C=t.L.C=!1,ru(this,u),n=this._;break}t.C=!0,n=u,u=u.U}while(!n.C);n&&(n.C=!1)}}},Bo.geom.voronoi=function(n){function t(n){var t=new Array(n.length),r=a[0][0],u=a[0][1],i=a[1][0],o=a[1][1];return iu(e(n),a).cells.forEach(function(e,a){var c=e.edges,l=e.site,s=t[a]=c.length?c.map(function(n){var t=n.start();return[t.x,t.y]}):l.x>=r&&l.x<=i&&l.y>=u&&l.y<=o?[[r,o],[i,o],[i,u],[r,u]]:[];s.point=n[a]}),t}function e(n){return n.map(function(n,t){return{x:Math.round(i(n,t)/Na)*Na,y:Math.round(o(n,t)/Na)*Na,i:t}})}var r=Ar,u=Cr,i=r,o=u,a=nl;return n?t(n):(t.links=function(n){return iu(e(n)).edges.filter(function(n){return n.l&&n.r}).map(function(t){return{source:n[t.l.i],target:n[t.r.i]}})},t.triangles=function(n){var t=[];return iu(e(n)).cells.forEach(function(e,r){for(var u,i,o=e.site,a=e.edges.sort(Ir),c=-1,l=a.length,s=a[l-1].edge,f=s.l===o?s.r:s.l;++c<l;)u=s,i=f,s=a[c].edge,f=s.l===o?s.r:s.l,r<i.i&&r<f.i&&au(o,i,f)<0&&t.push([n[r],n[i.i],n[f.i]])}),t},t.x=function(n){return arguments.length?(i=kt(r=n),t):r},t.y=function(n){return arguments.length?(o=kt(u=n),t):u},t.clipExtent=function(n){return arguments.length?(a=null==n?nl:n,t):a===nl?null:a},t.size=function(n){return arguments.length?t.clipExtent(n&&[[0,0],n]):a===nl?null:a&&a[1]},t)};var nl=[[-1e6,-1e6],[1e6,1e6]];Bo.geom.delaunay=function(n){return Bo.geom.voronoi().triangles(n)},Bo.geom.quadtree=function(n,t,e,r,u){function i(n){function i(n,t,e,r,u,i,o,a){if(!isNaN(e)&&!isNaN(r))if(n.leaf){var c=n.x,s=n.y;if(null!=c)if(ca(c-e)+ca(s-r)<.01)l(n,t,e,r,u,i,o,a);else{var f=n.point;n.x=n.y=n.point=null,l(n,f,c,s,u,i,o,a),l(n,t,e,r,u,i,o,a)}else n.x=e,n.y=r,n.point=t}else l(n,t,e,r,u,i,o,a)}function l(n,t,e,r,u,o,a,c){var l=.5*(u+a),s=.5*(o+c),f=e>=l,h=r>=s,g=(h<<1)+f;n.leaf=!1,n=n.nodes[g]||(n.nodes[g]=su()),f?u=l:a=l,h?o=s:c=s,i(n,t,e,r,u,o,a,c)}var s,f,h,g,p,v,d,m,y,x=kt(a),M=kt(c);if(null!=t)v=t,d=e,m=r,y=u;else if(m=y=-(v=d=1/0),f=[],h=[],p=n.length,o)for(g=0;p>g;++g)s=n[g],s.x<v&&(v=s.x),s.y<d&&(d=s.y),s.x>m&&(m=s.x),s.y>y&&(y=s.y),f.push(s.x),h.push(s.y);else for(g=0;p>g;++g){var _=+x(s=n[g],g),b=+M(s,g);v>_&&(v=_),d>b&&(d=b),_>m&&(m=_),b>y&&(y=b),f.push(_),h.push(b)}var w=m-v,S=y-d;w>S?y=d+w:m=v+S;var k=su();if(k.add=function(n){i(k,n,+x(n,++g),+M(n,g),v,d,m,y)},k.visit=function(n){fu(n,k,v,d,m,y)},g=-1,null==t){for(;++g<p;)i(k,n[g],f[g],h[g],v,d,m,y);--g}else n.forEach(k.add);return f=h=n=s=null,k}var o,a=Ar,c=Cr;return(o=arguments.length)?(a=cu,c=lu,3===o&&(u=e,r=t,e=t=0),i(n)):(i.x=function(n){return arguments.length?(a=n,i):a},i.y=function(n){return arguments.length?(c=n,i):c},i.extent=function(n){return arguments.length?(null==n?t=e=r=u=null:(t=+n[0][0],e=+n[0][1],r=+n[1][0],u=+n[1][1]),i):null==t?null:[[t,e],[r,u]]},i.size=function(n){return arguments.length?(null==n?t=e=r=u=null:(t=e=0,r=+n[0],u=+n[1]),i):null==t?null:[r-t,u-e]},i)},Bo.interpolateRgb=hu,Bo.interpolateObject=gu,Bo.interpolateNumber=pu,Bo.interpolateString=vu;var tl=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,el=new RegExp(tl.source,"g");Bo.interpolate=du,Bo.interpolators=[function(n,t){var e=typeof t;return("string"===e?$a.has(t)||/^(#|rgb\(|hsl\()/.test(t)?hu:vu:t instanceof it?hu:Array.isArray(t)?mu:"object"===e&&isNaN(t)?gu:pu)(n,t)}],Bo.interpolateArray=mu;var rl=function(){return Et},ul=Bo.map({linear:rl,poly:Su,quad:function(){return _u},cubic:function(){return bu},sin:function(){return ku},exp:function(){return Eu},circle:function(){return Au},elastic:Cu,back:Nu,bounce:function(){return zu}}),il=Bo.map({"in":Et,out:xu,"in-out":Mu,"out-in":function(n){return Mu(xu(n))}});Bo.ease=function(n){var t=n.indexOf("-"),e=t>=0?n.slice(0,t):n,r=t>=0?n.slice(t+1):"in";return e=ul.get(e)||rl,r=il.get(r)||Et,yu(r(e.apply(null,Wo.call(arguments,1))))},Bo.interpolateHcl=Lu,Bo.interpolateHsl=Tu,Bo.interpolateLab=qu,Bo.interpolateRound=Ru,Bo.transform=function(n){var t=Go.createElementNS(Bo.ns.prefix.svg,"g");return(Bo.transform=function(n){if(null!=n){t.setAttribute("transform",n);var e=t.transform.baseVal.consolidate()}return new Du(e?e.matrix:ol)})(n)},Du.prototype.toString=function(){return"translate("+this.translate+")rotate("+this.rotate+")skewX("+this.skew+")scale("+this.scale+")"};var ol={a:1,b:0,c:0,d:1,e:0,f:0};Bo.interpolateTransform=Fu,Bo.layout={},Bo.layout.bundle=function(){return function(n){for(var t=[],e=-1,r=n.length;++e<r;)t.push(Yu(n[e]));return t}},Bo.layout.chord=function(){function n(){var n,l,f,h,g,p={},v=[],d=Bo.range(i),m=[];for(e=[],r=[],n=0,h=-1;++h<i;){for(l=0,g=-1;++g<i;)l+=u[h][g];v.push(l),m.push(Bo.range(i)),n+=l}for(o&&d.sort(function(n,t){return o(v[n],v[t])}),a&&m.forEach(function(n,t){n.sort(function(n,e){return a(u[t][n],u[t][e])})}),n=(Aa-s*i)/n,l=0,h=-1;++h<i;){for(f=l,g=-1;++g<i;){var y=d[h],x=m[y][g],M=u[y][x],_=l,b=l+=M*n;p[y+"-"+x]={index:y,subindex:x,startAngle:_,endAngle:b,value:M}}r[y]={index:y,startAngle:f,endAngle:l,value:(l-f)/n},l+=s}for(h=-1;++h<i;)for(g=h-1;++g<i;){var w=p[h+"-"+g],S=p[g+"-"+h];(w.value||S.value)&&e.push(w.value<S.value?{source:S,target:w}:{source:w,target:S})}c&&t()}function t(){e.sort(function(n,t){return c((n.source.value+n.target.value)/2,(t.source.value+t.target.value)/2)})}var e,r,u,i,o,a,c,l={},s=0;return l.matrix=function(n){return arguments.length?(i=(u=n)&&u.length,e=r=null,l):u},l.padding=function(n){return arguments.length?(s=n,e=r=null,l):s},l.sortGroups=function(n){return arguments.length?(o=n,e=r=null,l):o},l.sortSubgroups=function(n){return arguments.length?(a=n,e=null,l):a},l.sortChords=function(n){return arguments.length?(c=n,e&&t(),l):c},l.chords=function(){return e||n(),e},l.groups=function(){return r||n(),r},l},Bo.layout.force=function(){function n(n){return function(t,e,r,u){if(t.point!==n){var i=t.cx-n.x,o=t.cy-n.y,a=u-e,c=i*i+o*o;if(c>a*a/d){if(p>c){var l=t.charge/c;n.px-=i*l,n.py-=o*l}return!0}if(t.point&&c&&p>c){var l=t.pointCharge/c;n.px-=i*l,n.py-=o*l}}return!t.charge}}function t(n){n.px=Bo.event.x,n.py=Bo.event.y,a.resume()}var e,r,u,i,o,a={},c=Bo.dispatch("start","tick","end"),l=[1,1],s=.9,f=al,h=cl,g=-30,p=ll,v=.1,d=.64,m=[],y=[];return a.tick=function(){if((r*=.99)<.005)return c.end({type:"end",alpha:r=0}),!0;var t,e,a,f,h,p,d,x,M,_=m.length,b=y.length;for(e=0;b>e;++e)a=y[e],f=a.source,h=a.target,x=h.x-f.x,M=h.y-f.y,(p=x*x+M*M)&&(p=r*i[e]*((p=Math.sqrt(p))-u[e])/p,x*=p,M*=p,h.x-=x*(d=f.weight/(h.weight+f.weight)),h.y-=M*d,f.x+=x*(d=1-d),f.y+=M*d);if((d=r*v)&&(x=l[0]/2,M=l[1]/2,e=-1,d))for(;++e<_;)a=m[e],a.x+=(x-a.x)*d,a.y+=(M-a.y)*d;if(g)for(Wu(t=Bo.geom.quadtree(m),r,o),e=-1;++e<_;)(a=m[e]).fixed||t.visit(n(a));for(e=-1;++e<_;)a=m[e],a.fixed?(a.x=a.px,a.y=a.py):(a.x-=(a.px-(a.px=a.x))*s,a.y-=(a.py-(a.py=a.y))*s);c.tick({type:"tick",alpha:r})},a.nodes=function(n){return arguments.length?(m=n,a):m},a.links=function(n){return arguments.length?(y=n,a):y},a.size=function(n){return arguments.length?(l=n,a):l},a.linkDistance=function(n){return arguments.length?(f="function"==typeof n?n:+n,a):f},a.distance=a.linkDistance,a.linkStrength=function(n){return arguments.length?(h="function"==typeof n?n:+n,a):h},a.friction=function(n){return arguments.length?(s=+n,a):s},a.charge=function(n){return arguments.length?(g="function"==typeof n?n:+n,a):g},a.chargeDistance=function(n){return arguments.length?(p=n*n,a):Math.sqrt(p)},a.gravity=function(n){return arguments.length?(v=+n,a):v},a.theta=function(n){return arguments.length?(d=n*n,a):Math.sqrt(d)},a.alpha=function(n){return arguments.length?(n=+n,r?r=n>0?n:0:n>0&&(c.start({type:"start",alpha:r=n}),Bo.timer(a.tick)),a):r},a.start=function(){function n(n,r){if(!e){for(e=new Array(c),a=0;c>a;++a)e[a]=[];for(a=0;l>a;++a){var u=y[a];e[u.source.index].push(u.target),e[u.target.index].push(u.source)}}for(var i,o=e[t],a=-1,l=o.length;++a<l;)if(!isNaN(i=o[a][n]))return i;return Math.random()*r}var t,e,r,c=m.length,s=y.length,p=l[0],v=l[1];for(t=0;c>t;++t)(r=m[t]).index=t,r.weight=0;for(t=0;s>t;++t)r=y[t],"number"==typeof r.source&&(r.source=m[r.source]),"number"==typeof r.target&&(r.target=m[r.target]),++r.source.weight,++r.target.weight;for(t=0;c>t;++t)r=m[t],isNaN(r.x)&&(r.x=n("x",p)),isNaN(r.y)&&(r.y=n("y",v)),isNaN(r.px)&&(r.px=r.x),isNaN(r.py)&&(r.py=r.y);if(u=[],"function"==typeof f)for(t=0;s>t;++t)u[t]=+f.call(this,y[t],t);else for(t=0;s>t;++t)u[t]=f;if(i=[],"function"==typeof h)for(t=0;s>t;++t)i[t]=+h.call(this,y[t],t);else for(t=0;s>t;++t)i[t]=h;if(o=[],"function"==typeof g)for(t=0;c>t;++t)o[t]=+g.call(this,m[t],t);else for(t=0;c>t;++t)o[t]=g;return a.resume()},a.resume=function(){return a.alpha(.1)},a.stop=function(){return a.alpha(0)},a.drag=function(){return e||(e=Bo.behavior.drag().origin(Et).on("dragstart.force",Vu).on("drag.force",t).on("dragend.force",Xu)),arguments.length?(this.on("mouseover.force",$u).on("mouseout.force",Bu).call(e),void 0):e},Bo.rebind(a,c,"on")};var al=20,cl=1,ll=1/0;Bo.layout.hierarchy=function(){function n(u){var i,o=[u],a=[];for(u.depth=0;null!=(i=o.pop());)if(a.push(i),(l=e.call(n,i,i.depth))&&(c=l.length)){for(var c,l,s;--c>=0;)o.push(s=l[c]),s.parent=i,s.depth=i.depth+1;r&&(i.value=0),i.children=l}else r&&(i.value=+r.call(n,i,i.depth)||0),delete i.children;return Ku(u,function(n){var e,u;t&&(e=n.children)&&e.sort(t),r&&(u=n.parent)&&(u.value+=n.value)}),a}var t=ti,e=Qu,r=ni;return n.sort=function(e){return arguments.length?(t=e,n):t},n.children=function(t){return arguments.length?(e=t,n):e},n.value=function(t){return arguments.length?(r=t,n):r},n.revalue=function(t){return r&&(Gu(t,function(n){n.children&&(n.value=0)}),Ku(t,function(t){var e;t.children||(t.value=+r.call(n,t,t.depth)||0),(e=t.parent)&&(e.value+=t.value)})),t},n},Bo.layout.partition=function(){function n(t,e,r,u){var i=t.children;if(t.x=e,t.y=t.depth*u,t.dx=r,t.dy=u,i&&(o=i.length)){var o,a,c,l=-1;for(r=t.value?r/t.value:0;++l<o;)n(a=i[l],e,c=a.value*r,u),e+=c}}function t(n){var e=n.children,r=0;if(e&&(u=e.length))for(var u,i=-1;++i<u;)r=Math.max(r,t(e[i]));return 1+r}function e(e,i){var o=r.call(this,e,i);return n(o[0],0,u[0],u[1]/t(o[0])),o}var r=Bo.layout.hierarchy(),u=[1,1];return e.size=function(n){return arguments.length?(u=n,e):u},Ju(e,r)},Bo.layout.pie=function(){function n(i){var o=i.map(function(e,r){return+t.call(n,e,r)}),a=+("function"==typeof r?r.apply(this,arguments):r),c=(("function"==typeof u?u.apply(this,arguments):u)-a)/Bo.sum(o),l=Bo.range(i.length);null!=e&&l.sort(e===sl?function(n,t){return o[t]-o[n]}:function(n,t){return e(i[n],i[t])});var s=[];return l.forEach(function(n){var t;s[n]={data:i[n],value:t=o[n],startAngle:a,endAngle:a+=t*c}}),s}var t=Number,e=sl,r=0,u=Aa;return n.value=function(e){return arguments.length?(t=e,n):t},n.sort=function(t){return arguments.length?(e=t,n):e},n.startAngle=function(t){return arguments.length?(r=t,n):r},n.endAngle=function(t){return arguments.length?(u=t,n):u},n};var sl={};Bo.layout.stack=function(){function n(a,c){if(!(h=a.length))return a;var l=a.map(function(e,r){return t.call(n,e,r)}),s=l.map(function(t){return t.map(function(t,e){return[i.call(n,t,e),o.call(n,t,e)]})}),f=e.call(n,s,c);l=Bo.permute(l,f),s=Bo.permute(s,f);var h,g,p,v,d=r.call(n,s,c),m=l[0].length;for(p=0;m>p;++p)for(u.call(n,l[0][p],v=d[p],s[0][p][1]),g=1;h>g;++g)u.call(n,l[g][p],v+=s[g-1][p][1],s[g][p][1]);return a}var t=Et,e=oi,r=ai,u=ii,i=ri,o=ui;return n.values=function(e){return arguments.length?(t=e,n):t},n.order=function(t){return arguments.length?(e="function"==typeof t?t:fl.get(t)||oi,n):e},n.offset=function(t){return arguments.length?(r="function"==typeof t?t:hl.get(t)||ai,n):r},n.x=function(t){return arguments.length?(i=t,n):i},n.y=function(t){return arguments.length?(o=t,n):o},n.out=function(t){return arguments.length?(u=t,n):u},n};var fl=Bo.map({"inside-out":function(n){var t,e,r=n.length,u=n.map(ci),i=n.map(li),o=Bo.range(r).sort(function(n,t){return u[n]-u[t]}),a=0,c=0,l=[],s=[];for(t=0;r>t;++t)e=o[t],c>a?(a+=i[e],l.push(e)):(c+=i[e],s.push(e));return s.reverse().concat(l)},reverse:function(n){return Bo.range(n.length).reverse()},"default":oi}),hl=Bo.map({silhouette:function(n){var t,e,r,u=n.length,i=n[0].length,o=[],a=0,c=[];for(e=0;i>e;++e){for(t=0,r=0;u>t;t++)r+=n[t][e][1];r>a&&(a=r),o.push(r)}for(e=0;i>e;++e)c[e]=(a-o[e])/2;return c},wiggle:function(n){var t,e,r,u,i,o,a,c,l,s=n.length,f=n[0],h=f.length,g=[];for(g[0]=c=l=0,e=1;h>e;++e){for(t=0,u=0;s>t;++t)u+=n[t][e][1];for(t=0,i=0,a=f[e][0]-f[e-1][0];s>t;++t){for(r=0,o=(n[t][e][1]-n[t][e-1][1])/(2*a);t>r;++r)o+=(n[r][e][1]-n[r][e-1][1])/a;i+=o*n[t][e][1]}g[e]=c-=u?i/u*a:0,l>c&&(l=c)}for(e=0;h>e;++e)g[e]-=l;return g},expand:function(n){var t,e,r,u=n.length,i=n[0].length,o=1/u,a=[];for(e=0;i>e;++e){for(t=0,r=0;u>t;t++)r+=n[t][e][1];if(r)for(t=0;u>t;t++)n[t][e][1]/=r;else for(t=0;u>t;t++)n[t][e][1]=o}for(e=0;i>e;++e)a[e]=0;return a},zero:ai});Bo.layout.histogram=function(){function n(n,i){for(var o,a,c=[],l=n.map(e,this),s=r.call(this,l,i),f=u.call(this,s,l,i),i=-1,h=l.length,g=f.length-1,p=t?1:1/h;++i<g;)o=c[i]=[],o.dx=f[i+1]-(o.x=f[i]),o.y=0;if(g>0)for(i=-1;++i<h;)a=l[i],a>=s[0]&&a<=s[1]&&(o=c[Bo.bisect(f,a,1,g)-1],o.y+=p,o.push(n[i]));return c}var t=!0,e=Number,r=gi,u=fi;return n.value=function(t){return arguments.length?(e=t,n):e},n.range=function(t){return arguments.length?(r=kt(t),n):r},n.bins=function(t){return arguments.length?(u="number"==typeof t?function(n){return hi(n,t)}:kt(t),n):u},n.frequency=function(e){return arguments.length?(t=!!e,n):t},n},Bo.layout.pack=function(){function n(n,i){var o=e.call(this,n,i),a=o[0],c=u[0],l=u[1],s=null==t?Math.sqrt:"function"==typeof t?t:function(){return t};if(a.x=a.y=0,Ku(a,function(n){n.r=+s(n.value)}),Ku(a,yi),r){var f=r*(t?1:Math.max(2*a.r/c,2*a.r/l))/2;Ku(a,function(n){n.r+=f}),Ku(a,yi),Ku(a,function(n){n.r-=f})}return _i(a,c/2,l/2,t?1:1/Math.max(2*a.r/c,2*a.r/l)),o}var t,e=Bo.layout.hierarchy().sort(pi),r=0,u=[1,1];return n.size=function(t){return arguments.length?(u=t,n):u},n.radius=function(e){return arguments.length?(t=null==e||"function"==typeof e?e:+e,n):t},n.padding=function(t){return arguments.length?(r=+t,n):r},Ju(n,e)},Bo.layout.tree=function(){function n(n,u){var s=o.call(this,n,u),f=s[0],h=t(f);if(Ku(h,e),h.parent.m=-h.z,Gu(h,r),l)Gu(f,i);else{var g=f,p=f,v=f;Gu(f,function(n){n.x<g.x&&(g=n),n.x>p.x&&(p=n),n.depth>v.depth&&(v=n)});var d=a(g,p)/2-g.x,m=c[0]/(p.x+a(p,g)/2+d),y=c[1]/(v.depth||1);Gu(f,function(n){n.x=(n.x+d)*m,n.y=n.depth*y})}return s}function t(n){for(var t,e={A:null,children:[n]},r=[e];null!=(t=r.pop());)for(var u,i=t.children,o=0,a=i.length;a>o;++o)r.push((i[o]=u={_:i[o],parent:t,children:(u=i[o].children)&&u.slice()||[],A:null,a:null,z:0,m:0,c:0,s:0,t:null,i:o}).a=u);return e.children[0]}function e(n){var t=n.children,e=n.parent.children,r=n.i?e[n.i-1]:null;if(t.length){Ai(n);var i=(t[0].z+t[t.length-1].z)/2;r?(n.z=r.z+a(n._,r._),n.m=n.z-i):n.z=i}else r&&(n.z=r.z+a(n._,r._));n.parent.A=u(n,r,n.parent.A||e[0])}function r(n){n._.x=n.z+n.parent.m,n.m+=n.parent.m}function u(n,t,e){if(t){for(var r,u=n,i=n,o=t,c=u.parent.children[0],l=u.m,s=i.m,f=o.m,h=c.m;o=ki(o),u=Si(u),o&&u;)c=Si(c),i=ki(i),i.a=n,r=o.z+f-u.z-l+a(o._,u._),r>0&&(Ei(Ci(o,n,e),n,r),l+=r,s+=r),f+=o.m,l+=u.m,h+=c.m,s+=i.m;o&&!ki(i)&&(i.t=o,i.m+=f-s),u&&!Si(c)&&(c.t=u,c.m+=l-h,e=n)}return e}function i(n){n.x*=c[0],n.y=n.depth*c[1]}var o=Bo.layout.hierarchy().sort(null).value(null),a=wi,c=[1,1],l=null;return n.separation=function(t){return arguments.length?(a=t,n):a},n.size=function(t){return arguments.length?(l=null==(c=t)?i:null,n):l?null:c},n.nodeSize=function(t){return arguments.length?(l=null==(c=t)?null:i,n):l?c:null},Ju(n,o)},Bo.layout.cluster=function(){function n(n,i){var o,a=t.call(this,n,i),c=a[0],l=0;Ku(c,function(n){var t=n.children;t&&t.length?(n.x=zi(t),n.y=Ni(t)):(n.x=o?l+=e(n,o):0,n.y=0,o=n)});var s=Li(c),f=Ti(c),h=s.x-e(s,f)/2,g=f.x+e(f,s)/2;return Ku(c,u?function(n){n.x=(n.x-c.x)*r[0],n.y=(c.y-n.y)*r[1]}:function(n){n.x=(n.x-h)/(g-h)*r[0],n.y=(1-(c.y?n.y/c.y:1))*r[1]}),a}var t=Bo.layout.hierarchy().sort(null).value(null),e=wi,r=[1,1],u=!1;return n.separation=function(t){return arguments.length?(e=t,n):e},n.size=function(t){return arguments.length?(u=null==(r=t),n):u?null:r},n.nodeSize=function(t){return arguments.length?(u=null!=(r=t),n):u?r:null},Ju(n,t)},Bo.layout.treemap=function(){function n(n,t){for(var e,r,u=-1,i=n.length;++u<i;)r=(e=n[u]).value*(0>t?0:t),e.area=isNaN(r)||0>=r?0:r}function t(e){var i=e.children;if(i&&i.length){var o,a,c,l=f(e),s=[],h=i.slice(),p=1/0,v="slice"===g?l.dx:"dice"===g?l.dy:"slice-dice"===g?1&e.depth?l.dy:l.dx:Math.min(l.dx,l.dy);for(n(h,l.dx*l.dy/e.value),s.area=0;(c=h.length)>0;)s.push(o=h[c-1]),s.area+=o.area,"squarify"!==g||(a=r(s,v))<=p?(h.pop(),p=a):(s.area-=s.pop().area,u(s,v,l,!1),v=Math.min(l.dx,l.dy),s.length=s.area=0,p=1/0);s.length&&(u(s,v,l,!0),s.length=s.area=0),i.forEach(t)}}function e(t){var r=t.children;if(r&&r.length){var i,o=f(t),a=r.slice(),c=[];for(n(a,o.dx*o.dy/t.value),c.area=0;i=a.pop();)c.push(i),c.area+=i.area,null!=i.z&&(u(c,i.z?o.dx:o.dy,o,!a.length),c.length=c.area=0);r.forEach(e)}}function r(n,t){for(var e,r=n.area,u=0,i=1/0,o=-1,a=n.length;++o<a;)(e=n[o].area)&&(i>e&&(i=e),e>u&&(u=e));return r*=r,t*=t,r?Math.max(t*u*p/r,r/(t*i*p)):1/0}function u(n,t,e,r){var u,i=-1,o=n.length,a=e.x,l=e.y,s=t?c(n.area/t):0;if(t==e.dx){for((r||s>e.dy)&&(s=e.dy);++i<o;)u=n[i],u.x=a,u.y=l,u.dy=s,a+=u.dx=Math.min(e.x+e.dx-a,s?c(u.area/s):0);u.z=!0,u.dx+=e.x+e.dx-a,e.y+=s,e.dy-=s}else{for((r||s>e.dx)&&(s=e.dx);++i<o;)u=n[i],u.x=a,u.y=l,u.dx=s,l+=u.dy=Math.min(e.y+e.dy-l,s?c(u.area/s):0);u.z=!1,u.dy+=e.y+e.dy-l,e.x+=s,e.dx-=s}}function i(r){var u=o||a(r),i=u[0];return i.x=0,i.y=0,i.dx=l[0],i.dy=l[1],o&&a.revalue(i),n([i],i.dx*i.dy/i.value),(o?e:t)(i),h&&(o=u),u}var o,a=Bo.layout.hierarchy(),c=Math.round,l=[1,1],s=null,f=qi,h=!1,g="squarify",p=.5*(1+Math.sqrt(5));return i.size=function(n){return arguments.length?(l=n,i):l},i.padding=function(n){function t(t){var e=n.call(i,t,t.depth);return null==e?qi(t):Ri(t,"number"==typeof e?[e,e,e,e]:e)}function e(t){return Ri(t,n)}if(!arguments.length)return s;var r;return f=null==(s=n)?qi:"function"==(r=typeof n)?t:"number"===r?(n=[n,n,n,n],e):e,i},i.round=function(n){return arguments.length?(c=n?Math.round:Number,i):c!=Number},i.sticky=function(n){return arguments.length?(h=n,o=null,i):h},i.ratio=function(n){return arguments.length?(p=n,i):p},i.mode=function(n){return arguments.length?(g=n+"",i):g},Ju(i,a)},Bo.random={normal:function(n,t){var e=arguments.length;return 2>e&&(t=1),1>e&&(n=0),function(){var e,r,u;do e=2*Math.random()-1,r=2*Math.random()-1,u=e*e+r*r;while(!u||u>1);return n+t*e*Math.sqrt(-2*Math.log(u)/u)}},logNormal:function(){var n=Bo.random.normal.apply(Bo,arguments);return function(){return Math.exp(n())}},bates:function(n){var t=Bo.random.irwinHall(n);return function(){return t()/n}},irwinHall:function(n){return function(){for(var t=0,e=0;n>e;e++)t+=Math.random();return t}}},Bo.scale={};var gl={floor:Et,ceil:Et};Bo.scale.linear=function(){return Oi([0,1],[0,1],du,!1)};var pl={s:1,g:1,p:1,r:1,e:1};Bo.scale.log=function(){return Wi(Bo.scale.linear().domain([0,1]),10,!0,[1,10])};var vl=Bo.format(".0e"),dl={floor:function(n){return-Math.ceil(-n)},ceil:function(n){return-Math.floor(-n)}};Bo.scale.pow=function(){return Ji(Bo.scale.linear(),1,[0,1])},Bo.scale.sqrt=function(){return Bo.scale.pow().exponent(.5)},Bo.scale.ordinal=function(){return Ki([],{t:"range",a:[[]]})},Bo.scale.category10=function(){return Bo.scale.ordinal().range(ml)},Bo.scale.category20=function(){return Bo.scale.ordinal().range(yl)},Bo.scale.category20b=function(){return Bo.scale.ordinal().range(xl)},Bo.scale.category20c=function(){return Bo.scale.ordinal().range(Ml)};var ml=[2062260,16744206,2924588,14034728,9725885,9197131,14907330,8355711,12369186,1556175].map(yt),yl=[2062260,11454440,16744206,16759672,2924588,10018698,14034728,16750742,9725885,12955861,9197131,12885140,14907330,16234194,8355711,13092807,12369186,14408589,1556175,10410725].map(yt),xl=[3750777,5395619,7040719,10264286,6519097,9216594,11915115,13556636,9202993,12426809,15186514,15190932,8666169,11356490,14049643,15177372,8077683,10834324,13528509,14589654].map(yt),Ml=[3244733,7057110,10406625,13032431,15095053,16616764,16625259,16634018,3253076,7652470,10607003,13101504,7695281,10394312,12369372,14342891,6513507,9868950,12434877,14277081].map(yt);Bo.scale.quantile=function(){return Qi([],[])
},Bo.scale.quantize=function(){return no(0,1,[0,1])},Bo.scale.threshold=function(){return to([.5],[0,1])},Bo.scale.identity=function(){return eo([0,1])},Bo.svg={},Bo.svg.arc=function(){function n(){var n=t.apply(this,arguments),i=e.apply(this,arguments),o=r.apply(this,arguments)+_l,a=u.apply(this,arguments)+_l,c=(o>a&&(c=o,o=a,a=c),a-o),l=Ea>c?"0":"1",s=Math.cos(o),f=Math.sin(o),h=Math.cos(a),g=Math.sin(a);return c>=bl?n?"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"M0,"+n+"A"+n+","+n+" 0 1,0 0,"+-n+"A"+n+","+n+" 0 1,0 0,"+n+"Z":"M0,"+i+"A"+i+","+i+" 0 1,1 0,"+-i+"A"+i+","+i+" 0 1,1 0,"+i+"Z":n?"M"+i*s+","+i*f+"A"+i+","+i+" 0 "+l+",1 "+i*h+","+i*g+"L"+n*h+","+n*g+"A"+n+","+n+" 0 "+l+",0 "+n*s+","+n*f+"Z":"M"+i*s+","+i*f+"A"+i+","+i+" 0 "+l+",1 "+i*h+","+i*g+"L0,0"+"Z"}var t=ro,e=uo,r=io,u=oo;return n.innerRadius=function(e){return arguments.length?(t=kt(e),n):t},n.outerRadius=function(t){return arguments.length?(e=kt(t),n):e},n.startAngle=function(t){return arguments.length?(r=kt(t),n):r},n.endAngle=function(t){return arguments.length?(u=kt(t),n):u},n.centroid=function(){var n=(t.apply(this,arguments)+e.apply(this,arguments))/2,i=(r.apply(this,arguments)+u.apply(this,arguments))/2+_l;return[Math.cos(i)*n,Math.sin(i)*n]},n};var _l=-Ca,bl=Aa-Na;Bo.svg.line=function(){return ao(Et)};var wl=Bo.map({linear:co,"linear-closed":lo,step:so,"step-before":fo,"step-after":ho,basis:xo,"basis-open":Mo,"basis-closed":_o,bundle:bo,cardinal:vo,"cardinal-open":go,"cardinal-closed":po,monotone:Co});wl.forEach(function(n,t){t.key=n,t.closed=/-closed$/.test(n)});var Sl=[0,2/3,1/3,0],kl=[0,1/3,2/3,0],El=[0,1/6,2/3,1/6];Bo.svg.line.radial=function(){var n=ao(No);return n.radius=n.x,delete n.x,n.angle=n.y,delete n.y,n},fo.reverse=ho,ho.reverse=fo,Bo.svg.area=function(){return zo(Et)},Bo.svg.area.radial=function(){var n=zo(No);return n.radius=n.x,delete n.x,n.innerRadius=n.x0,delete n.x0,n.outerRadius=n.x1,delete n.x1,n.angle=n.y,delete n.y,n.startAngle=n.y0,delete n.y0,n.endAngle=n.y1,delete n.y1,n},Bo.svg.chord=function(){function n(n,a){var c=t(this,i,n,a),l=t(this,o,n,a);return"M"+c.p0+r(c.r,c.p1,c.a1-c.a0)+(e(c,l)?u(c.r,c.p1,c.r,c.p0):u(c.r,c.p1,l.r,l.p0)+r(l.r,l.p1,l.a1-l.a0)+u(l.r,l.p1,c.r,c.p0))+"Z"}function t(n,t,e,r){var u=t.call(n,e,r),i=a.call(n,u,r),o=c.call(n,u,r)+_l,s=l.call(n,u,r)+_l;return{r:i,a0:o,a1:s,p0:[i*Math.cos(o),i*Math.sin(o)],p1:[i*Math.cos(s),i*Math.sin(s)]}}function e(n,t){return n.a0==t.a0&&n.a1==t.a1}function r(n,t,e){return"A"+n+","+n+" 0 "+ +(e>Ea)+",1 "+t}function u(n,t,e,r){return"Q 0,0 "+r}var i=mr,o=yr,a=Lo,c=io,l=oo;return n.radius=function(t){return arguments.length?(a=kt(t),n):a},n.source=function(t){return arguments.length?(i=kt(t),n):i},n.target=function(t){return arguments.length?(o=kt(t),n):o},n.startAngle=function(t){return arguments.length?(c=kt(t),n):c},n.endAngle=function(t){return arguments.length?(l=kt(t),n):l},n},Bo.svg.diagonal=function(){function n(n,u){var i=t.call(this,n,u),o=e.call(this,n,u),a=(i.y+o.y)/2,c=[i,{x:i.x,y:a},{x:o.x,y:a},o];return c=c.map(r),"M"+c[0]+"C"+c[1]+" "+c[2]+" "+c[3]}var t=mr,e=yr,r=To;return n.source=function(e){return arguments.length?(t=kt(e),n):t},n.target=function(t){return arguments.length?(e=kt(t),n):e},n.projection=function(t){return arguments.length?(r=t,n):r},n},Bo.svg.diagonal.radial=function(){var n=Bo.svg.diagonal(),t=To,e=n.projection;return n.projection=function(n){return arguments.length?e(qo(t=n)):t},n},Bo.svg.symbol=function(){function n(n,r){return(Al.get(t.call(this,n,r))||Po)(e.call(this,n,r))}var t=Do,e=Ro;return n.type=function(e){return arguments.length?(t=kt(e),n):t},n.size=function(t){return arguments.length?(e=kt(t),n):e},n};var Al=Bo.map({circle:Po,cross:function(n){var t=Math.sqrt(n/5)/2;return"M"+-3*t+","+-t+"H"+-t+"V"+-3*t+"H"+t+"V"+-t+"H"+3*t+"V"+t+"H"+t+"V"+3*t+"H"+-t+"V"+t+"H"+-3*t+"Z"},diamond:function(n){var t=Math.sqrt(n/(2*Ll)),e=t*Ll;return"M0,"+-t+"L"+e+",0"+" 0,"+t+" "+-e+",0"+"Z"},square:function(n){var t=Math.sqrt(n)/2;return"M"+-t+","+-t+"L"+t+","+-t+" "+t+","+t+" "+-t+","+t+"Z"},"triangle-down":function(n){var t=Math.sqrt(n/zl),e=t*zl/2;return"M0,"+e+"L"+t+","+-e+" "+-t+","+-e+"Z"},"triangle-up":function(n){var t=Math.sqrt(n/zl),e=t*zl/2;return"M0,"+-e+"L"+t+","+e+" "+-t+","+e+"Z"}});Bo.svg.symbolTypes=Al.keys();var Cl,Nl,zl=Math.sqrt(3),Ll=Math.tan(30*La),Tl=[],ql=0;Tl.call=ya.call,Tl.empty=ya.empty,Tl.node=ya.node,Tl.size=ya.size,Bo.transition=function(n){return arguments.length?Cl?n.transition():n:_a.transition()},Bo.transition.prototype=Tl,Tl.select=function(n){var t,e,r,u=this.id,i=[];n=k(n);for(var o=-1,a=this.length;++o<a;){i.push(t=[]);for(var c=this[o],l=-1,s=c.length;++l<s;)(r=c[l])&&(e=n.call(r,r.__data__,l,o))?("__data__"in r&&(e.__data__=r.__data__),Ho(e,l,u,r.__transition__[u]),t.push(e)):t.push(null)}return Uo(i,u)},Tl.selectAll=function(n){var t,e,r,u,i,o=this.id,a=[];n=E(n);for(var c=-1,l=this.length;++c<l;)for(var s=this[c],f=-1,h=s.length;++f<h;)if(r=s[f]){i=r.__transition__[o],e=n.call(r,r.__data__,f,c),a.push(t=[]);for(var g=-1,p=e.length;++g<p;)(u=e[g])&&Ho(u,g,o,i),t.push(u)}return Uo(a,o)},Tl.filter=function(n){var t,e,r,u=[];"function"!=typeof n&&(n=U(n));for(var i=0,o=this.length;o>i;i++){u.push(t=[]);for(var e=this[i],a=0,c=e.length;c>a;a++)(r=e[a])&&n.call(r,r.__data__,a,i)&&t.push(r)}return Uo(u,this.id)},Tl.tween=function(n,t){var e=this.id;return arguments.length<2?this.node().__transition__[e].tween.get(n):F(this,null==t?function(t){t.__transition__[e].tween.remove(n)}:function(r){r.__transition__[e].tween.set(n,t)})},Tl.attr=function(n,t){function e(){this.removeAttribute(a)}function r(){this.removeAttributeNS(a.space,a.local)}function u(n){return null==n?e:(n+="",function(){var t,e=this.getAttribute(a);return e!==n&&(t=o(e,n),function(n){this.setAttribute(a,t(n))})})}function i(n){return null==n?r:(n+="",function(){var t,e=this.getAttributeNS(a.space,a.local);return e!==n&&(t=o(e,n),function(n){this.setAttributeNS(a.space,a.local,t(n))})})}if(arguments.length<2){for(t in n)this.attr(t,n[t]);return this}var o="transform"==n?Fu:du,a=Bo.ns.qualify(n);return jo(this,"attr."+n,t,a.local?i:u)},Tl.attrTween=function(n,t){function e(n,e){var r=t.call(this,n,e,this.getAttribute(u));return r&&function(n){this.setAttribute(u,r(n))}}function r(n,e){var r=t.call(this,n,e,this.getAttributeNS(u.space,u.local));return r&&function(n){this.setAttributeNS(u.space,u.local,r(n))}}var u=Bo.ns.qualify(n);return this.tween("attr."+n,u.local?r:e)},Tl.style=function(n,t,e){function r(){this.style.removeProperty(n)}function u(t){return null==t?r:(t+="",function(){var r,u=Qo.getComputedStyle(this,null).getPropertyValue(n);return u!==t&&(r=du(u,t),function(t){this.style.setProperty(n,r(t),e)})})}var i=arguments.length;if(3>i){if("string"!=typeof n){2>i&&(t="");for(e in n)this.style(e,n[e],t);return this}e=""}return jo(this,"style."+n,t,u)},Tl.styleTween=function(n,t,e){function r(r,u){var i=t.call(this,r,u,Qo.getComputedStyle(this,null).getPropertyValue(n));return i&&function(t){this.style.setProperty(n,i(t),e)}}return arguments.length<3&&(e=""),this.tween("style."+n,r)},Tl.text=function(n){return jo(this,"text",n,Fo)},Tl.remove=function(){return this.each("end.transition",function(){var n;this.__transition__.count<2&&(n=this.parentNode)&&n.removeChild(this)})},Tl.ease=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].ease:("function"!=typeof n&&(n=Bo.ease.apply(Bo,arguments)),F(this,function(e){e.__transition__[t].ease=n}))},Tl.delay=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].delay:F(this,"function"==typeof n?function(e,r,u){e.__transition__[t].delay=+n.call(e,e.__data__,r,u)}:(n=+n,function(e){e.__transition__[t].delay=n}))},Tl.duration=function(n){var t=this.id;return arguments.length<1?this.node().__transition__[t].duration:F(this,"function"==typeof n?function(e,r,u){e.__transition__[t].duration=Math.max(1,n.call(e,e.__data__,r,u))}:(n=Math.max(1,n),function(e){e.__transition__[t].duration=n}))},Tl.each=function(n,t){var e=this.id;if(arguments.length<2){var r=Nl,u=Cl;Cl=e,F(this,function(t,r,u){Nl=t.__transition__[e],n.call(t,t.__data__,r,u)}),Nl=r,Cl=u}else F(this,function(r){var u=r.__transition__[e];(u.event||(u.event=Bo.dispatch("start","end"))).on(n,t)});return this},Tl.transition=function(){for(var n,t,e,r,u=this.id,i=++ql,o=[],a=0,c=this.length;c>a;a++){o.push(n=[]);for(var t=this[a],l=0,s=t.length;s>l;l++)(e=t[l])&&(r=Object.create(e.__transition__[u]),r.delay+=r.duration,Ho(e,l,i,r)),n.push(e)}return Uo(o,i)},Bo.svg.axis=function(){function n(n){n.each(function(){var n,l=Bo.select(this),s=this.__chart__||e,f=this.__chart__=e.copy(),h=null==c?f.ticks?f.ticks.apply(f,a):f.domain():c,g=null==t?f.tickFormat?f.tickFormat.apply(f,a):Et:t,p=l.selectAll(".tick").data(h,f),v=p.enter().insert("g",".domain").attr("class","tick").style("opacity",Na),d=Bo.transition(p.exit()).style("opacity",Na).remove(),m=Bo.transition(p.order()).style("opacity",1),y=Math.max(u,0)+o,x=Pi(f),M=l.selectAll(".domain").data([0]),_=(M.enter().append("path").attr("class","domain"),Bo.transition(M));v.append("line"),v.append("text");var b,w,S,k,E=v.select("line"),A=m.select("line"),C=p.select("text").text(g),N=v.select("text"),z=m.select("text"),L="top"===r||"left"===r?-1:1;if("bottom"===r||"top"===r?(n=Oo,b="x",S="y",w="x2",k="y2",C.attr("dy",0>L?"0em":".71em").style("text-anchor","middle"),_.attr("d","M"+x[0]+","+L*i+"V0H"+x[1]+"V"+L*i)):(n=Yo,b="y",S="x",w="y2",k="x2",C.attr("dy",".32em").style("text-anchor",0>L?"end":"start"),_.attr("d","M"+L*i+","+x[0]+"H0V"+x[1]+"H"+L*i)),E.attr(k,L*u),N.attr(S,L*y),A.attr(w,0).attr(k,L*u),z.attr(b,0).attr(S,L*y),f.rangeBand){var T=f,q=T.rangeBand()/2;s=f=function(n){return T(n)+q}}else s.rangeBand?s=f:d.call(n,f,s);v.call(n,s,f),m.call(n,f,f)})}var t,e=Bo.scale.linear(),r=Rl,u=6,i=6,o=3,a=[10],c=null;return n.scale=function(t){return arguments.length?(e=t,n):e},n.orient=function(t){return arguments.length?(r=t in Dl?t+"":Rl,n):r},n.ticks=function(){return arguments.length?(a=arguments,n):a},n.tickValues=function(t){return arguments.length?(c=t,n):c},n.tickFormat=function(e){return arguments.length?(t=e,n):t},n.tickSize=function(t){var e=arguments.length;return e?(u=+t,i=+arguments[e-1],n):u},n.innerTickSize=function(t){return arguments.length?(u=+t,n):u},n.outerTickSize=function(t){return arguments.length?(i=+t,n):i},n.tickPadding=function(t){return arguments.length?(o=+t,n):o},n.tickSubdivide=function(){return arguments.length&&n},n};var Rl="bottom",Dl={top:1,right:1,bottom:1,left:1};Bo.svg.brush=function(){function n(i){i.each(function(){var i=Bo.select(this).style("pointer-events","all").style("-webkit-tap-highlight-color","rgba(0,0,0,0)").on("mousedown.brush",u).on("touchstart.brush",u),o=i.selectAll(".background").data([0]);o.enter().append("rect").attr("class","background").style("visibility","hidden").style("cursor","crosshair"),i.selectAll(".extent").data([0]).enter().append("rect").attr("class","extent").style("cursor","move");var a=i.selectAll(".resize").data(p,Et);a.exit().remove(),a.enter().append("g").attr("class",function(n){return"resize "+n}).style("cursor",function(n){return Pl[n]}).append("rect").attr("x",function(n){return/[ew]$/.test(n)?-3:null}).attr("y",function(n){return/^[ns]/.test(n)?-3:null}).attr("width",6).attr("height",6).style("visibility","hidden"),a.style("display",n.empty()?"none":null);var s,f=Bo.transition(i),h=Bo.transition(o);c&&(s=Pi(c),h.attr("x",s[0]).attr("width",s[1]-s[0]),e(f)),l&&(s=Pi(l),h.attr("y",s[0]).attr("height",s[1]-s[0]),r(f)),t(f)})}function t(n){n.selectAll(".resize").attr("transform",function(n){return"translate("+s[+/e$/.test(n)]+","+f[+/^s/.test(n)]+")"})}function e(n){n.select(".extent").attr("x",s[0]),n.selectAll(".extent,.n>rect,.s>rect").attr("width",s[1]-s[0])}function r(n){n.select(".extent").attr("y",f[0]),n.selectAll(".extent,.e>rect,.w>rect").attr("height",f[1]-f[0])}function u(){function u(){32==Bo.event.keyCode&&(C||(y=null,z[0]-=s[1],z[1]-=f[1],C=2),_())}function p(){32==Bo.event.keyCode&&2==C&&(z[0]+=s[1],z[1]+=f[1],C=0,_())}function v(){var n=Bo.mouse(M),u=!1;x&&(n[0]+=x[0],n[1]+=x[1]),C||(Bo.event.altKey?(y||(y=[(s[0]+s[1])/2,(f[0]+f[1])/2]),z[0]=s[+(n[0]<y[0])],z[1]=f[+(n[1]<y[1])]):y=null),E&&d(n,c,0)&&(e(S),u=!0),A&&d(n,l,1)&&(r(S),u=!0),u&&(t(S),w({type:"brush",mode:C?"move":"resize"}))}function d(n,t,e){var r,u,a=Pi(t),c=a[0],l=a[1],p=z[e],v=e?f:s,d=v[1]-v[0];return C&&(c-=p,l-=d+p),r=(e?g:h)?Math.max(c,Math.min(l,n[e])):n[e],C?u=(r+=p)+d:(y&&(p=Math.max(c,Math.min(l,2*y[e]-r))),r>p?(u=r,r=p):u=p),v[0]!=r||v[1]!=u?(e?o=null:i=null,v[0]=r,v[1]=u,!0):void 0}function m(){v(),S.style("pointer-events","all").selectAll(".resize").style("display",n.empty()?"none":null),Bo.select("body").style("cursor",null),L.on("mousemove.brush",null).on("mouseup.brush",null).on("touchmove.brush",null).on("touchend.brush",null).on("keydown.brush",null).on("keyup.brush",null),N(),w({type:"brushend"})}var y,x,M=this,b=Bo.select(Bo.event.target),w=a.of(M,arguments),S=Bo.select(M),k=b.datum(),E=!/^(n|s)$/.test(k)&&c,A=!/^(e|w)$/.test(k)&&l,C=b.classed("extent"),N=X(),z=Bo.mouse(M),L=Bo.select(Qo).on("keydown.brush",u).on("keyup.brush",p);if(Bo.event.changedTouches?L.on("touchmove.brush",v).on("touchend.brush",m):L.on("mousemove.brush",v).on("mouseup.brush",m),S.interrupt().selectAll("*").interrupt(),C)z[0]=s[0]-z[0],z[1]=f[0]-z[1];else if(k){var T=+/w$/.test(k),q=+/^n/.test(k);x=[s[1-T]-z[0],f[1-q]-z[1]],z[0]=s[T],z[1]=f[q]}else Bo.event.altKey&&(y=z.slice());S.style("pointer-events","none").selectAll(".resize").style("display",null),Bo.select("body").style("cursor",b.style("cursor")),w({type:"brushstart"}),v()}var i,o,a=w(n,"brushstart","brush","brushend"),c=null,l=null,s=[0,0],f=[0,0],h=!0,g=!0,p=Ul[0];return n.event=function(n){n.each(function(){var n=a.of(this,arguments),t={x:s,y:f,i:i,j:o},e=this.__chart__||t;this.__chart__=t,Cl?Bo.select(this).transition().each("start.brush",function(){i=e.i,o=e.j,s=e.x,f=e.y,n({type:"brushstart"})}).tween("brush:brush",function(){var e=mu(s,t.x),r=mu(f,t.y);return i=o=null,function(u){s=t.x=e(u),f=t.y=r(u),n({type:"brush",mode:"resize"})}}).each("end.brush",function(){i=t.i,o=t.j,n({type:"brush",mode:"resize"}),n({type:"brushend"})}):(n({type:"brushstart"}),n({type:"brush",mode:"resize"}),n({type:"brushend"}))})},n.x=function(t){return arguments.length?(c=t,p=Ul[!c<<1|!l],n):c},n.y=function(t){return arguments.length?(l=t,p=Ul[!c<<1|!l],n):l},n.clamp=function(t){return arguments.length?(c&&l?(h=!!t[0],g=!!t[1]):c?h=!!t:l&&(g=!!t),n):c&&l?[h,g]:c?h:l?g:null},n.extent=function(t){var e,r,u,a,h;return arguments.length?(c&&(e=t[0],r=t[1],l&&(e=e[0],r=r[0]),i=[e,r],c.invert&&(e=c(e),r=c(r)),e>r&&(h=e,e=r,r=h),(e!=s[0]||r!=s[1])&&(s=[e,r])),l&&(u=t[0],a=t[1],c&&(u=u[1],a=a[1]),o=[u,a],l.invert&&(u=l(u),a=l(a)),u>a&&(h=u,u=a,a=h),(u!=f[0]||a!=f[1])&&(f=[u,a])),n):(c&&(i?(e=i[0],r=i[1]):(e=s[0],r=s[1],c.invert&&(e=c.invert(e),r=c.invert(r)),e>r&&(h=e,e=r,r=h))),l&&(o?(u=o[0],a=o[1]):(u=f[0],a=f[1],l.invert&&(u=l.invert(u),a=l.invert(a)),u>a&&(h=u,u=a,a=h))),c&&l?[[e,u],[r,a]]:c?[e,r]:l&&[u,a])},n.clear=function(){return n.empty()||(s=[0,0],f=[0,0],i=o=null),n},n.empty=function(){return!!c&&s[0]==s[1]||!!l&&f[0]==f[1]},Bo.rebind(n,a,"on")};var Pl={n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},Ul=[["n","e","s","w","nw","ne","se","sw"],["e","w"],["n","s"],[]],jl=rc.format=lc.timeFormat,Fl=jl.utc,Hl=Fl("%Y-%m-%dT%H:%M:%S.%LZ");jl.iso=Date.prototype.toISOString&&+new Date("2000-01-01T00:00:00.000Z")?Io:Hl,Io.parse=function(n){var t=new Date(n);return isNaN(t)?null:t},Io.toString=Hl.toString,rc.second=Ft(function(n){return new uc(1e3*Math.floor(n/1e3))},function(n,t){n.setTime(n.getTime()+1e3*Math.floor(t))},function(n){return n.getSeconds()}),rc.seconds=rc.second.range,rc.seconds.utc=rc.second.utc.range,rc.minute=Ft(function(n){return new uc(6e4*Math.floor(n/6e4))},function(n,t){n.setTime(n.getTime()+6e4*Math.floor(t))},function(n){return n.getMinutes()}),rc.minutes=rc.minute.range,rc.minutes.utc=rc.minute.utc.range,rc.hour=Ft(function(n){var t=n.getTimezoneOffset()/60;return new uc(36e5*(Math.floor(n/36e5-t)+t))},function(n,t){n.setTime(n.getTime()+36e5*Math.floor(t))},function(n){return n.getHours()}),rc.hours=rc.hour.range,rc.hours.utc=rc.hour.utc.range,rc.month=Ft(function(n){return n=rc.day(n),n.setDate(1),n},function(n,t){n.setMonth(n.getMonth()+t)},function(n){return n.getMonth()}),rc.months=rc.month.range,rc.months.utc=rc.month.utc.range;var Ol=[1e3,5e3,15e3,3e4,6e4,3e5,9e5,18e5,36e5,108e5,216e5,432e5,864e5,1728e5,6048e5,2592e6,7776e6,31536e6],Yl=[[rc.second,1],[rc.second,5],[rc.second,15],[rc.second,30],[rc.minute,1],[rc.minute,5],[rc.minute,15],[rc.minute,30],[rc.hour,1],[rc.hour,3],[rc.hour,6],[rc.hour,12],[rc.day,1],[rc.day,2],[rc.week,1],[rc.month,1],[rc.month,3],[rc.year,1]],Il=jl.multi([[".%L",function(n){return n.getMilliseconds()}],[":%S",function(n){return n.getSeconds()}],["%I:%M",function(n){return n.getMinutes()}],["%I %p",function(n){return n.getHours()}],["%a %d",function(n){return n.getDay()&&1!=n.getDate()}],["%b %d",function(n){return 1!=n.getDate()}],["%B",function(n){return n.getMonth()}],["%Y",Ae]]),Zl={range:function(n,t,e){return Bo.range(Math.ceil(n/e)*e,+t,e).map(Vo)},floor:Et,ceil:Et};Yl.year=rc.year,rc.scale=function(){return Zo(Bo.scale.linear(),Yl,Il)};var Vl=Yl.map(function(n){return[n[0].utc,n[1]]}),Xl=Fl.multi([[".%L",function(n){return n.getUTCMilliseconds()}],[":%S",function(n){return n.getUTCSeconds()}],["%I:%M",function(n){return n.getUTCMinutes()}],["%I %p",function(n){return n.getUTCHours()}],["%a %d",function(n){return n.getUTCDay()&&1!=n.getUTCDate()}],["%b %d",function(n){return 1!=n.getUTCDate()}],["%B",function(n){return n.getUTCMonth()}],["%Y",Ae]]);Vl.year=rc.year.utc,rc.scale.utc=function(){return Zo(Bo.scale.linear(),Vl,Xl)},Bo.text=At(function(n){return n.responseText}),Bo.json=function(n,t){return Ct(n,"application/json",Xo,t)},Bo.html=function(n,t){return Ct(n,"text/html",$o,t)},Bo.xml=At(function(n){return n.responseXML}),"function"==typeof define&&define.amd?define(Bo):"object"==typeof module&&module.exports&&(module.exports=Bo),this.d3=Bo}();this.j$=this.jStat=function(a,b){function f(b,c){var d=b>c?b:c;return a.pow(10,17-~~(a.log(d>0?d:-d)*a.LOG10E))}function h(a){return e.call(a)==="[object Function]"}function i(a){return typeof a=="number"&&a===a}function j(a){return c.apply([],a)}function k(){return new k._init(arguments)}function l(){return 0}function m(){return 1}function n(a,b){return a===b?1:0}var c=Array.prototype.concat,d=Array.prototype.slice,e=Object.prototype.toString,g=Array.isArray||function(b){return e.call(b)==="[object Array]"};k.fn=k.prototype,k._init=function(b){var c;if(g(b[0]))if(g(b[0][0])){h(b[1])&&(b[0]=k.map(b[0],b[1]));for(c=0;c<b[0].length;c++)this[c]=b[0][c];this.length=b[0].length}else this[0]=h(b[1])?k.map(b[0],b[1]):b[0],this.length=1;else if(i(b[0]))this[0]=k.seq.apply(null,b),this.length=1;else{if(b[0]instanceof k)return k(b[0].toArray());this[0]=[],this.length=1}return this},k._init.prototype=k.prototype,k._init.constructor=k,k.utils={calcRdx:f,isArray:g,isFunction:h,isNumber:i,toVector:j},k.extend=function(b){var c,d;if(arguments.length===1){for(d in b)k[d]=b[d];return this}for(c=1;c<arguments.length;c++)for(d in arguments[c])b[d]=arguments[c][d];return b},k.rows=function(b){return b.length||1},k.cols=function(b){return b[0].length||1},k.dimensions=function(b){return{rows:k.rows(b),cols:k.cols(b)}},k.row=function(b,c){return b[c]},k.col=function(b,c){var d=new Array(b.length);for(var e=0;e<b.length;e++)d[e]=[b[e][c]];return d},k.diag=function(b){var c=k.rows(b),d=new Array(c);for(var e=0;e<c;e++)d[e]=[b[e][e]];return d},k.antidiag=function(b){var c=k.rows(b)-1,d=new Array(c);for(var e=0;c>=0;c--,e++)d[e]=[b[e][c]];return d},k.transpose=function(b){var c=[],d,e,f,h,i;g(b[0])||(b=[b]),e=b.length,f=b[0].length;for(i=0;i<f;i++){d=new Array(e);for(h=0;h<e;h++)d[h]=b[h][i];c.push(d)}return c.length===1?c[0]:c},k.map=function(b,c,d){var e,f,h,i,j;g(b[0])||(b=[b]),f=b.length,h=b[0].length,i=d?b:new Array(f);for(e=0;e<f;e++){i[e]||(i[e]=new Array(h));for(j=0;j<h;j++)i[e][j]=c(b[e][j],e,j)}return i.length===1?i[0]:i},k.cumreduce=function(b,c,d){var e,f,h,i,j;g(b[0])||(b=[b]),f=b.length,h=b[0].length,i=d?b:new Array(f);for(e=0;e<f;e++){i[e]||(i[e]=new Array(h)),h>0&&(i[e][0]=b[e][0]);for(j=1;j<h;j++)i[e][j]=c(i[e][j-1],b[e][j])}return i.length===1?i[0]:i},k.alter=function(b,c){return k.map(b,c,!0)},k.create=function(b,c,d){var e=new Array(b),f,g;h(c)&&(d=c,c=b);for(f=0;f<b;f++){e[f]=new Array(c);for(g=0;g<c;g++)e[f][g]=d(f,g)}return e},k.zeros=function(b,c){return i(c)||(c=b),k.create(b,c,l)},k.ones=function(b,c){return i(c)||(c=b),k.create(b,c,m)},k.rand=function(c,d){return i(d)||(d=c),k.create(c,d,a.random)},k.identity=function(b,c){return i(c)||(c=b),k.create(b,c,n)},k.symmetric=function(b){var c=!0,d=b.length,e,f;if(b.length!==b[0].length)return!1;for(e=0;e<d;e++)for(f=0;f<d;f++)if(b[f][e]!==b[e][f])return!1;return!0},k.clear=function(b){return k.alter(b,l)},k.seq=function(b,c,d,e){h(e)||(e=!1);var g=[],i=f(b,c),j=(c*i-b*i)/((d-1)*i),k=b,l;for(l=0;k<=c;l++,k=(b*i+j*i*l)/i)g.push(e?e(k,l):k);return g};var o=k.prototype;return o.length=0,o.push=Array.prototype.push,o.sort=Array.prototype.sort,o.splice=Array.prototype.splice,o.slice=Array.prototype.slice,o.toArray=function(){return this.length>1?d.call(this):d.call(this)[0]},o.map=function(b,c){return k(k.map(this,b,c))},o.cumreduce=function(b,c){return k(k.cumreduce(this,b,c))},o.alter=function(b){return k.alter(this,b),this},function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=function(b){var c=this,d;return b?(setTimeout(function(){b.call(c,o[a].call(c))}),this):(d=k[a](this),g(d)?k(d):d)}})(a[b])}("transpose clear symmetric rows cols dimensions diag antidiag".split(" ")),function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=function(b,c){var d=this;return c?(setTimeout(function(){c.call(d,o[a].call(d,b))}),this):k(k[a](this,b))}})(a[b])}("row col".split(" ")),function(a){for(var b=0;b<a.length;b++)(function(a){o[a]=new Function("return jStat(jStat."+a+".apply(null, arguments));")})(a[b])}("create zeros ones rand identity".split(" ")),k}(Math),function(a,b){function d(a,b){return a-b}function e(a,c,d){return b.max(c,b.min(a,d))}var c=a.utils.isFunction;a.sum=function g(a){var g=0,b=a.length,c;while(--b>=0)g+=a[b];return g},a.sumsqrd=function(b){var c=0,d=b.length;while(--d>=0)c+=b[d]*b[d];return c},a.sumsqerr=function(c){var d=a.mean(c),e=0,f=c.length,g;while(--f>=0)g=c[f]-d,e+=g*g;return e},a.product=function(b){var c=1,d=b.length;while(--d>=0)c*=b[d];return c},a.min=function(b){var c=b[0],d=0;while(++d<b.length)b[d]<c&&(c=b[d]);return c},a.max=function(b){var c=b[0],d=0;while(++d<b.length)b[d]>c&&(c=b[d]);return c},a.mean=function(c){return a.sum(c)/c.length},a.meansqerr=function(c){return a.sumsqerr(c)/c.length},a.geomean=function(d){return b.pow(a.product(d),1/d.length)},a.median=function(b){var c=b.length,e=b.slice().sort(d);return c&1?e[c/2|0]:(e[c/2-1]+e[c/2])/2},a.cumsum=function(c){return a.cumreduce(c,function(a,b){return a+b})},a.cumprod=function(c){return a.cumreduce(c,function(a,b){return a*b})},a.diff=function(b){var c=[],d=b.length,e;for(e=1;e<d;e++)c.push(b[e]-b[e-1]);return c},a.mode=function(b){var c=b.length,e=b.slice().sort(d),f=1,g=0,h=0,i=[],j;for(j=0;j<c;j++)e[j]===e[j+1]?f++:(f>g?(i=[e[j]],g=f,h=0):f===g&&(i.push(e[j]),h++),f=1);return h===0?i[0]:i},a.range=function(c){return a.max(c)-a.min(c)},a.variance=function(c,d){return a.sumsqerr(c)/(c.length-(d?1:0))},a.stdev=function(d,e){return b.sqrt(a.variance(d,e))},a.meandev=function(d){var e=0,f=a.mean(d),g;for(g=d.length-1;g>=0;g--)e+=b.abs(d[g]-f);return e/d.length},a.meddev=function(d){var e=0,f=a.median(d),g;for(g=d.length-1;g>=0;g--)e+=b.abs(d[g]-f);return e/d.length},a.coeffvar=function(c){return a.stdev(c)/a.mean(c)},a.quartiles=function(c){var e=c.length,f=c.slice().sort(d);return[f[b.round(e/4)-1],f[b.round(e/2)-1],f[b.round(e*3/4)-1]]},a.quantiles=function(c,f,g,h){var i=c.slice().sort(d),j=[f.length],k=c.length,l,m,n,o,p,q;typeof g=="undefined"&&(g=3/8),typeof h=="undefined"&&(h=3/8);for(l=0;l<f.length;l++)m=f[l],n=g+m*(1-g-h),o=k*m+n,p=b.floor(e(o,1,k-1)),q=e(o-p,0,1),j[l]=(1-q)*i[p-1]+q*i[p];return j},a.percentileOfScore=function(b,c,d){var e=0,f=b.length,g=!1,h,i;d==="strict"&&(g=!0);for(i=0;i<f;i++)h=b[i],(g&&h<c||!g&&h<=c)&&e++;return e/f},a.histogram=function(d,e){var f=a.min(d),g=e||4,h=(a.max(d)-f)/g,i=d.length,e=[],j;for(j=0;j<g;j++)e[j]=0;for(j=0;j<i;j++)e[b.min(b.floor((d[j]-f)/h),g-1)]+=1;return e},a.covariance=function(c,d){var e=a.mean(c),f=a.mean(d),g=c.length,h=new Array(g),i;for(i=0;i<g;i++)h[i]=(c[i]-e)*(d[i]-f);return a.sum(h)/(g-1)},a.corrcoeff=function(c,d){return a.covariance(c,d)/a.stdev(c,1)/a.stdev(d,1)},a.stanMoment=function(d,e){var f=a.mean(d),g=a.stdev(d),h=d.length,j=0;for(i=0;i<h;i++)j+=b.pow((d[i]-f)/g,e);return j/d.length},a.skewness=function(c){return a.stanMoment(c,3)},a.kurtosis=function(c){return a.stanMoment(c,4)-3};var f=a.prototype;(function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(d,e){var g=[],h=0,i=this;c(d)&&(e=d,d=!1);if(e)return setTimeout(function(){e.call(i,f[b].call(i,d))}),this;if(this.length>1){i=d===!0?this:this.transpose();for(;h<i.length;h++)g[h]=a[b](i[h]);return g}return a[b](this[0],d)}})(b[d])})("cumsum cumprod".split(" ")),function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(d,e){var g=[],h=0,i=this;c(d)&&(e=d,d=!1);if(e)return setTimeout(function(){e.call(i,f[b].call(i,d))}),this;if(this.length>1){i=d===!0?this:this.transpose();for(;h<i.length;h++)g[h]=a[b](i[h]);return d===!0?a[b](a.utils.toVector(g)):g}return a[b](this[0],d)}})(b[d])}("sum sumsqrd sumsqerr product min max mean meansqerr geomean median diff mode range variance stdev meandev meddev coeffvar quartiles histogram skewness kurtosis".split(" ")),function(b){for(var d=0;d<b.length;d++)(function(b){f[b]=function(){var d=[],e=0,g=this,h=Array.prototype.slice.call(arguments);if(c(h[h.length-1])){var i=h[h.length-1],j=h.slice(0,h.length-1);return setTimeout(function(){i.call(g,f[b].apply(g,j))}),this}var i=undefined,k=function(d){return a[b].apply(g,[d].concat(h))};if(this.length>1){g=g.transpose();for(;e<g.length;e++)d[e]=k(g[e]);return d}return k(this[0])}})(b[d])}("quantiles percentileOfScore".split(" "))}(this.jStat,Math),function(a,b){a.gammaln=function(c){var d=0,e=[76.18009172947146,-86.50532032941678,24.01409824083091,-1.231739572450155,.001208650973866179,-0.000005395239384953],f=1.000000000190015,g,h,i;i=(h=g=c)+5.5,i-=(g+.5)*b.log(i);for(;d<6;d++)f+=e[d]/++h;return b.log(2.5066282746310007*f/g)-i},a.gammafn=function(c){var d=[-1.716185138865495,24.76565080557592,-379.80425647094563,629.3311553128184,866.9662027904133,-31451.272968848367,-36144.413418691176,66456.14382024054],e=[-30.8402300119739,315.35062697960416,-1015.1563674902192,-3107.771671572311,22538.11842098015,4755.846277527881,-134659.9598649693,-115132.2596755535],f=!1,g=0,h=0,i=0,j=c,k,l,m,n,o,p;if(j<=0){n=j%1+3.6e-16;if(n)f=(j&1?-1:1)*b.PI/b.sin(b.PI*n),j=1-j;else return Infinity}m=j,j<1?l=j++:l=(j-=g=(j|0)-1)-1;for(k=0;k<8;++k)i=(i+d[k])*l,h=h*l+e[k];n=i/h+1;if(m<j)n/=m;else if(m>j)for(k=0;k<g;++k)n*=j,j++;return f&&(n=f/n),n},a.gammap=function(d,e){var f=a.gammaln(d),g=d,h=1/d,i=h,j=e+1-d,k=1/1e-30,l=1/j,m=l,n=1,o=-~(b.log(d>=1?d:1/d)*8.5+d*.4+17),p,q;if(e<0||d<=0)return NaN;if(e<d+1){for(;n<=o;n++)h+=i*=e/++g;return h*b.exp(-e+d*b.log(e)-f)}for(;n<=o;n++)p=-n*(n-d),j+=2,l=p*l+j,k=j+p/k,l=1/l,m*=l*k;return 1-m*b.exp(-e+d*b.log(e)-f)},a.factorialln=function(c){return c<0?NaN:a.gammaln(c+1)},a.factorial=function(c){return c<0?NaN:a.gammafn(c+1)},a.combination=function(d,e){return d>170||e>170?b.exp(a.combinationln(d,e)):a.factorial(d)/a.factorial(e)/a.factorial(d-e)},a.combinationln=function(c,d){return a.factorialln(c)-a.factorialln(d)-a.factorialln(c-d)},a.permutation=function(c,d){return a.factorial(c)/a.factorial(c-d)},a.betafn=function(d,e){return d<=0||e<=0?undefined:d+e>170?b.exp(a.betaln(d,e)):a.gammafn(d)*a.gammafn(e)/a.gammafn(d+e)},a.betaln=function(c,d){return a.gammaln(c)+a.gammaln(d)-a.gammaln(c+d)},a.betacf=function(c,d,e){var f=1e-30,g=1,h=d+e,i=d+1,j=d-1,k=1,l=1-h*c/i,m,n,o,p;b.abs(l)<f&&(l=f),l=1/l,p=l;for(;g<=100;g++){m=2*g,n=g*(e-g)*c/((j+m)*(d+m)),l=1+n*l,b.abs(l)<f&&(l=f),k=1+n/k,b.abs(k)<f&&(k=f),l=1/l,p*=l*k,n=-(d+g)*(h+g)*c/((d+m)*(i+m)),l=1+n*l,b.abs(l)<f&&(l=f),k=1+n/k,b.abs(k)<f&&(k=f),l=1/l,o=l*k,p*=o;if(b.abs(o-1)<3e-7)break}return p},a.gammapinv=function(d,e){var f=0,g=e-1,h=1e-8,i=a.gammaln(e),j,k,l,m,n,o,p;if(d>=1)return b.max(100,e+100*b.sqrt(e));if(d<=0)return 0;e>1?(o=b.log(g),p=b.exp(g*(o-1)-i),n=d<.5?d:1-d,l=b.sqrt(-2*b.log(n)),j=(2.30753+l*.27061)/(1+l*(.99229+l*.04481))-l,d<.5&&(j=-j),j=b.max(.001,e*b.pow(1-1/(9*e)-j/(3*b.sqrt(e)),3))):(l=1-e*(.253+e*.12),d<l?j=b.pow(d/l,1/e):j=1-b.log(1-(d-l)/(1-l)));for(;f<12;f++){if(j<=0)return 0;k=a.gammap(e,j)-d,e>1?l=p*b.exp(-(j-g)+g*(b.log(j)-o)):l=b.exp(-j+g*b.log(j)-i),m=k/l,j-=l=m/(1-.5*b.min(1,m*((e-1)/j-1))),j<=0&&(j=.5*(j+l));if(b.abs(l)<h*j)break}return j},a.erf=function(c){var d=[-1.3026537197817094,.6419697923564902,.019476473204185836,-0.00956151478680863,-0.000946595344482036,.000366839497852761,42523324806907e-18,-0.000020278578112534,-0.000001624290004647,130365583558e-17,1.5626441722e-8,-8.5238095915e-8,6.529054439e-9,5.059343495e-9,-9.91364156e-10,-2.27365122e-10,9.6467911e-11,2.394038e-12,-6.886027e-12,8.94487e-13,3.13092e-13,-1.12708e-13,3.81e-16,7.106e-15,-1.523e-15,-9.4e-17,1.21e-16,-2.8e-17],e=d.length-1,f=!1,g=0,h=0,i,j,k,l;c<0&&(c=-c,f=!0),i=2/(2+c),j=4*i-2;for(;e>0;e--)k=g,g=j*g-h+d[e],h=k;return l=i*b.exp(-c*c+.5*(d[0]+j*g)-h),f?l-1:1-l},a.erfc=function(c){return 1-a.erf(c)},a.erfcinv=function(d){var e=0,f,g,h,i;if(d>=2)return-100;if(d<=0)return 100;i=d<1?d:2-d,h=b.sqrt(-2*b.log(i/2)),f=-0.70711*((2.30753+h*.27061)/(1+h*(.99229+h*.04481))-h);for(;e<2;e++)g=a.erfc(f)-i,f+=g/(1.1283791670955126*b.exp(-f*f)-f*g);return d<1?f:-f},a.ibetainv=function(d,e,f){var g=1e-8,h=e-1,i=f-1,j=0,k,l,m,n,o,p,q,r,s,t,u;if(d<=0)return 0;if(d>=1)return 1;e>=1&&f>=1?(m=d<.5?d:1-d,n=b.sqrt(-2*b.log(m)),q=(2.30753+n*.27061)/(1+n*(.99229+n*.04481))-n,d<.5&&(q=-q),r=(q*q-3)/6,s=2/(1/(2*e-1)+1/(2*f-1)),t=q*b.sqrt(r+s)/s-(1/(2*f-1)-1/(2*e-1))*(r+5/6-2/(3*s)),q=e/(e+f*b.exp(2*t))):(k=b.log(e/(e+f)),l=b.log(f/(e+f)),n=b.exp(e*k)/e,o=b.exp(f*l)/f,t=n+o,d<n/t?q=b.pow(e*t*d,1/e):q=1-b.pow(f*t*(1-d),1/f)),u=-a.gammaln(e)-a.gammaln(f)+a.gammaln(e+f);for(;j<10;j++){if(q===0||q===1)return q;p=a.ibeta(q,e,f)-d,n=b.exp(h*b.log(q)+i*b.log(1-q)+u),o=p/n,q-=n=o/(1-.5*b.min(1,o*(h/q-i/(1-q)))),q<=0&&(q=.5*(q+n)),q>=1&&(q=.5*(q+n+1));if(b.abs(n)<g*q&&j>0)break}return q},a.ibeta=function(d,e,f){var g=d===0||d===1?0:b.exp(a.gammaln(e+f)-a.gammaln(e)-a.gammaln(f)+e*b.log(d)+f*b.log(1-d));return d<0||d>1?!1:d<(e+1)/(e+f+2)?g*a.betacf(d,e,f)/e:1-g*a.betacf(1-d,f,e)/f},a.randn=function(d,e){var f,g,h,i,j,k;e||(e=d);if(d)return a.create(d,e,function(){return a.randn()});do f=b.random(),g=1.7156*(b.random()-.5),h=f-.449871,i=b.abs(g)+.386595,j=h*h+i*(.196*i-.25472*h);while(j>.27597&&(j>.27846||g*g>-4*b.log(f)*f*f));return g/f},a.randg=function(d,e,f){var g=d,h,i,j,k,l,m;f||(f=e),d||(d=1);if(e)return m=a.zeros(e,f),m.alter(function(){return a.randg(d)}),m;d<1&&(d+=1),h=d-1/3,i=1/b.sqrt(9*h);do{do l=a.randn(),k=1+i*l;while(k<=0);k=k*k*k,j=b.random()}while(j>1-.331*b.pow(l,4)&&b.log(j)>.5*l*l+h*(1-k+b.log(k)));if(d==g)return h*k;do j=b.random();while(j===0);return b.pow(j,1/g)*h*k},function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(){return a(a.map(this,function(c){return a[b](c)}))}})(b[c])}("gammaln gammafn factorial factorialln".split(" ")),function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(){return a(a[b].apply(null,arguments))}})(b[c])}("randn".split(" "))}(this.jStat,Math),function(a,b){(function(b){for(var c=0;c<b.length;c++)(function(b){a[b]=function(a,b,c){return this instanceof arguments.callee?(this._a=a,this._b=b,this._c=c,this):new arguments.callee(a,b,c)},a.fn[b]=function(c,d,e){var f=a[b](c,d,e);return f.data=this,f},a[b].prototype.sample=function(c){var d=this._a,e=this._b,f=this._c;return c?a.alter(c,function(){return a[b].sample(d,e,f)}):a[b].sample(d,e,f)},function(c){for(var d=0;d<c.length;d++)(function(c){a[b].prototype[c]=function(d){var e=this._a,f=this._b,g=this._c;return!d&&d!==0&&(d=this.data),typeof d!="number"?a.fn.map.call(d,function(d){return a[b][c](d,e,f,g)}):a[b][c](d,e,f,g)}})(c[d])}("pdf cdf inv".split(" ")),function(c){for(var d=0;d<c.length;d++)(function(c){a[b].prototype[c]=function(){return a[b][c](this._a,this._b,this._c)}})(c[d])}("mean median mode variance".split(" "))})(b[c])})("beta centralF cauchy chisquare exponential gamma invgamma kumaraswamy lognormal normal pareto studentt weibull uniform  binomial negbin hypgeom poisson triangular".split(" ")),a.extend(a.beta,{pdf:function(d,e,f){return d>1||d<0?0:e==1&&f==1?1:e<512||f<512?b.pow(d,e-1)*b.pow(1-d,f-1)/a.betafn(e,f):b.exp((e-1)*b.log(d)+(f-1)*b.log(1-d)-a.betaln(e,f))},cdf:function(c,d,e){return c>1||c<0?(c>1)*1:a.ibeta(c,d,e)},inv:function(c,d,e){return a.ibetainv(c,d,e)},mean:function(b,c){return b/(b+c)},median:function(b,c){throw new Error("median not yet implemented")},mode:function(c,d){return c*d/(b.pow(c+d,2)*(c+d+1))},sample:function(c,d){var e=a.randg(c);return e/(e+a.randg(d))},variance:function(c,d){return c*d/(b.pow(c+d,2)*(c+d+1))}}),a.extend(a.centralF,{pdf:function(d,e,f){var g,h,i;return d<0?undefined:e<=2?b.sqrt(b.pow(e*d,e)*b.pow(f,f)/b.pow(e*d+f,e+f))/(d*a.betafn(e/2,f/2)):(g=e*d/(f+d*e),h=f/(f+d*e),i=e*h/2,i*a.binomial.pdf((e-2)/2,(e+f-2)/2,g))},cdf:function(c,d,e){return a.ibeta(d*c/(d*c+e),d/2,e/2)},inv:function(c,d,e){return e/(d*(1/a.ibetainv(c,d/2,e/2)-1))},mean:function(b,c){return c>2?c/(c-2):undefined},mode:function(b,c){return b>2?c*(b-2)/(b*(c+2)):undefined},sample:function(c,d){var e=a.randg(c/2)*2,f=a.randg(d/2)*2;return e/c/(f/d)},variance:function(b,c){return c<=4?undefined:2*c*c*(b+c-2)/(b*(c-2)*(c-2)*(c-4))}}),a.extend(a.cauchy,{pdf:function(c,d,e){return e/(b.pow(c-d,2)+b.pow(e,2))/b.PI},cdf:function(c,d,e){return b.atan((c-d)/e)/b.PI+.5},inv:function(a,c,d){return c+d*b.tan(b.PI*(a-.5))},median:function(b,c){return b},mode:function(b,c){return b},sample:function(d,e){return a.randn()*b.sqrt(1/(2*a.randg(.5)))*e+d}}),a.extend(a.chisquare,{pdf:function(d,e){return d===0?0:b.exp((e/2-1)*b.log(d)-d/2-e/2*b.log(2)-a.gammaln(e/2))},cdf:function(c,d){return a.gammap(d/2,c/2)},inv:function(b,c){return 2*a.gammapinv(b,.5*c)},mean:function(a){return a},median:function(c){return c*b.pow(1-2/(9*c),3)},mode:function(b){return b-2>0?b-2:0},sample:function(c){return a.randg(c/2)*2},variance:function(b){return 2*b}}),a.extend(a.exponential,{pdf:function(c,d){return c<0?0:d*b.exp(-d*c)},cdf:function(c,d){return c<0?0:1-b.exp(-d*c)},inv:function(a,c){return-b.log(1-a)/c},mean:function(a){return 1/a},median:function(a){return 1/a*b.log(2)},mode:function(b){return 0},sample:function(c){return-1/c*b.log(b.random())},variance:function(a){return b.pow(a,-2)}}),a.extend(a.gamma,{pdf:function(d,e,f){return b.exp((e-1)*b.log(d)-d/f-a.gammaln(e)-e*b.log(f))},cdf:function(c,d,e){return a.gammap(d,c/e)},inv:function(b,c,d){return a.gammapinv(b,c)*d},mean:function(a,b){return a*b},mode:function(b,c){return b>1?(b-1)*c:undefined},sample:function(c,d){return a.randg(c)*d},variance:function(b,c){return b*c*c}}),a.extend(a.invgamma,{pdf:function(d,e,f){return b.exp(-(e+1)*b.log(d)-f/d-a.gammaln(e)+e*b.log(f))},cdf:function(c,d,e){return 1-a.gammap(d,e/c)},inv:function(b,c,d){return d/a.gammapinv(1-b,c)},mean:function(a,b){return a>1?b/(a-1):undefined},mode:function(b,c){return c/(b+1)},sample:function(c,d){return d/a.randg(c)},variance:function(b,c){return b<=2?undefined:c*c/((b-1)*(b-1)*(b-2))}}),a.extend(a.kumaraswamy,{pdf:function(c,d,e){return b.exp(b.log(d)+b.log(e)+(d-1)*b.log(c)+(e-1)*b.log(1-b.pow(c,d)))},cdf:function(c,d,e){return 1-b.pow(1-b.pow(c,d),e)},mean:function(b,c){return c*a.gammafn(1+1/b)*a.gammafn(c)/a.gammafn(1+1/b+c)},median:function(c,d){return b.pow(1-b.pow(2,-1/d),1/c)},mode:function(c,d){return c>=1&&d>=1&&c!==1&&d!==1?b.pow((c-1)/(c*d-1),1/c):undefined},variance:function(b,c){throw new Error("variance not yet implemented")}}),a.extend(a.lognormal,{pdf:function(c,d,e){return b.exp(-b.log(c)-.5*b.log(2*b.PI)-b.log(e)-b.pow(b.log(c)-d,2)/(2*e*e))},cdf:function(d,e,f){return.5+.5*a.erf((b.log(d)-e)/b.sqrt(2*f*f))},inv:function(c,d,e){return b.exp(-1.4142135623730951*e*a.erfcinv(2*c)+d)},mean:function(c,d){return b.exp(c+d*d/2)},median:function(c,d){return b.exp(c)},mode:function(c,d){return b.exp(c-d*d)},sample:function(d,e){return b.exp(a.randn()*e+d)},variance:function(c,d){return(b.exp(d*d)-1)*b.exp(2*c+d*d)}}),a.extend(a.normal,{pdf:function(c,d,e){return b.exp(-0.5*b.log(2*b.PI)-b.log(e)-b.pow(c-d,2)/(2*e*e))},cdf:function(d,e,f){return.5*(1+a.erf((d-e)/b.sqrt(2*f*f)))},inv:function(b,c,d){return-1.4142135623730951*d*a.erfcinv(2*b)+c},mean:function(a,b){return a},median:function(b,c){return b},mode:function(a,b){return a},sample:function(c,d){return a.randn()*d+c},variance:function(a,b){return b*b}}),a.extend(a.pareto,{pdf:function(c,d,e){return c<d?undefined:e*b.pow(d,e)/b.pow(c,e+1)},cdf:function(c,d,e){return 1-b.pow(d/c,e)},mean:function(c,d){return d<=1?undefined:d*b.pow(c,d)/(d-1)},median:function(c,d){return c*d*b.SQRT2},mode:function(b,c){return b},variance:function(a,c){return c<=2?undefined:a*a*c/(b.pow(c-1,2)*(c-2))}}),a.extend(a.studentt,{pdf:function(d,e){return a.gammafn((e+1)/2)/(b.sqrt(e*b.PI)*a.gammafn(e/2))*b.pow(1+d*d/e,-((e+1)/2))},cdf:function(d,e){var f=e/2;return a.ibeta((d+b.sqrt(d*d+e))/(2*b.sqrt(d*d+e)),f,f)},inv:function(c,d){var e=a.ibetainv(2*b.min(c,1-c),.5*d,.5);return e=b.sqrt(d*(1-e)/e),c>.5?e:-e},mean:function(b){return b>1?0:undefined},median:function(b){return 0},mode:function(b){return 0},sample:function(d){return a.randn()*b.sqrt(d/(2*a.randg(d/2)))},variance:function(b){return b>2?b/(b-2):b>1?Infinity:undefined}}),a.extend(a.weibull,{pdf:function(c,d,e){return c<0?0:e/d*b.pow(c/d,e-1)*b.exp(-b.pow(c/d,e))},cdf:function(c,d,e){return c<0?0:1-b.exp(-b.pow(c/d,e))},inv:function(a,c,d){return c*b.pow(-b.log(1-a),1/d)},mean:function(b,c){return b*a.gammafn(1+1/c)},median:function(c,d){return c*b.pow(b.log(2),1/d)},mode:function(c,d){return d<=1?undefined:c*b.pow((d-1)/d,1/d)},sample:function(c,d){return c*b.pow(-b.log(b.random()),1/d)},variance:function(d,e){return d*d*a.gammafn(1+2/e)-b.pow(this.mean(d,e),2)}}),a.extend(a.uniform,{pdf:function(b,c,d){return b<c||b>d?0:1/(d-c)},cdf:function(b,c,d){return b<c?0:b<d?(b-c)/(d-c):1},inv:function(a,b,c){return b+a*(c-b)},mean:function(b,c){return.5*(b+c)},median:function(c,d){return a.mean(c,d)},mode:function(b,c){throw new Error("mode is not yet implemented")},sample:function(c,d){return c/2+d/2+(d/2-c/2)*(2*b.random()-1)},variance:function(c,d){return b.pow(d-c,2)/12}}),a.extend(a.binomial,{pdf:function(d,e,f){return f===0||f===1?e*f===d?1:0:a.combination(e,d)*b.pow(f,d)*b.pow(1-f,e-d)},cdf:function(c,d,e){var f=[],g=0;if(c<0)return 0;if(c<d){for(;g<=c;g++)f[g]=a.binomial.pdf(g,d,e);return a.sum(f)}return 1}}),a.extend(a.negbin,{pdf:function(d,e,f){return d!==d|0?!1:d<0?0:a.combination(d+e-1,e-1)*b.pow(1-f,d)*b.pow(f,e)},cdf:function(c,d,e){var f=0,g=0;if(c<0)return 0;for(;g<=c;g++)f+=a.negbin.pdf(g,d,e);return f}}),a.extend(a.hypgeom,{pdf:function(d,e,f,g){if(d!==d|0)return!1;if(d<0||d<f-(e-g))return 0;if(d>g||d>f)return 0;if(f*2>e)return g*2>e?a.hypgeom.pdf(e-f-g+d,e,e-f,e-g):a.hypgeom.pdf(g-d,e,e-f,g);if(g*2>e)return a.hypgeom.pdf(f-d,e,f,e-g);if(f<g)return a.hypgeom.pdf(d,e,g,f);var h=1,i=0;for(var j=0;j<d;j++){while(h>1&&i<g)h*=1-f/(e-i),i++;h*=(g-j)*(f-j)/((j+1)*(e-f-g+j+1))}for(;i<g;i++)h*=1-f/(e-i);return b.min(1,b.max(0,h))},cdf:function(d,e,f,g){if(d<0||d<f-(e-g))return 0;if(d>=g||d>=f)return 1;if(f*2>e)return g*2>e?a.hypgeom.cdf(e-f-g+d,e,e-f,e-g):1-a.hypgeom.cdf(g-d-1,e,e-f,g);if(g*2>e)return 1-a.hypgeom.cdf(f-d-1,e,f,e-g);if(f<g)return a.hypgeom.cdf(d,e,g,f);var h=1,i=1,j=0;for(var k=0;k<d;k++){while(h>1&&j<g){var l=1-f/(e-j);i*=l,h*=l,j++}i*=(g-k)*(f-k)/((k+1)*(e-f-g+k+1)),h+=i}for(;j<g;j++)h*=1-f/(e-j);return b.min(1,b.max(0,h))}}),a.extend(a.poisson,{pdf:function(d,e){return b.pow(e,d)*b.exp(-e)/a.factorial(d)},cdf:function(c,d){var e=[],f=0;if(c<0)return 0;for(;f<=c;f++)e.push(a.poisson.pdf(f,d));return a.sum(e)},mean:function(a){return a},variance:function(a){return a},sample:function(c){var d=1,e=0,f=b.exp(-c);do e++,d*=b.random();while(d>f);return e-1}}),a.extend(a.triangular,{pdf:function(b,c,d,e){return d<=c||e<c||e>d?undefined:b<c||b>d?0:b<=e?2*(b-c)/((d-c)*(e-c)):2*(d-b)/((d-c)*(d-e))},cdf:function(c,d,e,f){return e<=d||f<d||f>e?undefined:c<d?0:c<=f?b.pow(c-d,2)/((e-d)*(f-d)):1-b.pow(e-c,2)/((e-d)*(e-f))},mean:function(b,c,d){return(b+c+d)/3},median:function(c,d,e){if(e<=(c+d)/2)return d-b.sqrt((d-c)*(d-e))/b.sqrt(2);if(e>(c+d)/2)return c+b.sqrt((d-c)*(e-c))/b.sqrt(2)},mode:function(b,c,d){return d},sample:function(c,d,e){var f=b.random();return f<(e-c)/(d-c)?c+b.sqrt(f*(d-c)*(e-c)):d-b.sqrt((1-f)*(d-c)*(d-e))},variance:function(b,c,d){return(b*b+c*c+d*d-b*c-b*d-c*d)/18}})}(this.jStat,Math),function(a,b){var d=Array.prototype.push,e=a.utils.isArray;a.extend({add:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.map(c,function(a,b,c){return a+d[b][c]})):a.map(c,function(a){return a+d})},subtract:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.map(c,function(a,b,c){return a-d[b][c]||0})):a.map(c,function(a){return a-d})},divide:function(c,d){return e(d)?(e(d[0])||(d=[d]),a.multiply(c,a.inv(d))):a.map(c,function(a){return a/d})},multiply:function(c,d){var f,g,h,i,j=c.length,k=c[0].length,l=a.zeros(j,h=e(d)?d[0].length:k),m=0;if(e(d)){for(;m<h;m++)for(f=0;f<j;f++){i=0;for(g=0;g<k;g++)i+=c[f][g]*d[g][m];l[f][m]=i}return j===1&&m===1?l[0][0]:l}return a.map(c,function(a){return a*d})},dot:function(c,d){e(c[0])||(c=[c]),e(d[0])||(d=[d]);var f=c[0].length===1&&c.length!==1?a.transpose(c):c,g=d[0].length===1&&d.length!==1?a.transpose(d):d,h=[],i=0,j=f.length,k=f[0].length,l,m;for(;i<j;i++){h[i]=[],l=0;for(m=0;m<k;m++)l+=f[i][m]*g[i][m];h[i]=l}return h.length===1?h[0]:h},pow:function(d,e){return a.map(d,function(a){return b.pow(a,e)})},exp:function(d){return a.map(d,function(a){return b.exp(a)})},log:function(d){return a.map(d,function(a){return b.log(a)})},abs:function(d){return a.map(d,function(a){return b.abs(a)})},norm:function(c,d){var f=0,g=0;isNaN(d)&&(d=2),e(c[0])&&(c=c[0]);for(;g<c.length;g++)f+=b.pow(b.abs(c[g]),d);return b.pow(f,1/d)},angle:function(d,e){return b.acos(a.dot(d,e)/(a.norm(d)*a.norm(e)))},aug:function(b,c){var e=b.slice(),f=0;for(;f<e.length;f++)d.apply(e[f],c[f]);return e},inv:function(c){var d=c.length,e=c[0].length,f=a.identity(d,e),g=a.gauss_jordan(c,f),h=[],i=0,j;for(;i<d;i++){h[i]=[];for(j=e;j<g[0].length;j++)h[i][j-e]=g[i][j]}return h},det:function(b){var c=b.length,d=c*2,e=new Array(d),f=c-1,g=d-1,h=f-c+1,i=g,j=0,k=0,l;if(c===2)return b[0][0]*b[1][1]-b[0][1]*b[1][0];for(;j<d;j++)e[j]=1;for(j=0;j<c;j++){for(l=0;l<c;l++)e[h<0?h+c:h]*=b[j][l],e[i<c?i+c:i]*=b[j][l],h++,i--;h=--f-c+1,i=--g}for(j=0;j<c;j++)k+=e[j];for(;j<d;j++)k-=e[j];return k},gauss_elimination:function(d,e){var f=0,g=0,h=d.length,i=d[0].length,j=1,k=0,l=[],m,n,o,p;d=a.aug(d,e),m=d[0].length;for(f=0;f<h;f++){n=d[f][f],g=f;for(p=f+1;p<i;p++)n<b.abs(d[p][f])&&(n=d[p][f],g=p);if(g!=f)for(p=0;p<m;p++)o=d[f][p],d[f][p]=d[g][p],d[g][p]=o;for(g=f+1;g<h;g++){j=d[g][f]/d[f][f];for(p=f;p<m;p++)d[g][p]=d[g][p]-j*d[f][p]}}for(f=h-1;f>=0;f--){k=0;for(g=f+1;g<=h-1;g++)k+=l[g]*d[f][g];l[f]=(d[f][m-1]-k)/d[f][f]}return l},gauss_jordan:function(e,f){var g=a.aug(e,f),h=g.length,i=g[0].length;for(var j=0;j<h;j++){var k=j;for(var l=j+1;l<h;l++)b.abs(g[l][j])>b.abs(g[k][j])&&(k=l);var m=g[j];g[j]=g[k],g[k]=m;for(var l=j+1;l<h;l++){c=g[l][j]/g[j][j];for(var n=j;n<i;n++)g[l][n]-=g[j][n]*c}}for(var j=h-1;j>=0;j--){c=g[j][j];for(var l=0;l<j;l++)for(var n=i-1;n>j-1;n--)g[l][n]-=g[j][n]*g[l][j]/c;g[j][j]/=c;for(var n=h;n<i;n++)g[j][n]/=c}return g},lu:function(b,c){throw new Error("lu not yet implemented")},cholesky:function(b,c){throw new Error("cholesky not yet implemented")},gauss_jacobi:function(d,e,f,g){var h=0,i=0,j=d.length,k=[],l=[],m=[],n,o,p,q;for(;h<j;h++){k[h]=[],l[h]=[],m[h]=[];for(i=0;i<j;i++)h>i?(k[h][i]=d[h][i],l[h][i]=m[h][i]=0):h<i?(l[h][i]=d[h][i],k[h][i]=m[h][i]=0):(m[h][i]=d[h][i],k[h][i]=l[h][i]=0)}p=a.multiply(a.multiply(a.inv(m),a.add(k,l)),-1),o=a.multiply(a.inv(m),e),n=f,q=a.add(a.multiply(p,f),o),h=2;while(b.abs(a.norm(a.subtract(q,n)))>g)n=q,q=a.add(a.multiply(p,n),o),h++;return q},gauss_seidel:function(d,e,f,g){var h=0,i=d.length,j=[],k=[],l=[],m,n,o,p,q;for(;h<i;h++){j[h]=[],k[h]=[],l[h]=[];for(m=0;m<i;m++)h>m?(j[h][m]=d[h][m],k[h][m]=l[h][m]=0):h<m?(k[h][m]=d[h][m],j[h][m]=l[h][m]=0):(l[h][m]=d[h][m],j[h][m]=k[h][m]=0)}p=a.multiply(a.multiply(a.inv(a.add(l,j)),k),-1),o=a.multiply(a.inv(a.add(l,j)),e),n=f,q=a.add(a.multiply(p,f),o),h=2;while(b.abs(a.norm(a.subtract(q,n)))>g)n=q,q=a.add(a.multiply(p,n),o),h+=1;return q},SOR:function(d,e,f,g,h){var i=0,j=d.length,k=[],l=[],m=[],n,o,p,q,r;for(;i<j;i++){k[i]=[],l[i]=[],m[i]=[];for(n=0;n<j;n++)i>n?(k[i][n]=d[i][n],l[i][n]=m[i][n]=0):i<n?(l[i][n]=d[i][n],k[i][n]=m[i][n]=0):(m[i][n]=d[i][n],k[i][n]=l[i][n]=0)}q=a.multiply(a.inv(a.add(m,a.multiply(k,h))),a.subtract(a.multiply(m,1-h),a.multiply(l,h))),p=a.multiply(a.multiply(a.inv(a.add(m,a.multiply(k,h))),e),h),o=f,r=a.add(a.multiply(q,f),p),i=2;while(b.abs(a.norm(a.subtract(r,o)))>g)o=r,r=a.add(a.multiply(q,o),p),i++;return r},householder:function(d){var e=d.length,f=d[0].length,g=0,h=[],i=[],j,k,l,m,n;for(;g<e-1;g++){j=0;for(m=g+1;m<f;m++)j+=d[m][g]*d[m][g];n=d[g+1][g]>0?-1:1,j=n*b.sqrt(j),k=b.sqrt((j*j-d[g+1][g]*j)/2),h=a.zeros(e,1),h[g+1][0]=(d[g+1][g]-j)/(2*k);for(l=g+2;l<e;l++)h[l][0]=d[l][g]/(2*k);i=a.subtract(a.identity(e,f),a.multiply(a.multiply(h,a.transpose(h)),2)),d=a.multiply(i,a.multiply(d,i))}return d},QR:function(d,e){var f=d.length,g=d[0].length,h=0,i=[],j=[],k=[],l,m,n,o,p,q;for(;h<f-1;h++){m=0;for(l=h+1;l<g;l++)m+=d[l][h]*d[l][h];p=d[h+1][h]>0?-1:1,m=p*b.sqrt(m),n=b.sqrt((m*m-d[h+1][h]*m)/2),i=a.zeros(f,1),i[h+1][0]=(d[h+1][h]-m)/(2*n);for(o=h+2;o<f;o++)i[o][0]=d[o][h]/(2*n);j=a.subtract(a.identity(f,g),a.multiply(a.multiply(i,a.transpose(i)),2)),d=a.multiply(j,d),e=a.multiply(j,e)}for(h=f-1;h>=0;h--){q=0;for(l=h+1;l<=g-1;l++)q=k[l]*d[h][l];k[h]=e[h][0]/d[h][h]}return k},jacobi:function(d){var e=1,f=0,g=d.length,h=a.identity(g,g),i=[],j,k,l,m,n,o,p,q;while(e===1){f++,o=d[0][1],m=0,n=1;for(k=0;k<g;k++)for(l=0;l<g;l++)k!=l&&o<b.abs(d[k][l])&&(o=b.abs(d[k][l]),m=k,n=l);d[m][m]===d[n][n]?p=d[m][n]>0?b.PI/4:-b.PI/4:p=b.atan(2*d[m][n]/(d[m][m]-d[n][n]))/2,q=a.identity(g,g),q[m][m]=b.cos(p),q[m][n]=-b.sin(p),q[n][m]=b.sin(p),q[n][n]=b.cos(p),h=a.multiply(h,q),j=a.multiply(a.multiply(a.inv(q),d),q),d=j,e=0;for(k=1;k<g;k++)for(l=1;l<g;l++)k!=l&&b.abs(d[k][l])>.001&&(e=1)}for(k=0;k<g;k++)i.push(d[k][k]);return[h,i]},rungekutta:function(b,c,d,e,f,g){var h,i,j,k,l;if(g===2)while(e<=d)h=c*b(e,f),i=c*b(e+c,f+h),j=f+(h+i)/2,f=j,e+=c;if(g===4)while(e<=d)h=c*b(e,f),i=c*b(e+c/2,f+h/2),k=c*b(e+c/2,f+i/2),l=c*b(e+c,f+k),j=f+(h+2*i+2*k+l)/6,f=j,e+=c;return f},romberg:function(c,d,e,f){var g=0,h=(e-d)/2,i=[],j=[],k=[],l,m,n,o,p,q;while(g<f/2){p=c(d);for(n=d,o=0;n<=e;n+=h,o++)i[o]=n;l=i.length;for(n=1;n<l-1;n++)p+=(n%2!==0?4:2)*c(i[n]);p=h/3*(p+c(e)),k[g]=p,h/=2,g++}m=k.length,l=1;while(m!==1){for(n=0;n<m-1;n++)j[n]=(b.pow(4,l)*k[n+1]-k[n])/(b.pow(4,l)-1);m=j.length,k=j,j=[],l++}return k},richardson:function(c,d,e,f){function g(a,b){var c=0,d=a.length,e;for(;c<d;c++)a[c]===b&&(e=c);return e}var h=c.length,i=b.abs(e-c[g(c,e)+1]),j=0,k=[],l=[],m,n,o,p,q;while(f>=i)m=g(c,e+f),n=g(c,e),k[j]=(d[m]-2*d[n]+d[2*n-m])/(f*f),f/=2,j++;p=k.length,o=1;while(p!=1){for(q=0;q<p-1;q++)l[q]=(b.pow(4,o)*k[q+1]-k[q])/(b.pow(4,o)-1);p=l.length,k=l,l=[],o++}return k},simpson:function(b,c,d,e){var f=(d-c)/e,g=b(c),h=[],i=c,j=0,k=1,l;for(;i<=d;i+=f,j++)h[j]=i;l=h.length;for(;k<l-1;k++)g+=(k%2!==0?4:2)*b(h[k]);return f/3*(g+b(d))},hermite:function(b,c,d,e){var f=b.length,g=0,h=0,i=[],j=[],k=[],l=[],m;for(;h<f;h++){i[h]=1;for(m=0;m<f;m++)h!=m&&(i[h]*=(e-b[m])/(b[h]-b[m]));j[h]=0;for(m=0;m<f;m++)h!=m&&(j[h]+=1/(b[h]-b[m]));k[h]=(1-2*(e-b[h])*j[h])*i[h]*i[h],l[h]=(e-b[h])*i[h]*i[h],g+=k[h]*c[h]+l[h]*d[h]}return g},lagrange:function(b,c,d){var e=0,f=0,g,h,i=b.length;for(;f<i;f++){h=c[f];for(g=0;g<i;g++)f!=g&&(h*=(d-b[g])/(b[f]-b[g]));e+=h}return e},cubic_spline:function(c,d,e){var f=c.length,g=0,h,i=[],j=[],k=[],l=[],m=[],n=[],o=[];for(;g<f-1;g++)m[g]=c[g+1]-c[g];k[0]=0;for(g=1;g<f-1;g++)k[g]=3/m[g]*(d[g+1]-d[g])-3/m[g-1]*(d[g]-d[g-1]);for(g=1;g<f-1;g++)i[g]=[],j[g]=[],i[g][g-1]=m[g-1],i[g][g]=2*(m[g-1]+m[g]),i[g][g+1]=m[g],j[g][0]=k[g];l=a.multiply(a.inv(i),j);for(h=0;h<f-1;h++)n[h]=(d[h+1]-d[h])/m[h]-m[h]*(l[h+1][0]+2*l[h][0])/3,o[h]=(l[h+1][0]-l[h][0])/(3*m[h]);for(h=0;h<f;h++)if(c[h]>e)break;return h-=1,d[h]+(e-c[h])*n[h]+a.sq(e-c[h])*l[h]+(e-c[h])*a.sq(e-c[h])*o[h]},gauss_quadrature:function(){throw new Error("gauss_quadrature not yet implemented")},PCA:function(c){var d=c.length,e=c[0].length,f=!1,g=0,h,i,j=[],k=[],l=[],m=[],n=[],o=[],p=[],q=[],r=[],s=[];for(g=0;g<d;g++)j[g]=a.sum(c[g])/e;for(g=0;g<e;g++){p[g]=[];for(h=0;h<d;h++)p[g][h]=c[h][g]-j[h]}p=a.transpose(p);for(g=0;g<d;g++){q[g]=[];for(h=0;h<d;h++)q[g][h]=a.dot([p[g]],[p[h]])/(e-1)}l=a.jacobi(q),r=l[0],k=l[1],s=a.transpose(r);for(g=0;g<k.length;g++)for(h=g;h<k.length;h++)k[g]<k[h]&&(i=k[g],k[g]=k[h],k[h]=i,m=s[g],s[g]=s[h],s[h]=m);o=a.transpose(p);for(g=0;g<d;g++){n[g]=[];for(h=0;h<o.length;h++)n[g][h]=a.dot([s[g]],[o[h]])}return[c,k,s,n]}}),function(b){for(var c=0;c<b.length;c++)(function(b){a.fn[b]=function(c,d){var e=this;return d?(setTimeout(function(){d.call(e,a.fn[b].call(e,c))},15),this):typeof a[b](this,c)=="number"?a[b](this,c):a(a[b](this,c))}})(b[c])}("add divide multiply subtract dot pow exp log abs norm angle".split(" "))}(this.jStat,Math),function(a,b){var c=[].slice,d=a.utils.isNumber;a.extend({zscore:function(){var e=c.call(arguments);return d(e[1])?(e[0]-e[1])/e[2]:(e[0]-a.mean(e[1]))/a.stdev(e[1],e[2])},ztest:function(){var f=c.call(arguments);if(f.length===4){if(d(f[1])){var g=a.zscore(f[0],f[1],f[2]);return f[3]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}var g=f[0];return f[2]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}var g=a.zscore(f[0],f[1],f[3]);return f[1]===1?a.normal.cdf(-b.abs(g),0,1):a.normal.cdf(-b.abs(g),0,1)*2}}),a.extend(a.fn,{zscore:function(b,c){return(b-this.mean())/this.stdev(c)},ztest:function(d,e,f){var g=b.abs(this.zscore(d,f));return e===1?a.normal.cdf(-g,0,1):a.normal.cdf(-g,0,1)*2
}}),a.extend({tscore:function(){var e=c.call(arguments);return e.length===4?(e[0]-e[1])/(e[2]/b.sqrt(e[3])):(e[0]-a.mean(e[1]))/(a.stdev(e[1],!0)/b.sqrt(e[1].length))},ttest:function(){var f=c.call(arguments),g;return f.length===5?(g=b.abs(a.tscore(f[0],f[1],f[2],f[3])),f[4]===1?a.studentt.cdf(-g,f[3]-1):a.studentt.cdf(-g,f[3]-1)*2):d(f[1])?(g=b.abs(f[0]),f[2]==1?a.studentt.cdf(-g,f[1]-1):a.studentt.cdf(-g,f[1]-1)*2):(g=b.abs(a.tscore(f[0],f[1])),f[2]==1?a.studentt.cdf(-g,f[1].length-1):a.studentt.cdf(-g,f[1].length-1)*2)}}),a.extend(a.fn,{tscore:function(c){return(c-this.mean())/(this.stdev(!0)/b.sqrt(this.cols()))},ttest:function(d,e){return e===1?1-a.studentt.cdf(b.abs(this.tscore(d)),this.cols()-1):a.studentt.cdf(-b.abs(this.tscore(d)),this.cols()-1)*2}}),a.extend({anovafscore:function(){var e=c.call(arguments),f,g,h,i,j,k,l,m;if(e.length===1){j=new Array(e[0].length);for(l=0;l<e[0].length;l++)j[l]=e[0][l];e=j}if(e.length===2)return a.variance(e[0])/a.variance(e[1]);g=new Array;for(l=0;l<e.length;l++)g=g.concat(e[l]);h=a.mean(g),f=0;for(l=0;l<e.length;l++)f+=e[l].length*b.pow(a.mean(e[l])-h,2);f/=e.length-1,k=0;for(l=0;l<e.length;l++){i=a.mean(e[l]);for(m=0;m<e[l].length;m++)k+=b.pow(e[l][m]-i,2)}return k/=g.length-e.length,f/k},anovaftest:function(){var e=c.call(arguments),f,g,h,i;if(d(e[0]))return 1-a.centralF.cdf(e[0],e[1],e[2]);anovafscore=a.anovafscore(e),f=e.length-1,h=0;for(i=0;i<e.length;i++)h+=e[i].length;return g=h-f-1,1-a.centralF.cdf(anovafscore,f,g)},ftest:function(c,d,e){return 1-a.centralF.cdf(c,d,e)}}),a.extend(a.fn,{anovafscore:function(){return a.anovafscore(this.toArray())},anovaftes:function(){var c=0,d;for(d=0;d<this.length;d++)c+=this[d].length;return a.ftest(this.anovafscore(),this.length-1,c-this.length)}}),a.extend({normalci:function(){var e=c.call(arguments),f=new Array(2),g;return e.length===4?g=b.abs(a.normal.inv(e[1]/2,0,1)*e[2]/b.sqrt(e[3])):g=b.abs(a.normal.inv(e[1]/2,0,1)*a.stdev(e[2])/b.sqrt(e[2].length)),f[0]=e[0]-g,f[1]=e[0]+g,f},tci:function(){var e=c.call(arguments),f=new Array(2),g;return e.length===4?g=b.abs(a.studentt.inv(e[1]/2,e[3]-1)*e[2]/b.sqrt(e[3])):g=b.abs(a.studentt.inv(e[1]/2,e[2].length-1)*a.stdev(e[2],!0)/b.sqrt(e[2].length)),f[0]=e[0]-g,f[1]=e[0]+g,f},significant:function(b,c){return b<c}}),a.extend(a.fn,{normalci:function(c,d){return a.normalci(c,d,this.toArray())},tci:function(c,d){return a.tci(c,d,this.toArray())}})}(this.jStat,Math);/**
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
     * Compare as string
     */
    u.compareAsString_medbook = function(a, b) {
        var valA = new String(a).valueOf().toLowerCase();
        var valB = new String(b).valueOf().toLowerCase();

        // if exactly one is "null"
        if ((valA == 'null') && (valB != 'null')) {
            return 1;
        } else if ((valA != 'null') && (valB == 'null')) {
            return -1;
        }

        // if exactly one is "exclude"
        if ((valA == 'exclude') && (valB != 'exclude')) {
            return 1;
        } else if ((valA != 'exclude') && (valB == 'exclude')) {
            return -1;
        }

        // if exactly one is "small cell"
        if ((valA == 'small cell') && (valB != 'small cell')) {
            return -1;
        } else if ((valA != 'small cell') && (valB == 'small cell')) {
            return 1;
        }

        // if at least one is "exclude"
        switch (valA + valB) {
            case "excludenull":
                return -1;
                break;
            case "nullexclude":
                return 1;
                break;
            default:
                return valA.localeCompare(valB);
        }

        // return valA.localeCompare(valB);
    };

    /*
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
                        comparator = utils.compareAsString_medbook;
                    } else if (allowedValues == 'expression') {
                        comparator = utils.compareAsNumeric;
                    } else if (allowedValues == 'date') {
                        comparator = utils.compareAsDate;
                    } else {
                        comparator = utils.compareAsString_medbook;
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
                        if (eventId === "patientSamples"){
                          missingData[id] = "other patient";
                        } else {
                          missingData[id] = value;
                        }
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
        // TODO dead code?
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

(function (mdl) {"use strict";
  mdl.transposeClinicalData = function (input, recordKey) {
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
  mdl.getClinicalData = function (url, OD_eventAlbum) {
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
  mdl.getMutationData = function (url, OD_eventAlbum) {
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
          'id': gene + '_mut',
          'name': null,
          'displayName': null,
          'description': null,
          'datatype': 'mutation data',
          'allowedValues': 'categoric'
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
  mdl.getExpressionData = function (url, OD_eventAlbum) {
    mdl.getGeneBySampleData(url, OD_eventAlbum, '_mRNA', 'expression data', 'numeric');
  };

  mdl.getViperData = function (url, OD_eventAlbum) {
    mdl.getGeneBySampleData(url, OD_eventAlbum, '_viper', 'viper data', 'numeric');
  };

  /**
   * where the event is a gene
   */
  mdl.getGeneBySampleData = function (url, OD_eventAlbum, geneSuffix, datatype, allowedValues) {
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
  mdl.loadEventBySampleData = function (OD_eventAlbum, feature, suffix, datatype, allowedValues, data) {
    var eventObj = OD_eventAlbum.addEvent({
      'geneSuffix': suffix,
      'id': feature + suffix,
      'name': datatype + ' for ' + feature,
      'displayName': feature,
      'description': null,
      'datatype': datatype,
      'allowedValues': allowedValues
    }, data);
    return eventObj;
  };

  /**
   *Add clinical data from mongo collection.
   * @param {Object} collection
   * @param {Object} OD_eventAlbum
   */
  mdl.mongoClinicalData = function (collection, OD_eventAlbum) {
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
  mdl.genericMatrixData = function (matrixString, dataName, OD_eventAlbum, allowedValues) {
    var parsedMatrix = d3.tsv.parse(matrixString);
    // var allowedValues = "numeric";
    var sanitizedDataName = dataName.replace(/ /, "_");

    var returnFeatures = [];

    _.each(parsedMatrix, function (row) {
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
  mdl.mongoViperSignaturesData = function (collection, OD_eventAlbum) {
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
   * add patient labels to samples
   */
  mdl.patientSamplesData = function (patientSamplesArray, OD_eventAlbum) {
    var eventName = "patientSamples";
    var dataBySample = {};

    _.each(patientSamplesArray, function (patientSampleObj, index) {
      var patient_label = patientSampleObj["patient_label"];
      var sample_labels = patientSampleObj["sample_labels"];
      _.each(sample_labels, function (sampleId, indexj) {
        dataBySample[sampleId] = patient_label;
      });
    });

    var eventObj = OD_eventAlbum.getEvent(eventName);
    // add event if DNE
    if (eventObj == null) {
      eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventName, '', 'clinical data', 'categoric', []);
    }
    eventObj.data.setData(dataBySample);
  };

  /**
   *Add expression data from mongo collection.
   * @param {Object} collection
   * @param {Object} OD_eventAlbum
   */
  mdl.mongoExpressionData = function (collection, OD_eventAlbum) {
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
  mdl.mongoMutationData = function (collection, OD_eventAlbum) {
    // iter over doc ... each doc is a mutation call
    var allowed_values = "mutation type";

    var impactScoresMap = OD_eventAlbum.ordinalScoring[allowed_values];

    var mutByGene = {};
    // for (var i = 0, length = collection.length; i < length; i++) {
    _.each(collection, function (element) {
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
  mdl.mongoMutationData_impact = function (collection, OD_eventAlbum) {
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
  mdl.mongoExpressionData_old = function (collection, OD_eventAlbum) {
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
  mdl.getSignature = function (url, OD_eventAlbum) {
    var response = utils.getResponse(url);
    var parsedResponse = d3.tsv.parse(response);

    var eventId = url.split('/').pop();

    var eventObj = OD_eventAlbum.getEvent(eventId);

    // add event if DNE
    if (eventObj == null) {
      OD_eventAlbum.addEvent({
        'id': eventId,
        'name': null,
        'displayName': null,
        'description': null,
        'datatype': 'expression signature',
        'allowedValues': 'numeric',
        'weightedGeneVector': parsedResponse
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
  mdl.loadSignatureObj = function (obj, OD_eventAlbum) {
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
      var version = fields.pop();
      var rootName = fields.join('_v');
      var suffix = "";
      if (utils.endsWith(rootName, '_kinase_viper')) {
        datatype = 'kinase target activity';
        // suffix = '_kinase_viper';
        // eventId = rootName.replace(suffix,"");
      } else if (utils.endsWith(rootName, '_tf_viper') || utils.beginsWith(rootName, 'tf_viper_')) {
        datatype = 'tf target activity';
        // suffix = '_tf_viper';
        // eventId = rootName.replace(suffix,"");
      } else if (utils.endsWith(rootName, '_mvl_drug_sensitivity') || utils.beginsWith(rootName, 'mvl_drug_sensitivity_')) {
        datatype = 'mvl drug sensitivity';
        // suffix = '_mvl_drug_sensitivity';
        // eventId = rootName.replace(suffix,"");
      } else {
        datatype = 'expression signature';
      }

      var eventObj = OD_eventAlbum.getEvent(eventId);

      // add event if DNE
      if (eventObj == null) {
        eventObj = mdl.loadEventBySampleData(OD_eventAlbum, eventId, suffix, datatype, 'numeric', {});
        eventObj.metadata.setWeightVector([], "expression data");
      }

      eventObj.data.setData(eventData);
    }

  };

  // TODO qqq
  mdl.loadSignatureWeightsObj = function (obj, OD_eventAlbum) {
    // fields: name and version and signature... signature is an obj keyed by gene {'weight':weight,'pval':pval}
    var eventId = obj['name'] + '_v' + obj['version'];

    var datatype;
    if (utils.endsWith(obj['name'], '_kinase_viper')) {
      datatype = 'kinase target activity';
    } else if (utils.endsWith(obj['name'], '_tf_viper') || utils.beginsWith(obj['name'], 'tf_viper_')) {
      datatype = 'tf target activity';
    } else if (utils.endsWith(obj['name'], '_mvl_drug_sensitivity') || utils.beginsWith(obj['name'], 'mvl_drug_sensitivity_')) {
      datatype = 'mvl drug sensitivity';
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
        'gene': gene,
        'weight': data['weight']
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
  mdl.loadBmegSignatureWeightsAsSamples = function (obj, OD_eventAlbum) {
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
        "gene": feature,
        "weight": weightiness
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
  mdl.loadPivotScores = function (collection, OD_eventAlbum) {
    // get a dictionary of {key,val}
    var pivotScores = [];
    for (var i = 0; i < collection.length; i++) {
      var doc = collection[i];

      // get correlated event info and score
      var eventId1 = doc['name_1'];
      var version1 = doc['version_1'];
      var datatype1 = doc['datatype_1'];

      var getEventId = function (name, datatype, version) {
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
        'eventId1': eventId1,
        'eventId2': eventId2,
        'score': score
      });

    }
    OD_eventAlbum.setPivotScores_array(null, pivotScores);
  };

})(medbookDataLoader);
/**
 * chrisw@soe.ucsc.edu
 * OCT 2014
 * observation_deck_3.js
 *
 * Development of this data visualization began with the example at: <http://bl.ocks.org/tjdecke/5558084> .
 *
 * This time, avoid using jQuery prototype.
 *
 * requirements:
 * 1) jQuery <https://jquery.com/> ... for jQuery-contextMenu
 * 2) D3.js <http://d3js.org/>
 * 3) jQuery-contextMenu <https://medialize.github.io/jQuery-contextMenu/>
 * 4) jStat
 * 5) utils.js
 * 6) OD_eventData.js
 * 7) typeahead <https://github.com/twitter/typeahead.js>
 */

// expose utils to meteor
u = utils;

// expose observation_deck to meteor
observation_deck = ( typeof observation_deck === "undefined") ? {} : observation_deck;
(function(od) {"use strict";

	var cookieName = "od_config";

	/**
	 *  Build an observation deck!
	 */
	od.buildObservationDeck = function(containerDivElem, config) {
		// console.log('buildObservationDeck');
		config = getConfiguration(config);

		config['containerDivId'] = containerDivElem.id;

		drawMatrix(containerDivElem, config);

		// set up dialog box
		setupDialogBox("hugoSearch", "HUGO symbol", config["geneQueryUrl"], function(selectedString) {
			var settings = getCookieVal();
			var key = "hugoSearch";
			if (!utils.hasOwnProperty(settings, key)) {
				settings[key] = [];
			}
			settings[key].push(selectedString);
			settings[key] = utils.eliminateDuplicates(settings[key]);
			setCookieVal(settings);

			console.log("settings", settings);

			var sessionGeneList = getSession("geneList");
			console.log("sessionGeneList", sessionGeneList);

			console.log("button clicked in hugoSearch", selectedString);
		});
		setupDialogBox("sigSearch", "signature name", config["sigQueryUrl"], function(selectedString) {
			var settings = getCookieVal();
			var key = "sigSearch";
			if (!utils.hasOwnProperty(settings, key)) {
				settings[key] = [];
			}
			settings[key].push(selectedString);
			settings[key] = utils.eliminateDuplicates(settings[key]);
			setCookieVal(settings);
			console.log("button clicked in sigSearch", selectedString);
		});

		// set up context menu should follow matrix drawing
		setupContextMenus(config);

		return config;
	};

	/**
	 *
	 */
	var getConfiguration = function(config) {
		// look for od_config in cookies
		var querySettings = getCookieVal();
		config['querySettings'] = querySettings;

		var od_eventAlbum = null;

		// pivot_event is passed to OD from medbook-workbench via session property
		// session property may be null
		if (('pivot_event' in config) && (config['pivot_event'] != null)) {
			var pivotSettings = config['pivot_event'];
			config['querySettings']['pivot_event'] = pivotSettings;
		} else {
			// delete config['querySettings']['pivot_event'];
		}

		// detect pre-configured event album obj
		if ('eventAlbum' in config) {
			od_eventAlbum = config['eventAlbum'];
		} else {
			od_eventAlbum = new eventData.OD_eventAlbum();
			config['eventAlbum'] = od_eventAlbum;
		}

		// data to be retrieved via url
		var dataLoader = medbookDataLoader;

		if ('pivotScores' in config) {
			var pivotScoresData = config['pivotScores'];
			if ('object' in pivotScoresData) {
				dataLoader.loadPivotScores(pivotScoresData['object'], od_eventAlbum);
			}
		}
		delete config['pivotScores'];

		if ('dataUrl' in config) {
			var dataUrlConfig = config['dataUrl'];
			if ('clinicalUrl' in dataUrlConfig) {
				dataLoader.getClinicalData(dataUrlConfig['clinicalUrl'], od_eventAlbum);
			}
			if ('expressionUrl' in dataUrlConfig) {
				dataLoader.getExpressionData(dataUrlConfig['expressionUrl'], od_eventAlbum);
			}
			if ('mutationUrl' in dataUrlConfig) {
				dataLoader.getMutationData(dataUrlConfig['mutationUrl'], od_eventAlbum);
			}
		}

		// data passed in as mongo documents
		if ('mongoData' in config) {
			var mongoData = config['mongoData'];
			if ('clinical' in mongoData) {
				dataLoader.mongoClinicalData(mongoData['clinical'], od_eventAlbum);
			}
			if ('expression' in mongoData) {
				dataLoader.mongoExpressionData(mongoData['expression'], od_eventAlbum);
			}
			if ('mutation' in mongoData) {
				dataLoader.mongoMutationData(mongoData['mutation'], od_eventAlbum);
			}
		}
		// delete the data after it has been used to load events
		delete config['mongoData'];

		// signature data
		if ('signature' in config) {
			var signatureConfig = config['signature'];
			if ('expression' in signatureConfig) {
				var expressionSigConfig = signatureConfig['expression'];
				if ('file' in expressionSigConfig) {
					var fileNames = expressionSigConfig['file'];
					for (var i = 0; i < fileNames.length; i++) {
						var fileName = fileNames[i];
						console.log(fileName);
						dataLoader.getSignature(fileName, od_eventAlbum);
					}
				}
				if ('object' in expressionSigConfig) {
					var objects = expressionSigConfig['object'];
					for (var i = 0; i < objects.length; i++) {
						var object = objects[i];
						dataLoader.loadSignatureObj(object, od_eventAlbum);
					}
				}
			}
		}
		// delete the data after it has been used to load events
		delete config['signature'];

		// signature gene weights data
		if ('signature_index' in config) {
			var sigIdxConfig = config['signature_index'];
			if ('expression' in sigIdxConfig) {
				var expressionSigIdxConfig = sigIdxConfig['expression'];
				if ('object' in expressionSigIdxConfig) {
					var objects = expressionSigIdxConfig['object'];
					for (var i = 0; i < objects.length; i++) {
						var object = objects[i];
						dataLoader.loadSignatureWeightsObj(object, od_eventAlbum);
					}
				}
			}
		}
		// delete the data after it has been used to load events
		delete config['signature_index'];

		// 'bmegSigServiceData' : bmegSigServiceData
		if ('bmegSigServiceData' in config) {
			console.log('bmegSigServiceData in config');
			dataLoader.loadBmegSignatureWeightsAsSamples(config['bmegSigServiceData'], od_eventAlbum);
		}
		// delete the data after it has been used to load events
		delete config['bmegSigServiceData'];

		// specify the samples that should be displayed
		if ('displayedSamples' in config) {
			var displayedSamples = config['displayedSamples'];
		} else {
			config['displayedSamples'] = [];
		}

		var groupedEvents = config['eventAlbum'].getEventIdsByType();
		var eventList = [];
		for (var datatype in groupedEvents) {
			var datatypeEventList = groupedEvents[datatype];
			// console.log('datatype', datatype, 'has', datatypeEventList.length, 'events', '<-- getConfiguration');
		}

		if ('deleteEvents' in config) {
			var deleteEvents = config['deleteEvents'];
			for (var i = 0; i < deleteEvents.length; i++) {
				config['eventAlbum'].deleteEvent(deleteEvents[i]);
			}
		}

		return config;
	};

	/**
	 * Get event IDs that are in the cookies.  Currently only gets the expression events.
	 * Exposed to meteor via "od."
	 */
	od.getCookieEvents = function() {
		var eventList = [];
		var cookieObj = getCookieVal();
		if (( typeof cookieObj === 'undefined') || (cookieObj == null) || ((utils.getKeys(cookieObj)).length == 0)) {
			return [];
		}
		if (utils.hasOwnProperty(cookieObj, 'pivot_sort')) {
			eventList.push(cookieObj['pivot_sort']['pivot_event']);
		}
		if (utils.hasOwnProperty(cookieObj, 'colSort')) {
			var steps = cookieObj['colSort']['steps'];
			for (var i = 0; i < steps.length; i++) {
				var step = steps[i];
				eventList.push(step['name']);
			}
		}
		if (utils.hasOwnProperty(cookieObj, 'hide_null_samples_event')) {
			eventList = eventList.concat(cookieObj['hide_null_samples_event']);
		}

		var geneList = [];
		for (var i = 0; i < eventList.length; i++) {
			var eventId = eventList[i];
			if (utils.endsWith(eventId, '_mRNA')) {
				geneList.push(eventId.replace('_mRNA', ''));
			}
		}

		if (utils.hasOwnProperty(cookieObj, "hugoSearch")) {
			var hugoIds = cookieObj["hugoSearch"];
			geneList = geneList.concat(hugoIds);
		}

		return utils.eliminateDuplicates(geneList);
	};

	/**
	 * Set up a dialog box with typeahead functionality
	 * config is an obj of {title,placeholder,bloohoundObj}
	 */
	var createSuggestBoxDialog = function(suggestBoxConfig) {
		var title = suggestBoxConfig["title"];
		var placeholder = suggestBoxConfig["placeholderText"];

		var divElem = utils.createDivElement(title);
		divElem.style['display'] = 'none';

		var inputElem = document.createElement("input");
		divElem.appendChild(inputElem);
		utils.setElemAttributes(inputElem, {
			// "class" : "typeahead",
			"type" : "text",
			"placeholder" : placeholder
		});

		var buttonElem = document.createElement("button");
		divElem.appendChild(buttonElem);
		utils.setElemAttributes(buttonElem, {
			"type" : "button",
			"style" : "float: right"
		});
		buttonElem.innerHTML = "select";
		buttonElem.onclick = function() {
			suggestBoxConfig["selectionCallback"](inputElem.value);
			$(divElem).dialog("close");
		};

		for (var i = 0; i < 9; i++) {
			divElem.appendChild(document.createElement("br"));
		}

		$(inputElem).typeahead({
			"hint" : true,
			"highlight" : true,
			"minLength" : 2
		}, {
			"name" : "dataset",
			"source" : suggestBoxConfig["bloodhoundObj"],
			"limit" : 99
		});

		return divElem;
	};

	/**
	 * Set up a dialog boxes
	 */
	var setupDialogBox = function(elementTitle, placeholderText, queryUrl, selectionCallback) {
		var queryVar = "%VALUE";
		var bodyElem = document.getElementsByTagName('body')[0];
		var dialogBox = createSuggestBoxDialog({
			"title" : elementTitle,
			"placeholderText" : placeholderText,
			"bloodhoundObj" : new Bloodhound({
				"datumTokenizer" : Bloodhound.tokenizers.whitespace,
				"queryTokenizer" : Bloodhound.tokenizers.whitespace,
				// "local" : ["abc", "def", "ghi", "abd", "abr"],
				"remote" : {
					// "url" : "https://su2c-dev.ucsc.edu/wb/genes?q=%QUERY",
					// "url" : "/genes?q=%VALUE",
					"url" : queryUrl + queryVar,
					"wildcard" : queryVar,
					"transform" : function(response) {
						console.log("response", response);
						var items = response["items"];
						var list = [];
						for (var i = 0, length = items.length; i < length; i++) {
							var item = items[i];
							var id = item["id"];
							list.push(id);
						}
						list = utils.eliminateDuplicates(list);
						return list;
					}
				}
			}),
			"selectionCallback" : selectionCallback
		});
		bodyElem.appendChild(dialogBox);
	};

	/*
	 *
	 */
	var setupContextMenus = function(config) {
		// config['querySettings']
		// first destroy old contextMenus
		var selectors = ['.typeLabel', '.colLabel', '.rowLabel', '.mrna_exp', '.categoric', ".signature"];
		for (var i = 0; i < selectors.length; i++) {
			var selector = selectors[i];
			$.contextMenu('destroy', selector);
		}
		setupTypeLabelContextMenu(config);
		setupColLabelContextMenu(config);
		setupRowLabelContextMenu(config);
		setupCategoricCellContextMenu(config);
		setupExpressionCellContextMenu(config);
		setupSignatureCellContextMenu(config);
	};

	/**
	 * delete cookie and reset config
	 */
	var resetConfig = function(config) {
		var persistentKeys = ['dataUrl', 'eventAlbum', 'mongoData', 'containerDivId', 'signature', "rowTitleCallback", "columnTitleCallback"];
		utils.deleteCookie('od_config');
		var keys = utils.getKeys(config);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (utils.isObjInArray(persistentKeys, key)) {
				continue;
			} else {
				delete config[key];
			}
		}
		console.log('remaining config', config);
	};

	/**
	 * Set the obs-deck cookie. Value is an object that is stringified for the cookie.
	 */
	var setCookieVal = function(value) {
		utils.setCookie(cookieName, JSON.stringify(value));
	};

	/**
	 * Get the obs-deck cookie. Return empty object if no cookie.s
	 */
	var getCookieVal = function() {
		var cookie = utils.getCookie(cookieName);
		var parsedCookie = utils.parseJson(cookie) || {};
		return parsedCookie;
	};

	/**
	 * If session object exists, set the key/value pair.
	 */
	var setSession = function(key, value) {
		if ( typeof Session !== "undefined") {
			if (key) {
				Session.set(key, value);
			}
			return true;
		} else {
			console.log("no session object for setting");
			return false;
		}
	};

	/**
	 * Get session value if exists.  Else, return null.
	 */
	var getSession = function(key) {
		var value = null;
		if ( typeof Session !== "undefined") {
			if (key) {
				value = Session.get(key);
			}
		} else {
			console.log("no session object for getting");
		}
		return value;
	};

	/*
	 * If session object exists, delete the specified keys.
	 *
	 */
	var resetSession = function(keys) {
		if ( typeof Session !== "undefined") {
			for (var i = 0, length = keys.length; i < length; i++) {
				delete Session.keys[keys[i]];
			}
			return true;
		} else {
			console.log("no session object to reset");
			return false;
		}
	};

	/**
	 * Clear session and cookies and then rebuild the obs-deck
	 */
	var resetObsDeck = function(config) {
		console.log("!! RESETTING OBS DECK !!");
		resetConfig(config);
		resetSession(['pivotSettings', "subscriptionPaging", "geneList"]);
		setSession("pivotSettings", "");

		var containerDivElem = document.getElementById(config['containerDivId']);
		var newConfig = od.buildObservationDeck(containerDivElem, config);
	};

	var getDevMode = function() {
		var useDevMode = (utils.getQueryStringParameterByName('dev_mode').toLowerCase() === 'true');
		return useDevMode;
	};

	/**
	 * Set session var for datatype paging
	 */
	var setDatatypePaging = function(datatype, headOrTail, upOrDown) {
		var sessionVarName = "subscriptionPaging";
		var sessionVal = getSession(sessionVarName);

		// default setting
		if (!sessionVal) {
			sessionVal = {};
		}

		if (!utils.hasOwnProperty(sessionVal, datatype)) {
			sessionVal[datatype] = {
				"head" : 0,
				"tail" : 0
			};
		}

		if (!headOrTail || !upOrDown) {
			return sessionVal[datatype];
		}

		// new setting
		var newVal;
		if (upOrDown === "down") {
			newVal = --sessionVal[datatype][headOrTail];
		} else if (upOrDown === "up") {
			newVal = ++sessionVal[datatype][headOrTail];
		} else if (upOrDown === "0") {
			newVal = sessionVal[datatype][headOrTail] = 0;
		}

		// validate
		if (newVal < 0) {
			sessionVal[datatype][headOrTail] = 0;
		}

		setSession(sessionVarName, sessionVal);
	};

	/**
	 *add a sorting step object for the eventId to "rowSort" or "colSort". Defaults to "colSort".
	 */
	var addSortStepToCookies = function(eventId, config, sortType, noReverse) {
		// may be rowSort or colSort, default to colSort
		var sortType = sortType || "colSort";
		var noReverse = noReverse || false;

		var sortSteps;
		var querySettings = config['querySettings'];
		if ( sortType in querySettings) {
			sortSteps = new eventData.sortingSteps(querySettings[sortType]["steps"]);
		} else {
			sortSteps = new eventData.sortingSteps();
		}
		sortSteps.addStep(eventId, noReverse);
		querySettings[sortType] = sortSteps;

		setCookieVal(querySettings);
	};

	/**
	 * Create a context menu item for use with jQuery-contextMenu.
	 */
	var createResetContextMenuItem = function(config) {
		var obj = {
			name : "reset",
			icon : null,
			disabled : false,
			callback : function(key, opt) {
				resetObsDeck(config);
			}
		};
		return obj;
	};

	var setupColLabelContextMenu = function(config) {

		/**
		 * callback for medbook-workbench
		 */
		// var titleCallback = function(sampleId) {
		// var url = '/wb/patient/' + sampleId;
		// window.open(url, "_self");
		// };

		var titleCallback = config['columnTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".colLabel",
			trigger : 'left',
			build : function($trigger, contextmenuEvent) {
				// https://medialize.github.io/jQuery-contextMenu/demo/dynamic-create.html
				// this callback is executed every time the menu is to be shown
				// its results are destroyed every time the menu is hidden
				// e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
				// console.log('dynamic on-demand contextMenu');
				// console.log('$trigger', $trigger);
				// console.log('contextmenuEvent', contextmenuEvent);
				var sampleId = ($trigger)[0].getAttribute('sample');
				return {
					// callback : function(key, options) {
					// // default callback used when no callback specified for item
					// console.log('default callback');
					// var elem = this[0];
					// console.log('key:', key);
					// console.log('options:', options);
					// console.log('elem', elem);
					// console.log('eventId:', elem.getAttribute('eventId'));
					// console.log('elemClass:', elem.getAttribute("class"));
					// console.log('elemId:', elem.getAttribute("id"));
					// console.log("href:", window.location.href);
					// console.log("host:", window.location.host);
					// console.log("pathname:", window.location.pathname);
					// console.log("search:", window.location.search);
					// },
					items : {
						"title" : {
							name : sampleId,
							icon : null,
							disabled : (titleCallback == null),
							callback : function(key, opt) {
								if (titleCallback == null) {
									console.log('default titleCallback for column', sampleId);
								} else {
									titleCallback(sampleId, config);
								}
							}
						},
						'reset' : createResetContextMenuItem(config)
					}
				};
			}
		});
	};

	// typeLabel
	var setupTypeLabelContextMenu = function(config) {
		var titleCallback = config['datatypeTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".typeLabel",
			trigger : 'left',
			callback : function(key, options) {
				// default callback
				var elem = this[0];
				console.log('elem', elem);
			},
			build : function($trigger, contextmenuEvent) {
				// var datatype = ($trigger[0].getAttribute('datatype'));
				var eventId = ($trigger[0].getAttribute('eventId'));
				var isPlus = utils.endsWith(eventId, "(+)");

				var fields = eventId.split("(");
				fields.pop();
				var sanitizedEventId = fields.join("(");
				var datatype = sanitizedEventId;

				var items = {
					'title' : {
						name : function() {
							return datatype;
						},
						icon : null,
						disabled : false,
						callback : function(key, opt) {
							if (titleCallback == null) {
								console.log('datatype', datatype);
								console.log('default titleCallback for datatype', datatype);
							} else {
								titleCallback(eventId, config);
							}
						}
					},
					"sep1" : "---------",
					'toggle_datatype_visibility' : {
						'name' : function() {
							return 'toggle visibility';
						},
						'icon' : null,
						'disabled' : null,
						'callback' : function(key, opt) {
							if ('hiddenDatatypes' in config['querySettings']) {
							} else {
								config['querySettings']['hiddenDatatypes'] = [];
							}

							var hiddenDatatypes = config['querySettings']['hiddenDatatypes'];
							if (utils.isObjInArray(hiddenDatatypes, datatype)) {
								utils.removeA(hiddenDatatypes, datatype);
							} else {
								hiddenDatatypes.push(datatype);
							}

							setCookieVal(config['querySettings']);

							// trigger redrawing
							var containerDivElem = document.getElementById(config['containerDivId']);
							od.buildObservationDeck(containerDivElem, config);
						}
					},
					"hide_null_samples_datatype" : {
						name : "(un)hide null samples in this datatype",
						icon : null,
						disabled : false,
						callback : function(key, opt) {
							var querySettings = config['querySettings'];
							if (!utils.hasOwnProperty(querySettings, "hide_null_samples_datatype")) {
								querySettings['hide_null_samples_datatype'] = datatype;
								delete querySettings["hide_null_samples_event"];
							} else {
								if (querySettings['hide_null_samples_datatype'] === datatype) {
									delete querySettings['hide_null_samples_datatype'];
								} else {
									querySettings['hide_null_samples_datatype'] = datatype;
									delete querySettings["hide_null_samples_event"];
								}
							}

							setCookieVal(querySettings);

							var containerDivElem = document.getElementById(config['containerDivId']);
							od.buildObservationDeck(containerDivElem, config);
							return;
						}
					},
					"test_fold" : {
						"name" : "dev_features",
						"disabled" : function() {
							return (!getDevMode());
						},
						"items" : {
							"hugoSearch" : {
								"name" : "HUGO search",
								"icon" : null,
								"disabled" : false,
								"callback" : function(key, opt) {
									var dialogElem = document.getElementById('hugoSearch');
									dialogElem.style["display"] = "block";

									$(dialogElem).dialog({
										'title' : 'HUGO search',
										"buttons" : {
											"close" : function() {
												$(this).dialog("close");
											}
										}
									});
								}
							},
							"sigSearch" : {
								"name" : "signature search",
								"icon" : null,
								"disabled" : false,
								"callback" : function(key, opt) {
									var dialogElem = document.getElementById('sigSearch');
									dialogElem.style["display"] = "block";

									$(dialogElem).dialog({
										'title' : 'signature search',
										"buttons" : {
											"close" : function() {
												$(this).dialog("close");
											}
										}
									});
								}
							}
						}
					},
					"reset" : createResetContextMenuItem(config)
				};
				return {
					'items' : items
				};
			}
		});
	};

	/**
	 *context menu uses http://medialize.github.io/jQuery-contextMenu
	 */
	var setupRowLabelContextMenu = function(config) {

		/**
		 * This is a callback for medbook-workbench.
		 */

		// example of titleCallback function
		// var titleCallback = function(eventId) {
		// var eventObj = config['eventAlbum'].getEvent(eventId);
		// var datatype = eventObj.metadata['datatype'];
		// if (datatype === 'expression data') {
		// // mRNA url: /wb/gene/<gene name>
		// var gene = eventId.replace('_mRNA', '');
		// var url = '/wb/gene/' + gene;
		// window.open(url, "_self");
		// } else if (datatype === 'clinical data') {
		// // clinical url: /wb/clinical/<name>
		// var feature = eventId;
		// var url = '/wb/clinical/' + feature;
		// window.open(url, "_self");
		// }
		// };

		var titleCallback = config['rowTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".rowLabel",
			trigger : 'left',
			callback : function(key, options) {
				// default callback
				var elem = this[0];
				console.log('elem', elem);
			},
			build : function($trigger, contextmenuEvent) {
				// var eventId = ($trigger)[0].innerHTML.split('<')[0];
				var eventId = ($trigger)[0].getAttribute('eventId');
				var eventObj = config['eventAlbum'].getEvent(eventId);
				var datatype = eventObj.metadata['datatype'];
				var scoredDatatype = eventObj.metadata.scoredDatatype;
				var allowedValues = eventObj.metadata.allowedValues;

				var displayName = eventObj.metadata.displayName;

				var pivotable = (eventObj.metadata.weightedGeneVector.length);

				var pivotable_dataypes = ["clinical data", "expression data", 'expression signature', 'kinase target activity', "tf target activity"];

				var items = {
					'title' : {
						name : displayName,
						icon : null,
						disabled : function() {
							var result = true;
							if ((titleCallback != null) && (utils.isObjInArray(["mutation call", 'expression data', 'clinical data', 'expression signature', 'kinase target activity', "tf target activity"], datatype))) {
								result = false;
							}

							return result;
						},
						callback : function(key, opt) {
							if (titleCallback == null) {
								console.log('default titleCallback for row', eventId);
							} else {
								titleCallback(eventId, config);
							}
						}
					},
					"sep1" : "---------",
					'set_pivot' : {
						'name' : function() {
							return 'set as pivot';
						},
						'icon' : null,
						'disabled' : function(key, opt) {
							pivotable = false;
							if (utils.isObjInArray(pivotable_dataypes, datatype)) {
								pivotable = true;
							}

							if (pivotable) {
								// if (true) {
								return false;
							} else {
								return true;
							}
						},
						'callback' : function(key, opt) {
							// in workbench, selecting this should do the following:
							// 1- set pivot cookie
							// 2- meteor should pick up the cookie/session and retrieve the pivot data
							// 3- meteor should force obs-deck to rebuild, setting pivot data

							// meteor session
							if ( typeof Session !== 'undefined') {
								// if (false) {
								var mName = eventId;
								var mVersion = '';
								// if (utils.isObjInArray(['expression signature', 'kinase target activity', "tf target activity"], datatype)) {
								if (utils.isObjInArray(['expression signature', 'kinase target activity', "tf target activity"], datatype)) {
									var names = mName.split('_v');
									mVersion = names.pop();
									mName = names.join('_v');
									datatype = 'signature';
								} else if (datatype === "expression data") {
									mName = eventObj.metadata.displayName;
									mVersion = 1;
									datatype = "expression";
								} else if (datatype === "clinical data") {
									mName = eventId;
									mVersion = 1;
									datatype = "clinical";
								}

								var pivotSessionSettings = {
									'name' : mName,
									'datatype' : datatype,
									'version' : mVersion
								};

								var querySettings = config['querySettings'];
								querySettings['pivot_event'] = {
									'id' : eventId,
									'datatype' : datatype
								};

								var datatypes = [];
								if ('pivot_sort_list' in querySettings) {
									datatypes = querySettings['pivot_sort_list'];
								}
								// TODO hard coded !!!
								datatypes.push('expression data');
								querySettings['pivot_sort_list'] = utils.eliminateDuplicates(datatypes);

								setCookieVal(querySettings);

								addSortStepToCookies(eventId, config, "colSort", true);

								console.log('writing pivotSettings to Session', pivotSessionSettings);
								setSession('pivotSettings', pivotSessionSettings);
							} else {
								console.log('no Session object. Writing pivotSettings to querySettings.');

								var querySettings = config['querySettings'];
								querySettings['pivot_event'] = {
									'id' : eventId,
									'datatype' : datatype
								};
								setCookieVal(querySettings);

								addSortStepToCookies(eventId, config, "colSort", true);

								// trigger redrawing
								var containerDivElem = document.getElementById(config['containerDivId']);
								od.buildObservationDeck(containerDivElem, config);
							}
						}
					},
					'sort_fold' : {
						'name' : 'sort...',
						'items' : {
							"sort" : {
								name : "samples by this event",
								icon : null,
								disabled : false,
								callback : function(key, opt) {
									addSortStepToCookies(eventId, config, "colSort", false);

									var containerDivElem = document.getElementById(config['containerDivId']);
									od.buildObservationDeck(containerDivElem, config);
								}
							}
						}
					},
					'hide_fold' : {
						'name' : 'hide...',
						'items' : {
							"hide_null_samples_event" : {
								name : "(un)hide null samples in this event",
								icon : null,
								disabled : false,
								callback : function(key, opt) {
									var querySettings = config['querySettings'];

									if (!utils.hasOwnProperty(querySettings, "hide_null_samples_datatype")) {
										if (querySettings['hide_null_samples_datatype'] === datatype) {
											delete querySettings['hide_null_samples_datatype'];
										}
									}

									if (!utils.hasOwnProperty(querySettings, "hide_null_samples_event")) {
										querySettings["hide_null_samples_event"] = eventId;
										delete querySettings['hide_null_samples_datatype'];
									} else if (querySettings["hide_null_samples_event"] === eventId) {
										delete querySettings["hide_null_samples_event"];
									} else {
										querySettings["hide_null_samples_event"] = eventId;
										delete querySettings['hide_null_samples_datatype'];
									}

									setCookieVal(querySettings);

									var containerDivElem = document.getElementById(config['containerDivId']);
									od.buildObservationDeck(containerDivElem, config);
									return;
								}
							},
							"hide_event" : {
								name : "this event",
								icon : null,
								disabled : false,
								callback : function(key, opt) {
									var querySettings = config['querySettings'];
									var hiddenEvents = querySettings['hiddenEvents'] || [];
									hiddenEvents.push(eventId);
									querySettings['hiddenEvents'] = utils.eliminateDuplicates(hiddenEvents);

									setCookieVal(querySettings);

									var containerDivElem = document.getElementById(config['containerDivId']);
									od.buildObservationDeck(containerDivElem, config);
								}
							}
						}
					},
					"pathway_context" : {
						"name" : "view pathway context",
						"icon" : null,
						"disabled" : function() {
							var pathway_context_viewable = ["expression data", "mutation call", "kinase target activity", "tf target activity"];
							var disabled = (_.contains(pathway_context_viewable, datatype)) ? false : true;
							return disabled;
						},
						"callback" : function(key, opt) {
							var geneSymbol = eventId.replace(/_mRNA$/, "").replace(/_mutation$/, "").replace(/_kinase_viper_v.+$/, "").replace(/_tf_viper_v.+$/, "");
							var url = "/PatientCare/geneReport/" + geneSymbol;
							console.log("linking out to", url, "for pathway context");
							window.open(url, "_patientCare");
						}
					},
					"pathway_genes" : {
						"name" : "see expression of targets",
						"icon" : null,
						"disabled" : function() {
							var pathway_context_viewable = ["kinase target activity", "tf target activity"];
							var disabled = (_.contains(pathway_context_viewable, datatype)) ? false : true;
							return disabled;
						},
						"callback" : function(key, opt) {
							var sigName = eventId.replace(/_v\d+$/, "");
							console.log("add gene set for", sigName);
							// add gene set for signature
							var geneSetSelectElem = document.getElementById("geneset");
							if (_.isUndefined(geneSetSelectElem) || _.isNull(geneSetSelectElem)) {
								console.log("no geneSetSelectElem with ID", "geneset");
								return;
							}
							var geneSetOptions = geneSetSelectElem.getElementsByTagName("option");
							var foundMatch = false;
							_.each(geneSetOptions, function(option, index) {
								var text = option.innerHTML;
								text = text.replace(/ \(\d+\)$/, "").replace(/_targets_viper/, "_viper");
								// var val = option.getAttribute("value");
								// var geneList = val.split(/,/);
								if (text === sigName) {
									option.selected = true;
									$(geneSetSelectElem).trigger("change");
									foundMatch = true;
								}
							});
							if (!foundMatch) {
								alert("No gene set found for " + sigName + ".");
							}
						}
					},
					"test_fold" : {
						"name" : "dev_features",
						"disabled" : function() {
							return (!getDevMode());
						},
						"items" : {
							"add_events_for_gene" : {
								"name" : "add events for gene",
								"icon" : null,
								"disabled" : function() {
									return (datatype === "clinical data");
								},
								"callback" : function(key, opt) {
									var gene = eventId.split(/_/)[0];
									setSession("eventSearch", gene);
									// TODO search for and add events related to this gene
									console.log("search for and add events related to this gene", gene);
								}
							}
						}
					},
					"sep2" : "---------",
					"reset" : createResetContextMenuItem(config)
				};
				return {
					'items' : items
				};
			}
		});
	};

	/**
	 * context menu uses http://medialize.github.io/jQuery-contextMenu
	 */
	var setupExpressionCellContextMenu = function(config) {
		var sampleLinkoutCallback = config['columnTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".mrna_exp",
			trigger : 'left',
			callback : function(key, options) {
				// default callback
				var elem = this[0];
			},
			build : function($trigger, contextmenuEvent) {
				var triggerElem = ($trigger)[0];
				var eventId = triggerElem.getAttribute('eventId');
				var sampleId = triggerElem.getAttribute('sampleId');
				var items = {
					'title' : {
						name : eventId + ' for ' + sampleId,
						icon : null,
						disabled : true
					},
					"sep1" : "---------",
					"sample_link_out" : {
						"name" : "go to details for " + sampleId,
						"icon" : null,
						"disabled" : false,
						"callback" : function(key, opt) {
							sampleLinkoutCallback(sampleId, config);
						}
					},
					'rescaling_fold' : {
						'name' : 'normalize coloring...',
						'items' : {
							"samplewise median rescaling" : {
								name : "over each column",
								icon : null,
								disabled : false,
								callback : function(key, opt) {
									// settings for rescaling
									var querySettings = config['querySettings'];
									querySettings['expression rescaling'] = {
										'method' : 'samplewiseMedianRescaling'
									};

									setCookieVal(querySettings);

									var containerDivElem = document.getElementById(config['containerDivId']);
									od.buildObservationDeck(containerDivElem, config);
								}
							},
							"eventwise median rescaling" : {
								name : "over each row",
								icon : null,
								disabled : false,
								callback : function(key, opt) {
									// settings for rescaling
									var querySettings = config['querySettings'];
									querySettings['expression rescaling'] = {
										'method' : 'eventwiseMedianRescaling'
									};

									setCookieVal(querySettings);

									var containerDivElem = document.getElementById(config['containerDivId']);
									od.buildObservationDeck(containerDivElem, config);
								}
								// },
								// "eventwise z-score rescaling" : {
								// name : "by event z-score",
								// icon : null,
								// disabled : false,
								// callback : function(key, opt) {
								// // settings for rescaling
								// var querySettings = config['querySettings'];
								// querySettings['expression rescaling'] = {
								// 'method' : 'zScoreExpressionRescaling'
								// };
								//
								// setCookieVal(querySettings);
								//
								// var containerDivElem = document.getElementById(config['containerDivId']);
								// od.buildObservationDeck(containerDivElem, config);
								// }
							}
						}
					},
					"sep2" : "---------",
					"reset" : createResetContextMenuItem(config)
				};
				return {
					'items' : items
				};
			}
		});
	};

	/**
	 * context menu uses http://medialize.github.io/jQuery-contextMenu
	 */
	var setupCategoricCellContextMenu = function(config) {
		var sampleLinkoutCallback = config['columnTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".categoric",
			trigger : 'left',
			callback : function(key, options) {
				// default callback
				var elem = this[0];
			},
			build : function($trigger, contextmenuEvent) {
				var triggerElem = ($trigger)[0];
				var eventId = triggerElem.getAttribute('eventId');
				var sampleId = triggerElem.getAttribute('sampleId');
				var items = {
					'title' : {
						name : eventId + ' for ' + sampleId,
						icon : null,
						disabled : true
					},
					"sep1" : "---------",
					"sample_link_out" : {
						"name" : "go to details for " + sampleId,
						"icon" : null,
						"disabled" : false,
						"callback" : function(key, opt) {
							sampleLinkoutCallback(sampleId, config);
						}
					},
					"yulia expression rescaling" : {
						name : "rescale mRNA values using this category",
						icon : null,
						disabled : false,
						callback : function(key, opt) {
							var cellElem = this[0];
							var childrenElems = cellElem.children;
							var eventId = cellElem.getAttribute('eventId');
							var sampleId = cellElem.getAttribute('sampleId');
							var val = cellElem.getAttribute('val');

							console.log('key:', key, 'eventId:', eventId, 'val:', val);
							console.log("href", window.location.href);
							console.log("host", window.location.host);
							console.log("pathname", window.location.pathname);
							console.log("search", window.location.search);

							// settings for rescaling
							var querySettings = config['querySettings'];
							querySettings['expression rescaling'] = {
								'method' : 'yulia_rescaling',
								'eventId' : eventId,
								'val' : val
							};

							setCookieVal(querySettings);

							var containerDivElem = document.getElementById(config['containerDivId']);
							od.buildObservationDeck(containerDivElem, config);
						}
					},
					"sep2" : "---------",
					"reset" : createResetContextMenuItem(config)

				};
				return {
					'items' : items
				};
			}
		});
	};

	/**
	 * context menu uses http://medialize.github.io/jQuery-contextMenu
	 */
	var setupSignatureCellContextMenu = function(config) {
		var sampleLinkoutCallback = config['columnTitleCallback'];

		$.contextMenu({
			// selector : ".axis",
			selector : ".signature",
			trigger : 'left',
			callback : function(key, options) {
				// default callback
				var elem = this[0];
			},
			build : function($trigger, contextmenuEvent) {
				var triggerElem = ($trigger)[0];
				var eventId = triggerElem.getAttribute('eventId');
				var sampleId = triggerElem.getAttribute('sampleId');
				var items = {
					'title' : {
						name : eventId + ' for ' + sampleId,
						icon : null,
						disabled : true
					},
					"sep1" : "---------",
					"sample_link_out" : {
						"name" : "go to details for " + sampleId,
						"icon" : null,
						"disabled" : false,
						"callback" : function(key, opt) {
							sampleLinkoutCallback(sampleId, config);
						}
					},
					"sep2s" : "---------",
					"reset" : createResetContextMenuItem(config)

				};
				return {
					'items' : items
				};
			}
		});
	};

	/**
	 * Draw the matrix in the containing div.
	 * Requires:
	 *      D3js
	 *      OD_eventData.js
	 * @param {Object} containingElem
	 * @param {Object} config
	 */
	var drawMatrix = function(containingDiv, config) {
		console.log("*** BEGIN DRAWMATRIX ***");

		var thisElement = utils.removeChildElems(containingDiv);

		// get eventList
		var eventAlbum = config['eventAlbum'];
		// eventAlbum.removeEmptyEvents(0.8);
		eventAlbum.fillInMissingSamples(null);

		eventAlbum.fillInDatatypeLabelEvents("black");

		var groupedEvents = eventAlbum.getEventIdsByType();
		var rowLabelColorMapper = d3.scale.category10();
		var eventList = [];
		for (var datatype in groupedEvents) {
			rowLabelColorMapper(datatype);
			var datatypeEventList = groupedEvents[datatype];
			// console.log('datatype', datatype, 'has', datatypeEventList.length, 'events', '<-- drawMatrix');
			eventList = eventList.concat(datatypeEventList);
		}

		var querySettings = config['querySettings'];

		var getRescalingData = function(OD_eventAlbum, querySettingsObj) {
			var groupedEvents = OD_eventAlbum.getEventIdsByType();
			var rescalingData = null;

			if (utils.hasOwnProperty(groupedEvents, 'expression data') && utils.hasOwnProperty(querySettingsObj, 'expression rescaling')) {
				var rescalingSettings = querySettingsObj['expression rescaling'];
				if (rescalingSettings['method'] === 'yulia_rescaling') {
					rescalingData = OD_eventAlbum.yuliaExpressionRescaling(rescalingSettings['eventId'], rescalingSettings['val']);
				} else if (rescalingSettings['method'] === 'eventwiseMedianRescaling') {
					// rescalingData = eventAlbum.zScoreExpressionRescaling();
					rescalingData = OD_eventAlbum.eventwiseMedianRescaling(["expression data"]);
				} else if (rescalingSettings['method'] === 'zScoreExpressionRescaling') {
					rescalingData = OD_eventAlbum.zScoreExpressionRescaling();
				} else if (rescalingSettings['method'] === 'samplewiseMedianRescaling') {
					rescalingData = OD_eventAlbum.samplewiseMedianRescaling();
				} else {
					// no rescaling
				}
			} else if (utils.hasOwnProperty(groupedEvents, 'expression data')) {
				rescalingData = OD_eventAlbum.eventwiseMedianRescaling(["expression data"]);
			} else {
				console.log('no expression data rescaling');
			}

			// rescalingData = eventAlbum.betweenMeansExpressionRescaling('Small Cell v Adeno', 'Adeno', 'Small Cell');
			return rescalingData;
		};

		var rescalingData = getRescalingData(eventAlbum, querySettings);

		var setColorMappers = function(rescalingData, eventAlbum) {

			/**
			 * premap some colors
			 */
			var premapColors = function(d3ScaleColormapper, colorSet) {
				var colorSets = {
					"exclude" : {
						"exclude" : "gray"
					},
					"small cell" : {
						"exclude" : "gray",
						"small cell" : "blue",
						"not small cell" : "red"
					},
					"resistance" : {
						"exclude" : "gray",
						"naive" : "green",
						"resistant" : "red"
					},
					"pos_neg" : {
						"exclude" : "gray",
						"pos" : "red",
						"neg" : "blue"
					},
					"yes_no" : {
						"exclude" : "gray",
						"yes" : "green",
						"no" : "red"
					},
					"adeno" : {
						"exclude" : "gray",
						"adeno" : "red",
						"not adeno" : "blue"
					},
					//Response Evaluation Criteria in Solid Tumors (RECIST)
					"recist" : {
						// Complete Response
						"cr" : "green",
						// Partial Response
						"pr" : "chartreuse",
						// Stable Disease
						"sd" : "orange",
						// Progression of Disease
						"pd" : "red"
					}
				};

				// d3.scale.category10().range()
				var colorNames = {
					"blue" : "#1f77b4",
					"orange" : "#ff7f0e",
					"green" : "#2ca02c",
					"red" : "#d62728",
					"purple" : "#9467bd",
					"brown" : "#8c564b",
					"pink" : "#e377c2",
					"gray" : "#7f7f7f",
					"chartreuse" : "#bcbd22",
					"cyan" : "#17becf"
				};

				var mapping = (_.isUndefined(colorSets[colorSet])) ? {} : colorSets[colorSet];

				// map named colors to color code
				var inputMappings = {};
				if (!_.isUndefined(mapping)) {
					_.each(mapping, function(value, key) {
						var color = (_.isUndefined(colorNames[value])) ? value : colorNames[value];
						inputMappings[key] = color;
					});
				}

				//  assign pre-mapped colors
				var range = _.values(inputMappings);
				var domain = _.keys(inputMappings);

				// fill in remaining color range
				_.each(_.values(colorNames), function(color) {
					if (!_.contains(range, color)) {
						range.push(color);
					}
				});

				// assign domain and range to color mapper
				d3ScaleColormapper.domain(domain);
				d3ScaleColormapper.range(range);

				// console.log("range", d3ScaleColormapper.range());
				// console.log("domain", d3ScaleColormapper.domain());
			};

			var expressionColorMapper = utils.centeredRgbaColorMapper(false);
			if (rescalingData != null) {
				var minExpVal = rescalingData['minVal'];
				var maxExpVal = rescalingData['maxVal'];
				expressionColorMapper = utils.centeredRgbaColorMapper(false, 0, minExpVal, maxExpVal);
			}

			var ordinalColorMappers = {};
			var ordinalTypes = utils.getKeys(eventAlbum.ordinalScoring);
			for (var i = 0, length = ordinalTypes.length; i < length; i++) {
				var allowedVals = ordinalTypes[i];
				var scoreVals = utils.getValues(eventAlbum.ordinalScoring[allowedVals]);
				var colorMapper = utils.centeredRgbaColorMapper(false, 0, jStat.min(scoreVals), jStat.max(scoreVals));
				ordinalColorMappers[allowedVals] = colorMapper;
			}

			// assign color mappers
			var colorMappers = {};
			for (var i = 0; i < eventList.length; i++) {
				var eventId = eventList[i];
				var allowedValues = eventAlbum.getEvent(eventId).metadata.allowedValues;
				if (allowedValues == 'categoric') {
					var colorMapper = d3.scale.category10();
					// TODO set a premapping color scheme dependent upon event
					// colorSets ["exclude", "small cell", "resistance", "pos_neg", "yes_no", "adeno"]
					var eventId_lc = eventId.toLowerCase();
					var colorSet;
					if (_.contains(["smallcell", "small_cell", "trichotomy"], eventId_lc)) {
						colorSet = "small cell";
					} else if (_.contains(["enzalutamide", "abiraterone", "docetaxel"], eventId_lc)) {
						colorSet = "resistance";
					} else if (_.contains(["mutations", "primary hr"], eventId_lc)) {
						colorSet = "yes_no";
					} else if (_.contains(["pten-ihc", "ar-fish"], eventId_lc)) {
						colorSet = "pos_neg";
					} else {
						colorSet = "exclude";
					}
					premapColors(colorMapper, colorSet);
					colorMappers[eventId] = colorMapper;
				} else if (allowedValues == 'numeric') {
					// 0-centered color mapper
					var eventObj = eventAlbum.getEvent(eventId);
					var minAllowedVal = eventObj.metadata.minAllowedVal;
					var maxAllowedVal = eventObj.metadata.maxAllowedVal;
					if (( typeof minAllowedVal != "undefined") && ( typeof maxAllowedVal != "undefined")) {
						// value range given in metadata
						colorMappers[eventId] = utils.centeredRgbaColorMapper(false, 0, minAllowedVal, maxAllowedVal);
					} else {
						// value range computed from event data
						var vals = eventAlbum.getEvent(eventId).data.getValues();
						var numbers = [];
						for (var j = 0; j < vals.length; j++) {
							var val = vals[j];
							if (utils.isNumerical(val)) {
								numbers.push(val);
							}
						}
						var minVal = Math.min.apply(null, numbers);
						var maxVal = Math.max.apply(null, numbers);
						colorMappers[eventId] = utils.centeredRgbaColorMapper(false, 0, minVal, maxVal);
					}
				} else if (allowedValues == 'expression') {
					// shared expression color mapper
					colorMappers[eventId] = expressionColorMapper;
				} else if (eventAlbum.ordinalScoring.hasOwnProperty(allowedValues)) {
					// ordinal data
					colorMappers[eventId] = ordinalColorMappers[allowedValues];
				} else {
					var colorMapper = d3.scale.category10();
					colorMappers[eventId] = colorMapper;
				}
			}
			return colorMappers;
		};

		var colorMappers = setColorMappers(rescalingData, eventAlbum);

		var getColSortSteps = function(querySettings) {
			var colSortSteps = null;
			if ("colSort" in querySettings) {
				colSortSteps = new eventData.sortingSteps(querySettings["colSort"]["steps"]);
				for (var i = colSortSteps.getSteps().length - 1; i >= 0; i--) {
					var step = colSortSteps.steps[i];
					var name = step['name'];
					if (eventAlbum.getEvent(name)) {
						// event exists
					} else {
						// ignore events that are not found
						console.log(name, 'not found, skip sorting by that event');
						colSortSteps.removeStep(name);
					}
				}
			}

			// column sort by pivot row -- old way
			if (utils.hasOwnProperty(querySettings, 'pivot_sort')) {
				var pivotSortSettings = querySettings['pivot_sort'];
				var pivotEvent = pivotSortSettings['pivot_event'];
				if (colSortSteps == null) {
					colSortSteps = new eventData.sortingSteps();
				}
				if (eventAlbum.getEvent(pivotEvent)) {
					// event exists
					colSortSteps.addStep(pivotEvent, true);
				}
			}
			return colSortSteps;
		};

		var colSortSteps = getColSortSteps(querySettings);
		console.log("colSortSteps", colSortSteps);

		var getRowSortSteps = function(querySettings) {
			var rowSortSteps = null;
			if ('rowSort' in querySettings) {
				rowSortSteps = new eventData.sortingSteps(querySettings["rowSort"]["steps"]);
				for (var i = rowSortSteps.getSteps().length - 1; i >= 0; i--) {
					var step = rowSortSteps.steps[i];
					var name = step['name'];
					if (eventAlbum.getEvent(name)) {
						// event exists
					} else {
						// ignore events that are not found
						console.log(name, 'not found, skip sorting by that event');
						rowSortSteps.removeStep(name);
					}
				}
			}
			return rowSortSteps;
		};

		var rowSortSteps = getRowSortSteps(querySettings);

		var getColNames = function(querySettings, eventAlbum, colSortSteps) {
			// get column names
			var colNames = null;

			colNames = eventAlbum.multisortSamples(colSortSteps);

			// find samples to hide
			var samplesToHide = [];
			if ('hide_null_samples_event' in querySettings) {
				var hide_null_samples_event = querySettings['hide_null_samples_event'];
				console.log("hide_null_samples_event", hide_null_samples_event);

				try {
					var hideNullsEventObj = eventAlbum.getEvent(hide_null_samples_event);
					var nullSamples = hideNullsEventObj.data.getNullSamples();
					samplesToHide = samplesToHide.concat(nullSamples);
				} catch(error) {
					console.log('ERROR while getting samples to hide in eventID:', hide_null_samples_event, 'error.message ->', error.message);
				} finally {
					console.log('samplesToHide', samplesToHide);
				}
			} else if ("hide_null_samples_datatype" in querySettings) {
				var hide_null_samples_datatype = querySettings["hide_null_samples_datatype"];
				console.log("hide_null_samples_datatype", hide_null_samples_datatype);

				samplesToHide = eventAlbum.getDatatypeNullSamples(hide_null_samples_datatype);
			}

			// always hide clinical null samples
			var clinicalNullSamples = eventAlbum.getDatatypeNullSamples("clinical data");
			samplesToHide = samplesToHide.concat(clinicalNullSamples);

			samplesToHide = utils.eliminateDuplicates(samplesToHide);

			// colNames after hiding null samples
			var newColNames = [];
			for (var ci = 0; ci < colNames.length; ci++) {
				var colName = colNames[ci];
				if (utils.isObjInArray(config['displayedSamples'], colName)) {
					// make sure displayedSamples are shown
					newColNames.push(colName);
				} else if (utils.isObjInArray(samplesToHide, colName)) {
					// samples have been specified for hiding
					continue;
				} else if (config['displayedSamples'].length == 0) {
					// no displayedSamples specified, so show them all by default
					newColNames.push(colName);
				}
			}
			colNames = newColNames;
			// console.log('colNames:' + colNames);

			return colNames;
		};

		var colNames = getColNames(querySettings, eventAlbum, colSortSteps);

		// map colNames to numbers
		var colNameMapping = new Object();
		for (var i in colNames) {
			var name = colNames[i];
			colNameMapping[name] = i;
		}

		// get row names and map to numbers

		var getRowNames = function(querySettings, eventAlbum, colSortSteps, rowSortSteps) {

			var rowNames = eventAlbum.multisortEvents(rowSortSteps, colSortSteps);
			// console.log("rowNames", rowNames);

			// groupedPivotSorts ... uses pivot scoring on server side
			// TODO what about events that are in the album, but not in the pivot data?
			if (utils.hasOwnProperty(querySettings, 'pivot_sort_list')) {
				console.log('querySettings has a pivot_sort_list of datatypes', querySettings['pivot_sort_list']);
				rowNames = [];
				var pivotSortedRowNames = [];
				var pEventId = querySettings['pivot_event']['id'];
				var pEventObj = eventAlbum.getEvent(pEventId);
				var groupedPivotSorts = eventAlbum.getGroupedPivotSorts(pEventId);

				for (var datatype in groupedPivotSorts) {
					// section header rows
					var eventIds;
					if (datatype === "datatype label") {
						// skip the "datatype label" datatype
						eventIds = [];
					} else {
						// events
						eventIds = groupedPivotSorts[datatype];
						// datatype label for correlated events
						eventIds.unshift(datatype + "(+)");
						// datatype label for anti-correlated events
						eventIds.push(datatype + "(-)");
					}
					pivotSortedRowNames = pivotSortedRowNames.concat(eventIds);
					// console.log(datatype, eventIds);
				}
				rowNames = pivotSortedRowNames.concat(rowNames);
				rowNames = utils.eliminateDuplicates(rowNames);
			}

			// console.log("rowNames", rowNames);

			// hide rows of datatype, preserving relative ordering
			var hiddenDatatypes = querySettings['hiddenDatatypes'] || [];
			var hiddenEvents = querySettings['hiddenEvents'] || [];
			var shownNames = [];

			var albumEventIds = eventAlbum.getAllEventIds();
			// console.log("albumEventIds", albumEventIds);

			for (var i = 0; i < rowNames.length; i++) {
				var rowName = rowNames[i];
				if (!utils.isObjInArray(albumEventIds, rowName)) {
					// event doesn't exist ... skip
					continue;
				}
				var datatype = eventAlbum.getEvent(rowName).metadata.datatype;
				if ((utils.isObjInArray(hiddenDatatypes, datatype)) || (utils.isObjInArray(hiddenEvents, rowName))) {
					continue;
				}
				shownNames.push(rowName);
			}
			// console.log("shownNames", shownNames);
			rowNames = shownNames;

			// move pivot event to top of matrix (1st row)
			var pivotEventId = null;
			if (querySettings['pivot_event'] != null) {
				pivotEventId = querySettings['pivot_event']['id'];
				console.log('moving pivot event to top:', pivotEventId);
				rowNames.unshift(pivotEventId);
				rowNames = utils.eliminateDuplicates(rowNames);
			}

			// confirm events in rowNames exist in eventAlbum
			var confirmedEvents = [];
			for (var i = 0, length = rowNames.length; i < length; i++) {
				var eventId = rowNames[i];
				var eventObj = eventAlbum.getEvent(eventId);
				if (eventObj) {
					// eventObj exists
					confirmedEvents.push(eventId);
				} else {
					console.log('eventObj not found for', eventId);
				}
			}
			rowNames = confirmedEvents;

			return rowNames;
		};

		var rowNames = getRowNames(querySettings, eventAlbum, colSortSteps, rowSortSteps);
		// console.log("rowNames", rowNames);

		// bring pivot event to top the top
		var pivotEventId = null;
		if (querySettings['pivot_event'] != null) {
			pivotEventId = querySettings['pivot_event']['id'];
			console.log('moving pivot event to top:', pivotEventId);
			rowNames.unshift(pivotEventId);
			rowNames = utils.eliminateDuplicates(rowNames);
		}

		/**
		 * For each submatrix, find first index, last index, and row count.
		 */
		var getBoundariesBetweenDatatypes = function() {
			var pivotEventObj = eventAlbum.getEvent(pivotEventId);
			if (_.isUndefined(pivotEventObj)) {
				return {};
			}
			var pivotEventDatatype = pivotEventObj.metadata.datatype;
			// pivot results for clinical data give top 5 only due to ANOVA score
			// var pageSize = (pivotEventDatatype === "clinical data") ? 5 : 10;
			var pageSize = 5;

			var rowNames_copy = rowNames.slice();
			rowNames_copy.reverse();
			var boundaries = {};
			_.each(rowNames_copy, function(rowName, index) {
				var eventObj = eventAlbum.getEvent(rowName);
				var datatype = eventObj.metadata.datatype;
				if (datatype === "datatype label" && datatype !== "mutation call") {
					return;
				}
				if (_.isUndefined(boundaries[datatype])) {
					boundaries[datatype] = {
						"first" : index,
						"last" : index
					};
				} else {
					if (boundaries[datatype]["last"] == index - 1) {
						boundaries[datatype]["last"] = index;
					}
				}
				boundaries[datatype]["count"] = boundaries[datatype]["last"] - boundaries[datatype]["first"] + 1;
			});

			// get non-correlator gene lists
			var sessionGeneList = getSession("geneList") || [];
			var cohort_tab_genelist_widget = getSession("cohort_tab_genelist_widget") || [];
			sessionGeneList = sessionGeneList.concat(cohort_tab_genelist_widget);

			var rowNames_copy = rowNames.slice();
			rowNames_copy.reverse();
			var taggedEvents = {};
			_.each(_.keys(boundaries), function(datatype) {
				if (datatype !== "clinical data" && datatype !== "mutation call") {
					var data = boundaries[datatype];
					var datatypeNames = [];
					var suffix = eventAlbum.datatypeSuffixMapping[datatype];
					for (var i = data["first"]; i < data["last"] + 1; i++) {
						var rowName = rowNames_copy[i];
						var geneName = rowName.replace(suffix, "");
						if (! _.contains(sessionGeneList, geneName)) {
							datatypeNames.push(rowName);
						}
					}
					var corrEvents = datatypeNames.reverse();
					_.each(corrEvents.slice(0, pageSize), function(posEvent) {
						taggedEvents[posEvent] = "+";
					});
					_.each(corrEvents.slice(pageSize), function(negEvent) {
						taggedEvents[negEvent] = "-";
					});
				}
			});

			return taggedEvents;
		};

		// TODO determine boundaries between pos/neg-correlated events
		if (!_.isNull(pivotEventId)) {
			var taggedEvents = getBoundariesBetweenDatatypes();
		}

		// assign row numbers to row names
		var rowNameMapping = new Object();
		for (var i in rowNames) {
			var name = rowNames[i];
			rowNameMapping[name] = i;
		}

		// setup margins

		var longestColumnName = utils.lengthOfLongestString(colNames);
		var longestRowName = utils.lengthOfLongestString(rowNames);

		console.log('longestRowName', longestRowName);

		var margin = {
			// "top" : ((longestColumnName > 3) ? (9 * longestColumnName) : 30),
			"top" : 10,
			"right" : 0,
			"bottom" : 0,
			"left" : ((longestRowName > 1) ? (8 * (longestRowName + 1)) : 15)
		};

		// document.documentElement.clientWidth
		var fullWidth = document.documentElement.clientWidth;
		var width = fullWidth - margin.left - margin.right;
		var denom = (colNames.length > rowNames.length) ? colNames.length : rowNames.length;
		var gridSize = Math.floor(width / denom);

		var minGridSize = 13;
		// gridSize = (gridSize > minGridSize) ? gridSize : minGridSize;
		// console.log('gridSize', gridSize, 'margin', (margin));

		if (gridSize <= minGridSize) {
			gridSize = minGridSize;
			fullWidth = (gridSize * denom) + margin.left + margin.right;
		}

		gridSize = minGridSize;
		console.log('gridSize', gridSize, 'margin', (margin));

		// document.documentElement.clientHeight
		var fullHeight = (margin.top + margin.bottom) + (gridSize * rowNames.length);
		var height = fullHeight - margin.top - margin.bottom;

		// SVG canvas
		var svg = d3.select(thisElement).append("svg").attr({
			// "width" : fullWidth + 0,
			"width" : fullWidth,
			"height" : fullHeight,
			// "viewBox" : "42 0 " + (fullWidth) + " " + (fullHeight),
			"viewBox" : "0 0 " + (fullWidth) + " " + (fullHeight),
			"perserveAspectRatio" : "xMinYMin meet"
		}).append("g").attr({
			"transform" : "translate(" + margin.left + "," + margin.top + ")"
		});

		var primerSvgRectElem = utils.createSvgRectElement(0, 0, 0, 0, fullWidth, fullHeight, {
			"fill" : "white",
			"class" : "primer"
		});

		// draw the matrix on a white background b/c color gradient varies alpha values
		svg.append('rect').attr({
			"x" : 0,
			"y" : 0,
			"rx" : 0,
			"ry" : 0,
			// "width" : width,
			// "height" : height,
			"width" : gridSize * colNames.length,
			"height" : gridSize * rowNames.length,
			"fill" : "white",
			"class" : "primer"
		});

		// row labels
		try {
			var translateX = -6;
			var translateY = gridSize / 1.5;
			var rowLabels = svg.selectAll(".rowLabel").data(rowNames).enter().append("text").text(function(d) {
				var eventObj = eventAlbum.getEvent(d);
				var displayName = eventObj.metadata.displayName;
				var datatype = eventObj.metadata.datatype;
				if (datatype === "datatype label") {
					displayName = displayName.toUpperCase();
				}

				// TODO hack to shorten signature names to remove type
				if (datatype === "mvl drug sensitivity") {
					displayName = d.replace("_mvl_drug_sensitivity", "");
				} else if (datatype === "tf target activity") {
					displayName = d.replace("_tf_viper", "");
				} else if (datatype === "kinase target activity") {
					displayName = d.replace("_kinase_viper", "");
				}

				// remove version number
				displayName = displayName.replace(/_v\d+$/, "");

				if (!_.isUndefined(taggedEvents)) {
					var tag = taggedEvents[d];
					if (!_.isUndefined(tag)) {
						displayName = displayName + " " + tag;
					}
				}

				return displayName;
			}).attr({
				"x" : 0,
				"y" : function(d, i) {
					return i * gridSize;
				},
				"transform" : "translate(" + translateX + ", " + translateY + ")",
				"class" : function(d, i) {
					var eventObj = eventAlbum.getEvent(d);
					var datatype = eventObj.metadata.datatype;
					var s;
					if (datatype === "datatype label") {
						s = "typeLabel mono axis unselectable";
					} else {
						s = "rowLabel mono axis unselectable";
						if (d === pivotEventId) {
							s = s + " bold italic";
							// s = s + " pivotEvent";
						}
					}

					// underline genes added via geneset control
					// underline to indicate user-selected events
					if (pivotEventId != null) {
						var underlineableDatatypes = ["expression data", "mutation call"];
						if (_.contains(underlineableDatatypes, datatype)) {
							var suffix = eventAlbum.datatypeSuffixMapping[datatype];
							var regex = new RegExp(suffix + "$");
							var geneName = d.replace(regex, "");
							var geneSetControl = config["geneSetControl"] || [];
							if (utils.isObjInArray(geneSetControl, geneName)) {
								s = s + " underline";
							}
						}
					}

					return s;
				},
				'eventId' : function(d, i) {
					return d;
				},
				'datatype' : function(d, i) {
					var eventObj = eventAlbum.getEvent(d);
					var datatype = eventObj.metadata.datatype;
					return datatype;
				}
			}).style("text-anchor", "end").style("fill", function(d) {
				var eventObj = eventAlbum.getEvent(d);
				var datatype = eventObj.metadata.datatype;
				if (datatype === "datatype label") {
					return "black";
				} else {
					return rowLabelColorMapper(datatype);
				}
			});
			// rowLabels.on("click", config["rowClickback"]);
			// rowLabels.on("contextmenu", config["rowRightClickback"]);

			// map event to pivot score
			var pivotScoresMap;
			if (pivotEventId != null) {
				pivotScoresMap = {};
				var pivotSortedEvents = eventAlbum.getPivotSortedEvents(pivotEventId);
				for (var i = 0, lengthi = pivotSortedEvents.length; i < lengthi; i++) {
					var pivotObj = pivotSortedEvents[i];
					var key = pivotObj["key"];
					var val = pivotObj["val"];
					pivotScoresMap[key] = val;
					// console.log(pivotEventId, key);
				}
			}

			rowLabels.append("title").text(function(d, i) {
				var eventObj = eventAlbum.getEvent(d);
				var datatype = eventObj.metadata.datatype;
				var allowedValues = eventObj.metadata.allowedValues;
				var s = 'event: ' + d + '\ndatatype: ' + datatype;

				if ((allowedValues === 'numeric') && (rescalingData != null) && (utils.hasOwnProperty(rescalingData, 'stats')) && ( typeof rescalingData['stats'][d] !== 'undefined')) {
					s = s + '\nraw data stats: ' + utils.prettyJson(rescalingData['stats'][d]);
				}

				if ( typeof pivotScoresMap !== "undefined") {
					var val = pivotScoresMap[d];
					if ( typeof val === "undefined") {
						// try _mRNA suffix
						var key = d.replace(/_mRNA$/, "");
						val = pivotScoresMap[key];
					}

					if ( typeof val !== "undefined") {
						s = s + "\npivot score: " + val;
					}
				}

				return s;
			});

		} catch(err) {
			console.log("ERROR drawing row labels:", err.name);
			console.log("--", err.message);
			resetObsDeck(config);
		} finally {
			console.log("finished drawing row labels");
		}

		// col labels
		try {
			var rotationDegrees = -90;
			translateX = Math.floor(gridSize / 5);
			translateY = -1 * Math.floor(gridSize / 3);
			var colLabels = svg.selectAll(".colLabel").data(colNames).enter().append("text").text(function(d) {
				return d;
			}).attr({
				"y" : function(d, i) {
					return (i + 1) * gridSize;
				},
				"x" : 0,
				"transform" : "rotate(" + rotationDegrees + ") translate(" + translateX + ", " + translateY + ")",
				"class" : function(d, i) {
					return "colLabel mono axis unselectable hidden";
				},
				"sample" : function(d, i) {
					return d;
				}
			}).style("text-anchor", "start");
			// colLabels.on("click", config["columnClickback"]);
			// colLabels.on("contextmenu", config["columnRightClickback"]);
			colLabels.append("title").text(function(d) {
				var s = 'sample: ' + d;
				return s;
			});

		} catch(err) {
			console.log("ERROR drawing column labels:", err.name);
			console.log("--", err.message);
		} finally {
			console.log("finished drawing column labels");
		}

		// SVG elements for heatmap cells
		var dataList = eventAlbum.getAllDataAsList();
		var showDataList = [];
		for (var i = 0; i < dataList.length; i++) {
			var dataListObj = dataList[i];
			var eventId = dataListObj['eventId'];
			if (!utils.isObjInArray(rowNames, eventId)) {
				continue;
			} else {
				showDataList.push(dataListObj);
			}
		}

		/**
		 * Create an SVG group element icon to put in the matrix cell.
		 * @param {Object} x
		 * @param {Object} y
		 * @param {Object} rx
		 * @param {Object} ry
		 * @param {Object} width
		 * @param {Object} height
		 * @param {Object} attributes
		 */
		var createMutTypeSvg = function(x, y, rx, ry, width, height, attributes) {
			var iconGroup = document.createElementNS(utils.svgNamespaceUri, "g");
			utils.setElemAttributes(iconGroup, {
				"class" : "mutTypeIconGroup"
			});

			var types = attributes["val"];
			// types.push("complex");

			// background of cell
			attributes["fill"] = "lightgrey";
			iconGroup.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));
			delete attributes["stroke-width"];

			if ((utils.isObjInArray(types, "ins")) || (utils.isObjInArray(types, "complex"))) {
				attributes["fill"] = "red";
				var topHalfIcon = utils.createSvgRectElement(x, y, rx, ry, width, height / 2, attributes);
				iconGroup.appendChild(topHalfIcon);
			}
			if ((utils.isObjInArray(types, "del")) || (utils.isObjInArray(types, "complex"))) {
				attributes["fill"] = "blue";
				var bottomHalfIcon = utils.createSvgRectElement(x, y + height / 2, rx, ry, width, height / 2, attributes);
				iconGroup.appendChild(bottomHalfIcon);
			}
			if ((utils.isObjInArray(types, "snp")) || (utils.isObjInArray(types, "complex"))) {
				attributes["fill"] = "green";
				var centeredCircleIcon = utils.createSvgCircleElement(x + width / 2, y + height / 2, height / 4, attributes);
				iconGroup.appendChild(centeredCircleIcon);
			}
			return iconGroup;
		};

		try {
			var heatMap = svg.selectAll(".cell").data(showDataList).enter().append(function(d, i) {
				var getUpArrowPointsList = function(x, y, width, height) {
					var pointsList = [];
					pointsList.push(((width / 2) + x) + "," + (0 + y));
					pointsList.push((width + x) + "," + (height + y));
					pointsList.push((0 + x) + "," + (height + y));
					return pointsList;
				};

				var getDownArrowPointsList = function(x, y, width, height) {
					var pointsList = [];
					pointsList.push(((width / 2) + x) + "," + (height + y));
					pointsList.push((width + x) + "," + (0 + y));
					pointsList.push((0 + x) + "," + (0 + y));
					return pointsList;
				};

				var group = document.createElementNS(utils.svgNamespaceUri, "g");
				group.setAttributeNS(null, "class", "cell unselectable");

				var colName = d['id'];
				if (! utils.hasOwnProperty(colNameMapping, colName)) {
					return group;
				}

				var strokeWidth = 2;
				var x = (colNameMapping[d['id']] * gridSize);
				var y = (rowNameMapping[d['eventId']] * gridSize);
				var rx = 0;
				var ry = rx;
				var width = gridSize - (0.5 * strokeWidth);
				var height = width;

				var type = d['eventId'];
				var val = d['val'];
				var colorMapper = colorMappers[d['eventId']];

				var getFill = function(d) {
					var allowed_values = eventAlbum.getEvent(d['eventId']).metadata.allowedValues;
					var val = d["val"];
					if (_.isString(val)) {
						val = val.toLowerCase();
					}
					// if (eventAlbum.ordinalScoring.hasOwnProperty(allowed_values)) {
					// var score = eventAlbum.ordinalScoring[allowed_values][val];
					// return colorMapper(score);
					// } else {
					// return colorMapper(val);
					// }
					return colorMapper(val);
				};

				// pivot background
				var pivotEventObj;
				var pivotEventColorMapper;
				var strokeOpacity = 1;
				if (pivotEventId != null) {
					pivotEventObj = eventAlbum.getEvent(pivotEventId);
					pivotEventColorMapper = colorMappers[pivotEventId];
					strokeOpacity = 0.4;
				}

				var getStroke = function(d) {
					var grey = "#E6E6E6";
					var stroke;
					if (_.isUndefined(pivotEventColorMapper) || d["eventId"] === pivotEventId) {
						stroke = grey;
					} else {
						// use fill for sample pivot event value
						var sampleId = d["id"];
						var data = pivotEventObj.data.getData([sampleId]);
						var val = data[0]["val"];
						if (val === null) {
							stroke = grey;
						} else {
							// !!! colors are mapped to lowercase of strings !!!
							if (_.isString(val)) {
								val = val.toLowerCase();
							}
							stroke = pivotEventColorMapper(val);
						}
					}
					return stroke;
				};

				if ((type === null) || (d['val'] === null)) {
					// final rectangle for null values
					var attributes = {
						"fill" : "lightgrey",
						"stroke" : getStroke(d),
						"stroke-width" : strokeWidth,
						"stroke-opacity" : strokeOpacity
					};
					group.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));
					return group;
				} else {
					// draw over the primer rectangle instead of drawing a background for each cell
					// background for icons
					// attributes["fill"] = "white";
					// attributes["fill"] = rowLabelColorMapper(eventAlbum.getEvent(d['eventId']).metadata.datatype)
				}
				// group.appendChild(utils.createSvgRectElement(x, y, rx, ry, width, height, attributes));

				var attributes = {
					"stroke" : getStroke(d),
					"stroke-width" : strokeWidth,
					"fill" : getFill(d),
					"stroke-opacity" : strokeOpacity
				};
				var icon;
				if (eventAlbum.getEvent(d['eventId']).metadata.allowedValues === 'categoric') {
					attributes['class'] = 'categoric';
					attributes['eventId'] = d['eventId'];
					attributes['sampleId'] = d['id'];
					attributes['val'] = d['val'];
					icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
				} else if (eventAlbum.getEvent(d['eventId']).metadata.datatype === 'expression data') {
					attributes['class'] = 'mrna_exp';
					attributes['eventId'] = d['eventId'];
					attributes['sampleId'] = d['id'];
					attributes['val'] = d['val'];
					icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
				} else if (utils.isObjInArray(["expression signature", "kinase target activity", "tf target activity", "mvl drug sensitivity"], eventAlbum.getEvent(d['eventId']).metadata.datatype)) {
					attributes['class'] = "signature";
					attributes['eventId'] = d['eventId'];
					attributes['sampleId'] = d['id'];
					attributes['val'] = d['val'];
					icon = utils.createSvgRectElement(x, y, rx, ry, width, height, attributes);
				} else if (eventAlbum.getEvent(d['eventId']).metadata.datatype === 'mutation call') {
					// oncoprint-style icons
					attributes['class'] = "signature";
					attributes['eventId'] = d['eventId'];
					attributes['sampleId'] = d['id'];
					// val is a list of mutation types
					attributes['val'] = d['val'].sort();

					icon = createMutTypeSvg(x, y, rx, ry, width, height, attributes);
				} else if (false & eventAlbum.getEvent(d['eventId']).metadata.datatype === "datatype label") {
					// datatype label cells
					var eventId = d["eventId"];
					var datatype;
					var headOrTail;
					if (utils.endsWith(eventId, "(+)")) {
						datatype = eventId.replace("(+)", "");
						headOrTail = "head";
					} else {
						datatype = eventId.replace("(-)", "");
						headOrTail = "tail";
					}
					attributes['class'] = "datatype";
					attributes['eventId'] = datatype;
					attributes["fill"] = rowLabelColorMapper(datatype);
					var colNameIndex = colNameMapping[colName];
					if (colNameIndex == 0) {
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							var upOrDown = (headOrTail === "head") ? "down" : "up";
							setDatatypePaging(datatype, headOrTail, upOrDown);
						};
						attributes["points"] = getUpArrowPointsList(x, y, width, height).join(" ");

						icon = utils.createSVGPolygonElement(attributes);
					} else if (colNameIndex == 1) {
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							var upOrDown = (headOrTail === "head") ? "up" : "down";
							setDatatypePaging(datatype, headOrTail, upOrDown);
						};
						attributes["points"] = getDownArrowPointsList(x, y, width, height).join(" ");
						icon = utils.createSVGPolygonElement(attributes);
					} else if (colNameIndex == 2) {
						icon = document.createElementNS(utils.svgNamespaceUri, "g");
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							setDatatypePaging(datatype, headOrTail, "0");
						};
						var bar;
						var arrow;
						if (headOrTail === "head") {
							bar = utils.createSvgRectElement(x, y, 0, 0, width, 2, attributes);
							attributes["points"] = getUpArrowPointsList(x, y, width, height).join(" ");
							arrow = utils.createSVGPolygonElement(attributes);
						} else {
							bar = utils.createSvgRectElement(x, y + height - 3, 0, 0, width, 2, attributes);
							attributes["points"] = getDownArrowPointsList(x, y + 1, width, height - 2).join(" ");
							arrow = utils.createSVGPolygonElement(attributes);
						}
						icon.appendChild(bar);
						icon.appendChild(arrow);
					} else {
						attributes["stroke-width"] = "0px";
						attributes["fill"] = rowLabelColorMapper(datatype);
						icon = utils.createSvgRectElement(x, (1 + y + (height / 2)), 0, 0, width, 2, attributes);
					}
				} else if (true & eventAlbum.getEvent(d['eventId']).metadata.datatype === "datatype label") {
					var eventId = d["eventId"];
					var datatype;
					var headOrTail;
					if (utils.endsWith(eventId, "(+)")) {
						datatype = eventId.replace("(+)", "");
						headOrTail = "head";
					} else {
						datatype = eventId.replace("(-)", "");
						headOrTail = "tail";
					}

					// https://en.wikipedia.org/wiki/List_of_Unicode_characters
					// http://www.fileformat.info/info/unicode/char/search.htm
					// http://shapecatcher.com/
					// http://www.charbase.com/block/miscellaneous-symbols-and-pictographs
					// https://stackoverflow.com/questions/12036038/is-there-unicode-glyph-symbol-to-represent-search?lq=1
					// use "C/C++/Java source code" from search results: http://www.fileformat.info/info/unicode/char/search.htm
					var glyphs = {
						"upArrow" : "\u2191",
						"downArrow" : "\u2193",
						"upArrowBar" : "\u2912",
						"downArrowBar" : "\u2913",
						"magGlass" : "\uD83D\uDD0E",
						"ghost" : "\uD83D\uDC7B"
					};

					attributes['class'] = "datatype";
					attributes['eventId'] = datatype;
					attributes["fill"] = rowLabelColorMapper(datatype);
					var colNameIndex = colNameMapping[colName];

					// if (querySettings['pivot_event'] == null) {
					// attributes["stroke-width"] = "0px";
					// attributes["fill"] = rowLabelColorMapper(datatype);
					// icon = utils.createSvgRectElement(x, (1 + y + (height / 2)), 0, 0, width, 2, attributes);
					// } else

					if (colNameIndex == 0) {
						// up
						icon = document.createElementNS(utils.svgNamespaceUri, "g");
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							var upOrDown = (headOrTail === "head") ? "down" : "up";
							setDatatypePaging(datatype, headOrTail, upOrDown);
						};
						attributes["points"] = getUpArrowPointsList(x, y, width, height).join(" ");
						var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);

						var labelAttributes = {
							"font-size" : 16,
							"fill" : "lightgray",
							// "x" : x + 1.3,
							"text-anchor" : "middle",
							"x" : x + (gridSize / 2),
							"y" : y + 10
						};

						var label = document.createElementNS(utils.svgNamespaceUri, "text");
						utils.setElemAttributes(label, labelAttributes);

						var textNode = document.createTextNode(glyphs.upArrow);
						label.appendChild(textNode);

						icon.appendChild(polygon);
						icon.appendChild(label);
					} else if (colNameIndex == 1) {
						// down
						icon = document.createElementNS(utils.svgNamespaceUri, "g");
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							var upOrDown = (headOrTail === "head") ? "up" : "down";
							setDatatypePaging(datatype, headOrTail, upOrDown);
						};
						attributes["points"] = getDownArrowPointsList(x, y, width, height).join(" ");
						var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);

						var labelAttributes = {
							"font-size" : 16,
							"fill" : "lightgray",
							"text-anchor" : "middle",
							"x" : x + (gridSize / 2),
							"y" : y + 10
						};

						var label = document.createElementNS(utils.svgNamespaceUri, "text");
						utils.setElemAttributes(label, labelAttributes);

						var textNode = document.createTextNode(glyphs.downArrow);
						label.appendChild(textNode);

						icon.appendChild(polygon);
						icon.appendChild(label);
					} else if (colNameIndex == 2) {
						// top or bottom
						icon = document.createElementNS(utils.svgNamespaceUri, "g");
						attributes["stroke-width"] = "0px";
						group.onclick = function() {
							setDatatypePaging(datatype, headOrTail, "0");
						};
						var polygon = utils.createSvgRectElement(x, y, 0, 0, width, height, attributes);
						var textNode;
						if (headOrTail === "head") {
							textNode = document.createTextNode(glyphs.upArrowBar);
						} else {
							textNode = document.createTextNode(glyphs.downArrowBar);
						}

						var labelAttributes = {
							"font-size" : 16,
							"fill" : "lightgray",
							"text-anchor" : "middle",
							"x" : x + (gridSize / 2),
							"y" : y + 12.5
						};

						var label = document.createElementNS(utils.svgNamespaceUri, "text");
						utils.setElemAttributes(label, labelAttributes);
						label.appendChild(textNode);
						icon.appendChild(polygon);
						icon.appendChild(label);
					} else {
						// section lines
						attributes["stroke-width"] = "0px";
						attributes["fill"] = rowLabelColorMapper(datatype);
						icon = utils.createSvgRectElement(x, (1 + y + (height / 2)), 0, 0, width, 2, attributes);
					}
				}
				group.appendChild(icon);

				return group;
			});

			// heatmap click event
			// heatMap.on("click", config["cellClickback"]).on("contextmenu", config["cellRightClickback"]);

			// heatmap titles
			heatMap.append("title").text(function(d) {
				var eventId = d["eventId"];
				var datatype = eventAlbum.getEvent(eventId).metadata.datatype;
				var sampleId = d['id'];
				var val = d["val"];
				if (datatype === "datatype label") {
					var colNameIndex = colNameMapping[sampleId];
					var headOrTail;
					if (utils.endsWith(eventId, "(+)")) {
						datatype = eventId.replace("(+)", "");
						headOrTail = "head";
					} else {
						datatype = eventId.replace("(-)", "");
						headOrTail = "tail";
					}
					var anti = (headOrTail === "head") ? "" : "ANTI-";
					var s = "";
					if (colNameIndex == 0) {
						var moreOrLess;
						if (headOrTail === "head") {
							moreOrLess = "MORE";
						} else {
							moreOrLess = "LESS";
						}
						s = "show " + datatype + " events " + moreOrLess + " " + anti + "CORRELATED to pivot event";
					} else if (colNameIndex == 1) {
						var moreOrLess;
						if (headOrTail === "head") {
							moreOrLess = "LESS";
						} else {
							moreOrLess = "MORE";
						}
						s = "show " + datatype + " events " + moreOrLess + " " + anti + "CORRELATED to pivot event";
					} else if (colNameIndex == 2) {
						s = "show TOP " + datatype + " events " + anti + "CORRELATED to pivot event";
					} else {

					}
					return s;
				} else {
					// var s = "r:" + d['eventId'] + "\n\nc:" + d['id'] + "\n\nval:" + d['val'] + "\n\nval_orig:" + d['val_orig'];
					var s = "event: " + d['eventId'] + "\nsample: " + d['id'] + "\nvalue: " + d['val'];
					return s;
				}
			});

		} catch(err) {
			console.log("ERROR drawing matrix cells:", err.name);
			console.log("--", err.message);
		} finally {
			console.log("finished drawing matrix cells");
		}

		console.log("*** END DRAWMATRIX ***");
		return config;
		// end drawMatrix
	};

})(observation_deck);
