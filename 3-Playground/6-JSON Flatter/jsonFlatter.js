/**
 * Based on NinaScholz answer to my question on Stack Overflow:
 * https://stackoverflow.com/questions/75238476/flatten-nested-json-to-array-of-unique-objects-without-indexes
 **/

const input = {
  name: "Benny",
  department: {
    section: "Technical",
    branch: {
      timezone: "UTC",
    },
  },

  company: [
    {
      name: "foo",
      cars: ["kia", "maserati"],
    },
    {
      name: "bar",
      cars: ["mazda", "ford", "bmw"],
    },
    {
      name: "baz",
      cars: [],
    },
    {
      name: "zoe",
      planes: ["fighter", "747"],
    },
  ],
  countries: [{ x: ["USA", "UK"] }],
};

const regex = /\[\s*\]|\{\s*\}/g;
const res = JSON.parse(JSON.stringify(input).replace(regex, `["undefined"]`));
/**Nina - Start */
const getArray = (v) => (Array.isArray(v) ? v : [v]);
const isObject = (v) => v && typeof v === "object";
const getCartesian = (object) =>
  Object.entries(object).reduce(
    (r, [k, v]) =>
      r.flatMap((s) =>
        getArray(v).flatMap((w) =>
          (isObject(w) ? getCartesian(w) : [w]).map((x) => ({ ...s, [k]: x }))
        )
      ),
    [{}]
  );
const getFlat = (o) =>
  Object.entries(o).flatMap(([k, v]) =>
    isObject(v) ? getFlat(v).map(([l, v]) => [`${k}.${l}`, v]) : [[k, v]]
  );
const result = getCartesian(res).map((o) => Object.fromEntries(getFlat(o)));
/**Nina - End */

const template = {
  name: null,
  "department.section": null,
  "department.branch.timezone": null,
  "company.name": null,
  "company.cars": null,
  "company.planes": null,
  "countries.x": null,
};

const finalResult = result.map((obj) => {
  Object.keys(obj).forEach((item) => {
    if (obj[item] === "undefined") {
      obj[item] = null;
    }
  });
  return { ...template, ...obj };
});
console.log(finalResult);
