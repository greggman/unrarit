var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// lib/chai/utils/index.js
var utils_exports = {};
__export(utils_exports, {
  addChainableMethod: () => addChainableMethod,
  addLengthGuard: () => addLengthGuard,
  addMethod: () => addMethod,
  addProperty: () => addProperty,
  checkError: () => check_error_exports,
  compareByInspect: () => compareByInspect,
  eql: () => deep_eql_default,
  events: () => events,
  expectTypes: () => expectTypes,
  flag: () => flag,
  getActual: () => getActual,
  getMessage: () => getMessage2,
  getName: () => getName,
  getOperator: () => getOperator,
  getOwnEnumerableProperties: () => getOwnEnumerableProperties,
  getOwnEnumerablePropertySymbols: () => getOwnEnumerablePropertySymbols,
  getPathInfo: () => getPathInfo,
  hasProperty: () => hasProperty,
  inspect: () => inspect2,
  isNaN: () => isNaN2,
  isNumeric: () => isNumeric,
  isProxyEnabled: () => isProxyEnabled,
  isRegExp: () => isRegExp2,
  objDisplay: () => objDisplay,
  overwriteChainableMethod: () => overwriteChainableMethod,
  overwriteMethod: () => overwriteMethod,
  overwriteProperty: () => overwriteProperty,
  proxify: () => proxify,
  test: () => test,
  transferFlags: () => transferFlags,
  type: () => type
});

// node_modules/check-error/index.js
var check_error_exports = {};
__export(check_error_exports, {
  compatibleConstructor: () => compatibleConstructor,
  compatibleInstance: () => compatibleInstance,
  compatibleMessage: () => compatibleMessage,
  getConstructorName: () => getConstructorName,
  getMessage: () => getMessage
});
function isErrorInstance(obj) {
  return obj instanceof Error || Object.prototype.toString.call(obj) === "[object Error]";
}
__name(isErrorInstance, "isErrorInstance");
function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}
__name(isRegExp, "isRegExp");
function compatibleInstance(thrown, errorLike) {
  return isErrorInstance(errorLike) && thrown === errorLike;
}
__name(compatibleInstance, "compatibleInstance");
function compatibleConstructor(thrown, errorLike) {
  if (isErrorInstance(errorLike)) {
    return thrown.constructor === errorLike.constructor || thrown instanceof errorLike.constructor;
  } else if ((typeof errorLike === "object" || typeof errorLike === "function") && errorLike.prototype) {
    return thrown.constructor === errorLike || thrown instanceof errorLike;
  }
  return false;
}
__name(compatibleConstructor, "compatibleConstructor");
function compatibleMessage(thrown, errMatcher) {
  const comparisonString = typeof thrown === "string" ? thrown : thrown.message;
  if (isRegExp(errMatcher)) {
    return errMatcher.test(comparisonString);
  } else if (typeof errMatcher === "string") {
    return comparisonString.indexOf(errMatcher) !== -1;
  }
  return false;
}
__name(compatibleMessage, "compatibleMessage");
function getConstructorName(errorLike) {
  let constructorName = errorLike;
  if (isErrorInstance(errorLike)) {
    constructorName = errorLike.constructor.name;
  } else if (typeof errorLike === "function") {
    constructorName = errorLike.name;
    if (constructorName === "") {
      const newConstructorName = new errorLike().name;
      constructorName = newConstructorName || constructorName;
    }
  }
  return constructorName;
}
__name(getConstructorName, "getConstructorName");
function getMessage(errorLike) {
  let msg = "";
  if (errorLike && errorLike.message) {
    msg = errorLike.message;
  } else if (typeof errorLike === "string") {
    msg = errorLike;
  }
  return msg;
}
__name(getMessage, "getMessage");

// lib/chai/utils/flag.js
function flag(obj, key, value) {
  let flags = obj.__flags || (obj.__flags = /* @__PURE__ */ Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
}
__name(flag, "flag");

// lib/chai/utils/test.js
function test(obj, args) {
  let negate = flag(obj, "negate"), expr = args[0];
  return negate ? !expr : expr;
}
__name(test, "test");

// lib/chai/utils/type-detect.js
function type(obj) {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }
  const type3 = Object.prototype.toString.call(obj).slice(8, -1);
  return type3;
}
__name(type, "type");

// node_modules/assertion-error/index.js
var canElideFrames = "captureStackTrace" in Error;
var _AssertionError = class _AssertionError extends Error {
  constructor(message = "Unspecified AssertionError", props, ssf) {
    super(message);
    __publicField(this, "message");
    this.message = message;
    if (canElideFrames) {
      Error.captureStackTrace(this, ssf || _AssertionError);
    }
    for (const key in props) {
      if (!(key in this)) {
        this[key] = props[key];
      }
    }
  }
  get name() {
    return "AssertionError";
  }
  get ok() {
    return false;
  }
  toJSON(stack) {
    return {
      ...this,
      name: this.name,
      message: this.message,
      ok: false,
      stack: stack !== false ? this.stack : void 0
    };
  }
};
__name(_AssertionError, "AssertionError");
var AssertionError = _AssertionError;

// lib/chai/utils/expectTypes.js
function expectTypes(obj, types) {
  let flagMsg = flag(obj, "message");
  let ssfi = flag(obj, "ssfi");
  flagMsg = flagMsg ? flagMsg + ": " : "";
  obj = flag(obj, "object");
  types = types.map(function(t) {
    return t.toLowerCase();
  });
  types.sort();
  let str = types.map(function(t, index) {
    let art = ~["a", "e", "i", "o", "u"].indexOf(t.charAt(0)) ? "an" : "a";
    let or = types.length > 1 && index === types.length - 1 ? "or " : "";
    return or + art + " " + t;
  }).join(", ");
  let objType = type(obj).toLowerCase();
  if (!types.some(function(expected) {
    return objType === expected;
  })) {
    throw new AssertionError(
      flagMsg + "object tested must be " + str + ", but " + objType + " given",
      void 0,
      ssfi
    );
  }
}
__name(expectTypes, "expectTypes");

// lib/chai/utils/getActual.js
function getActual(obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
}
__name(getActual, "getActual");

// node_modules/loupe/lib/helpers.js
var ansiColors = {
  bold: ["1", "22"],
  dim: ["2", "22"],
  italic: ["3", "23"],
  underline: ["4", "24"],
  // 5 & 6 are blinking
  inverse: ["7", "27"],
  hidden: ["8", "28"],
  strike: ["9", "29"],
  // 10-20 are fonts
  // 21-29 are resets for 1-9
  black: ["30", "39"],
  red: ["31", "39"],
  green: ["32", "39"],
  yellow: ["33", "39"],
  blue: ["34", "39"],
  magenta: ["35", "39"],
  cyan: ["36", "39"],
  white: ["37", "39"],
  brightblack: ["30;1", "39"],
  brightred: ["31;1", "39"],
  brightgreen: ["32;1", "39"],
  brightyellow: ["33;1", "39"],
  brightblue: ["34;1", "39"],
  brightmagenta: ["35;1", "39"],
  brightcyan: ["36;1", "39"],
  brightwhite: ["37;1", "39"],
  grey: ["90", "39"]
};
var styles = {
  special: "cyan",
  number: "yellow",
  bigint: "yellow",
  boolean: "yellow",
  undefined: "grey",
  null: "bold",
  string: "green",
  symbol: "green",
  date: "magenta",
  regexp: "red"
};
var truncator = "\u2026";
function colorise(value, styleType) {
  const color = ansiColors[styles[styleType]] || ansiColors[styleType] || "";
  if (!color) {
    return String(value);
  }
  return `\x1B[${color[0]}m${String(value)}\x1B[${color[1]}m`;
}
__name(colorise, "colorise");
function normaliseOptions({
  showHidden = false,
  depth = 2,
  colors = false,
  customInspect = true,
  showProxy = false,
  maxArrayLength = Infinity,
  breakLength = Infinity,
  seen = [],
  // eslint-disable-next-line no-shadow
  truncate: truncate2 = Infinity,
  stylize = String
} = {}, inspect3) {
  const options = {
    showHidden: Boolean(showHidden),
    depth: Number(depth),
    colors: Boolean(colors),
    customInspect: Boolean(customInspect),
    showProxy: Boolean(showProxy),
    maxArrayLength: Number(maxArrayLength),
    breakLength: Number(breakLength),
    truncate: Number(truncate2),
    seen,
    inspect: inspect3,
    stylize
  };
  if (options.colors) {
    options.stylize = colorise;
  }
  return options;
}
__name(normaliseOptions, "normaliseOptions");
function isHighSurrogate(char) {
  return char >= "\uD800" && char <= "\uDBFF";
}
__name(isHighSurrogate, "isHighSurrogate");
function truncate(string, length, tail = truncator) {
  string = String(string);
  const tailLength = tail.length;
  const stringLength = string.length;
  if (tailLength > length && stringLength > tailLength) {
    return tail;
  }
  if (stringLength > length && stringLength > tailLength) {
    let end = length - tailLength;
    if (end > 0 && isHighSurrogate(string[end - 1])) {
      end = end - 1;
    }
    return `${string.slice(0, end)}${tail}`;
  }
  return string;
}
__name(truncate, "truncate");
function inspectList(list, options, inspectItem, separator = ", ") {
  inspectItem = inspectItem || options.inspect;
  const size = list.length;
  if (size === 0)
    return "";
  const originalLength = options.truncate;
  let output = "";
  let peek = "";
  let truncated = "";
  for (let i = 0; i < size; i += 1) {
    const last = i + 1 === list.length;
    const secondToLast = i + 2 === list.length;
    truncated = `${truncator}(${list.length - i})`;
    const value = list[i];
    options.truncate = originalLength - output.length - (last ? 0 : separator.length);
    const string = peek || inspectItem(value, options) + (last ? "" : separator);
    const nextLength = output.length + string.length;
    const truncatedLength = nextLength + truncated.length;
    if (last && nextLength > originalLength && output.length + truncated.length <= originalLength) {
      break;
    }
    if (!last && !secondToLast && truncatedLength > originalLength) {
      break;
    }
    peek = last ? "" : inspectItem(list[i + 1], options) + (secondToLast ? "" : separator);
    if (!last && secondToLast && truncatedLength > originalLength && nextLength + peek.length > originalLength) {
      break;
    }
    output += string;
    if (!last && !secondToLast && nextLength + peek.length >= originalLength) {
      truncated = `${truncator}(${list.length - i - 1})`;
      break;
    }
    truncated = "";
  }
  return `${output}${truncated}`;
}
__name(inspectList, "inspectList");
function quoteComplexKey(key) {
  if (key.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/)) {
    return key;
  }
  return JSON.stringify(key).replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
}
__name(quoteComplexKey, "quoteComplexKey");
function inspectProperty([key, value], options) {
  options.truncate -= 2;
  if (typeof key === "string") {
    key = quoteComplexKey(key);
  } else if (typeof key !== "number") {
    key = `[${options.inspect(key, options)}]`;
  }
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key}: ${value}`;
}
__name(inspectProperty, "inspectProperty");

// node_modules/loupe/lib/array.js
function inspectArray(array, options) {
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return "[]";
  options.truncate -= 4;
  const listContents = inspectList(array, options);
  options.truncate -= listContents.length;
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `[ ${listContents}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectArray, "inspectArray");

// node_modules/loupe/lib/typedarray.js
var getArrayName = /* @__PURE__ */ __name((array) => {
  if (typeof Buffer === "function" && array instanceof Buffer) {
    return "Buffer";
  }
  if (array[Symbol.toStringTag]) {
    return array[Symbol.toStringTag];
  }
  return array.constructor.name;
}, "getArrayName");
function inspectTypedArray(array, options) {
  const name = getArrayName(array);
  options.truncate -= name.length + 4;
  const nonIndexProperties = Object.keys(array).slice(array.length);
  if (!array.length && !nonIndexProperties.length)
    return `${name}[]`;
  let output = "";
  for (let i = 0; i < array.length; i++) {
    const string = `${options.stylize(truncate(array[i], options.truncate), "number")}${i === array.length - 1 ? "" : ", "}`;
    options.truncate -= string.length;
    if (array[i] !== array.length && options.truncate <= 3) {
      output += `${truncator}(${array.length - array[i] + 1})`;
      break;
    }
    output += string;
  }
  let propertyContents = "";
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map((key) => [key, array[key]]), options, inspectProperty);
  }
  return `${name}[ ${output}${propertyContents ? `, ${propertyContents}` : ""} ]`;
}
__name(inspectTypedArray, "inspectTypedArray");

// node_modules/loupe/lib/date.js
function inspectDate(dateObject, options) {
  const stringRepresentation = dateObject.toJSON();
  if (stringRepresentation === null) {
    return "Invalid Date";
  }
  const split = stringRepresentation.split("T");
  const date = split[0];
  return options.stylize(`${date}T${truncate(split[1], options.truncate - date.length - 1)}`, "date");
}
__name(inspectDate, "inspectDate");

// node_modules/loupe/lib/function.js
function inspectFunction(func, options) {
  const functionType = func[Symbol.toStringTag] || "Function";
  const name = func.name;
  if (!name) {
    return options.stylize(`[${functionType}]`, "special");
  }
  return options.stylize(`[${functionType} ${truncate(name, options.truncate - 11)}]`, "special");
}
__name(inspectFunction, "inspectFunction");

// node_modules/loupe/lib/map.js
function inspectMapEntry([key, value], options) {
  options.truncate -= 4;
  key = options.inspect(key, options);
  options.truncate -= key.length;
  value = options.inspect(value, options);
  return `${key} => ${value}`;
}
__name(inspectMapEntry, "inspectMapEntry");
function mapToEntries(map) {
  const entries = [];
  map.forEach((value, key) => {
    entries.push([key, value]);
  });
  return entries;
}
__name(mapToEntries, "mapToEntries");
function inspectMap(map, options) {
  if (map.size === 0)
    return "Map{}";
  options.truncate -= 7;
  return `Map{ ${inspectList(mapToEntries(map), options, inspectMapEntry)} }`;
}
__name(inspectMap, "inspectMap");

// node_modules/loupe/lib/number.js
var isNaN = Number.isNaN || ((i) => i !== i);
function inspectNumber(number, options) {
  if (isNaN(number)) {
    return options.stylize("NaN", "number");
  }
  if (number === Infinity) {
    return options.stylize("Infinity", "number");
  }
  if (number === -Infinity) {
    return options.stylize("-Infinity", "number");
  }
  if (number === 0) {
    return options.stylize(1 / number === Infinity ? "+0" : "-0", "number");
  }
  return options.stylize(truncate(String(number), options.truncate), "number");
}
__name(inspectNumber, "inspectNumber");

// node_modules/loupe/lib/bigint.js
function inspectBigInt(number, options) {
  let nums = truncate(number.toString(), options.truncate - 1);
  if (nums !== truncator)
    nums += "n";
  return options.stylize(nums, "bigint");
}
__name(inspectBigInt, "inspectBigInt");

// node_modules/loupe/lib/regexp.js
function inspectRegExp(value, options) {
  const flags = value.toString().split("/")[2];
  const sourceLength = options.truncate - (2 + flags.length);
  const source = value.source;
  return options.stylize(`/${truncate(source, sourceLength)}/${flags}`, "regexp");
}
__name(inspectRegExp, "inspectRegExp");

// node_modules/loupe/lib/set.js
function arrayFromSet(set2) {
  const values = [];
  set2.forEach((value) => {
    values.push(value);
  });
  return values;
}
__name(arrayFromSet, "arrayFromSet");
function inspectSet(set2, options) {
  if (set2.size === 0)
    return "Set{}";
  options.truncate -= 7;
  return `Set{ ${inspectList(arrayFromSet(set2), options)} }`;
}
__name(inspectSet, "inspectSet");

// node_modules/loupe/lib/string.js
var stringEscapeChars = new RegExp("['\\u0000-\\u001f\\u007f-\\u009f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]", "g");
var escapeCharacters = {
  "\b": "\\b",
  "	": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  "'": "\\'",
  "\\": "\\\\"
};
var hex = 16;
function escape(char) {
  return escapeCharacters[char] || `\\u${`0000${char.charCodeAt(0).toString(hex)}`.slice(-4)}`;
}
__name(escape, "escape");
function inspectString(string, options) {
  if (stringEscapeChars.test(string)) {
    string = string.replace(stringEscapeChars, escape);
  }
  return options.stylize(`'${truncate(string, options.truncate - 2)}'`, "string");
}
__name(inspectString, "inspectString");

// node_modules/loupe/lib/symbol.js
function inspectSymbol(value) {
  if ("description" in Symbol.prototype) {
    return value.description ? `Symbol(${value.description})` : "Symbol()";
  }
  return value.toString();
}
__name(inspectSymbol, "inspectSymbol");

// node_modules/loupe/lib/promise.js
var getPromiseValue = /* @__PURE__ */ __name(() => "Promise{\u2026}", "getPromiseValue");
var promise_default = getPromiseValue;

// node_modules/loupe/lib/object.js
function inspectObject(object, options) {
  const properties = Object.getOwnPropertyNames(object);
  const symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : [];
  if (properties.length === 0 && symbols.length === 0) {
    return "{}";
  }
  options.truncate -= 4;
  options.seen = options.seen || [];
  if (options.seen.includes(object)) {
    return "[Circular]";
  }
  options.seen.push(object);
  const propertyContents = inspectList(properties.map((key) => [key, object[key]]), options, inspectProperty);
  const symbolContents = inspectList(symbols.map((key) => [key, object[key]]), options, inspectProperty);
  options.seen.pop();
  let sep = "";
  if (propertyContents && symbolContents) {
    sep = ", ";
  }
  return `{ ${propertyContents}${sep}${symbolContents} }`;
}
__name(inspectObject, "inspectObject");

// node_modules/loupe/lib/class.js
var toStringTag = typeof Symbol !== "undefined" && Symbol.toStringTag ? Symbol.toStringTag : false;
function inspectClass(value, options) {
  let name = "";
  if (toStringTag && toStringTag in value) {
    name = value[toStringTag];
  }
  name = name || value.constructor.name;
  if (!name || name === "_class") {
    name = "<Anonymous Class>";
  }
  options.truncate -= name.length;
  return `${name}${inspectObject(value, options)}`;
}
__name(inspectClass, "inspectClass");

// node_modules/loupe/lib/arguments.js
function inspectArguments(args, options) {
  if (args.length === 0)
    return "Arguments[]";
  options.truncate -= 13;
  return `Arguments[ ${inspectList(args, options)} ]`;
}
__name(inspectArguments, "inspectArguments");

// node_modules/loupe/lib/error.js
var errorKeys = [
  "stack",
  "line",
  "column",
  "name",
  "message",
  "fileName",
  "lineNumber",
  "columnNumber",
  "number",
  "description",
  "cause"
];
function inspectObject2(error, options) {
  const properties = Object.getOwnPropertyNames(error).filter((key) => errorKeys.indexOf(key) === -1);
  const name = error.name;
  options.truncate -= name.length;
  let message = "";
  if (typeof error.message === "string") {
    message = truncate(error.message, options.truncate);
  } else {
    properties.unshift("message");
  }
  message = message ? `: ${message}` : "";
  options.truncate -= message.length + 5;
  options.seen = options.seen || [];
  if (options.seen.includes(error)) {
    return "[Circular]";
  }
  options.seen.push(error);
  const propertyContents = inspectList(properties.map((key) => [key, error[key]]), options, inspectProperty);
  return `${name}${message}${propertyContents ? ` { ${propertyContents} }` : ""}`;
}
__name(inspectObject2, "inspectObject");

// node_modules/loupe/lib/html.js
function inspectAttribute([key, value], options) {
  options.truncate -= 3;
  if (!value) {
    return `${options.stylize(String(key), "yellow")}`;
  }
  return `${options.stylize(String(key), "yellow")}=${options.stylize(`"${value}"`, "string")}`;
}
__name(inspectAttribute, "inspectAttribute");
function inspectNodeCollection(collection, options) {
  return inspectList(collection, options, inspectNode, "\n");
}
__name(inspectNodeCollection, "inspectNodeCollection");
function inspectNode(node, options) {
  switch (node.nodeType) {
    case 1:
      return inspectHTML(node, options);
    case 3:
      return options.inspect(node.data, options);
    default:
      return options.inspect(node, options);
  }
}
__name(inspectNode, "inspectNode");
function inspectHTML(element, options) {
  const properties = element.getAttributeNames();
  const name = element.tagName.toLowerCase();
  const head = options.stylize(`<${name}`, "special");
  const headClose = options.stylize(`>`, "special");
  const tail = options.stylize(`</${name}>`, "special");
  options.truncate -= name.length * 2 + 5;
  let propertyContents = "";
  if (properties.length > 0) {
    propertyContents += " ";
    propertyContents += inspectList(properties.map((key) => [key, element.getAttribute(key)]), options, inspectAttribute, " ");
  }
  options.truncate -= propertyContents.length;
  const truncate2 = options.truncate;
  let children = inspectNodeCollection(element.children, options);
  if (children && children.length > truncate2) {
    children = `${truncator}(${element.children.length})`;
  }
  return `${head}${propertyContents}${headClose}${children}${tail}`;
}
__name(inspectHTML, "inspectHTML");

