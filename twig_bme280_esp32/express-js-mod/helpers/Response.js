import Resource from "Resource";
export default class Response {
  headers = [];
  requestStatus = 201;
  body = "";
  data = null;
  position;
  status(status) {
    this.requestStatus = status;
  }
  json(obj) {
    try {
      this.body = JSON.stringify(obj);
      this.headers.push("Content-Type");
      this.headers.push("application/json");
    } catch (err) {
      trace("INVALID JSON DATA");
      throw new Error("INVALID JSON DATA");
    }
  }
  sendResource(resource, contentType) {
    try {
      this.headers.push("Content-Type");
      this.headers.push(contentType);
      this.data = resource;
      this.position = 0;
      this.body = true;
      return {
        headers: [
          "Content-type",
          "text/plain",
          "Content-length",
          this.data.byteLength,
        ],
        body: this.body,
      };
    } catch (err) {
      return {
        status: 404,
        headers: ["Content-type", "text/plain"],
        body: "file not found",
      };
    }
  }
  get hasChunkResponse() {
    return this.data;
  }
  sendChunkResource(value) {
    if (this.position >= this.data.byteLength) return;
    const chunk = this.data.slice(this.position, this.position + value);
    this.position += chunk.byteLength;
    return chunk;
  }
  build() {
    return {
      headers: this.headers,
      status: this.requestStatus,
      body: this.body,
    };
  }
}
