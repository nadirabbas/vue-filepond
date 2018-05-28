/*!
 * vue-filepond v2.0.1
 * A handy FilePond adapter component for Vue
 * 
 * Copyright (c) 2018 PQINA
 * https://pqina.nl/filepond
 * 
 * Licensed under the MIT license.
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _filepond = require('filepond');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Methods not made available to the component
var filteredComponentMethods = ['setOptions', 'on', 'off', 'onOnce', 'appendTo', 'insertAfter', 'insertBefore', 'isAttachedTo', 'replaceElement', 'restoreElement', 'destroy'];

// Test if is supported on this client
var isSupported = (0, _filepond.supported)();

// Setup initial prop types and update when plugins are added
var getNativeConstructorFromType = function getNativeConstructorFromType(type) {
    return {
        string: String,
        boolean: Boolean,
        array: Array,
        function: Function,
        int: Number,
        serverapi: Object
    }[type];
};

// Activated props
var props = {};

// Events that need to be mapped to emitters
var events = [];

// Props to watch
var watch = {};

exports.default = function () {

    // register plugins in FilePond
    _filepond.registerPlugin.apply(undefined, arguments);

    // build events and props array
    events.length = 0;

    var _loop = function _loop(prop) {
        // don't add events to the props array
        if (/^on/.test(prop)) {
            events.push(prop);
            return 'continue';
        }

        // get property type ( can be either a String or the type defined within FilePond )
        props[prop] = [String, getNativeConstructorFromType(_filepond.OptionTypes[prop])];

        // setup watcher
        watch[prop] = function (value) {
            this._pond[prop] = value;
        };
    };

    for (var prop in _filepond.OptionTypes) {
        var _ret = _loop(prop);

        if (_ret === 'continue') continue;
    }

    // create 
    return _vue2.default.component('FilePond', {
        name: 'FilePond',
        props: props,
        watch: watch,
        render: function render(h) {
            return h('div', {
                'class': {
                    'filepond--wrapper': true
                }
            }, [h('input', {
                attrs: {
                    id: this.id,
                    name: this.name,
                    type: 'file',
                    'class': this.className,
                    required: this.required,
                    multiple: this.allowMultiple,
                    accept: this.acceptedFileTypes,
                    capture: this.captureMethod
                }
            })]);
        },

        // Will setup FilePond instance when mounted
        mounted: function mounted() {
            var _this = this;

            // exit here if not supported
            if (!isSupported) {
                return;
            }

            // get pond element
            this._element = this.$el.querySelector('input');

            // Map FilePond callback methods to Vue $emitters
            var options = events.reduce(function (obj, value) {
                obj[value] = function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    _this.$emit.apply(_this, [value.substr(2)].concat(args));
                };
                return obj;
            }, {});

            // Scoop up attributes that might not have been caught by Vue ( because the props object is extended dynamically )
            var attrs = Object.assign({}, this.$attrs);

            // Create our pond
            this._pond = (0, _filepond.create)(this._element, Object.assign(options, attrs, this.$options.propsData));

            // Copy instance method references to component instance
            Object.keys(this._pond).filter(function (key) {
                return !filteredComponentMethods.includes(key);
            }).forEach(function (key) {
                _this[key] = _this._pond[key];
            });
        },


        // Will clean up FilePond instance when unmounted
        beforeDestroy: function beforeDestroy() {
            // exit when no pond defined
            if (!this._pond) {
                return;
            }

            this._pond.destroy();
        }
    });
};