// node_modules/loupe/lib/index.js
var symbolsSupported = typeof Symbol === "function" && typeof Symbol.for === "function";
var chaiInspect = symbolsSupported ? /* @__PURE__ */ Symbol.for("chai/inspect") : "@@chai/inspect";
var nodeInspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
var constructorMap = /* @__PURE__ */ new WeakMap();
var stringTagMap = {};
var baseTypesMap = {
  undefined: /* @__PURE__ */ __name((value, options) => options.stylize("undefined", "undefined"), "undefined"),
  null: /* @__PURE__ */ __name((value, options) => options.stylize("null", "null"), "null"),
  boolean: /* @__PURE__ */ __name((value, options) => options.stylize(String(value), "boolean"), "boolean"),
  Boolean: /* @__PURE__ */ __name((value, options) => options.stylize(String(value), "boolean"), "Boolean"),
  number: inspectNumber,
  Number: inspectNumber,
  bigint: inspectBigInt,
  BigInt: inspectBigInt,
  string: inspectString,
  String: inspectString,
  function: inspectFunction,
  Function: inspectFunction,
  symbol: inspectSymbol,
  // A Symbol polyfill will return `Symbol` not `symbol` from typedetect
  Symbol: inspectSymbol,
  Array: inspectArray,
  Date: inspectDate,
  Map: inspectMap,
  Set: inspectSet,
  RegExp: inspectRegExp,
  Promise: promise_default,
  // WeakSet, WeakMap are totally opaque to us
  WeakSet: /* @__PURE__ */ __name((value, options) => options.stylize("WeakSet{\u2026}", "special"), "WeakSet"),
  WeakMap: /* @__PURE__ */ __name((value, options) => options.stylize("WeakMap{\u2026}", "special"), "WeakMap"),
  Arguments: inspectArguments,
  Int8Array: inspectTypedArray,
  Uint8Array: inspectTypedArray,
  Uint8ClampedArray: inspectTypedArray,
  Int16Array: inspectTypedArray,
  Uint16Array: inspectTypedArray,
  Int32Array: inspectTypedArray,
  Uint32Array: inspectTypedArray,
  Float32Array: inspectTypedArray,
  Float64Array: inspectTypedArray,
  Generator: /* @__PURE__ */ __name(() => "", "Generator"),
  DataView: /* @__PURE__ */ __name(() => "", "DataView"),
  ArrayBuffer: /* @__PURE__ */ __name(() => "", "ArrayBuffer"),
  Error: inspectObject2,
  HTMLCollection: inspectNodeCollection,
  NodeList: inspectNodeCollection
};
var inspectCustom = /* @__PURE__ */ __name((value, options, type3, inspectFn) => {
  if (chaiInspect in value && typeof value[chaiInspect] === "function") {
    return value[chaiInspect](options);
  }
  if (nodeInspect in value && typeof value[nodeInspect] === "function") {
    return value[nodeInspect](options.depth, options, inspectFn);
  }
  if ("inspect" in value && typeof value.inspect === "function") {
    return value.inspect(options.depth, options);
  }
  if ("constructor" in value && constructorMap.has(value.constructor)) {
    return constructorMap.get(value.constructor)(value, options);
  }
  if (stringTagMap[type3]) {
    return stringTagMap[type3](value, options);
  }
  return "";
}, "inspectCustom");
var toString = Object.prototype.toString;
function inspect(value, opts = {}) {
  const options = normaliseOptions(opts, inspect);
  const { customInspect } = options;
  let type3 = value === null ? "null" : typeof value;
  if (type3 === "object") {
    type3 = toString.call(value).slice(8, -1);
  }
  if (type3 in baseTypesMap) {
    return baseTypesMap[type3](value, options);
  }
  if (customInspect && value) {
    const output = inspectCustom(value, options, type3, inspect);
    if (output) {
      if (typeof output === "string")
        return output;
      return inspect(output, options);
    }
  }
  const proto = value ? Object.getPrototypeOf(value) : false;
  if (proto === Object.prototype || proto === null) {
    return inspectObject(value, options);
  }
  if (value && typeof HTMLElement === "function" && value instanceof HTMLElement) {
    return inspectHTML(value, options);
  }
  if ("constructor" in value) {
    if (value.constructor !== Object) {
      return inspectClass(value, options);
    }
    return inspectObject(value, options);
  }
  if (value === Object(value)) {
    return inspectObject(value, options);
  }
  return options.stylize(String(value), type3);
}
__name(inspect, "inspect");

// lib/chai/config.js
var config = {
  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {boolean}
   * @public
   */
  includeStack: false,
  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {boolean}
   * @public
   */
  showDiff: true,
  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {number}
   * @public
   */
  truncateThreshold: 40,
  /**
   * ### config.useProxy
   *
   * User configurable property, defines if chai will use a Proxy to throw
   * an error when a non-existent property is read, which protects users
   * from typos when using property-based assertions.
   *
   * Set it to false if you want to disable this feature.
   *
   *     chai.config.useProxy = false;  // disable use of Proxy
   *
   * This feature is automatically disabled regardless of this config value
   * in environments that don't support proxies.
   *
   * @param {boolean}
   * @public
   */
  useProxy: true,
  /**
   * ### config.proxyExcludedKeys
   *
   * User configurable property, defines which properties should be ignored
   * instead of throwing an error if they do not exist on the assertion.
   * This is only applied if the environment Chai is running in supports proxies and
   * if the `useProxy` configuration setting is enabled.
   * By default, `then` and `inspect` will not throw an error if they do not exist on the
   * assertion object because the `.inspect` property is read by `util.inspect` (for example, when
   * using `console.log` on the assertion object) and `.then` is necessary for promise type-checking.
   *
   *     // By default these keys will not throw an error if they do not exist on the assertion object
   *     chai.config.proxyExcludedKeys = ['then', 'inspect'];
   *
   * @param {Array}
   * @public
   */
  proxyExcludedKeys: ["then", "catch", "inspect", "toJSON"],
  /**
   * ### config.deepEqual
   *
   * User configurable property, defines which a custom function to use for deepEqual
   * comparisons.
   * By default, the function used is the one from the `deep-eql` package without custom comparator.
   *
   *     // use a custom comparator
   *     chai.config.deepEqual = (expected, actual) => {
   *         return chai.util.eql(expected, actual, {
   *             comparator: (expected, actual) => {
   *                 // for non number comparison, use the default behavior
   *                 if(typeof expected !== 'number') return null;
   *                 // allow a difference of 10 between compared numbers
   *                 return typeof actual === 'number' && Math.abs(actual - expected) < 10
   *             }
   *         })
   *     };
   *
   * @param {Function}
   * @public
   */
  deepEqual: null
};

// lib/chai/utils/inspect.js
function inspect2(obj, showHidden, depth, colors) {
  let options = {
    colors,
    depth: typeof depth === "undefined" ? 2 : depth,
    showHidden,
    truncate: config.truncateThreshold ? config.truncateThreshold : Infinity
  };
  return inspect(obj, options);
}
__name(inspect2, "inspect");

// lib/chai/utils/objDisplay.js
function objDisplay(obj) {
  let str = inspect2(obj), type3 = Object.prototype.toString.call(obj);
  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type3 === "[object Function]") {
      return !obj.name || obj.name === "" ? "[Function]" : "[Function: " + obj.name + "]";
    } else if (type3 === "[object Array]") {
      return "[ Array(" + obj.length + ") ]";
    } else if (type3 === "[object Object]") {
      let keys = Object.keys(obj), kstr = keys.length > 2 ? keys.splice(0, 2).join(", ") + ", ..." : keys.join(", ");
      return "{ Object (" + kstr + ") }";
    } else {
      return str;
    }
  } else {
    return str;
  }
}
__name(objDisplay, "objDisplay");

// lib/chai/utils/getMessage.js
function getMessage2(obj, args) {
  let negate = flag(obj, "negate");
  let val = flag(obj, "object");
  let expected = args[3];
  let actual = getActual(obj, args);
  let msg = negate ? args[2] : args[1];
  let flagMsg = flag(obj, "message");
  if (typeof msg === "function") msg = msg();
  msg = msg || "";
  msg = msg.replace(/#\{this\}/g, function() {
    return objDisplay(val);
  }).replace(/#\{act\}/g, function() {
    return objDisplay(actual);
  }).replace(/#\{exp\}/g, function() {
    return objDisplay(expected);
  });
  return flagMsg ? flagMsg + ": " + msg : msg;
}
__name(getMessage2, "getMessage");

// lib/chai/utils/transferFlags.js
function transferFlags(assertion, object, includeAll) {
  let flags = assertion.__flags || (assertion.__flags = /* @__PURE__ */ Object.create(null));
  if (!object.__flags) {
    object.__flags = /* @__PURE__ */ Object.create(null);
  }
  includeAll = arguments.length === 3 ? includeAll : true;
  for (let flag3 in flags) {
    if (includeAll || flag3 !== "object" && flag3 !== "ssfi" && flag3 !== "lockSsfi" && flag3 != "message") {
      object.__flags[flag3] = flags[flag3];
    }
  }
}
__name(transferFlags, "transferFlags");

// node_modules/deep-eql/index.js
function type2(obj) {
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  const stringTag = obj[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }
  const sliceStart = 8;
  const sliceEnd = -1;
  return Object.prototype.toString.call(obj).slice(sliceStart, sliceEnd);
}
__name(type2, "type");
function FakeMap() {
  this._key = "chai/deep-eql__" + Math.random() + Date.now();
}
__name(FakeMap, "FakeMap");
FakeMap.prototype = {
  get: /* @__PURE__ */ __name(function get(key) {
    return key[this._key];
  }, "get"),
  set: /* @__PURE__ */ __name(function set(key, value) {
    if (Object.isExtensible(key)) {
      Object.defineProperty(key, this._key, {
        value,
        configurable: true
      });
    }
  }, "set")
};
var MemoizeMap = typeof WeakMap === "function" ? WeakMap : FakeMap;
function memoizeCompare(leftHandOperand, rightHandOperand, memoizeMap) {
  if (!memoizeMap || isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
    return null;
  }
  var leftHandMap = memoizeMap.get(leftHandOperand);
  if (leftHandMap) {
    var result = leftHandMap.get(rightHandOperand);
    if (typeof result === "boolean") {
      return result;
    }
  }
  return null;
}
__name(memoizeCompare, "memoizeCompare");
function memoizeSet(leftHandOperand, rightHandOperand, memoizeMap, result) {
  if (!memoizeMap || isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
    return;
  }
  var leftHandMap = memoizeMap.get(leftHandOperand);
  if (leftHandMap) {
    leftHandMap.set(rightHandOperand, result);
  } else {
    leftHandMap = new MemoizeMap();
    leftHandMap.set(rightHandOperand, result);
    memoizeMap.set(leftHandOperand, leftHandMap);
  }
}
__name(memoizeSet, "memoizeSet");
var deep_eql_default = deepEqual;
function deepEqual(leftHandOperand, rightHandOperand, options) {
  if (options && options.comparator) {
    return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
  }
  var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
  if (simpleResult !== null) {
    return simpleResult;
  }
  return extensiveDeepEqual(leftHandOperand, rightHandOperand, options);
}
__name(deepEqual, "deepEqual");
function simpleEqual(leftHandOperand, rightHandOperand) {
  if (leftHandOperand === rightHandOperand) {
    return leftHandOperand !== 0 || 1 / leftHandOperand === 1 / rightHandOperand;
  }
  if (leftHandOperand !== leftHandOperand && // eslint-disable-line no-self-compare
  rightHandOperand !== rightHandOperand) {
    return true;
  }
  if (isPrimitive(leftHandOperand) || isPrimitive(rightHandOperand)) {
    return false;
  }
  return null;
}
__name(simpleEqual, "simpleEqual");
function extensiveDeepEqual(leftHandOperand, rightHandOperand, options) {
  options = options || {};
  options.memoize = options.memoize === false ? false : options.memoize || new MemoizeMap();
  var comparator = options && options.comparator;
  var memoizeResultLeft = memoizeCompare(leftHandOperand, rightHandOperand, options.memoize);
  if (memoizeResultLeft !== null) {
    return memoizeResultLeft;
  }
  var memoizeResultRight = memoizeCompare(rightHandOperand, leftHandOperand, options.memoize);
  if (memoizeResultRight !== null) {
    return memoizeResultRight;
  }
  if (comparator) {
    var comparatorResult = comparator(leftHandOperand, rightHandOperand);
    if (comparatorResult === false || comparatorResult === true) {
      memoizeSet(leftHandOperand, rightHandOperand, options.memoize, comparatorResult);
      return comparatorResult;
    }
    var simpleResult = simpleEqual(leftHandOperand, rightHandOperand);
    if (simpleResult !== null) {
      return simpleResult;
    }
  }
  var leftHandType = type2(leftHandOperand);
  if (leftHandType !== type2(rightHandOperand)) {
    memoizeSet(leftHandOperand, rightHandOperand, options.memoize, false);
    return false;
  }
  memoizeSet(leftHandOperand, rightHandOperand, options.memoize, true);
  var result = extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options);
  memoizeSet(leftHandOperand, rightHandOperand, options.memoize, result);
  return result;
}
__name(extensiveDeepEqual, "extensiveDeepEqual");
function extensiveDeepEqualByType(leftHandOperand, rightHandOperand, leftHandType, options) {
  switch (leftHandType) {
    case "String":
    case "Number":
    case "Boolean":
    case "Date":
      return deepEqual(leftHandOperand.valueOf(), rightHandOperand.valueOf());
    case "Promise":
    case "Symbol":
    case "function":
    case "WeakMap":
    case "WeakSet":
      return leftHandOperand === rightHandOperand;
    case "Error":
      return keysEqual(leftHandOperand, rightHandOperand, ["name", "message", "code"], options);
    case "Arguments":
    case "Int8Array":
    case "Uint8Array":
    case "Uint8ClampedArray":
    case "Int16Array":
    case "Uint16Array":
    case "Int32Array":
    case "Uint32Array":
    case "Float32Array":
    case "Float64Array":
    case "Array":
      return iterableEqual(leftHandOperand, rightHandOperand, options);
    case "RegExp":
      return regexpEqual(leftHandOperand, rightHandOperand);
    case "Generator":
      return generatorEqual(leftHandOperand, rightHandOperand, options);
    case "DataView":
      return iterableEqual(new Uint8Array(leftHandOperand.buffer), new Uint8Array(rightHandOperand.buffer), options);
    case "ArrayBuffer":
      return iterableEqual(new Uint8Array(leftHandOperand), new Uint8Array(rightHandOperand), options);
    case "Set":
      return entriesEqual(leftHandOperand, rightHandOperand, options);
    case "Map":
      return entriesEqual(leftHandOperand, rightHandOperand, options);
    case "Temporal.PlainDate":
    case "Temporal.PlainTime":
    case "Temporal.PlainDateTime":
    case "Temporal.Instant":
    case "Temporal.ZonedDateTime":
    case "Temporal.PlainYearMonth":
    case "Temporal.PlainMonthDay":
      return leftHandOperand.equals(rightHandOperand);
    case "Temporal.Duration":
      return leftHandOperand.total("nanoseconds") === rightHandOperand.total("nanoseconds");
    case "Temporal.TimeZone":
    case "Temporal.Calendar":
      return leftHandOperand.toString() === rightHandOperand.toString();
    default:
      return objectEqual(leftHandOperand, rightHandOperand, options);
  }
}
__name(extensiveDeepEqualByType, "extensiveDeepEqualByType");
function regexpEqual(leftHandOperand, rightHandOperand) {
  return leftHandOperand.toString() === rightHandOperand.toString();
}
__name(regexpEqual, "regexpEqual");
function entriesEqual(leftHandOperand, rightHandOperand, options) {
  try {
    if (leftHandOperand.size !== rightHandOperand.size) {
      return false;
    }
    if (leftHandOperand.size === 0) {
      return true;
    }
  } catch (sizeError) {
    return false;
  }
  var leftHandItems = [];
  var rightHandItems = [];
  leftHandOperand.forEach(/* @__PURE__ */ __name(function gatherEntries(key, value) {
    leftHandItems.push([key, value]);
  }, "gatherEntries"));
  rightHandOperand.forEach(/* @__PURE__ */ __name(function gatherEntries(key, value) {
    rightHandItems.push([key, value]);
  }, "gatherEntries"));
  return iterableEqual(leftHandItems.sort(), rightHandItems.sort(), options);
}
__name(entriesEqual, "entriesEqual");
function iterableEqual(leftHandOperand, rightHandOperand, options) {
  var length = leftHandOperand.length;
  if (length !== rightHandOperand.length) {
    return false;
  }
  if (length === 0) {
    return true;
  }
  var index = -1;
  while (++index < length) {
    if (deepEqual(leftHandOperand[index], rightHandOperand[index], options) === false) {
      return false;
    }
  }
  return true;
}
__name(iterableEqual, "iterableEqual");
function generatorEqual(leftHandOperand, rightHandOperand, options) {
  return iterableEqual(getGeneratorEntries(leftHandOperand), getGeneratorEntries(rightHandOperand), options);
}
__name(generatorEqual, "generatorEqual");
function hasIteratorFunction(target) {
  return typeof Symbol !== "undefined" && typeof target === "object" && typeof Symbol.iterator !== "undefined" && typeof target[Symbol.iterator] === "function";
}
__name(hasIteratorFunction, "hasIteratorFunction");
function getIteratorEntries(target) {
  if (hasIteratorFunction(target)) {
    try {
      return getGeneratorEntries(target[Symbol.iterator]());
    } catch (iteratorError) {
      return [];
    }
  }
  return [];
}
__name(getIteratorEntries, "getIteratorEntries");
function getGeneratorEntries(generator) {
  var generatorResult = generator.next();
  var accumulator = [generatorResult.value];
  while (generatorResult.done === false) {
    generatorResult = generator.next();
    accumulator.push(generatorResult.value);
  }
  return accumulator;
}
__name(getGeneratorEntries, "getGeneratorEntries");
function getEnumerableKeys(target) {
  var keys = [];
  for (var key in target) {
    keys.push(key);
  }
  return keys;
}
__name(getEnumerableKeys, "getEnumerableKeys");
function getEnumerableSymbols(target) {
  var keys = [];
  var allKeys = Object.getOwnPropertySymbols(target);
  for (var i = 0; i < allKeys.length; i += 1) {
    var key = allKeys[i];
    if (Object.getOwnPropertyDescriptor(target, key).enumerable) {
      keys.push(key);
    }
  }
  return keys;
}
__name(getEnumerableSymbols, "getEnumerableSymbols");
function keysEqual(leftHandOperand, rightHandOperand, keys, options) {
  var length = keys.length;
  if (length === 0) {
    return true;
  }
  for (var i = 0; i < length; i += 1) {
    if (deepEqual(leftHandOperand[keys[i]], rightHandOperand[keys[i]], options) === false) {
      return false;
    }
  }
  return true;
}
__name(keysEqual, "keysEqual");
function objectEqual(leftHandOperand, rightHandOperand, options) {
  var leftHandKeys = getEnumerableKeys(leftHandOperand);
  var rightHandKeys = getEnumerableKeys(rightHandOperand);
  var leftHandSymbols = getEnumerableSymbols(leftHandOperand);
  var rightHandSymbols = getEnumerableSymbols(rightHandOperand);
  leftHandKeys = leftHandKeys.concat(leftHandSymbols);
  rightHandKeys = rightHandKeys.concat(rightHandSymbols);
  if (leftHandKeys.length && leftHandKeys.length === rightHandKeys.length) {
    if (iterableEqual(mapSymbols(leftHandKeys).sort(), mapSymbols(rightHandKeys).sort()) === false) {
      return false;
    }
    return keysEqual(leftHandOperand, rightHandOperand, leftHandKeys, options);
  }
  var leftHandEntries = getIteratorEntries(leftHandOperand);
  var rightHandEntries = getIteratorEntries(rightHandOperand);
  if (leftHandEntries.length && leftHandEntries.length === rightHandEntries.length) {
    leftHandEntries.sort();
    rightHandEntries.sort();
    return iterableEqual(leftHandEntries, rightHandEntries, options);
  }
  if (leftHandKeys.length === 0 && leftHandEntries.length === 0 && rightHandKeys.length === 0 && rightHandEntries.length === 0) {
    return true;
  }
  return false;
}
__name(objectEqual, "objectEqual");
function isPrimitive(value) {
  return value === null || typeof value !== "object";
}
__name(isPrimitive, "isPrimitive");
function mapSymbols(arr) {
  return arr.map(/* @__PURE__ */ __name(function mapSymbol(entry) {
    if (typeof entry === "symbol") {
      return entry.toString();
    }
    return entry;
  }, "mapSymbol"));
}
__name(mapSymbols, "mapSymbols");

