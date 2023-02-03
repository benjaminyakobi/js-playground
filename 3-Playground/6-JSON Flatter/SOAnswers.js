/**
 * Best two answers from my question on Stack Overflow:
 * https://stackoverflow.com/questions/75238476/flatten-nested-json-to-array-of-unique-objects-without-indexes
 **/

const input = {
  name: "Benny",
  department: { section: "Technical", branch: { timezone: "UTC" } },
  company: [
    { name: "SAP", customers: ["Ford-1", "Nestle-1"] },
    { name: "SAP", customers: ["Ford-2", "Nestle-2"] },
    { name: "BAZ", customers: ["Maserati", "x"], Somekey: ["2", "3"] },
  ],
};

/** By NinaScholz - Tested + Works just fine*/
function ninaScholzVersion(input) {
  console.log("NinaScholz + Tested + Works just fine");
  const getArray = (v) => (Array.isArray(v) ? v : [v]),
    isObject = (v) => v && typeof v === "object",
    getCartesian = (object) =>
      Object.entries(object).reduce(
        (r, [k, v]) =>
          r.flatMap((s) =>
            getArray(v).flatMap((w) =>
              (isObject(w) ? getCartesian(w) : [w]).map((x) => ({
                ...s,
                [k]: x,
              }))
            )
          ),
        [{}]
      ),
    getFlat = (o) =>
      Object.entries(o).flatMap(([k, v]) =>
        isObject(v) ? getFlat(v).map(([l, v]) => [`${k}.${l}`, v]) : [[k, v]]
      ),
    result = getCartesian(input).map((o) => Object.fromEntries(getFlat(o)));

  console.log(result);
}

/** By AndrewParks - Not fully tested + Not Perfect*/
function andrewParksVersion(input) {
  console.log("AndrewParks - Not fully tested + Not Perfect");
  const flatten = (o, prefix = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      v instanceof Object
        ? flatten(v, `${prefix}${k}.`)
        : [[`${prefix}${k}`, v]]
    );
  const findFork = (o) =>
    Array.isArray(o)
      ? o.length
      : o instanceof Object &&
        Object.values(o)
          .map(findFork)
          .find((i) => i);
  const getFork = (o, i, h = { s: 0 }) =>
    o instanceof Object
      ? Array.isArray(o)
        ? h.s
          ? o
          : (h.s = 1) && o[i]
        : Object.fromEntries(
            Object.entries(o).map(([k, v]) => [k, getFork(v, i, h)])
          )
      : o;
  const recurse = (o, n) =>
    (n = findFork(o))
      ? Array(n)
          .fill(0)
          .map((_, i) => getFork(o, i))
          .flatMap(recurse)
      : o;
  const process = (o) => recurse(o).map((i) => Object.fromEntries(flatten(i)));

  const result = process(input);
  console.log(result);
}
