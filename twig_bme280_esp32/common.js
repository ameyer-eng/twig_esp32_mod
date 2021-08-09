import { Request } from "http";

export function fetch(host, path = "/") {
  return new Promise((resolve, reject) => {
    let request = new Request({ host, path, response: String });
    request.callback = function (message, value) {
      if (5 === message) resolve(value);
      else if (message < 0) reject(-1);
    };
  });
}