// node_modules/pathval/index.js
function hasProperty(obj, name) {
  if (typeof obj === "undefined" || obj === null) {
    return false;
  }
  return name in Object(obj);
}
__name(hasProperty, "hasProperty");
function parsePath(path) {
  const str = path.replace(/([^\\])\[/g, "$1.[");
  const parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map((value) => {
    if (value === "constructor" || value === "__proto__" || value === "prototype") {
      return {};
    }
    const regexp = /^\[(\d+)\]$/;
    const mArr = regexp.exec(value);
    let parsed = null;
    if (mArr) {
      parsed = { i: parseFloat(mArr[1]) };
    } else {
      parsed = { p: value.replace(/\\([.[\]])/g, "$1") };
    }
    return parsed;
  });
}
__name(parsePath, "parsePath");
function internalGetPathValue(obj, parsed, pathDepth) {
  let temporaryValue = obj;
  let res = null;
  pathDepth = typeof pathDepth === "undefined" ? parsed.length : pathDepth;
  for (let i = 0; i < pathDepth; i++) {
    const part = parsed[i];
    if (temporaryValue) {
      if (typeof part.p === "undefined") {
        temporaryValue = temporaryValue[part.i];
      } else {
        temporaryValue = temporaryValue[part.p];
      }
      if (i === pathDepth - 1) {
        res = temporaryValue;
      }
    }
  }
  return res;
}
__name(internalGetPathValue, "internalGetPathValue");
function getPathInfo(obj, path) {
  const parsed = parsePath(path);
  const last = parsed[parsed.length - 1];
  const info = {
    parent: parsed.length > 1 ? internalGetPathValue(obj, parsed, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: internalGetPathValue(obj, parsed)
  };
  info.exists = hasProperty(info.parent, info.name);
  return info;
}
__name(getPathInfo, "getPathInfo");

// lib/chai/assertion.js
var _Assertion = class _Assertion {
  /**
   * Creates object for chaining.
   * `Assertion` objects contain metadata in the form of flags. Three flags can
   * be assigned during instantiation by passing arguments to this constructor:
   *
   * - `object`: This flag contains the target of the assertion. For example, in
   * the assertion `expect(numKittens).to.equal(7);`, the `object` flag will
   * contain `numKittens` so that the `equal` assertion can reference it when
   * needed.
   *
   * - `message`: This flag contains an optional custom error message to be
   * prepended to the error message that's generated by the assertion when it
   * fails.
   *
   * - `ssfi`: This flag stands for "start stack function indicator". It
   * contains a function reference that serves as the starting point for
   * removing frames from the stack trace of the error that's created by the
   * assertion when it fails. The goal is to provide a cleaner stack trace to
   * end users by removing Chai's internal functions. Note that it only works
   * in environments that support `Error.captureStackTrace`, and only when
   * `Chai.config.includeStack` hasn't been set to `false`.
   *
   * - `lockSsfi`: This flag controls whether or not the given `ssfi` flag
   * should retain its current value, even as assertions are chained off of
   * this object. This is usually set to `true` when creating a new assertion
   * from within another assertion. It's also temporarily set to `true` before
   * an overwritten assertion gets called by the overwriting assertion.
   *
   * - `eql`: This flag contains the deepEqual function to be used by the assertion.
   *
   * @param {unknown} obj target of the assertion
   * @param {string} [msg] (optional) custom error message
   * @param {Function} [ssfi] (optional) starting point for removing stack frames
   * @param {boolean} [lockSsfi] (optional) whether or not the ssfi flag is locked
   */
  constructor(obj, msg, ssfi, lockSsfi) {
    /** @type {{}} */
    __publicField(this, "__flags", {});
    flag(this, "ssfi", ssfi || _Assertion);
    flag(this, "lockSsfi", lockSsfi);
    flag(this, "object", obj);
    flag(this, "message", msg);
    flag(this, "eql", config.deepEqual || deep_eql_default);
    return proxify(this);
  }
  /** @returns {boolean} */
  static get includeStack() {
    console.warn(
      "Assertion.includeStack is deprecated, use chai.config.includeStack instead."
    );
    return config.includeStack;
  }
  /** @param {boolean} value */
  static set includeStack(value) {
    console.warn(
      "Assertion.includeStack is deprecated, use chai.config.includeStack instead."
    );
    config.includeStack = value;
  }
  /** @returns {boolean} */
  static get showDiff() {
    console.warn(
      "Assertion.showDiff is deprecated, use chai.config.showDiff instead."
    );
    return config.showDiff;
  }
  /** @param {boolean} value */
  static set showDiff(value) {
    console.warn(
      "Assertion.showDiff is deprecated, use chai.config.showDiff instead."
    );
    config.showDiff = value;
  }
  /**
   * @param {string} name
   * @param {Function} fn
   */
  static addProperty(name, fn) {
    addProperty(this.prototype, name, fn);
  }
  /**
   * @param {string} name
   * @param {Function} fn
   */
  static addMethod(name, fn) {
    addMethod(this.prototype, name, fn);
  }
  /**
   * @param {string} name
   * @param {Function} fn
   * @param {Function} chainingBehavior
   */
  static addChainableMethod(name, fn, chainingBehavior) {
    addChainableMethod(this.prototype, name, fn, chainingBehavior);
  }
  /**
   * @param {string} name
   * @param {Function} fn
   */
  static overwriteProperty(name, fn) {
    overwriteProperty(this.prototype, name, fn);
  }
  /**
   * @param {string} name
   * @param {Function} fn
   */
  static overwriteMethod(name, fn) {
    overwriteMethod(this.prototype, name, fn);
  }
  /**
   * @param {string} name
   * @param {Function} fn
   * @param {Function} chainingBehavior
   */
  static overwriteChainableMethod(name, fn, chainingBehavior) {
    overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  }
  /**
   * ### .assert(expression, message, negateMessage, expected, actual, showDiff)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {unknown} _expr to be tested
   * @param {string | Function} msg or function that returns message to display if expression fails
   * @param {string | Function} _negateMsg or function that returns negatedMessage to display if negated expression fails
   * @param {unknown} expected value (remember to check for negation)
   * @param {unknown} _actual (optional) will default to `this.obj`
   * @param {boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
   * @returns {void}
   */
  assert(_expr, msg, _negateMsg, expected, _actual, showDiff) {
    const ok = test(this, arguments);
    if (false !== showDiff) showDiff = true;
    if (void 0 === expected && void 0 === _actual) showDiff = false;
    if (true !== config.showDiff) showDiff = false;
    if (!ok) {
      msg = getMessage2(this, arguments);
      const actual = getActual(this, arguments);
      const assertionErrorObjectProperties = {
        actual,
        expected,
        showDiff
      };
      const operator = getOperator(this, arguments);
      if (operator) {
        assertionErrorObjectProperties.operator = operator;
      }
      throw new AssertionError(
        msg,
        assertionErrorObjectProperties,
        // @ts-expect-error Not sure what to do about these types yet
        config.includeStack ? this.assert : flag(this, "ssfi")
      );
    }
  }
  /**
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @returns {unknown}
   */
  get _obj() {
    return flag(this, "object");
  }
  /**
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @param {unknown} val
   */
  set _obj(val) {
    flag(this, "object", val);
  }
};
__name(_Assertion, "Assertion");
var Assertion = _Assertion;

// lib/chai/utils/events.js
var events = new EventTarget();
var _PluginEvent = class _PluginEvent extends Event {
  constructor(type3, name, fn) {
    super(type3);
    this.name = String(name);
    this.fn = fn;
  }
};
__name(_PluginEvent, "PluginEvent");
var PluginEvent = _PluginEvent;

// lib/chai/utils/isProxyEnabled.js
function isProxyEnabled() {
  return config.useProxy && typeof Proxy !== "undefined" && typeof Reflect !== "undefined";
}
__name(isProxyEnabled, "isProxyEnabled");

// lib/chai/utils/addProperty.js
function addProperty(ctx, name, getter) {
  getter = getter === void 0 ? function() {
  } : getter;
  Object.defineProperty(ctx, name, {
    get: /* @__PURE__ */ __name(function propertyGetter() {
      if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
        flag(this, "ssfi", propertyGetter);
      }
      let result = getter.call(this);
      if (result !== void 0) return result;
      let newAssertion = new Assertion();
      transferFlags(this, newAssertion);
      return newAssertion;
    }, "propertyGetter"),
    configurable: true
  });
  events.dispatchEvent(new PluginEvent("addProperty", name, getter));
}
__name(addProperty, "addProperty");

// lib/chai/utils/addLengthGuard.js
var fnLengthDesc = Object.getOwnPropertyDescriptor(function() {
}, "length");
function addLengthGuard(fn, assertionName, isChainable) {
  if (!fnLengthDesc.configurable) return fn;
  Object.defineProperty(fn, "length", {
    get: /* @__PURE__ */ __name(function() {
      if (isChainable) {
        throw Error(
          "Invalid Chai property: " + assertionName + '.length. Due to a compatibility issue, "length" cannot directly follow "' + assertionName + '". Use "' + assertionName + '.lengthOf" instead.'
        );
      }
      throw Error(
        "Invalid Chai property: " + assertionName + '.length. See docs for proper usage of "' + assertionName + '".'
      );
    }, "get")
  });
  return fn;
}
__name(addLengthGuard, "addLengthGuard");

// lib/chai/utils/getProperties.js
function getProperties(object) {
  let result = Object.getOwnPropertyNames(object);
  function addProperty2(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }
  __name(addProperty2, "addProperty");
  let proto = Object.getPrototypeOf(object);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty2);
    proto = Object.getPrototypeOf(proto);
  }
  return result;
}
__name(getProperties, "getProperties");

// lib/chai/utils/proxify.js
var builtins = ["__flags", "__methods", "_obj", "assert"];
function proxify(obj, nonChainableMethodName) {
  if (!isProxyEnabled()) return obj;
  return new Proxy(obj, {
    get: /* @__PURE__ */ __name(function proxyGetter(target, property) {
      if (typeof property === "string" && config.proxyExcludedKeys.indexOf(property) === -1 && !Reflect.has(target, property)) {
        if (nonChainableMethodName) {
          throw Error(
            "Invalid Chai property: " + nonChainableMethodName + "." + property + '. See docs for proper usage of "' + nonChainableMethodName + '".'
          );
        }
        let suggestion = null;
        let suggestionDistance = 4;
        getProperties(target).forEach(function(prop) {
          if (
            // we actually mean to check `Object.prototype` here
            // eslint-disable-next-line no-prototype-builtins
            !Object.prototype.hasOwnProperty(prop) && builtins.indexOf(prop) === -1
          ) {
            let dist = stringDistanceCapped(property, prop, suggestionDistance);
            if (dist < suggestionDistance) {
              suggestion = prop;
              suggestionDistance = dist;
            }
          }
        });
        if (suggestion !== null) {
          throw Error(
            "Invalid Chai property: " + property + '. Did you mean "' + suggestion + '"?'
          );
        } else {
          throw Error("Invalid Chai property: " + property);
        }
      }
      if (builtins.indexOf(property) === -1 && !flag(target, "lockSsfi")) {
        flag(target, "ssfi", proxyGetter);
      }
      return Reflect.get(target, property);
    }, "proxyGetter")
  });
}
__name(proxify, "proxify");
function stringDistanceCapped(strA, strB, cap) {
  if (Math.abs(strA.length - strB.length) >= cap) {
    return cap;
  }
  let memo = [];
  for (let i = 0; i <= strA.length; i++) {
    memo[i] = Array(strB.length + 1).fill(0);
    memo[i][0] = i;
  }
  for (let j = 0; j < strB.length; j++) {
    memo[0][j] = j;
  }
  for (let i = 1; i <= strA.length; i++) {
    let ch = strA.charCodeAt(i - 1);
    for (let j = 1; j <= strB.length; j++) {
      if (Math.abs(i - j) >= cap) {
        memo[i][j] = cap;
        continue;
      }
      memo[i][j] = Math.min(
        memo[i - 1][j] + 1,
        memo[i][j - 1] + 1,
        memo[i - 1][j - 1] + (ch === strB.charCodeAt(j - 1) ? 0 : 1)
      );
    }
  }
  return memo[strA.length][strB.length];
}
__name(stringDistanceCapped, "stringDistanceCapped");

// lib/chai/utils/addMethod.js
function addMethod(ctx, name, method) {
  let methodWrapper = /* @__PURE__ */ __name(function() {
    if (!flag(this, "lockSsfi")) {
      flag(this, "ssfi", methodWrapper);
    }
    let result = method.apply(this, arguments);
    if (result !== void 0) return result;
    let newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "methodWrapper");
  addLengthGuard(methodWrapper, name, false);
  ctx[name] = proxify(methodWrapper, name);
  events.dispatchEvent(new PluginEvent("addMethod", name, method));
}
__name(addMethod, "addMethod");

// lib/chai/utils/overwriteProperty.js
function overwriteProperty(ctx, name, getter) {
  let _get = Object.getOwnPropertyDescriptor(ctx, name), _super = /* @__PURE__ */ __name(function() {
  }, "_super");
  if (_get && "function" === typeof _get.get) _super = _get.get;
  Object.defineProperty(ctx, name, {
    get: /* @__PURE__ */ __name(function overwritingPropertyGetter() {
      if (!isProxyEnabled() && !flag(this, "lockSsfi")) {
        flag(this, "ssfi", overwritingPropertyGetter);
      }
      let origLockSsfi = flag(this, "lockSsfi");
      flag(this, "lockSsfi", true);
      let result = getter(_super).call(this);
      flag(this, "lockSsfi", origLockSsfi);
      if (result !== void 0) {
        return result;
      }
      let newAssertion = new Assertion();
      transferFlags(this, newAssertion);
      return newAssertion;
    }, "overwritingPropertyGetter"),
    configurable: true
  });
}
__name(overwriteProperty, "overwriteProperty");

// lib/chai/utils/overwriteMethod.js
function overwriteMethod(ctx, name, method) {
  let _method = ctx[name], _super = /* @__PURE__ */ __name(function() {
    throw new Error(name + " is not a function");
  }, "_super");
  if (_method && "function" === typeof _method) _super = _method;
  let overwritingMethodWrapper = /* @__PURE__ */ __name(function() {
    if (!flag(this, "lockSsfi")) {
      flag(this, "ssfi", overwritingMethodWrapper);
    }
    let origLockSsfi = flag(this, "lockSsfi");
    flag(this, "lockSsfi", true);
    let result = method(_super).apply(this, arguments);
    flag(this, "lockSsfi", origLockSsfi);
    if (result !== void 0) {
      return result;
    }
    let newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingMethodWrapper");
  addLengthGuard(overwritingMethodWrapper, name, false);
  ctx[name] = proxify(overwritingMethodWrapper, name);
}
__name(overwriteMethod, "overwriteMethod");

// lib/chai/utils/addChainableMethod.js
var canSetPrototype = typeof Object.setPrototypeOf === "function";
var testFn = /* @__PURE__ */ __name(function() {
}, "testFn");
var excludeNames = Object.getOwnPropertyNames(testFn).filter(function(name) {
  let propDesc = Object.getOwnPropertyDescriptor(testFn, name);
  if (typeof propDesc !== "object") return true;
  return !propDesc.configurable;
});
var call = Function.prototype.call;
var apply = Function.prototype.apply;
var _PluginAddChainableMethodEvent = class _PluginAddChainableMethodEvent extends PluginEvent {
  constructor(type3, name, fn, chainingBehavior) {
    super(type3, name, fn);
    this.chainingBehavior = chainingBehavior;
  }
};
__name(_PluginAddChainableMethodEvent, "PluginAddChainableMethodEvent");
var PluginAddChainableMethodEvent = _PluginAddChainableMethodEvent;
function addChainableMethod(ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== "function") {
    chainingBehavior = /* @__PURE__ */ __name(function() {
    }, "chainingBehavior");
  }
  let chainableBehavior = {
    method,
    chainingBehavior
  };
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;
  Object.defineProperty(ctx, name, {
    get: /* @__PURE__ */ __name(function chainableMethodGetter() {
      chainableBehavior.chainingBehavior.call(this);
      let chainableMethodWrapper = /* @__PURE__ */ __name(function() {
        if (!flag(this, "lockSsfi")) {
          flag(this, "ssfi", chainableMethodWrapper);
        }
        let result = chainableBehavior.method.apply(this, arguments);
        if (result !== void 0) {
          return result;
        }
        let newAssertion = new Assertion();
        transferFlags(this, newAssertion);
        return newAssertion;
      }, "chainableMethodWrapper");
      addLengthGuard(chainableMethodWrapper, name, true);
      if (canSetPrototype) {
        let prototype = Object.create(this);
        prototype.call = call;
        prototype.apply = apply;
        Object.setPrototypeOf(chainableMethodWrapper, prototype);
      } else {
        let asserterNames = Object.getOwnPropertyNames(ctx);
        asserterNames.forEach(function(asserterName) {
          if (excludeNames.indexOf(asserterName) !== -1) {
            return;
          }
          let pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
          Object.defineProperty(chainableMethodWrapper, asserterName, pd);
        });
      }
      transferFlags(this, chainableMethodWrapper);
      return proxify(chainableMethodWrapper);
    }, "chainableMethodGetter"),
    configurable: true
  });
  events.dispatchEvent(
    new PluginAddChainableMethodEvent(
      "addChainableMethod",
      name,
      method,
      chainingBehavior
    )
  );
}
__name(addChainableMethod, "addChainableMethod");

// lib/chai/utils/overwriteChainableMethod.js
function overwriteChainableMethod(ctx, name, method, chainingBehavior) {
  let chainableBehavior = ctx.__methods[name];
  let _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = /* @__PURE__ */ __name(function overwritingChainableMethodGetter() {
    let result = chainingBehavior(_chainingBehavior).call(this);
    if (result !== void 0) {
      return result;
    }
    let newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingChainableMethodGetter");
  let _method = chainableBehavior.method;
  chainableBehavior.method = /* @__PURE__ */ __name(function overwritingChainableMethodWrapper() {
    let result = method(_method).apply(this, arguments);
    if (result !== void 0) {
      return result;
    }
    let newAssertion = new Assertion();
    transferFlags(this, newAssertion);
    return newAssertion;
  }, "overwritingChainableMethodWrapper");
}
__name(overwriteChainableMethod, "overwriteChainableMethod");

// lib/chai/utils/compareByInspect.js
function compareByInspect(a, b) {
  return inspect2(a) < inspect2(b) ? -1 : 1;
}
__name(compareByInspect, "compareByInspect");

// lib/chai/utils/getOwnEnumerablePropertySymbols.js
function getOwnEnumerablePropertySymbols(obj) {
  if (typeof Object.getOwnPropertySymbols !== "function") return [];
  return Object.getOwnPropertySymbols(obj).filter(function(sym) {
    return Object.getOwnPropertyDescriptor(obj, sym).enumerable;
  });
}
__name(getOwnEnumerablePropertySymbols, "getOwnEnumerablePropertySymbols");

// lib/chai/utils/getOwnEnumerableProperties.js
function getOwnEnumerableProperties(obj) {
  return Object.keys(obj).concat(getOwnEnumerablePropertySymbols(obj));
}
__name(getOwnEnumerableProperties, "getOwnEnumerableProperties");

// lib/chai/utils/isNaN.js
var isNaN2 = Number.isNaN;

// lib/chai/utils/getOperator.js
function isObjectType(obj) {
  let objectType = type(obj);
  let objectTypes = ["Array", "Object", "Function"];
  return objectTypes.indexOf(objectType) !== -1;
}
__name(isObjectType, "isObjectType");
function getOperator(obj, args) {
  let operator = flag(obj, "operator");
  let negate = flag(obj, "negate");
  let expected = args[3];
  let msg = negate ? args[2] : args[1];
  if (operator) {
    return operator;
  }
  if (typeof msg === "function") msg = msg();
  msg = msg || "";
  if (!msg) {
    return void 0;
  }
  if (/\shave\s/.test(msg)) {
    return void 0;
  }
  let isObject = isObjectType(expected);
  if (/\snot\s/.test(msg)) {
    return isObject ? "notDeepStrictEqual" : "notStrictEqual";
  }
  return isObject ? "deepStrictEqual" : "strictEqual";
}
__name(getOperator, "getOperator");

// lib/chai/utils/index.js
function getName(fn) {
  return fn.name;
}
__name(getName, "getName");
function isRegExp2(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
}
__name(isRegExp2, "isRegExp");
function isNumeric(obj) {
  return ["Number", "BigInt"].includes(type(obj));
}
__name(isNumeric, "isNumeric");

// lib/chai/core/assertions.js
var { flag: flag2 } = utils_exports;
[
  "to",
  "be",
  "been",
  "is",
  "and",
  "has",
  "have",
  "with",
  "that",
  "which",
  "at",
  "of",
  "same",
  "but",
  "does",
  "still",
  "also"
].forEach(function(chain) {
  Assertion.addProperty(chain);
});
Assertion.addProperty("not", function() {
  flag2(this, "negate", true);
});
Assertion.addProperty("deep", function() {
  flag2(this, "deep", true);
});
Assertion.addProperty("nested", function() {
  flag2(this, "nested", true);
});
Assertion.addProperty("own", function() {
  flag2(this, "own", true);
});
Assertion.addProperty("ordered", function() {
  flag2(this, "ordered", true);
});
Assertion.addProperty("any", function() {
  flag2(this, "any", true);
  flag2(this, "all", false);
});
Assertion.addProperty("all", function() {
  flag2(this, "all", true);
  flag2(this, "any", false);
});
var functionTypes = {
  function: [
    "function",
    "asyncfunction",
    "generatorfunction",
    "asyncgeneratorfunction"
  ],
  asyncfunction: ["asyncfunction", "asyncgeneratorfunction"],
  generatorfunction: ["generatorfunction", "asyncgeneratorfunction"],
  asyncgeneratorfunction: ["asyncgeneratorfunction"]
};
function an(type3, msg) {
  if (msg) flag2(this, "message", msg);
  type3 = type3.toLowerCase();
  let obj = flag2(this, "object"), article = ~["a", "e", "i", "o", "u"].indexOf(type3.charAt(0)) ? "an " : "a ";
  const detectedType = type(obj).toLowerCase();
  if (functionTypes["function"].includes(type3)) {
    this.assert(
      functionTypes[type3].includes(detectedType),
      "expected #{this} to be " + article + type3,
      "expected #{this} not to be " + article + type3
    );
  } else {
    this.assert(
      type3 === detectedType,
      "expected #{this} to be " + article + type3,
      "expected #{this} not to be " + article + type3
    );
  }
}
__name(an, "an");
Assertion.addChainableMethod("an", an);
Assertion.addChainableMethod("a", an);
function SameValueZero(a, b) {
  return isNaN2(a) && isNaN2(b) || a === b;
}
__name(SameValueZero, "SameValueZero");
function includeChainingBehavior() {
  flag2(this, "contains", true);
}
__name(includeChainingBehavior, "includeChainingBehavior");
function include(val, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), objType = type(obj).toLowerCase(), flagMsg = flag2(this, "message"), negate = flag2(this, "negate"), ssfi = flag2(this, "ssfi"), isDeep = flag2(this, "deep"), descriptor = isDeep ? "deep " : "", isEql = isDeep ? flag2(this, "eql") : SameValueZero;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  let included = false;
  switch (objType) {
    case "string":
      included = obj.indexOf(val) !== -1;
      break;
    case "weakset":
      if (isDeep) {
        throw new AssertionError(
          flagMsg + "unable to use .deep.include with WeakSet",
          void 0,
          ssfi
        );
      }
      included = obj.has(val);
      break;
    case "map":
      obj.forEach(function(item) {
        included = included || isEql(item, val);
      });
      break;
    case "set":
      if (isDeep) {
        obj.forEach(function(item) {
          included = included || isEql(item, val);
        });
      } else {
        included = obj.has(val);
      }
      break;
    case "array":
      if (isDeep) {
        included = obj.some(function(item) {
          return isEql(item, val);
        });
      } else {
        included = obj.indexOf(val) !== -1;
      }
      break;
    default: {
      if (val !== Object(val)) {
        throw new AssertionError(
          flagMsg + "the given combination of arguments (" + objType + " and " + type(val).toLowerCase() + ") is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a " + type(val).toLowerCase(),
          void 0,
          ssfi
        );
      }
      let props = Object.keys(val);
      let firstErr = null;
      let numErrs = 0;
      props.forEach(function(prop) {
        let propAssertion = new Assertion(obj);
        transferFlags(this, propAssertion, true);
        flag2(propAssertion, "lockSsfi", true);
        if (!negate || props.length === 1) {
          propAssertion.property(prop, val[prop]);
          return;
        }
        try {
          propAssertion.property(prop, val[prop]);
        } catch (err) {
          if (!check_error_exports.compatibleConstructor(err, AssertionError)) {
            throw err;
          }
          if (firstErr === null) firstErr = err;
          numErrs++;
        }
      }, this);
      if (negate && props.length > 1 && numErrs === props.length) {
        throw firstErr;
      }
      return;
    }
  }
  this.assert(
    included,
    "expected #{this} to " + descriptor + "include " + inspect2(val),
    "expected #{this} to not " + descriptor + "include " + inspect2(val)
  );
}
__name(include, "include");
Assertion.addChainableMethod("include", include, includeChainingBehavior);
Assertion.addChainableMethod("contain", include, includeChainingBehavior);
Assertion.addChainableMethod("contains", include, includeChainingBehavior);
Assertion.addChainableMethod("includes", include, includeChainingBehavior);
Assertion.addProperty("ok", function() {
  this.assert(
    flag2(this, "object"),
    "expected #{this} to be truthy",
    "expected #{this} to be falsy"
  );
});
Assertion.addProperty("true", function() {
  this.assert(
    true === flag2(this, "object"),
    "expected #{this} to be true",
    "expected #{this} to be false",
    flag2(this, "negate") ? false : true
  );
});
Assertion.addProperty("numeric", function() {
  const object = flag2(this, "object");
  this.assert(
    ["Number", "BigInt"].includes(type(object)),
    "expected #{this} to be numeric",
    "expected #{this} to not be numeric",
    flag2(this, "negate") ? false : true
  );
});
Assertion.addProperty("callable", function() {
  const val = flag2(this, "object");
  const ssfi = flag2(this, "ssfi");
  const message = flag2(this, "message");
  const msg = message ? `${message}: ` : "";
  const negate = flag2(this, "negate");
  const assertionMessage = negate ? `${msg}expected ${inspect2(val)} not to be a callable function` : `${msg}expected ${inspect2(val)} to be a callable function`;
  const isCallable = [
    "Function",
    "AsyncFunction",
    "GeneratorFunction",
    "AsyncGeneratorFunction"
  ].includes(type(val));
  if (isCallable && negate || !isCallable && !negate) {
    throw new AssertionError(assertionMessage, void 0, ssfi);
  }
});
Assertion.addProperty("false", function() {
  this.assert(
    false === flag2(this, "object"),
    "expected #{this} to be false",
    "expected #{this} to be true",
    flag2(this, "negate") ? true : false
  );
});
Assertion.addProperty("null", function() {
  this.assert(
    null === flag2(this, "object"),
    "expected #{this} to be null",
    "expected #{this} not to be null"
  );
});
Assertion.addProperty("undefined", function() {
  this.assert(
    void 0 === flag2(this, "object"),
    "expected #{this} to be undefined",
    "expected #{this} not to be undefined"
  );
});
Assertion.addProperty("NaN", function() {
  this.assert(
    isNaN2(flag2(this, "object")),
    "expected #{this} to be NaN",
    "expected #{this} not to be NaN"
  );
});
function assertExist() {
  let val = flag2(this, "object");
  this.assert(
    val !== null && val !== void 0,
    "expected #{this} to exist",
    "expected #{this} to not exist"
  );
}
__name(assertExist, "assertExist");
Assertion.addProperty("exist", assertExist);
Assertion.addProperty("exists", assertExist);
Assertion.addProperty("empty", function() {
  let val = flag2(this, "object"), ssfi = flag2(this, "ssfi"), flagMsg = flag2(this, "message"), itemsCount;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  switch (type(val).toLowerCase()) {
    case "array":
    case "string":
      itemsCount = val.length;
      break;
    case "map":
    case "set":
      itemsCount = val.size;
      break;
    case "weakmap":
    case "weakset":
      throw new AssertionError(
        flagMsg + ".empty was passed a weak collection",
        void 0,
        ssfi
      );
    case "function": {
      const msg = flagMsg + ".empty was passed a function " + getName(val);
      throw new AssertionError(msg.trim(), void 0, ssfi);
    }
    default:
      if (val !== Object(val)) {
        throw new AssertionError(
          flagMsg + ".empty was passed non-string primitive " + inspect2(val),
          void 0,
          ssfi
        );
      }
      itemsCount = Object.keys(val).length;
  }
  this.assert(
    0 === itemsCount,
    "expected #{this} to be empty",
    "expected #{this} not to be empty"
  );
});
function checkArguments() {
  let obj = flag2(this, "object"), type3 = type(obj);
  this.assert(
    "Arguments" === type3,
    "expected #{this} to be arguments but got " + type3,
    "expected #{this} to not be arguments"
  );
}
__name(checkArguments, "checkArguments");
Assertion.addProperty("arguments", checkArguments);
Assertion.addProperty("Arguments", checkArguments);
function assertEqual(val, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object");
  if (flag2(this, "deep")) {
    let prevLockSsfi = flag2(this, "lockSsfi");
    flag2(this, "lockSsfi", true);
    this.eql(val);
    flag2(this, "lockSsfi", prevLockSsfi);
  } else {
    this.assert(
      val === obj,
      "expected #{this} to equal #{exp}",
      "expected #{this} to not equal #{exp}",
      val,
      this._obj,
      true
    );
  }
}
__name(assertEqual, "assertEqual");
Assertion.addMethod("equal", assertEqual);
Assertion.addMethod("equals", assertEqual);
Assertion.addMethod("eq", assertEqual);
function assertEql(obj, msg) {
  if (msg) flag2(this, "message", msg);
  let eql = flag2(this, "eql");
  this.assert(
    eql(obj, flag2(this, "object")),
    "expected #{this} to deeply equal #{exp}",
    "expected #{this} to not deeply equal #{exp}",
    obj,
    this._obj,
    true
  );
}
__name(assertEql, "assertEql");
Assertion.addMethod("eql", assertEql);
Assertion.addMethod("eqls", assertEql);
function assertAbove(n, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase();
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && objType === "date" && nType !== "date") {
    throw new AssertionError(
      msgPrefix + "the argument to above must be a date",
      void 0,
      ssfi
    );
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    throw new AssertionError(
      msgPrefix + "the argument to above must be a number",
      void 0,
      ssfi
    );
  } else if (!doLength && objType !== "date" && !isNumeric(obj)) {
    let printObj = objType === "string" ? "'" + obj + "'" : obj;
    throw new AssertionError(
      msgPrefix + "expected " + printObj + " to be a number or a date",
      void 0,
      ssfi
    );
  }
  if (doLength) {
    let descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount > n,
      "expected #{this} to have a " + descriptor + " above #{exp} but got #{act}",
      "expected #{this} to not have a " + descriptor + " above #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj > n,
      "expected #{this} to be above #{exp}",
      "expected #{this} to be at most #{exp}",
      n
    );
  }
}
__name(assertAbove, "assertAbove");
Assertion.addMethod("above", assertAbove);
Assertion.addMethod("gt", assertAbove);
Assertion.addMethod("greaterThan", assertAbove);
function assertLeast(n, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && objType === "date" && nType !== "date") {
    errorMessage = msgPrefix + "the argument to least must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to least must be a number";
  } else if (!doLength && objType !== "date" && !isNumeric(obj)) {
    let printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    let descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount >= n,
      "expected #{this} to have a " + descriptor + " at least #{exp} but got #{act}",
      "expected #{this} to have a " + descriptor + " below #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj >= n,
      "expected #{this} to be at least #{exp}",
      "expected #{this} to be below #{exp}",
      n
    );
  }
}
__name(assertLeast, "assertLeast");
Assertion.addMethod("least", assertLeast);
Assertion.addMethod("gte", assertLeast);
Assertion.addMethod("greaterThanOrEqual", assertLeast);
function assertBelow(n, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && objType === "date" && nType !== "date") {
    errorMessage = msgPrefix + "the argument to below must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to below must be a number";
  } else if (!doLength && objType !== "date" && !isNumeric(obj)) {
    let printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    let descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount < n,
      "expected #{this} to have a " + descriptor + " below #{exp} but got #{act}",
      "expected #{this} to not have a " + descriptor + " below #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj < n,
      "expected #{this} to be below #{exp}",
      "expected #{this} to be at least #{exp}",
      n
    );
  }
}
__name(assertBelow, "assertBelow");
Assertion.addMethod("below", assertBelow);
Assertion.addMethod("lt", assertBelow);
Assertion.addMethod("lessThan", assertBelow);
function assertMost(n, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), nType = type(n).toLowerCase(), errorMessage, shouldThrow = true;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && objType === "date" && nType !== "date") {
    errorMessage = msgPrefix + "the argument to most must be a date";
  } else if (!isNumeric(n) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the argument to most must be a number";
  } else if (!doLength && objType !== "date" && !isNumeric(obj)) {
    let printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    let descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount <= n,
      "expected #{this} to have a " + descriptor + " at most #{exp} but got #{act}",
      "expected #{this} to have a " + descriptor + " above #{exp}",
      n,
      itemsCount
    );
  } else {
    this.assert(
      obj <= n,
      "expected #{this} to be at most #{exp}",
      "expected #{this} to be above #{exp}",
      n
    );
  }
}
__name(assertMost, "assertMost");
Assertion.addMethod("most", assertMost);
Assertion.addMethod("lte", assertMost);
Assertion.addMethod("lessThanOrEqual", assertMost);
Assertion.addMethod("within", function(start, finish, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), doLength = flag2(this, "doLength"), flagMsg = flag2(this, "message"), msgPrefix = flagMsg ? flagMsg + ": " : "", ssfi = flag2(this, "ssfi"), objType = type(obj).toLowerCase(), startType = type(start).toLowerCase(), finishType = type(finish).toLowerCase(), errorMessage, shouldThrow = true, range = startType === "date" && finishType === "date" ? start.toISOString() + ".." + finish.toISOString() : start + ".." + finish;
  if (doLength && objType !== "map" && objType !== "set") {
    new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
  }
  if (!doLength && objType === "date" && (startType !== "date" || finishType !== "date")) {
    errorMessage = msgPrefix + "the arguments to within must be dates";
  } else if ((!isNumeric(start) || !isNumeric(finish)) && (doLength || isNumeric(obj))) {
    errorMessage = msgPrefix + "the arguments to within must be numbers";
  } else if (!doLength && objType !== "date" && !isNumeric(obj)) {
    let printObj = objType === "string" ? "'" + obj + "'" : obj;
    errorMessage = msgPrefix + "expected " + printObj + " to be a number or a date";
  } else {
    shouldThrow = false;
  }
  if (shouldThrow) {
    throw new AssertionError(errorMessage, void 0, ssfi);
  }
  if (doLength) {
    let descriptor = "length", itemsCount;
    if (objType === "map" || objType === "set") {
      descriptor = "size";
      itemsCount = obj.size;
    } else {
      itemsCount = obj.length;
    }
    this.assert(
      itemsCount >= start && itemsCount <= finish,
      "expected #{this} to have a " + descriptor + " within " + range,
      "expected #{this} to not have a " + descriptor + " within " + range
    );
  } else {
    this.assert(
      obj >= start && obj <= finish,
      "expected #{this} to be within " + range,
      "expected #{this} to not be within " + range
    );
  }
});
function assertInstanceOf(constructor, msg) {
  if (msg) flag2(this, "message", msg);
  let target = flag2(this, "object");
  let ssfi = flag2(this, "ssfi");
  let flagMsg = flag2(this, "message");
  let isInstanceOf;
  try {
    isInstanceOf = target instanceof constructor;
  } catch (err) {
    if (err instanceof TypeError) {
      flagMsg = flagMsg ? flagMsg + ": " : "";
      throw new AssertionError(
        flagMsg + "The instanceof assertion needs a constructor but " + type(constructor) + " was given.",
        void 0,
        ssfi
      );
    }
    throw err;
  }
  let name = getName(constructor);
  if (name == null) {
    name = "an unnamed constructor";
  }
  this.assert(
    isInstanceOf,
    "expected #{this} to be an instance of " + name,
    "expected #{this} to not be an instance of " + name
  );
}
__name(assertInstanceOf, "assertInstanceOf");
Assertion.addMethod("instanceof", assertInstanceOf);
Assertion.addMethod("instanceOf", assertInstanceOf);
function assertProperty(name, val, msg) {
  if (msg) flag2(this, "message", msg);
  let isNested = flag2(this, "nested"), isOwn = flag2(this, "own"), flagMsg = flag2(this, "message"), obj = flag2(this, "object"), ssfi = flag2(this, "ssfi"), nameType = typeof name;
  flagMsg = flagMsg ? flagMsg + ": " : "";
  if (isNested) {
    if (nameType !== "string") {
      throw new AssertionError(
        flagMsg + "the argument to property must be a string when using nested syntax",
        void 0,
        ssfi
      );
    }
  } else {
    if (nameType !== "string" && nameType !== "number" && nameType !== "symbol") {
      throw new AssertionError(
        flagMsg + "the argument to property must be a string, number, or symbol",
        void 0,
        ssfi
      );
    }
  }
  if (isNested && isOwn) {
    throw new AssertionError(
      flagMsg + 'The "nested" and "own" flags cannot be combined.',
      void 0,
      ssfi
    );
  }
  if (obj === null || obj === void 0) {
    throw new AssertionError(
      flagMsg + "Target cannot be null or undefined.",
      void 0,
      ssfi
    );
  }
  let isDeep = flag2(this, "deep"), negate = flag2(this, "negate"), pathInfo = isNested ? getPathInfo(obj, name) : null, value = isNested ? pathInfo.value : obj[name], isEql = isDeep ? flag2(this, "eql") : (val1, val2) => val1 === val2;
  let descriptor = "";
  if (isDeep) descriptor += "deep ";
  if (isOwn) descriptor += "own ";
  if (isNested) descriptor += "nested ";
  descriptor += "property ";
  let hasProperty2;
  if (isOwn) hasProperty2 = Object.prototype.hasOwnProperty.call(obj, name);
  else if (isNested) hasProperty2 = pathInfo.exists;
  else hasProperty2 = hasProperty(obj, name);
  if (!negate || arguments.length === 1) {
    this.assert(
      hasProperty2,
      "expected #{this} to have " + descriptor + inspect2(name),
      "expected #{this} to not have " + descriptor + inspect2(name)
    );
  }
  if (arguments.length > 1) {
    this.assert(
      hasProperty2 && isEql(val, value),
      "expected #{this} to have " + descriptor + inspect2(name) + " of #{exp}, but got #{act}",
      "expected #{this} to not have " + descriptor + inspect2(name) + " of #{act}",
      val,
      value
    );
  }
  flag2(this, "object", value);
}
__name(assertProperty, "assertProperty");
Assertion.addMethod("property", assertProperty);
function assertOwnProperty(_name, _value, _msg) {
  flag2(this, "own", true);
  assertProperty.apply(this, arguments);
}
__name(assertOwnProperty, "assertOwnProperty");
Assertion.addMethod("ownProperty", assertOwnProperty);
Assertion.addMethod("haveOwnProperty", assertOwnProperty);
function assertOwnPropertyDescriptor(name, descriptor, msg) {
  if (typeof descriptor === "string") {
    msg = descriptor;
    descriptor = null;
  }
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object");
  let actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
  let eql = flag2(this, "eql");
  if (actualDescriptor && descriptor) {
    this.assert(
      eql(descriptor, actualDescriptor),
      "expected the own property descriptor for " + inspect2(name) + " on #{this} to match " + inspect2(descriptor) + ", got " + inspect2(actualDescriptor),
      "expected the own property descriptor for " + inspect2(name) + " on #{this} to not match " + inspect2(descriptor),
      descriptor,
      actualDescriptor,
      true
    );
  } else {
    this.assert(
      actualDescriptor,
      "expected #{this} to have an own property descriptor for " + inspect2(name),
      "expected #{this} to not have an own property descriptor for " + inspect2(name)
    );
  }
  flag2(this, "object", actualDescriptor);
}
__name(assertOwnPropertyDescriptor, "assertOwnPropertyDescriptor");
Assertion.addMethod("ownPropertyDescriptor", assertOwnPropertyDescriptor);
Assertion.addMethod("haveOwnPropertyDescriptor", assertOwnPropertyDescriptor);
function assertLengthChain() {
  flag2(this, "doLength", true);
}
__name(assertLengthChain, "assertLengthChain");
function assertLength(n, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), objType = type(obj).toLowerCase(), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi"), descriptor = "length", itemsCount;
  switch (objType) {
    case "map":
    case "set":
      descriptor = "size";
      itemsCount = obj.size;
      break;
    default:
      new Assertion(obj, flagMsg, ssfi, true).to.have.property("length");
      itemsCount = obj.length;
  }
  this.assert(
    itemsCount == n,
    "expected #{this} to have a " + descriptor + " of #{exp} but got #{act}",
    "expected #{this} to not have a " + descriptor + " of #{act}",
    n,
    itemsCount
  );
}
__name(assertLength, "assertLength");
Assertion.addChainableMethod("length", assertLength, assertLengthChain);
Assertion.addChainableMethod("lengthOf", assertLength, assertLengthChain);
function assertMatch(re, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object");
  this.assert(
    re.exec(obj),
    "expected #{this} to match " + re,
    "expected #{this} not to match " + re
  );
}
__name(assertMatch, "assertMatch");
Assertion.addMethod("match", assertMatch);
Assertion.addMethod("matches", assertMatch);
Assertion.addMethod("string", function(str, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).is.a("string");
  this.assert(
    ~obj.indexOf(str),
    "expected #{this} to contain " + inspect2(str),
    "expected #{this} to not contain " + inspect2(str)
  );
});
function assertKeys(keys) {
  let obj = flag2(this, "object"), objType = type(obj), keysType = type(keys), ssfi = flag2(this, "ssfi"), isDeep = flag2(this, "deep"), str, deepStr = "", actual, ok = true, flagMsg = flag2(this, "message");
  flagMsg = flagMsg ? flagMsg + ": " : "";
  let mixedArgsMsg = flagMsg + "when testing keys against an object or an array you must give a single Array|Object|String argument or multiple String arguments";
  if (objType === "Map" || objType === "Set") {
    deepStr = isDeep ? "deeply " : "";
    actual = [];
    obj.forEach(function(val, key) {
      actual.push(key);
    });
    if (keysType !== "Array") {
      keys = Array.prototype.slice.call(arguments);
    }
  } else {
    actual = getOwnEnumerableProperties(obj);
    switch (keysType) {
      case "Array":
        if (arguments.length > 1) {
          throw new AssertionError(mixedArgsMsg, void 0, ssfi);
        }
        break;
      case "Object":
        if (arguments.length > 1) {
          throw new AssertionError(mixedArgsMsg, void 0, ssfi);
        }
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }
    keys = keys.map(function(val) {
      return typeof val === "symbol" ? val : String(val);
    });
  }
  if (!keys.length) {
    throw new AssertionError(flagMsg + "keys required", void 0, ssfi);
  }
  let len = keys.length, any = flag2(this, "any"), all = flag2(this, "all"), expected = keys, isEql = isDeep ? flag2(this, "eql") : (val1, val2) => val1 === val2;
  if (!any && !all) {
    all = true;
  }
  if (any) {
    ok = expected.some(function(expectedKey) {
      return actual.some(function(actualKey) {
        return isEql(expectedKey, actualKey);
      });
    });
  }
  if (all) {
    ok = expected.every(function(expectedKey) {
      return actual.some(function(actualKey) {
        return isEql(expectedKey, actualKey);
      });
    });
    if (!flag2(this, "contains")) {
      ok = ok && keys.length == actual.length;
    }
  }
  if (len > 1) {
    keys = keys.map(function(key) {
      return inspect2(key);
    });
    let last = keys.pop();
    if (all) {
      str = keys.join(", ") + ", and " + last;
    }
    if (any) {
      str = keys.join(", ") + ", or " + last;
    }
  } else {
    str = inspect2(keys[0]);
  }
  str = (len > 1 ? "keys " : "key ") + str;
  str = (flag2(this, "contains") ? "contain " : "have ") + str;
  this.assert(
    ok,
    "expected #{this} to " + deepStr + str,
    "expected #{this} to not " + deepStr + str,
    expected.slice(0).sort(compareByInspect),
    actual.sort(compareByInspect),
    true
  );
}
__name(assertKeys, "assertKeys");
Assertion.addMethod("keys", assertKeys);
Assertion.addMethod("key", assertKeys);
function assertThrows(errorLike, errMsgMatcher, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), ssfi = flag2(this, "ssfi"), flagMsg = flag2(this, "message"), negate = flag2(this, "negate") || false;
  new Assertion(obj, flagMsg, ssfi, true).is.a("function");
  if (isRegExp2(errorLike) || typeof errorLike === "string") {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  let caughtErr;
  let errorWasThrown = false;
  try {
    obj();
  } catch (err) {
    errorWasThrown = true;
    caughtErr = err;
  }
  let everyArgIsUndefined = errorLike === void 0 && errMsgMatcher === void 0;
  let everyArgIsDefined = Boolean(errorLike && errMsgMatcher);
  let errorLikeFail = false;
  let errMsgMatcherFail = false;
  if (everyArgIsUndefined || !everyArgIsUndefined && !negate) {
    let errorLikeString = "an error";
    if (errorLike instanceof Error) {
      errorLikeString = "#{exp}";
    } else if (errorLike) {
      errorLikeString = check_error_exports.getConstructorName(errorLike);
    }
    let actual = caughtErr;
    if (caughtErr instanceof Error) {
      actual = caughtErr.toString();
    } else if (typeof caughtErr === "string") {
      actual = caughtErr;
    } else if (caughtErr && (typeof caughtErr === "object" || typeof caughtErr === "function")) {
      try {
        actual = check_error_exports.getConstructorName(caughtErr);
      } catch (_err) {
      }
    }
    this.assert(
      errorWasThrown,
      "expected #{this} to throw " + errorLikeString,
      "expected #{this} to not throw an error but #{act} was thrown",
      errorLike && errorLike.toString(),
      actual
    );
  }
  if (errorLike && caughtErr) {
    if (errorLike instanceof Error) {
      let isCompatibleInstance = check_error_exports.compatibleInstance(
        caughtErr,
        errorLike
      );
      if (isCompatibleInstance === negate) {
        if (everyArgIsDefined && negate) {
          errorLikeFail = true;
        } else {
          this.assert(
            negate,
            "expected #{this} to throw #{exp} but #{act} was thrown",
            "expected #{this} to not throw #{exp}" + (caughtErr && !negate ? " but #{act} was thrown" : ""),
            errorLike.toString(),
            caughtErr.toString()
          );
        }
      }
    }
    let isCompatibleConstructor = check_error_exports.compatibleConstructor(
      caughtErr,
      errorLike
    );
    if (isCompatibleConstructor === negate) {
      if (everyArgIsDefined && negate) {
        errorLikeFail = true;
      } else {
        this.assert(
          negate,
          "expected #{this} to throw #{exp} but #{act} was thrown",
          "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""),
          errorLike instanceof Error ? errorLike.toString() : errorLike && check_error_exports.getConstructorName(errorLike),
          caughtErr instanceof Error ? caughtErr.toString() : caughtErr && check_error_exports.getConstructorName(caughtErr)
        );
      }
    }
  }
  if (caughtErr && errMsgMatcher !== void 0 && errMsgMatcher !== null) {
    let placeholder = "including";
    if (isRegExp2(errMsgMatcher)) {
      placeholder = "matching";
    }
    let isCompatibleMessage = check_error_exports.compatibleMessage(
      caughtErr,
      errMsgMatcher
    );
    if (isCompatibleMessage === negate) {
      if (everyArgIsDefined && negate) {
        errMsgMatcherFail = true;
      } else {
        this.assert(
          negate,
          "expected #{this} to throw error " + placeholder + " #{exp} but got #{act}",
          "expected #{this} to throw error not " + placeholder + " #{exp}",
          errMsgMatcher,
          check_error_exports.getMessage(caughtErr)
        );
      }
    }
  }
  if (errorLikeFail && errMsgMatcherFail) {
    this.assert(
      negate,
      "expected #{this} to throw #{exp} but #{act} was thrown",
      "expected #{this} to not throw #{exp}" + (caughtErr ? " but #{act} was thrown" : ""),
      errorLike instanceof Error ? errorLike.toString() : errorLike && check_error_exports.getConstructorName(errorLike),
      caughtErr instanceof Error ? caughtErr.toString() : caughtErr && check_error_exports.getConstructorName(caughtErr)
    );
  }
  flag2(this, "object", caughtErr);
}
__name(assertThrows, "assertThrows");
Assertion.addMethod("throw", assertThrows);
Assertion.addMethod("throws", assertThrows);
Assertion.addMethod("Throw", assertThrows);
function respondTo(method, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), itself = flag2(this, "itself"), context = "function" === typeof obj && !itself ? obj.prototype[method] : obj[method];
  this.assert(
    "function" === typeof context,
    "expected #{this} to respond to " + inspect2(method),
    "expected #{this} to not respond to " + inspect2(method)
  );
}
__name(respondTo, "respondTo");
Assertion.addMethod("respondTo", respondTo);
Assertion.addMethod("respondsTo", respondTo);
Assertion.addProperty("itself", function() {
  flag2(this, "itself", true);
});
function satisfy(matcher, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object");
  let result = matcher(obj);
  this.assert(
    result,
    "expected #{this} to satisfy " + objDisplay(matcher),
    "expected #{this} to not satisfy" + objDisplay(matcher),
    flag2(this, "negate") ? false : true,
    result
  );
}
__name(satisfy, "satisfy");
Assertion.addMethod("satisfy", satisfy);
Assertion.addMethod("satisfies", satisfy);
function closeTo(expected, delta, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).is.numeric;
  let message = "A `delta` value is required for `closeTo`";
  if (delta == void 0) {
    throw new AssertionError(
      flagMsg ? `${flagMsg}: ${message}` : message,
      void 0,
      ssfi
    );
  }
  new Assertion(delta, flagMsg, ssfi, true).is.numeric;
  message = "A `expected` value is required for `closeTo`";
  if (expected == void 0) {
    throw new AssertionError(
      flagMsg ? `${flagMsg}: ${message}` : message,
      void 0,
      ssfi
    );
  }
  new Assertion(expected, flagMsg, ssfi, true).is.numeric;
  const abs = /* @__PURE__ */ __name((x) => x < 0 ? -x : x, "abs");
  const strip = /* @__PURE__ */ __name((number) => parseFloat(parseFloat(number).toPrecision(12)), "strip");
  this.assert(
    strip(abs(obj - expected)) <= delta,
    "expected #{this} to be close to " + expected + " +/- " + delta,
    "expected #{this} not to be close to " + expected + " +/- " + delta
  );
}
__name(closeTo, "closeTo");
Assertion.addMethod("closeTo", closeTo);
Assertion.addMethod("approximately", closeTo);
function isSubsetOf(_subset, _superset, cmp, contains, ordered) {
  let superset = Array.from(_superset);
  let subset = Array.from(_subset);
  if (!contains) {
    if (subset.length !== superset.length) return false;
    superset = superset.slice();
  }
  return subset.every(function(elem, idx) {
    if (ordered) return cmp ? cmp(elem, superset[idx]) : elem === superset[idx];
    if (!cmp) {
      let matchIdx = superset.indexOf(elem);
      if (matchIdx === -1) return false;
      if (!contains) superset.splice(matchIdx, 1);
      return true;
    }
    return superset.some(function(elem2, matchIdx) {
      if (!cmp(elem, elem2)) return false;
      if (!contains) superset.splice(matchIdx, 1);
      return true;
    });
  });
}
__name(isSubsetOf, "isSubsetOf");
Assertion.addMethod("members", function(subset, msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(obj, flagMsg, ssfi, true).to.be.iterable;
  new Assertion(subset, flagMsg, ssfi, true).to.be.iterable;
  let contains = flag2(this, "contains");
  let ordered = flag2(this, "ordered");
  let subject, failMsg, failNegateMsg;
  if (contains) {
    subject = ordered ? "an ordered superset" : "a superset";
    failMsg = "expected #{this} to be " + subject + " of #{exp}";
    failNegateMsg = "expected #{this} to not be " + subject + " of #{exp}";
  } else {
    subject = ordered ? "ordered members" : "members";
    failMsg = "expected #{this} to have the same " + subject + " as #{exp}";
    failNegateMsg = "expected #{this} to not have the same " + subject + " as #{exp}";
  }
  let cmp = flag2(this, "deep") ? flag2(this, "eql") : void 0;
  this.assert(
    isSubsetOf(subset, obj, cmp, contains, ordered),
    failMsg,
    failNegateMsg,
    subset,
    obj,
    true
  );
});
Assertion.addProperty("iterable", function(msg) {
  if (msg) flag2(this, "message", msg);
  let obj = flag2(this, "object");
  this.assert(
    obj != void 0 && obj[Symbol.iterator],
    "expected #{this} to be an iterable",
    "expected #{this} to not be an iterable",
    obj
  );
});
function oneOf(list, msg) {
  if (msg) flag2(this, "message", msg);
  let expected = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi"), contains = flag2(this, "contains"), isDeep = flag2(this, "deep"), eql = flag2(this, "eql");
  new Assertion(list, flagMsg, ssfi, true).to.be.an("array");
  if (contains) {
    this.assert(
      list.some(function(possibility) {
        return expected.indexOf(possibility) > -1;
      }),
      "expected #{this} to contain one of #{exp}",
      "expected #{this} to not contain one of #{exp}",
      list,
      expected
    );
  } else {
    if (isDeep) {
      this.assert(
        list.some(function(possibility) {
          return eql(expected, possibility);
        }),
        "expected #{this} to deeply equal one of #{exp}",
        "expected #{this} to deeply equal one of #{exp}",
        list,
        expected
      );
    } else {
      this.assert(
        list.indexOf(expected) > -1,
        "expected #{this} to be one of #{exp}",
        "expected #{this} to not be one of #{exp}",
        list,
        expected
      );
    }
  }
}
__name(oneOf, "oneOf");
Assertion.addMethod("oneOf", oneOf);
function assertChanges(subject, prop, msg) {
  if (msg) flag2(this, "message", msg);
  let fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  let initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  fn();
  let final = prop === void 0 || prop === null ? subject() : subject[prop];
  let msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "change");
  flag2(this, "realDelta", final !== initial);
  this.assert(
    initial !== final,
    "expected " + msgObj + " to change",
    "expected " + msgObj + " to not change"
  );
}
__name(assertChanges, "assertChanges");
Assertion.addMethod("change", assertChanges);
Assertion.addMethod("changes", assertChanges);
function assertIncreases(subject, prop, msg) {
  if (msg) flag2(this, "message", msg);
  let fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  let initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  new Assertion(initial, flagMsg, ssfi, true).is.a("number");
  fn();
  let final = prop === void 0 || prop === null ? subject() : subject[prop];
  let msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "increase");
  flag2(this, "realDelta", final - initial);
  this.assert(
    final - initial > 0,
    "expected " + msgObj + " to increase",
    "expected " + msgObj + " to not increase"
  );
}
__name(assertIncreases, "assertIncreases");
Assertion.addMethod("increase", assertIncreases);
Assertion.addMethod("increases", assertIncreases);
function assertDecreases(subject, prop, msg) {
  if (msg) flag2(this, "message", msg);
  let fn = flag2(this, "object"), flagMsg = flag2(this, "message"), ssfi = flag2(this, "ssfi");
  new Assertion(fn, flagMsg, ssfi, true).is.a("function");
  let initial;
  if (!prop) {
    new Assertion(subject, flagMsg, ssfi, true).is.a("function");
    initial = subject();
  } else {
    new Assertion(subject, flagMsg, ssfi, true).to.have.property(prop);
    initial = subject[prop];
  }
  new Assertion(initial, flagMsg, ssfi, true).is.a("number");
  fn();
  let final = prop === void 0 || prop === null ? subject() : subject[prop];
  let msgObj = prop === void 0 || prop === null ? initial : "." + prop;
  flag2(this, "deltaMsgObj", msgObj);
  flag2(this, "initialDeltaValue", initial);
  flag2(this, "finalDeltaValue", final);
  flag2(this, "deltaBehavior", "decrease");
  flag2(this, "realDelta", initial - final);
  this.assert(
    final - initial < 0,
    "expected " + msgObj + " to decrease",
    "expected " + msgObj + " to not decrease"
  );
}
__name(assertDecreases, "assertDecreases");
Assertion.addMethod("decrease", assertDecreases);
Assertion.addMethod("decreases", assertDecreases);
function assertDelta(delta, msg) {
  if (msg) flag2(this, "message", msg);
  let msgObj = flag2(this, "deltaMsgObj");
  let initial = flag2(this, "initialDeltaValue");
  let final = flag2(this, "finalDeltaValue");
  let behavior = flag2(this, "deltaBehavior");
  let realDelta = flag2(this, "realDelta");
  let expression;
  if (behavior === "change") {
    expression = Math.abs(final - initial) === Math.abs(delta);
  } else {
    expression = realDelta === Math.abs(delta);
  }
  this.assert(
    expression,
    "expected " + msgObj + " to " + behavior + " by " + delta,
    "expected " + msgObj + " to not " + behavior + " by " + delta
  );
}
__name(assertDelta, "assertDelta");
Assertion.addMethod("by", assertDelta);
Assertion.addProperty("extensible", function() {
  let obj = flag2(this, "object");
  let isExtensible = obj === Object(obj) && Object.isExtensible(obj);
  this.assert(
    isExtensible,
    "expected #{this} to be extensible",
    "expected #{this} to not be extensible"
  );
});
Assertion.addProperty("sealed", function() {
  let obj = flag2(this, "object");
  let isSealed = obj === Object(obj) ? Object.isSealed(obj) : true;
  this.assert(
    isSealed,
    "expected #{this} to be sealed",
    "expected #{this} to not be sealed"
  );
});
Assertion.addProperty("frozen", function() {
  let obj = flag2(this, "object");
  let isFrozen = obj === Object(obj) ? Object.isFrozen(obj) : true;
  this.assert(
    isFrozen,
    "expected #{this} to be frozen",
    "expected #{this} to not be frozen"
  );
});
Assertion.addProperty("finite", function(_msg) {
  let obj = flag2(this, "object");
  this.assert(
    typeof obj === "number" && isFinite(obj),
    "expected #{this} to be a finite number",
    "expected #{this} to not be a finite number"
  );
});
function compareSubset(expected, actual) {
  if (expected === actual) {
    return true;
  }
  if (typeof actual !== typeof expected) {
    return false;
  }
  if (typeof expected !== "object" || expected === null) {
    return expected === actual;
  }
  if (!actual) {
    return false;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      return false;
    }
    return expected.every(function(exp) {
      return actual.some(function(act) {
        return compareSubset(exp, act);
      });
    });
  }
  if (expected instanceof Date) {
    if (actual instanceof Date) {
      return expected.getTime() === actual.getTime();
    } else {
      return false;
    }
  }
  return Object.keys(expected).every(function(key) {
    let expectedValue = expected[key];
    let actualValue = actual[key];
    if (typeof expectedValue === "object" && expectedValue !== null && actualValue !== null) {
      return compareSubset(expectedValue, actualValue);
    }
    if (typeof expectedValue === "function") {
      return expectedValue(actualValue);
    }
    return actualValue === expectedValue;
  });
}
__name(compareSubset, "compareSubset");
Assertion.addMethod("containSubset", function(expected) {
  const actual = flag(this, "object");
  const showDiff = config.showDiff;
  this.assert(
    compareSubset(expected, actual),
    "expected #{act} to contain subset #{exp}",
    "expected #{act} to not contain subset #{exp}",
    expected,
    actual,
    showDiff
  );
});

// lib/chai/interface/expect.js
function expect(val, message) {
  return new Assertion(val, message);
}
__name(expect, "expect");
expect.fail = function(actual, expected, message, operator) {
  if (arguments.length < 2) {
    message = actual;
    actual = void 0;
  }
  message = message || "expect.fail()";
  throw new AssertionError(
    message,
    {
      actual,
      expected,
      operator
    },
    expect.fail
  );
};

// lib/chai/interface/should.js
var should_exports = {};
__export(should_exports, {
  Should: () => Should,
  should: () => should
});
function loadShould() {
  function shouldGetter() {
    if (this instanceof String || this instanceof Number || this instanceof Boolean || typeof Symbol === "function" && this instanceof Symbol || typeof BigInt === "function" && this instanceof BigInt) {
      return new Assertion(this.valueOf(), null, shouldGetter);
    }
    return new Assertion(this, null, shouldGetter);
  }
  __name(shouldGetter, "shouldGetter");
  function shouldSetter(value) {
    Object.defineProperty(this, "should", {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  }
  __name(shouldSetter, "shouldSetter");
  Object.defineProperty(Object.prototype, "should", {
    set: shouldSetter,
    get: shouldGetter,
    configurable: true
  });
  let should2 = {};
  should2.fail = function(actual, expected, message, operator) {
    if (arguments.length < 2) {
      message = actual;
      actual = void 0;
    }
    message = message || "should.fail()";
    throw new AssertionError(
      message,
      {
        actual,
        expected,
        operator
      },
      should2.fail
    );
  };
  should2.equal = function(actual, expected, message) {
    new Assertion(actual, message).to.equal(expected);
  };
  should2.Throw = function(fn, errt, errs, msg) {
    new Assertion(fn, msg).to.Throw(errt, errs);
  };
  should2.exist = function(val, msg) {
    new Assertion(val, msg).to.exist;
  };
  should2.not = {};
  should2.not.equal = function(actual, expected, msg) {
    new Assertion(actual, msg).to.not.equal(expected);
  };
  should2.not.Throw = function(fn, errt, errs, msg) {
    new Assertion(fn, msg).to.not.Throw(errt, errs);
  };
  should2.not.exist = function(val, msg) {
    new Assertion(val, msg).to.not.exist;
  };
  should2["throw"] = should2["Throw"];
  should2.not["throw"] = should2.not["Throw"];
  return should2;
}
__name(loadShould, "loadShould");
var should = loadShould;
var Should = loadShould;

// lib/chai/interface/assert.js
function assert(express, errmsg) {
  let test2 = new Assertion(null, null, assert, true);
  test2.assert(express, errmsg, "[ negation message unavailable ]");
}
__name(assert, "assert");
assert.fail = function(actual, expected, message, operator) {
  if (arguments.length < 2) {
    message = actual;
    actual = void 0;
  }
  message = message || "assert.fail()";
  throw new AssertionError(
    message,
    {
      actual,
      expected,
      operator
    },
    assert.fail
  );
};
assert.isOk = function(val, msg) {
  new Assertion(val, msg, assert.isOk, true).is.ok;
};
assert.isNotOk = function(val, msg) {
  new Assertion(val, msg, assert.isNotOk, true).is.not.ok;
};
assert.equal = function(act, exp, msg) {
  let test2 = new Assertion(act, msg, assert.equal, true);
  test2.assert(
    exp == flag(test2, "object"),
    "expected #{this} to equal #{exp}",
    "expected #{this} to not equal #{act}",
    exp,
    act,
    true
  );
};
assert.notEqual = function(act, exp, msg) {
  let test2 = new Assertion(act, msg, assert.notEqual, true);
  test2.assert(
    exp != flag(test2, "object"),
    "expected #{this} to not equal #{exp}",
    "expected #{this} to equal #{act}",
    exp,
    act,
    true
  );
};
assert.strictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert.strictEqual, true).to.equal(exp);
};
assert.notStrictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert.notStrictEqual, true).to.not.equal(exp);
};
assert.deepEqual = assert.deepStrictEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert.deepEqual, true).to.eql(exp);
};
assert.notDeepEqual = function(act, exp, msg) {
  new Assertion(act, msg, assert.notDeepEqual, true).to.not.eql(exp);
};
assert.isAbove = function(val, abv, msg) {
  new Assertion(val, msg, assert.isAbove, true).to.be.above(abv);
};
assert.isAtLeast = function(val, atlst, msg) {
  new Assertion(val, msg, assert.isAtLeast, true).to.be.least(atlst);
};
assert.isBelow = function(val, blw, msg) {
  new Assertion(val, msg, assert.isBelow, true).to.be.below(blw);
};
assert.isAtMost = function(val, atmst, msg) {
  new Assertion(val, msg, assert.isAtMost, true).to.be.most(atmst);
};
assert.isTrue = function(val, msg) {
  new Assertion(val, msg, assert.isTrue, true).is["true"];
};
assert.isNotTrue = function(val, msg) {
  new Assertion(val, msg, assert.isNotTrue, true).to.not.equal(true);
};
assert.isFalse = function(val, msg) {
  new Assertion(val, msg, assert.isFalse, true).is["false"];
};
assert.isNotFalse = function(val, msg) {
  new Assertion(val, msg, assert.isNotFalse, true).to.not.equal(false);
};
assert.isNull = function(val, msg) {
  new Assertion(val, msg, assert.isNull, true).to.equal(null);
};
assert.isNotNull = function(val, msg) {
  new Assertion(val, msg, assert.isNotNull, true).to.not.equal(null);
};
assert.isNaN = function(val, msg) {
  new Assertion(val, msg, assert.isNaN, true).to.be.NaN;
};
assert.isNotNaN = function(value, message) {
  new Assertion(value, message, assert.isNotNaN, true).not.to.be.NaN;
};
assert.exists = function(val, msg) {
  new Assertion(val, msg, assert.exists, true).to.exist;
};
assert.notExists = function(val, msg) {
  new Assertion(val, msg, assert.notExists, true).to.not.exist;
};
assert.isUndefined = function(val, msg) {
  new Assertion(val, msg, assert.isUndefined, true).to.equal(void 0);
};
assert.isDefined = function(val, msg) {
  new Assertion(val, msg, assert.isDefined, true).to.not.equal(void 0);
};
assert.isCallable = function(value, message) {
  new Assertion(value, message, assert.isCallable, true).is.callable;
};
assert.isNotCallable = function(value, message) {
  new Assertion(value, message, assert.isNotCallable, true).is.not.callable;
};
assert.isObject = function(val, msg) {
  new Assertion(val, msg, assert.isObject, true).to.be.a("object");
};
assert.isNotObject = function(val, msg) {
  new Assertion(val, msg, assert.isNotObject, true).to.not.be.a("object");
};
assert.isArray = function(val, msg) {
  new Assertion(val, msg, assert.isArray, true).to.be.an("array");
};
assert.isNotArray = function(val, msg) {
  new Assertion(val, msg, assert.isNotArray, true).to.not.be.an("array");
};
assert.isString = function(val, msg) {
  new Assertion(val, msg, assert.isString, true).to.be.a("string");
};
assert.isNotString = function(val, msg) {
  new Assertion(val, msg, assert.isNotString, true).to.not.be.a("string");
};
assert.isNumber = function(val, msg) {
  new Assertion(val, msg, assert.isNumber, true).to.be.a("number");
};
assert.isNotNumber = function(val, msg) {
  new Assertion(val, msg, assert.isNotNumber, true).to.not.be.a("number");
};
assert.isNumeric = function(val, msg) {
  new Assertion(val, msg, assert.isNumeric, true).is.numeric;
};
assert.isNotNumeric = function(val, msg) {
  new Assertion(val, msg, assert.isNotNumeric, true).is.not.numeric;
};
assert.isFinite = function(val, msg) {
  new Assertion(val, msg, assert.isFinite, true).to.be.finite;
};
assert.isBoolean = function(val, msg) {
  new Assertion(val, msg, assert.isBoolean, true).to.be.a("boolean");
};
assert.isNotBoolean = function(val, msg) {
  new Assertion(val, msg, assert.isNotBoolean, true).to.not.be.a("boolean");
};
assert.typeOf = function(val, type3, msg) {
  new Assertion(val, msg, assert.typeOf, true).to.be.a(type3);
};
assert.notTypeOf = function(value, type3, message) {
  new Assertion(value, message, assert.notTypeOf, true).to.not.be.a(type3);
};
assert.instanceOf = function(val, type3, msg) {
  new Assertion(val, msg, assert.instanceOf, true).to.be.instanceOf(type3);
};
assert.notInstanceOf = function(val, type3, msg) {
  new Assertion(val, msg, assert.notInstanceOf, true).to.not.be.instanceOf(
    type3
  );
};
assert.include = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.include, true).include(inc);
};
assert.notInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.notInclude, true).not.include(inc);
};
assert.deepInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.deepInclude, true).deep.include(inc);
};
assert.notDeepInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.notDeepInclude, true).not.deep.include(inc);
};
assert.nestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.nestedInclude, true).nested.include(inc);
};
assert.notNestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.notNestedInclude, true).not.nested.include(
    inc
  );
};
assert.deepNestedInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.deepNestedInclude, true).deep.nested.include(
    inc
  );
};
assert.notDeepNestedInclude = function(exp, inc, msg) {
  new Assertion(
    exp,
    msg,
    assert.notDeepNestedInclude,
    true
  ).not.deep.nested.include(inc);
};
assert.ownInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.ownInclude, true).own.include(inc);
};
assert.notOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.notOwnInclude, true).not.own.include(inc);
};
assert.deepOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.deepOwnInclude, true).deep.own.include(inc);
};
assert.notDeepOwnInclude = function(exp, inc, msg) {
  new Assertion(exp, msg, assert.notDeepOwnInclude, true).not.deep.own.include(
    inc
  );
};
assert.match = function(exp, re, msg) {
  new Assertion(exp, msg, assert.match, true).to.match(re);
};
assert.notMatch = function(exp, re, msg) {
  new Assertion(exp, msg, assert.notMatch, true).to.not.match(re);
};
assert.property = function(obj, prop, msg) {
  new Assertion(obj, msg, assert.property, true).to.have.property(prop);
};
assert.notProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert.notProperty, true).to.not.have.property(prop);
};
assert.propertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert.propertyVal, true).to.have.property(prop, val);
};
assert.notPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert.notPropertyVal, true).to.not.have.property(
    prop,
    val
  );
};
assert.deepPropertyVal = function(obj, prop, val, msg) {
  new Assertion(obj, msg, assert.deepPropertyVal, true).to.have.deep.property(
    prop,
    val
  );
};
assert.notDeepPropertyVal = function(obj, prop, val, msg) {
  new Assertion(
    obj,
    msg,
    assert.notDeepPropertyVal,
    true
  ).to.not.have.deep.property(prop, val);
};
assert.ownProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert.ownProperty, true).to.have.own.property(prop);
};
assert.notOwnProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert.notOwnProperty, true).to.not.have.own.property(
    prop
  );
};
assert.ownPropertyVal = function(obj, prop, value, msg) {
  new Assertion(obj, msg, assert.ownPropertyVal, true).to.have.own.property(
    prop,
    value
  );
};
assert.notOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(
    obj,
    msg,
    assert.notOwnPropertyVal,
    true
  ).to.not.have.own.property(prop, value);
};
assert.deepOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(
    obj,
    msg,
    assert.deepOwnPropertyVal,
    true
  ).to.have.deep.own.property(prop, value);
};
assert.notDeepOwnPropertyVal = function(obj, prop, value, msg) {
  new Assertion(
    obj,
    msg,
    assert.notDeepOwnPropertyVal,
    true
  ).to.not.have.deep.own.property(prop, value);
};
assert.nestedProperty = function(obj, prop, msg) {
  new Assertion(obj, msg, assert.nestedProperty, true).to.have.nested.property(
    prop
  );
};
assert.notNestedProperty = function(obj, prop, msg) {
  new Assertion(
    obj,
    msg,
    assert.notNestedProperty,
    true
  ).to.not.have.nested.property(prop);
};
assert.nestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(
    obj,
    msg,
    assert.nestedPropertyVal,
    true
  ).to.have.nested.property(prop, val);
};
assert.notNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(
    obj,
    msg,
    assert.notNestedPropertyVal,
    true
  ).to.not.have.nested.property(prop, val);
};
assert.deepNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(
    obj,
    msg,
    assert.deepNestedPropertyVal,
    true
  ).to.have.deep.nested.property(prop, val);
};
assert.notDeepNestedPropertyVal = function(obj, prop, val, msg) {
  new Assertion(
    obj,
    msg,
    assert.notDeepNestedPropertyVal,
    true
  ).to.not.have.deep.nested.property(prop, val);
};
assert.lengthOf = function(exp, len, msg) {
  new Assertion(exp, msg, assert.lengthOf, true).to.have.lengthOf(len);
};
assert.hasAnyKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.hasAnyKeys, true).to.have.any.keys(keys);
};
assert.hasAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.hasAllKeys, true).to.have.all.keys(keys);
};
assert.containsAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.containsAllKeys, true).to.contain.all.keys(
    keys
  );
};
assert.doesNotHaveAnyKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.doesNotHaveAnyKeys, true).to.not.have.any.keys(
    keys
  );
};
assert.doesNotHaveAllKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.doesNotHaveAllKeys, true).to.not.have.all.keys(
    keys
  );
};
assert.hasAnyDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.hasAnyDeepKeys, true).to.have.any.deep.keys(
    keys
  );
};
assert.hasAllDeepKeys = function(obj, keys, msg) {
  new Assertion(obj, msg, assert.hasAllDeepKeys, true).to.have.all.deep.keys(
    keys
  );
};
assert.containsAllDeepKeys = function(obj, keys, msg) {
  new Assertion(
    obj,
    msg,
    assert.containsAllDeepKeys,
    true
  ).to.contain.all.deep.keys(keys);
};
assert.doesNotHaveAnyDeepKeys = function(obj, keys, msg) {
  new Assertion(
    obj,
    msg,
    assert.doesNotHaveAnyDeepKeys,
    true
  ).to.not.have.any.deep.keys(keys);
};
assert.doesNotHaveAllDeepKeys = function(obj, keys, msg) {
  new Assertion(
    obj,
    msg,
    assert.doesNotHaveAllDeepKeys,
    true
  ).to.not.have.all.deep.keys(keys);
};
assert.throws = function(fn, errorLike, errMsgMatcher, msg) {
  if ("string" === typeof errorLike || errorLike instanceof RegExp) {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  let assertErr = new Assertion(fn, msg, assert.throws, true).to.throw(
    errorLike,
    errMsgMatcher
  );
  return flag(assertErr, "object");
};
assert.doesNotThrow = function(fn, errorLike, errMsgMatcher, message) {
  if ("string" === typeof errorLike || errorLike instanceof RegExp) {
    errMsgMatcher = errorLike;
    errorLike = null;
  }
  new Assertion(fn, message, assert.doesNotThrow, true).to.not.throw(
    errorLike,
    errMsgMatcher
  );
};
assert.operator = function(val, operator, val2, msg) {
  let ok;
  switch (operator) {
    case "==":
      ok = val == val2;
      break;
    case "===":
      ok = val === val2;
      break;
    case ">":
      ok = val > val2;
      break;
    case ">=":
      ok = val >= val2;
      break;
    case "<":
      ok = val < val2;
      break;
    case "<=":
      ok = val <= val2;
      break;
    case "!=":
      ok = val != val2;
      break;
    case "!==":
      ok = val !== val2;
      break;
    default:
      msg = msg ? msg + ": " : msg;
      throw new AssertionError(
        msg + 'Invalid operator "' + operator + '"',
        void 0,
        assert.operator
      );
  }
  let test2 = new Assertion(ok, msg, assert.operator, true);
  test2.assert(
    true === flag(test2, "object"),
    "expected " + inspect2(val) + " to be " + operator + " " + inspect2(val2),
    "expected " + inspect2(val) + " to not be " + operator + " " + inspect2(val2)
  );
};
assert.closeTo = function(act, exp, delta, msg) {
  new Assertion(act, msg, assert.closeTo, true).to.be.closeTo(exp, delta);
};
assert.approximately = function(act, exp, delta, msg) {
  new Assertion(act, msg, assert.approximately, true).to.be.approximately(
    exp,
    delta
  );
};
assert.sameMembers = function(set1, set2, msg) {
  new Assertion(set1, msg, assert.sameMembers, true).to.have.same.members(set2);
};
assert.notSameMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.notSameMembers,
    true
  ).to.not.have.same.members(set2);
};
assert.sameDeepMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.sameDeepMembers,
    true
  ).to.have.same.deep.members(set2);
};
assert.notSameDeepMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.notSameDeepMembers,
    true
  ).to.not.have.same.deep.members(set2);
};
assert.sameOrderedMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.sameOrderedMembers,
    true
  ).to.have.same.ordered.members(set2);
};
assert.notSameOrderedMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.notSameOrderedMembers,
    true
  ).to.not.have.same.ordered.members(set2);
};
assert.sameDeepOrderedMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.sameDeepOrderedMembers,
    true
  ).to.have.same.deep.ordered.members(set2);
};
assert.notSameDeepOrderedMembers = function(set1, set2, msg) {
  new Assertion(
    set1,
    msg,
    assert.notSameDeepOrderedMembers,
    true
  ).to.not.have.same.deep.ordered.members(set2);
};
assert.includeMembers = function(superset, subset, msg) {
  new Assertion(superset, msg, assert.includeMembers, true).to.include.members(
    subset
  );
};
assert.notIncludeMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.notIncludeMembers,
    true
  ).to.not.include.members(subset);
};
assert.includeDeepMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.includeDeepMembers,
    true
  ).to.include.deep.members(subset);
};
assert.notIncludeDeepMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.notIncludeDeepMembers,
    true
  ).to.not.include.deep.members(subset);
};
assert.includeOrderedMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.includeOrderedMembers,
    true
  ).to.include.ordered.members(subset);
};
assert.notIncludeOrderedMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.notIncludeOrderedMembers,
    true
  ).to.not.include.ordered.members(subset);
};
assert.includeDeepOrderedMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.includeDeepOrderedMembers,
    true
  ).to.include.deep.ordered.members(subset);
};
assert.notIncludeDeepOrderedMembers = function(superset, subset, msg) {
  new Assertion(
    superset,
    msg,
    assert.notIncludeDeepOrderedMembers,
    true
  ).to.not.include.deep.ordered.members(subset);
};
assert.oneOf = function(inList, list, msg) {
  new Assertion(inList, msg, assert.oneOf, true).to.be.oneOf(list);
};
assert.isIterable = function(obj, msg) {
  if (obj == void 0 || !obj[Symbol.iterator]) {
    msg = msg ? `${msg} expected ${inspect2(obj)} to be an iterable` : `expected ${inspect2(obj)} to be an iterable`;
    throw new AssertionError(msg, void 0, assert.isIterable);
  }
};
assert.changes = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.changes, true).to.change(obj, prop);
};
assert.changesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.changesBy, true).to.change(obj, prop).by(delta);
};
assert.doesNotChange = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.doesNotChange, true).to.not.change(
    obj,
    prop
  );
};
assert.changesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.changesButNotBy, true).to.change(obj, prop).but.not.by(delta);
};
assert.increases = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.increases, true).to.increase(obj, prop);
};
assert.increasesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.increasesBy, true).to.increase(obj, prop).by(delta);
};
assert.doesNotIncrease = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.doesNotIncrease, true).to.not.increase(
    obj,
    prop
  );
};
assert.increasesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.increasesButNotBy, true).to.increase(obj, prop).but.not.by(delta);
};
assert.decreases = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.decreases, true).to.decrease(obj, prop);
};
assert.decreasesBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.decreasesBy, true).to.decrease(obj, prop).by(delta);
};
assert.doesNotDecrease = function(fn, obj, prop, msg) {
  if (arguments.length === 3 && typeof obj === "function") {
    msg = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.doesNotDecrease, true).to.not.decrease(
    obj,
    prop
  );
};
assert.doesNotDecreaseBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  return new Assertion(fn, msg, assert.doesNotDecreaseBy, true).to.not.decrease(obj, prop).by(delta);
};
assert.decreasesButNotBy = function(fn, obj, prop, delta, msg) {
  if (arguments.length === 4 && typeof obj === "function") {
    let tmpMsg = delta;
    delta = prop;
    msg = tmpMsg;
  } else if (arguments.length === 3) {
    delta = prop;
    prop = null;
  }
  new Assertion(fn, msg, assert.decreasesButNotBy, true).to.decrease(obj, prop).but.not.by(delta);
};
assert.ifError = function(val) {
  if (val) {
    throw val;
  }
};
assert.isExtensible = function(obj, msg) {
  new Assertion(obj, msg, assert.isExtensible, true).to.be.extensible;
};
assert.isNotExtensible = function(obj, msg) {
  new Assertion(obj, msg, assert.isNotExtensible, true).to.not.be.extensible;
};
assert.isSealed = function(obj, msg) {
  new Assertion(obj, msg, assert.isSealed, true).to.be.sealed;
};
assert.isNotSealed = function(obj, msg) {
  new Assertion(obj, msg, assert.isNotSealed, true).to.not.be.sealed;
};
assert.isFrozen = function(obj, msg) {
  new Assertion(obj, msg, assert.isFrozen, true).to.be.frozen;
};
assert.isNotFrozen = function(obj, msg) {
  new Assertion(obj, msg, assert.isNotFrozen, true).to.not.be.frozen;
};
assert.isEmpty = function(val, msg) {
  new Assertion(val, msg, assert.isEmpty, true).to.be.empty;
};
assert.isNotEmpty = function(val, msg) {
  new Assertion(val, msg, assert.isNotEmpty, true).to.not.be.empty;
};
assert.containsSubset = function(val, exp, msg) {
  new Assertion(val, msg).to.containSubset(exp);
};
assert.doesNotContainSubset = function(val, exp, msg) {
  new Assertion(val, msg).to.not.containSubset(exp);
};
var aliases = [
  ["isOk", "ok"],
  ["isNotOk", "notOk"],
  ["throws", "throw"],
  ["throws", "Throw"],
  ["isExtensible", "extensible"],
  ["isNotExtensible", "notExtensible"],
  ["isSealed", "sealed"],
  ["isNotSealed", "notSealed"],
  ["isFrozen", "frozen"],
  ["isNotFrozen", "notFrozen"],
  ["isEmpty", "empty"],
  ["isNotEmpty", "notEmpty"],
  ["isCallable", "isFunction"],
  ["isNotCallable", "isNotFunction"],
  ["containsSubset", "containSubset"]
];
for (const [name, as] of aliases) {
  assert[as] = assert[name];
}

// lib/chai.js
var used = [];
function use(fn) {
  const exports$1 = {
    use,
    AssertionError,
    util: utils_exports,
    config,
    expect,
    assert,
    Assertion,
    ...should_exports
  };
  if (!~used.indexOf(fn)) {
    fn(exports$1, utils_exports);
    used.push(fn);
  }
  return exports$1;
}
__name(use, "use");

function readBlobAsArrayBuffer(blob) {
    if (blob.arrayBuffer) {
        return blob.arrayBuffer();
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
    });
}
function isSharedArrayBuffer(b) {
    return typeof SharedArrayBuffer !== 'undefined' && b instanceof SharedArrayBuffer;
}
(typeof process !== 'undefined') &&
    process.versions &&
    (typeof process.versions.node !== 'undefined') &&
    (typeof process.versions.electron === 'undefined');

class ArrayBufferReader {
    typedArray;
    constructor(arrayBufferOrView) {
        this.typedArray = (arrayBufferOrView instanceof ArrayBuffer || isSharedArrayBuffer(arrayBufferOrView))
            ? new Uint8Array(arrayBufferOrView)
            : new Uint8Array(arrayBufferOrView.buffer, arrayBufferOrView.byteOffset, arrayBufferOrView.byteLength);
    }
    async getLength() {
        return this.typedArray.byteLength;
    }
    async read(offset, length) {
        return new Uint8Array(this.typedArray.buffer, this.typedArray.byteOffset + offset, length);
    }
}

class BlobReader {
    blob;
    constructor(blob) {
        this.blob = blob;
    }
    async getLength() {
        return this.blob.size;
    }
    async read(offset, length) {
        const blob = this.blob.slice(offset, offset + length);
        const arrayBuffer = await readBlobAsArrayBuffer(blob);
        return new Uint8Array(arrayBuffer);
    }
    async sliceAsBlob(offset, length, type = '') {
        return this.blob.slice(offset, offset + length, type);
    }
}

class HTTPRangeReader {
    url;
    length;
    constructor(url) {
        this.url = url;
    }
    async getLength() {
        if (this.length === undefined) {
            const req = await fetch(this.url, { method: 'HEAD' });
            if (!req.ok) {
                throw new Error(`failed http request ${this.url}, status: ${req.status}: ${req.statusText}`);
            }
            this.length = parseInt(req.headers.get('content-length'));
            if (Number.isNaN(this.length)) {
                throw Error('could not get length');
            }
        }
        return this.length;
    }
    async read(offset, size) {
        if (size === 0) {
            return new Uint8Array(0);
        }
        const req = await fetch(this.url, {
            headers: {
                Range: `bytes=${offset}-${offset + size - 1}`,
            },
        });
        if (!req.ok) {
            throw new Error(`failed http request ${this.url}, status: ${req.status} offset: ${offset} size: ${size}: ${req.statusText}`);
        }
        const buffer = await req.arrayBuffer();
        return new Uint8Array(buffer);
    }
}

var createUnrarModule = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(moduleArg = {}) {

var Module=moduleArg;var readyPromiseResolve,readyPromiseReject;Module["ready"]=new Promise((resolve,reject)=>{readyPromiseResolve=resolve;readyPromiseReject=reject;});var moduleOverrides=Object.assign({},Module);var ENVIRONMENT_IS_WEB=typeof window=="object";var ENVIRONMENT_IS_WORKER=typeof importScripts=="function";var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readBinary;if(ENVIRONMENT_IS_NODE){const{createRequire:createRequire}=await import('module');var require=createRequire(import.meta.url);var fs=require("fs");var nodePath=require("path");if(ENVIRONMENT_IS_WORKER){scriptDirectory=nodePath.dirname(scriptDirectory)+"/";}else {scriptDirectory=require("url").fileURLToPath(new URL("./",import.meta.url));}read_=(filename,binary)=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);return fs.readFileSync(filename,binary?undefined:"utf8")};readBinary=filename=>{var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret);}return ret};if(!Module["thisProgram"]&&process.argv.length>1){process.argv[1].replace(/\\/g,"/");}process.argv.slice(2);Module["inspect"]=()=>"[Emscripten Module object]";}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href;}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src;}if(_scriptDir){scriptDirectory=_scriptDir;}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1);}else {scriptDirectory="";}{read_=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)};}}}else;Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.error.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])Module["arguments"];if(Module["thisProgram"])Module["thisProgram"];if(Module["quit"])Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];if(typeof WebAssembly!="object"){abort("no native wasm support detected");}var wasmMemory;var ABORT=false;var HEAP8,HEAPU8,HEAPU32;function updateMemoryViews(){var b=wasmMemory.buffer;Module["HEAP8"]=HEAP8=new Int8Array(b);Module["HEAP16"]=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAPU16"]=new Uint16Array(b);Module["HEAP32"]=new Int32Array(b);Module["HEAPU32"]=HEAPU32=new Uint32Array(b);Module["HEAPF32"]=new Float32Array(b);Module["HEAPF64"]=new Float64Array(b);}var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift());}}callRuntimeCallbacks(__ATPRERUN__);}function initRuntime(){callRuntimeCallbacks(__ATINIT__);}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift());}}callRuntimeCallbacks(__ATPOSTRUN__);}function addOnPreRun(cb){__ATPRERUN__.unshift(cb);}function addOnInit(cb){__ATINIT__.unshift(cb);}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb);}var runDependencies=0;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies);}if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback();}}}function abort(what){if(Module["onAbort"]){Module["onAbort"](what);}what="Aborted("+what+")";err(what);ABORT=true;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";var isDataURI=filename=>filename.startsWith(dataURIPrefix);var isFileURI=filename=>filename.startsWith("file://");var wasmBinaryFile;if(Module["locateFile"]){wasmBinaryFile="unrar-wasm.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile);}}else {wasmBinaryFile=new URL("unrar-wasm.wasm",import.meta.url).href;}function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw "both async and sync fetching of the wasm failed"}function getBinaryPromise(binaryFile){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch=="function"){return fetch(binaryFile,{credentials:"same-origin"}).then(response=>{if(!response["ok"]){throw "failed to load wasm binary file at '"+binaryFile+"'"}return response["arrayBuffer"]()}).catch(()=>getBinarySync(binaryFile))}}return Promise.resolve().then(()=>getBinarySync(binaryFile))}function instantiateArrayBuffer(binaryFile,imports,receiver){return getBinaryPromise(binaryFile).then(binary=>WebAssembly.instantiate(binary,imports)).then(instance=>instance).then(receiver,reason=>{err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason);})}function instantiateAsync(binary,binaryFile,imports,callback){if(!binary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(binaryFile)&&!ENVIRONMENT_IS_NODE&&typeof fetch=="function"){return fetch(binaryFile,{credentials:"same-origin"}).then(response=>{var result=WebAssembly.instantiateStreaming(response,imports);return result.then(callback,function(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(binaryFile,imports,callback)})})}return instantiateArrayBuffer(binaryFile,imports,callback)}function createWasm(){var info={"env":wasmImports,"wasi_snapshot_preview1":wasmImports};function receiveInstance(instance,module){wasmExports=instance.exports;wasmMemory=wasmExports["memory"];updateMemoryViews();wasmTable=wasmExports["__indirect_function_table"];addOnInit(wasmExports["__wasm_call_ctors"]);removeRunDependency();return wasmExports}addRunDependency();function receiveInstantiationResult(result){receiveInstance(result["instance"]);}if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err(`Module.instantiateWasm callback failed with error: ${e}`);readyPromiseReject(e);}}instantiateAsync(wasmBinary,wasmBinaryFile,info,receiveInstantiationResult).catch(readyPromiseReject);return {}}var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module);}};Module["noExitRuntime"]||true;var exceptionCaught=[];var ___cxa_begin_catch=ptr=>{var info=new ExceptionInfo(ptr);if(!info.get_caught()){info.set_caught(true);}info.set_rethrown(false);exceptionCaught.push(info);___cxa_increment_exception_refcount(info.excPtr);return info.get_exception_ptr()};var exceptionLast=0;var ___cxa_end_catch=()=>{_setThrew(0,0);var info=exceptionCaught.pop();___cxa_decrement_exception_refcount(info.excPtr);exceptionLast=0;};function ExceptionInfo(excPtr){this.excPtr=excPtr;this.ptr=excPtr-24;this.set_type=function(type){HEAPU32[this.ptr+4>>2]=type;};this.get_type=function(){return HEAPU32[this.ptr+4>>2]};this.set_destructor=function(destructor){HEAPU32[this.ptr+8>>2]=destructor;};this.get_destructor=function(){return HEAPU32[this.ptr+8>>2]};this.set_caught=function(caught){caught=caught?1:0;HEAP8[this.ptr+12>>0]=caught;};this.get_caught=function(){return HEAP8[this.ptr+12>>0]!=0};this.set_rethrown=function(rethrown){rethrown=rethrown?1:0;HEAP8[this.ptr+13>>0]=rethrown;};this.get_rethrown=function(){return HEAP8[this.ptr+13>>0]!=0};this.init=function(type,destructor){this.set_adjusted_ptr(0);this.set_type(type);this.set_destructor(destructor);};this.set_adjusted_ptr=function(adjustedPtr){HEAPU32[this.ptr+16>>2]=adjustedPtr;};this.get_adjusted_ptr=function(){return HEAPU32[this.ptr+16>>2]};this.get_exception_ptr=function(){var isPointer=___cxa_is_pointer_type(this.get_type());if(isPointer){return HEAPU32[this.excPtr>>2]}var adjusted=this.get_adjusted_ptr();if(adjusted!==0)return adjusted;return this.excPtr};}var ___resumeException=ptr=>{if(!exceptionLast){exceptionLast=ptr;}throw exceptionLast};var findMatchingCatch=args=>{var thrown=exceptionLast;if(!thrown){setTempRet0(0);return 0}var info=new ExceptionInfo(thrown);info.set_adjusted_ptr(thrown);var thrownType=info.get_type();if(!thrownType){setTempRet0(0);return thrown}for(var arg in args){var caughtType=args[arg];if(caughtType===0||caughtType===thrownType){break}var adjusted_ptr_addr=info.ptr+16;if(___cxa_can_catch(caughtType,thrownType,adjusted_ptr_addr)){setTempRet0(caughtType);return thrown}}setTempRet0(thrownType);return thrown};var ___cxa_find_matching_catch_2=()=>findMatchingCatch([]);var ___cxa_find_matching_catch_3=arg0=>findMatchingCatch([arg0]);var ___cxa_find_matching_catch_5=(arg0,arg1,arg2)=>findMatchingCatch([arg0,arg1,arg2]);var ___cxa_get_exception_ptr=ptr=>{var rtn=new ExceptionInfo(ptr).get_exception_ptr();return rtn};var ___cxa_throw=(ptr,type,destructor)=>{var info=new ExceptionInfo(ptr);info.init(type,destructor);exceptionLast=ptr;throw exceptionLast};var _abort=()=>{abort("");};var _emscripten_memcpy_js=(dest,src,num)=>HEAPU8.copyWithin(dest,src,src+num);var getHeapMax=()=>2147483648;var growMemory=size=>{var b=wasmMemory.buffer;var pages=(size-b.byteLength+65535)/65536;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){}};var _emscripten_resize_heap=requestedSize=>{var oldSize=HEAPU8.length;requestedSize>>>=0;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}var alignUp=(x,multiple)=>x+(multiple-x%multiple)%multiple;for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false};var _llvm_eh_typeid_for=type=>type;var wasmTableMirror=[];var wasmTable;var getWasmTableEntry=funcPtr=>{var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr);}return func};var getCFunc=ident=>{var func=Module["_"+ident];return func};var writeArrayToMemory=(array,buffer)=>{HEAP8.set(array,buffer);};var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++;}else if(c<=2047){len+=2;}else if(c>=55296&&c<=57343){len+=4;++i;}else {len+=3;}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023;}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u;}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63;}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;}else {if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;}}heap[outIdx]=0;return outIdx-startIdx};var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);var stringToUTF8OnStack=str=>{var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8(str,ret,size);return ret};var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf8"):undefined;var UTF8ArrayToString=(heapOrArray,idx,maxBytesToRead)=>{var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2;}else {u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63;}if(u0<65536){str+=String.fromCharCode(u0);}else {var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}}return str};var UTF8ToString=(ptr,maxBytesToRead)=>ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):"";var ccall=(ident,returnType,argTypes,args,opts)=>{var toC={"string":str=>{var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=stringToUTF8OnStack(str);}return ret},"array":arr=>{var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string"){return UTF8ToString(ret)}if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i]);}else {cArgs[i]=args[i];}}}var ret=func.apply(null,cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}ret=onDone(ret);return ret};var cwrap=(ident,returnType,argTypes,opts)=>{var numericArgs=!argTypes||argTypes.every(type=>type==="number"||type==="boolean");var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments)}};var wasmImports={__cxa_begin_catch:___cxa_begin_catch,__cxa_end_catch:___cxa_end_catch,__cxa_find_matching_catch_2:___cxa_find_matching_catch_2,__cxa_find_matching_catch_3:___cxa_find_matching_catch_3,__cxa_find_matching_catch_5:___cxa_find_matching_catch_5,__cxa_get_exception_ptr:___cxa_get_exception_ptr,__cxa_throw:___cxa_throw,__resumeException:___resumeException,abort:_abort,emscripten_memcpy_js:_emscripten_memcpy_js,emscripten_resize_heap:_emscripten_resize_heap,invoke_ii:invoke_ii,invoke_iii:invoke_iii,invoke_iiii:invoke_iiii,invoke_iiiii:invoke_iiiii,invoke_v:invoke_v,invoke_vi:invoke_vi,invoke_vii:invoke_vii,invoke_viii:invoke_viii,invoke_viiii:invoke_viiii,invoke_viji:invoke_viji,llvm_eh_typeid_for:_llvm_eh_typeid_for};var wasmExports=createWasm();Module["_rar_alloc_context"]=()=>(Module["_rar_alloc_context"]=wasmExports["rar_alloc_context"])();Module["_rar_free_context"]=a0=>(Module["_rar_free_context"]=wasmExports["rar_free_context"])(a0);Module["_rar_decompress"]=(a0,a1,a2,a3,a4,a5,a6,a7,a8)=>(Module["_rar_decompress"]=wasmExports["rar_decompress"])(a0,a1,a2,a3,a4,a5,a6,a7,a8);Module["_free"]=a0=>(Module["_free"]=wasmExports["free"])(a0);Module["_malloc"]=a0=>(Module["_malloc"]=wasmExports["malloc"])(a0);var _setThrew=(a0,a1)=>(_setThrew=wasmExports["setThrew"])(a0,a1);var setTempRet0=a0=>(setTempRet0=wasmExports["setTempRet0"])(a0);var stackSave=()=>(stackSave=wasmExports["stackSave"])();var stackRestore=a0=>(stackRestore=wasmExports["stackRestore"])(a0);var stackAlloc=a0=>(stackAlloc=wasmExports["stackAlloc"])(a0);var ___cxa_increment_exception_refcount=a0=>(___cxa_increment_exception_refcount=wasmExports["__cxa_increment_exception_refcount"])(a0);var ___cxa_decrement_exception_refcount=a0=>(___cxa_decrement_exception_refcount=wasmExports["__cxa_decrement_exception_refcount"])(a0);var ___cxa_can_catch=(a0,a1,a2)=>(___cxa_can_catch=wasmExports["__cxa_can_catch"])(a0,a1,a2);var ___cxa_is_pointer_type=a0=>(___cxa_is_pointer_type=wasmExports["__cxa_is_pointer_type"])(a0);var dynCall_viji=Module["dynCall_viji"]=(a0,a1,a2,a3,a4)=>(dynCall_viji=Module["dynCall_viji"]=wasmExports["dynCall_viji"])(a0,a1,a2,a3,a4);function invoke_ii(index,a1){var sp=stackSave();try{return getWasmTableEntry(index)(a1)}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vi(index,a1){var sp=stackSave();try{getWasmTableEntry(index)(a1);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iii(index,a1,a2){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2)}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viii(index,a1,a2,a3){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiiii(index,a1,a2,a3,a4){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3,a4)}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_iiii(index,a1,a2,a3){var sp=stackSave();try{return getWasmTableEntry(index)(a1,a2,a3)}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_vii(index,a1,a2){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viiii(index,a1,a2,a3,a4){var sp=stackSave();try{getWasmTableEntry(index)(a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_v(index){var sp=stackSave();try{getWasmTableEntry(index)();}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}function invoke_viji(index,a1,a2,a3,a4){var sp=stackSave();try{dynCall_viji(index,a1,a2,a3,a4);}catch(e){stackRestore(sp);if(e!==e+0)throw e;_setThrew(1,0);}}Module["ccall"]=ccall;Module["cwrap"]=cwrap;var calledRun;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller;};function run(){if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun();}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("");},1);doRun();},1);}else {doRun();}}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()();}}run();


  return moduleArg.ready
}
);
})();

// Auto-generated — do not edit. Run: node build/embed-wasm.js
const wasmBase64 = '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';

// @ts-ignore — emscripten-generated JS, no types
// ─── Embedded WASM decompression ─────────────────────────────────────────────
async function decodeEmbeddedWasm() {
    const compressed = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
    const ds = new DecompressionStream('gzip');
    const decompressedStream = new Blob([compressed]).stream().pipeThrough(ds);
    return await new Response(decompressedStream).arrayBuffer();
}
// ─── WASM module cache ────────────────────────────────────────────────────────
let wasmModule = null;
let wasmLoadPromise = null;
async function loadWasmModule() {
    const wasmBinary = await decodeEmbeddedWasm();
    const instance = await createUnrarModule({ wasmBinary });
    return {
        _instance: instance,
        allocContext: instance.cwrap('rar_alloc_context', 'number', []),
        freeContext: instance.cwrap('rar_free_context', 'void', ['number']),
        decompress: instance.cwrap('rar_decompress', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number']),
        malloc: instance._malloc,
        free: instance._free,
        heap: () => instance.HEAPU8,
    };
}
async function getWasm() {
    if (wasmModule) {
        return wasmModule;
    }
    if (wasmLoadPromise) {
        return wasmLoadPromise;
    }
    wasmLoadPromise = loadWasmModule().then(m => {
        wasmModule = m;
        wasmLoadPromise = null;
        return m;
    });
    return wasmLoadPromise;
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function isStore(rawEntry) {
    return rawEntry.method === 0 || rawEntry.method === 0x30;
}
function copyToWasm(wasm, src) {
    const ptr = wasm.malloc(src.byteLength);
    if (!ptr) {
        throw new Error('WASM malloc failed');
    }
    wasm.heap().set(src, ptr);
    return ptr;
}
async function wasmDecompress(wasm, ctx, compressedBytes, rawEntry, isSolid, isFirst) {
    const inPtr = copyToWasm(wasm, compressedBytes);
    const outPtr = wasm.malloc(rawEntry.uncompressedSize);
    if (!outPtr) {
        wasm.free(inPtr);
        throw new Error('WASM malloc failed for output buffer');
    }
    try {
        const result = wasm.decompress(ctx, rawEntry.unpVer, rawEntry.winSize, inPtr, compressedBytes.byteLength, outPtr, rawEntry.uncompressedSize, isSolid ? 1 : 0, isFirst ? 1 : 0);
        if (result !== 0) {
            throw new Error(`WASM decompression failed (code ${result})`);
        }
        const out = new Uint8Array(rawEntry.uncompressedSize);
        out.set(wasm.heap().subarray(outPtr, outPtr + rawEntry.uncompressedSize));
        return out.buffer;
    }
    finally {
        wasm.free(inPtr);
        wasm.free(outPtr);
    }
}
// ─── Public decompression API ─────────────────────────────────────────────────
async function decompressEntry(reader, rawEntry) {
    if (rawEntry.encrypted) {
        throw new Error(`encrypted entries are not supported: "${rawEntry.name}"`);
    }
    if (rawEntry.isDirectory) {
        return new ArrayBuffer(0);
    }
    const src = await reader.read(rawEntry.dataOffset, rawEntry.compressedSize);
    if (isStore(rawEntry)) {
        return src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
    }
    const wasm = await getWasm();
    const ctx = wasm.allocContext();
    try {
        return await wasmDecompress(wasm, ctx, src, rawEntry, false, true);
    }
    finally {
        wasm.freeContext(ctx);
    }
}
async function decompressSolid(reader, rawEntries) {
    if (rawEntries.length === 0) {
        return [];
    }
    const results = new Array(rawEntries.length).fill(null);
    const needsDecomp = rawEntries.some(e => !e.isDirectory && !isStore(e));
    let wasm = null;
    let ctx = null;
    if (needsDecomp) {
        wasm = await getWasm();
        ctx = wasm.allocContext();
    }
    try {
        let isFirst = true;
        for (let i = 0; i < rawEntries.length; i++) {
            const raw = rawEntries[i];
            if (raw.isDirectory || raw.compressedSize === 0) {
                if (!raw.isDirectory) {
                    results[i] = new Blob([]);
                }
                continue;
            }
            if (raw.encrypted) {
                throw new Error(`encrypted entries are not supported: "${raw.name}"`);
            }
            const src = await reader.read(raw.dataOffset, raw.compressedSize);
            let buf;
            if (isStore(raw)) {
                buf = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
            }
            else {
                buf = await wasmDecompress(wasm, ctx, src, raw, true, isFirst);
                isFirst = false;
            }
            results[i] = new Blob([buf]);
        }
    }
    finally {
        if (ctx !== null) {
            wasm.freeContext(ctx);
        }
    }
    return results;
}
// ─── Module lifecycle ─────────────────────────────────────────────────────────
function cleanup$1() {
    wasmModule = null;
    wasmLoadPromise = null;
}

// ─── RAR4 constants ──────────────────────────────────────────────────────────
const BLOCK4_MARKER = 0x72;
const BLOCK4_ARCHIVE = 0x73;
const BLOCK4_FILE = 0x74;
const BLOCK4_SERVICE = 0x7a;
const BLOCK4_END = 0x7b;
const MHD_VOLUME = 0x0001;
const MHD_SOLID = 0x0008;
const MHD_PASSWORD = 0x0080;
const LHD_PASSWORD = 0x0004;
const LHD_SOLID = 0x0010;
const LHD_WINDOWMASK = 0x00e0;
const LHD_DIRECTORY = 0x00e0;
const LHD_LARGE = 0x0100;
const LHD_UNICODE = 0x0200;
const LONG_BLOCK = 0x8000;
// ─── RAR5 constants ──────────────────────────────────────────────────────────
const HEAD5_MAIN = 0x01;
const HEAD5_FILE = 0x02;
const HEAD5_SERVICE = 0x03;
const HEAD5_CRYPT = 0x04;
const HEAD5_ENDARC = 0x05;
const HFL_EXTRA = 0x0001;
const HFL_DATA = 0x0002;
const HFL_SPLITBEFORE = 0x0008;
const HFL_SPLITAFTER = 0x0010;
const MHFL_VOLUME = 0x0001;
const MHFL_SOLID = 0x0004;
const FHFL_DIRECTORY = 0x0001;
const FHFL_UTIME = 0x0002;
const FHFL_CRC32 = 0x0004;
const FHFL_UNPUNKNOWN = 0x0008;
const FCI_SOLID = 0x0040;
const FCI_METHOD_SHIFT = 7;
const FCI_METHOD_MASK = 0x7;
// ─── Binary reading helpers ───────────────────────────────────────────────────
function u16(data, offset) {
    return (data[offset] | (data[offset + 1] << 8)) >>> 0;
}
function u32(data, offset) {
    return ((data[offset]) +
        (data[offset + 1] * 0x100) +
        (data[offset + 2] * 0x10000) +
        (data[offset + 3] * 0x1000000)) >>> 0;
}
function readVint(data, pos) {
    let value = 0;
    let multiplier = 1;
    let bytesRead = 0;
    for (let i = 0; i < 8; i++) {
        if (pos + i >= data.length) {
            throw new Error('unexpected end reading vint');
        }
        const byte = data[pos + i];
        value += (byte & 0x7F) * multiplier;
        multiplier *= 128;
        bytesRead++;
        if ((byte & 0x80) === 0) {
            break;
        }
    }
    return { value, bytesRead };
}
// ─── Filename decoding ────────────────────────────────────────────────────────
const utf8Decoder = new TextDecoder('utf-8');
function decodeRar4Name(nameBytes, flags) {
    if (!(flags & LHD_UNICODE)) {
        return utf8Decoder.decode(nameBytes);
    }
    let oemLen = 0;
    while (oemLen < nameBytes.length && nameBytes[oemLen] !== 0) {
        oemLen++;
    }
    const oemName = nameBytes.slice(0, oemLen);
    const encData = nameBytes.slice(oemLen + 1);
    if (encData.length === 0) {
        return utf8Decoder.decode(oemName);
    }
    let encPos = 0;
    let decPos = 0;
    const chars = [];
    const highByte = encData[encPos++];
    let flags8 = 0;
    let flagBits = 0;
    while (encPos < encData.length) {
        if (flagBits === 0) {
            flags8 = encData[encPos++];
            flagBits = 8;
        }
        const flag = flags8 >>> 6;
        flags8 = (flags8 << 2) & 0xFF;
        flagBits -= 2;
        switch (flag) {
            case 0:
                if (encPos < encData.length) {
                    chars[decPos++] = encData[encPos++];
                }
                break;
            case 1:
                if (encPos < encData.length) {
                    chars[decPos++] = encData[encPos++] | (highByte << 8);
                }
                break;
            case 2:
                if (encPos + 1 < encData.length) {
                    chars[decPos++] = encData[encPos] | (encData[encPos + 1] << 8);
                    encPos += 2;
                }
                break;
            case 3: {
                if (encPos >= encData.length) {
                    break;
                }
                let length = encData[encPos++];
                if (length & 0x80) {
                    if (encPos >= encData.length) {
                        break;
                    }
                    const correction = encData[encPos++];
                    for (length = (length & 0x7F) + 2; length > 0 && decPos < oemLen; length--, decPos++) {
                        chars[decPos] = ((oemName[decPos] + correction) & 0xFF) | (highByte << 8);
                    }
                }
                else {
                    for (length += 2; length > 0 && decPos < oemLen; length--, decPos++) {
                        chars[decPos] = oemName[decPos];
                    }
                }
                break;
            }
        }
    }
    return String.fromCharCode(...chars);
}
// ─── Date helpers ─────────────────────────────────────────────────────────────
function dosDateTimeToDate(dosDateTime) {
    const time = dosDateTime & 0xFFFF;
    const date = (dosDateTime >>> 16) & 0xFFFF;
    const day = date & 0x1f;
    const month = ((date >>> 5) & 0xf) - 1;
    const year = ((date >>> 9) & 0x7f) + 1980;
    const second = (time & 0x1f) * 2;
    const minute = (time >>> 5) & 0x3f;
    const hour = (time >>> 11) & 0x1f;
    return new Date(year, month, day, hour, minute, second);
}
async function parseRar4(reader, totalLength) {
    let pos = 7;
    let isSolid = false;
    let isVolume = false;
    const rawEntries = [];
    while (pos < totalLength) {
        if (pos + 7 > totalLength) {
            break;
        }
        const minHeader = await reader.read(pos, Math.min(7, totalLength - pos));
        if (minHeader.length < 7) {
            break;
        }
        const headType = minHeader[2];
        const headFlags = u16(minHeader, 3);
        const headSize = u16(minHeader, 5);
        if (headSize < 7) {
            throw new Error(`corrupt RAR4: block header too small (${headSize}) at offset ${pos}`);
        }
        if (pos + headSize > totalLength) {
            throw new Error('corrupt RAR4: block header extends past end of file');
        }
        const header = await reader.read(pos, headSize);
        let blockDataSize = 0;
        switch (headType) {
            case BLOCK4_MARKER:
                break;
            case BLOCK4_ARCHIVE: {
                if (headFlags & MHD_PASSWORD) {
                    throw new Error('encrypted RAR archives are not supported');
                }
                isSolid = (headFlags & MHD_SOLID) !== 0;
                isVolume = (headFlags & MHD_VOLUME) !== 0;
                break;
            }
            case BLOCK4_FILE:
            case BLOCK4_SERVICE: {
                if (headSize < 32) {
                    throw new Error(`corrupt RAR4: file header too small (${headSize})`);
                }
                let packSize = u32(header, 7);
                let unpSize = u32(header, 11);
                const crc32 = u32(header, 16);
                const fileTime = u32(header, 20);
                const unpVer = header[24];
                const method = header[25];
                const nameSize = u16(header, 26);
                const fileAttr = u32(header, 28);
                let nameOffset = 32;
                const isLarge = (headFlags & LHD_LARGE) !== 0;
                if (isLarge) {
                    if (headSize < 40) {
                        throw new Error('corrupt RAR4: LHD_LARGE but header too small');
                    }
                    const highPack = u32(header, 32);
                    const highUnp = u32(header, 36);
                    packSize = packSize + highPack * 0x100000000;
                    unpSize = (unpSize === 0xFFFFFFFF && highUnp === 0xFFFFFFFF)
                        ? -1
                        : unpSize + highUnp * 0x100000000;
                    nameOffset = 40;
                }
                if (headSize < nameOffset + nameSize) {
                    throw new Error('corrupt RAR4: header too small for filename');
                }
                const nameBytes = header.slice(nameOffset, nameOffset + nameSize);
                let name = decodeRar4Name(nameBytes, headFlags).replace(/\\/g, '/');
                const isDir = (headFlags & LHD_WINDOWMASK) === LHD_DIRECTORY ||
                    (unpVer < 20 && (fileAttr & 0x10) !== 0);
                if (isDir && !name.endsWith('/')) {
                    name += '/';
                }
                const encrypted = (headFlags & LHD_PASSWORD) !== 0;
                const isSolidEntry = (headFlags & LHD_SOLID) !== 0 || (isSolid && unpVer < 20);
                if (headType === BLOCK4_FILE) {
                    rawEntries.push({
                        name,
                        nameBytes,
                        uncompressedSize: unpSize,
                        compressedSize: packSize,
                        method,
                        unpVer,
                        winSize: isDir ? 0 : (0x10000 << ((headFlags & LHD_WINDOWMASK) >>> 5)),
                        dataOffset: pos + headSize,
                        isDirectory: isDir,
                        encrypted,
                        isSolid: isSolidEntry,
                        crc32,
                        mtime: dosDateTimeToDate(fileTime),
                        comment: null,
                        commentBytes: null,
                        format: 4,
                    });
                }
                blockDataSize = packSize;
                break;
            }
            case BLOCK4_END:
                pos = totalLength;
                break;
            default:
                if ((headFlags & LONG_BLOCK) && headSize >= 11) {
                    blockDataSize = u32(header, 7);
                }
                break;
        }
        if (headType === BLOCK4_END) {
            break;
        }
        pos += headSize + blockDataSize;
    }
    return { isSolid, isVolume, rawEntries };
}
// ─── RAR5 parser ─────────────────────────────────────────────────────────────
async function parseRar5(reader, totalLength) {
    let pos = 8;
    let isSolid = false;
    let isVolume = false;
    const rawEntries = [];
    while (pos < totalLength) {
        if (pos + 7 > totalLength) {
            break;
        }
        const initial = await reader.read(pos, Math.min(7, totalLength - pos));
        if (initial.length < 7) {
            break;
        }
        let blockSize = 0;
        let vintFactor = 1;
        let vintBytes = 0;
        for (let i = 0; i < 3; i++) {
            const byte = initial[4 + i];
            blockSize += (byte & 0x7F) * vintFactor;
            vintFactor *= 128;
            vintBytes++;
            if ((byte & 0x80) === 0) {
                break;
            }
        }
        if (blockSize === 0) {
            throw new Error('corrupt RAR5: zero block size');
        }
        const totalHeaderSize = 4 + vintBytes + blockSize;
        if (totalHeaderSize > 2 * 1024 * 1024 + 7) {
            throw new Error(`corrupt RAR5: header too large (${totalHeaderSize})`);
        }
        const alreadyRead = Math.min(7 - 4 - vintBytes, blockSize);
        const contentStart = 4 + vintBytes;
        let content;
        if (alreadyRead >= blockSize) {
            content = initial.slice(contentStart, contentStart + blockSize);
        }
        else {
            content = new Uint8Array(blockSize);
            content.set(initial.slice(contentStart, contentStart + alreadyRead));
            const rest = await reader.read(pos + 4 + vintBytes + alreadyRead, blockSize - alreadyRead);
            content.set(rest, alreadyRead);
        }
        let cpos = 0;
        const getV = () => {
            const r = readVint(content, cpos);
            cpos += r.bytesRead;
            return r.value;
        };
        const get4 = () => {
            const v = u32(content, cpos);
            cpos += 4;
            return v;
        };
        const getBytes = (n) => {
            const v = content.slice(cpos, cpos + n);
            cpos += n;
            return v;
        };
        const blockType = getV();
        const blockFlags = getV();
        if (blockFlags & HFL_EXTRA) {
            getV();
        }
        const dataAreaSize = (blockFlags & HFL_DATA) ? getV() : 0;
        const dataOffset = pos + totalHeaderSize;
        switch (blockType) {
            case HEAD5_CRYPT:
                throw new Error('encrypted RAR5 archives are not supported');
            case HEAD5_MAIN: {
                const arcFlags = getV();
                isSolid = (arcFlags & MHFL_SOLID) !== 0;
                isVolume = (arcFlags & MHFL_VOLUME) !== 0;
                break;
            }
            case HEAD5_FILE: {
                const fileFlags = getV();
                const unpSize = getV();
                /* fileAttr = */ getV();
                let mtime = null;
                if (fileFlags & FHFL_UTIME) {
                    mtime = new Date(get4() * 1000);
                }
                let crc32 = 0;
                if (fileFlags & FHFL_CRC32) {
                    crc32 = get4();
                }
                const compInfo = getV();
                const method = (compInfo >>> FCI_METHOD_SHIFT) & FCI_METHOD_MASK;
                const isSolidEntry = (compInfo & FCI_SOLID) !== 0;
                const unpVerRaw = compInfo & 0x3F;
                const unpVer = unpVerRaw === 0 ? 50 : 70;
                /* hostOS = */ getV();
                const nameSize = getV();
                const nameBytes = getBytes(nameSize);
                let name = utf8Decoder.decode(nameBytes).replace(/\\/g, '/');
                const isDir = (fileFlags & FHFL_DIRECTORY) !== 0;
                const unknownSz = (fileFlags & FHFL_UNPUNKNOWN) !== 0;
                if (isDir && !name.endsWith('/')) {
                    name += '/';
                }
                const splitBefore = (blockFlags & HFL_SPLITBEFORE) !== 0;
                const splitAfter = (blockFlags & HFL_SPLITAFTER) !== 0;
                const dictLog = (compInfo >>> 10) & 0x0F;
                const winSize = isDir ? 0 : (0x20000 << dictLog);
                rawEntries.push({
                    name,
                    nameBytes,
                    uncompressedSize: unknownSz ? -1 : unpSize,
                    compressedSize: dataAreaSize,
                    method,
                    unpVer,
                    winSize,
                    dataOffset,
                    isDirectory: isDir,
                    encrypted: false,
                    isSolid: isSolidEntry || isSolid,
                    crc32,
                    mtime: mtime || new Date(0),
                    comment: null,
                    commentBytes: null,
                    format: 5,
                    splitBefore,
                    splitAfter,
                });
                break;
            }
            case HEAD5_SERVICE:
                break;
            case HEAD5_ENDARC:
                pos = totalLength;
                break;
        }
        if (blockType === HEAD5_ENDARC) {
            break;
        }
        pos += totalHeaderSize + dataAreaSize;
    }
    return { isSolid, isVolume, rawEntries };
}
// ─── Format detection ─────────────────────────────────────────────────────────
async function detectFormat(reader) {
    const sig = await reader.read(0, 8);
    if (sig[0] === 0x52 && sig[1] === 0x61 && sig[2] === 0x72 && sig[3] === 0x21 &&
        sig[4] === 0x1A && sig[5] === 0x07 && sig[6] === 0x01 && sig[7] === 0x00) {
        return 5;
    }
    if (sig[0] === 0x52 && sig[1] === 0x61 && sig[2] === 0x72 && sig[3] === 0x21 &&
        sig[4] === 0x1A && sig[5] === 0x07 && sig[6] === 0x00) {
        return 4;
    }
    throw new Error('not a RAR archive (unrecognised signature)');
}
// ─── Rar archive object ───────────────────────────────────────────────────────
class Rar {
    comment = null;
    commentBytes = null;
    #blobs = [];
    _trackBlob(blob) {
        this.#blobs.push(blob);
    }
    dispose() {
        this.#blobs = [];
    }
    [Symbol.dispose]() {
        this.dispose();
    }
}
// ─── RarEntry ─────────────────────────────────────────────────────────────────
class RarEntry {
    name;
    nameBytes;
    size;
    compressedSize;
    comment;
    commentBytes;
    lastModDate;
    isDirectory;
    encrypted;
    #reader;
    #rawEntry;
    #solidBlob;
    constructor(reader, rawEntry, solidBlob) {
        this.#reader = reader;
        this.#rawEntry = rawEntry;
        this.#solidBlob = solidBlob;
        this.name = rawEntry.name;
        this.nameBytes = rawEntry.nameBytes;
        this.size = rawEntry.uncompressedSize;
        this.compressedSize = rawEntry.compressedSize;
        this.comment = rawEntry.comment;
        this.commentBytes = rawEntry.commentBytes;
        this.lastModDate = rawEntry.mtime;
        this.isDirectory = rawEntry.isDirectory;
        this.encrypted = rawEntry.encrypted;
    }
    async arrayBuffer() {
        if (this.#solidBlob) {
            return this.#solidBlob.arrayBuffer();
        }
        return decompressEntry(this.#reader, this.#rawEntry);
    }
    async blob(type = 'application/octet-stream') {
        if (this.#solidBlob) {
            return type === 'application/octet-stream'
                ? this.#solidBlob
                : new Blob([this.#solidBlob], { type });
        }
        const buf = await decompressEntry(this.#reader, this.#rawEntry);
        return new Blob([buf], { type });
    }
    async text() {
        const buf = await this.arrayBuffer();
        return utf8Decoder.decode(new Uint8Array(buf));
    }
    async json() {
        return JSON.parse(await this.text());
    }
}
// ─── Reader factory ───────────────────────────────────────────────────────────
async function makeReader(source) {
    if (typeof Blob !== 'undefined' && source instanceof Blob) {
        return new BlobReader(source);
    }
    if (source instanceof ArrayBuffer) {
        return new ArrayBufferReader(source);
    }
    if (isSharedArrayBuffer(source)) {
        return new ArrayBufferReader(source);
    }
    if (typeof source === 'object' && source !== null && 'buffer' in source) {
        if (isSharedArrayBuffer(source.buffer) || source.buffer instanceof ArrayBuffer) {
            return new ArrayBufferReader(source);
        }
    }
    if (typeof source === 'string') {
        const req = await fetch(source);
        if (!req.ok) {
            throw new Error(`failed http request ${source}, status: ${req.status}: ${req.statusText}`);
        }
        return new BlobReader(await req.blob());
    }
    if (typeof source === 'object' && source !== null &&
        'getLength' in source && typeof source.getLength === 'function' &&
        'read' in source && typeof source.read === 'function') {
        return source;
    }
    throw new Error('unsupported source type');
}
// ─── Public API ───────────────────────────────────────────────────────────────
async function unrarRaw(source) {
    const reader = await makeReader(source);
    const totalLength = await reader.getLength();
    if (totalLength > Number.MAX_SAFE_INTEGER) {
        throw new Error(`file too large (${totalLength} bytes)`);
    }
    const format = await detectFormat(reader);
    const { isSolid, isVolume, rawEntries } = format === 5
        ? await parseRar5(reader, totalLength)
        : await parseRar4(reader, totalLength);
    if (isVolume) {
        throw new Error('multi-volume RAR archives are not supported');
    }
    const rar = new Rar();
    let entries;
    if (isSolid) {
        const blobs = await decompressSolid(reader, rawEntries);
        entries = rawEntries.map((raw, i) => {
            const blob = blobs[i];
            if (blob) {
                rar._trackBlob(blob);
            }
            return new RarEntry(reader, raw, blob);
        });
    }
    else {
        entries = rawEntries.map(raw => new RarEntry(reader, raw, null));
    }
    return { rar, entries };
}
async function unrar(source) {
    const { rar, entries } = await unrarRaw(source);
    return {
        rar,
        entries: Object.fromEntries(entries.map(e => [e.name, e])),
    };
}
function cleanup() {
    cleanup$1();
}

/* global describe, it, before, after */
async function sha256(uint8View) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', uint8View);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
async function checkRarEntriesMatchExpected(entries, expectedFiles) {
    const expected = Object.assign({}, expectedFiles);
    for (const [name, entry] of Object.entries(entries)) {
        const expect = expected[name];
        assert.isOk(expect, name);
        delete expected[name];
        assert.equal(entry.isDirectory, !!expect.isDir, name);
        if (!expect.isDir) {
            if (expect.sha256) {
                const data = await entry.arrayBuffer();
                const sig = await sha256(new Uint8Array(data));
                assert.equal(sig, expect.sha256, name);
            }
            else {
                const data = await entry.text();
                assert.equal(data, expect.content, name);
            }
        }
    }
    assert.deepEqual(expected, {}, 'all content accounted for');
}
describe('unrarit', function () {
    this.timeout(30000);
    after(() => {
        cleanup();
    });
    const longContent = `${new Array(200).fill('compress').join('')}\n`;
    const expectedStuff = {
        'stuff/': { isDir: true },
        'stuff/dog.txt': { content: 'german shepard\n' },
        'stuff/birds/': { isDir: true },
        'stuff/birds/bird.txt': { content: 'parrot\n' },
        'stuff/cat.txt': { content: 'siamese\n' },
        'stuff/json.txt': { content: '{"name":"homer","age":50}' },
        'stuff/long.txt': { content: longContent },
        'stuff/ⓤⓝⓘⓒⓞⓓⓔ-𝖋𝖎𝖑𝖊𝖓𝖆𝖒𝖊-😱.txt': { content: 'Lookma! Unicode 😜' },
    };
    const expectedLarge = {
        'large/': { isDir: true },
        'large/antwerp-central-station.jpg': { sha256: '197246a6bba4570387bee455245a30c95329ed5538eaa2a3fec7df5e2aad53f7' },
        'large/phones-in-museum-in-milan.jpg': { sha256: '6465b0c16c76737bd0f74ab79d9b75fd7558f74364be422a37aec85c8612013c' },
        'large/colosseum.jpg': { sha256: '6081d144babcd0c2d3ea5c49de83811516148301d9afc6a83f5e63c3cd54d00a' },
        'large/chocolate-store-istanbul.jpg': { sha256: '3ee7bc868e1bf1d647598a6e430d636424485f536fb50359e6f82ec24013308c' },
        'large/tokyo-from-skytree.jpg': { sha256: 'd66f4ec1eef9bcf86371fe82f217cdd71e346c3e850b31d3e3c0c2f342af4ad2' },
        'large/LICENSE.txt': { sha256: '95be0160e771271be4015afc340ccf15f4e70e2581c5ca090d0a39be17395ac2' },
        'large/cherry-blossoms-tokyo.jpg': { sha256: '07c398b3acc1edc5ef47bd7c1da2160d66f9c297d2967e30f2009f79b5e6eb0e' },
    };
    it('entries are correct (Uint8Array)', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { entries } = await unrar(new Uint8Array(buf));
        await checkRarEntriesMatchExpected(entries, expectedStuff);
    });
    it('entries are correct (ArrayBuffer)', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { entries } = await unrar(buf);
        await checkRarEntriesMatchExpected(entries, expectedStuff);
    });
    it('entries are correct (Blob)', async () => {
        const req = await fetch('./data/stuff.rar');
        const blob = await req.blob();
        const { entries } = await unrar(blob);
        await checkRarEntriesMatchExpected(entries, expectedStuff);
    });
    it('entries are correct (URL string)', async () => {
        const { entries } = await unrar('./data/stuff.rar');
        await checkRarEntriesMatchExpected(entries, expectedStuff);
    });
    it('entries are correct (HTTPRangeReader)', async () => {
        const reader = new HTTPRangeReader('./data/stuff.rar');
        const { entries } = await unrar(reader);
        await checkRarEntriesMatchExpected(entries, expectedStuff);
    });
    it('entries are correct (HTTPRangeReader) large', async () => {
        const reader = new HTTPRangeReader('./data/large.rar');
        const { entries } = await unrar(reader);
        await checkRarEntriesMatchExpected(entries, expectedLarge);
    });
    it('unrarRaw returns array of entries', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { entries } = await unrarRaw(buf);
        const map = Object.fromEntries(entries.map(e => [e.name, e]));
        await checkRarEntriesMatchExpected(map, expectedStuff);
    });
    it('can get blob', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { entries } = await unrar(buf);
        const blob = await entries['stuff/dog.txt'].blob();
        assert.instanceOf(blob, Blob);
        const text = await blob.text();
        assert.equal(text, 'german shepard\n');
    });
    it('can get json', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { entries } = await unrar(buf);
        const data = await entries['stuff/json.txt'].json();
        assert.deepEqual(data, { name: 'homer', age: 50 });
    });
    it('large rar entries are correct', async () => {
        const { entries } = await unrar('./data/large.rar');
        await checkRarEntriesMatchExpected(entries, expectedLarge);
    });
    it('rar object has dispose method', async () => {
        const req = await fetch('./data/stuff.rar');
        const buf = await req.arrayBuffer();
        const { rar } = await unrar(buf);
        assert.typeOf(rar.dispose, 'function');
        rar.dispose();
    });
});
